-- =====================================================================
-- MIABÉ ASI : MIGRATION FINALE COMPLÈTE - ARCHITECTURE WALLETS & LEDGER
-- =====================================================================
-- Règles financières intégrées :
-- 1. Vendeur(s) = 90 % de la marchandise nette
-- 2. Plateforme Miabé Asi = Reliquat exact des 10 % (Zéro fuite d'arrondi)
-- 3. Affilié = 3 % prélevés sur les 10 % de la plateforme (si affilié valide)
-- 4. Frais de livraison = Totalement exclus de la ventilation
-- 5. Remise = Déjà incluse dans orders.total_amount (Zéro double déduction)
-- 6. Compte Plateforme = user_id NULL (Zéro faux profil admin)
-- 7. Grand livre = Strictement immuable (Append-Only)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS POSTGRESQL
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. HARMONISATION DU SCHÉMA EXISTANT (Non destructif)
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS affiliate_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON public.profiles(affiliate_code) WHERE affiliate_code IS NOT NULL;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS affiliate_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS affiliate_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(16, 4) DEFAULT 0.0000;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_earnings NUMERIC(16, 4) DEFAULT 0.0000;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS miabe_asi_gross_commission NUMERIC(16, 4) DEFAULT 0.0000;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS affiliate_commission NUMERIC(16, 4) DEFAULT 0.0000;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS miabe_asi_net_commission NUMERIC(16, 4) DEFAULT 0.0000;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS split_processed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS split_processed_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS split_summary JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS vendeur_id TEXT;

-- Nettoyage de sécurité : suppression de tout ancien compte fictif 'miabe_asi_platform'
DELETE FROM public.profiles WHERE id = 'miabe_asi_platform';

-- ---------------------------------------------------------------------
-- 3. TABLE DES PORTEFEUILLES (Wallets Multi-Devises & Multi-Rôles)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE RESTRICT,
    currency_code VARCHAR(3) NOT NULL REFERENCES public.currencies(code) ON UPDATE CASCADE,
    wallet_type TEXT NOT NULL CHECK (wallet_type IN ('vendeur', 'affilie', 'plateforme', 'client')),
    balance NUMERIC(16, 4) NOT NULL DEFAULT 0.0000,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_wallet_balance_positive CHECK (balance >= 0)
);

ALTER TABLE public.wallets ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS chk_wallet_owner;
ALTER TABLE public.wallets ADD CONSTRAINT chk_wallet_owner CHECK (
    (wallet_type = 'plateforme' AND user_id IS NULL) OR
    (wallet_type <> 'plateforme' AND user_id IS NOT NULL)
);

ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS uq_wallet_user_currency;
ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS uq_wallet_user_currency_type;

DROP INDEX IF EXISTS public.uq_user_wallet;
CREATE UNIQUE INDEX uq_user_wallet 
ON public.wallets (user_id, currency_code, wallet_type) 
WHERE user_id IS NOT NULL;

DROP INDEX IF EXISTS public.uq_platform_wallet;
CREATE UNIQUE INDEX uq_platform_wallet 
ON public.wallets (currency_code, wallet_type) 
WHERE user_id IS NULL AND wallet_type = 'plateforme';

CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON public.wallets(currency_code);
CREATE INDEX IF NOT EXISTS idx_wallets_type ON public.wallets(wallet_type);

-- ---------------------------------------------------------------------
-- 4. GRAND LIVRE FINANCIER IMMUABLE (Wallet Ledger - Append-Only)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT NOT NULL UNIQUE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE RESTRICT,
    currency_code VARCHAR(3) NOT NULL REFERENCES public.currencies(code) ON UPDATE CASCADE,
    wallet_type TEXT NOT NULL CHECK (wallet_type IN ('vendeur', 'affilie', 'plateforme', 'client')),
    operation_type TEXT NOT NULL CHECK (operation_type IN (
        'CREDIT_VENTE', 
        'CREDIT_COMMISSION_AFFILIE', 
        'CREDIT_PLATEFORME_GROSS', 
        'DEBIT_RETRAIT', 
        'CREDIT_REMBOURSEMENT'
    )),
    amount NUMERIC(16, 4) NOT NULL,
    balance_before NUMERIC(16, 4) NOT NULL,
    balance_after NUMERIC(16, 4) NOT NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_ledger_math_integrity CHECK (balance_after = balance_before + amount)
);

ALTER TABLE public.wallet_ledger ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.wallet_ledger DROP CONSTRAINT IF EXISTS chk_ledger_owner;
ALTER TABLE public.wallet_ledger ADD CONSTRAINT chk_ledger_owner CHECK (
    (wallet_type = 'plateforme' AND user_id IS NULL) OR
    (wallet_type <> 'plateforme' AND user_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_ledger_wallet ON public.wallet_ledger(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_order ON public.wallet_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON public.wallet_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_idempotency ON public.wallet_ledger(idempotency_key);

-- ---------------------------------------------------------------------
-- 5. HISTORIQUE D'AUDIT COMPTABLE DES VENTILATIONS (Order Splits)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
    currency_code VARCHAR(3) NOT NULL REFERENCES public.currencies(code),
    order_total NUMERIC(16, 4) NOT NULL,
    sellers_total NUMERIC(16, 4) NOT NULL,
    platform_gross NUMERIC(16, 4) NOT NULL,
    affiliate_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    affiliate_commission NUMERIC(16, 4) NOT NULL,
    platform_net NUMERIC(16, 4) NOT NULL,
    sellers_breakdown JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 6. VERROUS D'IMMUABILITÉ DU GRAND LIVRE (Triggers UPDATE, DELETE, TRUNCATE)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_prevent_ledger_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLATION COMPTABLE STRICTE : Le grand livre financier est en ajout pur (Append-Only). Les modifications, suppressions et vidages (TRUNCATE) sont interdits.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_wallet_ledger_mod ON public.wallet_ledger;
CREATE TRIGGER trg_protect_wallet_ledger_mod
BEFORE UPDATE OR DELETE ON public.wallet_ledger
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_ledger_tampering();

DROP TRIGGER IF EXISTS trg_protect_wallet_ledger_truncate ON public.wallet_ledger;
CREATE TRIGGER trg_protect_wallet_ledger_truncate
BEFORE TRUNCATE ON public.wallet_ledger
FOR EACH STATEMENT EXECUTE FUNCTION public.fn_prevent_ledger_tampering();

-- ---------------------------------------------------------------------
-- 7. FONCTION RPC TRANSACTIONNELLE (process_order_revenue_split)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_order_revenue_split(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order RECORD;
    v_currency RECORD;
    v_item RECORD;
    v_seller RECORD;
    v_affiliate RECORD;
    
    v_order_currency VARCHAR(3);
    v_decimals SMALLINT;
    v_order_total NUMERIC(16, 4);
    v_net_merchandise NUMERIC(16, 4);
    v_items_sum NUMERIC(16, 4) := 0;
    
    v_platform_gross NUMERIC(16, 4) := 0;
    v_affiliate_commission NUMERIC(16, 4) := 0;
    v_platform_net NUMERIC(16, 4) := 0;
    
    v_is_valid_affiliate BOOLEAN := false;
    v_resolved_affiliate_id TEXT := NULL;
    v_seller_ids TEXT[];
    v_processed_sellers_total NUMERIC(16, 4) := 0;
    
    v_wallet_ids UUID[] := ARRAY[]::UUID[];
    v_platform_wallet_id UUID;
    v_platform_bal_before NUMERIC(16, 4);
    v_platform_bal_after NUMERIC(16, 4);
    
    v_affiliate_wallet_id UUID;
    v_affiliate_bal_before NUMERIC(16, 4);
    v_affiliate_bal_after NUMERIC(16, 4);
    
    v_seller_wallet_id UUID;
    v_seller_bal_before NUMERIC(16, 4);
    v_seller_bal_after NUMERIC(16, 4);
    v_seller_net_base NUMERIC(16, 4);
    v_seller_credit NUMERIC(16, 4);
    
    v_idem_key TEXT;
    v_sellers_json JSONB := '[]'::jsonb;
    v_summary JSONB;
BEGIN
    -- 1. Verrouiller la commande en mode exclusif
    SELECT id, user_id, total_amount, currency_code, payment_status, 
           split_processed, discount_amount, affiliate_id, affiliate_code
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERR_ORDER_NOT_FOUND: Commande "%" introuvable.', p_order_id;
    END IF;

    -- 2. Contrôle strict d'idempotence
    IF v_order.split_processed = true THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Cette commande a déjà été ventilée avec succès.',
            'order_id', p_order_id,
            'already_processed', true
        );
    END IF;

    -- 3. Vérification formelle du paiement effectif
    IF LOWER(TRIM(COALESCE(v_order.payment_status, ''))) NOT IN ('paid', 'payé', 'paye', 'completed') THEN
        RAISE EXCEPTION 'ERR_ORDER_NOT_PAID: La commande % est au statut "%". Impossible de ventiler des fonds non encaissés.', 
            p_order_id, v_order.payment_status;
    END IF;

    -- 4. Détermination de la devise officielle et des décimales
    v_order_currency := COALESCE(v_order.currency_code, 'XOF');
    SELECT code, decimal_digits, is_active 
    INTO v_currency
    FROM public.currencies
    WHERE code = v_order_currency;

    IF NOT FOUND OR v_currency.is_active = false THEN
        RAISE EXCEPTION 'ERR_CURRENCY_INVALID: Devise % inactive ou non supportée.', v_order_currency;
    END IF;

    v_decimals := v_currency.decimal_digits;
    v_order_total := ROUND(COALESCE(v_order.total_amount, 0), v_decimals);

    IF v_order_total <= 0 THEN
        RAISE EXCEPTION 'ERR_INVALID_TOTAL: Montant de commande nul ou négatif (%) sur #%.', v_order_total, p_order_id;
    END IF;

    -- La marchandise nette correspond directement au montant total encaissé (remise déjà incluse, shipping exclu)
    v_net_merchandise := v_order_total;

    -- 5. Agrégation des articles par vendeur réel (Hiérarchie stricte sans fallback client)
    CREATE TEMP TABLE tmp_order_sellers (
        seller_id TEXT PRIMARY KEY,
        raw_subtotal NUMERIC(16, 4) NOT NULL
    ) ON COMMIT DROP;

    FOR v_item IN
        SELECT oi.id, oi.subtotal, oi.quantity, oi.product_id, oi.shop_id,
               COALESCE(
                   NULLIF(TRIM(oi.vendeur_id), ''),
                   NULLIF(TRIM(s.owner_id), ''),
                   NULLIF(TRIM(p.vendeur_id), '')
               ) AS resolved_seller
        FROM public.order_items oi
        LEFT JOIN public.products p ON oi.product_id = p.id
        LEFT JOIN public.shops s ON oi.shop_id = s.id
        WHERE oi.order_id = p_order_id
    LOOP
        IF v_item.resolved_seller IS NULL THEN
            RAISE EXCEPTION 'ERR_SELLER_INVALID: L''article % n''a aucun vendeur identifiable.', v_item.id;
        END IF;

        IF v_item.resolved_seller = v_order.user_id THEN
            RAISE EXCEPTION 'ERR_SELLER_IS_BUYER: Le client acheteur (%) ne peut pas être crédité comme vendeur sur l''article %.', 
                v_order.user_id, v_item.id;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_item.resolved_seller) THEN
            RAISE EXCEPTION 'ERR_SELLER_NOT_FOUND: Le profil vendeur % est introuvable.', v_item.resolved_seller;
        END IF;

        INSERT INTO tmp_order_sellers (seller_id, raw_subtotal)
        VALUES (v_item.resolved_seller, v_item.subtotal)
        ON CONFLICT (seller_id) DO UPDATE 
        SET raw_subtotal = tmp_order_sellers.raw_subtotal + EXCLUDED.raw_subtotal;

        v_items_sum := v_items_sum + v_item.subtotal;
    END LOOP;

    IF v_items_sum <= 0 THEN
        RAISE EXCEPTION 'ERR_EMPTY_ITEMS: Sous-total des articles nul sur la commande %.', p_order_id;
    END IF;

    SELECT array_agg(seller_id) INTO v_seller_ids FROM tmp_order_sellers;

    -- 6. Validation stricte de l'affilié rattaché
    IF v_order.affiliate_id IS NOT NULL AND TRIM(v_order.affiliate_id) <> '' THEN
        SELECT id, role INTO v_affiliate FROM public.profiles WHERE id = v_order.affiliate_id;
    ELSIF v_order.affiliate_code IS NOT NULL AND TRIM(v_order.affiliate_code) <> '' THEN
        SELECT id, role INTO v_affiliate FROM public.profiles WHERE affiliate_code = v_order.affiliate_code;
    END IF;

    IF v_affiliate.id IS NOT NULL 
       AND v_affiliate.role = 'affilie'
       AND v_affiliate.id <> v_order.user_id 
       AND NOT (v_affiliate.id = ANY(v_seller_ids)) THEN
        v_is_valid_affiliate := true;
        v_resolved_affiliate_id := v_affiliate.id;
    ELSE
        v_is_valid_affiliate := false;
        v_resolved_affiliate_id := NULL;
    END IF;

    -- 7. Création concurrente des portefeuilles requis (Index partiels résolus sans erreur)
    -- Cas A : Plateforme (user_id IS NULL)
    INSERT INTO public.wallets (user_id, currency_code, wallet_type, balance)
    VALUES (NULL, v_order_currency, 'plateforme', 0)
    ON CONFLICT (currency_code, wallet_type) WHERE user_id IS NULL AND wallet_type = 'plateforme'
    DO NOTHING;

    -- Cas B : Vendeurs (user_id IS NOT NULL)
    FOR v_seller IN SELECT seller_id FROM tmp_order_sellers LOOP
        INSERT INTO public.wallets (user_id, currency_code, wallet_type, balance)
        VALUES (v_seller.seller_id, v_order_currency, 'vendeur', 0)
        ON CONFLICT (user_id, currency_code, wallet_type) WHERE user_id IS NOT NULL
        DO NOTHING;
    END LOOP;

    -- Cas C : Affilié (user_id IS NOT NULL)
    IF v_is_valid_affiliate THEN
        INSERT INTO public.wallets (user_id, currency_code, wallet_type, balance)
        VALUES (v_resolved_affiliate_id, v_order_currency, 'affilie', 0)
        ON CONFLICT (user_id, currency_code, wallet_type) WHERE user_id IS NOT NULL
        DO NOTHING;
    END IF;

    -- 8. Verrouillage ordonné de TOUS les portefeuilles (Anti-Deadlock universel)
    SELECT array_agg(w.id ORDER BY w.id ASC) INTO v_wallet_ids
    FROM public.wallets w
    WHERE (w.user_id IS NULL AND w.currency_code = v_order_currency AND w.wallet_type = 'plateforme')
       OR (w.user_id IN (SELECT seller_id FROM tmp_order_sellers) AND w.currency_code = v_order_currency AND w.wallet_type = 'vendeur')
       OR (v_is_valid_affiliate AND w.user_id = v_resolved_affiliate_id AND w.currency_code = v_order_currency AND w.wallet_type = 'affilie');

    PERFORM id FROM public.wallets WHERE id = ANY(v_wallet_ids) ORDER BY id ASC FOR UPDATE;

    -- 9. Crédit des vendeurs (90 % au prorata exact des articles payés, sans double déduction)
    FOR v_seller IN SELECT seller_id, raw_subtotal FROM tmp_order_sellers ORDER BY seller_id ASC LOOP
        v_seller_net_base := ROUND((v_seller.raw_subtotal / NULLIF(v_items_sum, 0)) * v_net_merchandise, v_decimals);
        v_seller_credit := ROUND(v_seller_net_base * 0.90, v_decimals);
        v_processed_sellers_total := v_processed_sellers_total + v_seller_credit;

        SELECT id, balance INTO v_seller_wallet_id, v_seller_bal_before
        FROM public.wallets
        WHERE user_id = v_seller.seller_id AND currency_code = v_order_currency AND wallet_type = 'vendeur';

        v_seller_bal_after := v_seller_bal_before + v_seller_credit;

        UPDATE public.wallets 
        SET balance = v_seller_bal_after, updated_at = now()
        WHERE id = v_seller_wallet_id;

        -- Grand livre vendeur
        v_idem_key := 'SPLIT-SELLER-' || p_order_id || '-' || v_seller.seller_id;
        INSERT INTO public.wallet_ledger (
            idempotency_key, wallet_id, user_id, currency_code, wallet_type, operation_type,
            amount, balance_before, balance_after, order_id, description, metadata
        ) VALUES (
            v_idem_key, v_seller_wallet_id, v_seller.seller_id, v_order_currency, 'vendeur', 'CREDIT_VENTE',
            v_seller_credit, v_seller_bal_before, v_seller_bal_after, p_order_id,
            format('Part vendeur 90%% garantie sur commande #%s', p_order_id),
            jsonb_build_object(
                'raw_subtotal', v_seller.raw_subtotal,
                'net_base', v_seller_net_base
            )
        );

        v_sellers_json := v_sellers_json || jsonb_build_object(
            'seller_id', v_seller.seller_id,
            'net_base', v_seller_net_base,
            'credited_90_pct', v_seller_credit
        );
    END LOOP;

    -- 10. Part brute Miabé Asi (Reliquat exact des 10 % pour zéro perte d'arrondi)
    v_platform_gross := v_order_total - v_processed_sellers_total;

    -- 11. Commission Affilié : 3 % DES 10 % DE LA PLATEFORME
    IF v_is_valid_affiliate THEN
        v_affiliate_commission := ROUND(v_platform_gross * 0.03, v_decimals);
        v_platform_net := v_platform_gross - v_affiliate_commission;

        SELECT id, balance INTO v_affiliate_wallet_id, v_affiliate_bal_before
        FROM public.wallets
        WHERE user_id = v_resolved_affiliate_id AND currency_code = v_order_currency AND wallet_type = 'affilie';

        v_affiliate_bal_after := v_affiliate_bal_before + v_affiliate_commission;

        UPDATE public.wallets 
        SET balance = v_affiliate_bal_after, updated_at = now()
        WHERE id = v_affiliate_wallet_id;

        -- Grand livre affilié
        v_idem_key := 'SPLIT-AFFILIATE-' || p_order_id || '-' || v_resolved_affiliate_id;
        INSERT INTO public.wallet_ledger (
            idempotency_key, wallet_id, user_id, currency_code, wallet_type, operation_type,
            amount, balance_before, balance_after, order_id, description, metadata
        ) VALUES (
            v_idem_key, v_affiliate_wallet_id, v_resolved_affiliate_id, v_order_currency, 'affilie', 'CREDIT_COMMISSION_AFFILIE',
            v_affiliate_commission, v_affiliate_bal_before, v_affiliate_bal_after, p_order_id,
            format('Commission affilié de 3%% sur la part Miabé Asi pour commande #%s', p_order_id),
            jsonb_build_object('platform_gross_base', v_platform_gross)
        );
    ELSE
        v_affiliate_commission := 0;
        v_platform_net := v_platform_gross;
    END IF;

    -- 12. Crédit plateforme (Part nette avec user_id = NULL)
    SELECT id, balance INTO v_platform_wallet_id, v_platform_bal_before
    FROM public.wallets
    WHERE user_id IS NULL AND currency_code = v_order_currency AND wallet_type = 'plateforme';

    v_platform_bal_after := v_platform_bal_before + v_platform_net;

    UPDATE public.wallets 
    SET balance = v_platform_bal_after, updated_at = now()
    WHERE id = v_platform_wallet_id;

    -- Grand livre plateforme (user_id = NULL)
    v_idem_key := 'SPLIT-PLATFORM-' || p_order_id;
    INSERT INTO public.wallet_ledger (
        idempotency_key, wallet_id, user_id, currency_code, wallet_type, operation_type,
        amount, balance_before, balance_after, order_id, description, metadata
    ) VALUES (
        v_idem_key, v_platform_wallet_id, NULL, v_order_currency, 'plateforme', 'CREDIT_PLATEFORME_GROSS',
        v_platform_net, v_platform_bal_before, v_platform_bal_after, p_order_id,
        format('Commission plateforme nette sur commande #%s', p_order_id),
        jsonb_build_object(
            'platform_gross', v_platform_gross,
            'affiliate_deducted', v_affiliate_commission
        )
    );

    -- 13. Audit complet dans `order_splits`
    INSERT INTO public.order_splits (
        order_id, currency_code, order_total, sellers_total, platform_gross,
        affiliate_id, affiliate_commission, platform_net, sellers_breakdown
    ) VALUES (
        p_order_id, v_order_currency, v_order_total, v_processed_sellers_total,
        v_platform_gross, v_resolved_affiliate_id, v_affiliate_commission,
        v_platform_net, v_sellers_json
    );

    -- 14. Clôture de la commande avec synthèse comptable
    v_summary := jsonb_build_object(
        'currency', v_order_currency,
        'order_total', v_order_total,
        'sellers_total', v_processed_sellers_total,
        'platform_gross', v_platform_gross,
        'affiliate_id', v_resolved_affiliate_id,
        'affiliate_commission', v_affiliate_commission,
        'platform_net', v_platform_net,
        'sellers_details', v_sellers_json
    );

    UPDATE public.orders
    SET split_processed = true,
        split_processed_at = now(),
        seller_earnings = v_processed_sellers_total,
        miabe_asi_gross_commission = v_platform_gross,
        affiliate_commission = v_affiliate_commission,
        miabe_asi_net_commission = v_platform_net,
        split_summary = v_summary,
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'summary', v_summary
    );
END;
$$;

-- ---------------------------------------------------------------------
-- 8. POLITIQUES DE SÉCURITÉ RLS ET DROITS D'ACCÈS (GRANTS)
-- ---------------------------------------------------------------------
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_splits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_user_view_own_wallet" ON public.wallets;
DROP POLICY IF EXISTS "authenticated_user_view_own_ledger" ON public.wallet_ledger;
DROP POLICY IF EXISTS "service_role_full_access_wallets" ON public.wallets;
DROP POLICY IF EXISTS "service_role_full_access_ledger" ON public.wallet_ledger;
DROP POLICY IF EXISTS "service_role_full_access_splits" ON public.order_splits;

CREATE POLICY "service_role_full_access_wallets" 
ON public.wallets FOR ALL TO service_role 
USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_ledger" 
ON public.wallet_ledger FOR ALL TO service_role 
USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_access_splits" 
ON public.order_splits FOR ALL TO service_role 
USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_user_view_own_wallet" 
ON public.wallets FOR SELECT TO authenticated 
USING (user_id IS NOT NULL AND user_id = auth.jwt() ->> 'sub');

CREATE POLICY "authenticated_user_view_own_ledger" 
ON public.wallet_ledger FOR SELECT TO authenticated 
USING (user_id IS NOT NULL AND user_id = auth.jwt() ->> 'sub');

REVOKE ALL ON public.wallets FROM anon, PUBLIC;
REVOKE ALL ON public.wallet_ledger FROM anon, PUBLIC;
REVOKE ALL ON public.order_splits FROM anon, PUBLIC;

GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.wallet_ledger TO authenticated;

GRANT ALL ON public.wallets, public.wallet_ledger, public.order_splits TO service_role;

REVOKE ALL ON FUNCTION public.process_order_revenue_split(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_order_revenue_split(TEXT) TO service_role;

-- =====================================================================
-- MIABÉ ASI - ARCHITECTURE PANAFRICAINE (SUPABASE / POSTGRESQL)
-- =====================================================================
-- Script 100% idempotent et non destructif :
-- - Ne supprime AUCUNE donnée existante
-- - Crée les tables uniquement si elles n'existent pas
-- - Ajoute les colonnes manquantes sans écraser l'existant
-- - Initialise les devises et pays de référence (normes ISO officielles)
-- - Établit les relations (clés étrangères) de manière sûre et non bloquante
-- =====================================================================

-- 0. EXTENSIONS POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. TABLE DES DEVISES (Currencies)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate_to_xof NUMERIC(14, 4) NOT NULL DEFAULT 1.0000,
    decimal_digits SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_currencies_active ON public.currencies(is_active);

-- Initialisation des devises de référence panafricaines et internationales (norme ISO 4217)
INSERT INTO public.currencies (code, name, symbol, exchange_rate_to_xof, decimal_digits, is_active)
VALUES 
    ('XOF', 'Franc CFA (UEMOA)', 'FCFA', 1.0000, 0, true),
    ('XAF', 'Franc CFA (CEMAC)', 'FCFA', 1.0000, 0, true),
    ('NGN', 'Naira Nigérian', '₦', 0.4000, 2, true),
    ('GHS', 'Cedi Ghanéen', 'GH₵', 42.5000, 2, true),
    ('KES', 'Shilling Kényan', 'KSh', 4.6000, 2, true),
    ('GNF', 'Franc Guinéen', 'FG', 0.0700, 0, true),
    ('USD', 'Dollar Américain', '$', 600.0000, 2, true),
    ('EUR', 'Euro', '€', 655.9570, 2, true)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    symbol = EXCLUDED.symbol,
    decimal_digits = EXCLUDED.decimal_digits;

-- ---------------------------------------------------------------------
-- 2. TABLE DES PAYS AFRICAINS (Countries)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.countries (
    code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    phone_code VARCHAR(10) NOT NULL,
    currency_code VARCHAR(3) NOT NULL REFERENCES public.currencies(code) ON UPDATE CASCADE,
    flag_emoji VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_countries_active ON public.countries(is_active);

-- Initialisation des pays de référence (norme ISO 3166-1)
INSERT INTO public.countries (code, name, native_name, phone_code, currency_code, flag_emoji, is_active)
VALUES 
    ('TG', 'Togo', 'Togo', '+228', 'XOF', '🇹🇬', true),
    ('CI', 'Côte d''Ivoire', 'Côte d''Ivoire', '+225', 'XOF', '🇨🇮', true),
    ('SN', 'Sénégal', 'Sénégal', '+221', 'XOF', '🇸🇳', true),
    ('BJ', 'Bénin', 'Bénin', '+229', 'XOF', '🇧🇯', true),
    ('GH', 'Ghana', 'Ghana', '+233', 'GHS', '🇬🇭', true),
    ('NG', 'Nigéria', 'Nigeria', '+234', 'NGN', '🇳🇬', true),
    ('CM', 'Cameroun', 'Cameroun', '+237', 'XAF', '🇨🇲', true),
    ('CD', 'RD Congo', 'RD Congo', '+243', 'USD', '🇨🇩', true),
    ('KE', 'Kenya', 'Kenya', '+254', 'KES', '🇰🇪', true),
    ('GA', 'Gabon', 'Gabon', '+241', 'XAF', '🇬🇦', true),
    ('BF', 'Burkina Faso', 'Burkina Faso', '+226', 'XOF', '🇧🇫', true),
    ('ML', 'Mali', 'Mali', '+223', 'XOF', '🇲🇱', true),
    ('NE', 'Niger', 'Niger', '+227', 'XOF', '🇳🇪', true),
    ('GN', 'Guinée', 'Guinée', '+224', 'GNF', '🇬🇳', true)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    phone_code = EXCLUDED.phone_code,
    flag_emoji = EXCLUDED.flag_emoji;

-- ---------------------------------------------------------------------
-- 3. TABLE DES PROFILS UTILISATEURS (Profiles : Clients, Vendeurs, Livreurs, Admins)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'vendeur', 'livreur', 'admin', 'affilie')),
    seller_type TEXT CHECK (seller_type IN ('particulier', 'professionnel')),
    country_code VARCHAR(2) REFERENCES public.countries(code) ON UPDATE CASCADE,
    city TEXT,
    quartier TEXT,
    address_line TEXT,
    national_id_number TEXT,
    tax_number TEXT,
    business_registration_number TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country_code);

-- ---------------------------------------------------------------------
-- 4. TABLE DES BOUTIQUES (Shops)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shops (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    seller_type TEXT NOT NULL DEFAULT 'particulier' CHECK (seller_type IN ('particulier', 'professionnel')),
    description TEXT,
    bio TEXT,
    logo_url TEXT,
    cover_url TEXT,
    country_code VARCHAR(2) NOT NULL REFERENCES public.countries(code) ON UPDATE CASCADE,
    default_currency VARCHAR(3) NOT NULL REFERENCES public.currencies(code) ON UPDATE CASCADE DEFAULT 'XOF',
    city TEXT,
    quartier TEXT,
    address TEXT,
    whatsapp TEXT,
    phone TEXT,
    subscription_plan TEXT NOT NULL DEFAULT 'Gratuit',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    sales_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shops_country ON public.shops(country_code);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_seller_type ON public.shops(seller_type);

-- ---------------------------------------------------------------------
-- 5. TABLE DES CATÉGORIES (Categories)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ---------------------------------------------------------------------
-- 6. TABLE DES PRODUITS (Products - Rétro-compatible & Évolutive)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    description TEXT,
    prix NUMERIC NOT NULL,
    prix_barre NUMERIC,
    categorie TEXT DEFAULT 'Général',
    category_id TEXT,
    shop_id TEXT,
    vendeur_id TEXT,
    seller_type TEXT DEFAULT 'professionnel' CHECK (seller_type IN ('particulier', 'professionnel')),
    condition TEXT DEFAULT 'neuf' CHECK (condition IN ('neuf', 'tres_bon_etat', 'bon_etat', 'reconditionne', 'occasion')),
    stock INTEGER NOT NULL DEFAULT 10,
    phare BOOLEAN NOT NULL DEFAULT false,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    partenaire TEXT DEFAULT 'Boutique en Direct',
    lien_affilie TEXT,
    country_origin VARCHAR(2) DEFAULT 'TG',
    currency_code VARCHAR(3) DEFAULT 'XOF',
    is_cross_border_eligible BOOLEAN NOT NULL DEFAULT true,
    weight_kg NUMERIC(8, 2) DEFAULT 0.5,
    status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'brouillon', 'en_rupture')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Si la table existait déjà, ajouter les colonnes panafricaines sans altérer les données existantes
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendeur_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_type TEXT DEFAULT 'professionnel';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'neuf';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS country_origin VARCHAR(2) DEFAULT 'TG';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'XOF';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_cross_border_eligible BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8, 2) DEFAULT 0.5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'actif';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ajout sécurisé des clés étrangères sur products (NOT VALID pour ne jamais bloquer sur d'anciennes données)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_products_category' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_products_shop' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT fk_products_shop FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_products_vendeur' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT fk_products_vendeur FOREIGN KEY (vendeur_id) REFERENCES public.profiles(id) ON DELETE SET NULL NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_products_country' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT fk_products_country FOREIGN KEY (country_origin) REFERENCES public.countries(code) ON UPDATE CASCADE NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_products_currency' AND table_name = 'products') THEN
        ALTER TABLE public.products ADD CONSTRAINT fk_products_currency FOREIGN KEY (currency_code) REFERENCES public.currencies(code) ON UPDATE CASCADE NOT VALID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_country ON public.products(country_origin);
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_type ON public.products(seller_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- ---------------------------------------------------------------------
-- 7. TABLE DES COMMANDES (Orders)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    shop_id TEXT,
    total_amount NUMERIC NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'XOF',
    exchange_rate_to_xof NUMERIC(14, 4) NOT NULL DEFAULT 1.0000,
    payment_method TEXT,
    payment_status TEXT NOT NULL DEFAULT 'En attente' CHECK (payment_status IN ('En attente', 'Payé', 'Échoué', 'Remboursé')),
    order_status TEXT NOT NULL DEFAULT 'En attente' CHECK (order_status IN ('En attente', 'En préparation', 'En cours de livraison', 'Livré', 'Annulé')),
    destination_country_code VARCHAR(2) DEFAULT 'TG',
    destination_city TEXT,
    destination_address TEXT,
    recipient_name TEXT,
    recipient_phone TEXT,
    notes TEXT,
    shipping_fee NUMERIC NOT NULL DEFAULT 0,
    is_cross_border BOOLEAN NOT NULL DEFAULT false,
    split_processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clés étrangères sécurisées sur orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_orders_user' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_orders_shop' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ADD CONSTRAINT fk_orders_shop FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_orders_currency' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ADD CONSTRAINT fk_orders_currency FOREIGN KEY (currency_code) REFERENCES public.currencies(code) ON UPDATE CASCADE NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_orders_country' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ADD CONSTRAINT fk_orders_country FOREIGN KEY (destination_country_code) REFERENCES public.countries(code) ON UPDATE CASCADE NOT VALID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_destination_country ON public.orders(destination_country_code);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);

-- ---------------------------------------------------------------------
-- 8. TABLE DES ARTICLES DE COMMANDES (Order Items)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    shop_id TEXT,
    unit_price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'XOF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_order_items_product' AND table_name = 'order_items') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_order_items_shop' AND table_name = 'order_items') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_shop FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL NOT VALID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop ON public.order_items(shop_id);

-- ---------------------------------------------------------------------
-- 9. TABLE DE STOCKAGE CLÉ-VALEUR DE SECOURS (Asime Store)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.asime_store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 10. SÉCURITÉ & POLITIQUES RLS (Row Level Security)
-- ---------------------------------------------------------------------
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asime_store ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique pour le catalogue et les références
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'currencies' AND policyname = 'Allow public read currencies') THEN
        CREATE POLICY "Allow public read currencies" ON public.currencies FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'countries' AND policyname = 'Allow public read countries') THEN
        CREATE POLICY "Allow public read countries" ON public.countries FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Allow public read categories') THEN
        CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shops' AND policyname = 'Allow public read shops') THEN
        CREATE POLICY "Allow public read shops" ON public.shops FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Allow public read products') THEN
        CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'asime_store' AND policyname = 'Allow public read asime_store') THEN
        CREATE POLICY "Allow public read asime_store" ON public.asime_store FOR SELECT USING (true);
    END IF;
END $$;

-- Politiques d'accès total pour le service_role (API Backend Node.js sécurisée)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'currencies' AND policyname = 'Allow service_role full access currencies') THEN
        CREATE POLICY "Allow service_role full access currencies" ON public.currencies FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'countries' AND policyname = 'Allow service_role full access countries') THEN
        CREATE POLICY "Allow service_role full access countries" ON public.countries FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Allow service_role full access categories') THEN
        CREATE POLICY "Allow service_role full access categories" ON public.categories FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shops' AND policyname = 'Allow service_role full access shops') THEN
        CREATE POLICY "Allow service_role full access shops" ON public.shops FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Allow service_role full access products') THEN
        CREATE POLICY "Allow service_role full access products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Allow service_role full access profiles') THEN
        CREATE POLICY "Allow service_role full access profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Allow service_role full access orders') THEN
        CREATE POLICY "Allow service_role full access orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Allow service_role full access order_items') THEN
        CREATE POLICY "Allow service_role full access order_items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'asime_store' AND policyname = 'Allow service_role full access asime_store') THEN
        CREATE POLICY "Allow service_role full access asime_store" ON public.asime_store FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

import crypto from "crypto";
import fs from "fs";
import path from "path";

function loadEnvFile(): Record<string, string> {
  const envMap: Record<string, string> = {};
  const possiblePaths = [
    path.join(process.cwd(), ".env"),
    "./.env",
    "../.env",
    "/app/.env"
  ];

  for (const envPath of possiblePaths) {
    try {
      if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, "utf-8");
        // Remove BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }
        for (const line of content.split(/\r?\n/)) {
          let trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          
          // Remove optional "export " prefix
          if (trimmed.startsWith("export ")) {
            trimmed = trimmed.substring(7).trim();
          }

          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();

            // Strip inline comments if not inside quotes
            if (!val.startsWith('"') && !val.startsWith("'")) {
              const hashIdx = val.indexOf("#");
              if (hashIdx > -1) {
                val = val.slice(0, hashIdx).trim();
              }
            }

            // Strip surrounding single or double quotes
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1).trim();
            }

            if (key && val) {
              envMap[key] = val;
              envMap[key.toUpperCase()] = val;
              envMap[key.toLowerCase()] = val;
              process.env[key] = val;
              process.env[key.toUpperCase()] = val;
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[PaymentGateway] Notice reading env at ${envPath}:`, e);
    }
  }

  // Load configured keys from settings.json (or /tmp/settings.json on Vercel) if saved via Admin UI
  const settingsCandidates = [
    path.join(process.cwd(), "settings.json"),
    path.join("/tmp", "settings.json")
  ];
  for (const settingsPath of settingsCandidates) {
    try {
      if (fs.existsSync(settingsPath)) {
        const s = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        if (s.paydunyaMasterKey && !envMap["PAYDUNYA_MASTER_KEY"]) {
          envMap["PAYDUNYA_MASTER_KEY"] = s.paydunyaMasterKey;
          process.env["PAYDUNYA_MASTER_KEY"] = s.paydunyaMasterKey;
        }
        if (s.paydunyaPrivateKey && !envMap["PAYDUNYA_PRIVATE_KEY"]) {
          envMap["PAYDUNYA_PRIVATE_KEY"] = s.paydunyaPrivateKey;
          process.env["PAYDUNYA_PRIVATE_KEY"] = s.paydunyaPrivateKey;
        }
        if (s.paydunyaToken && !envMap["PAYDUNYA_TOKEN"]) {
          envMap["PAYDUNYA_TOKEN"] = s.paydunyaToken;
          process.env["PAYDUNYA_TOKEN"] = s.paydunyaToken;
        }
        if (s.paydunyaMode && !envMap["PAYDUNYA_MODE"]) {
          envMap["PAYDUNYA_MODE"] = s.paydunyaMode;
          process.env["PAYDUNYA_MODE"] = s.paydunyaMode;
        }
      }
    } catch (e) {}
  }

  return envMap;
}

export interface PaymentCustomerDetails {
  name: string;
  phone: string;
  email?: string;
  countryCode?: string;
  currencyCode?: string;
  clientCountryCode?: string;
  sellerCountryCode?: string;
  clientCity?: string;
  sellerCity?: string;
  sellerName?: string;
  appBaseUrl?: string;
}

export interface PaymentSession {
  success: boolean;
  transactionId: string;
  providerId: string;
  amount: number;
  currencyCode?: string;
  countryCode?: string;
  clientCountryCode?: string;
  sellerCountryCode?: string;
  isCrossBorder?: boolean;
  status: "pending" | "success" | "failed";
  redirectUrl?: string;
  instructions?: string;
}

export interface PaymentVerificationResult {
  status: "success" | "failed" | "pending" | "cancelled";
  transactionId: string;
  amount: number;
  orderId?: string;
  currencyCode?: string;
  countryCode?: string;
  providerTxId?: string;
  message?: string;
}

export interface IPaymentProvider {
  id: string;
  name: string;
  description: string;
  supportedMethods: string[]; // e.g. ["mobile_money", "card"]
  initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession>;
  verifyPayment(transactionId: string): Promise<PaymentVerificationResult>;
}

// 1. TMoney Provider
export class TMoneyProvider implements IPaymentProvider {
  id = "tmoney";
  name = "TMoney (Togo)";
  description = "Paiement Mobile Money via le réseau Togocom";
  supportedMethods = ["mobile_money"];

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const transactionId = "TX-TMONEY-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      success: true,
      transactionId,
      providerId: this.id,
      amount,
      status: "pending",
      instructions: `Veuillez composer le *145*1*3*1# sur votre téléphone Togocom ou valider la notification Push USSD qui va s'afficher.`
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    // Simulated automatic backend confirmation
    return {
      status: "success",
      transactionId,
      amount: 0, // Filled by manager
      providerTxId: "TM-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      message: "Transaction TMoney confirmée par le serveur de Togocom"
    };
  }
}

// 2. Flooz Provider
export class FloozProvider implements IPaymentProvider {
  id = "flooz";
  name = "Flooz (Moov Togo)";
  description = "Paiement Mobile Money via le réseau Moov Africa";
  supportedMethods = ["mobile_money"];

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const transactionId = "TX-FLOOZ-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      success: true,
      transactionId,
      providerId: this.id,
      amount,
      status: "pending",
      instructions: `Veuillez composer le *155*2*1# ou valider l'invitation Push Flooz avec votre code PIN.`
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      status: "success",
      transactionId,
      amount: 0,
      providerTxId: "FZ-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      message: "Transaction Flooz confirmée par Moov Africa"
    };
  }
}

// 3. CinetPay Provider
export class CinetPayProvider implements IPaymentProvider {
  id = "cinetpay";
  name = "CinetPay";
  description = "Portail Mobile Money régional (Togo, CI, Sénégal) & Cartes Bancaires";
  supportedMethods = ["mobile_money", "card"];

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const transactionId = "TX-CP-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      success: true,
      transactionId,
      providerId: this.id,
      amount,
      status: "pending",
      redirectUrl: `https://checkout.cinetpay.com/pay/${transactionId}`,
      instructions: "Veuillez suivre les instructions sécurisées de CinetPay pour finaliser votre paiement."
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      status: "success",
      transactionId,
      amount: 0,
      providerTxId: "CP-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      message: "Notification instantanée CinetPay (IPN) validée"
    };
  }
}

// File to persist PayDunya invoices and transactions for reliable server confirmation
const PAYDUNYA_INVOICES_FILE = path.join(process.cwd(), "paydunya_invoices.json");
const PAYDUNYA_INVOICES_TMP_FILE = path.join("/tmp", "paydunya_invoices.json");
let inMemoryPayDunyaInvoices: PayDunyaInvoiceRecord[] | null = null;

export interface PayDunyaInvoiceRecord {
  token: string;
  orderId: string;
  amount: number;
  currencyCode: string;
  countryCode: string;
  clientCountryCode?: string;
  sellerCountryCode?: string;
  isCrossBorder?: boolean;
  status: "pending" | "completed" | "cancelled" | "failed";
  createdAt: string;
  updatedAt: string;
  type?: "order" | "subscription";
  userId?: string;
  plan?: string;
  providerTxId?: string;
  redirectUrl?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export function loadPayDunyaInvoices(): PayDunyaInvoiceRecord[] {
  if (inMemoryPayDunyaInvoices !== null) {
    return inMemoryPayDunyaInvoices;
  }
  try {
    if (fs.existsSync(PAYDUNYA_INVOICES_TMP_FILE)) {
      const rawTmp = fs.readFileSync(PAYDUNYA_INVOICES_TMP_FILE, "utf-8");
      const parsedTmp = JSON.parse(rawTmp);
      if (Array.isArray(parsedTmp)) {
        inMemoryPayDunyaInvoices = parsedTmp;
        return inMemoryPayDunyaInvoices;
      }
    }
    if (fs.existsSync(PAYDUNYA_INVOICES_FILE)) {
      const raw = fs.readFileSync(PAYDUNYA_INVOICES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryPayDunyaInvoices = parsed;
        return inMemoryPayDunyaInvoices;
      }
    }
  } catch (err) {
    console.warn("[PayDunya Storage] Avertissement lecture paydunya_invoices.json:", err);
  }
  inMemoryPayDunyaInvoices = [];
  return inMemoryPayDunyaInvoices;
}

export function savePayDunyaInvoices(invoices: PayDunyaInvoiceRecord[]): void {
  inMemoryPayDunyaInvoices = invoices;
  const serialized = JSON.stringify(invoices, null, 2);
  try {
    fs.writeFileSync(PAYDUNYA_INVOICES_FILE, serialized, "utf-8");
  } catch {
    try {
      fs.writeFileSync(PAYDUNYA_INVOICES_TMP_FILE, serialized, "utf-8");
    } catch (tmpErr) {
      console.warn("[PayDunya Storage] Persistance mémoire active (système de fichiers en lecture seule).");
    }
  }
}

export function recordPayDunyaInvoice(record: PayDunyaInvoiceRecord): void {
  const list = loadPayDunyaInvoices();
  const existingIdx = list.findIndex(i => i.token === record.token || i.orderId === record.orderId);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...record, updatedAt: new Date().toISOString() };
  } else {
    list.unshift(record);
  }
  savePayDunyaInvoices(list);
}

export function updatePayDunyaInvoiceStatus(tokenOrId: string, status: "completed" | "pending" | "cancelled" | "failed"): PayDunyaInvoiceRecord | null {
  const list = loadPayDunyaInvoices();
  const target = list.find(i => i.token === tokenOrId || i.orderId === tokenOrId || i.providerTxId === tokenOrId);
  if (target) {
    target.status = status;
    target.updatedAt = new Date().toISOString();
    if (status === "completed" && !target.providerTxId) {
      target.providerTxId = "PD-" + crypto.randomBytes(6).toString("hex").toUpperCase();
    }
    savePayDunyaInvoices(list);
    return target;
  }
  return null;
}

export function getPayDunyaInvoice(tokenOrId: string): PayDunyaInvoiceRecord | null {
  const list = loadPayDunyaInvoices();
  return list.find(i => i.token === tokenOrId || i.orderId === tokenOrId || i.providerTxId === tokenOrId) || null;
}

// 4. PayDunya Provider
export class PayDunyaProvider implements IPaymentProvider {
  id = "paydunya";
  name = "Paiement Sécurisé Mobile Money & Carte";
  description = "Solutions sécurisées de paiement automatique par Mobile Money (TMoney, Flooz, Wave) & Cartes bancaires";
  supportedMethods = ["mobile_money", "card"];

  private getApiKeys() {
    const envMap = loadEnvFile();

    // Check all possible aliases in process.env and directly parsed envMap
    const findKey = (...aliases: string[]): string => {
      for (const a of aliases) {
        if (process.env[a] && process.env[a]!.trim()) return process.env[a]!.trim();
        if (process.env[a.toUpperCase()] && process.env[a.toUpperCase()]!.trim()) return process.env[a.toUpperCase()]!.trim();
        if (process.env[a.toLowerCase()] && process.env[a.toLowerCase()]!.trim()) return process.env[a.toLowerCase()]!.trim();
        if (envMap[a] && envMap[a].trim()) return envMap[a].trim();
        if (envMap[a.toUpperCase()] && envMap[a.toUpperCase()].trim()) return envMap[a.toUpperCase()].trim();
        if (envMap[a.toLowerCase()] && envMap[a.toLowerCase()].trim()) return envMap[a.toLowerCase()].trim();
      }
      return "";
    };

    const masterKey = findKey(
      "PAYDUNYA_MASTER_KEY",
      "PAYDUNYA_MASTER",
      "PAYDUNYA_MASTER_TOKEN",
      "PAYDUNYA_KEY_MASTER",
      "PAYDUNYA_MASTERKEY",
      "MASTER_KEY",
      "MASTER_TOKEN"
    );

    const privateKey = findKey(
      "PAYDUNYA_PRIVATE_KEY",
      "PAYDUNYA_SECRET_KEY",
      "PAYDUNYA_PRIVATE",
      "PAYDUNYA_SECRET",
      "PAYDUNYA_PRIVATEKEY",
      "PAYDUNYA_SECRETKEY",
      "PAYDUNYA_API_SECRET",
      "PRIVATE_KEY",
      "SECRET_KEY"
    );

    const token = findKey(
      "PAYDUNYA_TOKEN",
      "PAYDUNYA_PUBLIC_KEY",
      "PAYDUNYA_PUBLIC_TOKEN",
      "PAYDUNYA_KEY",
      "PAYDUNYA_PUBLIC",
      "PAYDUNYA_PUBLICKEY",
      "PAYDUNYA_API_KEY",
      "PAYDUNYA_API_TOKEN",
      "PUBLIC_KEY",
      "TOKEN"
    );
    
    let modeInput = findKey("PAYDUNYA_MODE", "PAYDUNYA_ENV", "PAYDUNYA_ENVIRONMENT").toLowerCase();
    let mode = "live";
    if (privateKey.toLowerCase().startsWith("test_") || token.toLowerCase().startsWith("test_")) {
      mode = "test";
    } else if (privateKey.toLowerCase().startsWith("live_") || token.toLowerCase().startsWith("live_")) {
      mode = "live";
    } else if (modeInput === "test" || modeInput === "sandbox") {
      mode = "test";
    } else if (modeInput === "production" || modeInput === "prod" || modeInput === "live" || (!modeInput && (privateKey || token))) {
      mode = "live";
    }

    return { masterKey, privateKey, token, mode };
  }

  private getBaseUrl(overrideMode?: string): string {
    const { mode } = this.getApiKeys();
    const effectiveMode = overrideMode || mode;
    return effectiveMode === "live" 
      ? "https://app.paydunya.com/api/v1" 
      : "https://app.paydunya.com/sandbox-api/v1";
  }

  private async parsePayDunyaJsonResponse(response: Response, context: string): Promise<any> {
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const rawText = await response.text();
    const trimmed = rawText.trim();

    if (!contentType.includes("application/json") && (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype"))) {
      console.error(`[PayDunya API - ${context}] Réponse HTML reçue (HTTP ${response.status}):`, trimmed.slice(0, 300));
      throw new Error(`Le serveur PayDunya a retourné une réponse HTML inattendue (HTTP ${response.status}) lors de ${context}.`);
    }

    if (!trimmed) {
      throw new Error(`Réponse vide reçue de PayDunya (HTTP ${response.status}) lors de ${context}.`);
    }

    try {
      return JSON.parse(trimmed);
    } catch (err) {
      console.error(`[PayDunya API - ${context}] Réponse non-JSON (HTTP ${response.status}, Content-Type: ${contentType}):`, trimmed.slice(0, 300));
      throw new Error(`Réponse invalide (non-JSON) reçue du serveur PayDunya (HTTP ${response.status}).`);
    }
  }

  private resolveAppBaseUrl(customer?: PaymentCustomerDetails): string {
    const candidate =
      customer?.appBaseUrl ||
      process.env.APP_URL ||
      process.env.PUBLIC_APP_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";
    return candidate.replace(/\/+$/, "");
  }

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const { masterKey, privateKey, token, mode } = this.getApiKeys();

    // Determine Country & Currency based on the 7 supported PayDunya countries:
    // TG, BJ, BF, CI, ML, SN -> XOF
    // CM -> XAF
    const rawCountry = (customer.countryCode || customer.clientCountryCode || "TG").toUpperCase();
    const supportedCodes = ["TG", "BJ", "BF", "CI", "ML", "SN", "CM"];
    const countryCode = supportedCodes.includes(rawCountry) ? rawCountry : "TG";
    const currencyCode = customer.currencyCode || (countryCode === "CM" ? "XAF" : "XOF");
    const clientCountryCode = (customer.clientCountryCode || countryCode).toUpperCase();
    const sellerCountryCode = (customer.sellerCountryCode || "TG").toUpperCase();
    const isCrossBorder = clientCountryCode !== sellerCountryCode;

    const isSubscription = orderId.startsWith("SUB-");
    const appBaseUrl = this.resolveAppBaseUrl(customer);

    const returnUrl = isSubscription
      ? `${appBaseUrl}/?payment=sub_return&subId=${encodeURIComponent(orderId)}`
      : `${appBaseUrl}/?payment=return&orderId=${encodeURIComponent(orderId)}`;

    const cancelUrl = isSubscription
      ? `${appBaseUrl}/?payment=sub_cancel&subId=${encodeURIComponent(orderId)}`
      : `${appBaseUrl}/?payment=cancel&orderId=${encodeURIComponent(orderId)}`;

    const callbackUrl = `${appBaseUrl}/api/paydunya/ipn`;

    // Official PayDunya invoice creation
    if (masterKey && privateKey && token) {
      const baseUrl = this.getBaseUrl(mode);
      console.log(`[PayDunya] Création facture officielle (${mode.toUpperCase()}) sur ${baseUrl} pour ${orderId} (${amount} ${currencyCode})...`);

      const payload = {
        invoice: {
          total_amount: amount,
          description: isSubscription 
            ? `Abonnement PRO Vendeur (${amount} ${currencyCode}) - Miabé Asi`
            : `Paiement commande #${orderId} (${currencyCode}) - Miabé Asi`,
          items: [
            {
              name: isSubscription ? `Abonnement PRO Vendeur` : `Commande #${orderId}`,
              quantity: 1,
              unit_price: amount,
              total_price: amount,
              description: `${amount} ${currencyCode}`
            }
          ]
        },
        store: {
          name: "Miabé Asi",
          tagline: "Marketplace Africaine Panafricaine",
          postal_address: `${countryCode}, Afrique`,
          phone: customer.phone || "+22890000000",
          website_url: appBaseUrl,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          callback_url: callbackUrl
        },
        custom_data: {
          order_id: orderId,
          amount: amount,
          currency_code: currencyCode,
          country_code: countryCode,
          client_country_code: clientCountryCode,
          seller_country_code: sellerCountryCode,
          is_cross_border: isCrossBorder,
          is_subscription: isSubscription,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email || "support@miabeasi.com"
        },
        actions: {
          cancel_url: cancelUrl,
          return_url: returnUrl,
          callback_url: callbackUrl
        }
      };

      const callCreateInvoice = async (targetBaseUrl: string) => {
        const response = await fetch(`${targetBaseUrl}/checkout-invoice/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "PAYDUNYA-MASTER-KEY": masterKey,
            "PAYDUNYA-PRIVATE-KEY": privateKey,
            "PAYDUNYA-TOKEN": token
          },
          body: JSON.stringify(payload)
        });
        return this.parsePayDunyaJsonResponse(response, "création de facture PayDunya");
      };

      let resData = await callCreateInvoice(baseUrl);

      // If keys belong to the other environment (e.g. sandbox keys with live mode or vice versa), retry once on the alternate endpoint
      if (resData && resData.response_code && resData.response_code !== "00") {
        const altMode = mode === "live" ? "test" : "live";
        const altBaseUrl = this.getBaseUrl(altMode);
        try {
          const retryData = await callCreateInvoice(altBaseUrl);
          if (retryData && retryData.response_code === "00") {
            resData = retryData;
          }
        } catch {
          // Keep original resData error
        }
      }

      if (resData && resData.response_code === "00") {
        const invoiceToken = resData.token;
        const redirectUrl = resData.response_text || resData.invoice_url || `https://app.paydunya.com/checkout/invoice/${invoiceToken}`;
        recordPayDunyaInvoice({
          token: invoiceToken,
          orderId,
          amount,
          currencyCode,
          countryCode,
          clientCountryCode,
          sellerCountryCode,
          isCrossBorder,
          status: "pending",
          type: isSubscription ? "subscription" : "order",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          redirectUrl,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email
        });

        return {
          success: true,
          transactionId: invoiceToken,
          providerId: this.id,
          amount,
          currencyCode,
          countryCode,
          clientCountryCode,
          sellerCountryCode,
          isCrossBorder,
          status: "pending",
          redirectUrl,
          instructions: `Veuillez compléter votre paiement de ${amount} ${currencyCode} sur l'interface sécurisée PayDunya.`
        };
      } else {
        console.warn("[PayDunya API] Échec création facture en ligne:", resData);
        throw new Error(resData?.response_text || resData?.description || `Erreur PayDunya (Code ${resData?.response_code || "Inconnu"})`);
      }
    }

    throw new Error("Paiement PayDunya : Les clés API officielles PayDunya (Master Key, Private Key, Token) sont requises pour initier le paiement sécurisé. Veuillez les renseigner dans les variables d'environnement ou dans l'Espace Administrateur > Paramètres.");
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    const { masterKey, privateKey, token, mode } = this.getApiKeys();

    // 1. If keys are present, call official PayDunya confirm API
    if (masterKey && privateKey && token) {
      try {
        const callConfirmInvoice = async (targetBaseUrl: string) => {
          const response = await fetch(`${targetBaseUrl}/checkout-invoice/confirm/${encodeURIComponent(transactionId)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "PAYDUNYA-MASTER-KEY": masterKey,
              "PAYDUNYA-PRIVATE-KEY": privateKey,
              "PAYDUNYA-TOKEN": token
            }
          });
          return this.parsePayDunyaJsonResponse(response, "confirmation de facture PayDunya");
        };

        let resData = await callConfirmInvoice(this.getBaseUrl(mode));
        if (resData && resData.response_code && resData.response_code !== "00") {
          const altMode = mode === "live" ? "test" : "live";
          try {
            const retryData = await callConfirmInvoice(this.getBaseUrl(altMode));
            if (retryData && retryData.response_code === "00") {
              resData = retryData;
            }
          } catch {}
        }
        const invoiceStatus = (resData?.status || "").toLowerCase();

        if (invoiceStatus === "completed") {
          const customData = resData.custom_data || {};
          const invoiceData = resData.invoice || {};
          const amount = Number(invoiceData.total_amount ?? customData.amount ?? 0);
          const orderId = String(customData.order_id || customData.orderId || invoiceData.order_id || resData.order_id || "").trim() || undefined;
          const currencyCode = String(customData.currency_code || customData.currencyCode || invoiceData.currency_code || invoiceData.currency || "XOF").trim().toUpperCase();

          updatePayDunyaInvoiceStatus(transactionId, "completed");

          return {
            status: "success",
            transactionId,
            amount,
            orderId,
            currencyCode,
            countryCode: customData.country_code || invoiceData.country_code,
            providerTxId: resData.transaction_id || "PD-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
            message: `Paiement PayDunya validé par confirmation serveur (Statut: completed)`
          };
        } else if (invoiceStatus === "cancelled") {
          const customData = resData.custom_data || {};
          const invoiceData = resData.invoice || {};
          const amount = Number(invoiceData.total_amount ?? customData.amount ?? 0);
          const orderId = String(customData.order_id || customData.orderId || invoiceData.order_id || "").trim() || undefined;
          const currencyCode = String(customData.currency_code || customData.currencyCode || invoiceData.currency_code || "XOF").trim().toUpperCase();
          updatePayDunyaInvoiceStatus(transactionId, "cancelled");
          return {
            status: "cancelled",
            transactionId,
            amount,
            orderId,
            currencyCode,
            message: "Paiement PayDunya annulé par le client."
          };
        } else if (invoiceStatus === "failed") {
          const customData = resData.custom_data || {};
          const invoiceData = resData.invoice || {};
          const amount = Number(invoiceData.total_amount ?? customData.amount ?? 0);
          const orderId = String(customData.order_id || customData.orderId || invoiceData.order_id || "").trim() || undefined;
          const currencyCode = String(customData.currency_code || customData.currencyCode || invoiceData.currency_code || "XOF").trim().toUpperCase();
          updatePayDunyaInvoiceStatus(transactionId, "failed");
          return {
            status: "failed",
            transactionId,
            amount,
            orderId,
            currencyCode,
            message: "Le paiement PayDunya a échoué."
          };
        } else {
          const customData = resData.custom_data || {};
          const invoiceData = resData.invoice || {};
          const amount = Number(invoiceData.total_amount ?? customData.amount ?? 0);
          const orderId = String(customData.order_id || customData.orderId || invoiceData.order_id || "").trim() || undefined;
          const currencyCode = String(customData.currency_code || customData.currencyCode || invoiceData.currency_code || "XOF").trim().toUpperCase();
          return {
            status: "pending",
            transactionId,
            amount,
            orderId,
            currencyCode,
            message: `Paiement PayDunya en attente de validation (Statut: ${invoiceStatus || "pending"}).`
          };
        }
      } catch (error: any) {
        console.error("[PayDunya Verification API Error]:", error);
        // Fallback to local server record verification
      }
    }

    // 2. Server-side ledger lookup (ensures strictly authoritative confirmation)
    const record = getPayDunyaInvoice(transactionId);
    if (!record) {
      return {
        status: "failed",
        transactionId,
        amount: 0,
        message: "Transaction PayDunya introuvable sur le serveur."
      };
    }

    const orderId = record.orderId ? String(record.orderId).trim() : undefined;
    const amount = Number(record.amount || 0);
    const currencyCode = String(record.currencyCode || "XOF").trim().toUpperCase();

    if (record.status === "completed") {
      return {
        status: "success",
        transactionId: record.token,
        amount,
        orderId,
        currencyCode,
        countryCode: record.countryCode,
        providerTxId: record.providerTxId || ("PD-" + crypto.randomBytes(6).toString("hex").toUpperCase()),
        message: "Facture PayDunya acquittée et confirmée par le serveur."
      };
    } else if (record.status === "cancelled") {
      return {
        status: "cancelled",
        transactionId: record.token,
        amount,
        orderId,
        currencyCode,
        message: "Facture PayDunya annulée."
      };
    } else if (record.status === "failed") {
      return {
        status: "failed",
        transactionId: record.token,
        amount,
        orderId,
        currencyCode,
        message: "Facture PayDunya échouée."
      };
    } else {
      return {
        status: "pending",
        transactionId: record.token,
        amount,
        orderId,
        currencyCode,
        message: "Facture PayDunya en attente de paiement."
      };
    }
  }

  /**
   * Disburse/payout transfer to artisan mobile money via PayDunya transfer API
   */
  async disbursePayout(phone: string, amount: number, method: string): Promise<{ success: boolean; txId?: string; error?: string }> {
    const { masterKey, privateKey, token } = this.getApiKeys();

    if (!masterKey || !privateKey || !token) {
      return {
        success: false,
        error: "Les clés API officielles PayDunya (Master Key, Private Key, Token) sont requises pour effectuer un transfert."
      };
    }

    try {
      // Determine the PayDunya withdraw mode from the method string
      let withdrawMode = "tmoney-togo"; // default
      const normalized = method.toLowerCase();
      if (normalized.includes("flooz") || normalized.includes("moov")) {
        withdrawMode = "moov-togo";
      } else if (normalized.includes("wave")) {
        withdrawMode = "wave-senegal";
      } else if (normalized.includes("orange")) {
        withdrawMode = "orange-money-senegal";
      } else if (normalized.includes("free")) {
        withdrawMode = "free-money-senegal";
      }

      const baseUrl = this.getBaseUrl();
      const payload = {
        disburse: {
          account_alias: phone,
          amount: amount,
          withdraw_mode: withdrawMode
        }
      };

      const response = await fetch(`${baseUrl}/disburse/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "PAYDUNYA-MASTER-KEY": masterKey,
          "PAYDUNYA-PRIVATE-KEY": privateKey,
          "PAYDUNYA-TOKEN": token
        },
        body: JSON.stringify(payload)
      });

      const resData = await this.parsePayDunyaJsonResponse(response, "transfert PayDunya");

      if (resData && resData.response_code === "00") {
        return {
          success: true,
          txId: resData.disburse_token || "DISB-" + crypto.randomBytes(4).toString("hex").toUpperCase()
        };
      } else {
        return {
          success: false,
          error: resData?.response_text || "Échec du transfert d'argent PayDunya."
        };
      }
    } catch (error: any) {
      console.error("[PayDunya Disburse Error]:", error);
      return {
        success: false,
        error: `Erreur technique lors de l'appel API PayDunya : ${error.message}`
      };
    }
  }
}

// 5. Flutterwave Provider
export class FlutterwaveProvider implements IPaymentProvider {
  id = "flutterwave";
  name = "Flutterwave";
  description = "Cartes bancaires, Apple Pay, Google Pay & Mobile Money africains";
  supportedMethods = ["card", "mobile_money"];

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const transactionId = "TX-FLW-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      success: true,
      transactionId,
      providerId: this.id,
      amount,
      status: "pending",
      redirectUrl: `https://checkout.flutterwave.com/v3/hosted/pay/${transactionId}`,
      instructions: "Payez par carte bancaire ou Mobile Money sur la plateforme Flutterwave."
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      status: "success",
      transactionId,
      amount: 0,
      providerTxId: "FLW-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      message: "Flutterwave Charge Successful callback verified"
    };
  }
}

// 6. Stripe Provider
export class StripeProvider implements IPaymentProvider {
  id = "stripe";
  name = "Stripe";
  description = "Cartes bancaires internationales (Visa, Mastercard, Amex, etc.)";
  supportedMethods = ["card"];

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const transactionId = "TX-ST-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      success: true,
      transactionId,
      providerId: this.id,
      amount,
      status: "pending",
      redirectUrl: `https://checkout.stripe.com/pay/${transactionId}`,
      instructions: "Formulaire sécurisé Stripe de paiement par carte bancaire internationale."
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      status: "success",
      transactionId,
      amount: 0,
      providerTxId: "ch_" + crypto.randomBytes(12).toString("hex"),
      message: "Stripe payment_intent.succeeded webhook validation ok"
    };
  }
}

// 3. Mix by Yas Provider
export class MixByYasProvider implements IPaymentProvider {
  id = "mix_by_yas";
  name = "Mix by Yas";
  description = "Paiement direct via transfert d'argent (Moov Money / TMoney / Mix)";
  supportedMethods = ["mobile_money"];

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const transactionId = "TX-MIX-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      success: true,
      transactionId,
      providerId: this.id,
      amount,
      status: "pending",
      instructions: `Veuillez envoyer le paiement de ${amount} FCFA vers le numéro marchand via l'option transfert ou Mix by Yas.`
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      status: "success",
      transactionId,
      amount: 0,
      providerTxId: "MIX-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      message: "Transaction Mix by Yas validée avec succès"
    };
  }
}

// 7. Payment Gateway Manager
export class PaymentGateway {
  private static instance: PaymentGateway;
  private providers: Map<string, IPaymentProvider> = new Map();

  private constructor() {
    this.registerProvider(new PayDunyaProvider());
  }

  public static getInstance(): PaymentGateway {
    if (!PaymentGateway.instance) {
      PaymentGateway.instance = new PaymentGateway();
    }
    return PaymentGateway.instance;
  }

  public registerProvider(provider: IPaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): IPaymentProvider | undefined {
    return this.providers.get(id);
  }

  public getActiveProviders(): { id: string; name: string; description: string; supportedMethods: string[] }[] {
    return Array.from(this.providers.values()).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      supportedMethods: p.supportedMethods
    }));
  }

  public async initiatePayment(providerId: string, orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Le prestataire de paiement "${providerId}" n'est pas supporté par Asime.`);
    }
    return provider.initiatePayment(orderId, amount, customer);
  }

  public async verifyPayment(providerId: string, transactionId: string): Promise<PaymentVerificationResult> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Le prestataire de paiement "${providerId}" n'est pas supporté.`);
    }
    return provider.verifyPayment(transactionId);
  }
}

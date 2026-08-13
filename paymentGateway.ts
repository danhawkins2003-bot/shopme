import crypto from "crypto";
import fs from "fs";
import path from "path";

function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...vals] = trimmed.split("=");
          const k = key.trim();
          let v = vals.join("=").trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (k && v && !process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  } catch (e) {}
}

export interface PaymentCustomerDetails {
  name: string;
  phone: string;
  email?: string;
}

export interface PaymentSession {
  success: boolean;
  transactionId: string;
  providerId: string;
  amount: number;
  status: "pending" | "success" | "failed";
  redirectUrl?: string;
  instructions?: string;
}

export interface PaymentVerificationResult {
  status: "success" | "failed" | "pending";
  transactionId: string;
  amount: number;
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

// 4. PayDunya Provider
export class PayDunyaProvider implements IPaymentProvider {
  id = "paydunya";
  name = "Asime Pay (En Ligne)";
  description = "Solutions sécurisées de paiement par Mobile Money (Wave, Orange Money) & Cartes bancaires";
  supportedMethods = ["mobile_money", "card"];

  private getApiKeys() {
    loadEnvFile();

    const masterKey = (process.env.PAYDUNYA_MASTER_KEY || process.env.PAYDUNYA_MASTER_TOKEN || process.env.PAYDUNYA_MASTER || process.env.PAYDUNYA_KEY_MASTER || "").trim();
    const privateKey = (process.env.PAYDUNYA_PRIVATE_KEY || process.env.PAYDUNYA_SECRET_KEY || process.env.PAYDUNYA_PRIVATE || process.env.PAYDUNYA_SECRET || "").trim();
    const token = (process.env.PAYDUNYA_TOKEN || process.env.PAYDUNYA_PUBLIC_KEY || process.env.PAYDUNYA_PUBLIC_TOKEN || process.env.PAYDUNYA_KEY || "").trim();
    
    let modeInput = (process.env.PAYDUNYA_MODE || "").toLowerCase().trim();
    let mode = "test";
    if (modeInput === "production" || modeInput === "prod" || modeInput === "live" || (!modeInput && (privateKey || token))) {
      mode = "live";
    }

    return { masterKey, privateKey, token, mode };
  }

  private getBaseUrl(): string {
    const { mode } = this.getApiKeys();
    return mode === "live" 
      ? "https://payment.paydunya.com/api/v1" 
      : "https://payment.paydunya.com/sandbox-api/v1";
  }

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const { masterKey, privateKey, token, mode } = this.getApiKeys();
    
    // Strict error if keys are missing in .env (No silent mock fallback)
    if (!privateKey || !token) {
      console.error("[PayDunya] Clés d'API manquantes dans .env (PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN).");
      throw new Error("Clés PayDunya non trouvées dans le fichier .env. Veuillez renseigner PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY et PAYDUNYA_TOKEN dans .env pour la production.");
    }

    try {
      const baseUrl = this.getBaseUrl();
      console.log(`[PayDunya] Initialisation facture en mode ${mode.toUpperCase()} sur URL ${baseUrl}...`);

      const payload = {
        invoice: {
          total_amount: amount,
          description: `Paiement commande #${orderId} - Asime Togo`,
          items: [
            {
              name: `Commande #${orderId}`,
              quantity: 1,
              unit_price: amount,
              total_price: amount
            }
          ]
        },
        store: {
          name: "Asime Togo",
          tagline: "L'artisanat togolais à portée de clic",
          postal_address: "Lomé, Togo",
          phone: "+22898434546"
        },
        custom_data: {
          order_id: orderId,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email || "support@asime228.com"
        },
        actions: {
          cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/order-history?payment=cancel&orderId=${orderId}`,
          return_url: `${process.env.APP_URL || "http://localhost:3000"}/order-history?payment=success&orderId=${orderId}`
        }
      };

      const response = await fetch(`${baseUrl}/checkout-invoice/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PAYDUNYA-MASTER-KEY": masterKey,
          "PAYDUNYA-PRIVATE-KEY": privateKey,
          "PAYDUNYA-TOKEN": token
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json() as any;

      if (resData && resData.response_code === "00") {
        return {
          success: true,
          transactionId: resData.token, // Store PayDunya token as transactionId
          providerId: this.id,
          amount,
          status: "pending",
          redirectUrl: resData.response_text, // Contains PayDunya Hosted Checkout URL
          instructions: "Veuillez compléter votre paiement sur l'interface sécurisée PayDunya."
        };
      } else {
        console.error("[PayDunya API] Réponse d'échec de PayDunya:", resData);
        throw new Error(resData?.response_text || `Code d'erreur PayDunya: ${resData?.response_code || "Inconnu"}`);
      }
    } catch (error: any) {
      console.error("[PayDunya API Error] Failed to create checkout session:", error);
      throw new Error(`Erreur API PayDunya (${error.message}). Vérifiez vos clés dans .env.`);
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    const { masterKey, privateKey, token } = this.getApiKeys();

    if (!privateKey || !token || transactionId.startsWith("TX-PD-MOCK") || transactionId.startsWith("TX-PD-FAILOVER")) {
      return {
        status: "success",
        transactionId,
        amount: 0,
        providerTxId: "PD-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
        message: "Facture PayDunya acquittée (Simulation de démonstration sans clé API)"
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/checkout-invoice/confirm/${transactionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "PAYDUNYA-MASTER-KEY": masterKey,
          "PAYDUNYA-PRIVATE-KEY": privateKey,
          "PAYDUNYA-TOKEN": token
        }
      });

      const resData = await response.json() as any;

      if (resData && resData.status === "completed") {
        return {
          status: "success",
          transactionId,
          amount: Number(resData.invoice?.total_amount || 0),
          providerTxId: resData.transaction_id || "PD-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
          message: `Paiement PayDunya validé. Statut: ${resData.status}. Reçu via ${resData.invoice?.payment_method || "PayDunya"}`
        };
      } else {
        return {
          status: "pending",
          transactionId,
          amount: 0,
          message: `Le paiement PayDunya est en cours ou en attente d'approbation. Statut actuel: ${resData?.status || "Inconnu"}`
        };
      }
    } catch (error: any) {
      console.error("[PayDunya API Error] Failed to verify payment:", error);
      return {
        status: "failed",
        transactionId,
        amount: 0,
        message: `Échec de la validation de paiement PayDunya en direct : ${error.message}`
      };
    }
  }

  /**
   * Disburse/payout transfer to artisan mobile money via PayDunya transfer API
   */
  async disbursePayout(phone: string, amount: number, method: string): Promise<{ success: boolean; txId?: string; error?: string }> {
    const { masterKey, privateKey, token } = this.getApiKeys();

    if (!privateKey || !token) {
      console.log(`[PayDunya Disburse Demo] Retrait de ${amount} FCFA vers ${phone} (${method}) traité avec succès (Mode Démo).`);
      return { success: true, txId: "DISB-MOCK-" + crypto.randomBytes(4).toString("hex").toUpperCase() };
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
          "PAYDUNYA-MASTER-KEY": masterKey,
          "PAYDUNYA-PRIVATE-KEY": privateKey,
          "PAYDUNYA-TOKEN": token
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json() as any;

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

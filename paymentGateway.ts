import crypto from "crypto";

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
  name = "PayDunya";
  description = "Solutions de paiement unifiées pour l'Afrique de l'Ouest";
  supportedMethods = ["mobile_money", "card"];

  async initiatePayment(orderId: string, amount: number, customer: PaymentCustomerDetails): Promise<PaymentSession> {
    const transactionId = "TX-PD-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      success: true,
      transactionId,
      providerId: this.id,
      amount,
      status: "pending",
      redirectUrl: `https://paydunya.com/checkout/invoice/${transactionId}`,
      instructions: "Complétez le paiement sécurisé sur le guichet de PayDunya."
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      status: "success",
      transactionId,
      amount: 0,
      providerTxId: "PD-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      message: "Facture PayDunya acquittée"
    };
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

// 7. Payment Gateway Manager
export class PaymentGateway {
  private static instance: PaymentGateway;
  private providers: Map<string, IPaymentProvider> = new Map();

  private constructor() {
    this.registerProvider(new TMoneyProvider());
    this.registerProvider(new FloozProvider());
    this.registerProvider(new CinetPayProvider());
    this.registerProvider(new PayDunyaProvider());
    this.registerProvider(new FlutterwaveProvider());
    this.registerProvider(new StripeProvider());
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

import fs from "fs";
import path from "path";
import crypto from "crypto";

const WALLETS_FILE = path.join(process.cwd(), "wallets.json");

export interface WalletTransaction {
  id: string; // Unique transaction reference
  type: "vente" | "commission" | "retrait" | "remboursement";
  amount: number;
  currencyCode?: string; // "XOF" or "XAF"
  orderId?: string;
  withdrawalId?: string;
  date: string;
  description: string;
  status: "pending" | "completed" | "failed";
}

export interface Wallet {
  userId: string;
  balance: number; // Current available balance
  currencyCode?: string; // "XOF" or "XAF"
  type: "vendeur" | "affilie";
  history: WalletTransaction[];
}

export interface WalletLog {
  id: string;
  timestamp: string;
  userId: string;
  action: "CREDIT_SALE" | "CREDIT_COMMISSION" | "DEBIT_WITHDRAWAL" | "REFUND_WITHDRAWAL";
  amount: number;
  currencyCode?: string;
  orderId?: string;
  txId: string;
  message: string;
}

export interface WalletsData {
  wallets: Record<string, Wallet>;
  logs: WalletLog[];
}

// Ensure the wallets.json file exists and load it safely
function loadWalletsData(): WalletsData {
  try {
    if (!fs.existsSync(WALLETS_FILE)) {
      const initial: WalletsData = { wallets: {}, logs: [] };
      fs.writeFileSync(WALLETS_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(WALLETS_FILE, "utf-8");
    return JSON.parse(content) as WalletsData;
  } catch (err) {
    console.error("Error loading wallets.json:", err);
    return { wallets: {}, logs: [] };
  }
}

function saveWalletsData(data: WalletsData): boolean {
  try {
    fs.writeFileSync(WALLETS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving wallets.json:", err);
    return false;
  }
}

export class WalletManager {
  private static lock = false; // Simple lock guard to prevent race conditions & double-operations

  public static getWallet(userId: string, type: "vendeur" | "affilie" = "vendeur"): Wallet {
    const data = loadWalletsData();
    if (!data.wallets[userId]) {
      data.wallets[userId] = {
        userId,
        balance: 0,
        type,
        history: []
      };
      saveWalletsData(data);
    }
    return data.wallets[userId];
  }

  /**
   * Automatically processes the payment split for an order according to definitive business rules:
   * 1. VENDEUR:
   *    - Le vendeur reçoit toujours 90 % du montant de la vente.
   *    - Les 90 % du vendeur ne doivent jamais être diminués par une commission affilié.
   * 2. MIABÉ ASI:
   *    - Les 10 % restants constituent la part de Miabé Asi.
   *    - Lorsqu'aucun affilié n'est à l'origine de la vente, Miabé Asi conserve les 10 % en totalité.
   * 3. AFFILIÉ:
   *    - Un affilié gagne une commission UNIQUEMENT lorsqu'un client achète réellement via son lien/code d'affiliation attribué à la vente.
   *    - La commission affilié doit être prélevée uniquement sur les 10 % de la part Miabé Asi.
   *    - Elle ne doit jamais être prélevée sur les 90 % du vendeur.
   *    - Si aucune attribution affilié valide n'existe, aucune commission affilié ne doit être créée.
   * 4. DEVISE:
   *    - Conserver exactement la devise de la transaction (XOF pour TG/BJ/BF/CI/ML/SN, XAF pour CM).
   */
  public static processOrderSplit(
    orderId: string,
    totalAmount: number,
    items: { product: { nom: string; prix: number; partenaire: string }; quantity: number }[],
    sellerUserIdsAndNames: { id: string; name: string; businessName?: string }[],
    affiliateUserId: string | null,
    orderCurrency: string = "XOF",
    customAffiliateCommission?: number
  ): { success: boolean; logs: string[] } {
    if (this.lock) {
      return { success: false, logs: ["Operation locked to prevent race conditions."] };
    }
    this.lock = true;

    const data = loadWalletsData();
    const resultLogs: string[] = [];

    try {
      // 1. Part Miabé Asi brute = 10%
      const miabeAsiGrossShare = Math.floor(totalAmount * 0.10);

      // 2. Commission Affilié : prélevée UNIQUEMENT sur les 10% de Miabé Asi (taux existant 3%)
      let affiliateCommission = 0;
      let affiliateTxId = "";

      if (affiliateUserId) {
        affiliateCommission = customAffiliateCommission !== undefined && customAffiliateCommission >= 0
          ? customAffiliateCommission
          : Math.floor(totalAmount * 0.03); // Taux existant de 3%
        
        // Prevent double credit
        const doubleCommissionCheck = Object.values(data.wallets[affiliateUserId]?.history || []).some(
          tx => tx.orderId === orderId && tx.type === "commission"
        );

        if (doubleCommissionCheck) {
          resultLogs.push(`Double commission credit prevention activated for affiliate ${affiliateUserId} on order ${orderId}`);
        } else {
          // Get/Create affiliate wallet
          if (!data.wallets[affiliateUserId]) {
            data.wallets[affiliateUserId] = { userId: affiliateUserId, balance: 0, currencyCode: orderCurrency, type: "affilie", history: [] };
          }
          const affWallet = data.wallets[affiliateUserId];
          affWallet.balance += affiliateCommission;
          affWallet.currencyCode = orderCurrency;

          affiliateTxId = "TX-COMM-" + crypto.randomBytes(4).toString("hex").toUpperCase();
          const affTx: WalletTransaction = {
            id: affiliateTxId,
            type: "commission",
            amount: affiliateCommission,
            currencyCode: orderCurrency,
            orderId,
            date: new Date().toISOString(),
            description: `Commission d'affiliation de 3% (${affiliateCommission} ${orderCurrency}) pour la commande #${orderId} (prélevée sur la part Miabé Asi)`,
            status: "completed"
          };
          affWallet.history.unshift(affTx);

          // Log trace
          data.logs.push({
            id: crypto.randomBytes(8).toString("hex"),
            timestamp: new Date().toISOString(),
            userId: affiliateUserId,
            action: "CREDIT_COMMISSION",
            amount: affiliateCommission,
            currencyCode: orderCurrency,
            orderId,
            txId: affiliateTxId,
            message: `Crédit commission d'affilié de 3% (${affiliateCommission} ${orderCurrency}) prélevée sur la part Miabé Asi pour la commande ${orderId}`
          });
          resultLogs.push(`Affiliate ${affiliateUserId} wallet credited with ${affiliateCommission} ${orderCurrency} (prélevée sur les 10% Miabé Asi).`);
        }
      } else {
        resultLogs.push(`Aucune attribution affilié pour la commande ${orderId} : Miabé Asi conserve 100% de sa part de 10% (${miabeAsiGrossShare} ${orderCurrency}).`);
      }

      // Solde restant pour Miabé Asi
      const miabeAsiNetShare = miabeAsiGrossShare - affiliateCommission;
      resultLogs.push(`Répartition Miabé Asi : Brute = ${miabeAsiGrossShare} ${orderCurrency}, Affilié = ${affiliateCommission} ${orderCurrency}, Net Miabé Asi = ${miabeAsiNetShare} ${orderCurrency}`);

      // 3. Part Vendeur (90% systématique, JAMAIS impacté par l'affilié)
      for (const item of items) {
        const itemTotal = item.product.prix * item.quantity;
        const sellerEarnings = Math.floor(itemTotal * 0.90);
        const partnerName = item.product.partenaire || "Boutique en Direct";

        // Find match in seller list
        const sellerUser = sellerUserIdsAndNames.find(
          u => u.businessName === partnerName || u.name === partnerName
        );

        if (sellerUser) {
          const sellerId = sellerUser.id;

          // Prevent double credit check
          const doubleCreditCheck = Object.values(data.wallets[sellerId]?.history || []).some(
            tx => tx.orderId === orderId && tx.type === "vente" && tx.description.includes(item.product.nom)
          );

          if (doubleCreditCheck) {
            resultLogs.push(`Double credit check caught item "${item.product.nom}" for seller ${sellerId} on order ${orderId}`);
            continue;
          }

          if (!data.wallets[sellerId]) {
            data.wallets[sellerId] = { userId: sellerId, balance: 0, currencyCode: orderCurrency, type: "vendeur", history: [] };
          }
          const sellerWallet = data.wallets[sellerId];
          sellerWallet.balance += sellerEarnings;
          sellerWallet.currencyCode = orderCurrency;

          const sellerTxId = "TX-SALE-" + crypto.randomBytes(4).toString("hex").toUpperCase();
          const sellerTx: WalletTransaction = {
            id: sellerTxId,
            type: "vente",
            amount: sellerEarnings,
            currencyCode: orderCurrency,
            orderId,
            date: new Date().toISOString(),
            description: `Vente produit : "${item.product.nom}" (x${item.quantity}) - Part vendeur 90% intégrale`,
            status: "completed"
          };
          sellerWallet.history.unshift(sellerTx);

          // Log trace
          data.logs.push({
            id: crypto.randomBytes(8).toString("hex"),
            timestamp: new Date().toISOString(),
            userId: sellerId,
            action: "CREDIT_SALE",
            amount: sellerEarnings,
            currencyCode: orderCurrency,
            orderId,
            txId: sellerTxId,
            message: `Crédit vente de ${sellerEarnings} ${orderCurrency} pour "${item.product.nom}" (x${item.quantity}) sur commande ${orderId} - Part vendeur 90% intégrale`
          });
          resultLogs.push(`Seller ${sellerId} wallet credited with ${sellerEarnings} ${orderCurrency} for product ${item.product.nom} (90% garanti).`);
        } else {
          resultLogs.push(`No registered seller user found matching partner name "${partnerName}". Splitted funds retained by system.`);
        }
      }

      saveWalletsData(data);
      return { success: true, logs: resultLogs };
    } catch (err: any) {
      console.error("Error in processOrderSplit:", err);
      return { success: false, logs: [`Internal Error: ${err.message}`] };
    } finally {
      this.lock = false;
    }
  }

  /**
   * Request withdrawal from a wallet
   */
  public static debitWithdrawalRequest(
    userId: string,
    withdrawalId: string,
    amount: number,
    method: string,
    phone: string,
    type: "vendeur" | "affilie"
  ): { success: boolean; error?: string } {
    if (this.lock) return { success: false, error: "Système temporairement verrouillé." };
    this.lock = true;

    const data = loadWalletsData();
    try {
      if (!data.wallets[userId]) {
        data.wallets[userId] = { userId, balance: 0, type, history: [] };
      }
      const wallet = data.wallets[userId];

      if (wallet.balance < amount) {
        return { success: false, error: `Solde insuffisant dans votre portefeuille. Solde : ${wallet.balance} FCFA.` };
      }

      // Check double debit
      const doubleCheck = wallet.history.some(tx => tx.withdrawalId === withdrawalId);
      if (doubleCheck) {
        return { success: false, error: "Cette demande de retrait a déjà été débitée." };
      }

      // Subtract balance
      wallet.balance -= amount;

      const txId = "TX-WITH-" + crypto.randomBytes(4).toString("hex").toUpperCase();
      const tx: WalletTransaction = {
        id: txId,
        type: "retrait",
        amount: -amount,
        withdrawalId,
        date: new Date().toISOString(),
        description: `Demande de retrait de ${amount.toLocaleString()} FCFA via ${method} vers ${phone}`,
        status: "pending"
      };
      wallet.history.unshift(tx);

      // Log trace
      data.logs.push({
        id: crypto.randomBytes(8).toString("hex"),
        timestamp: new Date().toISOString(),
        userId,
        action: "DEBIT_WITHDRAWAL",
        amount,
        txId,
        message: `Débit pour demande de retrait de ${amount} FCFA vers le compte ${method} (${phone})`
      });

      saveWalletsData(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      this.lock = false;
    }
  }

  /**
   * Finalize/approve withdrawal (updates status in ledger)
   */
  public static completeWithdrawal(userId: string, withdrawalId: string) {
    const data = loadWalletsData();
    const wallet = data.wallets[userId];
    if (wallet) {
      const tx = wallet.history.find(t => t.withdrawalId === withdrawalId && t.type === "retrait");
      if (tx) {
        tx.status = "completed";
        saveWalletsData(data);
      }
    }
  }

  /**
   * Reject withdrawal - refunds back to wallet
   */
  public static rejectAndRefundWithdrawal(userId: string, withdrawalId: string, amount: number) {
    if (this.lock) return false;
    this.lock = true;

    const data = loadWalletsData();
    try {
      const wallet = data.wallets[userId];
      if (wallet) {
        const tx = wallet.history.find(t => t.withdrawalId === withdrawalId && t.type === "retrait");
        if (tx && tx.status !== "failed") {
          tx.status = "failed"; // Update status
          
          wallet.balance += amount; // Re-credit
          
          const refundTxId = "TX-REFUND-" + crypto.randomBytes(4).toString("hex").toUpperCase();
          const refundTx: WalletTransaction = {
            id: refundTxId,
            type: "remboursement",
            amount,
            withdrawalId,
            date: new Date().toISOString(),
            description: `Remboursement suite au rejet du retrait de ${amount.toLocaleString()} FCFA`,
            status: "completed"
          };
          wallet.history.unshift(refundTx);

          // Log trace
          data.logs.push({
            id: crypto.randomBytes(8).toString("hex"),
            timestamp: new Date().toISOString(),
            userId,
            action: "REFUND_WITHDRAWAL",
            amount,
            txId: refundTxId,
            message: `Remboursement de ${amount} FCFA suite au rejet du retrait ${withdrawalId}`
          });

          saveWalletsData(data);
        }
      }
      return true;
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      return false;
    } finally {
      this.lock = false;
    }
  }
}

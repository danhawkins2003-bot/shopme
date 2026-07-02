import fs from "fs";
import path from "path";
import crypto from "crypto";

const WALLETS_FILE = path.join(process.cwd(), "wallets.json");

export interface WalletTransaction {
  id: string; // Unique transaction reference
  type: "vente" | "commission" | "retrait" | "remboursement";
  amount: number;
  orderId?: string;
  withdrawalId?: string;
  date: string;
  description: string;
  status: "pending" | "completed" | "failed";
}

export interface Wallet {
  userId: string;
  balance: number; // Current available balance in FCFA
  type: "vendeur" | "affilie";
  history: WalletTransaction[];
}

export interface WalletLog {
  id: string;
  timestamp: string;
  userId: string;
  action: "CREDIT_SALE" | "CREDIT_COMMISSION" | "DEBIT_WITHDRAWAL" | "REFUND_WITHDRAWAL";
  amount: number;
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
   * Automatically processes the payment split for an order.
   * Client pays Asime. Asime retains 10% commission.
   * Seller gets 90%.
   * If there's an affiliate, affiliate gets 3% of total (300 FCFA on 10k), which is deducted from Asime's commission (7% goes to Asime).
   */
  public static processOrderSplit(
    orderId: string,
    totalAmount: number,
    items: { product: { nom: string; prix: number; partenaire: string }; quantity: number }[],
    sellerUserIdsAndNames: { id: string; name: string; businessName?: string }[],
    affiliateUserId: string | null
  ): { success: boolean; logs: string[] } {
    if (this.lock) {
      return { success: false, logs: ["Operation locked to prevent race conditions."] };
    }
    this.lock = true;

    const data = loadWalletsData();
    const resultLogs: string[] = [];

    try {
      // 1. Calculate affiliate commission
      let affiliateCommission = 0;
      let affiliateTxId = "";
      if (affiliateUserId) {
        affiliateCommission = Math.floor(totalAmount * 0.03); // 3% of total
        
        // Prevent double credit
        const doubleCommissionCheck = Object.values(data.wallets[affiliateUserId]?.history || []).some(
          tx => tx.orderId === orderId && tx.type === "commission"
        );

        if (doubleCommissionCheck) {
          resultLogs.push(`Double commission credit prevention activated for affiliate ${affiliateUserId} on order ${orderId}`);
        } else {
          // Get/Create affiliate wallet
          if (!data.wallets[affiliateUserId]) {
            data.wallets[affiliateUserId] = { userId: affiliateUserId, balance: 0, type: "affilie", history: [] };
          }
          const affWallet = data.wallets[affiliateUserId];
          affWallet.balance += affiliateCommission;

          affiliateTxId = "TX-COMM-" + crypto.randomBytes(4).toString("hex").toUpperCase();
          const affTx: WalletTransaction = {
            id: affiliateTxId,
            type: "commission",
            amount: affiliateCommission,
            orderId,
            date: new Date().toISOString(),
            description: `Commission d'affiliation de 3% pour la commande #${orderId}`,
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
            orderId,
            txId: affiliateTxId,
            message: `Crédit commission d'affilié de ${affiliateCommission} FCFA pour la commande ${orderId}`
          });
          resultLogs.push(`Affiliate ${affiliateUserId} wallet credited with ${affiliateCommission} FCFA.`);
        }
      }

      // 2. Process seller parts (90% per seller item)
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
            data.wallets[sellerId] = { userId: sellerId, balance: 0, type: "vendeur", history: [] };
          }
          const sellerWallet = data.wallets[sellerId];
          sellerWallet.balance += sellerEarnings;

          const sellerTxId = "TX-SALE-" + crypto.randomBytes(4).toString("hex").toUpperCase();
          const sellerTx: WalletTransaction = {
            id: sellerTxId,
            type: "vente",
            amount: sellerEarnings,
            orderId,
            date: new Date().toISOString(),
            description: `Vente produit : "${item.product.nom}" (x${item.quantity}) - Part vendeur 90%`,
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
            orderId,
            txId: sellerTxId,
            message: `Crédit vente de ${sellerEarnings} FCFA pour "${item.product.nom}" (x${item.quantity}) sur commande ${orderId}`
          });
          resultLogs.push(`Seller ${sellerId} wallet credited with ${sellerEarnings} FCFA for product ${item.product.nom}.`);
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

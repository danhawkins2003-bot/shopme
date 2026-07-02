import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  ShoppingBag, 
  DollarSign, 
  Check, 
  X, 
  Copy, 
  Link2, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Bell, 
  Truck, 
  Wallet, 
  ShieldAlert, 
  Star, 
  Clock, 
  HelpCircle,
  Eye,
  Camera,
  Layers,
  ChevronRight,
  ArrowRightLeft,
  ArrowLeft,
  MessageSquare,
  Tag,
  Gift,
  LogOut,
  Settings,
  Globe,
  Lock,
  FileText,
  Coins,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Heart,
  Percent,
  History
} from "lucide-react";
import SellerWorkspace from "./SellerWorkspace";

interface MultiRoleDashboardsProps {
  user: any;
  setUser: (user: any) => void;
  token: string | null;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  showToast: (msg: string) => void;
  formatFCFA: (amount: number) => string;
  closeDrawer: () => void;
  onSelectProduct: (product: any) => void;
  onLogout?: () => void;
  onTabChange?: (tab: string) => void;
}

interface WalletSectionProps {
  wallet: any;
  formatFCFA: (amount: number) => string;
}

const WalletSection: React.FC<WalletSectionProps> = ({ wallet, formatFCFA }) => {
  if (!wallet) {
    return (
      <div className="bg-stone-50 border border-stone-200 p-5 text-center">
        <Coins className="w-8 h-8 text-neutral-300 mx-auto mb-2 animate-pulse" />
        <p className="text-xs text-neutral-400">Chargement de votre portefeuille en cours...</p>
      </div>
    );
  }

  const ledger = wallet.ledger || [];
  
  const totalVentes = ledger
    .filter((tx: any) => tx.type === "vente")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const totalCommissions = ledger
    .filter((tx: any) => tx.type === "commission")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const totalRetraits = ledger
    .filter((tx: any) => tx.type === "retrait_demande")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const totalRemboursements = ledger
    .filter((tx: any) => tx.type === "retrait_rembourse")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  return (
    <div className="bg-white border border-stone-200 p-4 space-y-4 font-sans text-left">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-[#b8901c]" />
          <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Portefeuille Virtuel</h4>
        </div>
        <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 uppercase">Asime Gateway</span>
      </div>

      {/* Main Balance */}
      <div className="bg-gradient-to-r from-neutral-900 to-stone-800 text-white p-4 text-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Solde Actuel</span>
          <h3 className="text-2xl font-mono font-black text-[#d4af37] mt-1">{formatFCFA(wallet.balance)}</h3>
          <p className="text-[8.5px] text-stone-400 mt-1.5 font-mono">ID de compte : {wallet.userId}</p>
        </div>
        <div className="absolute -right-6 -bottom-6 text-stone-800 opacity-20 pointer-events-none">
          <Wallet className="w-24 h-24" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-emerald-50/50 border border-emerald-100 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Ventes brutes (+)</span>
          <strong className="text-emerald-700 font-mono text-xs">{formatFCFA(totalVentes)}</strong>
        </div>
        <div className="bg-amber-50/30 border border-amber-100/50 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Commissions d'Asime (-)</span>
          <strong className="text-amber-800 font-mono text-xs">{formatFCFA(totalCommissions)}</strong>
        </div>
        <div className="bg-rose-50/50 border border-rose-100 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Retraits demandés (-)</span>
          <strong className="text-rose-700 font-mono text-xs">{formatFCFA(totalRetraits)}</strong>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 p-2">
          <span className="text-neutral-400 block font-bold uppercase tracking-wide text-[8.5px]">Remboursements (+)</span>
          <strong className="text-blue-700 font-mono text-xs">{formatFCFA(totalRemboursements)}</strong>
        </div>
      </div>

      {/* Transactions list */}
      <div className="space-y-2">
        <p className="font-extrabold text-[9.5px] uppercase text-neutral-800 tracking-wider">Journal des Transactions</p>
        {ledger.length === 0 ? (
          <p className="text-[10px] text-neutral-400 italic text-center py-4 bg-neutral-50 border border-neutral-100">Aucun enregistrement comptable disponible.</p>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {ledger.slice().reverse().map((tx: any) => {
              let typeLabel = tx.type;
              let typeClass = "bg-neutral-100 text-neutral-700 border-neutral-200";
              let amountPrefix = "";
              let amountClass = "text-neutral-700";

              if (tx.type === "vente") {
                typeLabel = "Vente";
                typeClass = "bg-emerald-100 text-emerald-800 border-emerald-200/50";
                amountPrefix = "+";
                amountClass = "text-emerald-600";
              } else if (tx.type === "commission") {
                typeLabel = "Commission";
                typeClass = "bg-amber-100 text-amber-800 border-amber-200/50";
                amountPrefix = "-";
                amountClass = "text-amber-700";
              } else if (tx.type === "retrait_demande") {
                typeLabel = "Débit Retrait";
                typeClass = "bg-rose-100 text-rose-800 border-rose-200/50";
                amountPrefix = "-";
                amountClass = "text-rose-600";
              } else if (tx.type === "retrait_rembourse") {
                typeLabel = "Remboursement";
                typeClass = "bg-blue-100 text-blue-800 border-blue-200/50";
                amountPrefix = "+";
                amountClass = "text-blue-600";
              } else if (tx.type === "retrait_complete") {
                typeLabel = "Retrait Réussi";
                typeClass = "bg-slate-100 text-slate-800 border-slate-200";
                amountPrefix = "";
                amountClass = "text-slate-600";
              }

              return (
                <div key={tx.id} className="border border-stone-100 p-2 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 border rounded-sm tracking-wider ${typeClass}`}>
                      {typeLabel}
                    </span>
                    <strong className={`font-mono text-xs font-black ${amountClass}`}>
                      {amountPrefix}{formatFCFA(tx.amount)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400">
                    <span className="truncate max-w-[170px] text-neutral-500 font-sans">{tx.description}</span>
                    <span className="font-mono text-[8px] shrink-0">{new Date(tx.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="text-[7.5px] font-mono text-neutral-300">
                    TxID: {tx.id}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MultiRoleDashboards({
  user,
  setUser,
  token,
  products,
  setProducts,
  showToast,
  formatFCFA,
  closeDrawer,
  onSelectProduct,
  onLogout,
  onTabChange
}: MultiRoleDashboardsProps) {
  const [currentView, setCurrentView] = useState<"menu" | "client" | "vendeur" | "affilie" | "notifications" | "help" | "profile_settings" | "promos" | "favorites">("menu");
  const [activeTab, setActiveTab] = useState<"client" | "vendeur" | "affilie" | "notifications">("client");

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange, user?.role, user?.vendeurStatus]);

  // Profile Settings Edit States
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editQuartier, setEditQuartier] = useState(user?.quartier || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditQuartier(user.quartier || "");
    }
  }, [user]);

  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast("Le nom est obligatoire");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          quartier: editQuartier
        })
      });

      const data = await res.json();
      setIsUpdatingProfile(false);
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        showToast("✓ Profil enregistré avec succès !");
        setCurrentView("menu");
      } else {
        showToast(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setIsUpdatingProfile(false);
      console.error("Profile update error", err);
      showToast("Erreur de connexion.");
    }
  };

  // Client States
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Seller States
  const [vendeurMode, setVendeurMode] = useState<"autonome" | "assiste">("autonome");
  const [businessName, setBusinessName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  
  // Seller Registration Wizard States (Marketplace Onboarding)
  const [vendeurStep, setVendeurStep] = useState<"preferences" | "name" | "stock" | "payout" | "activation">("preferences");
  const [shopLanguage, setShopLanguage] = useState("Français (FR)");
  const [shopCountry, setShopCountry] = useState("Togo (TG)");
  const [shopCurrency, setShopCurrency] = useState("FCFA (XOF)");
  
  // First Listing states
  const [firstListingName, setFirstListingName] = useState("");
  const [firstListingPrice, setFirstListingPrice] = useState("");
  const [firstListingDesc, setFirstListingDesc] = useState("");
  const [firstListingCategory, setFirstListingCategory] = useState("Made in Togo Premium");
  const [firstListingImageUrl, setFirstListingImageUrl] = useState("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400");
  
  // Payout info state
  const [sellerPayoutType, setSellerPayoutType] = useState<"TMoney" | "Flooz" | "Virement">("TMoney");
  const [sellerPayoutNumber, setSellerPayoutNumber] = useState("");
  
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<"Offre 1" | "Offre 2" | "Offre 3">("Offre 1");
  const [paymentMethod, setPaymentMethod] = useState<"TMoney" | "Flooz">("TMoney");
  const [paymentTxId, setPaymentTxId] = useState("");
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  
  // New Product Form States
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Produits alimentaires");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [isEditingProduct, setIsEditingProduct] = useState<any | null>(null);

  // Redesigned Seller Dashboard States
  const [sellerActiveSubTab, setSellerActiveSubTab] = useState<string>("dashboard");
  const [sellerSearchQuery, setSellerSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [reviewsFilter, setReviewsFilter] = useState<number | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<{[reviewId: string]: string}>({});
  const [localReviewReplies, setLocalReviewReplies] = useState<{[reviewId: string]: string[]}>({});
  const [localReviewList, setLocalReviewList] = useState<any[]>([
    { id: "rev_1", clientName: "Abalo K.", productName: "Pure Miel Sauvage", rating: 5, comment: "Excellente qualité de miel, livraison rapide à Lomé. Je recommande vivement !", date: "2026-06-25", replies: [] },
    { id: "rev_2", clientName: "Mawussi T.", productName: "Savon Noir au Curcuma", rating: 4, comment: "Très bon pour la peau, mousse bien. Petit retard de livraison de quelques heures.", date: "2026-06-23", replies: ["Merci pour votre retour ! Nous travaillons à améliorer les délais avec notre livreur."] },
    { id: "rev_3", clientName: "Koffi A.", productName: "Farine de Manioc de Kpalimé", rating: 5, comment: "Superbe ! Parfait pour faire le fufu. Très propre.", date: "2026-06-20", replies: [] },
    { id: "rev_4", clientName: "Emefa S.", productName: "Café Robusta Moulu", rating: 3, comment: "Le goût est bon mais le sachet s'est un peu ouvert pendant le transport.", date: "2026-06-18", replies: [] }
  ]);
  const [localMessageList, setLocalMessageList] = useState<any[]>([
    { id: "msg_1", senderName: "Komi Mensah", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", preview: "Bonjour, est-ce que le miel de 1L est disponible en stock ?", time: "Il y a 10 min", read: false, chatHistory: [
      { sender: "client", text: "Bonjour, est-ce que le miel de 1L est disponible en stock ?", time: "10:15" }
    ]},
    { id: "msg_2", senderName: "Amivi Lawson", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", preview: "Le savon convient-il aux peaux très sensibles ?", time: "Il y a 2 heures", read: true, chatHistory: [
      { sender: "client", text: "Le savon convient-il aux peaux très sensibles ?", time: "08:12" },
      { sender: "seller", text: "Bonjour Amivi ! Oui, notre savon au curcuma est 100% naturel et sans additifs chimiques, parfait pour les peaux sensibles.", time: "08:30" },
      { sender: "client", text: "Super, merci ! Je vais passer commande.", time: "08:45" }
    ]},
    { id: "msg_3", senderName: "Marc Wilson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", preview: "Livrez-vous à Kara ?", time: "Hier", read: true, chatHistory: [
      { sender: "client", text: "Livrez-vous à Kara ?", time: "Hier 14:00" },
      { sender: "seller", text: "Bonjour Marc, oui, nous livrons partout au Togo sous 48 heures via le point relais de Kara.", time: "Hier 15:10" }
    ]}
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>("msg_1");
  const [chatInputText, setChatInputText] = useState("");
  const [localPromotions, setLocalPromotions] = useState<any[]>([
    { id: "promo_1", code: "ASIMEMADE", reduction: "10%", type: "Percentage", applyTo: "Tous les produits", status: "Active", usedCount: 14, expiry: "2026-08-31" },
    { id: "promo_2", code: "LOME500", reduction: "500 FCFA", type: "Fixed", applyTo: "Savon Noir au Curcuma", status: "Active", usedCount: 8, expiry: "2026-07-31" },
    { id: "promo_3", code: "FESTIVAL20", reduction: "20%", type: "Percentage", applyTo: "Miel Sauvage", status: "Expirée", usedCount: 32, expiry: "2026-06-15" }
  ]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoReduc, setNewPromoReduc] = useState("");
  const [newPromoType, setNewPromoType] = useState("Percentage");
  const [newPromoExpiry, setNewPromoExpiry] = useState("2026-12-31");

  // Affiliate States
  const [isCopied, setIsCopied] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<"TMoney" | "Flooz">("TMoney");
  const [withdrawalPhone, setWithdrawalPhone] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);

  // Notifications list
  const [notifications, setNotifications] = useState<any[]>([]);

  const categories = [
    "Épices",
    "Produits alimentaires",
    "Miel",
    "Jus naturels",
    "Produits artisanaux",
    "Cosmétiques naturels",
    "Mode locale",
    "Décoration",
    "Produits agricoles transformés"
  ];

  // Load dashboards data
  useEffect(() => {
    if (!token) return;
    
    // Fetch notifications
    fetch("/api/auth/notifications", {
      headers: { "Authorization": token }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setNotifications(data);
    });

    // Fetch user orders
    fetch("/api/orders/my-orders", {
      headers: { "Authorization": token }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        if (user.role === "vendeur") {
          setSellerOrders(data);
        } else {
          setClientOrders(data);
        }
      }
    });

    // Fetch withdrawals history and wallet ledger if seller or affiliate
    if (user.role === "vendeur" || user.role === "affilie") {
      fetch("/api/withdrawals/my-withdrawals", {
        headers: { "Authorization": token || "" }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWithdrawalHistory(data);
      });

      fetch("/api/wallets/my-wallet", {
        headers: { "Authorization": token || "" }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.wallet) {
          setWallet(data.wallet);
        }
      })
      .catch(err => console.error("Error loading wallet details:", err));
    }
  }, [user.role, token]);

  // Handle Affiliate Link copy
  const handleCopyLink = () => {
    const affiliateCode = user.affiliateCode || "";
    const currentOrigin = window.location.origin;
    const affiliateLink = `${currentOrigin}/?ref=${affiliateCode}`;
    
    navigator.clipboard.writeText(affiliateLink).then(() => {
      setIsCopied(true);
      showToast("Lien d'affiliation copié !");
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Switch role action
  const handleRoleUpgrade = async (newRole: "vendeur" | "affilie", extraPayload = {}) => {
    try {
      const payload: any = { role: newRole, ...extraPayload };
      if (newRole === "vendeur" && !payload.action) {
        payload.vendeurMode = vendeurMode;
        payload.businessName = businessName || user.name;
        payload.contactPhone = sellerPhone || user.phone || "";
        payload.vendeurSubscription = selectedSubscription;
        payload.vendeurPaymentMethod = paymentMethod;
        payload.vendeurPaymentTxId = paymentTxId;
      }

      setIsSubmittingReg(true);
      const res = await fetch("/api/auth/role-upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setIsSubmittingReg(false);
      if (data.success) {
        setUser(data.user);
        if (newRole === "vendeur") {
          if (payload.action === "confirm_payment") {
            showToast("✓ Espace vendeur activé !");
          } else {
            showToast("✓ Inscription enregistrée ! En attente d'activation.");
          }
        } else {
          showToast("✓ Espace affilié activé avec succès !");
        }
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      setIsSubmittingReg(false);
      showToast("Erreur de connexion.");
    }
  };

  // Submit product (Create or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      showToast("Veuillez remplir les champs obligatoires.");
      return;
    }

    const prix = Number(newProdPrice);
    const subscription = user.vendeurSubscription;

    if (user.role === "vendeur" && subscription) {
      if (subscription === "Offre 1") {
        if (prix < 500 || prix > 1000) {
          showToast("Votre abonnement (Offre 1) limite le prix de vos produits entre 500 FCFA et 1 000 FCFA. Veuillez modifier le prix ou changer d'abonnement.");
          return;
        }
      } else if (subscription === "Offre 2") {
        if (prix < 1001 || prix > 5000) {
          showToast("Votre abonnement (Offre 2) limite le prix de vos produits entre 1 001 FCFA et 5 000 FCFA. Veuillez modifier le prix ou changer d'abonnement.");
          return;
        }
      } else if (subscription === "Offre 3") {
        if (prix < 5001) {
          showToast("Votre abonnement (Offre 3) exige que le prix de vos produits soit supérieur ou égal à 5 001 FCFA. Veuillez modifier le prix ou changer d'abonnement.");
          return;
        }
      }
    }

    try {
      const productPayload = {
        auth: "asime2026",
        id: isEditingProduct ? isEditingProduct.id : "prod_" + Date.now().toString(),
        nom: newProdName,
        description: newProdDesc,
        prix: prix,
        stock: Number(newProdStock || 0),
        categorie: newProdCategory,
        partenaire: user.businessName || user.name,
        images: [newProdImageUrl || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80"],
        statut: "Disponible"
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(productPayload)
      });

      const data = await res.json();
      if (data.success) {
        // Refresh local products list
        if (isEditingProduct) {
          setProducts(prev => prev.map(p => p.id === isEditingProduct.id ? data.product : p));
          showToast("Produit mis à jour avec succès !");
        } else {
          setProducts(prev => [data.product, ...prev]);
          showToast("Produit publié avec succès !");
        }
        setIsAddProductOpen(false);
        setIsEditingProduct(null);
        // Reset fields
        setNewProdName("");
        setNewProdDesc("");
        setNewProdPrice("");
        setNewProdStock("");
        setNewProdImageUrl("");
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de l'enregistrement du produit.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "DELETE",
        headers: {
          "Authorization": "asime2026"
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== prodId));
        showToast("Produit supprimé !");
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de la suppression.");
    }
  };

  // Handle Withdrawal Request
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount || !withdrawalPhone) {
      showToast("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await fetch("/api/withdrawals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({
          amount: Number(withdrawalAmount),
          method: withdrawalMethod,
          phone: withdrawalPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✓ Demande de retrait de ${Number(withdrawalAmount).toLocaleString()} FCFA soumise !`);
        setWithdrawalAmount("");
        setWithdrawalPhone("");
        
        // Reload withdrawal history
        setWithdrawalHistory(prev => [data.withdrawal, ...prev]);

        // Trigger wallet reload
        fetch("/api/wallets/my-wallet", {
          headers: { "Authorization": token || "" }
        })
        .then(res => res.json())
        .then(wData => {
          if (wData.success && wData.wallet) {
            setWallet(wData.wallet);
          }
        })
        .catch(err => console.error("Error updating wallet state:", err));

        // Update local user stats available balance
        if (user.role === "affilie") {
          setUser({
            ...user,
            affiliateStats: {
              ...user.affiliateStats,
              commissionDisponible: data.userBalance
            }
          });
        } else if (user.role === "vendeur") {
          setUser({
            ...user,
            vendeurStats: {
              ...user.vendeurStats,
              revenusGeneres: data.userBalance
            }
          });
        }
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de la demande de retrait.");
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch("/api/auth/notifications/mark-read", {
        method: "POST",
        headers: { "Authorization": token || "" }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast("Notifications marquées comme lues.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit product review/evaluation
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview) return;

    try {
      const res = await fetch(`/api/products/${selectedProductForReview.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          userName: user.name
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast("✓ Merci ! Votre avis a été enregistré.");
        setIsReviewOpen(false);
        setSelectedProductForReview(null);
        setReviewComment("");
        setReviewRating(5);
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de la soumission de l'évaluation.");
    }
  };

  // Filter products matching this seller's brand
  const sellerProducts = products.filter(p => p.partenaire === (user.businessName || user.name));

  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Render help / FAQ view
  const renderHelpView = () => (
    <div className="space-y-4 text-left animate-fade-in font-sans">
      <div className="space-y-3.5">
        <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5">
          <p className="font-bold text-xs text-neutral-950">Comment acheter sur Asime Togo ?</p>
          <p className="text-[11px] text-neutral-600 leading-relaxed">Parcourez le catalogue, ajoutez des articles locaux à votre panier, puis valisez votre commande. Payez par TMoney, Flooz ou à la livraison.</p>
        </div>
        <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5">
          <p className="font-bold text-xs text-neutral-950">Comment se passe la livraison ?</p>
          <p className="text-[11px] text-neutral-600 leading-relaxed">Les colis sont préparés par nos vendeurs certifiés et livrés à domicile ou en point relais partout au Togo sous 24h à 48h.</p>
        </div>
        <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5">
          <p className="font-bold text-xs text-neutral-950">Devenir vendeur et commission d'Asime</p>
          <p className="text-[11px] text-neutral-600 leading-relaxed">Ouvrez votre boutique en 1 clic ! Asime prélève une commission de base de 10% sur chaque transaction pour faire tourner l'infrastructure et la logistique.</p>
        </div>
        <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5">
          <p className="font-bold text-xs text-neutral-950">Comment retirer ses gains d'affiliation ?</p>
          <p className="text-[11px] text-neutral-600 leading-relaxed">Dès que vous accumulez un minimum de 5 000 FCFA de commissions, soumettez une demande de retrait via TMoney ou Flooz dans votre espace affilié.</p>
        </div>
      </div>
    </div>
  );

  // Render profile editing view
  const renderProfileSettingsView = () => (
    <div className="space-y-4 text-left animate-fade-in">
      <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Nom complet</label>
          <input
            type="text"
            required
            placeholder="Ex: Hawkins Dan"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Numéro de téléphone</label>
          <input
            type="tel"
            placeholder="Ex: 90123456"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Quartier / Ville (Togo)</label>
          <input
            type="text"
            placeholder="Ex: Adidogomé, Lomé"
            value={editQuartier}
            onChange={(e) => setEditQuartier(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdatingProfile}
          className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-3 text-xs transition-all cursor-pointer rounded-none disabled:opacity-50"
        >
          {isUpdatingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );

  // Render special offers promo view
  const renderPromosView = () => {
    const coupons = [
      { code: "ASIME2026", discount: "15% de réduction", desc: "Valable sur tout le catalogue local pour célébrer le savoir-faire togolais.", expiry: "31 Déc. 2026" },
      { code: "TOGO15", discount: "Livraison gratuite", desc: "Livraison 100% offerte à Lomé pour toute commande de plus de 10 000 FCFA.", expiry: "Toujours actif" },
      { code: "MIELETERROIR", discount: "500 FCFA offerts", desc: "Applicable exclusivement sur la catégorie 'Miel' et 'Épices'.", expiry: "En cours" }
    ];

    return (
      <div className="space-y-4 text-left animate-fade-in font-sans">
        <p className="text-[11px] text-neutral-500">Copiez un code promo et saisissez-le lors de votre commande pour bénéficier de réductions immédiates.</p>
        <div className="space-y-3">
          {coupons.map((coupon, idx) => (
            <div key={idx} className="bg-[#d4af37]/5 border border-dashed border-[#d4af37]/60 p-3.5 space-y-2 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="font-mono font-black text-xs text-[#b8901c] bg-[#d4af37]/10 px-2 py-0.5 border border-[#d4af37]/30">{coupon.code}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.code);
                    showToast(`✓ Code ${coupon.code} copié !`);
                  }}
                  className="text-[9.5px] font-black uppercase text-neutral-950 hover:text-[#b8901c] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </button>
              </div>
              <div>
                <p className="font-extrabold text-neutral-950 text-xs">{coupon.discount}</p>
                <p className="text-[10.5px] text-neutral-600 mt-0.5 leading-relaxed">{coupon.desc}</p>
              </div>
              <div className="text-[9px] text-neutral-400 font-medium">Expire le : {coupon.expiry}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render favorites view
  const renderFavoritesView = () => {
    const favoriteItems = products.filter(p => p.phare).slice(0, 5);

    return (
      <div className="space-y-4 text-left animate-fade-in font-sans">
        <p className="text-[11px] text-neutral-500">Retrouvez ici vos articles locaux préférés d'Asime Togo pour les ajouter à votre panier à tout moment.</p>
        {favoriteItems.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50 border border-neutral-200">
            <Gift className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">Aucun produit favori enregistré.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {favoriteItems.map((item) => (
              <div key={item.id} className="bg-neutral-50 border border-neutral-200 p-3 flex gap-3 items-center">
                <img src={item.images?.[0]} alt={item.nom} className="w-12 h-12 object-cover border border-neutral-100 shrink-0 animate-fade-in" referrerPolicy="no-referrer" />
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-xs text-neutral-900 truncate">{item.nom}</p>
                  <p className="font-mono text-[10.5px] text-[#b8901c] font-bold mt-0.5">{formatFCFA(item.prix)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectProduct(item);
                    closeDrawer();
                  }}
                  className="bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 text-[9px] font-black uppercase tracking-wider py-1.5 px-3 rounded-none cursor-pointer shrink-0 transition-colors"
                >
                  Voir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (currentView === "menu") {
    const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "A";
    
    return (
      <div className="flex flex-col h-full bg-white select-none animate-fade-in text-left">
        {/* Curved/Styled Profile Header (matching light-blue style) */}
        <div className="p-4 bg-[#e9f0fa] m-4 rounded-xl flex items-center gap-3.5 border border-[#d2dfef]">
          {/* Olive-green circle avatar like the mockup */}
          <div className="w-12 h-12 rounded-full bg-emerald-700/85 flex items-center justify-center text-white text-base font-black border-2 border-white shadow-sm shrink-0">
            {userInitial}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-neutral-900 leading-tight">
              {user?.name || "Utilisateur local"}
            </h4>
            <button
              type="button"
              onClick={() => setCurrentView("profile_settings")}
              className="text-[11px] font-bold text-sky-800 hover:text-sky-950 underline mt-1 block cursor-pointer bg-transparent border-0 p-0 text-left"
            >
              Voir votre profil / Modifier
            </button>
          </div>
        </div>

        {/* Menu rows list - clean with borders and icons */}
        <div className="px-4 flex-grow space-y-0.5 overflow-y-auto">
          {/* Row 1: Achats et avis */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("client");
              setActiveTab("client");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Truck className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Achats et avis</span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 2: Messages */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("notifications");
              setActiveTab("notifications");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <MessageSquare className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Messages</span>
            {unreadNotifs > 0 && (
              <span className="bg-[#b8901c] text-white text-[9px] font-black rounded-full px-2 py-0.5 ml-2">
                {unreadNotifs}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 3: Solde du crédit */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("affilie");
              setActiveTab("affilie");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Wallet className="w-5 h-5 text-neutral-800 shrink-0" />
            <div className="flex-grow">
              <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Solde du crédit : </span>
              <span className="text-xs font-black text-emerald-700 ml-1 font-mono">
                {formatFCFA(user?.revenusGeneres || 0)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          {/* Row 4: Offres spéciales */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("promos");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Tag className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Offres spéciales</span>
            <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-[#b8901c] px-1.5 py-0.5 rounded-sm ml-2">
              Coupons
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 5: Liste de cadeaux */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("favorites");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <Gift className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">Liste de cadeaux & favoris</span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Row 6: Vendre sur Asime */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("vendeur");
              setActiveTab("vendeur");
            }}
            className="w-full py-3.5 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100/75 cursor-pointer text-left bg-transparent rounded-none"
          >
            <ShoppingBag className="w-5 h-5 text-neutral-800 shrink-0" />
            <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">
              {user?.role === "vendeur" ? "Tableau de bord Vendeur" : "Vendre sur Asime"}
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
          </button>

          {/* Section Divider */}
          <div className="h-[1px] bg-neutral-200/80 my-3"></div>

          {/* Row 7: Centre d'aide */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("help");
            }}
            className="w-full py-3 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors cursor-pointer text-left bg-transparent rounded-none"
          >
            <HelpCircle className="w-4.5 h-4.5 text-neutral-600 shrink-0" />
            <span className="text-[11.5px] font-semibold text-neutral-700 font-sans">Centre d'aide</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
          </button>

          {/* Row 8: Paramètres du compte */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("profile_settings");
            }}
            className="w-full py-3 px-3 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors cursor-pointer text-left bg-transparent rounded-none"
          >
            <Settings className="w-4.5 h-4.5 text-neutral-600 shrink-0" />
            <span className="text-[11.5px] font-semibold text-neutral-700 font-sans">Paramètres du compte</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
          </button>

          {/* Row 9: Se déconnecter */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              closeDrawer();
            }}
            className="w-full py-3 px-3 flex items-center gap-3.5 hover:bg-red-50 text-neutral-700 hover:text-red-700 transition-colors cursor-pointer text-left bg-transparent rounded-none"
          >
            <LogOut className="w-4.5 h-4.5 text-neutral-600 shrink-0" />
            <span className="text-[11.5px] font-semibold font-sans">Se déconnecter</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
          </button>
        </div>

        {/* Footer info matching footer height styling */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 text-center select-none text-[10px] text-neutral-400 font-medium">
          Asime Togo © {new Date().getFullYear()} – Le local, notre fierté
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Dynamic Back Header */}
      <div className="flex items-center gap-2 p-3 bg-neutral-50 border-b border-neutral-200 text-left shrink-0 select-none">
        <button
          type="button"
          onClick={() => setCurrentView("menu")}
          className="px-2.5 py-1.5 hover:bg-neutral-200 text-neutral-800 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border border-neutral-200 bg-white shadow-xs rounded-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour</span>
        </button>
        <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest ml-2">
          {currentView === "client" && "Achats et avis"}
          {currentView === "vendeur" && "Espace Vendeur"}
          {currentView === "affilie" && "Espace Affilié"}
          {currentView === "notifications" && "Messages & Alertes"}
          {currentView === "help" && "Centre d'aide"}
          {currentView === "profile_settings" && "Paramètres du compte"}
          {currentView === "promos" && "Offres spéciales"}
          {currentView === "favorites" && "Ma Liste de cadeaux"}
        </span>
      </div>

      {/* Tab Panels */}
      <div className="flex-grow overflow-y-auto p-5 space-y-6">
        {/* Render Help, Settings, Promos, and Favorites */}
        {currentView === "help" && renderHelpView()}
        {currentView === "profile_settings" && renderProfileSettingsView()}
        {currentView === "promos" && renderPromosView()}
        {currentView === "favorites" && renderFavoritesView()}

        {/* TAB 1: CLIENT TAB */}
        {activeTab === "client" && currentView === "client" && (
          <div className="space-y-6 animate-fade-in">
            {/* Tracking / Orders List */}
            <div>
              <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#d4af37]" />
                <span>Suivi de mes commandes ({clientOrders.length})</span>
              </h4>

              {clientOrders.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 border border-neutral-200">
                  <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">Vous n'avez pas encore passé de commande.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {clientOrders.map((order) => (
                    <div key={order.id} className="bg-neutral-50 border border-neutral-200 p-4 space-y-3">
                      <div className="flex justify-between items-start border-b border-neutral-200 pb-2">
                        <div>
                          <p className="text-[10px] font-bold text-neutral-950 uppercase tracking-wider">COMMANDE #{order.id}</p>
                          <p className="text-[9px] text-neutral-400 font-mono">{new Date(order.createdAt).toLocaleDateString("fr-FR")} à {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-neutral-900">{formatFCFA(order.totalAmount)}</p>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 inline-block mt-1 ${
                            order.paymentStatus === "Validé" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            Paiement : {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-neutral-700">
                            <span className="line-clamp-1 flex-grow">
                              {item.product.nom} <strong className="text-neutral-400 font-medium">x{item.quantity}</strong>
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[11px] shrink-0">{formatFCFA(item.product.prix * item.quantity)}</span>
                              <button
                                onClick={() => {
                                  setSelectedProductForReview(item.product);
                                  setIsReviewOpen(true);
                                }}
                                className="text-[9.5px] font-extrabold text-[#b8901c] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                                Avis
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Status Tracker */}
                      <div className="bg-white p-2.5 border border-neutral-150 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#d4af37]" />
                        <div className="flex-grow">
                          <p className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Statut de la livraison</p>
                          <p className="text-xs font-extrabold text-neutral-800 mt-1">{order.orderStatus || "En cours de préparation"}</p>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SELLER TAB */}
        {activeTab === "vendeur" && currentView === "vendeur" && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. PENDING ACTIVATION STATUS SCREEN */}
            {user.vendeurStatus === "En attente d'activation" ? (
              <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-6 text-left">
                <div className="text-center pb-4 border-b border-neutral-200">
                  <Clock className="w-14 h-14 text-amber-500 mx-auto mb-3 animate-pulse" />
                  <h4 className="text-sm font-black text-neutral-950 uppercase tracking-wider">Inscription Reçue - En attente d'activation</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-md mx-auto mt-2 font-sans">
                    Votre compte vendeur pour la boutique <strong className="text-neutral-900">{user.businessName || "votre boutique"}</strong> a été créé avec succès. Il est actuellement en attente d'activation par notre équipe.
                  </p>
                </div>

                <div className="space-y-4 font-sans text-xs text-neutral-700">
                  <div className="bg-white p-4 border border-neutral-200 space-y-3">
                    <p className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider text-[#b8901c]">Détails de l'abonnement</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-neutral-400">Offre choisie:</span>
                        <p className="font-extrabold text-neutral-950">{user.vendeurSubscription || "Offre 1"}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Montant dû:</span>
                        <p className="font-extrabold text-neutral-950">
                          {user.vendeurSubscription === "Offre 3" ? "5 000" : user.vendeurSubscription === "Offre 2" ? "3 000" : "1 000"} FCFA / mois
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Moyen de paiement:</span>
                        <p className="font-extrabold text-neutral-950">{user.vendeurPaymentMethod || "TMoney"}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400">ID Référence:</span>
                        <p className="font-mono font-extrabold text-neutral-950">{user.vendeurPaymentTxId || "Non spécifié"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200/60 p-4 space-y-2 text-[11px]">
                    <p className="font-bold text-neutral-950 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Instruction de validation d'activation</span>
                    </p>
                    <p className="leading-relaxed">
                      Veuillez transférer les frais d'abonnement mensuels au numéro administratif d'Asime Togo:
                    </p>
                    <p className="font-mono font-bold text-neutral-950 bg-white p-2 border border-amber-200 inline-block">
                      {user.vendeurPaymentMethod === "Flooz" ? "Flooz : +228 99 12 34 56" : "TMoney : +228 90 12 34 56"}
                    </p>
                    <p className="leading-relaxed">
                      Dès réception du transfert, votre compte sera activé et vous recevrez une notification. Pour accélérer ou simuler l'activation instantanée en mode test, cliquez sur le bouton de confirmation ci-dessous.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRoleUpgrade("vendeur", { action: "confirm_payment" })}
                  disabled={isSubmittingReg}
                  className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-3 text-xs transition-all cursor-pointer rounded-none disabled:opacity-50"
                >
                  {isSubmittingReg ? "Validation en cours..." : "Simuler la confirmation du paiement (Admin)"}
                </button>
              </div>
            ) : user.role !== "vendeur" ? (
              /* 2. ETYS-STYLE 5-STEP SELLER REGISTRATION WIZARD */
              <div className="bg-neutral-50 border border-neutral-200 p-5 space-y-6 text-left animate-fade-in">
                {/* Steps Header Progress */}
                <div className="border-b border-neutral-200 pb-5 mb-5 select-none">
                  <div className="flex items-center justify-between text-center relative max-w-lg mx-auto">
                    {/* Progress Bar background line */}
                    <div className="absolute top-[14px] left-[5%] right-[5%] h-[2px] bg-neutral-200 z-0" />
                    
                    {/* Step item: Preferences */}
                    <button
                      type="button"
                      onClick={() => setVendeurStep("preferences")}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "preferences"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["name", "stock", "payout", "activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200 group-hover:border-neutral-400"
                      }`}>
                        {["name", "stock", "payout", "activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "1"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "preferences" ? "text-neutral-900" : "text-neutral-400"}`}>Préférences</span>
                    </button>

                    {/* Step item: Name */}
                    <button
                      type="button"
                      onClick={() => { if (shopLanguage) setVendeurStep("name"); }}
                      disabled={!shopLanguage}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "name"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["stock", "payout", "activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        {["stock", "payout", "activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "2"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "name" ? "text-neutral-900" : "text-neutral-400"}`}>Nom de la boutique</span>
                    </button>

                    {/* Step item: Stock */}
                    <button
                      type="button"
                      onClick={() => { if (businessName && businessName.trim().length >= 4) setVendeurStep("stock"); }}
                      disabled={!businessName || businessName.trim().length < 4}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "stock"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["payout", "activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        {["payout", "activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "3"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "stock" ? "text-neutral-900" : "text-neutral-400"}`}>Fiche produit</span>
                    </button>

                    {/* Step item: Payout */}
                    <button
                      type="button"
                      onClick={() => { if (businessName && firstListingName) setVendeurStep("payout"); }}
                      disabled={!businessName || !firstListingName}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "payout"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : ["activation"].includes(vendeurStep)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        {["activation"].includes(vendeurStep) ? <Check className="w-3.5 h-3.5" /> : "4"}
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "payout" ? "text-neutral-900" : "text-neutral-400"}`}>Facturation</span>
                    </button>

                    {/* Step item: Activation */}
                    <button
                      type="button"
                      disabled={!businessName || !firstListingName || !sellerPayoutNumber}
                      onClick={() => { if (businessName && firstListingName && sellerPayoutNumber) setVendeurStep("activation"); }}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        vendeurStep === "activation"
                          ? "bg-[#f56a3f] text-white border-[#f56a3f] shadow-sm"
                          : "bg-white text-neutral-400 border-neutral-200"
                      }`}>
                        5
                      </div>
                      <span className={`text-[9.5px] font-extrabold tracking-tight mt-1.5 transition-colors ${vendeurStep === "activation" ? "text-neutral-900" : "text-neutral-400"}`}>Activation</span>
                    </button>
                  </div>
                </div>

                {/* STEP 1: SHOP PREFERENCES */}
                {vendeurStep === "preferences" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Globe className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Préférences de votre boutique</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Commençons par configurer les paramètres généraux de votre vitrine locale sur notre place de marché.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Langue de la boutique</label>
                        <select
                          value={shopLanguage}
                          onChange={(e) => setShopLanguage(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                        >
                          <option value="Français (FR)">Français (FR)</option>
                          <option value="English (EN)">English (EN)</option>
                          <option value="Ewe (EE)">Ewe (Éwé)</option>
                          <option value="Kabyè (KB)">Kabyè</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Pays de la boutique</label>
                        <select
                          value={shopCountry}
                          onChange={(e) => setShopCountry(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                        >
                          <option value="Togo (TG)">Togo (TG)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Devise principale</label>
                        <select
                          value={shopCurrency}
                          onChange={(e) => setShopCurrency(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                        >
                          <option value="FCFA (XOF)">Franc CFA (XOF)</option>
                        </select>
                      </div>

                      <div className="bg-[#f56a3f]/5 border border-[#f56a3f]/25 p-3.5 text-[10.5px] leading-relaxed text-neutral-600">
                        <p className="font-extrabold text-[#d24c22] mb-0.5">Note importante :</p>
                        Asime Togo promeut l'économie locale et le savoir-faire togolais. Le pays de votre boutique est configuré par défaut sur le <strong>Togo</strong> pour optimiser le routage de livraison et garantir l'authenticité de nos produits du terroir.
                      </div>

                      <button
                        type="button"
                        onClick={() => setVendeurStep("name")}
                        className="w-full bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-widest py-3 text-xs transition-colors cursor-pointer rounded-none"
                      >
                        Continuer vers le nom de la boutique
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: NAME YOUR SHOP */}
                {vendeurStep === "name" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Tag className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Trouvez un nom original</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Saisissez un nom unique qui décrit parfaitement vos articles artisanaux. Pas d'espaces ni de caractères spéciaux.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Nom de votre boutique / Marque</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Savoir-Faire-Togo"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-bold"
                        />
                      </div>

                      {/* Dynamic Real-time Verification Box */}
                      <div className="p-3 border text-xs leading-relaxed transition-all">
                        {businessName.trim() === "" ? (
                          <div className="text-neutral-500 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>En attente de saisie... (4 à 20 caractères, lettres, chiffres et tirets uniquement)</span>
                          </div>
                        ) : businessName.trim().length < 4 ? (
                          <div className="text-red-600 font-bold flex items-center gap-1.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Trop court ! Le nom doit contenir au moins 4 caractères.</span>
                          </div>
                        ) : businessName.trim().length > 20 ? (
                          <div className="text-red-600 font-bold flex items-center gap-1.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Trop long ! Le nom ne doit pas dépasser 20 caractères.</span>
                          </div>
                        ) : !/^[a-zA-Z0-9\-]+$/.test(businessName) ? (
                          <div className="text-red-600 font-bold flex items-center gap-1.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <span>Invalide ! Pas d'espaces, d'accents ou de caractères spéciaux. Utilisez des tirets (-).</span>
                          </div>
                        ) : (
                          <div className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>✓ Disponible ! "{businessName}" est conforme aux critères de référencement.</span>
                          </div>
                        )}
                      </div>

                      {/* Suggestions list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Suggestions de rechange :</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            businessName ? `${businessName}-Togo` : "Artisanat-Lome",
                            businessName ? `${businessName}-Nature` : "Terroir-Togolais",
                            "Savoir-Faire-228",
                            "Epi-Togo"
                          ].map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setBusinessName(suggestion)}
                              className="text-[10px] font-bold bg-neutral-100 hover:bg-[#f56a3f]/10 text-neutral-700 hover:text-[#d24c22] border border-neutral-200 hover:border-[#f56a3f]/30 px-2 py-1 transition-colors cursor-pointer"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mode de vente */}
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Mode de vente préféré</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setVendeurMode("autonome")}
                            className={`p-3 border text-left rounded-none cursor-pointer transition-all ${
                              vendeurMode === "autonome" 
                                ? "border-neutral-900 bg-white shadow-xs" 
                                : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50"
                            }`}
                          >
                            <p className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Mode Autonome</p>
                            <p className="text-[9.5px] text-neutral-500 leading-relaxed mt-1 font-sans">Vous gérez vous-même vos expéditions et fiches.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVendeurMode("assiste")}
                            className={`p-3 border text-left rounded-none cursor-pointer transition-all ${
                              vendeurMode === "assiste" 
                                ? "border-neutral-900 bg-white shadow-xs" 
                                : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50"
                            }`}
                          >
                            <p className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Mode Assisté</p>
                            <p className="text-[9.5px] text-neutral-500 leading-relaxed mt-1 font-sans">L'équipe logistique d'Asime prend en charge la livraison.</p>
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setVendeurStep("preferences")}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                        >
                          Retour
                        </button>
                        <button
                          type="button"
                          disabled={!businessName || businessName.trim().length < 4 || !/^[a-zA-Z0-9\-]+$/.test(businessName)}
                          onClick={() => setVendeurStep("stock")}
                          className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: STOCK YOUR SHOP / CREATE A LISTING */}
                {vendeurStep === "stock" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <ShoppingBag className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Remplissez votre boutique</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Vous devez ajouter au moins un premier produit à votre vitrine pour finaliser l'inscription.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Interactive Form */}
                      <div className="space-y-3.5 bg-white p-4 border border-neutral-200">
                        <p className="font-extrabold text-[10.5px] uppercase text-neutral-800 tracking-wider border-b border-neutral-100 pb-1.5">Détails de l'article</p>
                        
                        <div>
                          <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Nom de l'article</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Miel Sauvage d'Atakpamé"
                            value={firstListingName}
                            onChange={(e) => setFirstListingName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Prix de vente (FCFA)</label>
                            <input
                              type="number"
                              required
                              placeholder="Ex: 3500"
                              value={firstListingPrice}
                              onChange={(e) => setFirstListingPrice(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Catégorie</label>
                            <select
                              value={firstListingCategory}
                              onChange={(e) => setFirstListingCategory(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                            >
                              <option value="Made in Togo Premium">Made in Togo Premium</option>
                              <option value="Paniers Frais & Épicerie">Paniers Frais & Épicerie</option>
                              <option value="Vêtements & Mode">Vêtements & Mode</option>
                              <option value="Chaussures Premium">Chaussures Premium</option>
                              <option value="Montres & Accessoires">Montres & Accessoires</option>
                              <option value="Plats & Gastronomie">Plats & Gastronomie</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Description du produit</label>
                          <textarea
                            rows={2}
                            placeholder="Décrivez les ingrédients locaux, le processus de fabrication, etc."
                            value={firstListingDesc}
                            onChange={(e) => setFirstListingDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 resize-none"
                          />
                        </div>

                        {/* Pre-defined beautiful local images gallery picker */}
                        <div className="space-y-1.5">
                          <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest">Sélectionner une image locale d'illustration :</label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[
                              { label: "Miel", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400" },
                              { label: "Chocolat", url: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=400" },
                              { label: "Épices", url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400" },
                              { label: "Kente", url: "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=400" },
                              { label: "Savon", url: "https://images.unsplash.com/photo-1607006342411-91f11c888fae?auto=format&fit=crop&q=80&w=400" }
                            ].map((galleryItem, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFirstListingImageUrl(galleryItem.url)}
                                className={`h-11 border transition-all relative overflow-hidden rounded-none cursor-pointer ${firstListingImageUrl === galleryItem.url ? "border-[#f56a3f] ring-1 ring-[#f56a3f]" : "border-neutral-200"}`}
                              >
                                <img src={galleryItem.url} alt={galleryItem.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </button>
                            ))}
                          </div>
                          <div className="pt-1.5">
                            <span className="text-[9px] text-neutral-400">Ou saisir l'adresse URL d'une image personnalisée :</span>
                            <input
                              type="text"
                              placeholder="Ex: https://image.com/mon-produit.jpg"
                              value={firstListingImageUrl}
                              onChange={(e) => setFirstListingImageUrl(e.target.value)}
                              className="w-full px-2 py-1 text-[10px] border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 mt-1 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Real-time Listing Card Preview */}
                      <div className="flex flex-col justify-center items-center bg-[#fdfaf5] p-4 border border-dashed border-amber-200/80">
                        <span className="text-[9.5px] font-black uppercase tracking-widest text-[#b8901c] mb-2.5 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aperçu de la fiche produit (Style Asime)</span>
                        </span>

                        <div className="w-[190px] bg-white border border-neutral-200/80 shadow-xs hover:shadow-md transition-all duration-300">
                          {/* Card image container */}
                          <div className="w-full h-[140px] bg-neutral-100 overflow-hidden relative">
                            <img
                              src={firstListingImageUrl || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400"}
                              alt="Preview item"
                              className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-1.5 left-1.5 bg-[#f56a3f] text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider">Nouveau</span>
                          </div>

                          {/* Card contents */}
                          <div className="p-3 text-left space-y-1">
                            <p className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest truncate">Boutique : {businessName || "Ma Boutique"}</p>
                            <h5 className="font-bold text-neutral-800 text-[11px] font-sans line-clamp-1 truncate h-[16px] leading-tight">
                              {firstListingName || "Titre de votre premier produit"}
                            </h5>
                            
                            {/* Review mock stars like our rating style */}
                            <div className="flex items-center gap-1">
                              <span className="text-amber-500 text-[10px] tracking-tight">★★★★★</span>
                              <span className="text-[9px] text-neutral-400">(4.9)</span>
                            </div>

                            <p className="font-mono text-xs text-[#b8901c] font-black mt-0.5">
                              {firstListingPrice ? formatFCFA(Number(firstListingPrice)) : "0 FCFA"}
                            </p>

                            <span className="inline-block bg-[#d4af37]/10 text-[#a07c10] border border-[#d4af37]/25 text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-xs mt-1.5">
                              {firstListingCategory}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setVendeurStep("name")}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        disabled={!firstListingName || !firstListingPrice}
                        onClick={() => setVendeurStep("payout")}
                        className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                      >
                        Suivant : Facturation & Reversements
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PAYOUT SETTINGS (HOW YOU'LL GET PAID) */}
                {vendeurStep === "payout" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Wallet className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Facturation & Reversements</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Pour que les clients d'Asime puissent vous payer en toute sécurité, configurez votre moyen préféré de reversement automatique des fonds.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Operator selection */}
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Moyen de reversement</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: "TMoney", label: "TMoney (Mobile)" },
                            { value: "Flooz", label: "Flooz (Mobile)" },
                            { value: "Virement", label: "Virement Bancaire" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setSellerPayoutType(opt.value as any)}
                              className={`p-2 border text-center text-[10.5px] rounded-none cursor-pointer transition-all ${
                                sellerPayoutType === opt.value
                                  ? "border-neutral-950 bg-white font-bold text-neutral-950 shadow-xs"
                                  : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50 text-neutral-500"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Money Details */}
                      {(sellerPayoutType === "TMoney" || sellerPayoutType === "Flooz") && (
                        <div className="space-y-3 bg-white p-3 border border-neutral-200">
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                              Numéro de téléphone {sellerPayoutType} (Togo)
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="Ex: 90123456"
                              value={sellerPayoutNumber}
                              onChange={(e) => setSellerPayoutNumber(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                              Nom complet enregistré sur la carte SIM
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Dan Hawkins"
                              className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* Bank Account Details */}
                      {sellerPayoutType === "Virement" && (
                        <div className="space-y-3 bg-white p-3 border border-neutral-200">
                          <div>
                            <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Nom de la Banque</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: ECOBANK, ORABANK, UTB"
                              className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Titulaire du compte</label>
                              <input
                                type="text"
                                required
                                placeholder="Nom complet"
                                className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Numéro de compte / RIB</label>
                              <input
                                type="text"
                                required
                                placeholder="TG001-02030..."
                                value={sellerPayoutNumber}
                                onChange={(e) => setSellerPayoutNumber(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-neutral-100 p-3.5 border border-neutral-200/60 text-[10.5px] text-neutral-600 leading-relaxed flex items-center gap-2">
                        <Lock className="w-5 h-5 text-neutral-400 shrink-0" />
                        <span>Vos informations de reversement bancaire et de compte mobile money sont hautement sécurisées, cryptées, et uniquement utilisées pour transférer vos commissions de vente.</span>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setVendeurStep("stock")}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                        >
                          Retour
                        </button>
                        <button
                          type="button"
                          disabled={!sellerPayoutNumber}
                          onClick={() => setVendeurStep("activation")}
                          className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                        >
                          Suivant : Formules & Activation
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: PLAN, CGU & ACTIVATION */}
                {vendeurStep === "activation" && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-center py-1">
                      <Coins className="w-10 h-10 text-[#f56a3f] mx-auto mb-2" />
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">Abonnement & Activation d'Asime</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed max-w-sm mx-auto">
                        Sélectionnez votre formule mensuelle pour finaliser votre ouverture de boutique.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Subscription List */}
                      {[
                        { key: "Offre 1", title: "Offre 1 (Basique)", price: "1 000 FCFA", desc: "Idéal pour les petits artisans locaux.", limits: "Articles entre 500 et 1 000 FCFA" },
                        { key: "Offre 2", title: "Offre 2 (Standard)", price: "3 000 FCFA", desc: "Pour les boutiques d'alimentation et vêtements.", limits: "Articles entre 1 001 et 5 000 FCFA" },
                        { key: "Offre 3", title: "Offre 3 (Premium)", price: "5 000 FCFA", desc: "Formule illimitée pour les grandes vitrines locales.", limits: "Articles au-delà de 5 000 FCFA" }
                      ].map((plan) => (
                        <button
                          key={plan.key}
                          type="button"
                          onClick={() => setSelectedSubscription(plan.key as any)}
                          className={`w-full p-3 border text-left cursor-pointer transition-all flex justify-between items-center ${
                            selectedSubscription === plan.key
                              ? "border-[#f56a3f] bg-[#f56a3f]/5 ring-1 ring-[#f56a3f]"
                              : "border-neutral-200 bg-white hover:bg-neutral-50"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-black text-neutral-950 uppercase tracking-wide">{plan.title}</p>
                            <p className="text-[9.5px] text-neutral-500 mt-0.5">{plan.desc}</p>
                            <p className="text-[10px] font-extrabold text-[#d24c22] mt-1">{plan.limits}</p>
                          </div>
                          <span className="font-mono text-xs font-black text-[#d24c22] shrink-0">{plan.price} / mois</span>
                        </button>
                      ))}
                    </div>

                    {/* Operator transfer instructions */}
                    <div className="bg-[#f56a3f]/5 border border-[#f56a3f]/25 p-3.5 space-y-2 text-neutral-700">
                      <p className="font-bold text-[10.5px] text-neutral-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-[#f56a3f]" />
                        <span>Consignes de transfert d'activation</span>
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        Effectuez un transfert de <strong>{selectedSubscription === "Offre 3" ? "5 000" : selectedSubscription === "Offre 2" ? "3 000" : "1 000"} FCFA</strong> vers notre compte mobile :
                      </p>
                      <div className="bg-white p-2 border border-neutral-200 inline-block font-mono text-xs font-black text-neutral-900">
                        {paymentMethod === "Flooz" ? "Flooz : +228 99 12 34 56" : "TMoney : +228 90 12 34 56"}
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        Saisissez ci-dessous la référence de la transaction reçue par SMS pour valider votre demande d'activation.
                      </p>
                    </div>

                    {/* Transaction Reference ID Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">ID de transaction (Référence SMS)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: TXN8974512 ou Ref de paiement"
                        value={paymentTxId}
                        onChange={(e) => setPaymentTxId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono font-bold"
                      />
                    </div>

                    {/* Operator Select (TMoney vs Flooz) */}
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Opérateur pour le transfert</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("TMoney")}
                          className={`p-2.5 border text-center text-xs rounded-none cursor-pointer transition-all ${
                            paymentMethod === "TMoney" 
                              ? "border-neutral-950 bg-white font-bold text-neutral-950" 
                              : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50 text-neutral-500"
                          }`}
                        >
                          TMoney
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Flooz")}
                          className={`p-2.5 border text-center text-xs rounded-none cursor-pointer transition-all ${
                            paymentMethod === "Flooz" 
                              ? "border-neutral-950 bg-white font-bold text-neutral-950" 
                              : "border-neutral-200 bg-neutral-100 hover:bg-neutral-50 text-neutral-500"
                          }`}
                        >
                          Flooz
                        </button>
                      </div>
                    </div>

                    {/* CGU Terms of Sale checkbox */}
                    <div className="bg-white p-3 border border-neutral-200 max-h-36 overflow-y-auto text-[10.5px] text-neutral-600 space-y-2.5 leading-relaxed font-sans">
                      <p className="font-extrabold text-neutral-950 text-[10px] uppercase tracking-wide mb-1 border-b border-neutral-100 pb-1">Conditions de Vente de la Marketplace Asime</p>
                      <p><strong>Charte du Made in Togo :</strong> En vous inscrivant comme vendeur, vous certifiez sur l'honneur que tous vos articles sont confectionnés, transformés, récoltés ou fabriqués au Togo. Les produits importés de l'étranger ou contrefaits sont strictement interdits.</p>
                      <p><strong>Commission &amp; Paiement :</strong> Asime prélève une commission de 10% sur chaque commande pour assurer la coordination, le service client et la passerelle de paiement. Vos fonds de ventes vous sont reversés sous 24h ouvrées.</p>
                    </div>

                    <div className="flex items-start gap-2 pt-1 select-none">
                      <input
                        id="cgu_check"
                        type="checkbox"
                        checked={acceptedCGU}
                        onChange={(e) => setAcceptedCGU(e.target.checked)}
                        className="mt-0.5 cursor-pointer h-4 w-4 border-neutral-300 rounded"
                      />
                      <label htmlFor="cgu_check" className="text-[11px] font-sans text-neutral-800 leading-snug cursor-pointer select-none">
                        J’accepte la charte d'authenticité, les conditions générales d’Asime et confirme avoir effectué le transfert.
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setVendeurStep("payout")}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center"
                      >
                        Retour
                      </button>
                      <button
                        type="button"
                        disabled={!acceptedCGU || !paymentTxId.trim() || isSubmittingReg}
                        onClick={() => {
                          if (!paymentTxId.trim()) {
                            showToast("Veuillez saisir le numéro de transaction.");
                            return;
                          }
                          // Set sellerPhone before submit so the payload inherits it correctly
                          setSellerPhone(sellerPayoutNumber);
                          handleRoleUpgrade("vendeur");
                        }}
                        className="bg-neutral-950 hover:bg-[#f56a3f] text-white font-black uppercase tracking-wider py-2.5 text-[10px] transition-all rounded-none cursor-pointer text-center disabled:opacity-40"
                      >
                        {isSubmittingReg ? "Inscription..." : "Créer ma boutique Asime"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ACTIVE SELLER SPACE */
              <SellerWorkspace
                user={user}
                setUser={setUser}
                token={token}
                products={products}
                setProducts={setProducts}
                showToast={showToast}
                formatFCFA={formatFCFA}
                wallet={wallet}
                withdrawalHistory={withdrawalHistory}
                onWithdrawalRequest={async (amount, method, phone) => {
                  if (!amount || !phone) {
                    showToast("Veuillez remplir tous les champs.");
                    return;
                  }
                  try {
                    const res = await fetch("/api/withdrawals/create", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": token || ""
                      },
                      body: JSON.stringify({
                        amount: Number(amount),
                        method,
                        phone
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      showToast(`✓ Demande de retrait de ${Number(amount).toLocaleString()} FCFA soumise !`);
                      setWithdrawalHistory(prev => [data.withdrawal, ...prev]);
                      const wRes = await fetch("/api/wallets/my-wallet", {
                        headers: { "Authorization": token || "" }
                      });
                      const wData = await wRes.json();
                      if (wData.success) {
                        setWallet(wData.wallet);
                      }
                    } else {
                      showToast(`Erreur : ${data.error}`);
                    }
                  } catch (err) {
                    showToast("Erreur lors de la demande de retrait.");
                  }
                }}
                handleProductSubmit={handleProductSubmit}
                handleDeleteProduct={handleDeleteProduct}
                isAddProductOpen={isAddProductOpen}
                setIsAddProductOpen={setIsAddProductOpen}
                isEditingProduct={isEditingProduct}
                setIsEditingProduct={setIsEditingProduct}
                newProdName={newProdName}
                setNewProdName={setNewProdName}
                newProdDesc={newProdDesc}
                setNewProdDesc={setNewProdDesc}
                newProdPrice={newProdPrice}
                setNewProdPrice={setNewProdPrice}
                newProdStock={newProdStock}
                setNewProdStock={setNewProdStock}
                newProdCategory={newProdCategory}
                setNewProdCategory={setNewProdCategory}
                newProdImageUrl={newProdImageUrl}
                setNewProdImageUrl={setNewProdImageUrl}
                categories={categories}
              />
            )}
          </div>
        )}

        {/* TAB 3: AFFILIATE TAB */}
        {activeTab === "affilie" && currentView === "affilie" && (
          <div className="space-y-6 animate-fade-in text-left">
            {user.role !== "affilie" ? (
              <div className="bg-neutral-50 border border-neutral-200 p-5 space-y-4">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-[#d4af37] mx-auto mb-2" />
                  <h4 className="text-sm font-black text-neutral-950 uppercase tracking-wider">Programme d'Affiliation Local Asime</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto mt-2 font-sans">
                    Recommandez les produits de nos artisans locaux, partagez votre lien d'affiliation unique et gagnez <strong className="text-neutral-950">3% de commission</strong> sur chaque vente validée !
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 text-amber-900 rounded-sm font-sans text-xs">
                  <strong>💡 Comment ça fonctionne ?</strong>
                  <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                    <li>Activez votre espace affilié ci-dessous.</li>
                    <li>Copiez et partagez votre lien d'affiliation.</li>
                    <li>Un cookie est stocké sur l'ordinateur de l'acheteur pour 30 jours.</li>
                    <li>Retirez vos commissions via TMoney ou Flooz dès 5 000 FCFA.</li>
                  </ol>
                </div>

                <button
                  onClick={() => handleRoleUpgrade("affilie")}
                  className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-3 text-xs transition-all cursor-pointer rounded-none"
                >
                  Activer mon compte d'affilié
                </button>
              </div>
            ) : (
              /* ACTIVE AFFILIATE USER AREA */
              <div className="space-y-6">
                
                {/* Affiliate Link display */}
                <div className="bg-neutral-950 text-white p-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-[#d4af37]" />
                    <h5 className="font-display font-extrabold text-xs uppercase tracking-wider text-white">Mon Lien de Promotion Unique</h5>
                  </div>
                  <p className="text-[9px] text-neutral-400 font-sans">Partagez ce lien à vos partenaires ou abonnés pour percevoir 3% sur leurs paniers :</p>
                  
                  <div className="flex bg-neutral-900 border border-neutral-800 p-1.5 items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono text-[#d4af37] truncate flex-grow">
                      {window.location.origin}/?ref={user.affiliateCode}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="bg-white hover:bg-[#d4af37] text-neutral-950 hover:text-neutral-950 p-2 font-bold transition-all shrink-0 cursor-pointer rounded-sm"
                      title="Copier le lien"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Nombre de Clics / Visites</span>
                    <p className="text-lg font-mono font-black text-neutral-950 mt-1">{user.affiliateStats?.clicks || 0}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Ventes parrainées</span>
                    <p className="text-lg font-mono font-black text-neutral-950 mt-1">{user.affiliateStats?.ventes || 0}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Commissions acquises</span>
                    <p className="text-lg font-mono font-black text-neutral-950 mt-1">{formatFCFA(user.affiliateStats?.commissionsGagnees || 0)}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Solde Disponible</span>
                    <p className="text-lg font-mono font-black text-[#b8901c] mt-1">{formatFCFA(user.affiliateStats?.commissionDisponible || 0)}</p>
                  </div>
                </div>

                {/* Real Wallet Ledger Component */}
                <WalletSection wallet={wallet} formatFCFA={formatFCFA} />

                {/* Affiliate Withdrawals Form */}
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-none text-left space-y-4">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-[#b8901c]" />
                    <span>Retirer mes commissions d'affiliation</span>
                  </h4>

                  <form onSubmit={handleWithdrawalRequest} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Montant (Min 5 000 F)</label>
                        <input
                          type="number"
                          required
                          placeholder="Ex: 5000"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Réseau mobile</label>
                        <select
                          value={withdrawalMethod}
                          onChange={(e) => setWithdrawalMethod(e.target.value as "TMoney" | "Flooz")}
                          className="w-full px-2 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-semibold"
                        >
                          <option value="TMoney">TMoney (Togocel)</option>
                          <option value="Flooz">Flooz (Moov)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Numéro de transfert (+228)</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 90123456"
                        value={withdrawalPhone}
                        onChange={(e) => setWithdrawalPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-mono text-left"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-2 px-4 rounded-none cursor-pointer text-[10px] transition-all"
                    >
                      Soumettre la demande de transfert
                    </button>
                  </form>
                </div>

                {/* Withdrawals history list */}
                <div className="text-left space-y-3">
                  <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Historique des demandes de retrait</span>
                  </h4>

                  {withdrawalHistory.length === 0 ? (
                    <p className="text-xs text-neutral-400 font-medium py-3 text-center bg-neutral-50 border border-neutral-200">Aucun retrait demandé.</p>
                  ) : (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {withdrawalHistory.map((item, idx) => (
                        <div key={idx} className="bg-neutral-50 border border-neutral-200 p-2 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-mono font-bold text-[#b8901c]">{formatFCFA(item.amount)}</p>
                            <p className="text-[9px] text-neutral-400">{item.method} ({item.phone})</p>
                          </div>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm tracking-wider ${
                            item.status === "Payé" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : item.status === "Rejeté" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS TAB */}
        {activeTab === "notifications" && currentView === "notifications" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-widest">Mes alertes en temps réel</h4>
              {unreadNotifs > 0 && (
                <button
                  onClick={handleMarkNotificationsRead}
                  className="text-[9px] font-black uppercase text-[#b8901c] hover:underline cursor-pointer"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-10 bg-neutral-50 border border-neutral-200">
                <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 font-medium">Vous n'avez pas d'alertes.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 border text-xs flex gap-3 relative rounded-none ${
                      item.read ? "bg-white border-neutral-200" : "bg-[#d4af37]/5 border-[#d4af37]/35"
                    }`}
                  >
                    {!item.read && (
                      <span className="absolute top-3 left-3 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    )}
                    <div className="flex-grow pl-2.5">
                      <p className={`text-neutral-800 font-medium leading-relaxed font-sans ${!item.read ? "font-bold text-neutral-950" : ""}`}>{item.text}</p>
                      <p className="text-[8px] text-neutral-400 mt-1 font-mono">{new Date(item.date).toLocaleDateString("fr-FR")} à {new Date(item.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* RATINGS / REVIEWS MODAL CONTAINER */}
      {isReviewOpen && selectedProductForReview && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-4 select-none">
          <div className="bg-white max-w-sm w-full border border-neutral-200 p-5 space-y-4 shadow-2xl rounded-none text-left animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <h5 className="text-[10px] font-black text-neutral-950 uppercase tracking-widest">Donner mon avis sur le produit</h5>
              <button onClick={() => { setIsReviewOpen(false); setSelectedProductForReview(null); }} className="text-neutral-400 hover:text-neutral-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 items-center">
              <img src={selectedProductForReview.images?.[0]} alt={selectedProductForReview.nom} className="w-10 h-10 object-cover border border-neutral-200" />
              <h6 className="text-xs font-bold text-neutral-800 line-clamp-2 leading-tight">{selectedProductForReview.nom}</h6>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 text-left">Votre note globale</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? "text-[#d4af37] fill-[#d4af37]" : "text-neutral-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1 text-left">Votre commentaire</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Qu'avez-vous pensé de cet article de production locale ? (Qualité, livraison, emballage...)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none text-neutral-900 font-sans"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setIsReviewOpen(false); setSelectedProductForReview(null); }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-none cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white text-[10px] font-black uppercase tracking-widest py-2 px-5 rounded-none cursor-pointer"
                >
                  Publier l'avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

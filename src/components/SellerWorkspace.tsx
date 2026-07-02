import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Percent,
  Star,
  Trash2,
  Edit3,
  Plus,
  ExternalLink,
  Clock,
  Users,
  TrendingUp,
  Copy,
  Check,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Filter,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Search,
  X,
  XCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface SellerWorkspaceProps {
  user: any;
  setUser: (user: any) => void;
  token: string | null;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  showToast: (msg: string) => void;
  formatFCFA: (amount: number) => string;
  wallet: any;
  withdrawalHistory: any[];
  onWithdrawalRequest: (amount: string, method: "TMoney" | "Flooz", phone: string) => void;
  handleProductSubmit: (e: React.FormEvent) => void;
  handleDeleteProduct: (id: string) => void;
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  isEditingProduct: any;
  setIsEditingProduct: (prod: any) => void;

  // New product form states so they remain in sync
  newProdName: string;
  setNewProdName: (v: string) => void;
  newProdDesc: string;
  setNewProdDesc: (v: string) => void;
  newProdPrice: string;
  setNewProdPrice: (v: string) => void;
  newProdStock: string;
  setNewProdStock: (v: string) => void;
  newProdCategory: string;
  setNewProdCategory: (v: string) => void;
  newProdImageUrl: string;
  setNewProdImageUrl: (v: string) => void;
  categories: string[];
}

export default function SellerWorkspace({
  user,
  setUser,
  token,
  products,
  setProducts,
  showToast,
  formatFCFA,
  wallet,
  withdrawalHistory,
  onWithdrawalRequest,
  handleProductSubmit,
  handleDeleteProduct,
  isAddProductOpen,
  setIsAddProductOpen,
  isEditingProduct,
  setIsEditingProduct,
  newProdName,
  setNewProdName,
  newProdDesc,
  setNewProdDesc,
  newProdPrice,
  setNewProdPrice,
  newProdStock,
  setNewProdStock,
  newProdCategory,
  setNewProdCategory,
  newProdImageUrl,
  setNewProdImageUrl,
  categories
}: SellerWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "promos" | "reviews" | "wallet">("dashboard");
  const [sellerSearchQuery, setSellerSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "today" | "pending" | "completed">("all");
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [reviewReplies, setReviewReplies] = useState<{ [key: string]: string }>({
    "rev-1": "Merci beaucoup pour votre retour ! C'est un plaisir de vous savoir satisfait de notre miel pur."
  });

  // Local state for Promo Codes
  const [promos, setPromos] = useState<any[]>([
    { id: "p1", code: "ASIME2026", type: "pourcentage", value: 10, expiry: "2026-12-31", active: true },
    { id: "p2", code: "TERROIR5", type: "fixe", value: 2500, expiry: "2026-08-15", active: true }
  ]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState<"pourcentage" | "fixe">("pourcentage");
  const [newPromoValue, setNewPromoValue] = useState("");
  const [newPromoExpiry, setNewPromoExpiry] = useState("");

  // Orders lists state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Stats
  const sellerProducts = products.filter(p => p.vendeurId === user.id || p.partenaire === user.businessName);
  const totalProductsCount = sellerProducts.length;
  const outOfStockCount = sellerProducts.filter(p => !p.stock || Number(p.stock) <= 0).length;
  const pendingValidationCount = sellerProducts.filter(p => p.valide === false || p.status === "attente").length;

  // Real-time calculated sales
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  // Fetch orders specifically for this seller
  useEffect(() => {
    async function fetchSellerOrders() {
      try {
        setLoadingOrders(true);
        const res = await fetch("/api/admin/orders", {
          headers: { "Authorization": "asime2026" }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          // Filter orders that contain products from this seller
          const filtered = data.orders.filter((ord: any) => {
            if (!ord.items) return false;
            return ord.items.some((item: any) => {
              const matchingProd = products.find(p => p.id === item.id);
              return matchingProd && (matchingProd.vendeurId === user.id || matchingProd.partenaire === user.businessName);
            });
          });
          setOrders(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch seller orders", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (user && products.length > 0) {
      fetchSellerOrders();
    }
  }, [user, products]);

  // Duplicate a product
  const handleDuplicateProduct = async (product: any) => {
    try {
      const duplicatePayload = {
        auth: "asime2026",
        id: "prod_" + Date.now().toString(),
        nom: `${product.nom} (Copie)`,
        description: product.description || "",
        prix: product.prix,
        stock: product.stock || 5,
        categorie: product.categorie,
        partenaire: product.partenaire || user.businessName || user.name,
        images: product.images && product.images.length > 0 ? product.images : ["/images/placeholder.jpg"],
        phare: false,
        vendeurId: user.id
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(duplicatePayload)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => [data.product, ...prev]);
        showToast("✓ Produit dupliqué avec succès !");
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors de la duplication.");
    }
  };

  // Toggle Featured (phare)
  const handleToggleFeature = async (product: any) => {
    try {
      const payload = {
        ...product,
        auth: "asime2026",
        phare: !product.phare
      };
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? data.product : p));
        showToast(product.phare ? "✓ Retiré des coups de cœur." : "✓ Mis en avant avec succès !");
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur de mise à jour.");
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "asime2026"
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
        showToast(`✓ Commande mise à jour : ${newStatus} !`);
      } else {
        showToast(`Erreur : ${data.error}`);
      }
    } catch (err) {
      showToast("Erreur lors du changement de statut.");
    }
  };

  // Promo operations
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoValue) return;
    const newPromo = {
      id: "promo-" + Date.now(),
      code: newPromoCode.trim().toUpperCase(),
      type: newPromoType,
      value: Number(newPromoValue),
      expiry: newPromoExpiry || "2026-12-31",
      active: true
    };
    setPromos([newPromo, ...promos]);
    setNewPromoCode("");
    setNewPromoValue("");
    setNewPromoExpiry("");
    showToast(`✓ Code promo ${newPromo.code} créé !`);
  };

  const togglePromoActive = (id: string) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    showToast("✓ Statut du code promo modifié.");
  };

  const deletePromo = (id: string) => {
    setPromos(prev => prev.filter(p => p.id !== id));
    showToast("✓ Code promo supprimé.");
  };

  // Mock sales performance data for custom SVG Chart
  const salesHistory = [
    { label: "Jan", sales: 450000 },
    { label: "Fév", sales: 620000 },
    { label: "Mar", sales: 810000 },
    { label: "Avr", sales: 950000 },
    { label: "Mai", sales: 1250000 },
    { label: "Juin", sales: 1540000 }
  ];

  const maxSale = Math.max(...salesHistory.map(h => h.sales));
  const totalRevenueCalculated = user.vendeurStats?.revenusGeneres || 1540000;
  const totalOrdersCount = orders.length || 14;

  const filteredProducts = sellerProducts.filter(prod => {
    if (!sellerSearchQuery) return true;
    return prod.nom.toLowerCase().includes(sellerSearchQuery.toLowerCase()) ||
           prod.categorie.toLowerCase().includes(sellerSearchQuery.toLowerCase());
  });

  const filteredOrders = orders.filter(ord => {
    if (orderFilter === "pending") return ord.orderStatus === "En attente" || ord.orderStatus === "En cours";
    if (orderFilter === "completed") return ord.orderStatus === "Livre" || ord.orderStatus === "Complété";
    if (orderFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      return ord.createdAt && ord.createdAt.includes(today);
    }
    return true;
  });

  // Mock Reviews
  const reviews = [
    { id: "rev-1", customer: "Amévi K.", rating: 5, date: "30 Juin 2026", product: "Miel Pur de Dapaong", comment: "Qualité exceptionnelle ! Le miel a un goût boisé unique. Je recommande vivement." },
    { id: "rev-2", customer: "Koffi M.", rating: 4, date: "28 Juin 2026", product: "Miel Pur de Dapaong", comment: "Très bon miel, bien emballé. Livraison un peu lente mais le produit en vaut la peine." },
    { id: "rev-3", customer: "Yaovi A.", rating: 3, date: "20 Juin 2026", product: "Miel Pur de Dapaong", comment: "Le produit est correct mais l'étiquette s'est décollée pendant le transport." }
  ];

  const handleSendReply = (reviewId: string) => {
    if (!replyText[reviewId]?.trim()) return;
    setReviewReplies({ ...reviewReplies, [reviewId]: replyText[reviewId] });
    setReplyText({ ...replyText, [reviewId]: "" });
    showToast("✓ Votre réponse a été publiée avec succès !");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En attente": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Paye":
      case "Livre":
      case "Complété": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "En cours": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  return (
    <div className="flex h-full bg-stone-50 text-neutral-900 font-sans antialiased overflow-hidden">
      {/* 2. FIXED PREMIUM SIDEBAR */}
      <aside className="w-64 bg-neutral-900 text-stone-200 flex flex-col justify-between select-none border-r border-neutral-800 shrink-0 h-full">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37] flex items-center justify-center font-black text-neutral-900 text-sm tracking-tighter">
                As
              </div>
              <div className="text-left">
                <h2 className="text-sm font-black tracking-widest text-white uppercase">ASIME SELLER</h2>
                <span className="text-[9px] font-bold text-[#d4af37] uppercase tracking-wider">Espace Artisan</span>
              </div>
            </div>
          </div>

          {/* Profile Quick Glance */}
          <div className="p-4 bg-neutral-950/40 border-b border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-extrabold text-sm uppercase">
              {user.businessName ? user.businessName.substring(0, 2) : user.name.substring(0, 2)}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.businessName || user.name}</p>
              <span className="inline-flex items-center gap-1 text-[8.5px] font-black text-[#d4af37] uppercase tracking-wider mt-0.5">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                Vendeur Certifié
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1 text-left">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#d4af37] text-neutral-950 font-bold shadow-md shadow-[#d4af37]/10"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-[#d4af37] text-neutral-950 font-bold shadow-md shadow-[#d4af37]/10"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <div className="flex-grow flex items-center justify-between">
                <span>Catalogue & Produits</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "products" ? "bg-neutral-900 text-white" : "bg-neutral-800 text-stone-300"}`}>
                  {totalProductsCount}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#d4af37] text-neutral-950 font-bold shadow-md shadow-[#d4af37]/10"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <div className="flex-grow flex items-center justify-between">
                <span>Commandes</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "orders" ? "bg-neutral-900 text-white" : "bg-neutral-800 text-stone-300"}`}>
                  {totalOrdersCount}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("promos")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "promos"
                  ? "bg-[#d4af37] text-neutral-950 font-bold shadow-md shadow-[#d4af37]/10"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <Percent className="w-4 h-4 shrink-0" />
              <span>Codes Promo</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-[#d4af37] text-neutral-950 font-bold shadow-md shadow-[#d4af37]/10"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Avis Clients</span>
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "wallet"
                  ? "bg-[#d4af37] text-neutral-950 font-bold shadow-md shadow-[#d4af37]/10"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>Portefeuille & Retraits</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 text-left">
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">
            Mode Boutique : <strong className="text-[#d4af37]">{user.vendeurMode || "AUTONOME"}</strong>
          </p>
          <p className="text-[8px] text-neutral-600 mt-1">
            Asime Dashboard v2.0 • Premium
          </p>
        </div>
      </aside>

      {/* MAIN DYNAMIC CONTENT SPACE */}
      <main className="flex-grow flex flex-col overflow-y-auto h-full relative">
        {/* TOP BAR */}
        <header className="bg-white border-b border-stone-200 h-16 px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-neutral-900 tracking-tight uppercase">
              {activeTab === "dashboard" && "Tableau de bord de performance"}
              {activeTab === "products" && "Gestion du Catalogue"}
              {activeTab === "orders" && "Suivi des commandes artisans"}
              {activeTab === "promos" && "Codes Promotionnels & Réductions"}
              {activeTab === "reviews" && "Avis clients & Modération"}
              {activeTab === "wallet" && "Portefeuille Local & Demandes de retraits"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Solde Actuel</span>
              <span className="text-xs font-mono font-black text-neutral-900">{formatFCFA(wallet.balance || 0)}</span>
            </div>
            <button
              onClick={() => setActiveTab("wallet")}
              className="bg-neutral-900 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg transition-all"
            >
              Retirer
            </button>
          </div>
        </header>

        {/* DYNAMIC SCROLL CONTAINER */}
        <div className="p-6 flex-grow space-y-6">

          {/* 1. OVERVIEW DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Premium Top Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Chiffre d'affaires total */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">Chiffre d'Affaires</span>
                      <h3 className="text-xl font-mono font-black text-neutral-900 mt-1">{formatFCFA(totalRevenueCalculated)}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px]">
                    <span className="text-emerald-600 font-extrabold flex items-center">
                      +14.2%
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                    <span className="text-neutral-400">ce mois-ci</span>
                  </div>
                </div>

                {/* Metric 2: Solde disponible */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">Solde Disponible</span>
                      <h3 className="text-xl font-mono font-black text-neutral-950 mt-1">{formatFCFA(wallet.balance || 0)}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[10px]">
                    <span className="text-[#b8901c] font-bold">T-Money & Flooz</span>
                    <span className="text-neutral-400">• Transfert direct</span>
                  </div>
                </div>

                {/* Metric 3: Solde en attente */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">Solde en Attente</span>
                      <h3 className="text-xl font-mono font-black text-neutral-400 mt-1">{formatFCFA(wallet.pending || 18500)}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-neutral-500 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                    <span>En attente de livraison</span>
                  </div>
                </div>

                {/* Metric 4: Nombre de commandes */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">Commandes</span>
                      <h3 className="text-xl font-mono font-black text-neutral-900 mt-1">{totalOrdersCount}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-stone-50 text-neutral-700 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px]">
                    <span className="text-emerald-600 font-extrabold">+8.3%</span>
                    <span className="text-neutral-400">taux d'expédition</span>
                  </div>
                </div>

                {/* Metric 5: Nombre de produits */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">Articles en Ligne</span>
                      <h3 className="text-xl font-mono font-black text-neutral-900 mt-1">{totalProductsCount}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-stone-50 text-neutral-700 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px]">
                    <span className="text-neutral-500 font-semibold">{totalProductsCount} publiés</span>
                  </div>
                </div>

                {/* Metric 6: Nombre de visiteurs */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">Visiteurs (Est.)</span>
                      <h3 className="text-xl font-mono font-black text-neutral-900 mt-1">1,240</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px]">
                    <span className="text-blue-600 font-extrabold">+24%</span>
                    <span className="text-neutral-400">visites ce mois</span>
                  </div>
                </div>

                {/* Metric 7: Taux de conversion */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block">Taux de Conversion</span>
                      <h3 className="text-xl font-mono font-black text-neutral-900 mt-1">2.41%</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[10px]">
                    <span className="text-emerald-600 font-bold">Stable</span>
                    <span className="text-neutral-400">• Moyenne de la plateforme</span>
                  </div>
                </div>

                {/* Metric 8: Produits en rupture / En attente */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xs relative overflow-hidden group grid grid-cols-2 gap-2">
                  <div className="border-r border-stone-100 pr-1 text-left">
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider block">Rupture</span>
                    <span className="text-base font-mono font-black text-red-600 block mt-1">{outOfStockCount}</span>
                    <span className="text-[8.5px] text-neutral-400">produits</span>
                  </div>
                  <div className="pl-1 text-left">
                    <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider block">En attente</span>
                    <span className="text-base font-mono font-black text-amber-600 block mt-1">{pendingValidationCount}</span>
                    <span className="text-[8.5px] text-neutral-400">validation</span>
                  </div>
                </div>

              </div>

              {/* INTERACTIVE SALES PERFORMANCE CHART (SVG BENTO BOX) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Custom Responsive SVG Curve & Bar Chart */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl lg:col-span-2 relative">
                  <div className="flex justify-between items-center mb-4 select-none">
                    <div>
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Évolution des ventes (FCFA)</h4>
                      <p className="text-[10px] text-neutral-400 font-medium">Bilan de performance des 6 derniers mois</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                        <span className="w-2.5 h-2.5 bg-[#d4af37] rounded-xs inline-block"></span>
                        Ventes directes
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-64 w-full relative pt-4">
                    <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f1f0" strokeWidth="1" />
                      <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f1f0" strokeWidth="1" />
                      <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f1f0" strokeWidth="1" />
                      <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f1f0" strokeWidth="1" />
                      <line x1="40" y1="190" x2="580" y2="190" stroke="#e1e1e0" strokeWidth="1" />

                      {/* Chart Bar Plots */}
                      {salesHistory.map((item, index) => {
                        const x = 40 + (index * 100) + 30;
                        const height = (item.sales / maxSale) * 150;
                        const y = 190 - height;
                        
                        return (
                          <g key={index} className="group/bar cursor-pointer"
                             onMouseEnter={(e) => {
                               const rect = e.currentTarget.getBoundingClientRect();
                               const container = e.currentTarget.ownerDocument.documentElement;
                               setActiveTooltip({
                                 x: rect.left - 50,
                                 y: rect.top - 80,
                                 label: item.label,
                                 value: `${item.sales.toLocaleString()} FCFA`
                               });
                             }}
                             onMouseLeave={() => setActiveTooltip(null)}
                          >
                            <rect
                              x={x}
                              y={y}
                              width="40"
                              height={height}
                              fill="#d4af37"
                              opacity="0.85"
                              className="transition-all duration-300 hover:opacity-100 hover:fill-neutral-950"
                              rx="4"
                            />
                            {/* X-axis label */}
                            <text x={x + 20} y="210" textAnchor="middle" className="text-[10px] font-mono font-bold fill-neutral-400">
                              {item.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Tooltip */}
                    {activeTooltip && (
                      <div
                        className="absolute z-50 bg-neutral-950 text-white p-2 rounded-lg text-[10px] font-mono shadow-xl border border-neutral-800 pointer-events-none"
                        style={{ left: `${activeTooltip.x - 160}px`, top: `${activeTooltip.y - 120}px` }}
                      >
                        <p className="font-bold text-[#d4af37] uppercase">{activeTooltip.label}</p>
                        <p className="mt-0.5">{activeTooltip.value}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Top Selling Artisans Products List */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl text-left">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Vos Best-Sellers</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  </h4>

                  <div className="space-y-3.5">
                    {sellerProducts.slice(0, 4).map((prod, idx) => (
                      <div key={prod.id || idx} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.images && prod.images[0] ? prod.images[0] : "/images/placeholder.jpg"}
                            alt={prod.nom}
                            className="w-10 h-10 object-cover rounded-md border border-stone-150"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-neutral-900 truncate">{prod.nom}</h5>
                            <span className="text-[9px] font-extrabold text-[#d4af37] uppercase tracking-wider block mt-0.5">{prod.categorie}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono font-black text-neutral-950">{formatFCFA(prod.prix)}</p>
                          <span className="text-[8.5px] text-neutral-400 block font-medium">Stock : {prod.stock || 0}</span>
                        </div>
                      </div>
                    ))}

                    {sellerProducts.length === 0 && (
                      <div className="text-center py-12 text-neutral-400 text-xs">
                        Aucun produit enregistré pour le moment.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Quick Navigation Help Alert */}
              <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-4 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">Conseil de Vente Asime</h5>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-sans">
                    Les articles marqués en <strong>Coup de Cœur (Phare)</strong> apparaissent directement en première page de la marketplace Asime et génèrent en moyenne 3 fois plus de trafic ! Utilisez le bouton d'étoile dans votre catalogue pour les activer.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* 2. CATALOG & PRODUCTS VIEW */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Filter controls & Search */}
              <div className="bg-white border border-stone-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sellerSearchQuery}
                    onChange={(e) => setSellerSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom ou catégorie..."
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-xs font-medium focus:outline-none focus:border-neutral-950 font-sans"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditingProduct(null);
                      setNewProdName("");
                      setNewProdDesc("");
                      setNewProdPrice("");
                      setNewProdStock("");
                      setNewProdCategory(categories[0] || "");
                      setNewProdImageUrl("");
                      setIsAddProductOpen(!isAddProductOpen);
                    }}
                    className="bg-neutral-900 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest text-[9.5px] px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer un produit</span>
                  </button>
                </div>
              </div>

              {/* ADD/EDIT FORM DRAWER-LIKE ROW */}
              {isAddProductOpen && (
                <div className="bg-white border-2 border-neutral-900 p-5 rounded-xl shadow-md animate-fade-in text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                    <h3 className="text-xs font-black text-neutral-950 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#d4af37]" />
                      <span>{isEditingProduct ? "Modifier l'article" : "Publier un nouvel article artisanal"}</span>
                    </h3>
                    <button
                      onClick={() => setIsAddProductOpen(false)}
                      className="text-neutral-400 hover:text-neutral-950"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleProductSubmit} className="space-y-4 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Nom de l'article</label>
                        <input
                          type="text"
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          placeholder="Ex: Pagne tissé Kente artisanal"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Catégorie</label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                        >
                          {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Description complète</label>
                      <textarea
                        required
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Décrivez l'origine, les matériaux et la valeur de l'article..."
                        rows={3}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Prix de vente (FCFA)</label>
                        <input
                          type="number"
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          placeholder="Ex: 15000"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Stock disponible</label>
                        <input
                          type="number"
                          required
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(e.target.value)}
                          placeholder="Ex: 10"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">URL de la photo</label>
                        <input
                          type="text"
                          required
                          value={newProdImageUrl}
                          onChange={(e) => setNewProdImageUrl(e.target.value)}
                          placeholder="Ex: https://image.com/kente.jpg"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setIsAddProductOpen(false)}
                        className="px-4 py-2 border border-stone-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-bold text-xs uppercase tracking-widest rounded-lg cursor-pointer transition-all"
                      >
                        {isEditingProduct ? "Valider les modifications" : "Publier l'article"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Main Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map(prod => {
                  const isOutOfStock = !prod.stock || Number(prod.stock) <= 0;
                  const isPending = prod.valide === false || prod.status === "attente";
                  
                  return (
                    <div key={prod.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-neutral-900 transition-all flex flex-col justify-between">
                      {/* Product Header details */}
                      <div className="p-4 flex gap-3.5 text-left">
                        <img
                          src={prod.images && prod.images[0] ? prod.images[0] : "/images/placeholder.jpg"}
                          alt={prod.nom}
                          className="w-16 h-16 object-cover border border-stone-150 rounded-lg shrink-0"
                        />
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-start justify-between gap-1">
                            <span className="inline-block text-[8.5px] font-black text-[#b8901c] bg-[#d4af37]/10 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              {prod.categorie}
                            </span>

                            {/* Coups de coeur state */}
                            <button
                              onClick={() => handleToggleFeature(prod)}
                              className="text-stone-300 hover:text-[#d4af37] transition-colors"
                              title={prod.phare ? "Retirer des coups de cœur" : "Mettre en coup de cœur"}
                            >
                              <Star className={`w-4 h-4 ${prod.phare ? "fill-[#d4af37] text-[#d4af37]" : ""}`} />
                            </button>
                          </div>

                          <h4 className="text-xs font-extrabold text-neutral-950 truncate mt-1">{prod.nom}</h4>
                          <p className="text-xs font-mono font-black text-neutral-900 mt-1">{formatFCFA(prod.prix)}</p>
                        </div>
                      </div>

                      {/* Status Badges Section */}
                      <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-left select-none">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Statut</span>
                        <div className="flex items-center gap-1.5">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-red-600 uppercase bg-red-55/10 px-2 py-0.5 rounded-full">
                              <XCircle className="w-2.5 h-2.5" />
                              Rupture de stock
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-2.5 h-2.5" />
                              Validation en attente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              En ligne
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="p-3 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between">
                        <div className="text-left font-sans text-[10px] text-neutral-500">
                          Stock actuel : <strong className="text-neutral-950 font-mono font-bold">{prod.stock || 0}</strong>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setIsEditingProduct(prod);
                              setNewProdName(prod.nom);
                              setNewProdDesc(prod.description || "");
                              setNewProdPrice(String(prod.prix));
                              setNewProdStock(String(prod.stock || 0));
                              setNewProdCategory(prod.categorie);
                              setNewProdImageUrl(prod.images[0]);
                              setIsAddProductOpen(true);
                            }}
                            className="text-stone-500 hover:text-neutral-950 p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate button */}
                          <button
                            onClick={() => handleDuplicateProduct(prod)}
                            className="text-stone-500 hover:text-neutral-950 p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all cursor-pointer"
                            title="Dupliquer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Voulez-vous vraiment supprimer "${prod.nom}" ?`)) {
                                handleDeleteProduct(prod.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-16 bg-white border border-stone-200 rounded-xl">
                    <Package className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                    <p className="text-xs text-neutral-500 font-semibold font-sans">Aucun produit ne correspond à votre recherche.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 3. ORDERS VIEW */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Order quick filter header */}
              <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center justify-between select-none">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-stone-400" />
                  Filtrer les commandes
                </span>
                
                <div className="flex gap-1.5">
                  {(["all", "today", "pending", "completed"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`text-[9.5px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        orderFilter === f
                          ? "bg-neutral-950 text-white"
                          : "bg-stone-100 hover:bg-stone-200 text-neutral-600"
                      }`}
                    >
                      {f === "all" && "Toutes"}
                      {f === "today" && "Aujourd'hui"}
                      {f === "pending" && "En cours"}
                      {f === "completed" && "Livrées"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order list container */}
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="text-center py-12 bg-white border border-stone-200 rounded-xl font-sans text-xs text-neutral-500">
                    Chargement des commandes artisans en cours...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-stone-200 rounded-xl">
                    <ShoppingCart className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-xs text-neutral-500 font-semibold font-sans">Aucune commande d'artisanat enregistrée pour ce filtre.</p>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    // Extract items belonging to this seller
                    const sellerItems = order.items.filter((item: any) => {
                      const matchingProd = products.find(p => p.id === item.id);
                      return matchingProd && (matchingProd.vendeurId === user.id || matchingProd.partenaire === user.businessName);
                    });

                    const sellerTotal = sellerItems.reduce((acc: number, item: any) => acc + (item.prix * item.quantity), 0);

                    return (
                      <div key={order.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden text-left shadow-xs hover:border-neutral-900 transition-all">
                        {/* Header block */}
                        <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/50">
                          <div>
                            <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block">ID COMMANDE</span>
                            <h4 className="text-xs font-bold text-neutral-900 mt-0.5 font-mono">{order.id}</h4>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono text-neutral-400">
                              {order.createdAt ? order.createdAt.split("T")[0] : "Date inconnue"}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus || "En attente"}
                            </span>
                          </div>
                        </div>

                        {/* Customer & items section */}
                        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Client details */}
                          <div className="space-y-1.5 border-b lg:border-b-0 lg:border-r border-stone-100 pb-4 lg:pb-0 lg:pr-6">
                            <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-widest block">Client destinataire</span>
                            <p className="text-xs font-bold text-neutral-900 font-sans">{order.customerName}</p>
                            <p className="text-[10.5px] text-neutral-500 font-mono">{order.customerPhone}</p>
                            <p className="text-[10px] text-stone-400 font-sans mt-1">{order.customerAddress}</p>
                          </div>

                          {/* Ordered items list */}
                          <div className="lg:col-span-2 space-y-3">
                            <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-widest block">Articles de votre boutique</span>
                            
                            <div className="space-y-2">
                              {sellerItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center font-mono text-[10px] font-bold text-neutral-600 shrink-0">
                                      {item.quantity}x
                                    </span>
                                    <span className="font-bold text-neutral-800 truncate">{item.nom}</span>
                                  </div>
                                  <span className="font-mono font-black text-neutral-900 shrink-0">{formatFCFA(item.prix * item.quantity)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Total and Actions block */}
                            <div className="border-t border-stone-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Sous-total Boutique</span>
                                <span className="text-xs font-mono font-black text-[#b8901c]">{formatFCFA(sellerTotal)}</span>
                              </div>

                              {/* Quick status transitions for artisan */}
                              <div className="flex gap-1.5 select-none">
                                {order.orderStatus === "En attente" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "En cours")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    Accepter & Préparer
                                  </button>
                                )}
                                {order.orderStatus === "En cours" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "Livre")}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    Marquer comme Livré
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    )
                  })
                )}
              </div>

            </div>
          )}

          {/* 4. PROMO CODES VIEW */}
          {activeTab === "promos" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Promo creation box */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl h-fit">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#d4af37]" />
                    <span>Créer un code promo</span>
                  </h4>

                  <form onSubmit={handleAddPromo} className="space-y-3.5 font-sans">
                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Code promo unique</label>
                      <input
                        type="text"
                        required
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value)}
                        placeholder="Ex: SPECIALSUMMER"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-950 uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Type de remise</label>
                        <select
                          value={newPromoType}
                          onChange={(e: any) => setNewPromoType(e.target.value)}
                          className="w-full px-2.5 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-semibold"
                        >
                          <option value="pourcentage">Pourcentage (%)</option>
                          <option value="fixe">Montant Fixe (FCFA)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Valeur</label>
                        <input
                          type="number"
                          required
                          value={newPromoValue}
                          onChange={(e) => setNewPromoValue(e.target.value)}
                          placeholder={newPromoType === "pourcentage" ? "15" : "2000"}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Date d'expiration</label>
                      <input
                        type="date"
                        required
                        value={newPromoExpiry}
                        onChange={(e) => setNewPromoExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer text-[10px] transition-all"
                    >
                      Enregistrer le code promo
                    </button>
                  </form>
                </div>

                {/* Promos table */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl lg:col-span-2">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
                    Vos codes promotionnels actifs
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-3 font-extrabold">Code</th>
                          <th className="pb-3 font-extrabold">Remise</th>
                          <th className="pb-3 font-extrabold">Expiration</th>
                          <th className="pb-3 font-extrabold text-center">Status</th>
                          <th className="pb-3 font-extrabold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promos.map(p => (
                          <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                            <td className="py-3.5 font-mono font-bold text-neutral-900 tracking-wider">
                              {p.code}
                            </td>
                            <td className="py-3.5">
                              {p.type === "pourcentage" ? `${p.value}%` : formatFCFA(p.value)}
                            </td>
                            <td className="py-3.5 font-mono text-[10.5px] text-neutral-500">
                              {p.expiry}
                            </td>
                            <td className="py-3.5 text-center select-none">
                              <button
                                onClick={() => togglePromoActive(p.id)}
                                className="inline-flex items-center gap-1 cursor-pointer"
                                title="Activer / Désactiver"
                              >
                                {p.active ? (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                                    Actif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">
                                    Inactif
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => deletePromo(p.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {promos.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-neutral-400">
                              Aucun code promo créé.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 5. REVIEWS VIEW */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-none">
                {/* Reviews Statistics box */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl h-fit">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-3">Synthèse des Avis</h4>
                  
                  <div className="text-center py-4 border-b border-stone-100">
                    <p className="text-3xl font-black text-neutral-900 font-mono">4.3</p>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {[1, 2, 3, 4].map(star => <Star key={star} className="w-3.5 h-3.5 text-[#d4af37] fill-[#d4af37]" />)}
                      <Star className="w-3.5 h-3.5 text-stone-200" />
                    </div>
                    <span className="text-[10px] text-neutral-400 font-semibold block mt-1.5">Moyenne basée sur 14 avis</span>
                  </div>

                  {/* Filter by star rating */}
                  <div className="mt-4 space-y-2.5">
                    <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-widest block">Filtrer par étoiles</span>
                    {[5, 4, 3, 2, 1].map(stars => (
                      <button
                        key={stars}
                        onClick={() => setReviewFilter(reviewFilter === stars ? null : stars)}
                        className={`w-full flex items-center justify-between text-xs font-sans p-1.5 rounded-lg transition-all cursor-pointer ${
                          reviewFilter === stars ? "bg-[#d4af37]/10 border border-[#d4af37]/30 text-neutral-900" : "hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-neutral-700">
                          <span className="font-mono font-bold text-[10px]">{stars}</span>
                          <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" />
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono font-semibold">
                          {stars === 5 && "8"}
                          {stars === 4 && "4"}
                          {stars === 3 && "1"}
                          {stars === 2 && "1"}
                          {stars === 1 && "0"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviews moderation list */}
                <div className="lg:col-span-3 space-y-4">
                  {reviews
                    .filter(r => !reviewFilter || r.rating === reviewFilter)
                    .map(review => (
                      <div key={review.id} className="bg-white border border-stone-200 p-5 rounded-xl text-left space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-100 pb-3">
                          <div>
                            <span className="text-[8.5px] font-bold text-[#b8901c] uppercase tracking-wider block bg-[#d4af37]/10 px-2 py-0.5 rounded-sm w-fit">
                              {review.product}
                            </span>
                            <p className="text-xs font-bold text-neutral-900 font-sans mt-1.5">{review.customer}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10.5px] font-mono text-neutral-400">{review.date}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating ? "text-[#d4af37] fill-[#d4af37]" : "text-stone-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Comment body */}
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans italic">
                          "{review.comment}"
                        </p>

                        {/* Existing reply or reply form */}
                        <div className="bg-stone-50 border border-stone-100 p-3.5 rounded-lg space-y-2.5">
                          <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-widest block">Votre Réponse</span>
                          
                          {reviewReplies[review.id] ? (
                            <div className="text-left">
                              <p className="text-xs font-sans font-bold text-neutral-800">Votre boutique Asime :</p>
                              <p className="text-xs text-neutral-600 font-sans mt-1 leading-relaxed">{reviewReplies[review.id]}</p>
                            </div>
                          ) : (
                            <div className="flex gap-2 font-sans">
                              <input
                                type="text"
                                value={replyText[review.id] || ""}
                                onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                placeholder="Répondre au client avec tact..."
                                className="flex-grow px-3 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-neutral-950 text-neutral-900 bg-white"
                              />
                              <button
                                onClick={() => handleSendReply(review.id)}
                                className="bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-lg transition-all cursor-pointer"
                              >
                                Publier
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* 6. WALLET & WITHDRAWALS VIEW */}
          {activeTab === "wallet" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Ledger summary & Withdrawal box */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl h-fit space-y-5">
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#d4af37]" />
                      <span>Retirer vos fonds locaux</span>
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-medium font-sans">
                      Les transferts mobiles sont traités instantanément par notre secrétariat local.
                    </p>
                  </div>

                  {/* Dynamic balanced status */}
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center">
                    <span className="text-[8.5px] font-black text-stone-400 uppercase tracking-widest block">SOLDE RETIRABLE</span>
                    <h2 className="text-2xl font-mono font-black text-[#b8901c] mt-1.5">{formatFCFA(wallet.balance || 0)}</h2>
                    <span className="text-[9px] text-neutral-400 font-medium block mt-1">Aucun frais appliqué sur les transferts</span>
                  </div>

                  {/* Submission form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.currentTarget;
                      const amount = (target.elements.namedItem("amount") as HTMLInputElement).value;
                      const method = (target.elements.namedItem("method") as HTMLSelectElement).value as "TMoney" | "Flooz";
                      const phone = (target.elements.namedItem("phone") as HTMLInputElement).value;
                      onWithdrawalRequest(amount, method, phone);
                      target.reset();
                    }}
                    className="space-y-3.5 font-sans"
                  >
                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Montant (Minimum 5 000 FCFA)</label>
                      <input
                        type="number"
                        name="amount"
                        required
                        min="5000"
                        placeholder="Ex: 15000"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-950"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Réseau Mobile</label>
                        <select
                          name="method"
                          className="w-full px-2 py-2 border border-stone-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-semibold"
                        >
                          <option value="TMoney">TMoney (Togocel)</option>
                          <option value="Flooz">Flooz (Moov)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Numéro (+228)</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="Ex: 90123456"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-950"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-black uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer text-[10px] transition-all"
                    >
                      Initier la demande de virement mobile
                    </button>
                  </form>
                </div>

                {/* Detailed ledger log entries */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl lg:col-span-2">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
                    Journal d'historique de transferts & retraits
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-3 font-extrabold">ID Transaction</th>
                          <th className="pb-3 font-extrabold">Méthode</th>
                          <th className="pb-3 font-extrabold text-right">Montant</th>
                          <th className="pb-3 font-extrabold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawalHistory.map(log => (
                          <tr key={log.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/40 transition-colors">
                            <td className="py-3.5">
                              <p className="font-mono font-bold text-neutral-900 truncate max-w-[150px]">{log.id}</p>
                              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{log.date || log.createdAt || "Aujourd'hui"}</span>
                            </td>
                            <td className="py-3.5">
                              <span className="font-semibold text-neutral-700">{log.method}</span>
                              <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">+{log.phone || log.payoutPhone}</span>
                            </td>
                            <td className="py-3.5 text-right font-mono font-black text-neutral-950">
                              -{formatFCFA(log.amount)}
                            </td>
                            <td className="py-3.5 text-center select-none">
                              {log.status === "complet" || log.status === "Complété" || log.status === "Approuvé" ? (
                                <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                                  Validé
                                </span>
                              ) : log.status === "Refusé" || log.status === "Rejeté" ? (
                                <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">
                                  Refusé
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                                  En traitement
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {withdrawalHistory.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-16 text-neutral-400">
                              Aucune transaction de retrait enregistrée dans votre journal.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

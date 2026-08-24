import React, { useState, useEffect, useRef } from "react";
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
  ToggleRight,
  Megaphone,
  MessageCircle,
  Store,
  Settings,
  ArrowLeft,
  Lock
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
  onWithdrawalRequest: (amount: string, method: "Flooz" | "Mix by Yas" | "PayDunya", phone: string) => void;
  handleProductSubmit: (e: React.FormEvent) => void;
  handleDeleteProduct: (id: string) => void;
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  isEditingProduct: any;
  setIsEditingProduct: (prod: any) => void;
  onBackToSite?: () => void;

  // New product form states so they remain in sync
  newProdName: string;
  setNewProdName: (v: string) => void;
  newProdDesc: string;
  setNewProdDesc: (v: string) => void;
  newProdPrice: string;
  setNewProdPrice: (v: string) => void;
  newProdPriceBarre: string;
  setNewProdPriceBarre: (v: string) => void;
  newProdStock: string;
  setNewProdStock: (v: string) => void;
  newProdCategory: string;
  setNewProdCategory: (v: string) => void;
  newProdImageUrl: string;
  setNewProdImageUrl: (v: string) => void;
  newProdImages: string[];
  setNewProdImages: React.Dispatch<React.SetStateAction<string[]>>;
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
  wallet: propWallet,
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
  newProdPriceBarre,
  setNewProdPriceBarre,
  newProdStock,
  setNewProdStock,
  newProdCategory,
  setNewProdCategory,
  newProdImageUrl,
  setNewProdImageUrl,
  newProdImages,
  setNewProdImages,
  categories,
  onBackToSite
}: SellerWorkspaceProps) {
  const wallet = propWallet || { balance: 0, pending: 0 };
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "messages" | "ads" | "promos" | "shop_profile" | "reviews" | "wallet">("dashboard");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [sellerSearchQuery, setSellerSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "today" | "pending" | "completed">("all");
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [reviewReplies, setReviewReplies] = useState<{ [key: string]: string }>({
    "rev-1": "Merci beaucoup pour votre retour ! C'est un plaisir de vous savoir satisfait de notre miel pur."
  });

  // Shop Profile Customization States
  const [shopSlogan, setShopSlogan] = useState("Artisanat authentique & Trésors du Togo");
  const [shopAnnouncement, setShopAnnouncement] = useState("Bienvenue chez nous ! Toutes nos créations sont confectionnées à la main avec passion et amour dans notre atelier de Lomé. Livraison gratuite à partir de 20 000 FCFA.");
  const [shopStory, setShopStory] = useState("Notre voyage a commencé dans un petit atelier familial. Aujourd'hui, nous collaborons avec des tisserands et artisans locaux pour vous apporter le meilleur du terroir togolais sur Miabé Asi.");
  const [shopBanner, setShopBanner] = useState("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80");
  const [shopLogoText, setShopLogoText] = useState(user?.businessName ? user.businessName.substring(0, 2) : (user?.name ? user.name.substring(0, 2) : "AS"));
  const [shopName, setShopName] = useState(user?.businessName || user?.name || "Boutique d'Artisanat");

  // Sponsored Ads Simulator States
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [dailyBudget, setDailyBudget] = useState(1500); // FCFA
  const [advertisedProducts, setAdvertisedProducts] = useState<string[]>([]);

  // Security PIN states in workspace
  const [currentPinCheck, setCurrentPinCheck] = useState("");
  const [newPinValue, setNewPinValue] = useState("");
  const [confirmNewPinValue, setConfirmNewPinValue] = useState("");
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Internal Messaging Inbox States
  const [activeThread, setActiveThread] = useState("thread-1");
  const [chatMessage, setChatMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [threads, setThreads] = useState([
    {
      id: "thread-1",
      customer: "Adjoa S. (Lomé)",
      avatar: "AS",
      product: "Robe sur-mesure en Pagne Kente",
      lastMessage: "Bonjour, est-ce que vos pagnes sont 100% coton biologique ?",
      unread: true,
      messages: [
        { sender: "customer", text: "Bonjour ! J'adore vos créations de robes.", date: "Aujourd'hui, 09:12" },
        { sender: "seller", text: "Bonjour Adjoa ! Merci beaucoup, toutes nos créations sont faites main dans notre atelier de Lomé.", date: "Aujourd'hui, 09:15" },
        { sender: "customer", text: "Super ! Est-ce que vos pagnes sont 100% coton biologique ?", date: "Aujourd'hui, 10:02" }
      ]
    },
    {
      id: "thread-2",
      customer: "Koffi T. (Kpalimé)",
      avatar: "KT",
      product: "Miel Pur de Dapaong (Lot de 3)",
      lastMessage: "Pouvez-vous m'envoyer un colis par le réseau de bus ?",
      unread: false,
      messages: [
        { sender: "customer", text: "Salut, j'aimerais commander 3 pots de miel de Dapaong.", date: "Hier, 14:20" },
        { sender: "seller", text: "Bonjour Koffi, avec plaisir ! Nous pouvons expédier via le réseau de colis Miabé Asi.", date: "Hier, 14:45" },
        { sender: "customer", text: "Pouvez-vous m'envoyer un colis par le réseau de bus ?", date: "Hier, 15:10" }
      ]
    },
    {
      id: "thread-3",
      customer: "Sena K. (Aného)",
      avatar: "SK",
      product: "Statue en teck sculptée main",
      lastMessage: "Merci pour les précisions, je valide l'achat !",
      unread: false,
      messages: [
        { sender: "customer", text: "Bonsoir, quel est le poids exact de la statue en teck ?", date: "02 Juil, 18:30" },
        { sender: "seller", text: "Bonsoir Sena, elle pèse environ 1.8 kg. C'est du bois de teck massif du Togo.", date: "02 Juil, 19:10" },
        { sender: "customer", text: "Merci pour les précisions, je valide l'achat !", date: "03 Juil, 10:15" }
      ]
    }
  ]);

  useEffect(() => {
    if (activeTab === "messages") {
      scrollToBottom();
    }
  }, [activeTab, activeThread, threads]);

  const fetchThreads = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.threads && data.threads.length > 0) {
          setThreads(data.threads);
          // Auto select first thread if activeThread is not in the list
          if (!data.threads.some((t: any) => t.id === activeThread)) {
            setActiveThread(data.threads[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching threads:", e);
    }
  };

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 6000);
    return () => clearInterval(interval);
  }, [token, activeTab]);

  const handleSelectThread = async (threadId: string) => {
    setActiveThread(threadId);
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread: false } : t));
    if (!token) return;
    try {
      await fetch(`/api/messages/${threadId}/read`, {
        method: "POST",
        headers: { Authorization: token }
      });
    } catch (e) {
      console.error("Error marking thread as read:", e);
    }
  };

  // Local state for Promo Codes
  const [promos, setPromos] = useState<any[]>([
    { id: "p1", code: "MIABEASI2026", type: "pourcentage", value: 10, expiry: "2026-12-31", active: true },
    { id: "p2", code: "TERROIR5", type: "fixe", value: 2500, expiry: "2026-08-15", active: true }
  ]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState<"pourcentage" | "fixe">("pourcentage");
  const [newPromoValue, setNewPromoValue] = useState("");
  const [newPromoExpiry, setNewPromoExpiry] = useState("");

  // Orders lists state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Deletion Confirmation States
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [promoToDeleteId, setPromoToDeleteId] = useState<string | null>(null);

  // Stats
  const sellerProducts = products.filter(p => p.vendeurId === user?.id || p.partenaire === user?.businessName);
  const totalProductsCount = sellerProducts.length;
  const outOfStockCount = sellerProducts.filter(p => !p.stock || Number(p.stock) <= 0).length;
  const pendingValidationCount = sellerProducts.filter(p => p.valide === false || p.status === "attente").length;

  // Sync advertised products
  useEffect(() => {
    if (sellerProducts.length > 0 && advertisedProducts.length === 0) {
      setAdvertisedProducts(sellerProducts.slice(0, 3).map(p => p.id));
    }
  }, [products]);

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
      <aside className="w-64 bg-stone-900 text-stone-200 flex flex-col justify-between select-none border-r border-stone-800 shrink-0 h-full font-sans">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center bg-[#0B4D26] rounded-lg p-1 text-white shadow-[0_2px_6px_rgba(11,77,38,0.3)]">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-black tracking-widest text-white uppercase font-sans">MIABÉ ASI SHOP</h2>
                <span className="text-[9px] font-bold text-[#d4af37] uppercase tracking-wider font-sans">Studio Artisan</span>
              </div>
            </div>
          </div>

          {/* Profile Quick Glance */}
          <div className="p-4 bg-stone-950/40 border-b border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[#d4af37] font-black text-sm uppercase">
              {shopLogoText}
            </div>
            <div className="text-left min-w-0 font-sans">
              <p className="text-xs font-bold text-white truncate">{shopName || user?.businessName || user?.name || "Boutique Artisanale"}</p>
              <span className="inline-flex items-center gap-1 text-[8.5px] font-black text-[#d4af37] uppercase tracking-wider mt-0.5">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                Vendeur Certifié
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1 text-left">
            {onBackToSite && (
              <button
                onClick={onBackToSite}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider text-amber-500 hover:bg-stone-850 hover:text-amber-400 transition-all cursor-pointer border border-amber-500/20 bg-amber-500/5 mb-3"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Retour au site</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <div className="flex-grow flex items-center justify-between">
                <span>Fiches produits</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "products" ? "bg-stone-900 text-white" : "bg-stone-800 text-stone-300"}`}>
                  {totalProductsCount}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <div className="flex-grow flex items-center justify-between">
                <span>Commandes & Envois</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "orders" ? "bg-stone-900 text-white" : "bg-stone-800 text-stone-300"}`}>
                  {totalOrdersCount}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("messages");
                // Clear notification badge
                setThreads(prev => prev.map(t => t.id === "thread-1" ? { ...t, unread: false } : t));
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "messages"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <div className="flex-grow flex items-center justify-between">
                <span>Messages clients</span>
                {threads.some(t => t.unread) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("ads")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "ads"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>Publicité Miabé Asi Ads</span>
            </button>

            <button
              onClick={() => setActiveTab("promos")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "promos"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <Percent className="w-4 h-4 shrink-0" />
              <span>Codes Promo & Coupons</span>
            </button>

            <button
              onClick={() => setActiveTab("shop_profile")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "shop_profile"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Ma Boutique (Profil)</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <Star className="w-4 h-4 shrink-0" />
              <span>Avis Clients</span>
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "wallet"
                  ? "bg-[#0B4D26] text-white font-bold shadow-md shadow-[#0B4D26]/20"
                  : "text-stone-400 hover:bg-stone-850 hover:text-white"
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>Comptabilité & Payouts</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 text-left">
          <p className="text-[9px] text-stone-500 uppercase tracking-widest font-mono">
            Mode Boutique : <strong className="text-[#d4af37]">{user?.vendeurMode || "AUTONOME"}</strong>
          </p>
          <p className="text-[8px] text-stone-600 mt-1">
            Miabé Asi Shop Studio • Lomé, Togo
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
              className="bg-[#0B4D26] hover:bg-[#0B4D26]/90 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg transition-all"
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
                        <span className="w-2.5 h-2.5 bg-[#0B4D26] rounded-xs inline-block"></span>
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
                              fill="#0B4D26"
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
                        <p className="font-bold text-[#0B4D26] uppercase">{activeTooltip.label}</p>
                        <p className="mt-0.5">{activeTooltip.value}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Top Selling Artisans Products List */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl text-left">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Vos Best-Sellers</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#0B4D26]" />
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
                            <span className="text-[9px] font-extrabold text-[#0B4D26] uppercase tracking-wider block mt-0.5">{prod.categorie}</span>
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

              {/* Quick Navigation Help Alert (Miabé Asi Advisor Checklist Style) */}
              <div className="bg-[#0B4D26]/5 border border-[#0B4D26]/20 p-4 rounded-xl flex items-start gap-3">
                <Store className="w-5 h-5 text-[#0B4D26] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">Conseils & Recommandations pour votre Boutique</h5>
                  <div className="mt-2 space-y-2 text-xs text-stone-600 leading-relaxed font-sans">
                    <p className="flex items-center gap-1.5">
                      <span className="text-[#0B4D26] font-extrabold">🌟 Améliorez vos fiches</span> : Les produits avec des photos claires et lumineuses et au moins 5 mots-clés de recherche enregistrent 3x plus d'intérêt des clients togolais.
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-[#0B4D26] font-extrabold">📦 Livraison gratuite</span> : Proposer la livraison gratuite à Lomé en créant le coupon `LOMEGRATUIT` dans l'onglet des promotions attire 40% de commandes supplémentaires !
                    </p>
                  </div>
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
                      setNewProdPriceBarre("");
                      setNewProdStock("");
                      setNewProdCategory(categories[0] || "");
                      setNewProdImageUrl("");
                      setNewProdImages([]);
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
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Prix barré (FCFA) - Optionnel</label>
                        <input
                          type="number"
                          value={newProdPriceBarre}
                          onChange={(e) => setNewProdPriceBarre(e.target.value)}
                          placeholder="Ex: 20000"
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
                      <div className="md:col-span-3">
                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                          <span>Photos du produit (Recommandé, optionnel)</span>
                          <span className="text-[9.5px] font-bold text-emerald-600">
                            {newProdImages.length} photo(s) ajoutée(s)
                          </span>
                        </label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {/* File Selection Box */}
                          <div className="border-2 border-dashed border-stone-200 hover:border-neutral-900 rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-300 relative cursor-pointer min-h-[120px] bg-stone-50 group">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                  Array.from(files).forEach((file) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === "string") {
                                        setNewProdImages((prev) => [...prev, reader.result as string]);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center flex flex-col items-center gap-1">
                              <Plus className="w-6 h-6 text-stone-400 group-hover:text-neutral-900 transition-colors" />
                              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 group-hover:text-neutral-900">Ajouter des photos</span>
                              <span className="text-[8px] text-stone-400 font-medium">Format: JPG, PNG, WEBP</span>
                            </div>
                          </div>

                          {/* Previews */}
                          {newProdImages.map((img, idx) => (
                            <div key={idx} className="relative rounded-xl overflow-hidden border border-stone-200 group aspect-square bg-stone-100 flex items-center justify-center">
                              <img
                                src={img}
                                alt={`Aperçu ${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewProdImages((prev) => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Supprimer la photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider z-10 font-sans">
                                {idx === 0 ? "Principale" : `Photo ${idx + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>

                        {newProdImages.length < 1 && (
                          <p className="text-[10px] text-amber-600 font-medium mt-2 flex items-center gap-1 font-sans">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Ajouter des photos permet d'augmenter vos ventes de 80%.</span>
                          </p>
                        )}
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
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-mono font-black text-neutral-900">{formatFCFA(prod.prix)}</span>
                            {prod.prixBarre && (
                              <span className="text-[10px] font-mono text-stone-400 line-through">{formatFCFA(prod.prixBarre)}</span>
                            )}
                          </div>
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
                              setNewProdPriceBarre(prod.prixBarre ? String(prod.prixBarre) : "");
                              setNewProdStock(String(prod.stock || 0));
                              setNewProdCategory(prod.categorie);
                              setNewProdImageUrl(prod.images[0]);
                              setNewProdImages(prod.images || []);
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
                              setProductToDeleteId(prod.id);
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
                                onClick={() => setPromoToDeleteId(p.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
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
                              <p className="text-xs font-sans font-bold text-neutral-800">Votre boutique Miabé Asi :</p>
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
                      const method = "PayDunya";
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
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Réseau / Mode de reversement</label>
                        <div className="w-full px-3 py-2 border border-stone-200 bg-stone-100 rounded-lg text-xs text-neutral-800 font-bold">
                          Transfert Mobile (T-Money, Flooz, Wave)
                        </div>
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Numéro de téléphone (+228)</label>
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

          {/* 7. CONVERSATIONS (MESSAGES VIEW) */}
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[580px] bg-white border border-stone-200 rounded-xl overflow-hidden animate-fade-in font-sans">
              
              {/* Left Sidebar: Thread List */}
              <div className="border-r border-stone-200 flex flex-col h-full bg-stone-50/50">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider">Boîte de réception</h4>
                  <span className="text-[10px] bg-[#0B4D26]/10 text-[#0B4D26] font-bold px-2 py-0.5 rounded-full">
                    {threads.filter(t => t.unread).length} non lus
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => {
                        handleSelectThread(thread.id);
                      }}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 cursor-pointer border-0 ${
                        activeThread === thread.id ? "bg-[#0B4D26]/5 border-l-4 border-[#0B4D26]" : "bg-transparent hover:bg-stone-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                        {thread.avatar}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 truncate">{thread.customer}</span>
                          {thread.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0B4D26]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#0B4D26] font-semibold truncate mt-0.5">{thread.product}</p>
                        <p className="text-[11px] text-stone-500 truncate mt-1 leading-tight">{thread.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Panel: Active Chat Thread */}
              <div className="lg:col-span-2 flex flex-col h-full bg-white">
                {(() => {
                  const currentThread = threads.find(t => t.id === activeThread);
                  if (!currentThread) return (
                    <div className="flex flex-col items-center justify-center h-full text-stone-400 text-xs">
                      Sélectionnez une conversation pour démarrer
                    </div>
                  );

                  return (
                    <>
                      {/* Thread Header */}
                      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs uppercase">
                            {currentThread.avatar}
                          </div>
                          <div className="text-left">
                            <h5 className="text-xs font-extrabold text-stone-900">{currentThread.customer}</h5>
                            <span className="text-[10px] text-stone-400 font-medium">Sujet : <strong className="text-stone-700">{currentThread.product}</strong></span>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Messagerie Interne</span>
                      </div>

                      {/* Messages History List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/20 max-h-[340px] min-h-[340px] scrollbar-thin scrollbar-thumb-stone-300">
                        {currentThread.messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex flex-col ${msg.sender === "seller" ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[9px] font-bold text-stone-400">
                                {msg.sender === "seller" ? "Vous" : currentThread.customer.split(" ")[0]}
                              </span>
                              <span className="text-[8px] text-stone-300 font-mono">{msg.date}</span>
                            </div>
                            <div
                                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                msg.sender === "seller"
                                  ? "bg-[#0B4D26] text-white rounded-tr-none"
                                  : "bg-white border border-stone-200 text-stone-800 rounded-tl-none"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex flex-col items-start animate-pulse">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[9px] font-bold text-stone-400">
                                {currentThread.customer.split(" ")[0]}
                              </span>
                              <span className="text-[8px] text-stone-300 font-mono">En train d'écrire...</span>
                            </div>
                            <div className="bg-white border border-stone-200 text-stone-500 rounded-xl rounded-tl-none px-3 py-1.5 text-xs flex items-center gap-1">
                              <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Saved Templates Assistant */}
                      <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center gap-2 flex-wrap select-none">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">Modèles rapides :</span>
                        <button
                          onClick={() => setChatMessage("Bonjour ! Merci beaucoup d'avoir choisi Miabé Asi. Votre commande est bien enregistrée et nous préparons vos produits artisanaux faits main avec le plus grand soin. À très bientôt !")}
                          className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                        >
                          ✉️ Merci & Accueil
                        </button>
                        <button
                          onClick={() => setChatMessage("Bonjour ! Nous vous informons que votre colis Miabé Asi a été expédié aujourd'hui depuis notre atelier de Lomé. Vous recevrez une notification par SMS très bientôt. Merci pour votre confiance !")}
                          className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                        >
                          📦 Expédition
                        </button>
                        <button
                          onClick={() => setChatMessage("Bonjour ! Oui, tout à fait ! Nous pouvons adapter les dimensions et couleurs selon vos souhaits. Veuillez nous envoyer vos mesures exactes ou préférences par message. Cordialement.")}
                          className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                        >
                          🎨 Personnalisé
                        </button>
                      </div>

                      {/* Message Input Box */}
                      <form
                      onSubmit={async (e) => {
                          e.preventDefault();
                          if (!chatMessage.trim()) return;

                          const textToSend = chatMessage;
                          setChatMessage("");

                          // Append seller message locally first for responsive feel
                          setThreads(prev => prev.map(t => {
                            if (t.id === activeThread) {
                              return {
                                ...t,
                                lastMessage: textToSend,
                                messages: [...t.messages, { sender: "seller", text: textToSend, date: "À l'instant" }]
                              };
                            }
                            return t;
                          }));

                          // Post seller message to backend API
                          try {
                            const response = await fetch("/api/messages", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": token || ""
                              },
                              body: JSON.stringify({
                                threadId: activeThread,
                                text: textToSend
                              })
                            });
                            if (response.ok) {
                              const data = await response.json();
                              if (data.success && data.thread) {
                                setThreads(prev => prev.map(t => t.id === activeThread ? data.thread : t));
                              }
                            }
                          } catch (err) {
                            console.error("Error sending reply:", err);
                          }

                          // Simulate buyer typing reply
                          setTimeout(() => {
                            setIsTyping(true);
                          }, 1000);

                          setTimeout(async () => {
                            setIsTyping(false);
                            
                            const replyText = "Parfait ! Merci beaucoup pour votre réactivité légendaire et ce service sur-mesure. Je valide mon achat immédiatement !";
                            
                            // Send emulated reply to the database so it's fully saved and persistent!
                            try {
                              const customerAuthToken = "user-token-" + btoa("client-adjoa");
                              const response = await fetch("/api/messages", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": customerAuthToken
                                },
                                body: JSON.stringify({
                                  threadId: activeThread,
                                  text: replyText
                                })
                              });
                              if (response.ok) {
                                const data = await response.json();
                                if (data.success && data.thread) {
                                  setThreads(prev => prev.map(t => t.id === activeThread ? data.thread : t));
                                  if (currentThread) {
                                    showToast("Nouveau message reçu de " + currentThread.customer.split(" ")[0]);
                                  }
                                  return;
                                }
                              }
                            } catch (e) {
                              console.error(e);
                            }

                            // Fallback local update
                            setThreads(prev => prev.map(t => {
                              if (t.id === activeThread) {
                                return {
                                  ...t,
                                  lastMessage: replyText,
                                  messages: [...t.messages, {
                                    sender: "customer",
                                    text: replyText,
                                    date: "À l'instant"
                                  }]
                                };
                              }
                              return t;
                            }));
                            if (currentThread) {
                              showToast("Nouveau message reçu de " + currentThread.customer.split(" ")[0]);
                            }
                          }, 3500);
                        }}
                        className="p-4 border-t border-stone-200 flex gap-2"
                      >
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Écrivez votre réponse artisanale ici..."
                          className="flex-grow px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#0B4D26]"
                        />
                        <button
                          type="submit"
                          className="bg-[#0B4D26] hover:bg-[#0B4D26]/90 text-white font-extrabold uppercase tracking-widest px-4 text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Envoyer
                        </button>
                      </form>
                    </>
                  );
                })()}
              </div>

            </div>
          )}

          {/* 8. SPONSORED ADS CAMPAIGN SIMULATOR (ADS VIEW) */}
          {activeTab === "ads" && (
            <div className="space-y-6 animate-fade-in text-left font-sans">
              
              {/* Header Title Banner */}
              <div className="bg-[#0B4D26]/5 border border-[#0B4D26]/15 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#0B4D26]">
                    <Megaphone className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Miabé Asi Ads</h4>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Boostez la visibilité de vos fiches produits sur le catalogue Miabé Asi. Payez uniquement lorsque des acheteurs cliquent sur vos annonces.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-500">Campagne active :</span>
                  <button
                    onClick={() => setAdsEnabled(!adsEnabled)}
                    className="focus:outline-none cursor-pointer border-0 bg-transparent"
                  >
                    {adsEnabled ? (
                      <div className="w-12 h-6 rounded-full bg-[#0B4D26] p-0.5 flex justify-end transition-colors">
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                      </div>
                    ) : (
                      <div className="w-12 h-6 rounded-full bg-stone-200 p-0.5 flex justify-start transition-colors">
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats & Controls Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Budget Slider Card */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Configuration du budget</h5>
                    <p className="text-[11px] text-stone-500 leading-normal mb-4">
                      Définissez votre budget publicitaire quotidien. Vous pouvez l'augmenter ou le baisser à tout moment.
                    </p>
                    
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center mb-4 select-none">
                      <span className="text-[9px] font-bold text-stone-400 block uppercase tracking-wider">BUDGET PAR JOUR</span>
                      <p className="text-2xl font-mono font-black text-[#0B4D26] mt-1">{formatFCFA(dailyBudget)}</p>
                    </div>

                    <input
                      type="range"
                      min="200"
                      max="5000"
                      step="100"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(Number(e.target.value))}
                      disabled={!adsEnabled}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#0B4D26] mb-3"
                    />
                    
                    <div className="flex justify-between text-[10px] text-stone-400 font-bold font-mono">
                      <span>200 F</span>
                      <span>2 500 F</span>
                      <span>5 000 F</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-neutral-400 font-medium leading-relaxed mt-4 pt-4 border-t border-stone-100">
                    💡 Avec un budget de {formatFCFA(dailyBudget)}/jour, vos fiches publicitaires apparaîtront environ <strong className="text-stone-700">{Math.floor(dailyBudget * 0.12 * 5.4)} fois</strong> par jour en haut du catalogue de Miabé Asi.
                  </p>
                </div>

                {/* Simulated Campaign Performance Metrics */}
                <div className="lg:col-span-2 bg-white border border-stone-200 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h5 className="text-xs font-black text-stone-700 uppercase tracking-wide">Indicateurs de Performance (Est. 30j)</h5>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded-full">ROAS moyen : {(adsEnabled ? "3.2x" : "0.0x")}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    
                    {/* Stat 1: Impressions */}
                    <div className="bg-stone-50/50 p-3 rounded-lg border border-stone-150 text-left">
                      <span className="text-[9px] font-bold text-stone-400 block uppercase">Impressions</span>
                      <p className="text-lg font-mono font-black text-stone-800 mt-1">
                        {(adsEnabled ? Math.floor(dailyBudget * 0.15 * 5.4 * 30).toLocaleString() : 0)}
                      </p>
                      <span className="text-[9px] text-stone-400 block mt-0.5">Vues sur le site</span>
                    </div>

                    {/* Stat 2: Clics */}
                    <div className="bg-stone-50/50 p-3 rounded-lg border border-stone-150 text-left">
                      <span className="text-[9px] font-bold text-stone-400 block uppercase">Clics reçus</span>
                      <p className="text-lg font-mono font-black text-[#0B4D26] mt-1">
                        {(adsEnabled ? Math.floor(dailyBudget * 0.15 * 0.28 * 30).toLocaleString() : 0)}
                      </p>
                      <span className="text-[9px] text-stone-400 block mt-0.5">CTR : 5.18%</span>
                    </div>

                    {/* Stat 3: Budget Dépensé */}
                    <div className="bg-stone-50/50 p-3 rounded-lg border border-stone-150 text-left">
                      <span className="text-[9px] font-bold text-stone-400 block uppercase">Budget dépensé</span>
                      <p className="text-lg font-mono font-black text-stone-800 mt-1">
                        {formatFCFA(adsEnabled ? dailyBudget * 30 : 0)}
                      </p>
                      <span className="text-[9px] text-stone-400 block mt-0.5">Sur 30 jours</span>
                    </div>

                    {/* Stat 4: Chiffre d'affaires publicitaire */}
                    <div className="bg-stone-50/50 p-3 rounded-lg border border-stone-150 text-left">
                      <span className="text-[9px] font-bold text-emerald-600 block uppercase">CA Publicitaire</span>
                      <p className="text-lg font-mono font-black text-emerald-600 mt-1">
                        {formatFCFA(adsEnabled ? Math.floor(dailyBudget * 0.15 * 0.035 * 30) * 4500 : 0)}
                      </p>
                      <span className="text-[9px] text-stone-400 block mt-0.5">Ventes attribuées</span>
                    </div>

                  </div>

                  <div className="bg-[#0B4D26]/5 p-3.5 rounded-lg border border-[#0B4D26]/15 text-xs text-stone-600 leading-relaxed font-sans mt-2">
                    📢 <strong>Lancement express :</strong> Les fiches sponsorisées apparaissent avec le petit badge <span className="bg-[#0B4D26] text-white text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-xs ml-1">Annonce</span> en haut des recherches de produits locaux au Togo.
                  </div>
                </div>

              </div>

              {/* Toggle Advertising for Specific Listings */}
              <div className="bg-white border border-stone-200 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                  <h5 className="text-xs font-black text-stone-700 uppercase tracking-wide">Fiches produits annoncées ({advertisedProducts.length})</h5>
                  <p className="text-[10px] text-stone-400">Sélectionnez les articles individuels à promouvoir avec votre budget actif.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerProducts.map((prod) => {
                    const isAdvertised = advertisedProducts.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all ${
                          isAdvertised ? "border-[#0B4D26] bg-[#0B4D26]/5" : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.images && prod.images[0] ? prod.images[0] : "/images/placeholder.jpg"}
                            alt={prod.nom}
                            className="w-10 h-10 object-cover rounded-md border border-stone-150 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-stone-900 truncate">{prod.nom}</p>
                            <span className="text-[10px] font-mono font-black text-stone-600 block mt-0.5">{formatFCFA(prod.prix)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (isAdvertised) {
                              setAdvertisedProducts(prev => prev.filter(id => id !== prod.id));
                            } else {
                              setAdvertisedProducts(prev => [...prev, prod.id]);
                            }
                          }}
                          className={`text-[9.5px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isAdvertised
                              ? "bg-[#0B4D26] border-[#0B4D26] text-white hover:bg-[#0B4D26]/80"
                              : "border-stone-200 text-stone-600 bg-white hover:bg-stone-50"
                          }`}
                        >
                          {isAdvertised ? "Sponsorisé" : "Annoncer"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 9. MA BOUTIQUE (PROFILE CUSTOMIZATION VIEW & LIVE PREVIEW) */}
          {activeTab === "shop_profile" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in text-left font-sans">
              
              {/* Profile Config Form Card */}
              <div className="xl:col-span-1 flex flex-col gap-6">
                <div className="bg-white border border-stone-200 p-5 rounded-xl h-fit space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#0B4D26]" />
                      <span>Modifier ma Vitrine</span>
                    </h4>
                    <p className="text-[10px] text-stone-400 font-medium">
                      Configurez le logo, la bannière, le slogan et l'annonce publique de votre boutique de créateur.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">Nom Public de la boutique</label>
                      <input
                        type="text"
                        value={shopName}
                        onChange={(e) => {
                          setShopName(e.target.value);
                          if (e.target.value) {
                            setShopLogoText(e.target.value.substring(0, 2).toUpperCase());
                          }
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">Slogan</label>
                      <input
                        type="text"
                        value={shopSlogan}
                        onChange={(e) => setShopSlogan(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">Annonce de la boutique</label>
                      <textarea
                        value={shopAnnouncement}
                        onChange={(e) => setShopAnnouncement(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#0B4D26] leading-relaxed resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">Histoire de l'Artisan</label>
                      <textarea
                        value={shopStory}
                        onChange={(e) => setShopStory(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#0B4D26] leading-relaxed resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">Photo de couverture (Bannière URL)</label>
                      <input
                        type="text"
                        value={shopBanner}
                        onChange={(e) => setShopBanner(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-600 focus:outline-none focus:border-[#0B4D26]"
                      />
                      <div className="flex gap-2 mt-1.5 select-none">
                        <button
                          type="button"
                          onClick={() => setShopBanner("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80")}
                          className="bg-stone-100 text-stone-600 hover:bg-stone-200 text-[8.5px] font-bold px-2 py-1 rounded-sm border-0 cursor-pointer"
                        >
                          Atelier Bois
                        </button>
                        <button
                          type="button"
                          onClick={() => setShopBanner("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80")}
                          className="bg-stone-100 text-stone-600 hover:bg-stone-200 text-[8.5px] font-bold px-2 py-1 rounded-sm border-0 cursor-pointer"
                        >
                          Tissage & Pagne
                        </button>
                        <button
                          type="button"
                          onClick={() => setShopBanner("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80")}
                          className="bg-stone-100 text-stone-600 hover:bg-stone-200 text-[8.5px] font-bold px-2 py-1 rounded-sm border-0 cursor-pointer"
                        >
                          Miel & Épices
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast("Vitrine de la boutique mise à jour avec succès !")}
                      className="w-full bg-[#0B4D26] hover:bg-[#0B4D26]/90 text-white font-black uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer text-[10px] transition-all"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>

                {/* PIN Code Security Card */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl h-fit space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Sécurité & Code PIN</span>
                    </h4>
                    <p className="text-[10px] text-stone-400 font-medium">
                      Sécurisez l'accès à votre espace vendeur, votre solde de compte et vos retraits d'argent.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {user?.vendeurPin ? (
                      <div className="bg-emerald-50 border border-emerald-200/50 p-2.5 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-[10.5px] font-bold text-emerald-800">Votre espace de vente est actuellement sécurisé par un code PIN.</span>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200/50 p-2.5 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                        <span className="text-[10.5px] font-bold text-amber-800">Aucun code PIN de sécurité configuré. Votre espace n'est pas protégé !</span>
                      </div>
                    )}

                    {user?.vendeurPin && (
                      <div>
                        <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">Code PIN Actuel</label>
                        <input
                          type="password"
                          placeholder="Saisissez votre code PIN à 4 chiffres actuel"
                          maxLength={4}
                          value={currentPinCheck}
                          onChange={(e) => setCurrentPinCheck(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                        {user?.vendeurPin ? "Nouveau Code PIN à 4 chiffres" : "Code PIN à 4 chiffres de sécurité"}
                      </label>
                      <input
                        type="password"
                        placeholder="Ex: 1234"
                        maxLength={4}
                        value={newPinValue}
                        onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 uppercase tracking-widest mb-1">Confirmer le Code PIN</label>
                      <input
                        type="password"
                        placeholder="Saisissez à nouveau"
                        maxLength={4}
                        value={confirmNewPinValue}
                        onChange={(e) => setConfirmNewPinValue(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (user?.vendeurPin && currentPinCheck !== user.vendeurPin) {
                          showToast("❌ Le code PIN actuel saisi est incorrect.");
                          return;
                        }
                        if (newPinValue.length !== 4) {
                          showToast("❌ Le code PIN doit comporter exactement 4 chiffres.");
                          return;
                        }
                        if (newPinValue !== confirmNewPinValue) {
                          showToast("❌ Les deux codes saisis ne correspondent pas.");
                          return;
                        }

                        setIsUpdatingPin(true);
                        try {
                          const res = await fetch("/api/auth/update-profile", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": token || ""
                            },
                            body: JSON.stringify({ vendeurPin: newPinValue })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setUser(data.user);
                            setCurrentPinCheck("");
                            setNewPinValue("");
                            setConfirmNewPinValue("");
                            showToast("🔒 Code PIN mis à jour avec succès ! Votre espace est sécurisé.");
                          } else {
                            showToast(`Erreur : ${data.error}`);
                          }
                        } catch {
                          showToast("Erreur lors de la mise à jour du code PIN.");
                        } finally {
                          setIsUpdatingPin(false);
                        }
                      }}
                      disabled={isUpdatingPin}
                      className="w-full bg-[#0B4D26] hover:bg-emerald-850 text-white font-black uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer text-[10px] transition-all disabled:opacity-50"
                    >
                      {isUpdatingPin ? "Mise à jour..." : "Enregistrer le Code PIN"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Public Shop Live Preview Area */}
              <div className="xl:col-span-2 bg-[#FAF9F6] border border-stone-200 rounded-xl overflow-hidden shadow-xs self-start">
                {/* Preview Banner Label */}
                <div className="bg-stone-900 text-white px-4 py-2 flex items-center justify-between select-none">
                  <span className="text-[9px] font-black tracking-widest uppercase text-stone-400">Aperçu en direct (Ce que voient vos acheteurs)</span>
                  <span className="text-[9.5px] bg-[#0B4D26] text-white font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono">PUBLIC LIVE PREVIEW</span>
                </div>

                {/* Banner Background */}
                <div className="h-36 w-full relative">
                  <img
                    src={shopBanner}
                    alt="Bannière de boutique"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Seller Identity Bar */}
                <div className="bg-white px-6 py-5 border-b border-stone-200 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    {/* Logo Avatar */}
                    <div className="w-16 h-16 rounded-full bg-stone-900 border-4 border-white -mt-12 shadow-md flex items-center justify-center text-white font-black text-xl uppercase relative z-10">
                      {shopLogoText}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h3 className="text-sm font-black text-stone-900">{shopName}</h3>
                        <span className="bg-[#0B4D26]/10 text-[#0B4D26] text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          Créateur Certifié
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 italic mt-0.5">{shopSlogan}</p>
                      <p className="text-[10px] text-stone-400 font-medium mt-1 font-sans">📍 Lomé, Togo • Fait main</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-1.5 text-center sm:text-right shrink-0">
                    <span className="text-[11px] font-bold text-stone-800">5.0 ★★★★★</span>
                    <span className="text-[9px] text-stone-500 font-bold font-sans">98 ventes réussies</span>
                    <button
                      onClick={() => showToast("Simulation : Ouverture du chat client")}
                      className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg mt-1 cursor-pointer transition-colors"
                    >
                      💬 Contacter l'artisan
                    </button>
                  </div>
                </div>

                {/* Announcement Banner */}
                <div className="bg-[#FAF8F6] p-4 border-b border-stone-200/60 flex items-start gap-3">
                  <div className="text-[14px] shrink-0 mt-0.5">📢</div>
                  <div className="text-left font-sans text-[11px] leading-relaxed text-stone-600">
                    <strong className="text-stone-800">Annonce de la boutique :</strong> {shopAnnouncement}
                  </div>
                </div>

                {/* Live Artisan Biography */}
                <div className="bg-white p-5 border-b border-stone-200/60 text-left font-sans">
                  <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">Notre histoire & notre savoir-faire</h4>
                  <p className="text-xs text-stone-600 leading-relaxed italic">{shopStory}</p>
                </div>

                {/* Products Catalog preview */}
                <div className="p-6">
                  <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-4 text-left">Fiches produits publiées ({sellerProducts.length})</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {sellerProducts.map((prod) => (
                      <div key={prod.id} className="bg-white border border-stone-150 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-28 w-full bg-stone-50 relative">
                          <img
                            src={prod.images && prod.images[0] ? prod.images[0] : "/images/placeholder.jpg"}
                            alt={prod.nom}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 text-left">
                          <h5 className="text-[11px] font-extrabold text-stone-900 truncate">{prod.nom}</h5>
                          <span className="text-[8px] bg-stone-100 text-stone-500 font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm inline-block mt-1 font-sans">{prod.categorie}</span>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 font-mono text-xs">
                            <span className="font-black text-stone-800">{formatFCFA(prod.prix)}</span>
                            <span className="text-[9px] text-stone-400 font-sans">Stock: {prod.stock || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {sellerProducts.length === 0 && (
                      <div className="col-span-3 text-center py-12 text-stone-400 text-xs font-sans">
                        Aucun produit publié à afficher dans la boutique publique.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Custom product deletion confirmation modal */}
      {productToDeleteId && (() => {
        const prod = products.find(p => p.id === productToDeleteId);
        if (!prod) return null;
        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs select-none">
            <div className="bg-white border border-stone-200 p-6 md:p-8 rounded-none max-w-sm w-full shadow-2xl space-y-5 border-t-4 border-t-red-650">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <p className="font-sans font-extrabold uppercase text-[9px] tracking-widest text-[#d4af37]">Action Irréversible</p>
                <h4 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight leading-none text-center">Supprimer ce produit ?</h4>
              </div>

              <div className="flex items-center gap-3 bg-stone-50 p-2.5 border border-stone-150 rounded-none">
                <div className="w-10 h-10 rounded-none overflow-hidden bg-stone-100 border border-stone-150 shrink-0">
                  <img src={prod.images && prod.images[0] ? prod.images[0] : "/images/placeholder.jpg"} alt={prod.nom} className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <h5 className="font-bold text-[11px] text-neutral-900 line-clamp-1">{prod.nom}</h5>
                  <p className="text-neutral-500 text-[9px] font-mono uppercase tracking-wider">{prod.categorie}</p>
                </div>
              </div>

              <p className="text-xs text-neutral-600 text-center leading-relaxed font-sans">
                Voulez-vous vraiment supprimer définitivement <strong className="text-neutral-900">"{prod.nom}"</strong> de votre catalogue ?
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setProductToDeleteId(null)}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer border border-stone-150 text-center"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleDeleteProduct(prod.id);
                    setProductToDeleteId(null);
                  }}
                  className="w-full py-2 bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer text-center border border-red-650"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Custom promo deletion confirmation modal */}
      {promoToDeleteId && (() => {
        const promo = promos.find(p => p.id === promoToDeleteId);
        if (!promo) return null;
        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs select-none">
            <div className="bg-white border border-stone-200 p-6 md:p-8 rounded-none max-w-sm w-full shadow-2xl space-y-5 border-t-4 border-t-red-650">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <p className="font-sans font-extrabold uppercase text-[9px] tracking-widest text-[#d4af37]">Code Promo</p>
                <h4 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight leading-none text-center">Supprimer le code ?</h4>
              </div>

              <div className="bg-amber-50 p-3 border border-amber-200 text-center">
                <span className="font-mono font-black text-lg text-amber-950 uppercase tracking-wider">{promo.code}</span>
              </div>

              <p className="text-xs text-neutral-600 text-center leading-relaxed font-sans">
                Voulez-vous vraiment désactiver et supprimer le code promo <strong className="text-neutral-900">"{promo.code}"</strong> ?
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setPromoToDeleteId(null)}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer border border-stone-150 text-center"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    deletePromo(promo.id);
                    setPromoToDeleteId(null);
                  }}
                  className="w-full py-2 bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer text-center border border-red-650"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

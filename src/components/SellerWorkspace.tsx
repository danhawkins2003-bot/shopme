import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Image as ImageIcon,
  Globe,
  MessageSquare,
  CreditCard,
  Crown,
  Plus,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Copy,
  Check,
  Phone,
  ArrowUpRight,
  Percent,
  Wallet,
  ShieldCheck,
  Send,
  Sparkles,
  Info,
  Menu,
  ArrowLeft,
  ChevronDown,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Sliders,
  Layers,
  Award,
  MapPin,
  Truck,
  Lock,
  Download,
  FileText,
  BarChart3
} from "lucide-react";
import { Product, SellerPlan } from "../types";
import {
  SUPPORTED_COUNTRIES,
  getCountryByCode,
  isSupportedCountry,
  formatPrice,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY_CODE
} from "../data/westAfricanCountries";

interface SellerWorkspaceProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  token: string | null;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (msg: string) => void;
  formatFCFA: (amount: number) => string;
  wallet: any;
  withdrawalHistory: any[];
  onWithdrawalRequest: (amount: string, method: string, phone: string) => Promise<void>;
  handleProductSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  isEditingProduct: any | null;
  setIsEditingProduct: (p: any | null) => void;
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
  setNewProdImages: (imgs: string[]) => void;
  categories: string[];
  onBackToSite: () => void;
  onNavigateToPublicShop?: (slug: string) => void;
}

type TabType =
  | "dashboard"
  | "products"
  | "orders"
  | "featured"
  | "banner"
  | "shop"
  | "messages"
  | "reviews"
  | "wallet"
  | "subscription";

export const SellerWorkspace: React.FC<SellerWorkspaceProps> = ({
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
  onBackToSite,
  onNavigateToPublicShop
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Seller plan resolution: "Gratuit" | "PRO" | "BUSINESS"
  const currentPlan: SellerPlan =
    user?.vendeurPlan ||
    (user?.vendeurSubscription === "Offre 3"
      ? "BUSINESS"
      : user?.vendeurSubscription === "Offre 2"
      ? "PRO"
      : "Gratuit");

  // Shop slug resolution
  const currentSlug: string = user?.boutiqueSlug || user?.vendeurSlug || "";

  // Seller country and currency resolution (defaults to TG / XOF if not set)
  const sellerCountryCode = (user?.countryCode && isSupportedCountry(user.countryCode))
    ? user.countryCode.toUpperCase()
    : DEFAULT_COUNTRY_CODE;
  const sellerCountry = getCountryByCode(sellerCountryCode);
  const sellerCurrencyCode = sellerCountry.currencyCode;

  // Format prices using the seller's registered currency
  const formatSellerPrice = (amount: number | null | undefined): string => {
    return formatPrice(amount, sellerCurrencyCode);
  };

  // -------------------------------------------------------------
  // PRODUCTS FILTER & STATE
  // -------------------------------------------------------------
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("all");
  const [selectedProductStatus, setSelectedProductStatus] = useState<"all" | "actif" | "inactif" | "en_rupture">("all");

  const myProducts = products.filter((p) => {
    const isOwner =
      p.vendeurId === user?.id ||
      (p.partenaire && user?.businessName && p.partenaire.toLowerCase() === user.businessName.toLowerCase());
    return isOwner;
  });

  const countAll = myProducts.length;
  const countActif = myProducts.filter(p => (p.status === "actif" || (!p.status && (p.stock || 0) > 0))).length;
  const countInactif = myProducts.filter(p => p.status === "inactif").length;
  const countRupture = myProducts.filter(p => p.status === "en_rupture" || (p.stock || 0) <= 0).length;

  const filteredProducts = myProducts.filter((p) => {
    const matchesSearch =
      p.nom.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      selectedProductCategory === "all" || p.categorie === selectedProductCategory;

    const isRupture = p.status === "en_rupture" || (p.stock || 0) <= 0;
    const isInactif = p.status === "inactif";
    const isActif = !isInactif && !isRupture;

    let matchesStatus = true;
    if (selectedProductStatus === "actif") matchesStatus = isActif;
    else if (selectedProductStatus === "inactif") matchesStatus = isInactif;
    else if (selectedProductStatus === "en_rupture") matchesStatus = isRupture;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleProductStatus = async (product: Product, newStatus: "actif" | "inactif" | "en_rupture", newStock?: number) => {
    try {
      const res = await fetch(`/api/products/${product.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || "asime2026"
        },
        body: JSON.stringify({
          status: newStatus,
          stock: newStock !== undefined ? newStock : (newStatus === "en_rupture" ? 0 : (product.stock && product.stock > 0 ? product.stock : 10))
        })
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => prev.map(p => p.id === product.id ? data.product : p));
        const statusLabel = newStatus === "actif" ? "mis en ligne (actif)" : newStatus === "inactif" ? "masqué de la boutique" : "signalé en rupture de stock";
        showToast(`Produit "${product.nom}" ${statusLabel} avec succès.`);
      } else {
        const updatedProd: Product = {
          ...product,
          status: newStatus,
          stock: newStock !== undefined ? newStock : (newStatus === "en_rupture" ? 0 : (product.stock && product.stock > 0 ? product.stock : 10))
        };
        setProducts(prev => prev.map(p => p.id === product.id ? updatedProd : p));
        showToast(`Statut du produit mis à jour (${newStatus}).`);
      }
    } catch (e) {
      console.error("Erreur mise à jour statut produit:", e);
      const updatedProd: Product = {
        ...product,
        status: newStatus,
        stock: newStock !== undefined ? newStock : (newStatus === "en_rupture" ? 0 : (product.stock && product.stock > 0 ? product.stock : 10))
      };
      setProducts(prev => prev.map(p => p.id === product.id ? updatedProd : p));
      showToast(`Statut du produit mis à jour (${newStatus}).`);
    }
  };

  // -------------------------------------------------------------
  // ORDERS STATE
  // -------------------------------------------------------------
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("all");
  const [ordersList, setOrdersList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("asime_emulated_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    // Seed realistic sample orders for this seller
    return [
      {
        id: "CMD-98214",
        date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        clientName: "Afua Mensah",
        clientPhone: "+228 90 12 34 56",
        quartier: "Bè-Château, Lomé",
        status: "En attente",
        totalAmount: 10500,
        paymentMethod: "Mix by Yas",
        items: [
          { nom: "Miel Pur de Fleurs Sauvages (1L)", quantite: 2, prix: 3500 },
          { nom: "Savon Noir au Curcuma & Karité", quantite: 2, prix: 1750 }
        ]
      },
      {
        id: "CMD-98189",
        date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        clientName: "Kodjo Lawson",
        clientPhone: "+228 99 87 65 43",
        quartier: "Hedzranawoé, Lomé",
        status: "Confirmée",
        totalAmount: 5400,
        paymentMethod: "Flooz (Moov)",
        items: [{ nom: "Farine de Manioc Panifiable (5kg)", quantite: 1, prix: 5400 }]
      },
      {
        id: "CMD-98042",
        date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        clientName: "Ablavi Dogbé",
        clientPhone: "+228 91 44 22 11",
        quartier: "Adidogomé, Lomé",
        status: "Livrée",
        totalAmount: 14000,
        paymentMethod: "Mix by Yas",
        items: [
          { nom: "Tissu Pagne Batik Traditionnel (6 yards)", quantite: 1, prix: 14000 }
        ]
      }
    ];
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const updated = ordersList.map((o) => (o.id === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o));
    setOrdersList(updated);
    try {
      localStorage.setItem("asime_emulated_orders", JSON.stringify(updated));
      await fetch(`/api/orders/${orderId}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus })
      });
    } catch (e) {
      console.error("Order status update err:", e);
    }
    showToast(`Commande ${orderId} passée au statut : ${newStatus}`);
  };

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = token;
        const res = await fetch("/api/orders/my-orders", { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setOrdersList((prev) => {
              const existingIds = new Set(data.map((o: any) => o.id));
              const remainingPrev = prev.filter((p: any) => !existingIds.has(p.id));
              return [...data, ...remainingPrev];
            });
          }
        }
      } catch (e) {
        console.error("Fetch seller orders error:", e);
      }
    };
    fetchSellerOrders();
  }, [token, user?.id, user?.businessName]);

  const filteredOrders = ordersList.filter((o) => {
    if (orderFilterStatus === "all") return true;
    return o.status === orderFilterStatus;
  });

  // -------------------------------------------------------------
  // FEATURED PRODUCTS PROPOSALS (PRO & BUSINESS ONLY)
  // -------------------------------------------------------------
  const [featuredRequests, setFeaturedRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("asime_featured_requests");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [selectedProductForFeatured, setSelectedProductForFeatured] = useState<string>("");
  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);

  const handleProposeFeaturedProduct = () => {
    if (!selectedProductForFeatured) {
      showToast("Veuillez sélectionner un produit.");
      return;
    }

    const prod = products.find((p) => p.id === selectedProductForFeatured);
    if (!prod) return;

    // Check plan quota: PRO max 2, BUSINESS max 5
    const mySubmissions = featuredRequests.filter(
      (r) => r.vendeurId === user?.id && r.status !== "rejected"
    );
    const maxQuota = currentPlan === "BUSINESS" ? 5 : 2;
    if (mySubmissions.length >= maxQuota) {
      showToast(`Votre forfait ${currentPlan} vous permet de proposer jusqu'à ${maxQuota} produits phares simultanés.`);
      return;
    }

    const newRequest = {
      id: "phare_" + Date.now(),
      productId: prod.id,
      productName: prod.nom,
      productImage: prod.images?.[0] || "",
      productPrice: prod.prix,
      vendeurId: user?.id,
      vendeurName: user?.businessName || user?.name,
      plan: currentPlan,
      priority: currentPlan === "BUSINESS" ? "high" : "normal",
      status: "pending", // "pending" | "approved" | "rejected"
      createdAt: new Date().toISOString()
    };

    const updated = [newRequest, ...featuredRequests];
    setFeaturedRequests(updated);
    try {
      localStorage.setItem("asime_featured_requests", JSON.stringify(updated));
    } catch (e) {}

    setFeaturedModalOpen(false);
    setSelectedProductForFeatured("");
    showToast("Votre demande de mise en Produit Phare a été transmise à l'administration.");
  };

  // -------------------------------------------------------------
  // HOMEPAGE BANNER SUBMISSIONS (BUSINESS ONLY)
  // -------------------------------------------------------------
  const [bannerRequests, setBannerRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("asime_banner_requests");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerTargetUrl, setBannerTargetUrl] = useState("");
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);

  const handleSubmitBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) {
      showToast("Veuillez renseigner au minimum le titre et le lien de l'image.");
      return;
    }

    setIsSubmittingBanner(true);
    const newBanner = {
      id: "bnr_" + Date.now(),
      vendeurId: user?.id,
      vendeurName: user?.name,
      boutiqueName: user?.businessName || user?.name,
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      imageUrl: bannerImageUrl.trim(),
      targetUrl: bannerTargetUrl.trim() || `/boutique/${currentSlug || user?.id}`,
      status: "pending", // "pending" | "approved" | "rejected"
      createdAt: new Date().toISOString()
    };

    const updated = [newBanner, ...bannerRequests];
    setBannerRequests(updated);
    try {
      localStorage.setItem("asime_banner_requests", JSON.stringify(updated));
    } catch (e) {}

    setBannerTitle("");
    setBannerSubtitle("");
    setBannerImageUrl("");
    setBannerTargetUrl("");
    setIsSubmittingBanner(false);
    showToast("Votre bannière a été soumise avec succès pour validation administrative.");
  };

  // -------------------------------------------------------------
  // SHOP PROFILE & URL CUSTOMIZATION (PRO & BUSINESS ONLY)
  // -------------------------------------------------------------
  const [shopEditName, setShopEditName] = useState(user?.businessName || user?.name || "");
  const [shopEditDesc, setShopEditDesc] = useState(user?.boutiqueDescription || user?.boutiqueBio || "");
  const [shopEditSlug, setShopEditSlug] = useState(currentSlug);
  const [shopEditLogo, setShopEditLogo] = useState(user?.boutiqueLogo || "");
  const [shopEditBanner, setShopEditBanner] = useState(user?.boutiqueBanner || "");
  const [shopEditWhatsapp, setShopEditWhatsapp] = useState(user?.boutiqueWhatsapp || user?.phone || "");
  const [shopSlugChecking, setShopSlugChecking] = useState(false);
  const [shopSlugAvailable, setShopSlugAvailable] = useState<{ available: boolean; reason?: string } | null>(null);
  const [isCopiedSlug, setIsCopiedSlug] = useState(false);

  // Shop country & currency (defaults to seller's countryCode or TG)
  const [shopEditCountryCode, setShopEditCountryCode] = useState<string>(sellerCountryCode);

  useEffect(() => {
    if (user?.countryCode && isSupportedCountry(user.countryCode)) {
      setShopEditCountryCode(user.countryCode.toUpperCase());
    }
  }, [user?.countryCode]);

  const shopEditCountry = getCountryByCode(shopEditCountryCode);
  const shopEditCurrencyCode = shopEditCountry.currencyCode;

  useEffect(() => {
    if (!shopEditSlug || shopEditSlug === currentSlug) {
      setShopSlugAvailable(null);
      return;
    }

    const t = setTimeout(async () => {
      setShopSlugChecking(true);
      try {
        const res = await fetch(`/api/shops/check-slug?slug=${encodeURIComponent(shopEditSlug)}`);
        const data = await res.json();
        setShopSlugAvailable(data);
      } catch (e) {
        setShopSlugAvailable({ available: false, reason: "Erreur lors de la vérification" });
      } finally {
        setShopSlugChecking(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [shopEditSlug, currentSlug]);

  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPlan === "Gratuit") {
      showToast("La formule Gratuite ne permet pas d'activer d'URL de boutique publique.");
      return;
    }

    if (shopEditSlug !== currentSlug && shopSlugAvailable?.available === false) {
      showToast("Veuillez choisir un nom d'URL disponible.");
      return;
    }

    const selectedCountryObj = getCountryByCode(shopEditCountryCode);
    const updatedUser = {
      ...user,
      businessName: shopEditName.trim(),
      boutiqueName: shopEditName.trim(),
      boutiqueDescription: shopEditDesc.trim(),
      boutiqueBio: shopEditDesc.trim(),
      boutiqueSlug: shopEditSlug.trim().toLowerCase(),
      vendeurSlug: shopEditSlug.trim().toLowerCase(),
      boutiqueLogo: shopEditLogo.trim(),
      boutiqueBanner: shopEditBanner.trim(),
      boutiqueWhatsapp: shopEditWhatsapp.trim(),
      countryCode: selectedCountryObj.code,
      country: selectedCountryObj.name,
      currencyCode: selectedCountryObj.currencyCode
    };

    setUser(updatedUser);
    try {
      const usersStr = localStorage.getItem("asime_emulated_users");
      if (usersStr) {
        const allUsers = JSON.parse(usersStr);
        const mapped = allUsers.map((u: any) => (u.id === user.id ? updatedUser : u));
        localStorage.setItem("asime_emulated_users", JSON.stringify(mapped));
      }
    } catch (e) {}

    // Synchronize profile changes to backend if token available
    if (token) {
      fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          name: shopEditName.trim(),
          businessName: shopEditName.trim(),
          boutiqueName: shopEditName.trim(),
          boutiqueDescription: shopEditDesc.trim(),
          boutiqueSlug: shopEditSlug.trim().toLowerCase(),
          boutiqueLogo: shopEditLogo.trim(),
          boutiqueBanner: shopEditBanner.trim(),
          boutiqueWhatsapp: shopEditWhatsapp.trim(),
          countryCode: selectedCountryObj.code,
          currencyCode: selectedCountryObj.currencyCode
        })
      }).catch(() => {});
    }

    showToast("Paramètres de votre vitrine mis à jour avec succès !");
  };

  const handleCopyShopUrl = () => {
    if (!currentSlug) return;
    const url = `${window.location.origin}/boutique/${currentSlug}`;
    navigator.clipboard.writeText(url);
    setIsCopiedSlug(true);
    setTimeout(() => setIsCopiedSlug(false), 2500);
    showToast("Lien de votre boutique copié dans le presse-papier !");
  };

  // -------------------------------------------------------------
  // MESSAGES & REVIEWS MOCK DATA
  // -------------------------------------------------------------
  const [messagesList, setMessagesList] = useState<any[]>([
    {
      id: "msg_1",
      senderName: "Komi Mensah",
      preview: "Bonjour, est-ce que le miel de 1L est disponible immédiatement à Lomé ?",
      time: "Il y a 15 min",
      read: false,
      chatHistory: [
        { sender: "client", text: "Bonjour, est-ce que le miel de 1L est disponible immédiatement à Lomé ?", time: "10:15" }
      ]
    },
    {
      id: "msg_2",
      senderName: "Amivi Lawson",
      preview: "Le savon noir convient-il aux peaux sensibles ?",
      time: "Hier",
      read: true,
      chatHistory: [
        { sender: "client", text: "Le savon noir convient-il aux peaux sensibles ?", time: "Hier 14:00" },
        { sender: "seller", text: "Bonjour Amivi ! Oui, il est 100% naturel, sans parfum artificiel et enrichi au beurre de karité bio.", time: "Hier 14:20" }
      ]
    }
  ]);
  const [selectedChatId, setSelectedChatId] = useState<string>("msg_1");
  const [replyInput, setReplyInput] = useState("");

  const handleSendChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    setMessagesList((prev) =>
      prev.map((chat) => {
        if (chat.id === selectedChatId) {
          return {
            ...chat,
            chatHistory: [
              ...chat.chatHistory,
              { sender: "seller", text: replyInput.trim(), time: "À l'instant" }
            ]
          };
        }
        return chat;
      })
    );
    setReplyInput("");
    showToast("Message envoyé au client !");
  };

  const [reviewsList, setReviewsList] = useState<any[]>([
    {
      id: "rev_1",
      clientName: "Abalo K.",
      productName: "Miel Sauvage Pur (1L)",
      rating: 5,
      comment: "Qualité exceptionnelle ! Livraison en 2h à Agoè. Je recommande à 100%.",
      date: "2026-06-25",
      replies: []
    },
    {
      id: "rev_2",
      clientName: "Mawussi T.",
      productName: "Savon Noir au Curcuma",
      rating: 4,
      comment: "Très efficace sur les imperfections. Le produit est bien emballé.",
      date: "2026-06-20",
      replies: ["Merci Mawussi pour votre confiance !"]
    }
  ]);
  const [reviewReplyInputs, setReviewReplyInputs] = useState<Record<string, string>>({});

  const handleAddReviewReply = (revId: string) => {
    const text = reviewReplyInputs[revId];
    if (!text?.trim()) return;

    setReviewsList((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, replies: [...r.replies, text.trim()] } : r))
    );
    setReviewReplyInputs((prev) => ({ ...prev, [revId]: "" }));
    showToast("Votre réponse a été publiée.");
  };

  // -------------------------------------------------------------
  // WALLET & WITHDRAWAL FORM
  // -------------------------------------------------------------
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Mix by Yas");
  const [withdrawPhone, setWithdrawPhone] = useState(user?.phone || "");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    if (!amountNum || amountNum < 2000) {
      showToast("Le montant minimum de retrait est de 2 000 FCFA.");
      return;
    }
    if (!withdrawPhone.trim()) {
      showToast("Veuillez renseigner votre numéro Mobile Money.");
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      await onWithdrawalRequest(withdrawAmount, withdrawMethod, withdrawPhone);
      setWithdrawAmount("");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Financial Computations & Plan-specific rates
  // Standard flat 10% commission on every sale for all plans
  // Unlimited products for everyone
  const totalGrossSales = ordersList
    .filter((o) => o.status === "Livrée" || o.status === "Confirmée")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const commissionRate = 0.10;
  const commissionPercentText = "10%";
  const commissionMiabeAsi = Math.round(totalGrossSales * commissionRate);
  const netEarnings = totalGrossSales - commissionMiabeAsi;
  const availableBalance = wallet?.balance ?? netEarnings;

  const handleOpenAddProduct = () => {
    setIsEditingProduct(null);
    setNewProdName("");
    setNewProdDesc("");
    setNewProdPrice("");
    setNewProdPriceBarre("");
    setNewProdStock("10");
    setNewProdCategory(categories[0] || "Produits alimentaires");
    setNewProdImageUrl("");
    setNewProdImages([]);
    setIsAddProductOpen(true);
  };

  const handleExportSalesCSV = () => {
    if (currentPlan !== "BUSINESS") {
      setTargetPlanToUpgrade("BUSINESS");
      setUpgradeModalOpen(true);
      showToast("L'export comptable CSV est réservé aux vendeurs en formule BUSINESS.");
      return;
    }
    const headers = ["ID_Commande", "Date", "Client", "Telephone", "Quartier_Ville", "Statut", "Total_FCFA", "Methode_Paiement", "Articles"];
    const rows = ordersList.map((o) => [
      o.id,
      new Date(o.date).toLocaleDateString("fr-FR"),
      `"${(o.clientName || "").replace(/"/g, '""')}"`,
      `"${(o.clientPhone || "").replace(/"/g, '""')}"`,
      `"${(o.quartier || "").replace(/"/g, '""')}"`,
      o.status,
      o.totalAmount,
      o.paymentMethod || "Paiement Mobile",
      `"${(o.items || []).map((it: any) => `${it.nom} (x${it.quantite})`).join(" ; ").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `journal_ventes_${(user?.businessName || "vendeur").toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Journal comptable des ventes exporté en CSV avec succès !");
  };

  // -------------------------------------------------------------
  // UPGRADE PLAN MODAL / LOGIC
  // -------------------------------------------------------------
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetPlanToUpgrade, setTargetPlanToUpgrade] = useState<SellerPlan>("PRO");

  const handleConfirmPlanChange = (newPlan: SellerPlan) => {
    const updatedUser = {
      ...user,
      vendeurPlan: newPlan,
      plan: newPlan,
      vendeurSubscription:
        newPlan === "BUSINESS" ? "Offre 3" : newPlan === "PRO" ? "Offre 2" : "Offre 1"
    };

    setUser(updatedUser);
    try {
      const usersStr = localStorage.getItem("asime_emulated_users");
      if (usersStr) {
        const allUsers = JSON.parse(usersStr);
        const mapped = allUsers.map((u: any) => (u.id === user.id ? updatedUser : u));
        localStorage.setItem("asime_emulated_users", JSON.stringify(mapped));
      }
    } catch (e) {}

    setUpgradeModalOpen(false);
    showToast(`Formule passée à ${newPlan} avec succès !`);
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-stone-900 font-sans overflow-hidden select-none">
      
      {/* ============================================================ */}
      {/* SIDEBAR NAVIGATION (DESKTOP) */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex flex-col w-64 bg-stone-950 text-white border-r border-stone-800 shrink-0">
        
        {/* Brand Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B4D26] flex items-center justify-center text-white">
              <Store className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="text-left">
              <h2 className="text-xs font-black uppercase tracking-wider text-white truncate max-w-[130px]">
                {user?.businessName || "Ma Boutique"}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded ${
                  currentPlan === "BUSINESS"
                    ? "bg-[#d4af37] text-stone-950 font-black"
                    : currentPlan === "PRO"
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-stone-800 text-stone-300"
                }`}>
                  {currentPlan}
                </span>
                <span className="text-[9px] text-[#d4af37] font-mono font-bold">{commissionPercentText} comm.</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-[10px] text-stone-300">
                <span className="text-sm leading-none">{sellerCountry.flagEmoji}</span>
                <span className="font-bold text-stone-200 truncate">{sellerCountry.name}</span>
                <span className="ml-auto font-mono text-[9.5px] font-bold text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">{sellerCurrencyCode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-3 space-y-1 overflow-y-auto text-left">
          {[
            { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
            { id: "products", label: "Mes Produits", icon: Package, badge: myProducts.length },
            { id: "orders", label: "Commandes", icon: ShoppingBag, badge: ordersList.filter(o => o.status === "En attente").length || undefined },
            { id: "featured", label: "Produits Phares", icon: Star, highlight: currentPlan !== "Gratuit", locked: currentPlan === "Gratuit", planBadge: "PRO" },
            { id: "banner", label: "Bannière d'Accueil", icon: ImageIcon, locked: currentPlan !== "BUSINESS", planBadge: "BUSINESS" },
            { id: "shop", label: "Ma Vitrine & URL", icon: Globe, locked: currentPlan === "Gratuit", planBadge: "PRO" },
            { id: "messages", label: "Messages", icon: MessageSquare, badge: messagesList.filter(m => !m.read).length || undefined },
            { id: "reviews", label: "Avis Clients", icon: Award },
            { id: "wallet", label: "Portefeuille & Retraits", icon: Wallet },
            { id: "subscription", label: "Mon Abonnement", icon: Crown }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.locked) {
                    if (item.id === "banner") {
                      setTargetPlanToUpgrade("BUSINESS");
                      setUpgradeModalOpen(true);
                      showToast("La bannière d'accueil personnalisée est réservée aux boutiques en formule BUSINESS.");
                      return;
                    } else {
                      setTargetPlanToUpgrade("PRO");
                      setUpgradeModalOpen(true);
                      showToast(`Cette fonctionnalité est débloquée à partir de l'offre ${item.planBadge || "PRO"}.`);
                      return;
                    }
                  }
                  setActiveTab(item.id as TabType);
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? currentPlan === "BUSINESS"
                      ? "bg-gradient-to-r from-[#d4af37] to-[#b8901c] text-stone-950 shadow-md font-black"
                      : currentPlan === "PRO"
                      ? "bg-[#0B4D26] text-white shadow-md shadow-[#0B4D26]/20 font-black"
                      : "bg-stone-800 text-white shadow-md font-black"
                    : item.locked
                    ? "text-stone-500 hover:bg-stone-900/60 hover:text-stone-400"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? (currentPlan === "BUSINESS" ? "text-stone-950" : "text-[#d4af37]") : item.locked ? "text-stone-600" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.locked && (
                    <span className="flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{item.planBadge}</span>
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full ${
                      isActive ? (currentPlan === "BUSINESS" ? "bg-stone-950 text-[#d4af37]" : "bg-white text-stone-950") : "bg-stone-800 text-stone-300"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-stone-800 space-y-2">
          {currentPlan !== "Gratuit" && currentSlug && (
            <button
              type="button"
              onClick={() => onNavigateToPublicShop ? onNavigateToPublicShop(currentSlug) : window.open(`/boutique/${currentSlug}`, "_blank")}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-400 font-bold text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir ma vitrine</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToSite}
            className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white font-bold text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quitter l'espace</span>
          </button>
        </div>

      </aside>


      {/* ============================================================ */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ============================================================ */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-left">
              <h1 className="text-sm font-black uppercase tracking-wider text-stone-900">
                {activeTab === "dashboard" && "Tableau de Bord Vendeur"}
                {activeTab === "products" && "Catalogue & Gestion des Stocks"}
                {activeTab === "orders" && "Gestion des Commandes Clients"}
                {activeTab === "featured" && "Mise en avant : Produits Phares"}
                {activeTab === "banner" && "Bannière Publicitaire d'Accueil"}
                {activeTab === "shop" && "Personnalisation de la Vitrine & URL"}
                {activeTab === "messages" && "Messagerie Directe Clients"}
                {activeTab === "reviews" && "Avis & Évaluations Clients"}
                {activeTab === "wallet" && "Portefeuille & Demandes de Retrait"}
                {activeTab === "subscription" && "Mon Abonnement & Tarification"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-stone-500 font-sans hidden sm:block">
                  Place de Marché Artisanale Miabé Asi
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                  <span className="text-sm leading-none">{sellerCountry.flagEmoji}</span>
                  <span>{sellerCountry.name}</span>
                  <span className="text-stone-500 font-mono text-[10px] font-bold">({sellerCurrencyCode})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            {currentPlan === "BUSINESS" && (
              <button
                type="button"
                onClick={handleExportSalesCSV}
                className="hidden sm:flex bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider items-center gap-1.5 transition-colors cursor-pointer"
                title="Exporter le journal des ventes CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#0B4D26]" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Produit</span>
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 bg-[#FAF9F6] text-left">
          
          {/* ============================================================ */}
          {/* TAB 1: TABLEAU DE BORD (DASHBOARD) */}
          {/* ============================================================ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
              
              {/* Welcome banner differentiated by plan */}
              {currentPlan === "BUSINESS" ? (
                <div className="bg-gradient-to-r from-stone-950 via-[#181308] to-stone-950 text-white p-5 sm:p-6 rounded-2xl border-2 border-[#d4af37]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black uppercase text-white flex items-center gap-1.5">
                        <span>{user?.businessName || user?.name || "Boutique"}</span>
                        <span className="text-[#d4af37]">👑</span>
                      </h2>
                      <span className="bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#d4af37] text-stone-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                        BUSINESS PRESTIGE
                      </span>
                      <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        {myProducts.length} Articles en ligne (Illimité)
                      </span>
                      <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-0.5 rounded-full text-xs font-semibold text-stone-200">
                        <span className="text-sm leading-none">{sellerCountry.flagEmoji}</span>
                        <span>{sellerCountry.name}</span>
                        <span className="text-stone-400 font-mono text-[10.5px] font-bold">({sellerCurrencyCode})</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#d4af37]/90 font-sans">
                      Espace Partenaire Élite Panafricain : Bannière carrousel d'accueil, priorité absolue sur les produits phares, export comptable CSV et conseiller dédié 24/7.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleExportSalesCSV}
                      className="bg-stone-900 hover:bg-stone-800 text-[#d4af37] border border-[#d4af37]/40 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Télécharger le journal comptable en format CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("subscription")}
                      className="bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Gérer Offre</span>
                    </button>
                  </div>
                </div>
              ) : currentPlan === "PRO" ? (
                <div className="bg-gradient-to-r from-emerald-950 via-[#0B4D26] to-stone-950 text-white p-5 sm:p-6 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black uppercase text-white">
                        Bonjour, {user?.businessName || user?.name || "Vendeur"} ! ✨
                      </h2>
                      <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                        ABONNEMENT PRO ACTIF
                      </span>
                      <span className="bg-stone-900 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-stone-800">
                        {myProducts.length} Articles en ligne (Illimité)
                      </span>
                      <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-0.5 rounded-full text-xs font-semibold text-stone-200">
                        <span className="text-sm leading-none">{sellerCountry.flagEmoji}</span>
                        <span>{sellerCountry.name}</span>
                        <span className="text-stone-400 font-mono text-[10.5px] font-bold">({sellerCurrencyCode})</span>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-200/90 font-sans">
                      Boutique Professionnelle Active : Vitrine publique avec URL personnalisée, 2 produits phares et support VIP.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPlanToUpgrade("BUSINESS");
                        setUpgradeModalOpen(true);
                      }}
                      className="bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Passer en BUSINESS (3 200 F)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-950 text-white p-5 sm:p-6 rounded-2xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black uppercase text-white">
                        Bonjour, {user?.businessName || user?.name || "Vendeur"} !
                      </h2>
                      <span className="bg-stone-800 text-stone-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-stone-700">
                        COMPTE GRATUIT
                      </span>
                      <span className="bg-stone-900 text-stone-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-stone-800">
                        {myProducts.length} Articles en ligne (Illimité)
                      </span>
                      <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-0.5 rounded-full text-xs font-semibold text-stone-200">
                        <span className="text-sm leading-none">{sellerCountry.flagEmoji}</span>
                        <span>{sellerCountry.name}</span>
                        <span className="text-stone-400 font-mono text-[10.5px] font-bold">({sellerCurrencyCode})</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-400 font-sans">
                      Formule Gratuite standard : Catalogue illimité et ventes ouvertes sur les 7 pays partenaires.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPlanToUpgrade("PRO");
                        setUpgradeModalOpen(true);
                      }}
                      className="bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Passer en PRO (1 600 F)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Chiffre d'Affaires Brut */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Ventes Brutes Réalisées</span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-stone-900">{formatSellerPrice(totalGrossSales)}</p>
                  <p className="text-[10px] text-stone-500 font-sans">Total des commandes livrées &amp; confirmées</p>
                </div>

                {/* Metric 2: Commission Miabé Asi */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                    Commission Plateforme (10%)
                  </span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-amber-700">-{formatSellerPrice(commissionMiabeAsi)}</p>
                  <p className="text-[10px] text-stone-500 font-sans">
                    10% sur chaque vente effectuée
                  </p>
                </div>

                {/* Metric 3: Solde Net Disponible */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Solde Net Disponible</span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-[#0B4D26]">{formatSellerPrice(availableBalance)}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("wallet")}
                    className="text-[10px] font-bold text-emerald-700 underline cursor-pointer"
                  >
                    Demander un retrait &rarr;
                  </button>
                </div>

                {/* Metric 4: Commandes Reçues */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Commandes &amp; Catalogue</span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-stone-900">{ordersList.length} <span className="text-xs text-stone-400 font-normal">cmds</span></p>
                  <p className="text-[10px] text-stone-500 font-sans">{myProducts.length} produits actifs en ligne</p>
                </div>

              </div>

              {/* Quick Shortcuts & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Orders List (8 cols) */}
                <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#0B4D26]" />
                      <span>Dernières Commandes Clients</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900"
                    >
                      Voir tout ({ordersList.length}) &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {ordersList.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900">{ord.id}</span>
                            <span className="font-bold text-stone-700">&bull; {ord.clientName}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5">{ord.quartier} &bull; {ord.items?.length || 1} article(s)</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-black text-stone-900">{formatSellerPrice(ord.totalAmount)}</p>
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            ord.status === "Livrée"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "Confirmée"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Highlights & URL Status (4 cols) */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#0B4D26]" />
                    <span>Statut de votre Vitrine</span>
                  </h3>

                  {currentPlan === "Gratuit" ? (
                    <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl space-y-2 text-xs">
                      <p className="font-bold text-stone-800">Formule GRATUIT (0 FCFA)</p>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                        Vos produits sont référencés sur le catalogue global. Aucune URL publique de boutique dédiée n'est active.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPlanToUpgrade("PRO");
                          setUpgradeModalOpen(true);
                        }}
                        className="w-full mt-2 py-2 bg-[#0B4D26] hover:bg-[#083a1d] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors"
                      >
                        Activer mon URL avec PRO (1 600 F)
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">URL Publique Active</span>
                        <span className="bg-emerald-200 text-emerald-900 text-[8.5px] font-black px-1.5 py-0.5 rounded">En ligne</span>
                      </div>
                      <div className="bg-white p-2 border border-emerald-200 rounded font-mono text-[10px] text-emerald-800 truncate select-all">
                        miabeasi.com/boutique/{currentSlug || user?.id}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCopyShopUrl}
                          className="py-1.5 px-2 bg-white border border-emerald-300 rounded font-bold text-[9px] uppercase tracking-wider text-emerald-900 hover:bg-emerald-100 flex items-center justify-center gap-1"
                        >
                          {isCopiedSlug ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedSlug ? "Copié" : "Copier le lien"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("shop")}
                          className="py-1.5 px-2 bg-[#0B4D26] text-white rounded font-bold text-[9px] uppercase tracking-wider hover:bg-[#083a1d] flex items-center justify-center gap-1"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Personnaliser</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp contact helper */}
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2.5 text-xs text-stone-600">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp vendeur : <strong className="text-stone-900">{user?.phone || "+228 ..."}</strong></span>
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 2: MES PRODUITS (CATALOGUE & STOCKS) */}
          {/* ============================================================ */}
          {activeTab === "products" && (
            <div className="space-y-5 animate-fade-in max-w-6xl mx-auto">
              
              {/* Plan & Unlimited Products Info Banner */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[#0B4D26]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase tracking-wider text-stone-900">
                        Catalogue Vendeur • Produits Illimités
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full border border-stone-200">
                        {myProducts.length} articles en ligne
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                      Publiez autant de créations et d'articles que vous souhaitez sans aucune restriction de quota.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    Formule {currentPlan} • Commission 10%
                  </span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-grow items-center gap-2">
                  <div className="relative flex-grow max-w-md">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Rechercher un produit par nom ou mot-clé..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                    />
                  </div>

                  <select
                    value={selectedProductCategory}
                    onChange={(e) => setSelectedProductCategory(e.target.value)}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-stone-500 font-mono">
                  {filteredProducts.length} produit(s) trouvé(s)
                </div>
              </div>

              {/* Products Grid / Cards */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-black uppercase text-stone-900">Aucun produit dans cette sélection</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    Ajoutez vos créations artisanales et commencez à recevoir des commandes immédiatement.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddProduct}
                    className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#d4af37]" />
                    <span>Créer ma première fiche produit</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((prod) => {
                    const isLowStock = (prod.stock || 0) <= 3;
                    return (
                      <div key={prod.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-3">
                        <div className="space-y-3">
                          <div className="h-40 bg-stone-100 rounded-xl overflow-hidden relative">
                            <img
                              src={prod.images?.[0] || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80"}
                              alt={prod.nom}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-stone-950/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                              {prod.categorie}
                            </span>
                            {isLowStock && (
                              <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                                Stock Faible ({prod.stock})
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-1 uppercase">{prod.nom}</h4>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed font-sans">
                              {prod.description}
                            </p>
                          </div>

                          <div className="flex items-baseline justify-between border-t border-stone-100 pt-2">
                            <div>
                              <span className="font-mono font-black text-sm text-[#0B4D26]">
                                {formatPrice(prod.prix, prod.currencyCode || sellerCurrencyCode)}
                              </span>
                              {prod.prixBarre && (
                                <span className="font-mono text-[10px] text-stone-400 line-through ml-1.5">
                                  {formatPrice(prod.prixBarre, prod.currencyCode || sellerCurrencyCode)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10.5px] font-mono text-stone-600">
                              Stock : <strong>{prod.stock ?? 10}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Product Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProduct(prod);
                              setNewProdName(prod.nom);
                              setNewProdDesc(prod.description);
                              setNewProdPrice(String(prod.prix));
                              setNewProdPriceBarre(prod.prixBarre ? String(prod.prixBarre) : "");
                              setNewProdStock(String(prod.stock ?? 10));
                              setNewProdCategory(prod.categorie);
                              setNewProdImageUrl(prod.images?.[0] || "");
                              setNewProdImages(prod.images || []);
                              setIsAddProductOpen(true);
                            }}
                            className="py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-stone-600" />
                            <span>Modifier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 3: COMMANDES & EXPÉDITIONS */}
          {/* ============================================================ */}
          {activeTab === "orders" && (
            <div className="space-y-5 animate-fade-in max-w-6xl mx-auto">
              
              {/* Order Status Filters */}
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Toutes les commandes" },
                  { id: "En attente", label: "En attente" },
                  { id: "Confirmée", label: "Confirmées" },
                  { id: "En livraison", label: "En cours de livraison" },
                  { id: "Livrée", label: "Livrées" }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      orderFilterStatus === f.id
                        ? "bg-[#0B4D26] text-white font-black"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto" />
                    <p className="text-xs">Aucune commande ne correspond au filtre sélectionné.</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const rawClientCountry = (
                      order.clientCountryCode ||
                      order.destinationCountryCode ||
                      order.shippingDetails?.countryCode ||
                      ""
                    ).toUpperCase();
                    const clientCountry = rawClientCountry && isSupportedCountry(rawClientCountry)
                      ? getCountryByCode(rawClientCountry)
                      : (rawClientCountry ? { code: rawClientCountry, name: order.clientCountryName || rawClientCountry, flagEmoji: "🌍", currencyCode: "XOF" } : null);

                    const clientCity = order.clientCity || order.destinationCity || order.shippingDetails?.city || order.shippingDetails?.quartier || order.quartier || "";
                    const clientName = order.clientName || order.shippingDetails?.name || "Client";
                    const clientPhone = order.clientPhone || order.shippingDetails?.phoneWithCountryCode || order.shippingDetails?.phone || "";
                    const isCrossBorderClient = Boolean(clientCountry && clientCountry.code !== sellerCountry.code);
                    const orderDate = order.createdAt || order.date || new Date().toISOString();
                    const orderCurrency = order.currencyCode || sellerCurrencyCode;

                    return (
                    <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
                      {/* Cross-border Alert Banner */}
                      {isCrossBorderClient && clientCountry && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                          <Globe className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                              <span>Commande Transfrontalière</span>
                              <span>•</span>
                              <span>Client en/au {clientCountry.name} {clientCountry.flagEmoji} {clientCity ? `(${clientCity})` : ""}</span>
                            </p>
                            <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                              La plateforme Miabé Asi n'impose aucun frais ni transporteur. L'organisation et les frais de livraison sont à convenir directement avec votre client via WhatsApp.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-sm text-stone-900">{order.id}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              order.status === "Livrée" || order.orderStatus === "Livrée"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "Confirmée" || order.orderStatus === "Confirmée"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {order.orderStatus || order.status || "En attente"}
                            </span>
                            {isCrossBorderClient && clientCountry && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <span>{clientCountry.flagEmoji}</span>
                                <span>Client International</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                            Passée le {new Date(orderDate).toLocaleDateString("fr-FR")} à {new Date(orderDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-mono font-black text-base text-[#0B4D26]">
                            {formatPrice(order.totalAmount, orderCurrency)}
                          </p>
                          <span className="text-[10px] text-stone-500 font-sans">Règlement : {order.paymentMethod || "Non spécifié"}</span>
                        </div>
                      </div>

                      {/* Client Info & WhatsApp Quick Action */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-3.5 rounded-xl">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Destinataire</span>
                          <p className="font-bold text-stone-900 mt-0.5">{clientName}</p>
                          <p className="text-stone-600 font-sans flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{clientCity ? `${clientCity}, ` : ""}{clientCountry ? `${clientCountry.name} ${clientCountry.flagEmoji}` : "Togo 🇹🇬"}</span>
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end justify-center">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Contact WhatsApp Client</span>
                          {clientPhone ? (
                            <a
                              href={`https://wa.me/${clientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Bonjour ${clientName}, je suis votre vendeur Miabé Asi (${user?.businessName || user?.name || "Boutique"}) pour votre commande ${order.id}. Je vous contacte pour convenir de la livraison vers ${clientCity ? clientCity + ", " : ""}${clientCountry ? clientCountry.name : ""}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline mt-0.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-xs"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{clientPhone}</span>
                            </a>
                          ) : (
                            <span className="text-stone-400 italic">Non renseigné</span>
                          )}
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Articles commandés :</span>
                        {order.items?.map((item: any, idx: number) => {
                          const itemName = item.nom || item.product?.nom || "Article";
                          const itemQty = item.quantite || item.quantity || 1;
                          const itemPrice = Number(item.prix || item.product?.prix || 0);
                          const itemCountry = item.product?.countryOrigin || item.product?.countryCode || "";
                          const itemCity = item.product?.city || "";

                          return (
                            <div key={idx} className="flex justify-between py-1.5 border-b border-stone-100 last:border-0">
                              <div>
                                <span className="text-stone-800 font-medium">{itemQty}x {itemName}</span>
                                {(itemCountry || itemCity) && (
                                  <span className="text-[10px] text-stone-400 block">
                                    Origine article : {itemCity ? `${itemCity}, ` : ""}{itemCountry}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-stone-900 shrink-0 ml-2">
                                {formatPrice(itemPrice * itemQty, orderCurrency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Status Update Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-1">Changer l'état :</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, "Confirmée")}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, "En livraison")}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          En livraison
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, "Livrée")}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Marquer comme livrée ✓
                        </button>
                      </div>
                    </div>
                  );
                }))}
              </div>

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 4: ⭐ PRODUITS PHARES (PRO & BUSINESS) */}
          {/* ============================================================ */}
          {activeTab === "featured" && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
              
              {currentPlan === "Gratuit" ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
                  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Star className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black uppercase text-stone-900">Fonctionnalité Produits Phares</h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    La mise en avant dans la section <strong>Produits Phares</strong> de la page d'accueil est réservée aux formules <strong>PRO (1 600 FCFA/mois)</strong> et <strong>BUSINESS (3 200 FCFA/mois)</strong>.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPlanToUpgrade("PRO");
                        setUpgradeModalOpen(true);
                      }}
                      className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Débloquer avec la formule PRO &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Header info & quota indicator */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase text-stone-900">Mes Produits Phares</h3>
                        <span className="bg-emerald-100 text-[#0B4D26] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Formule {currentPlan}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 font-sans">
                        Proposez vos meilleurs articles à l'administration pour une mise en avant exclusive en page d'accueil.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFeaturedModalOpen(true)}
                      className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4 text-[#d4af37]" />
                      <span>Proposer un produit phare</span>
                    </button>
                  </div>

                  {/* Quota info card */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Quota de votre formule :</strong> {currentPlan === "BUSINESS" ? "Jusqu'à 5 propositions simultanées avec priorité d'affichage maximale." : "Jusqu'à 2 propositions simultanées avec priorité standard."} Chaque proposition est vérifiée et validée par l'équipe administrative Miabé Asi.
                    </div>
                  </div>

                  {/* Submissions list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Historique de vos propositions</h4>
                    {featuredRequests.filter(r => r.vendeurId === user?.id).length === 0 ? (
                      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-xs">
                        Vous n'avez pas encore soumis de produit phare. Cliquez sur « Proposer un produit phare » pour commencer.
                      </div>
                    ) : (
                      featuredRequests.filter(r => r.vendeurId === user?.id).map((req) => (
                        <div key={req.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={req.productImage || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80"}
                              alt={req.productName}
                              className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-stone-900 uppercase">{req.productName}</p>
                              <p className="text-[10px] text-stone-500 font-mono">{formatSellerPrice(req.productPrice)}</p>
                              <span className="text-[9px] text-stone-400 font-mono">Soumis le {new Date(req.createdAt).toLocaleDateString("fr-FR")}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                              req.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : req.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {req.status === "approved" ? "Validé & En Ligne ✓" : req.status === "rejected" ? "Refusé" : "En attente admin"}
                            </span>
                            <p className="text-[9px] text-stone-400 font-bold uppercase mt-1">
                              Priorité : {req.priority === "high" ? "Haute (Business)" : "Standard (Pro)"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 5: 🖼️ BANNIÈRE D'ACCUEIL (EXCLUSIVITÉ BUSINESS) */}
          {/* ============================================================ */}
          {activeTab === "banner" && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
              
              {currentPlan !== "BUSINESS" ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
                  <div className="w-14 h-14 rounded-full bg-stone-900 text-[#d4af37] flex items-center justify-center mx-auto">
                    <Crown className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black uppercase text-stone-900">Bannière Publicitaire d'Accueil</h3>
                  <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block">
                    Exclusivité Formule BUSINESS
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Affichez votre marque ou votre promotion directement en haut de la page d'accueil de Miabé Asi auprès de tous les visiteurs. Cette visibilité suprême est réservée à l'abonnement <strong>BUSINESS (3 200 FCFA/mois)</strong>.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPlanToUpgrade("BUSINESS");
                        setUpgradeModalOpen(true);
                      }}
                      className="bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Passer en formule BUSINESS &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Banner Submission Form */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                    <div className="border-b border-stone-100 pb-3">
                      <h3 className="text-sm font-black uppercase text-stone-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                        <span>Soumettre une Bannière d'Accueil</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Renseignez les détails de votre visuel publicitaire. L'administration vérifiera la qualité avant diffusion.
                      </p>
                    </div>

                    <form onSubmit={handleSubmitBanner} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Titre de la bannière *</label>
                          <input
                            type="text"
                            required
                            value={bannerTitle}
                            onChange={(e) => setBannerTitle(e.target.value)}
                            placeholder="Ex: Saveurs Authentiques de Kpalimé"
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Sous-titre / Accroche</label>
                          <input
                            type="text"
                            value={bannerSubtitle}
                            onChange={(e) => setBannerSubtitle(e.target.value)}
                            placeholder="Ex: -15% sur toutes les confitures ce week-end"
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">URL de l'image (Format 1200x500 recommandé) *</label>
                          <input
                            type="url"
                            required
                            value={bannerImageUrl}
                            onChange={(e) => setBannerImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Lien de redirection au clic</label>
                          <input
                            type="text"
                            value={bannerTargetUrl}
                            onChange={(e) => setBannerTargetUrl(e.target.value)}
                            placeholder={`/boutique/${currentSlug || user?.id}`}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                          />
                        </div>
                      </div>

                      {/* Live Banner Preview */}
                      {bannerImageUrl && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Aperçu en direct du rendu :</span>
                          <div className="h-44 sm:h-52 w-full rounded-xl overflow-hidden relative border border-stone-200 shadow-sm bg-stone-900">
                            <img src={bannerImageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-center text-white space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#d4af37]">Partenaire Officiel</span>
                              <h4 className="text-lg sm:text-2xl font-black uppercase text-white">{bannerTitle || "Titre de votre bannière"}</h4>
                              <p className="text-xs text-stone-200 max-w-md">{bannerSubtitle || "Votre message promotionnel apparaîtra ici..."}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingBanner}
                          className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Soumettre ma bannière &rarr;</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Banner Submissions History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Historique de vos bannières</h4>
                    {bannerRequests.filter(b => b.vendeurId === user?.id).length === 0 ? (
                      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-xs">
                        Aucune bannière soumise pour l'instant.
                      </div>
                    ) : (
                      bannerRequests.filter(b => b.vendeurId === user?.id).map((b) => (
                        <div key={b.id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            {b.imageUrl && (
                              <img src={b.imageUrl} alt={b.title} className="w-16 h-12 rounded object-cover border border-stone-200 shrink-0" />
                            )}
                            <div>
                              <p className="font-bold text-stone-900 uppercase">{b.title}</p>
                              {b.subtitle && <p className="text-[11px] text-stone-500">{b.subtitle}</p>}
                              <span className="text-[9px] text-stone-400 font-mono">Soumis le {new Date(b.createdAt).toLocaleDateString("fr-FR")}</span>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                              b.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {b.status === "approved" ? "Publiée sur l'accueil ✓" : b.status === "rejected" ? "Visuel refusé" : "En cours de validation admin"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 6: 🔗 MA VITRINE & URL PUBLIQUE */}
          {/* ============================================================ */}
          {activeTab === "shop" && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              
              {currentPlan === "Gratuit" ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                    <Globe className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black uppercase text-stone-900">URL Publique de Boutique Dédiée</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 max-w-lg mx-auto text-left leading-relaxed">
                    ⚠️ <strong>Information Formule Gratuite :</strong> Votre boutique est actuellement en formule <strong>GRATUIT</strong>. Aucune URL publique de boutique (ni standard ni personnalisée) n'est disponible. Vos produits sont visibles dans le catalogue général.
                    <br /><br />
                    Pour disposer d'une page de boutique dédiée avec URL personnalisée (ex : <code>miabeasi.com/boutique/votre-nom</code>) à partager sur WhatsApp et les réseaux sociaux, passez à la formule <strong>PRO (1 600 FCFA/mois)</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetPlanToUpgrade("PRO");
                      setUpgradeModalOpen(true);
                    }}
                    className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Activer mon URL de boutique (PRO) &rarr;
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                  
                  <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black uppercase text-stone-900">Personnalisation de ma Vitrine Publique</h3>
                      <p className="text-xs text-stone-500">Configurez votre identité visuelle et votre adresse web dédiée.</p>
                    </div>
                    {currentSlug && (
                      <button
                        type="button"
                        onClick={handleCopyShopUrl}
                        className="py-1.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                      >
                        {isCopiedSlug ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedSlug ? "Lien copié !" : "Partager mon URL"}</span>
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveShopSettings} className="space-y-4">
                    
                    {/* Slug input with real-time verification */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                          URL Personnalisée de votre Boutique *
                        </label>
                        {shopSlugChecking && (
                          <span className="text-[10px] text-stone-400 animate-pulse">Vérification...</span>
                        )}
                      </div>

                      <div className="flex items-center bg-white border border-stone-300 rounded-xl overflow-hidden px-3 py-2 text-xs">
                        <span className="text-stone-400 font-mono select-none">miabeasi.com/boutique/</span>
                        <input
                          type="text"
                          required
                          value={shopEditSlug}
                          onChange={(e) => setShopEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          className="bg-transparent text-stone-900 font-mono font-bold flex-grow focus:outline-none pl-1"
                        />
                      </div>

                      {shopSlugAvailable && (
                        <div className={`text-xs flex items-center gap-1.5 ${
                          shopSlugAvailable.available ? "text-emerald-700 font-bold" : "text-red-600 font-bold"
                        }`}>
                          {shopSlugAvailable.available ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Ce nom d'URL est disponible !</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{shopSlugAvailable.reason || "Ce nom d'URL est indisponible."}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Nom commercial de l'enseigne *</label>
                        <input
                          type="text"
                          required
                          value={shopEditName}
                          onChange={(e) => setShopEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Numéro WhatsApp Client</label>
                        <input
                          type="tel"
                          value={shopEditWhatsapp}
                          onChange={(e) => setShopEditWhatsapp(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>
                    </div>

                    {/* Country & Currency selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                          Pays de la boutique *
                        </label>
                        <select
                          value={shopEditCountryCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (isSupportedCountry(val)) {
                              setShopEditCountryCode(val);
                            }
                          }}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                        >
                          {SUPPORTED_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flagEmoji} {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                          Devise de la boutique (automatique)
                        </label>
                        <div className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-800 font-mono font-bold flex items-center justify-between">
                          <span>{shopEditCurrencyCode}</span>
                          <span className="text-[10px] text-stone-500 font-normal">{shopEditCountry.name}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Bio &amp; Histoire de votre Savoir-faire</label>
                      <textarea
                        rows={3}
                        value={shopEditDesc}
                        onChange={(e) => setShopEditDesc(e.target.value)}
                        placeholder="Présentez votre atelier, vos valeurs et l'origine de vos matières premières togolaises..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Logo de la boutique (URL)</label>
                        <input
                          type="url"
                          value={shopEditLogo}
                          onChange={(e) => setShopEditLogo(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Bannière de couverture (URL)</label>
                        <input
                          type="url"
                          value={shopEditBanner}
                          onChange={(e) => setShopEditBanner(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                      >
                        Enregistrer les modifications
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 7: 💬 MESSAGES CLIENTS */}
          {/* ============================================================ */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs h-[540px] flex overflow-hidden animate-fade-in max-w-5xl mx-auto">
              
              {/* Chat list */}
              <div className="w-1/3 border-r border-stone-200 flex flex-col">
                <div className="p-3 border-b border-stone-100 font-bold text-xs uppercase text-stone-900">
                  Conversations ({messagesList.length})
                </div>
                <div className="flex-grow overflow-y-auto divide-y divide-stone-100">
                  {messagesList.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`w-full p-3 text-left transition-colors cursor-pointer ${
                        selectedChatId === chat.id ? "bg-stone-100" : "hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-stone-900">{chat.senderName}</span>
                        <span className="text-[9px] text-stone-400 font-mono">{chat.time}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{chat.preview}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat detail */}
              <div className="w-2/3 flex flex-col">
                {(() => {
                  const currentChat = messagesList.find((c) => c.id === selectedChatId) || messagesList[0];
                  if (!currentChat) {
                    return <div className="p-8 text-center text-stone-400 text-xs">Sélectionnez une discussion.</div>;
                  }
                  return (
                    <>
                      <div className="p-3 border-b border-stone-100 flex items-center justify-between">
                        <span className="font-bold text-xs uppercase text-stone-900">{currentChat.senderName}</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Client Vérifié</span>
                      </div>

                      <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-[#FAF9F6]">
                        {currentChat.chatHistory?.map((msg: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex flex-col ${msg.sender === "seller" ? "items-end" : "items-start"}`}
                          >
                            <div className={`max-w-xs p-3 rounded-2xl text-xs leading-relaxed ${
                              msg.sender === "seller"
                                ? "bg-[#0B4D26] text-white rounded-br-none"
                                : "bg-white border border-stone-200 text-stone-900 rounded-bl-none"
                            }`}>
                              {msg.text}
                            </div>
                            <span className="text-[9px] text-stone-400 font-mono mt-1 px-1">{msg.time}</span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendChatReply} className="p-3 border-t border-stone-200 bg-white flex gap-2">
                        <input
                          type="text"
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          placeholder="Écrivez votre réponse au client..."
                          className="flex-grow px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#0B4D26] hover:bg-[#083a1d] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
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


          {/* ============================================================ */}
          {/* TAB 8: ⭐ AVIS CLIENTS & MODÉRATION */}
          {/* ============================================================ */}
          {activeTab === "reviews" && (
            <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
              
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-stone-900">Évaluations &amp; Avis Clients</h3>
                  <p className="text-xs text-stone-500">Répondez publiquement aux retours d'expérience de vos acheteurs.</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-mono font-black text-xs text-amber-900">4.8 / 5</span>
                </div>
              </div>

              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{rev.clientName}</span>
                          <span className="text-stone-400">&bull; {rev.productName}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? "fill-amber-500" : "text-stone-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{rev.date}</span>
                    </div>

                    <p className="text-stone-700 leading-relaxed font-sans bg-stone-50 p-3 rounded-xl">
                      « {rev.comment} »
                    </p>

                    {/* Replies */}
                    {rev.replies?.length > 0 && (
                      <div className="pl-4 border-l-2 border-[#0B4D26] space-y-1">
                        <span className="text-[10px] font-bold text-[#0B4D26] uppercase tracking-wider block">Votre réponse officielle :</span>
                        {rev.replies.map((reply: string, rIdx: number) => (
                          <p key={rIdx} className="text-stone-600 text-[11px] font-sans">{reply}</p>
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={reviewReplyInputs[rev.id] || ""}
                        onChange={(e) => setReviewReplyInputs({ ...reviewReplyInputs, [rev.id]: e.target.value })}
                        placeholder="Répondre à cet avis..."
                        className="flex-grow px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReviewReply(rev.id)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Répondre
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 9: 💳 PORTEFEUILLE & RETRAITS */}
          {/* ============================================================ */}
          {activeTab === "wallet" && (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
              
              {/* Balances overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Chiffre d'Affaires Brut</span>
                  <p className="text-2xl font-mono font-black text-stone-900">{formatSellerPrice(totalGrossSales)}</p>
                  <p className="text-[10px] text-stone-500">100% des ventes commandées</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Commission Marketplace</span>
                  <p className="text-2xl font-mono font-black text-amber-700">10%</p>
                  <p className="text-[10px] text-stone-500">-{formatSellerPrice(commissionMiabeAsi)} prélevés aux ventes</p>
                </div>

                <div className="bg-[#0B4D26] text-white p-5 rounded-2xl shadow-md space-y-1">
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest block">Solde Net Disponible</span>
                  <p className="text-2xl font-mono font-black text-white">{formatSellerPrice(availableBalance)}</p>
                  <p className="text-[10px] text-emerald-200">Reversable vers T-Money &amp; Flooz</p>
                </div>

              </div>

              {/* Withdrawal Request Form */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-sm font-black uppercase text-stone-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#0B4D26]" />
                    <span>Demander un Virement vers Mobile Money</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 font-sans">
                    Vos fonds de vente sont transférés sous 24h ouvrées vers votre numéro de téléphone togolais.
                  </p>
                </div>

                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Montant à retirer (Min 2 000 F) *</label>
                      <input
                        type="number"
                        required
                        min={2000}
                        max={availableBalance > 0 ? availableBalance : 1000000}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Ex: 10000"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Moyen de virement *</label>
                      <select
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                      >
                        <option value="Mix by Yas">Mix by Yas (Recommandé)</option>
                        <option value="Flooz">Flooz (Moov Togo)</option>
                        <option value="T-Money">T-Money (Togocom)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Numéro de transfert (+228) *</label>
                      <input
                        type="tel"
                        required
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                        placeholder="Ex: 90123456"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingWithdraw}
                      className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                    >
                      {isSubmittingWithdraw ? "Enregistrement..." : "Soumettre la demande de transfert"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Withdrawals history */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Historique de vos retraits</h4>
                {withdrawalHistory.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-xs">
                    Aucun retrait demandé pour le moment.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {withdrawalHistory.map((item, idx) => (
                      <div key={idx} className="bg-white border border-stone-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-mono font-black text-stone-900">{formatSellerPrice(item.amount)}</p>
                          <p className="text-[10px] text-stone-500">{item.method} &bull; +{item.phone}</p>
                        </div>
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.status === "Payé"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "Rejeté"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {item.status || "En attente"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 10: 💎 MON ABONNEMENT */}
          {/* ============================================================ */}
          {activeTab === "subscription" && (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
              
              {/* Current Tier Box */}
              <div className="bg-stone-950 text-white p-6 rounded-2xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">Abonnement Actuel</span>
                  <h3 className="text-2xl font-black uppercase text-white">Formule {currentPlan}</h3>
                  <p className="text-xs text-stone-400 font-sans">
                    {currentPlan === "BUSINESS" && "Accès VIP : Bannière d'accueil, priorité maximale Produits Phares, URL dédiée."}
                    {currentPlan === "PRO" && "Formule Marque : URL publique personnalisée, Produits Phares, statistiques."}
                    {currentPlan === "Gratuit" && "Formule Découverte : Gestion produits et commandes (Sans URL dédiée)."}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-2xl font-mono font-black text-[#d4af37]">
                    {currentPlan === "BUSINESS" ? "3 200 FCFA" : currentPlan === "PRO" ? "1 600 FCFA" : "0 FCFA"}
                  </p>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">/ mois</span>
                </div>
              </div>

              {/* 3 Plans Comparison Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
                
                {/* GRATUIT */}
                <div className={`bg-white rounded-2xl border p-5 flex flex-col justify-between ${
                  currentPlan === "Gratuit" ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200"
                }`}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Formule 1</span>
                    <h4 className="text-base font-black text-stone-900 uppercase">GRATUIT</h4>
                    <p className="font-mono font-black text-xl text-stone-900">0 FCFA <span className="text-xs text-stone-400 font-normal">/ mois</span></p>
                    <ul className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Commission marketplace : <strong>10% sur chaque vente</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Catalogue : <strong>Produits illimités</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Ventes ouvertes sur les 7 pays</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Gestion commandes &amp; stocks</li>
                      <li className="flex items-center gap-1.5 text-stone-400 line-through"><X className="w-3.5 h-3.5 text-stone-300" /> Aucune URL de boutique</li>
                      <li className="flex items-center gap-1.5 text-stone-400 line-through"><X className="w-3.5 h-3.5 text-stone-300" /> Pas de Produits phares</li>
                      <li className="flex items-center gap-1.5 text-stone-400 line-through"><X className="w-3.5 h-3.5 text-stone-300" /> Pas d'export comptable CSV</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    {currentPlan === "Gratuit" ? (
                      <span className="block py-2 text-center text-xs font-bold text-stone-500 bg-stone-100 rounded-xl uppercase">Formule Actuelle</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmPlanChange("Gratuit")}
                        className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                      >
                        Passer à Gratuit
                      </button>
                    )}
                  </div>
                </div>

                {/* PRO */}
                <div className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between ${
                  currentPlan === "PRO" ? "border-[#0B4D26] ring-2 ring-[#0B4D26]" : "border-[#0B4D26]/40"
                }`}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B4D26]">Formule Recommandée</span>
                    <h4 className="text-base font-black text-stone-900 uppercase">PRO</h4>
                    <p className="font-mono font-black text-xl text-[#0B4D26]">1 600 FCFA <span className="text-xs text-stone-400 font-normal">/ mois</span></p>
                    <ul className="space-y-2 text-xs text-stone-700 border-t border-stone-100 pt-3 font-medium">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B4D26]" /> Commission marketplace : <strong>10% sur chaque vente</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B4D26]" /> Catalogue : <strong>Produits illimités</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B4D26]" /> <strong>URL de boutique personnalisée</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B4D26]" /> Jusqu'à 2 Produits Phares mis en avant</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B4D26]" /> Badge officiel Vendeur PRO Vérifié</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B4D26]" /> Support prioritaire WhatsApp</li>
                      <li className="flex items-center gap-1.5 text-stone-400 line-through"><X className="w-3.5 h-3.5 text-stone-300" /> Bannière carrousel d'accueil</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    {currentPlan === "PRO" ? (
                      <span className="block py-2 text-center text-xs font-bold text-emerald-800 bg-emerald-100 rounded-xl uppercase">Formule Actuelle</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmPlanChange("PRO")}
                        className="w-full py-2 bg-[#0B4D26] hover:bg-[#083a1d] text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer shadow-md"
                      >
                        Activer PRO (1 600 F)
                      </button>
                    )}
                  </div>
                </div>

                {/* BUSINESS */}
                <div className={`bg-stone-900 text-white rounded-2xl border p-5 flex flex-col justify-between ${
                  currentPlan === "BUSINESS" ? "border-[#d4af37] ring-2 ring-[#d4af37]" : "border-stone-800"
                }`}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Haute Visibilité Élite</span>
                    <h4 className="text-base font-black text-white uppercase">BUSINESS</h4>
                    <p className="font-mono font-black text-xl text-[#d4af37]">3 200 FCFA <span className="text-xs text-stone-400 font-normal">/ mois</span></p>
                    <ul className="space-y-2 text-xs text-stone-200 border-t border-stone-800 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#d4af37]" /> Commission marketplace : <strong>10% sur chaque vente</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#d4af37]" /> Catalogue : <strong>Produits illimités</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#d4af37]" /> Tout le forfait PRO inclus</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#d4af37]" /> <strong>Bannière Carrousel en Page d'Accueil</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#d4af37]" /> Jusqu'à 5 Produits Phares prioritaires</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#d4af37]" /> <strong>Export comptable CSV instantané</strong></li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#d4af37]" /> Conseiller d'affaires dédié 24/7</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    {currentPlan === "BUSINESS" ? (
                      <span className="block py-2 text-center text-xs font-bold text-[#d4af37] bg-stone-950 rounded-xl uppercase border border-[#d4af37]/40">Formule Actuelle</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmPlanChange("BUSINESS")}
                        className="w-full py-2 bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 font-black text-xs uppercase rounded-xl transition-colors cursor-pointer shadow-lg"
                      >
                        Activer BUSINESS (3 200 F)
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>


      {/* ============================================================ */}
      {/* MODAL: PROPOSER UN PRODUIT PHARE */}
      {/* ============================================================ */}
      <AnimatePresence>
        {featuredModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Proposer un Produit Phare</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setFeaturedModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Sélectionnez un article de votre catalogue. Il sera transmis pour modération et priorisé selon votre forfait (<strong>{currentPlan}</strong>).
              </p>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Sélectionner le produit *</label>
                <select
                  value={selectedProductForFeatured}
                  onChange={(e) => setSelectedProductForFeatured(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                >
                  <option value="">-- Choisir un produit --</option>
                  {myProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom} - {formatPrice(p.prix, p.currencyCode || sellerCurrencyCode)}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeaturedModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold uppercase text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!selectedProductForFeatured}
                  onClick={handleProposeFeaturedProduct}
                  className="px-5 py-2 bg-[#0B4D26] hover:bg-[#083a1d] disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Transmettre la demande &rarr;
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ============================================================ */}
      {/* MODAL: UPGRADE / PLAN SWITCH */}
      {/* ============================================================ */}
      <AnimatePresence>
        {upgradeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#d4af37]" />
                  <span>Passer en Formule {targetPlanToUpgrade}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Confirmez votre passage en formule <strong>{targetPlanToUpgrade} ({targetPlanToUpgrade === "BUSINESS" ? "3 200 FCFA/mois" : "1 600 FCFA/mois"})</strong> pour débloquer immédiatement vos outils de visibilité.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                <p className="font-bold uppercase text-[10px] tracking-wider">Avantages débloqués :</p>
                {targetPlanToUpgrade === "PRO" ? (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>URL de boutique personnalisée (miabeasi.com/boutique/...)</li>
                    <li>Badge officiel Vendeur PRO</li>
                    <li>Accès aux Produits Phares</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>Bannière d'accueil sur la page principale</li>
                    <li>Priorité maximale sur les Produits Phares (jusqu'à 5)</li>
                    <li>Badge officiel Vendeur BUSINESS</li>
                  </ul>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold uppercase text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmPlanChange(targetPlanToUpgrade)}
                  className="px-5 py-2 bg-[#0B4D26] hover:bg-[#083a1d] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Confirmer l'activation &rarr;
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#0B4D26]" />
                  <span>{isEditingProduct ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Nom du produit *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ex: Miel Sauvage Pur de Fleurs"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Description détaillée *</label>
                  <textarea
                    required
                    rows={3}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Décrivez les ingrédients, bienfaits, contenance, méthode de fabrication..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26] resize-none"
                  />
                </div>

                {/* Seller country & currency indicator for product */}
                <div className="flex items-center justify-between bg-stone-100 border border-stone-200 px-3 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{sellerCountry.flagEmoji}</span>
                    <span className="font-bold text-stone-800">{sellerCountry.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0B4D26] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <span>Devise :</span>
                    <span>{sellerCurrencyCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Prix ({sellerCurrencyCode}) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="3500"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#0B4D26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Prix Barré ({sellerCurrencyCode})
                    </label>
                    <input
                      type="number"
                      value={newProdPriceBarre}
                      onChange={(e) => setNewProdPriceBarre(e.target.value)}
                      placeholder="4000"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:border-[#0B4D26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Quantité Stock *</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:border-[#0B4D26]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Catégorie *</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">URL de l'image *</label>
                    <input
                      type="url"
                      required
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4D26]"
                    />
                  </div>
                </div>

                {newProdImageUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Aperçu :</span>
                    <div className="h-28 w-28 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                      <img src={newProdImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold uppercase text-stone-600 hover:bg-stone-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B4D26] hover:bg-[#083a1d] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {isEditingProduct ? "Enregistrer les modifications" : "Publier le produit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ============================================================ */}
      {/* MOBILE DRAWER NAVIGATION */}
      {/* ============================================================ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex lg:hidden">
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              className="w-64 bg-stone-950 text-white h-full flex flex-col justify-between p-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-white">Menu Vendeur</span>
                    <span className="text-xs bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded text-stone-300 font-bold flex items-center gap-1">
                      <span>{sellerCountry.flagEmoji}</span>
                      <span className="text-[10px]">{sellerCurrencyCode}</span>
                    </span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-stone-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1 text-left">
                  {[
                    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
                    { id: "products", label: "Mes Produits", icon: Package },
                    { id: "orders", label: "Commandes", icon: ShoppingBag },
                    { id: "featured", label: "Produits Phares", icon: Star },
                    { id: "banner", label: "Bannière d'Accueil", icon: ImageIcon },
                    { id: "shop", label: "Ma Vitrine & URL", icon: Globe },
                    { id: "messages", label: "Messages", icon: MessageSquare },
                    { id: "reviews", label: "Avis Clients", icon: Award },
                    { id: "wallet", label: "Portefeuille", icon: Wallet },
                    { id: "subscription", label: "Mon Abonnement", icon: Crown }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id as TabType);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider ${
                          isActive ? "bg-[#0B4D26] text-white" : "text-stone-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToSite();
                }}
                className="w-full py-2.5 bg-stone-900 text-stone-300 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Retour au site
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SellerWorkspace;


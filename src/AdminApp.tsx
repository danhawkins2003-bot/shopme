import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

const memoryStorage: Record<string, string> = {};
const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return memoryStorage[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  },
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      for (const k in memoryStorage) {
        delete memoryStorage[k];
      }
    }
  }
};
const localStorage = safeLocalStorage;

import {
  Lock,
  Unlock,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Plus,
  Image as ImageIcon,
  ChevronDown,
  Search,
  BookOpen,
  Database,
  BarChart3,
  Settings,
  Users,
  Package,
  AlertTriangle,
  FileText,
  Bell,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Camera,
  Sparkles,
  RotateCcw,
  Upload,
  Download,
  Eye,
  TrendingUp,
  Filter,
  Check,
  Power,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Product } from "./types";
import AdminStats from "./components/AdminStats";
import { InvoiceModal } from "./components/InvoiceModal";
import { INITIAL_PROMO_SLIDES, PromoSlide } from "./data/promoBanners";
import { DEFAULT_HERO_CARDS, DEFAULT_GALLERY_CARDS, ShowcaseCard } from "./data/showcaseCards";
import { fileToOptimizedDataUrl } from "./lib/imageUtils";
import { ImageUploadModal } from "./components/ImageUploadModal";
import { uploadImageToServer } from "./lib/imageUploadHelper";
import officialLogoImg from "./assets/images/miabe_asi_official_logo_1787563252544.jpg";

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<"catalog" | "analytics" | "requests" | "vendors" | "banners" | "stats" | "settings">("catalog");
  const [adminStatusFilter, setAdminStatusFilter] = useState<"all" | "actif" | "inactif" | "en_rupture">("all");
  const [productAnalytics, setProductAnalytics] = useState<{
    summary: {
      totalProducts: number;
      activeProducts: number;
      inactiveProducts: number;
      outOfStockProducts: number;
      totalViews: number;
      totalSales: number;
      totalRevenue: number;
      overallConversionRate: number;
    };
    products: any[];
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [analyticsPartnerFilter, setAnalyticsPartnerFilter] = useState("Tous");
  const [analyticsSortBy, setAnalyticsSortBy] = useState<"views" | "sales" | "revenue" | "conversion">("views");
  const [bannerSubSection, setBannerSubSection] = useState<"carousel" | "vitrine" | "gallery">("vitrine");
  // Server is the single source of truth; initialize with canonical slides, localStorage serves only as fallback
  const [adminPromoSlides, setAdminPromoSlides] = useState<PromoSlide[]>(INITIAL_PROMO_SLIDES);
  const [promoSaveSuccess, setPromoSaveSuccess] = useState(false);

  // Homepage Showcase Cards State (Hero 4 cards + Gallery 4 cards)
  // Server is the single source of truth; initialize with clean defaults to prevent stale localStorage override
  const [adminHeroCards, setAdminHeroCards] = useState<ShowcaseCard[]>(DEFAULT_HERO_CARDS);
  const [adminGalleryCards, setAdminGalleryCards] = useState<ShowcaseCard[]>(DEFAULT_GALLERY_CARDS);

  // Modal for direct device photo upload in admin
  const [activeAdminUploadModal, setActiveAdminUploadModal] = useState<{
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    defaultImageUrl: string;
    categoryType: "banner" | "hero" | "gallery";
    index?: number;
    aspectRatio: "square" | "portrait" | "landscape" | "banner";
  } | null>(null);

  // Banner Requests from Business Sellers State
  const [bannerRequests, setBannerRequests] = useState<any[]>([]);
  // Featured Products Requests from Pro & Business Sellers State
  const [featuredRequests, setFeaturedRequests] = useState<any[]>([]);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const fetchAdminRequests = () => {
    fetch("/api/admin/banner-requests")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.requests)) {
          setBannerRequests(data.requests);
        }
      })
      .catch(() => {});

    fetch("/api/admin/featured-requests", {
      headers: { "Authorization": "asime2026" }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.requests)) {
          setFeaturedRequests(data.requests);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const handleApproveBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banner-requests/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Bannière partenaire approuvée et publiée sur la page d'accueil !");
        fetchAdminRequests();
      } else {
        showToast(`Erreur: ${data.error}`);
      }
    } catch {
      showToast("Erreur lors de l'approbation de la bannière.");
    }
  };

  const handleRejectBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banner-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Visuel non conforme aux spécifications." })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Demande de bannière rejetée.");
        fetchAdminRequests();
      }
    } catch {
      showToast("Erreur lors du rejet.");
    }
  };

  const handleApproveFeatured = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/featured-requests/${productId}/approve`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Produit validé comme Produit Phare !");
        fetchAdminRequests();
        fetchProducts();
      }
    } catch {
      showToast("Erreur lors de l'approbation.");
    }
  };

  const handleRejectFeatured = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/featured-requests/${productId}/reject`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("Demande de Produit Phare refusée.");
        fetchAdminRequests();
      }
    } catch {
      showToast("Erreur lors du rejet.");
    }
  };

  // Sync showcase from API on mount
  useEffect(() => {
    fetch("/api/showcase?t=" + Date.now(), {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Accept": "application/json"
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (Array.isArray(data.heroCards) && data.heroCards.length > 0) {
            setAdminHeroCards(data.heroCards);
          }
          if (Array.isArray(data.galleryCards) && data.galleryCards.length > 0) {
            setAdminGalleryCards(data.galleryCards);
          }
          try {
            localStorage.setItem("asime_showcase_cards", JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem("asime_showcase_cards");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.heroCards) && parsed.heroCards.length > 0) {
              setAdminHeroCards(parsed.heroCards);
            }
            if (Array.isArray(parsed.galleryCards) && parsed.galleryCards.length > 0) {
              setAdminGalleryCards(parsed.galleryCards);
            }
          }
        } catch (e) {}
      });

    fetch("/api/banners?t=" + Date.now(), { 
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Accept": "application/json"
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAdminPromoSlides(data);
          try {
            localStorage.setItem("asime_promo_slides", JSON.stringify(data));
          } catch (e) {}
        } else {
          try {
            const saved = localStorage.getItem("asime_promo_slides");
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) setAdminPromoSlides(parsed);
            }
          } catch (e) {}
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("asime_promo_slides");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setAdminPromoSlides(parsed);
          }
        } catch (e) {}
      });
  }, []);

  const saveAdminShowcaseCards = async (newHero: ShowcaseCard[], newGallery: ShowcaseCard[]) => {
    const payload = { auth: "asime2026-auth-session", heroCards: newHero, galleryCards: newGallery };
    try {
      const res = await fetch("/api/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "asime2026-auth-session" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAdminHeroCards(newHero);
        setAdminGalleryCards(newGallery);
        try {
          localStorage.setItem("asime_showcase_cards", JSON.stringify({ heroCards: newHero, galleryCards: newGallery }));
        } catch (e) {}
        setPromoSaveSuccess(true);
        setTimeout(() => setPromoSaveSuccess(false), 3000);
      } else {
        alert("Erreur lors de l'enregistrement de la vitrine sur le serveur.");
      }
    } catch (e) {
      console.error("Failed to save showcase cards", e);
      alert("Erreur réseau : impossible de joindre le serveur.");
    }
  };

  const saveAdminPromoSlides = async (newSlides: PromoSlide[]) => {
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "asime2026-auth-session" },
        body: JSON.stringify({ auth: "asime2026-auth-session", slides: newSlides })
      });
      if (res.ok) {
        setAdminPromoSlides(newSlides);
        localStorage.setItem("asime_promo_slides", JSON.stringify(newSlides));
        setPromoSaveSuccess(true);
        setTimeout(() => setPromoSaveSuccess(false), 3000);
      } else {
        alert("Erreur lors de l'enregistrement des bannières sur le serveur.");
      }
    } catch (e) {
      console.error("Failed to save promo slides", e);
      alert("Erreur réseau : impossible de joindre le serveur.");
    }
  };

  const handleSlideImageUpload = async (index: number, file: File) => {
    if (!file) return;
    try {
      const dataUrl = await fileToOptimizedDataUrl(file, 1600, 1600, 0.88);
      const updated = [...adminPromoSlides];
      updated[index] = { ...updated[index], imageUrl: dataUrl };
      saveAdminPromoSlides(updated);
    } catch (e) {
      console.error("Error optimizing slide image", e);
    }
  };

  const handleHeroCardImageUpload = async (index: number, file: File) => {
    if (!file) return;
    try {
      const prevUrl = adminHeroCards[index]?.imageUrl;
      const res = await uploadImageToServer(file, prevUrl, `hero_${index}_${file.name}`);
      if (res.success && res.url) {
        const updatedHero = [...adminHeroCards];
        updatedHero[index] = { ...updatedHero[index], imageUrl: res.url };
        await saveAdminShowcaseCards(updatedHero, adminGalleryCards);
      } else {
        alert(res.error || "Erreur lors du téléversement de l'image.");
      }
    } catch (e: any) {
      console.error("Error uploading hero card image", e);
      alert("Erreur lors du téléversement : " + (e.message || String(e)));
    }
  };

  const handleGalleryCardImageUpload = async (index: number, file: File) => {
    if (!file) return;
    try {
      const prevUrl = adminGalleryCards[index]?.imageUrl;
      const res = await uploadImageToServer(file, prevUrl, `gallery_${index}_${file.name}`);
      if (res.success && res.url) {
        const updatedGallery = [...adminGalleryCards];
        updatedGallery[index] = { ...updatedGallery[index], imageUrl: res.url };
        await saveAdminShowcaseCards(adminHeroCards, updatedGallery);
      } else {
        alert(res.error || "Erreur lors du téléversement de l'image.");
      }
    } catch (e: any) {
      console.error("Error uploading gallery card image", e);
      alert("Erreur lors du téléversement : " + (e.message || String(e)));
    }
  };

  const handleAddNewSlide = () => {
    const newSlide: PromoSlide = {
      id: `slide-${Date.now()}`,
      badgeTagFr: "NOUVEAU VISUEL",
      badgeTagEe: "YEYE",
      badgeSubFr: "TOGO VI",
      badgeSubEe: "TOGO VI",
      titleFr: "Nouvelle Affiche Promo",
      titleEe: "Nouvelle Affiche Promo",
      subtitleFr: "Collection exclusive",
      subtitleEe: "Collection exclusive",
      offerMainFr: "Offre Spéciale",
      offerMainEe: "Offre Spéciale",
      offerSubFr: "Made in Togo",
      offerSubEe: "Made in Togo",
      descFr: "Découvrez nos meilleurs produits locaux.",
      descEe: "Découvrez nos meilleurs produits locaux.",
      buttonTextFr: "Découvrir la sélection",
      buttonTextEe: "Découvrir la sélection",
      categoryTarget: "Made in Togo Premium",
      bgGradient: "linear-gradient(to right, #0a1f10, #050a06)",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
      imageAlt: "Nouvelle Affiche Promo"
    };
    saveAdminPromoSlides([...adminPromoSlides, newSlide]);
  };

  const handleDeleteSlide = (index: number) => {
    if (adminPromoSlides.length <= 1) {
      alert("Il doit y avoir au moins une affiche dans le carrousel.");
      return;
    }
    if (confirm("Voulez-vous vraiment supprimer cette affiche ?")) {
      const updated = adminPromoSlides.filter((_, i) => i !== index);
      saveAdminPromoSlides(updated);
    }
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [populating, setPopulating] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminPartnerFilter, setAdminPartnerFilter] = useState("Tous");

  const [whatsappDisplaySetting, setWhatsappDisplaySetting] = useState("22890000000");
  const [activeLogoId, setActiveLogoId] = useState(() => {
    try {
      return localStorage.getItem("asime-active-logo-id") || "official";
    } catch {
      return "official";
    }
  });
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);

  // Real-time admin operational states
  const [orders, setOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Invoice Modal State for Admin
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  // Partners Management State
  const [partnersList, setPartnersList] = useState<{ 
    id: string; 
    name: string; 
    description: string; 
    createdAt: string;
    contractType?: "subscription" | "commission";
    monthlyFee?: number;
    commissionRate?: number;
    contactPhone?: string;
    autoPublish?: boolean;
  }[]>([]);
  const [partnerFormName, setPartnerFormName] = useState("");
  const [partnerFormDescription, setPartnerFormDescription] = useState("");
  const [partnerFormContractType, setPartnerFormContractType] = useState<"subscription" | "commission">("subscription");
  const [partnerFormMonthlyFee, setPartnerFormMonthlyFee] = useState<number>(5000);
  const [partnerFormCommissionRate, setPartnerFormCommissionRate] = useState<number>(10);
  const [partnerFormContactPhone, setPartnerFormContactPhone] = useState<string>("");
  const [partnerFormAutoPublish, setPartnerFormAutoPublish] = useState<boolean>(true);

  const [partnerFormError, setPartnerFormError] = useState("");
  const [partnerFormSuccess, setPartnerFormSuccess] = useState("");

  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editContractType, setEditContractType] = useState<"subscription" | "commission">("subscription");
  const [editMonthlyFee, setEditMonthlyFee] = useState<number>(5000);
  const [editCommissionRate, setEditCommissionRate] = useState<number>(10);
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editAutoPublish, setEditAutoPublish] = useState(true);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setPartnersList(data);
      }
    } catch (e) {
      console.error("Error fetching partners list:", e);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerFormError("");
    setPartnerFormSuccess("");

    if (!partnerFormName.trim()) {
      setPartnerFormError("Le nom du partenaire est requis.");
      return;
    }

    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth: "asime2026-auth-session",
          name: partnerFormName,
          description: partnerFormDescription,
          contractType: partnerFormContractType,
          monthlyFee: partnerFormContractType === "subscription" ? Number(partnerFormMonthlyFee) : 0,
          commissionRate: partnerFormContractType === "commission" ? Number(partnerFormCommissionRate) : 0,
          contactPhone: partnerFormContactPhone,
          autoPublish: partnerFormAutoPublish
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPartnerFormSuccess("Partenaire et contrat configurés avec succès !");
        setPartnerFormName("");
        setPartnerFormDescription("");
        setPartnerFormContractType("subscription");
        setPartnerFormMonthlyFee(5000);
        setPartnerFormCommissionRate(10);
        setPartnerFormContactPhone("");
        setPartnerFormAutoPublish(true);
        fetchPartners();
      } else {
        setPartnerFormError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setPartnerFormError("Erreur lors de l'enregistrement.");
    }
  };

  const handleUpdatePartner = async (id: string) => {
    try {
      const res = await fetch("/api/partners/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth: "asime2026-auth-session",
          id,
          description: editDesc,
          contractType: editContractType,
          monthlyFee: editContractType === "subscription" ? Number(editMonthlyFee) : 0,
          commissionRate: editContractType === "commission" ? Number(editCommissionRate) : 0,
          contactPhone: editContactPhone,
          autoPublish: editAutoPublish
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingPartnerId(null);
        fetchPartners();
      } else {
        alert(data.error || "Une erreur est survenue lors de la mise à jour.");
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  const startEditingPartner = (partner: any) => {
    setEditingPartnerId(partner.id);
    setEditDesc(partner.description || "");
    setEditContractType(partner.contractType || "subscription");
    setEditMonthlyFee(partner.monthlyFee !== undefined ? partner.monthlyFee : 5000);
    setEditCommissionRate(partner.commissionRate !== undefined ? partner.commissionRate : 10);
    setEditContactPhone(partner.contactPhone || "");
    setEditAutoPublish(partner.autoPublish !== undefined ? partner.autoPublish : true);
  };

  const handleDeletePartner = async (name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le partenaire "${name}" ? \nTous ses produits associés seront réaffectés à "Boutique en Direct" (système géré).`)) {
      return;
    }

    try {
      const res = await fetch(`/api/partners/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          "Authorization": "asime2026-auth-session"
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchPartners();
        fetchProducts(); // Refresh products to view revised counts
      } else {
        alert(data.error || "Impossible d'exécuter l'action.");
      }
    } catch (err) {
      alert("Erreur réseau de suppression.");
    }
  };

  // Product Form states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrix, setFormPrix] = useState("");
  const [formPrixBarre, setFormPrixBarre] = useState("");
  const [formCategory, setFormCategory] = useState("Vêtements & Mode");
  const [formPhare, setFormPhare] = useState(false);
  const [formStock, setFormStock] = useState("10");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formPartenaire, setFormPartenaire] = useState("Boutique en Direct");
  const [formLienAffilie, setFormLienAffilie] = useState("");
  const [formStatus, setFormStatus] = useState<"actif" | "inactif" | "en_rupture">("actif");
  const [vendorOfferFilter, setVendorOfferFilter] = useState<"all" | "Offre 1" | "Offre 2" | "Offre 3">("all");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
      } catch (e) {}
      const delSet = new Set(deletedIds.map(String));

      const res = await fetch("/api/products?t=" + Date.now(), {
        headers: { "Accept": "application/json" }
      });
      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      if (res.ok && (contentType.includes("application/json") || contentType.includes("json"))) {
        const text = await res.text();
        if (text && text.trim().startsWith("[")) {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            const clean = data.filter((p: any) => !delSet.has(String(p?.id)));
            setProducts(clean);
            return;
          }
        }
      }
      // Fallback
      const staticRes = await fetch("/produits.json?t=" + Date.now());
      if (staticRes.ok) {
        const staticText = await staticRes.text();
        if (staticText && staticText.trim().startsWith("[")) {
          const raw = JSON.parse(staticText);
          if (Array.isArray(raw)) {
            setProducts(raw.filter((p: any) => !delSet.has(String(p?.id))));
          }
        }
      }
    } catch (err) {
      console.warn("Notice fetching products inside administration console:", err);
    }
  };

  // Memoized aggregation of partners and contract data
  const partnersData = React.useMemo(() => {
    // Only compile/show partners added explicitly by the user in this tab
    const finalPartners = partnersList.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || "Aucune note",
      contractType: p.contractType || "subscription",
      monthlyFee: p.monthlyFee !== undefined ? p.monthlyFee : 5000,
      commissionRate: p.commissionRate !== undefined ? p.commissionRate : 10,
      contactPhone: p.contactPhone || "",
      autoPublish: p.autoPublish !== undefined ? p.autoPublish : true,
      createdAt: p.createdAt
    }));

    return finalPartners.map(pInfo => {
      const pName = pInfo.name;
      // Get all products assigned to this partner name
      const partnerProds = products.filter(p => {
        const prodPartnerName = p.partenaire || "Boutique en Direct";
        return prodPartnerName.toLowerCase() === pName.toLowerCase();
      });

      const totalProducts = partnerProds.length;
      const totalStock = partnerProds.reduce((acc, curr) => acc + (curr.stock || 0), 0);
      const outOfStockCount = partnerProds.filter(curr => (curr.stock || 0) <= 0).length;
      
      const categories: string[] = [];
      partnerProds.forEach(curr => {
        const catFriendly = curr.categorie.split(" ")[0] || curr.categorie;
        if (catFriendly && !categories.includes(catFriendly)) {
          categories.push(catFriendly);
        }
      });

      const minPrice = partnerProds.length ? Math.min(...partnerProds.map(curr => curr.prix)) : 0;
      const maxPrice = partnerProds.length ? Math.max(...partnerProds.map(curr => curr.prix)) : 0;

      return {
        id: pInfo.id,
        name: pName,
        description: pInfo.description,
        contractType: pInfo.contractType,
        monthlyFee: pInfo.monthlyFee,
        commissionRate: pInfo.commissionRate,
        contactPhone: pInfo.contactPhone,
        autoPublish: pInfo.autoPublish,
        createdAt: pInfo.createdAt,
        totalProducts,
        totalStock,
        outOfStockCount,
        categories,
        minPrice,
        maxPrice
      };
    });
  }, [products, partnersList]);

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const token = sessionStorage.getItem("asime_admin_token") || "asime2026-auth-session";
      const resOrders = await fetch("/api/admin/orders", {
        headers: { "Authorization": token }
      });
      if (resOrders.ok) {
        const data = await resOrders.json();
        setOrders(data);
      }

      const resWithdrawals = await fetch("/api/admin/withdrawals", {
        headers: { "Authorization": token }
      });
      if (resWithdrawals.ok) {
        const data = await resWithdrawals.json();
        setWithdrawals(data);
      }

      const resUsers = await fetch("/api/admin/users", {
        headers: { "Authorization": token }
      });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    if (!confirm("Voulez-vous vraiment approuver et marquer ce retrait comme payé ?")) return;
    try {
      const token = sessionStorage.getItem("asime_admin_token") || "asime2026-auth-session";
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: "POST",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    if (!confirm("Voulez-vous vraiment rejeter cette demande de retrait ? Le montant sera recrédité sur le portefeuille du vendeur.")) return;
    try {
      const token = sessionStorage.getItem("asime_admin_token") || "asime2026-auth-session";
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: "POST",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  const handleApproveSeller = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment approuver et activer l'espace de ce vendeur ?")) return;
    try {
      const token = sessionStorage.getItem("asime_admin_token") || "asime2026-auth-session";
      const res = await fetch(`/api/admin/users/${userId}/approve-seller`, {
        method: "POST",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  const handleRejectSeller = async (userId: string) => {
    if (!confirm("Voulez-vous rejeter l'inscription de ce vendeur ? Son statut passera à Rejeté et il sera notifié.")) return;
    try {
      const token = sessionStorage.getItem("asime_admin_token") || "asime2026-auth-session";
      const res = await fetch(`/api/admin/users/${userId}/reject-seller`, {
        method: "POST",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  const handleValidatePayment = async (orderId: string) => {
    if (!confirm(`Voulez-vous valider manuellement le paiement de la commande #${orderId} ?`)) return;
    try {
      const token = sessionStorage.getItem("asime_admin_token") || "asime2026-auth-session";
      const res = await fetch(`/api/admin/orders/${orderId}/validate-payment`, {
        method: "POST",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = sessionStorage.getItem("asime_admin_token") || "asime2026-auth-session";
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token 
        },
        body: JSON.stringify({ orderStatus: status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 6000);
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  const [paymentGatewayStatus, setPaymentGatewayStatus] = useState<{
    configured: boolean;
    mode: string;
    hasMasterKey: boolean;
    hasPrivateKey: boolean;
    hasToken: boolean;
    maskedMasterKey?: string | null;
    maskedToken?: string | null;
  } | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchPartners();
    // Check and verify admin session token with server
    const token = sessionStorage.getItem("asime_admin_token");
    if (token) {
      fetch("/api/admin/verify", {
        headers: { "Authorization": token }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.role === "admin") {
            setIsAdminAuthenticated(true);
          } else {
            sessionStorage.removeItem("asime_admin_token");
            setIsAdminAuthenticated(false);
          }
        })
        .catch(() => {
          setIsAdminAuthenticated(false);
        });
    }
    
    // Fetch global server-side settings
    fetch("/api/settings?t=" + Date.now(), { cache: "no-store" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.whatsappMerchantNumber) setWhatsappDisplaySetting(data.whatsappMerchantNumber);
          if (data.activeLogoId) {
            setActiveLogoId(data.activeLogoId);
            try { localStorage.setItem("asime-active-logo-id", data.activeLogoId); } catch {}
          }
        }
      })
      .catch(err => console.error("Error fetching settings:", err));

    // Fetch payment gateway status
    fetch("/api/payments/status")
      .then(res => res.ok ? res.json() : null)
      .then(data => setPaymentGatewayStatus(data))
      .catch(err => console.error("Error fetching payment status:", err));
  }, []);

  const formatFCFA = (amount: number | null) => {
    if (amount === null || isNaN(amount)) return "";
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem("asime_admin_token", "asime2026-auth-session");
        setAdminPassword("");
      } else {
        setAdminAuthError(data.error || "Mot de passe incorrect");
      }
    } catch (err) {
      setAdminAuthError("Une erreur est survenue lors de la connexion.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("asime_admin_token");
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.nom);
    setFormDescription(prod.description);
    setFormPrix(String(prod.prix));
    setFormPrixBarre(prod.prixBarre ? String(prod.prixBarre) : "");
    setFormCategory(prod.categorie);
    setFormPhare(prod.phare);
    setFormStock(String(prod.stock));
    setFormImages(prod.images || []);
    setFormPartenaire(prod.partenaire || "Boutique en Direct");
    setFormLienAffilie(prod.lienAffilie || "");
    const initialStatus: "actif" | "inactif" | "en_rupture" = 
      prod.status === "inactif" || prod.status === "brouillon"
        ? "inactif"
        : prod.status === "en_rupture" || (prod.stock || 0) <= 0
        ? "en_rupture"
        : "actif";
    setFormStatus(initialStatus);
    setFormError("");
    setFormSuccess("");
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrix("");
    setFormPrixBarre("");
    setFormCategory("Vêtements & Mode");
    setFormPhare(false);
    setFormStock("10");
    setFormImages([]);
    setFormPartenaire("Boutique en Direct");
    setFormLienAffilie("");
    setFormStatus("actif");
    setFormError("");
    setFormSuccess("");
  };

  const fetchProductAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/products-analytics?t=" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setProductAnalytics(data);
      }
    } catch (e) {
      console.warn("Analytics fetch error:", e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleToggleProductStatus = async (product: Product, newStatus: "actif" | "inactif" | "en_rupture", newStock?: number) => {
    try {
      const payload: any = { status: newStatus };
      if (typeof newStock !== "undefined") {
        payload.stock = newStock;
      } else if (newStatus === "en_rupture") {
        payload.stock = 0;
      } else if (newStatus === "actif" && (product.stock || 0) <= 0) {
        payload.stock = 10;
      }

      const res = await fetch(`/api/products/${product.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "asime2026-auth-session" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          newStatus === "inactif" 
            ? `✓ "${product.nom}" est maintenant Inactif (masqué du site sans être supprimé).`
            : newStatus === "en_rupture"
            ? `⚠️ "${product.nom}" est marqué En Rupture de stock.`
            : `✓ "${product.nom}" est maintenant Actif et visible sur le site !`
        );
        // Immediate local state update
        setProducts(prev => prev.map(p => String(p.id) === String(product.id) ? { ...p, status: newStatus, stock: typeof payload.stock !== "undefined" ? payload.stock : p.stock } : p));
        fetchProducts();
        fetchProductAnalytics();
      } else {
        alert(data.error || "Impossible de modifier le statut.");
      }
    } catch (e: any) {
      alert("Erreur lors de la mise à jour du statut : " + (e.message || String(e)));
    }
  };

  const handleQuickAdjustStock = async (product: Product, delta: number) => {
    const currentStock = Number(product.stock) || 0;
    const nextStock = Math.max(0, currentStock + delta);
    const nextStatus = nextStock === 0 ? "en_rupture" : (product.status === "inactif" ? "inactif" : "actif");
    await handleToggleProductStatus(product, nextStatus, nextStock);
  };

  const handlePopulate100 = async () => {
    if (!confirm("Voulez-vous réinitialiser le catalogue et charger les 105 produits d'affiliation d'origine ?")) {
      return;
    }
    setPopulating(true);
    try {
      const res = await fetch("/api/admin/populate-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth: "asime2026-auth-session" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "105 produits d'affiliation générés avec succès !");
        fetchProducts();
      } else {
        alert(data.error || "Erreur de génération.");
      }
    } catch (err) {
      alert("Erreur réseau pendant la génération.");
    } finally {
      setPopulating(false);
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - formImages.length;
    if (remainingSlots <= 0) {
      setFormError("Vous pouvez télécharger jusqu'à 4 images au maximum.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];
    setFormError("");

    for (const file of filesToProcess) {
      try {
        const uploadRes = await uploadImageToServer(file, undefined, file.name);
        if (uploadRes.success && uploadRes.url) {
          setFormImages(prev => [...prev, uploadRes.url!].slice(0, 4));
        } else {
          setFormError(uploadRes.error || "Erreur de téléversement vers Supabase Storage.");
        }
      } catch (err: any) {
        setFormError("Erreur lors de l'envoi de l'image : " + (err.message || String(err)));
      }
    }

    e.target.value = "";
  };

  const removeUploadImage = (indexToRemove: number) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formName.trim()) {
      setFormError("Le nom du produit est obligatoire.");
      return;
    }
    const parsedPrix = Number(formPrix);
    if (isNaN(parsedPrix) || parsedPrix <= 0) {
      setFormError("Le prix doit être un nombre supérieur à zéro.");
      return;
    }

    const parsedPrixBarre = formPrixBarre.trim() ? Number(formPrixBarre) : null;
    if (parsedPrixBarre !== null && (isNaN(parsedPrixBarre) || parsedPrixBarre <= 0)) {
      setFormError("Le prix barré doit être vide ou un nombre supérieur à zéro.");
      return;
    }

    const parsedStock = Math.floor(Number(formStock));
    if (isNaN(parsedStock) || parsedStock < 0) {
      setFormError("La quantité de stock doit être un entier positif.");
      return;
    }

    // Ensure any remaining base64 images are uploaded to Supabase Storage first
    const cleanImages: string[] = [];
    for (let i = 0; i < formImages.length; i++) {
      const img = formImages[i];
      if (img.startsWith("data:")) {
        const upRes = await uploadImageToServer(img, editingProduct?.images?.[i]);
        if (upRes.success && upRes.url) {
          cleanImages.push(upRes.url);
        } else {
          setFormError(upRes.error || "Échec du téléversement de l'image sur Supabase Storage.");
          return;
        }
      } else {
        cleanImages.push(img);
      }
    }

    const payload = {
      id: editingProduct?.id || null,
      nom: formName,
      description: formDescription,
      prix: parsedPrix,
      prixBarre: parsedPrixBarre,
      images: cleanImages.length > 0 ? cleanImages : ["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"],
      categorie: formCategory,
      phare: formPhare,
      stock: parsedStock,
      status: parsedStock === 0 ? "en_rupture" : formStatus,
      partenaire: formPartenaire,
      lienAffilie: formLienAffilie,
    };

    try {
      const res = await fetch("/api/products/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth: "asime2026-auth-session",
          product: payload
        })
      });

      const responseData = await res.json();
      if (res.ok && responseData.success) {
        setFormSuccess(editingProduct ? "Produit mis à jour avec succès dans Supabase !" : "Nouveau produit enregistré avec succès dans Supabase !");
        await fetchProducts();
        setTimeout(() => {
          resetForm();
        }, 1200);
      } else {
        setFormError(responseData.error || "Erreur de sauvegarde sur le serveur.");
      }
    } catch (err: any) {
      setFormError("Erreur réseau : " + (err.message || "Impossible de sauvegarder."));
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer définitivement le produit "${name}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "asime2026-auth-session"
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Immediate local state update
        setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
        
        // Immediate cache cleanup in localStorage
        try {
          const stored = localStorage.getItem("asime_emulated_products");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              localStorage.setItem("asime_emulated_products", JSON.stringify(parsed.filter((p: any) => String(p.id) !== String(id))));
            }
          }
          const delIds = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
          if (!delIds.includes(String(id))) {
            delIds.push(String(id));
            localStorage.setItem("asime_deleted_product_ids", JSON.stringify(delIds));
          }
        } catch (e) {}

        await fetchProducts();
      } else {
        alert(data.error || "Une erreur est survenue lors de la suppression.");
      }
    } catch (e: any) {
      alert("Impossible de supprimer le produit : " + (e.message || String(e)));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 font-sans">
      
      {/* Top Banner Administration Header */}
      <nav className="bg-neutral-950 text-white py-3 px-6 shadow-md border-b border-[#d4af37]/35">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#d4af37]/50 bg-white p-0.5 shrink-0 shadow-xs">
              <img src={officialLogoImg} alt="Miabé Asi Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="font-display font-black text-sm uppercase tracking-widest text-[#d4af37]">Miabé Asi</span>
            <span className="bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-sm ml-1">Console Administration</span>
          </div>
          <a 
            href="/" 
            className="text-xs text-neutral-400 hover:text-white transition-colors uppercase tracking-widest border border-neutral-800 px-3 py-1.5 rounded-sm"
          >
            Retour au site public →
          </a>
        </div>
      </nav>

      <div className="py-10 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#d4af37] text-xs font-semibold tracking-widest uppercase mb-1 block">Console de gestion intégrée</span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 uppercase">Administration Catalogue</h1>
          <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3"></div>
        </div>

        {!isAdminAuthenticated ? (
          <div className="max-w-md mx-auto bg-white border border-neutral-200 p-8 rounded-sm shadow-sm text-center">
            <Lock className="w-12 h-12 text-[#d4af37] mx-auto mb-4 animate-bounce" />
            <h2 className="font-display font-bold text-xl uppercase text-neutral-950 mb-2">Accès Sécurisé</h2>
            <p className="text-neutral-500 text-xs mb-6">Veuillez entrer le mot de passe d'administration pour gérer les stocks et modifier les produits.</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  required
                  placeholder="Mot de passe d'administration" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-sm px-4 py-2.5 text-xs text-center focus:ring-1 focus:ring-[#d4af37] outline-none bg-neutral-50"
                />
              </div>
              {adminAuthError && (
                <div className="text-red-650 bg-red-50 text-xs p-2 text-red-600 rounded-sm font-semibold">
                  {adminAuthError}
                </div>
              )}
              <button 
                type="submit" 
                className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                S'authentifier
              </button>
            </form>
            <p className="text-[10px] text-neutral-400 mt-6 uppercase tracking-wider">Indice : Utilisez "miabeasi2026" ou "asime2026" pour vous connecter.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* Session Info card */}
            <div className="bg-neutral-950 text-white p-6 rounded-sm border border-[#d4af37]/35 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-[#d4af37]" />
                  <h2 className="font-display font-extrabold text-lg uppercase tracking-wider">Console d'Administration Globale</h2>
                </div>
                <p className="text-xs text-neutral-300 mt-1">Supervisez le catalogue panafricain, activez/désactivez des produits en direct, analysez les performances et gérez les abonnements vendeurs.</p>
              </div>
              <button 
                onClick={handleAdminLogout}
                className="border border-white/20 text-white hover:bg-white/10 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-colors cursor-pointer"
              >
                Se Déconnecter
              </button>
            </div>

            {/* Quick Status KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div 
                onClick={() => { setActiveTab("catalog"); setAdminStatusFilter("all"); }}
                className="bg-white p-3.5 border border-neutral-200 rounded-sm hover:border-[#d4af37] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Catalogue Total</span>
                  <Package className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="text-xl font-black font-mono text-neutral-950">{products.length}</div>
                <p className="text-[9.5px] text-neutral-400 mt-0.5">Articles enregistrés</p>
              </div>

              <div 
                onClick={() => { setActiveTab("catalog"); setAdminStatusFilter("actif"); }}
                className="bg-white p-3.5 border border-emerald-200 rounded-sm hover:border-emerald-500 transition-all cursor-pointer shadow-2xs group bg-gradient-to-br from-white to-emerald-50/20"
              >
                <div className="flex items-center justify-between text-emerald-800 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Actifs (En Ligne)</span>
                  </span>
                  <Eye className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-black font-mono text-emerald-700">
                  {products.filter(p => (p.status || "actif") === "actif" && (p.stock || 0) > 0).length}
                </div>
                <p className="text-[9.5px] text-emerald-600 mt-0.5">Visibles et achetables</p>
              </div>

              <div 
                onClick={() => { setActiveTab("catalog"); setAdminStatusFilter("inactif"); }}
                className="bg-white p-3.5 border border-neutral-300 rounded-sm hover:border-neutral-500 transition-all cursor-pointer shadow-2xs group bg-gradient-to-br from-white to-neutral-100/30"
              >
                <div className="flex items-center justify-between text-neutral-600 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                    <span>Inactifs (Masqués)</span>
                  </span>
                  <Power className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="text-xl font-black font-mono text-neutral-800">
                  {products.filter(p => p.status === "inactif").length}
                </div>
                <p className="text-[9.5px] text-neutral-500 mt-0.5">Retirés du site (conservés)</p>
              </div>

              <div 
                onClick={() => { setActiveTab("catalog"); setAdminStatusFilter("en_rupture"); }}
                className="bg-white p-3.5 border border-rose-200 rounded-sm hover:border-rose-500 transition-all cursor-pointer shadow-2xs group bg-gradient-to-br from-white to-rose-50/20"
              >
                <div className="flex items-center justify-between text-rose-800 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>En Rupture</span>
                  </span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-xl font-black font-mono text-rose-700">
                  {products.filter(p => p.status === "en_rupture" || (p.stock || 0) <= 0).length}
                </div>
                <p className="text-[9.5px] text-rose-600 mt-0.5">Stock épuisé ou déclaré</p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-neutral-200 gap-1.5 overflow-x-auto pb-px scrollbar-none">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "catalog"
                    ? "border-[#d4af37] text-neutral-950 font-black bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Database className="w-4 h-4 text-[#d4af37]" />
                <span>Catalogue & Statuts</span>
                <span className="text-[9px] font-mono bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("analytics");
                  fetchProductAnalytics();
                }}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "analytics"
                    ? "border-[#d4af37] text-neutral-950 font-black bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Analytics par Produit</span>
              </button>

              <button
                onClick={() => setActiveTab("vendors")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "vendors"
                    ? "border-[#d4af37] text-neutral-950 font-black bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Vendeurs & Abonnements</span>
                {usersList.filter(u => u.role === "vendeur" || u.vendeurSubscription).length > 0 && (
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                    {usersList.filter(u => u.role === "vendeur" || u.vendeurSubscription).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("banners")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "banners"
                    ? "border-[#d4af37] text-neutral-950 font-black bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                <span>Bannières & Vitrines</span>
              </button>

              <button
                onClick={() => setActiveTab("requests")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "requests"
                    ? "border-[#d4af37] text-neutral-950 font-black bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Alertes & Demandes</span>
                {(orders.filter(o => o.paymentStatus !== "Payé" && o.paymentMethod !== "Espèces").length + 
                  withdrawals.filter(w => w.status === "En attente").length + 
                  usersList.filter(u => u.vendeurStatus === "En attente d'activation").length) > 0 && (
                  <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {orders.filter(o => o.paymentStatus !== "Payé" && o.paymentMethod !== "Espèces").length + 
                     withdrawals.filter(w => w.status === "En attente").length + 
                     usersList.filter(u => u.vendeurStatus === "En attente d'activation").length}
                  </span>
                )}
              </button>

              <button
                id="tab-btn-stats"
                onClick={() => setActiveTab("stats")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "stats"
                    ? "border-[#d4af37] text-neutral-950 font-black bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Finances & Statistiques</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "settings"
                    ? "border-[#d4af37] text-neutral-950 font-black bg-white shadow-xs"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Settings className="w-4 h-4 text-neutral-500" />
                <span>Paramètres & Logo</span>
              </button>
            </div>

            {activeTab === "catalog" ? (
              <>
                {/* Split view */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Product Form Grid */}
              <div className="lg:col-span-5 bg-white p-6 border border-neutral-200 rounded-sm shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-neutral-950 flex items-center gap-1.5">
                    <Edit className="w-4 h-4 text-[#d4af37]" />
                    <span>{editingProduct ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}</span>
                  </h3>
                  {editingProduct && (
                    <button 
                      onClick={resetForm} 
                      className="text-neutral-500 hover:text-neutral-955 text-xs font-semibold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Annuler</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">Nom du produit <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Miel de Kpalimé"
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-neutral-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea 
                      rows={3}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Caractéristiques, avantages..."
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-neutral-50 resize-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">Prix en FCFA <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        required
                        value={formPrix}
                        onChange={(e) => setFormPrix(e.target.value)}
                        placeholder="6500"
                        className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-neutral-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">Prix Barré (Optionnel / FCFA)</label>
                      <input 
                        type="number" 
                        value={formPrixBarre}
                        onChange={(e) => setFormPrixBarre(e.target.value)}
                        placeholder="8000"
                        className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-neutral-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">Catégorie</label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full border border-neutral-300 rounded-sm px-2 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-white font-medium"
                      >
                        <option value="Vêtements & Mode">Vêtements & Mode</option>
                        <option value="Chaussures Premium">Chaussures Premium</option>
                        <option value="Montres & Accessoires">Montres & Accessoires</option>
                        <option value="Plats & Gastronomie">Plats & Gastronomie</option>
                        <option value="Importations Trends">Importations Trends (Alibaba)</option>
                        <option value="Made in Togo Premium">Made in Togo Premium</option>
                        <option value="Paniers Frais & Épicerie">Paniers Frais & Épicerie</option>
                        <option value="Print-on-Demand Localisé">Print-on-Demand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">Stock Initial</label>
                      <input 
                        type="number" 
                        required
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        placeholder="10"
                        className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-neutral-50/50"
                      />
                    </div>
                  </div>

                  {/* Statut de Publication (Actif / Inactif / En Rupture) */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Statut de Publication sur le site <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormStatus("actif")}
                        className={`py-2 px-2 text-center rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          formStatus === "actif"
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600 font-black"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        🟢 Actif (En ligne)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStatus("inactif")}
                        className={`py-2 px-2 text-center rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          formStatus === "inactif"
                            ? "border-neutral-800 bg-neutral-800 text-white ring-1 ring-neutral-800 font-black"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        ⚪ Inactif (Masqué)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStatus("en_rupture")}
                        className={`py-2 px-2 text-center rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          formStatus === "en_rupture"
                            ? "border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-600 font-black"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        🔴 En Rupture
                      </button>
                    </div>
                    <p className="text-[9px] text-neutral-500 mt-1">
                      • Inactif : retire le produit du site client sans le supprimer de la base.<br/>
                      • En Rupture : indique que le stock est épuisé tout en conservant la fiche visible.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Boutique / Vendeur Propriétaire <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formPartenaire}
                      onChange={(e) => setFormPartenaire(e.target.value)}
                      className="w-full border border-neutral-300 rounded-sm px-2 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-white font-medium"
                    >
                      <option value="Boutique en Direct">Boutique en Direct (Administration)</option>
                      {usersList.filter(u => u.role === "vendeur").map(u => {
                        const name = u.businessName || u.name || u.email;
                        return (
                          <option key={u.id} value={name}>
                            {name} (Vendeur Inscrit)
                          </option>
                        );
                      })}
                      {formPartenaire && formPartenaire !== "Boutique en Direct" && !usersList.some(u => (u.businessName || u.name || u.email) === formPartenaire) && (
                        <option value={formPartenaire}>{formPartenaire}</option>
                      )}
                    </select>
                    <p className="text-[9px] text-neutral-400 mt-1 uppercase">
                      Associez ce produit à la Boutique Directe d'administration ou à l'un des vendeurs inscrits sur votre plateforme.
                    </p>
                  </div>

                  {formPartenaire !== "Boutique en Direct" && (
                    <div className="bg-red-50/40 border border-red-100 p-3 rounded-sm space-y-1">
                      <label className="block text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                        <span>Lien d'Affiliation (Optionnel pour vos clients locaux)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formLienAffilie}
                        onChange={(e) => setFormLienAffilie(e.target.value)}
                        placeholder="https://..."
                        className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-white"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 py-1">
                    <input 
                      type="checkbox" 
                      id="phare_chk" 
                      checked={formPhare}
                      onChange={(e) => setFormPhare(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded-sm"
                    />
                    <label htmlFor="phare_chk" className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider cursor-pointer">Mettre en avant de la page d'accueil</label>
                  </div>

                  {/* Image picker */}
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Galerie images du produit (Max 4)</span>
                    <div 
                      onClick={handleTriggerFileInput}
                      className="border-2 border-dashed border-neutral-300 hover:border-amber-500 bg-neutral-50 hover:bg-amber-50/10 py-4 px-4 text-center rounded-sm cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 text-neutral-450 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-wide">Ajouter une image</p>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    {formImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {formImages.map((src, idx) => (
                          <div key={idx} className="relative aspect-square border border-neutral-200">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeUploadImage(idx)}
                              className="absolute -top-1 -right-1 bg-red-650 hover:bg-neutral-900 bg-red-600 text-white p-0.5 rounded-full shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {formError && <div className="text-xs text-red-650 bg-red-50 p-2.5 rounded-sm">{formError}</div>}
                  {formSuccess && <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-sm">{formSuccess}</div>}

                  <button 
                    type="submit"
                    className="w-full bg-[#d4af37] text-neutral-950 hover:bg-neutral-950 hover:text-white py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow cursor-pointer"
                  >
                    {editingProduct ? "Modifier le produit" : "Ajouter le produit"}
                  </button>
                </form>
              </div>

              {/* Database list of items */}
              <div className="lg:col-span-7 bg-white p-6 border border-neutral-200 rounded-sm shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-neutral-100 mb-3 gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#d4af37]" />
                      <span>Catalogue & Gestion des Statuts ({products.length})</span>
                    </h3>
                    <p className="text-[9.5px] text-neutral-400 uppercase tracking-wider font-semibold">Activez, masquez ou déclarez la rupture de vos produits en direct</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Partner Selector Filter */}
                    <select
                      value={adminPartnerFilter}
                      onChange={(e) => setAdminPartnerFilter(e.target.value)}
                      className="border border-neutral-300 rounded-sm px-2.5 py-1.5 text-xs outline-none bg-white font-sans text-neutral-800 font-semibold tracking-wide uppercase cursor-pointer"
                    >
                      <option value="Tous">Tous les vendeurs</option>
                      {Array.from(new Set(products.map(p => p.partenaire || "Boutique en Direct"))).filter(Boolean).map(partName => (
                        <option key={partName} value={partName}>{partName}</option>
                      ))}
                    </select>

                    {/* Search query input */}
                    <div className="relative w-full sm:w-44">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                      <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="border border-neutral-300 rounded-sm pl-8 pr-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 w-full bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Segmented Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 bg-neutral-100/70 p-1 rounded-sm border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setAdminStatusFilter("all")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      adminStatusFilter === "all" ? "bg-neutral-900 text-white shadow-xs font-black" : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Tous ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminStatusFilter("actif")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                      adminStatusFilter === "actif" ? "bg-emerald-700 text-white shadow-xs font-black" : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Actifs en ligne ({products.filter(p => (p.status || "actif") === "actif" && (p.stock || 0) > 0).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminStatusFilter("inactif")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                      adminStatusFilter === "inactif" ? "bg-neutral-800 text-white shadow-xs font-black" : "text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                    <span>Inactifs masqués ({products.filter(p => p.status === "inactif").length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminStatusFilter("en_rupture")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                      adminStatusFilter === "en_rupture" ? "bg-rose-700 text-white shadow-xs font-black" : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>En rupture ({products.filter(p => p.status === "en_rupture" || (p.stock || 0) <= 0).length})</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-600 text-[10px]">
                        <th className="py-2.5 px-3">Produit</th>
                        <th className="py-2.5 px-2">Catégorie</th>
                        <th className="py-2.5 px-2 text-right">Prix</th>
                        <th className="py-2.5 px-2 text-center">Stock</th>
                        <th className="py-2.5 px-2 text-center">Statut Site</th>
                        <th className="py-2.5 px-3 text-right">Actions Rapides</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => {
                          const matchesSearch = p.nom.toLowerCase().includes(adminSearchQuery.toLowerCase());
                          const matchesPartner = adminPartnerFilter === "Tous" || (p.partenaire || "Boutique en Direct") === adminPartnerFilter;
                          const isActif = (p.status || "actif") === "actif" && (p.stock || 0) > 0;
                          const isInactif = p.status === "inactif";
                          const isRupture = p.status === "en_rupture" || (p.stock || 0) <= 0;
                          const matchesStatus = 
                            adminStatusFilter === "all" ||
                            (adminStatusFilter === "actif" && isActif) ||
                            (adminStatusFilter === "inactif" && isInactif) ||
                            (adminStatusFilter === "en_rupture" && isRupture);
                          return matchesSearch && matchesPartner && matchesStatus;
                        })
                        .map(prod => {
                          const isActif = (prod.status || "actif") === "actif" && (prod.stock || 0) > 0;
                          const isInactif = prod.status === "inactif";
                          const isRupture = prod.status === "en_rupture" || (prod.stock || 0) <= 0;

                          return (
                          <tr key={prod.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-sm overflow-hidden bg-neutral-100 shrink-0">
                                  <img src={prod.images[0]} alt={prod.nom} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-bold text-neutral-900 line-clamp-1">{prod.nom}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[8px] bg-amber-50 text-amber-700 border border-[#d4af37]/25 font-black px-1 py-0.1 select-none rounded-[1px] uppercase tracking-wider">
                                      {prod.partenaire || "Boutique en Direct"}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-mono tracking-wider">{prod.id}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-[#b8901c] font-medium uppercase tracking-wider text-[10.5px] font-sans">
                              {prod.categorie.split(" ")[0]}
                            </td>
                            <td className="py-3 px-2 text-right font-bold text-neutral-900 font-mono">
                              {formatFCFA(prod.prix)}
                              {prod.prixBarre && (
                                <div className="line-through text-neutral-400 text-[10px] font-normal">{formatFCFA(prod.prixBarre)}</div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="inline-flex items-center gap-1 bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded-md">
                                <button
                                  type="button"
                                  title="Diminuer stock"
                                  onClick={() => handleQuickAdjustStock(prod, -1)}
                                  className="w-4 h-4 rounded text-[10px] font-bold bg-white text-stone-600 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className={`font-mono font-bold text-[10.5px] px-1 ${
                                  prod.stock > 10 ? "text-emerald-700" : prod.stock > 0 ? "text-amber-700" : "text-rose-700"
                                }`}>
                                  {prod.stock}
                                </span>
                                <button
                                  type="button"
                                  title="Augmenter stock"
                                  onClick={() => handleQuickAdjustStock(prod, 1)}
                                  className="w-4 h-4 rounded text-[10px] font-bold bg-white text-stone-600 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Statut Site Column */}
                            <td className="py-3 px-2 text-center">
                              {isInactif ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                                  <span>Inactif (Masqué)</span>
                                </span>
                              ) : isRupture ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  <span>En Rupture</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>Actif (En ligne)</span>
                                </span>
                              )}
                            </td>

                            {/* Actions Column */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isInactif ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "actif")}
                                    title="Remettre en ligne sur le site"
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Activer</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "inactif")}
                                    title="Retirer du site sans supprimer"
                                    className="px-2 py-1 bg-neutral-200 hover:bg-neutral-800 hover:text-white text-neutral-800 rounded text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Power className="w-3 h-3" />
                                    <span>Masquer</span>
                                  </button>
                                )}

                                {!isRupture ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "en_rupture", 0)}
                                    title="Déclarer le stock épuisé"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Rupture</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "actif", 10)}
                                    title="Réapprovisionner avec 10 unités"
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Package className="w-3 h-3" />
                                    <span>+10 Stock</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => startEditProduct(prod)}
                                  title="Modifier"
                                  className="p-1 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 cursor-pointer border border-neutral-200 rounded transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id, prod.nom)}
                                  title="Supprimer"
                                  className="p-1 text-red-600 hover:text-white hover:bg-red-600 cursor-pointer border border-neutral-200 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "analytics" ? (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* Header & Export Bar */}
            <div className="bg-white p-5 border border-neutral-200 rounded-sm shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Analytics & Performances par Produit</span>
                </h3>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">
                  Suivez en direct les consultations (vues), les ventes réelles, le chiffre d'affaires et le taux de conversion de chaque produit.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={fetchProductAnalytics}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-sm font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
                  <span>Actualiser</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prodsToExport = productAnalytics?.products || products;
                    const headers = ["ID", "Nom", "Categorie", "Partenaire", "Statut", "Prix_FCFA", "Stock", "Vues", "Ventes", "Chiffre_Affaires_FCFA", "Taux_Conversion_Pct"];
                    const rows = prodsToExport.map((p: any) => [
                      `"${p.id}"`,
                      `"${(p.nom || "").replace(/"/g, '""')}"`,
                      `"${p.categorie || ""}"`,
                      `"${p.partenaire || "Boutique en Direct"}"`,
                      `"${p.status || "actif"}"`,
                      p.prix || 0,
                      p.stock || 0,
                      p.views || 0,
                      p.salesCount || 0,
                      p.revenueGenerated || ((p.salesCount || 0) * (p.prix || 0)),
                      p.conversionRate || 0
                    ]);
                    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `analytics-produits-miabe-asi-${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-[#d4af37] text-white hover:text-neutral-950 rounded-sm font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-blue-500">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Vues Cumulées</span>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black font-mono text-neutral-950">
                  {productAnalytics?.summary?.totalViews ?? products.reduce((acc, p) => acc + (p.views || 0), 0)}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Consultations de fiches</p>
              </div>

              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-emerald-500">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Ventes Confirmées</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-700">
                  {productAnalytics?.summary?.totalSales ?? products.reduce((acc, p) => acc + (p.salesCount || 0), 0)}
                </div>
                <p className="text-[10px] text-emerald-600 mt-1">Articles commandés</p>
              </div>

              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-[#d4af37]">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Chiffre d'Affaires</span>
                  <CreditCard className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="text-2xl font-black font-mono text-neutral-950">
                  {formatFCFA(productAnalytics?.summary?.totalRevenue ?? products.reduce((acc, p) => acc + ((p.salesCount || 0) * (p.prix || 0)), 0))}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Généré par les produits</p>
              </div>

              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-purple-500">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Taux de Conversion</span>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black font-mono text-purple-700">
                  {productAnalytics?.summary?.overallConversionRate ?? "0"}%
                </div>
                <p className="text-[10px] text-purple-600 mt-1">Moyenne globale commandes/vues</p>
              </div>
            </div>

            {/* Analytics Table with Filters and Sorting */}
            <div className="bg-white p-5 border border-neutral-200 rounded-sm shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Search input */}
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom..."
                      value={analyticsSearchQuery}
                      onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                      className="border border-neutral-300 rounded-sm pl-8 pr-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 w-full bg-white"
                    />
                  </div>

                  {/* Vendor / Partner filter */}
                  <select
                    value={analyticsPartnerFilter}
                    onChange={(e) => setAnalyticsPartnerFilter(e.target.value)}
                    className="border border-neutral-300 rounded-sm px-2.5 py-1.5 text-xs outline-none bg-white font-sans text-neutral-800 uppercase tracking-wide cursor-pointer"
                  >
                    <option value="Tous">Tous les vendeurs</option>
                    {Array.from(new Set(products.map(p => p.partenaire || "Boutique en Direct"))).filter(Boolean).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  {/* Sort selector */}
                  <select
                    value={analyticsSortBy}
                    onChange={(e) => setAnalyticsSortBy(e.target.value as any)}
                    className="border border-neutral-300 rounded-sm px-2.5 py-1.5 text-xs outline-none bg-white font-sans text-neutral-800 uppercase tracking-wide cursor-pointer"
                  >
                    <option value="views">Trier par Vues (Décroissant)</option>
                    <option value="sales">Trier par Ventes (Décroissant)</option>
                    <option value="revenue">Trier par Revenus (Décroissant)</option>
                    <option value="conversion">Trier par Conversion (Décroissant)</option>
                  </select>
                </div>

                <div className="text-[11px] text-neutral-500 font-mono">
                  {products.length} produit(s) analysé(s)
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-600 text-[10px]">
                      <th className="py-2.5 px-3">Produit</th>
                      <th className="py-2.5 px-2">Boutique</th>
                      <th className="py-2.5 px-2 text-center">Statut</th>
                      <th className="py-2.5 px-2 text-center">Vues</th>
                      <th className="py-2.5 px-2 text-center">Ventes</th>
                      <th className="py-2.5 px-2 text-right">CA Généré</th>
                      <th className="py-2.5 px-3 text-center">Taux Conv.</th>
                      <th className="py-2.5 px-2 text-center">Stock</th>
                      <th className="py-2.5 px-3 text-right">Action Rapide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(productAnalytics?.products || products)
                      .filter((p: any) => {
                        const matchesSearch = (p.nom || "").toLowerCase().includes(analyticsSearchQuery.toLowerCase());
                        const matchesPartner = analyticsPartnerFilter === "Tous" || (p.partenaire || "Boutique en Direct") === analyticsPartnerFilter;
                        return matchesSearch && matchesPartner;
                      })
                      .sort((a: any, b: any) => {
                        if (analyticsSortBy === "sales") return (b.salesCount || 0) - (a.salesCount || 0);
                        if (analyticsSortBy === "revenue") return (b.revenueGenerated || 0) - (a.revenueGenerated || 0);
                        if (analyticsSortBy === "conversion") return (b.conversionRate || 0) - (a.conversionRate || 0);
                        return (b.views || 0) - (a.views || 0);
                      })
                      .map((prod: any) => {
                        const views = Number(prod.views) || 0;
                        const sales = Number(prod.salesCount) || 0;
                        const revenue = Number(prod.revenueGenerated) || (sales * Number(prod.prix || 0));
                        const conv = views > 0 ? Number(((sales / views) * 100).toFixed(1)) : 0;
                        const isActif = (prod.status || "actif") === "actif" && (prod.stock || 0) > 0;
                        const isInactif = prod.status === "inactif";
                        const isRupture = prod.status === "en_rupture" || (prod.stock || 0) <= 0;

                        return (
                          <tr key={prod.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-sm overflow-hidden bg-neutral-100 shrink-0">
                                  <img src={prod.images?.[0]} alt={prod.nom} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-bold text-neutral-900 line-clamp-1">{prod.nom}</div>
                                  <div className="text-[9.5px] text-neutral-400 font-mono">{prod.id} • {formatFCFA(prod.prix)}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-2">
                              <span className="text-[9px] font-bold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded uppercase">
                                {prod.partenaire || "Boutique en Direct"}
                              </span>
                            </td>

                            <td className="py-3 px-2 text-center">
                              {isInactif ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                                  <span>Inactif</span>
                                </span>
                              ) : isRupture ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  <span>Rupture</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>Actif</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-2 text-center font-mono font-bold text-neutral-900">
                              <div className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                <Eye className="w-3 h-3 text-blue-500" />
                                <span>{views}</span>
                              </div>
                            </td>

                            <td className="py-3 px-2 text-center font-mono font-bold text-neutral-900">
                              <div className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <ShoppingBag className="w-3 h-3 text-emerald-600" />
                                <span>{sales}</span>
                              </div>
                            </td>

                            <td className="py-3 px-2 text-right font-mono font-bold text-neutral-950">
                              {formatFCFA(revenue)}
                            </td>

                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className={`text-[10px] font-mono font-black ${
                                  conv >= 10 ? "text-emerald-700" : conv >= 3 ? "text-blue-700" : "text-stone-500"
                                }`}>
                                  {conv}%
                                </span>
                                <div className="w-12 h-1.5 bg-neutral-200 rounded-full overflow-hidden mt-0.5">
                                  <div 
                                    className={`h-full rounded-full ${conv >= 10 ? "bg-emerald-500" : conv >= 3 ? "bg-blue-500" : "bg-neutral-400"}`}
                                    style={{ width: `${Math.min(100, conv * 5)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-2 text-center font-mono">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                (prod.stock || 0) > 10 ? "bg-green-100 text-green-700" : (prod.stock || 0) > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                              }`}>
                                {prod.stock || 0}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isInactif ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "actif")}
                                    className="px-2 py-1 bg-emerald-600 text-white rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:bg-emerald-700"
                                  >
                                    Activer
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "inactif")}
                                    className="px-2 py-1 bg-neutral-200 text-neutral-800 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:bg-neutral-800 hover:text-white"
                                  >
                                    Masquer
                                  </button>
                                )}

                                {!isRupture ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "en_rupture", 0)}
                                    className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:bg-rose-100"
                                  >
                                    Rupture
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(prod, "actif", 10)}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                                  >
                                    +10 Stock
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "vendors" ? (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* Header */}
            <div className="bg-white p-5 border border-neutral-200 rounded-sm shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Gestion des Espaces Vendeurs & Répartition par Offres</span>
                </h3>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">
                  Supervisez les boutiques vérifiées, les formules d'abonnement (Offre 1, 2 ou 3) et les droits d'accès associés.
                </p>
              </div>
            </div>

            {/* 3 Offer Breakdown Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setVendorOfferFilter(vendorOfferFilter === "Offre 1" ? "all" : "Offre 1")}
                className={`bg-white p-5 rounded-sm border transition-all cursor-pointer shadow-xs ${
                  vendorOfferFilter === "Offre 1" ? "border-stone-800 ring-2 ring-stone-800" : "border-neutral-200 hover:border-stone-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                    Offre 1 • Formule Gratuite
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-600">0 FCFA/mois</span>
                </div>
                <div className="text-2xl font-black font-mono text-stone-900 mt-2">
                  {usersList.filter(u => (u.vendeurSubscription || "Offre 1") === "Offre 1" && u.role === "vendeur").length} Vendeurs
                </div>
                <ul className="text-[11px] text-stone-600 space-y-1 mt-3 border-t border-stone-100 pt-2 font-sans">
                  <li>• Produits illimités au catalogue</li>
                  <li>• Commission standard 10% sur les ventes</li>
                  <li>• Analytics essentiels (vues, ventes réelles)</li>
                  <li>• Encaissement Mobile Money direct</li>
                </ul>
              </div>

              <div 
                onClick={() => setVendorOfferFilter(vendorOfferFilter === "Offre 2" ? "all" : "Offre 2")}
                className={`bg-white p-5 rounded-sm border transition-all cursor-pointer shadow-xs ${
                  vendorOfferFilter === "Offre 2" ? "border-blue-600 ring-2 ring-blue-600" : "border-blue-200 hover:border-blue-400 bg-gradient-to-br from-white to-blue-50/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    Offre 2 • Formule PRO
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700">1 600 FCFA/mois</span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-900 mt-2">
                  {usersList.filter(u => u.vendeurSubscription === "Offre 2" && u.role === "vendeur").length} Vendeurs
                </div>
                <ul className="text-[11px] text-blue-950 space-y-1 mt-3 border-t border-blue-100 pt-2 font-sans">
                  <li>• Tous les avantages Offre 1</li>
                  <li>• <strong>Badge Vendeur Vérifié</strong> officiel</li>
                  <li>• <strong>Taux de conversion & statistiques détaillées</strong></li>
                  <li>• Alertes de stock faible automatiques</li>
                </ul>
              </div>

              <div 
                onClick={() => setVendorOfferFilter(vendorOfferFilter === "Offre 3" ? "all" : "Offre 3")}
                className={`bg-white p-5 rounded-sm border transition-all cursor-pointer shadow-xs ${
                  vendorOfferFilter === "Offre 3" ? "border-[#d4af37] ring-2 ring-[#d4af37]" : "border-[#d4af37]/40 hover:border-[#d4af37] bg-gradient-to-br from-white to-amber-50/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Offre 3 • Formule BUSINESS (VIP)
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800">3 200 FCFA/mois</span>
                </div>
                <div className="text-2xl font-black font-mono text-amber-900 mt-2">
                  {usersList.filter(u => u.vendeurSubscription === "Offre 3" && u.role === "vendeur").length} Vendeurs
                </div>
                <ul className="text-[11px] text-amber-950 space-y-1 mt-3 border-t border-amber-200 pt-2 font-sans">
                  <li>• Tous les avantages Offre 1 & PRO</li>
                  <li>• <strong>Bannières publicitaires d'accueil dédiées</strong></li>
                  <li>• Vitrine personnalisée & URL VIP</li>
                  <li>• Export comptable CSV & Support prioritaire 24/7</li>
                </ul>
              </div>
            </div>

            {/* Vendors Filter Pills & List */}
            <div className="bg-white p-5 border border-neutral-200 rounded-sm shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVendorOfferFilter("all")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      vendorOfferFilter === "all" ? "bg-neutral-900 text-white font-black shadow-xs" : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Tous les Vendeurs ({usersList.filter(u => u.role === "vendeur").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorOfferFilter("Offre 1")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      vendorOfferFilter === "Offre 1" ? "bg-stone-800 text-white font-black shadow-xs" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Offre 1 - Gratuit ({usersList.filter(u => (u.vendeurSubscription || "Offre 1") === "Offre 1" && u.role === "vendeur").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorOfferFilter("Offre 2")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      vendorOfferFilter === "Offre 2" ? "bg-blue-700 text-white font-black shadow-xs" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                  >
                    Offre 2 - PRO ({usersList.filter(u => u.vendeurSubscription === "Offre 2" && u.role === "vendeur").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorOfferFilter("Offre 3")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      vendorOfferFilter === "Offre 3" ? "bg-amber-700 text-white font-black shadow-xs" : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    Offre 3 - BUSINESS ({usersList.filter(u => u.vendeurSubscription === "Offre 3" && u.role === "vendeur").length})
                  </button>
                </div>
              </div>

              {/* Vendors Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-600 text-[10px]">
                      <th className="py-2.5 px-3">Vendeur & Boutique</th>
                      <th className="py-2.5 px-2">Contact</th>
                      <th className="py-2.5 px-2 text-center">Offre / Plan</th>
                      <th className="py-2.5 px-2 text-center">Articles</th>
                      <th className="py-2.5 px-2 text-center">Statut Espace</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => u.role === "vendeur")
                      .filter(u => vendorOfferFilter === "all" || (u.vendeurSubscription || "Offre 1") === vendorOfferFilter)
                      .map((vendor) => {
                        const vendorProducts = products.filter(p => p.vendeurId === vendor.id || (vendor.businessName && p.partenaire === vendor.businessName));
                        const activeProds = vendorProducts.filter(p => (p.status || "actif") === "actif" && (p.stock || 0) > 0).length;
                        const inactiveProds = vendorProducts.filter(p => p.status === "inactif").length;
                        const ruptureProds = vendorProducts.filter(p => p.status === "en_rupture" || (p.stock || 0) <= 0).length;

                        return (
                          <tr key={vendor.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 uppercase">
                                  {vendor.name?.charAt(0) || "V"}
                                </div>
                                <div>
                                  <div className="font-bold text-neutral-900">{vendor.businessName || vendor.name}</div>
                                  <div className="text-[10px] text-neutral-400 font-sans">{vendor.name} • {vendor.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-2 font-mono text-neutral-700">
                              <div>{vendor.contactPhone || vendor.phone || "Non renseigné"}</div>
                              <div className="text-[9.5px] text-neutral-400">{vendor.city || vendor.quartier || "Togo"}</div>
                            </td>

                            <td className="py-3 px-2 text-center">
                              <select
                                value={vendor.vendeurSubscription || "Offre 1"}
                                onChange={async (e) => {
                                  const newOffer = e.target.value;
                                  try {
                                    await fetch("/api/admin/users/update-offer", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json", "Authorization": "asime2026-auth-session" },
                                      body: JSON.stringify({ userId: vendor.id, vendeurSubscription: newOffer })
                                    });
                                    showToast(`✓ Formule mise à jour en ${newOffer} pour ${vendor.businessName || vendor.name}.`);
                                    fetchAdminData();
                                  } catch {
                                    showToast("Erreur de mise à jour.");
                                  }
                                }}
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border cursor-pointer ${
                                  vendor.vendeurSubscription === "Offre 3"
                                    ? "bg-amber-50 text-amber-900 border-amber-300 font-black"
                                    : vendor.vendeurSubscription === "Offre 2"
                                    ? "bg-blue-50 text-blue-900 border-blue-300 font-black"
                                    : "bg-stone-50 text-stone-800 border-stone-300"
                                }`}
                              >
                                <option value="Offre 1">Offre 1 (Gratuit)</option>
                                <option value="Offre 2">Offre 2 (PRO)</option>
                                <option value="Offre 3">Offre 3 (BUSINESS)</option>
                              </select>
                            </td>

                            <td className="py-3 px-2 text-center font-mono">
                              <div className="font-bold text-neutral-900">{vendorProducts.length} articles</div>
                              <div className="text-[9px] text-neutral-500 mt-0.5">
                                <span className="text-emerald-600 font-bold">{activeProds} actifs</span>
                                {inactiveProds > 0 && <span className="text-neutral-500 ml-1">• {inactiveProds} inactifs</span>}
                                {ruptureProds > 0 && <span className="text-rose-600 ml-1">• {ruptureProds} rupture</span>}
                              </div>
                            </td>

                            <td className="py-3 px-2 text-center">
                              {vendor.vendeurStatus === "Actif" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Actif</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>En attente</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {vendor.vendeurStatus !== "Actif" && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await handleApproveSeller(vendor.id);
                                      fetchAdminData();
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer"
                                  >
                                    Activer
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminPartnerFilter(vendor.businessName || vendor.name);
                                    setActiveTab("catalog");
                                  }}
                                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                                >
                                  <Package className="w-3 h-3 text-[#d4af37]" />
                                  <span>Voir Produits</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "requests" ? (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* Quick stats panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-blue-500">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Commandes Totales</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-neutral-955">{orders.length}</span>
                  <span className="text-[10px] text-neutral-500 uppercase font-sans">enregistrées</span>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-amber-500">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Paiements en Attente</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-amber-700">
                    {orders.filter(o => o.paymentStatus !== "Payé" && o.paymentMethod !== "Espèces").length}
                  </span>
                  <span className="text-[10px] text-amber-600 font-semibold uppercase font-sans">À valider</span>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-red-500">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans">Retraits en Attente</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-red-700">
                    {withdrawals.filter(w => w.status === "En attente").length}
                  </span>
                  <span className="text-[10px] text-red-500 font-semibold uppercase font-sans">demandes</span>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-emerald-500">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans font-sans">Membres Actifs</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-neutral-955">{usersList.length}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase font-sans font-sans">Utilisateurs</span>
                </div>
              </div>
            </div>

            {/* Notifications and withdrawals block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Withdrawals & Users */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Withdrawal requests card */}
                <div className="bg-white p-5 border border-neutral-200 rounded-sm shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-red-500" />
                      <span>Demandes de Retraits Portefeuille</span>
                    </h3>
                    <span className="bg-red-100 text-red-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">
                      {withdrawals.filter(w => w.status === "En attente").length} en attente
                    </span>
                  </div>

                  {withdrawals.filter(w => w.status === "En attente").length === 0 ? (
                    <div className="py-8 text-center text-neutral-400">
                      <p>Aucune demande de retrait en attente actuellement.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {withdrawals.filter(w => w.status === "En attente").map((w) => {
                        const userObj = usersList.find(u => u.id === w.userId);
                        const displayName = userObj?.businessName || userObj?.name || w.userId;
                        return (
                          <div key={w.id} className="p-3 border border-neutral-200 rounded-sm bg-neutral-50 flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-neutral-900 uppercase text-[10.5px] tracking-wide">{displayName}</span>
                                <strong className="text-red-700 font-mono text-xs">{formatFCFA(w.amount)}</strong>
                              </div>
                              <p className="text-[10px] text-neutral-500 uppercase tracking-wide">
                                ID Retrait: <code className="bg-white px-1 border border-neutral-200 font-mono text-[9px]">{w.id}</code>
                              </p>
                              <div className="mt-2 text-[10px] text-neutral-700 space-y-0.5">
                                <p><strong>Mode :</strong> Mobile Money ({w.method})</p>
                                <p><strong>Téléphone :</strong> <span className="font-mono font-bold text-neutral-900">+{w.phone}</span></p>
                                <p><strong>Date :</strong> {new Date(w.createdAt).toLocaleString("fr-FR")}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60">
                              <button
                                onClick={() => handleApproveWithdrawal(w.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                              >
                                Approuver & Payer
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(w.id)}
                                className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                              >
                                Rejeter
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Historic withdrawals sub-list */}
                  {withdrawals.filter(w => w.status !== "En attente").length > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Historique récent des retraits</p>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[9px]">
                        {withdrawals.filter(w => w.status !== "En attente").slice(0, 5).map(w => {
                          const userObj = usersList.find(u => u.id === w.userId);
                          const name = userObj?.businessName || userObj?.name || w.userId;
                          return (
                            <div key={w.id} className="flex justify-between items-center bg-white p-1.5 border border-neutral-150 rounded-xs">
                              <span className="truncate max-w-[120px] font-bold text-neutral-700 uppercase">{name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-900">{formatFCFA(w.amount)}</span>
                                <span className={`px-1 rounded-sm text-[8px] font-black uppercase tracking-wider ${
                                  w.status === "Payé" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"
                                }`}>
                                  {w.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pending Sellers Activation Requests Card */}
                {usersList.filter(u => u.vendeurStatus === "En attente d'activation").length > 0 && (
                  <div className="bg-white p-5 border-2 border-amber-400 rounded-sm shadow-xs mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Demandes d'activation de Boutique</span>
                      </h3>
                      <span className="bg-amber-100 text-amber-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">
                        {usersList.filter(u => u.vendeurStatus === "En attente d'activation").length} En attente
                      </span>
                    </div>

                    <div className="space-y-3">
                      {usersList.filter(u => u.vendeurStatus === "En attente d'activation").map((u) => (
                        <div key={u.id} className="p-3 border border-amber-200 bg-amber-50/20 rounded-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-neutral-900 text-[11px] uppercase">{u.businessName || u.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">{u.email}</p>
                              {u.phone && <p className="text-[10px] text-neutral-700 font-bold">📞 +{u.phone}</p>}
                            </div>
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-xs text-[8px] font-black uppercase tracking-widest">
                              {u.vendeurSubscription || "Offre 1"}
                            </span>
                          </div>

                          <div className="bg-white border border-neutral-150 p-2 rounded-xs font-mono text-[10px] text-neutral-700 space-y-0.5">
                            <p><strong>Mode :</strong> {u.vendeurMode === "autonome" ? "Autonome (Boutique gérée en propre)" : "Assisté (Produits publiés via administrateurs)"}</p>
                            <p><strong>Paiement :</strong> {u.vendeurPaymentMethod} ({u.vendeurPaymentMethod === "TMoney" ? "T-Money" : u.vendeurPaymentMethod === "Flooz" ? "Flooz" : "Autre"})</p>
                            <p><strong>ID Transaction :</strong> <code className="bg-amber-50 px-1 border border-amber-100 font-bold text-amber-800">{u.vendeurPaymentTxId || "Non fourni"}</code></p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleApproveSeller(u.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Activer la boutique
                            </button>
                            <button
                              onClick={() => handleRejectSeller(u.id)}
                              className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Rejeter
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Banner Requests from BUSINESS Sellers */}
                {bannerRequests.filter(b => b.status === "pending").length > 0 && (
                  <div className="bg-white p-5 border-2 border-[#d4af37] rounded-sm shadow-xs mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                        <span>Bannières Accueil Soumises (Vendeurs BUSINESS)</span>
                      </h3>
                      <span className="bg-[#d4af37]/20 text-[#b8901c] font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">
                        {bannerRequests.filter(b => b.status === "pending").length} en attente
                      </span>
                    </div>

                    <div className="space-y-3">
                      {bannerRequests.filter(b => b.status === "pending").map((b) => (
                        <div key={b.id} className="p-3 border border-neutral-200 bg-[#FAF8F5] rounded-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-neutral-900 text-[11px] uppercase">{b.boutiqueName || b.vendeurName}</p>
                              <p className="text-[10px] text-neutral-600 font-medium">{b.title}</p>
                              {b.subtitle && <p className="text-[9px] text-neutral-400 italic">{b.subtitle}</p>}
                            </div>
                            <span className="bg-neutral-950 text-[#d4af37] px-1.5 py-0.5 rounded-xs text-[8px] font-black uppercase tracking-widest">
                              BUSINESS
                            </span>
                          </div>

                          {b.imageUrl && (
                            <div className="h-24 w-full rounded-xs overflow-hidden border border-neutral-200">
                              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleApproveBanner(b.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Approuver &amp; Publier
                            </button>
                            <button
                              onClick={() => handleRejectBanner(b.id)}
                              className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Refuser le visuel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Products Requests from PRO/BUSINESS Sellers */}
                {featuredRequests.filter(p => p.phareStatus === "pending").length > 0 && (
                  <div className="bg-white p-5 border-2 border-emerald-500 rounded-sm shadow-xs mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Demandes de Produits Phares (PRO &amp; BUSINESS)</span>
                      </h3>
                      <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">
                        {featuredRequests.filter(p => p.phareStatus === "pending").length} en attente
                      </span>
                    </div>

                    <div className="space-y-3">
                      {featuredRequests.filter(p => p.phareStatus === "pending").map((p) => (
                        <div key={p.id} className="p-3 border border-neutral-200 bg-[#FAF8F5] rounded-sm flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={p.images?.[0] || "/images/placeholder.jpg"}
                              alt={p.nom}
                              className="w-12 h-12 rounded-xs object-cover border border-neutral-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-900 text-[11px] truncate uppercase">{p.nom}</p>
                              <p className="text-[9px] text-neutral-500">Par {p.partenaire || "Vendeur"} &bull; <strong className="font-mono text-neutral-800">{formatFCFA(p.prix)}</strong></p>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1 rounded-xs mt-0.5 inline-block ${
                                p.pharePriority === "high" ? "bg-amber-100 text-amber-800" : "bg-neutral-200 text-neutral-700"
                              }`}>
                                {p.pharePriority === "high" ? "Priorité Business" : "Standard Pro"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleApproveFeatured(p.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2.5 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                              title="Valider en Produit Phare"
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => handleRejectFeatured(p.id)}
                              className="bg-red-600 hover:bg-red-700 text-white py-1 px-2.5 rounded-xs font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                              title="Refuser"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users Directory Card */}
                <div className="bg-white p-5 border border-neutral-200 rounded-sm shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#d4af37]" />
                      <span>Répertoire des Utilisateurs Actifs</span>
                    </h3>
                    <span className="bg-neutral-100 text-neutral-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm">
                      {usersList.length} membres
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2.5">
                    {usersList.map((u) => (
                      <div key={u.id} className="p-2.5 border border-neutral-200 rounded-sm hover:border-neutral-300 bg-neutral-50/50 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-[11px] uppercase">{u.businessName || u.name || "Inconnu"}</span>
                            <span className={`px-1.5 py-0.5 rounded-xs text-[7.5px] font-black uppercase tracking-widest ${
                              u.role === "vendeur" 
                                ? "bg-amber-100 text-amber-800 border border-amber-200" 
                                : u.role === "affilie" 
                                ? "bg-blue-100 text-blue-800 border border-blue-200" 
                                : "bg-neutral-200 text-neutral-700"
                            }`}>
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{u.email || "Pas d'email"}</p>
                          {u.phone && <p className="text-[10px] text-neutral-600 font-bold mt-0.5">📞 +{u.phone}</p>}
                        </div>
                        {u.role === "vendeur" && u.vendeurStats && (
                          <div className="text-right font-mono text-[9px]">
                            <p className="text-neutral-400 uppercase">Revenus</p>
                            <p className="font-extrabold text-amber-700">{formatFCFA(u.vendeurStats.revenusGeneres || 0)}</p>
                          </div>
                        )}
                        {u.role === "affilie" && u.affiliateStats && (
                          <div className="text-right font-mono text-[9px]">
                            <p className="text-neutral-400 uppercase font-sans">Comms</p>
                            <p className="font-extrabold text-blue-700">{formatFCFA(u.affiliateStats.commissionDisponible || 0)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Interactive Orders Management */}
              <div className="lg:col-span-7 bg-white p-5 border border-neutral-200 rounded-sm shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-2">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Suivi et Traitement des Commandes Clients</span>
                  </h3>
                  {isRefreshing && (
                    <span className="text-[9px] text-neutral-400 animate-pulse uppercase tracking-widest font-bold">Mise à jour...</span>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400">
                    <p>Aucune commande enregistrée sur la plateforme actuellement.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => {
                      const isUnpaid = o.paymentStatus !== "Payé" && o.paymentMethod !== "Espèces";
                      
                      return (
                        <div 
                          key={o.id} 
                          className={`p-4 border border-neutral-200 rounded-sm hover:border-neutral-300 transition-all ${
                            isUnpaid ? "bg-amber-50/20 border-l-4 border-l-amber-500" : "bg-neutral-50/40"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2.5 border-b border-neutral-150 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs text-neutral-955">📦 #{o.id}</span>
                                <span className="text-neutral-400 text-[10px]">{new Date(o.createdAt).toLocaleString("fr-FR")}</span>
                              </div>
                              <p className="text-[10px] text-neutral-600 font-bold mt-1">
                                Client : {o.shippingDetails?.name || "Client Anonyme"} - 📞 {o.shippingDetails?.phone || "N/A"}
                              </p>
                              <p className="text-[10px] text-neutral-500 italic">
                                Quartier : {o.shippingDetails?.quartier || "Lomé"}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="font-display font-black text-neutral-955 text-xs block">{formatFCFA(o.totalAmount)}</span>
                              <span className="text-[9px] bg-neutral-200 text-neutral-850 px-1.5 py-0.5 rounded-sm uppercase tracking-wide font-semibold block mt-1 w-max sm:ml-auto">
                                {o.paymentMethod || "Mobile Money"}
                              </span>
                            </div>
                          </div>

                          {/* Order items sublist */}
                          <div className="text-[10px] text-neutral-700 bg-white p-2 border border-neutral-200 mb-3 space-y-1">
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-100">Détails articles :</p>
                            {o.items && Array.isArray(o.items) && o.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-[10.5px]">
                                <span>• <strong>{item.product?.nom}</strong> (x{item.quantity})</span>
                                <span className="font-mono text-neutral-500">{formatFCFA(item.product?.prix * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Validation actions and select status */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Payment badge status */}
                              <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] uppercase tracking-wider border ${
                                o.paymentStatus === "Payé" 
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}>
                                Paiement : {o.paymentStatus || "En attente"}
                              </span>

                              {/* Manual validate payment button */}
                              {isUnpaid && (
                                <button
                                  onClick={() => handleValidatePayment(o.id)}
                                  className="bg-amber-500 hover:bg-amber-600 text-neutral-955 font-black text-[9px] uppercase tracking-wider py-1 px-2.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Valider Paiement</span>
                                </button>
                              )}

                              {/* View / Print Official Invoice */}
                              <button
                                onClick={() => {
                                  setSelectedInvoiceOrder(o);
                                  setIsInvoiceModalOpen(true);
                                }}
                                className="bg-neutral-900 hover:bg-[#d4af37] text-white hover:text-neutral-950 font-bold text-[9px] uppercase tracking-wider py-1 px-2 rounded-xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Facture</span>
                              </button>
                            </div>

                            {/* Delivery Status editor dropdown */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Livraison :</span>
                              <select
                                value={o.orderStatus || "En préparation"}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="border border-neutral-300 rounded-xs px-2 py-1 text-xs outline-none bg-white font-semibold font-sans text-neutral-800 cursor-pointer"
                              >
                                <option value="En préparation">En préparation</option>
                                <option value="En cours de livraison">En cours de livraison</option>
                                <option value="Livré">Livré</option>
                                <option value="Annulé">Annulé</option>
                              </select>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : activeTab === "banners" ? (
          <div className="space-y-6">
            {/* Header Banner Section */}
            <div className="bg-neutral-950 text-white p-6 rounded-sm border border-[#d4af37]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="font-display font-extrabold text-lg uppercase tracking-wider text-white">Gestion des Images & Vitrines de l'Accueil</h3>
                </div>
                <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  Remplacez facilement n'importe quelle photo de la boutique **directement depuis votre appareil** (caméra de votre téléphone, galerie photos, ou fichiers de votre ordinateur) sans avoir besoin d'URL externe.
                </p>
              </div>
              {bannerSubSection === "carousel" && (
                <button
                  onClick={handleAddNewSlide}
                  className="bg-[#d4af37] hover:bg-amber-400 text-neutral-955 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Affiche Promo</span>
                </button>
              )}
            </div>

            {/* Sub-tabs Selector for sections */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-100 rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={() => setBannerSubSection("vitrine")}
                className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  bannerSubSection === "vitrine"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                }`}
              >
                <span>🍯 Vitrine Terroirs (4 Cartes du Haut)</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{adminHeroCards.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setBannerSubSection("gallery")}
                className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  bannerSubSection === "gallery"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                }`}
              >
                <span>🏺 Galerie Savoir-faire (4 Cartes Lookbook)</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{adminGalleryCards.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setBannerSubSection("carousel")}
                className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  bannerSubSection === "carousel"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                }`}
              >
                <span>🌟 Bannières Carrousel Promo</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{adminPromoSlides.length}</span>
              </button>
            </div>

            {promoSaveSuccess && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 p-3.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Photos et informations enregistrées avec succès ! La vitrine de l'accueil est immédiatement synchronisée.</span>
              </div>
            )}

            {/* SECTION 1: VITRINE TERROIRS (4 Cartes Haut de Page) */}
            {bannerSubSection === "vitrine" && (
              <div className="space-y-4">
                <div className="bg-emerald-900/10 border border-emerald-700/20 p-3.5 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">4 Cartes Vitrine Terroir de l'Accueil</h4>
                    <p className="text-[11px] text-emerald-800">Ces cartes apparaissent à droite du grand titre d'accueil. Cliquez sur « Importer une photo » pour changer l'image depuis votre appareil.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {adminHeroCards.map((card, idx) => {
                    const defaultImg = DEFAULT_HERO_CARDS[idx]?.imageUrl || card.imageUrl;
                    return (
                      <div key={card.id || idx} className="bg-white border border-neutral-250 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-600 transition-colors">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                              Carte #{idx + 1}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {card.id}</span>
                          </div>

                          {/* Image preview box */}
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 mb-3 group">
                            <img 
                              src={card.imageUrl || defaultImg} 
                              alt={card.title} 
                              onError={(e) => { (e.target as HTMLImageElement).src = defaultImg; }}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-xs font-bold">
                              {card.title}
                            </div>
                          </div>

                          {/* Quick Photo Upload Button */}
                          <div className="space-y-2 mb-3">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAdminUploadModal({
                                  id: card.id,
                                  title: `Changer la photo : ${card.title}`,
                                  subtitle: "Importez une photo depuis votre appareil (sans URL)",
                                  imageUrl: card.imageUrl || defaultImg,
                                  defaultImageUrl: defaultImg,
                                  categoryType: "hero",
                                  index: idx,
                                  aspectRatio: "square"
                                });
                              }}
                              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Camera className="w-4 h-4 text-emerald-300" />
                              <span>Changer la photo</span>
                            </button>

                            {/* Direct Native File Input Fallback */}
                            <label className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-250">
                              <Upload className="w-3.5 h-3.5 text-neutral-600" />
                              <span>Fichier rapide...</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleHeroCardImageUpload(idx, e.target.files[0]);
                                  }
                                }} 
                              />
                            </label>

                            {card.imageUrl !== defaultImg && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedHero = [...adminHeroCards];
                                  updatedHero[idx] = { ...updatedHero[idx], imageUrl: defaultImg };
                                  saveAdminShowcaseCards(updatedHero, adminGalleryCards);
                                }}
                                className="w-full text-center text-[10px] text-amber-700 hover:text-amber-900 font-semibold flex items-center justify-center gap-1 cursor-pointer pt-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Rétablir la photo d'origine</span>
                              </button>
                            )}
                          </div>

                          {/* Editable Details */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">Titre</label>
                              <input 
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const updatedHero = [...adminHeroCards];
                                  updatedHero[idx] = { ...updatedHero[idx], title: e.target.value };
                                  saveAdminShowcaseCards(updatedHero, adminGalleryCards);
                                }}
                                className="w-full text-xs font-bold border border-neutral-300 p-1.5 rounded bg-white text-neutral-900 focus:outline-none focus:border-emerald-600"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">Description courte</label>
                              <textarea
                                rows={2}
                                value={card.subtitle}
                                onChange={(e) => {
                                  const updatedHero = [...adminHeroCards];
                                  updatedHero[idx] = { ...updatedHero[idx], subtitle: e.target.value };
                                  saveAdminShowcaseCards(updatedHero, adminGalleryCards);
                                }}
                                className="w-full text-xs border border-neutral-300 p-1.5 rounded bg-white text-neutral-900 focus:outline-none focus:border-emerald-600 resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: GALERIE & SAVOIR-FAIRE (4 Cartes Lookbook) */}
            {bannerSubSection === "gallery" && (
              <div className="space-y-4">
                <div className="bg-amber-900/10 border border-amber-700/20 p-3.5 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">4 Cartes Galerie & Savoir-Faire (Lookbook)</h4>
                    <p className="text-[11px] text-amber-800">Ces cartes apparaissent dans la section « Galerie Locale & Savoir-faire » (Céramiques, Tissage, Miels, Soin Solidaire). Remplacez leurs visuels en un clic.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {adminGalleryCards.map((card, idx) => {
                    const defaultImg = DEFAULT_GALLERY_CARDS[idx]?.imageUrl || card.imageUrl;
                    return (
                      <div key={card.id || idx} className="bg-white border border-neutral-250 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-600 transition-colors">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                              Lookbook #{idx + 1}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {card.id}</span>
                          </div>

                          {/* Image preview box (Portrait format) */}
                          <div className="relative aspect-3/4 w-full rounded-lg overflow-hidden bg-neutral-950 border border-neutral-200 mb-3 group">
                            <img 
                              src={card.imageUrl || defaultImg} 
                              alt={card.title} 
                              onError={(e) => { (e.target as HTMLImageElement).src = defaultImg; }}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-[#d4af37] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Portrait
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-xs font-bold">
                              {card.title}
                            </div>
                          </div>

                          {/* Quick Photo Upload Button */}
                          <div className="space-y-2 mb-3">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAdminUploadModal({
                                  id: card.id,
                                  title: `Changer la photo : ${card.title}`,
                                  subtitle: "Importez une photo depuis votre appareil (sans URL)",
                                  imageUrl: card.imageUrl || defaultImg,
                                  defaultImageUrl: defaultImg,
                                  categoryType: "gallery",
                                  index: idx,
                                  aspectRatio: "portrait"
                                });
                              }}
                              className="w-full bg-neutral-900 hover:bg-[#d4af37] hover:text-neutral-950 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Camera className="w-4 h-4 text-emerald-300" />
                              <span>Changer la photo</span>
                            </button>

                            {/* Direct Native File Input Fallback */}
                            <label className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-250">
                              <Upload className="w-3.5 h-3.5 text-neutral-600" />
                              <span>Fichier rapide...</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleGalleryCardImageUpload(idx, e.target.files[0]);
                                  }
                                }} 
                              />
                            </label>

                            {card.imageUrl !== defaultImg && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedGallery = [...adminGalleryCards];
                                  updatedGallery[idx] = { ...updatedGallery[idx], imageUrl: defaultImg };
                                  saveAdminShowcaseCards(adminHeroCards, updatedGallery);
                                }}
                                className="w-full text-center text-[10px] text-amber-700 hover:text-amber-900 font-semibold flex items-center justify-center gap-1 cursor-pointer pt-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Rétablir la photo d'origine</span>
                              </button>
                            )}
                          </div>

                          {/* Editable Details */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">Titre</label>
                              <input 
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const updatedGallery = [...adminGalleryCards];
                                  updatedGallery[idx] = { ...updatedGallery[idx], title: e.target.value };
                                  saveAdminShowcaseCards(adminHeroCards, updatedGallery);
                                }}
                                className="w-full text-xs font-bold border border-neutral-300 p-1.5 rounded bg-white text-neutral-900 focus:outline-none focus:border-amber-600"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">Sous-titre / Collection</label>
                              <input 
                                type="text"
                                value={card.collection || ""}
                                onChange={(e) => {
                                  const updatedGallery = [...adminGalleryCards];
                                  updatedGallery[idx] = { ...updatedGallery[idx], collection: e.target.value };
                                  saveAdminShowcaseCards(adminHeroCards, updatedGallery);
                                }}
                                className="w-full text-xs border border-neutral-300 p-1.5 rounded bg-white text-neutral-900 focus:outline-none focus:border-amber-600"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: CAROUSEL BANNER SLIDES */}
            {bannerSubSection === "carousel" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminPromoSlides.map((slide, index) => (
                  <div 
                    key={slide.id || index}
                    className="bg-white border border-neutral-250 rounded-md p-4 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#d4af37] transition-colors"
                  >
                    <div>
                      {/* Slide Top Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-[#d4af37]/20 text-neutral-900 border border-[#d4af37]/40 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                          Affiche #{index + 1}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          ID: {slide.id}
                        </span>
                      </div>

                      {/* Image Preview Box (Format Paysage) */}
                      <div className="relative w-full aspect-21/9 bg-neutral-950 rounded border border-neutral-200 overflow-hidden mb-3 group">
                        <img 
                          src={slide.imageUrl} 
                          alt={slide.titleFr || "Affiche Promo"} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-[#d4af37] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                          21:9 Paysage
                        </div>
                        <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-xs font-bold">
                          {slide.titleFr}
                        </div>
                      </div>

                      {/* Image Change Controls */}
                      <div className="space-y-2 mb-4 bg-stone-50 p-3 rounded border border-stone-200">
                        <label className="block text-[10px] font-bold text-neutral-800 uppercase tracking-wider">
                          Remplacer la photo depuis votre appareil :
                        </label>
                        
                        {/* Option 1: Direct Device Modal Picker */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAdminUploadModal({
                              id: slide.id,
                              title: `Changer l'affiche : ${slide.titleFr || 'Affiche'}`,
                              subtitle: "Sélectionnez une photo depuis votre galerie, caméra ou fichiers",
                              imageUrl: slide.imageUrl,
                              defaultImageUrl: slide.imageUrl,
                              categoryType: "banner",
                              index: index,
                              aspectRatio: "banner"
                            });
                          }}
                          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-emerald-300" />
                          <span>Parcourir photos / Prendre photo</span>
                        </button>

                        {/* Option 2: Direct Native File Input */}
                        <label className="w-full bg-neutral-900 hover:bg-[#d4af37] text-white hover:text-neutral-955 font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer">
                          <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                          <span>Importer un fichier image</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleSlideImageUpload(index, e.target.files[0]);
                              }
                            }} 
                          />
                        </label>
                      </div>

                      {/* Text details for the Slide */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                            Titre de l'Affiche
                          </label>
                          <input 
                            type="text"
                            value={slide.titleFr || ""}
                            onChange={(e) => {
                              const updated = [...adminPromoSlides];
                              updated[index] = { ...updated[index], titleFr: e.target.value, titleEe: e.target.value };
                              saveAdminPromoSlides(updated);
                            }}
                            className="w-full text-xs font-bold border border-stone-300 p-2 rounded bg-white text-neutral-900 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                            Sous-Titre / Collection
                          </label>
                          <input 
                            type="text"
                            value={slide.subtitleFr || ""}
                            onChange={(e) => {
                              const updated = [...adminPromoSlides];
                              updated[index] = { ...updated[index], subtitleFr: e.target.value, subtitleEe: e.target.value };
                              saveAdminPromoSlides(updated);
                            }}
                            className="w-full text-xs border border-stone-300 p-2 rounded bg-white text-neutral-900 focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                            Catégorie cible au clic
                          </label>
                          <select 
                            value={slide.categoryTarget || "Tous"}
                            onChange={(e) => {
                              const updated = [...adminPromoSlides];
                              updated[index] = { ...updated[index], categoryTarget: e.target.value };
                              saveAdminPromoSlides(updated);
                            }}
                            className="w-full text-xs font-bold border border-stone-300 p-2 rounded bg-white text-neutral-900 focus:outline-none focus:border-[#d4af37]"
                          >
                            <option value="Tous">Toutes les catégories</option>
                            <option value="Made in Togo Premium">Made in Togo Premium</option>
                            <option value="Paniers Frais & Épicerie">Paniers Frais & Épicerie</option>
                            <option value="Cosmétique & Beauté Bio">Cosmétique & Beauté Bio</option>
                            <option value="Mode & Artisanat Lux">Mode & Artisanat Lux</option>
                            <option value="Plats & Gastronomie Locale">Plats & Gastronomie Locale</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <button 
                      onClick={() => handleDeleteSlide(index)}
                      className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors border border-red-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer cette affiche</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "stats" ? (
          <AdminStats />
        ) : (
              <div className="bg-white border border-neutral-200 p-8 rounded-sm shadow-sm max-w-3xl mx-auto animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-neutral-100">
                  <div className="bg-[#d4af37]/10 p-2.5 text-[#b8901c] rounded-sm">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base uppercase text-neutral-950">Configuration de l'Application</h2>
                    <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-semibold font-mono">Numéros de redirections et style de logo</p>
                  </div>
                </div>

                <div className="space-y-8 text-xs text-neutral-800">
                  {/* WhatsApp Redirection Setting */}
                  <div className="pb-6 border-b border-neutral-100">
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Numéro WhatsApp de validation de commande & redirection <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      value={whatsappDisplaySetting}
                      onChange={(e) => setWhatsappDisplaySetting(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Ex: 22890000000"
                      className="w-full border border-neutral-300 rounded-sm px-4 py-3 text-sm font-mono tracking-wide focus:ring-1 focus:ring-amber-500 outline-none bg-neutral-50 text-neutral-900"
                    />
                    <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
                      💡 <strong>Format Requis :</strong> Entrez le numéro de téléphone complet sans le "+" au début, sans espaces ou tirets (ex: pour le numéro <b>+228 90 00 00 00</b>, tapez uniquement <b>22890000000</b>). Ce numéro recevra les validations de paniers envoyées par vos clients.
                    </p>
                  </div>

                  {/* Logo Unique Info Banner */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Identité Visuelle Officielle
                    </label>
                    <div className="flex items-center gap-4 p-4 border rounded-xl bg-emerald-50/50 border-emerald-200/80 shadow-2xs max-w-md">
                      <div className="w-14 h-14 shrink-0 flex items-center justify-center p-1 rounded-lg bg-white border border-[#C88A24]/40 shadow-2xs overflow-hidden">
                        <img src={officialLogoImg} alt="Logo Officiel Miabé Asi" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>Logo Officiel Miabé Asi</span>
                          <span className="bg-emerald-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">Actif</span>
                        </div>
                        <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-snug">
                          Logo officiel configuré et actif sur l'ensemble du site web et de l'application mobile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {saveConfigSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 text-xs rounded-sm font-bold animate-fade-in flex items-center gap-2">
                      <span className="text-sm">✓</span>
                      <span>Configuration enregistrée avec succès ! Le logo et le numéro WhatsApp ont été mis à jour globalement sur le serveur.</span>
                    </div>
                  )}

                  {/* Section Passerelle de Paiement PayDunya */}
                  <div className="border-t border-stone-200 pt-6 mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <span>Passerelle de Paiement (PayDunya)</span>
                          {paymentGatewayStatus?.configured ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              ● Configuré ({paymentGatewayStatus.mode.toUpperCase()})
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              ⚠️ En attente de clés (.env)
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1">
                          Statut de connexion à la passerelle officielle de paiement Mobile Money & Carte bancaire.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/payments/status?t=" + Date.now());
                            if (res.ok) {
                              const data = await res.json();
                              setPaymentGatewayStatus(data);
                            }
                          } catch (e) {}
                        }}
                        className="text-[11px] font-bold text-[#d4af37] hover:underline cursor-pointer"
                      >
                        Rafraîchir statut
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className={`p-3 rounded-lg border text-xs ${paymentGatewayStatus?.hasMasterKey ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-stone-50 border-stone-200 text-stone-600"}`}>
                        <div className="font-bold flex items-center justify-between">
                          <span>Clé Principale (Master Key)</span>
                          <span>{paymentGatewayStatus?.hasMasterKey ? "✓ Détectée" : "✗ Manquante"}</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 font-mono">
                          {paymentGatewayStatus?.maskedMasterKey || "PAYDUNYA_MASTER_KEY"}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg border text-xs ${paymentGatewayStatus?.hasPrivateKey ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-stone-50 border-stone-200 text-stone-600"}`}>
                        <div className="font-bold flex items-center justify-between">
                          <span>Clé Privée (Private Key)</span>
                          <span>{paymentGatewayStatus?.hasPrivateKey ? "✓ Détectée" : "✗ Manquante"}</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 font-mono">
                          {paymentGatewayStatus?.hasPrivateKey ? "******** (Protégée)" : "PAYDUNYA_PRIVATE_KEY"}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg border text-xs ${paymentGatewayStatus?.hasToken ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-stone-50 border-stone-200 text-stone-600"}`}>
                        <div className="font-bold flex items-center justify-between">
                          <span>Jeton / Token</span>
                          <span>{paymentGatewayStatus?.hasToken ? "✓ Détecté" : "✗ Manquant"}</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1 font-mono">
                          {paymentGatewayStatus?.maskedToken || "PAYDUNYA_TOKEN"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[11px] text-stone-600 space-y-1.5">
                      <p className="font-bold text-stone-800">💡 Format recommandé dans votre fichier <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-900">.env</code> :</p>
                      <pre className="bg-stone-900 text-stone-100 p-2.5 rounded text-[10px] font-mono overflow-x-auto">
{`PAYDUNYA_MASTER_KEY=votre_cle_principale
PAYDUNYA_PRIVATE_KEY=votre_cle_privee
PAYDUNYA_TOKEN=votre_token_public
PAYDUNYA_MODE=live`}
                      </pre>
                      <p className="text-[10px] text-stone-500">
                        Le serveur recharge automatiquement ces variables lors de chaque transaction.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            auth: "asime2026",
                            whatsappMerchantNumber: whatsappDisplaySetting,
                            activeLogoId: activeLogoId
                          })
                        });
                        
                        if (response.ok) {
                          // Keep local caches updated too
                          localStorage.setItem("asime_whatsapp_merchant_number", whatsappDisplaySetting);
                          localStorage.setItem("asime-active-logo-id", activeLogoId);
                          
                          setSaveConfigSuccess(true);
                          setTimeout(() => setSaveConfigSuccess(false), 5000);
                        } else {
                          alert("Erreur lors de la sauvegarde des paramètres.");
                        }
                      } catch (err) {
                        console.error("Save settings network error:", err);
                        alert("Erreur réseau : impossible de joindre le serveur.");
                      }
                    }}
                    className="w-full bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 py-3.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Enregistrer la Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- OFFICIAL PRINTABLE INVOICE MODAL (ADMIN) --- */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedInvoiceOrder}
        merchantPhone={whatsappDisplaySetting}
      />

      {/* --- ADMIN DIRECT IMAGE UPLOAD MODAL --- */}
      {activeAdminUploadModal && (
        <ImageUploadModal
          isOpen={true}
          onClose={() => setActiveAdminUploadModal(null)}
          title={activeAdminUploadModal.title}
          subtitle={activeAdminUploadModal.subtitle}
          currentImageUrl={activeAdminUploadModal.imageUrl}
          defaultImageUrl={activeAdminUploadModal.defaultImageUrl}
          aspectRatio={activeAdminUploadModal.aspectRatio}
          onSaveImage={async (newImageDataUrl) => {
            let finalUrl = newImageDataUrl;
            if (newImageDataUrl.startsWith("data:")) {
              const up = await uploadImageToServer(newImageDataUrl, activeAdminUploadModal.imageUrl);
              if (up.success && up.url) {
                finalUrl = up.url;
              }
            }

            if (activeAdminUploadModal.categoryType === "hero" && activeAdminUploadModal.index !== undefined) {
              const updatedHero = [...adminHeroCards];
              updatedHero[activeAdminUploadModal.index] = {
                ...updatedHero[activeAdminUploadModal.index],
                imageUrl: finalUrl
              };
              await saveAdminShowcaseCards(updatedHero, adminGalleryCards);
            } else if (activeAdminUploadModal.categoryType === "gallery" && activeAdminUploadModal.index !== undefined) {
              const updatedGallery = [...adminGalleryCards];
              updatedGallery[activeAdminUploadModal.index] = {
                ...updatedGallery[activeAdminUploadModal.index],
                imageUrl: finalUrl
              };
              await saveAdminShowcaseCards(adminHeroCards, updatedGallery);
            } else if (activeAdminUploadModal.categoryType === "banner" && activeAdminUploadModal.index !== undefined) {
              const updatedSlides = [...adminPromoSlides];
              updatedSlides[activeAdminUploadModal.index] = {
                ...updatedSlides[activeAdminUploadModal.index],
                imageUrl: finalUrl
              };
              saveAdminPromoSlides(updatedSlides);
            }
          }}
        />
      )}

      {adminToast && (
        <div className="fixed bottom-6 right-6 z-[300] bg-stone-900 text-white px-5 py-3 rounded-lg shadow-2xl border border-[#d4af37] text-xs font-bold animate-bounce flex items-center gap-2 select-none">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <span>{adminToast}</span>
        </div>
      )}
    </div>
  );
}

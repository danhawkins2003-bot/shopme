/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  Home,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Search,
  Filter,
  ArrowRight,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  Minus,
  X,
  Check,
  MapPin,
  Mail,
  Phone,
  Clock,
  Heart,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  AlertCircle,
  Calendar,
  User,
  Globe,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  Send,
  Star,
  Share2,
  ZoomIn,
  Download,
  Eye,
  Bell,
  Store,
  MessageCircle,
  FileText
} from "lucide-react";
import { Product, CartItem, BlogPost } from "./types";
import MultiRoleDashboards from "./components/MultiRoleDashboards";
import SimulatedPaymentPortal from "./components/SimulatedPaymentPortal";
import { InvoiceModal } from "./components/InvoiceModal";
import { AIAssistantWidget } from "./components/AIAssistantWidget";
import { INITIAL_PROMO_SLIDES, PromoSlide } from "./data/promoBanners";
import { useLanguage } from "./lib/i18n";

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

// --- CONFIGURATION ASIME TOGO (À MODIFIER AVEC VOS PROPRES INFOS) ---
export const ASIME_SETTINGS = {
  // Vos numéros d'administration et de commande (Format sans '+' pour WhatsApp, ex: 22890000000)
  WHATSAPP_MERCHANT_NUMBER: typeof window !== "undefined" ? (localStorage.getItem("asime_whatsapp_merchant_number") || import.meta.env.VITE_WHATSAPP_MERCHANT_NUMBER || "22890000000") : "22890000000", 
  PHONE_DISPLAY_PRIMARY: import.meta.env.VITE_PHONE_DISPLAY_PRIMARY || "+228 90 00 00 00",
  PHONE_DISPLAY_SECONDARY: import.meta.env.VITE_PHONE_DISPLAY_SECONDARY || "+228 97 00 00 00",
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || "support@asime228.com",
  
  // Google AdSense Configuration
  ADSENSE_CLIENT_ID: import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX",
  ADSENSE_SLOT_LEADERBOARD: import.meta.env.VITE_ADSENSE_SLOT_LEADERBOARD || "1234567890",
  ADSENSE_SLOT_SQUARE: import.meta.env.VITE_ADSENSE_SLOT_SQUARE || "1234567890",
  ADSENSE_SLOT_HORIZONTAL: import.meta.env.VITE_ADSENSE_SLOT_HORIZONTAL || "1234567890",

  // Liens Affiliés Globaux par défaut (si un produit n'a pas son propre lien d'affiliation)
  DEFAULT_AFFILIATE_URL: import.meta.env.VITE_DEFAULT_AFFILIATE_URL || "https://s.click.aliexpress.com/e/_DdYxyz",
  DEFAULT_AMAZON_COLLECTION_URL: import.meta.env.VITE_DEFAULT_AMAZON_URL || "https://www.amazon.com/Best-Sellers-Electronics/zgbs/electronics"
};

function GoogleAdSenseBanner({ format }: { format: "leaderboard" | "square" | "horizontal" }) {
  const { language } = useLanguage();
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    if (
      !ASIME_SETTINGS.ADSENSE_CLIENT_ID ||
      ASIME_SETTINGS.ADSENSE_CLIENT_ID.includes("XXXX")
    ) {
      return;
    }

    // Load AdSense script dynamically
    const scriptId = "adsense-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ASIME_SETTINGS.ADSENSE_CLIENT_ID}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Initialize adsbygoogle
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push error:", e);
      setAdError(true);
    }
  }, [format]);

  const isDemo =
    !ASIME_SETTINGS.ADSENSE_CLIENT_ID ||
    ASIME_SETTINGS.ADSENSE_CLIENT_ID.includes("XXXX") ||
    adError;

  if (!isDemo) {
    const slot =
      format === "leaderboard"
        ? ASIME_SETTINGS.ADSENSE_SLOT_LEADERBOARD
        : format === "square"
        ? ASIME_SETTINGS.ADSENSE_SLOT_SQUARE
        : ASIME_SETTINGS.ADSENSE_SLOT_HORIZONTAL;

    return (
      <div className="w-full flex items-center justify-center my-4 overflow-hidden border border-neutral-200/50 p-2 bg-neutral-50/50 min-h-[100px]" id={`adsense-cnt-${format}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", textAlign: "center" }}
          data-ad-client={ASIME_SETTINGS.ADSENSE_CLIENT_ID}
          data-ad-slot={slot || "1234567890"}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  const getBannerStyle = () => {
    switch (format) {
      case "leaderboard":
        return "relative w-full max-w-7xl mx-auto my-6 p-6 bg-yellow-50/40 border border-yellow-200/50 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4";
      case "square":
        return "relative w-full p-6 bg-yellow-50/40 border border-yellow-200/50 rounded-sm flex flex-col items-center justify-center text-center gap-3 aspect-square";
      case "horizontal":
        return "relative w-full my-8 p-6 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-[#d4af37]/25 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 text-white";
    }
  };

  return (
    <div className={getBannerStyle()}>
      {/* Tiny Ad badge */}
      <div className="absolute top-1.5 left-2 text-[7px] font-bold text-neutral-400 uppercase tracking-widest pointer-events-none">
        {language === "fr" ? "Annonce Asime Exclusive" : "Asime ƒe Adzɔnudraɖe Tɔxɛ"}
      </div>
      {format === "leaderboard" && (
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/10 border border-[#d4af37]/35 rounded-full flex items-center justify-center font-display font-bold text-[#b8901c] shrink-0">Ads</div>
            <div>
              <p className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                {language === "fr" ? "Découvrez le Vestiaire Chic & Haute Technologie" : "Kpɔ Awu Dzɛwo kple Kɔmputazi mɔ̃wo"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {language === "fr" 
                  ? "Bénéficiez de notre service d'importation express et de remises immédiates allant de -20% à -70%." 
                  : "Bunu tso míaƒe mɔɖonunyuitɔwo kple asiɖeɖe gãwo si tso -20% yi -70% me."}
              </p>
            </div>
          </div>
          <a
            href={ASIME_SETTINGS.DEFAULT_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 px-4 py-2 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap"
          >
            {language === "fr" ? "S'équiper à Lomé" : "Kpɔ nudradra le Lomé"}
          </a>
        </>
      )}
      {format === "square" && (
        <>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/35 rounded-full flex items-center justify-center font-display font-black text-[#d4af37] mb-2">PROMO</div>
          <p className="text-xs font-extrabold text-neutral-950 uppercase tracking-wide">
            {language === "fr" ? "Sélection Officielle d'Automne" : "Gboɖome Adzɔnu Tɔxɛwo"}
          </p>
          <p className="text-[10px] text-neutral-500">
            {language === "fr" ? "Sélection de vêtements et d'accessoires raffinés de prestige." : "Awu dzesiwo kple adzɔnu nyui siwo sɔ na wò."}
          </p>
          <a
            href={ASIME_SETTINGS.DEFAULT_AMAZON_COLLECTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 py-2 rounded-sm text-[9px] font-bold tracking-widest uppercase text-center mt-2"
          >
            {language === "fr" ? "Découvrir la Collection" : "Kpɔ Awu Hame Siawo"}
          </a>
        </>
      )}
      {format === "horizontal" && (
        <>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/35 rounded-sm flex items-center justify-center font-display font-black text-[#d4af37] text-xl shrink-0">ADS</div>
            <div>
              <span className="text-[9px] text-[#d4af37] font-bold tracking-widest uppercase block">
                {language === "fr" ? "Offre Certifiée Locale" : "Anyigbadzinu Kpeɖodzi"}
              </span>
              <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-wide text-white leading-tight">
                {language === "fr" ? "Les Secrets de la Gastronomie & du Bien-Être Afro" : "Nuɖuɖu Kple Lãmesẽ ƒe Nya Ɣaɣlawo"}
              </h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                {language === "fr" 
                  ? "Téléchargez ce guide de cuisine locale et recevez un pack d'épices bio de Kpalimé gratuit lors de votre commande." 
                  : "Xɔ dɔwɔmɔfiamewo le afii eye nàxɔ Kpalimé ƒe nuku dzo-anuwo femaxee ne èɖo nudɔdɔ."}
              </p>
            </div>
          </div>
          <a
            href={ASIME_SETTINGS.DEFAULT_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#d4af37] hover:bg-white text-neutral-950 font-bold px-5 py-3 text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-md text-center shrink-0"
          >
            {language === "fr" ? "Obtenir le Guide" : "Xɔ Guide La"}
          </a>
        </>
      )}
    </div>
  );
}

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [activeLogoId, setActiveLogoId] = useState(() => {
    return safeLocalStorage.getItem("asime-active-logo-id") || "monogram";
  });

  // Fetch settings from server to sync logo and config across devices
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.activeLogoId) {
            setActiveLogoId(data.activeLogoId);
            safeLocalStorage.setItem("asime-active-logo-id", data.activeLogoId);
          }
          if (data.whatsappMerchantNumber) {
            safeLocalStorage.setItem("asime_whatsapp_merchant_number", data.whatsappMerchantNumber);
          }
        }
      })
      .catch((e) => console.error("Error syncing global settings:", e));
  }, []);

  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<"accueil" | "catalogue" | "blog" | "contact">("accueil");
  
  // Simulated gateway query params interceptor state
  const [gatewayParams, setGatewayParams] = useState<{ tx: string; provider: string } | null>(() => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const tx = params.get("tx") || params.get("transactionId");
    const provider = params.get("provider") || params.get("providerId");
    if (pathname.includes("payment-gateway") || pathname.includes("paymentGateway") || (tx && provider)) {
      return { tx: tx || "", provider: provider || "" };
    }
    return null;
  });
  
  // PWA Install States & Interactive prompt handlers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showGenericInstallGuide, setShowGenericInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Initial check for standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setShowInstallBanner(false);
    } else {
      // If iOS, we can show installation advice directly
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIos) {
        setShowInstallBanner(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Secret shortcut: Ctrl + Alt + A -> Open Admin page secretly without any visible links
  useEffect(() => {
    const handleAdminSecretShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        window.location.href = "/admin.html";
      }
    };
    window.addEventListener("keydown", handleAdminSecretShortcut);
    return () => {
      window.removeEventListener("keydown", handleAdminSecretShortcut);
    };
  }, []);

  const handleInstallApp = async () => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIos) {
      setShowIosGuide(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setShowInstallBanner(false);
        }
      } catch (err) {
        console.error("Choice error:", err);
      }
      setDeferredPrompt(null);
    } else {
      setShowGenericInstallGuide(true);
    }
  };
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [partners, setPartners] = useState<{ id: string; name: string; contractType?: "subscription" | "commission"; contactPhone?: string; autoPublish?: boolean }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  
  // Blog detailed viewer state
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showBlogShareToast, setShowBlogShareToast] = useState(false);
  
  // Catalogue Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [sortBy, setSortBy] = useState<"default" | "asc" | "desc" | "newest" | "popular">(() => {
    try {
      const saved = localStorage.getItem("asime_sortBy");
      if (saved === "default" || saved === "asc" || saved === "desc" || saved === "newest" || saved === "popular") {
        return saved as any;
      }
    } catch (e) {
      console.error("Failed to load sortBy from localStorage", e);
    }
    return "default";
  });

  // Save sort preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("asime_sortBy", sortBy);
    } catch (e) {
      console.error("Failed to save sortBy to localStorage", e);
    }
  }, [sortBy]);

  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>(() => {
    try {
      const saved = localStorage.getItem("asime_promo_slides");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMO_SLIDES;
  });

  // Automatically sync promo slides when updated from Admin space
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("asime_promo_slides");
        if (saved) setPromoSlides(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading updated promo slides", e);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);
  const [cartItemToDeleteId, setCartItemToDeleteId] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Selected Detail Product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Reviews Structure and State
  interface Review {
    id: string;
    author: string;
    rating: number;
    text: string;
    date: string;
  }
  const [productReviews, setProductReviews] = useState<Record<string, Review[]>>({});
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  // Image Zoom Modal State
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);


  // App Sharing & Download Modal State
  const [isShareDownloadOpen, setIsShareDownloadOpen] = useState(false);

  // New features state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [priceRange, setPriceRange] = useState<number>(150000);
  const [alertProduct, setAlertProduct] = useState<Product | null>(null);
  const [alertPhone, setAlertPhone] = useState("");
  const [isAlertSubmitting, setIsAlertSubmitting] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Advanced Filter States
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyPromo, setOnlyPromo] = useState<boolean>(false);
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>("Tous");

  // Dynamic Order Tracking Modal States
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackingOrderData, setTrackingOrderData] = useState<any | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState<boolean>(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Official Invoice Modal States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  // function to fetch dynamic tracking details
  const fetchTrackingDetails = async (orderId: string) => {
    setIsTrackingLoading(true);
    setTrackingError(null);
    try {
      const response = await fetch(`/api/orders/track/${orderId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Commande introuvable.");
      }
      const data = await response.json();
      if (data.success && data.order) {
        setTrackingOrderData(data.order);
        setTrackingOrderId(orderId);
        setIsTrackingModalOpen(true);
      } else {
        throw new Error("Impossible de charger les détails de suivi.");
      }
    } catch (err: any) {
      setTrackingError(err.message || "Une erreur de connexion est survenue.");
      setIsTrackingModalOpen(true);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Order Tracking URL query param parser effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get("track") || params.get("suivi");
    if (trackId) {
      fetchTrackingDetails(trackId);
      
      // discretely clean URL query parameters
      try {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (err) {
        console.warn("Could not sweep URL query string state", err);
      }
    }
  }, []);

  const getProductReviews = (productId: string, productName: string, productCategory: string) => {
    const existing = productReviews[productId];
    if (existing) return existing;

    const defaults: Review[] = [];
    const lowerName = productName.toLowerCase();
    
    if (productCategory.includes("Miel") || lowerName.includes("miel") || lowerName.includes("thé") || lowerName.includes("boisson")) {
      defaults.push({
        id: `def-1-${productId}`,
        author: "Koffi A. (Lomé)",
        rating: 5,
        text: "Une qualité exceptionnelle, pureté inégalée ! On sent vraiment la richesse de la flore de Kpalimé.",
        date: "Il y a 3 jours"
      });
      defaults.push({
        id: `def-2-${productId}`,
        author: "Afiwa M. (Kara)",
        rating: 4,
        text: "Très bon goût et bien emballé. Parfait pour mes infusions du soir.",
        date: "Il y a une semaine"
      });
    } else if (productCategory.includes("Cosmétique") || lowerName.includes("karité") || lowerName.includes("savon") || lowerName.includes("huile")) {
      defaults.push({
        id: `def-1-${productId}`,
        author: "Sena Y. (Kpalimé)",
        rating: 5,
        text: "Hydratation parfaite pour toute la famille. Ce beurre est d'une douceur extraordinaire.",
        date: "Il y a 5 jours"
      });
      defaults.push({
        id: `def-2-${productId}`,
        author: "Fati K. (Sokodé)",
        rating: 5,
        text: "Authentique et sans parfum artificiel. Ma peau sensible adore !",
        date: "Il y a 2 semaines"
      });
    } else if (productCategory.includes("Argile") || productCategory.includes("Raphia") || lowerName.includes("artisan") || lowerName.includes("poterie") || lowerName.includes("sculpt") || lowerName.includes("sac")) {
      defaults.push({
        id: `def-1-${productId}`,
        author: "Folly D. (Aného)",
        rating: 5,
        text: "Une pièce d'art grandiose. Les finitions faites à la main montrent tout le savoir-faire ancestral.",
        date: "Il y a 2 jours"
      });
      defaults.push({
        id: `def-2-${productId}`,
        author: "Mawuli G. (Lomé)",
        rating: 4,
        text: "Très bel élément de décoration, authentique et robuste. Livraison rapide chez moi.",
        date: "Il y a 10 jours"
      });
    } else {
      defaults.push({
        id: `def-1-${productId}`,
        author: "Anani T. (Lomé)",
        rating: 5,
        text: "Excellent rapport qualité-prix. Très fier de consommer des produits locaux de cette qualité.",
        date: "Il y a 4 jours"
      });
      defaults.push({
        id: `def-2-${productId}`,
        author: "Essi R. (Atakpamé)",
        rating: 5,
        text: "Service irréprochable et commande validée sur WhatsApp en 2 minutes. Je recommande !",
        date: "Il y a 12 jours"
      });
    }

    return defaults;
  };

  const addProductReview = async (productId: string) => {
    if (!newReviewAuthor.trim()) {
      setReviewMessage("Veuillez saisir votre nom.");
      return;
    }
    if (!newReviewText.trim()) {
      setReviewMessage("Veuillez rédiger un court témoignage.");
      return;
    }

    const newReview: Review = {
      id: `user-${Date.now()}`,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      text: newReviewText.trim(),
      date: "À l'instant"
    };

    try {
      await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          author: newReview.author,
          rating: newReview.rating,
          text: newReview.text
        })
      });
    } catch (err) {
      console.error("Failed to persist product review:", err);
    }

    const current = getProductReviews(productId, selectedProduct?.nom || "", selectedProduct?.categorie || "");
    setProductReviews(prev => ({
      ...prev,
      [productId]: [newReview, ...current]
    }));

    // Reset fields
    setNewReviewAuthor("");
    setNewReviewRating(5);
    setNewReviewText("");
    setReviewMessage("Merci ! Votre avis a été ajouté avec succès.");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setReviewMessage("");
    }, 3000);
  };
  
  // Cart State (Persisted in LocalStorage)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Checkout coordinates form state
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutQuartier, setCheckoutQuartier] = useState("");
  const [checkoutPayment, setCheckoutPayment] = useState("EnLigne");
  
  // Payment Gateway states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [isPaymentVerifying, setIsPaymentVerifying] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [sellerDashboardActive, setSellerDashboardActive] = useState(false);
  const [initialDashboardView, setInitialDashboardView] = useState<"vendeur" | "client" | "menu">("menu");

  // Automatic payment simulation states
  const [autoPaymentStep, setAutoPaymentStep] = useState<number>(0);
  const [autoPaymentStatusText, setAutoPaymentStatusText] = useState<string>("");
  
  // Affiliate Redirect Overlay States
  const [redirectingProduct, setRedirectingProduct] = useState<Product | null>(null);
  const [redirectCount, setRedirectCount] = useState(3);
  
  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // Modern Floating Toast State for product sharing & feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => {
      setToastMessage(current => current === message ? null : current);
    }, 3500);
    return () => clearTimeout(timer);
  };

  // --- Customer Authentication States & Methods ---
  interface CustomerUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    quartier: string;
    favorites: string[];
    createdAt: string;
    role?: string;
    affiliateCode?: string;
    vendeurStatus?: string;
    businessName?: string;
    vendeurMode?: string;
    vendeurStats?: {
      produitsVendus: number;
      revenusGeneres: number;
    };
  }
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("asime-user-token"));

  // --- CUSTOMER-TO-SELLER MESSAGING & SHOP STATES ---
  const [isSellerShopOpen, setIsSellerShopOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [selectedSellerName, setSelectedSellerName] = useState("");
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatDrawerThreads, setChatDrawerThreads] = useState<any[]>([]);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [chatDrawerMessage, setChatDrawerMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const fetchCustomerThreads = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.threads) {
          setChatDrawerThreads(data.threads);
        }
      }
    } catch (e) {
      console.error("Error fetching customer threads:", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomerThreads();
      const interval = setInterval(fetchCustomerThreads, 6000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const startConversationWithSeller = async (sellerId: string, sellerName: string, productName: string) => {
    if (!user) {
      showToast("🔑 Veuillez vous connecter pour discuter avec l'artisan.");
      setIsAuthOpen(true);
      return;
    }
    
    setIsChatDrawerOpen(true);
    
    // Check if thread already exists
    const existing = chatDrawerThreads.find(t => t.sellerId === sellerId);
    if (existing) {
      setActiveChatThreadId(existing.id);
      return;
    }

    setIsSendingChat(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({
          sellerId,
          sellerName,
          productName,
          text: `Bonjour, je suis intéressé(e) par votre produit "${productName}". Est-il disponible ?`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.thread) {
          setChatDrawerThreads(prev => [data.thread, ...prev]);
          setActiveChatThreadId(data.thread.id);
        }
      }
    } catch (e) {
      console.error("Error initiating conversation:", e);
    } finally {
      setIsSendingChat(false);
    }
  };

  const sendCustomerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDrawerMessage.trim() || !activeChatThreadId || !token) return;

    const textToSend = chatDrawerMessage;
    setChatDrawerMessage("");

    // optimistic update
    setChatDrawerThreads(prev => prev.map(t => {
      if (t.id === activeChatThreadId) {
        return {
          ...t,
          lastMessage: textToSend,
          messages: [...t.messages, { sender: "customer", text: textToSend, date: new Date().toISOString() }]
        };
      }
      return t;
    }));

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          threadId: activeChatThreadId,
          text: textToSend
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.thread) {
          setChatDrawerThreads(prev => prev.map(t => t.id === activeChatThreadId ? data.thread : t));
        }
      }
    } catch (e) {
      console.error("Error sending client message:", e);
    }
  };

  useEffect(() => {
    if (isPaymentModalOpen && paymentSession && !isPaymentSuccess) {
      setAutoPaymentStep(0);
      setAutoPaymentStatusText("Initialisation de la connexion sécurisée...");
      
      let timer1: NodeJS.Timeout;
      let timer2: NodeJS.Timeout;
      let timer3: NodeJS.Timeout;
      let timer4: NodeJS.Timeout;

      timer1 = setTimeout(() => {
        setAutoPaymentStep(1);
        setAutoPaymentStatusText("Connexion sécurisée aux serveurs de l'opérateur mobile...");
        
        timer2 = setTimeout(() => {
          setAutoPaymentStep(2);
          setAutoPaymentStatusText("En attente de la validation de l'invitation Push USSD sur votre téléphone...");
          
          timer3 = setTimeout(() => {
            setAutoPaymentStep(3);
            setAutoPaymentStatusText("Saisie du code PIN détectée... Traitement de la transaction...");
            
            timer4 = setTimeout(async () => {
              setAutoPaymentStep(4);
              setAutoPaymentStatusText("Validation finale du transfert de fonds avec Asime Pay...");
              
              setIsPaymentVerifying(true);
              try {
                const confirmRes = await fetch("/api/payments/confirm", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": token } : {})
                  },
                  body: JSON.stringify({
                    transactionId: paymentSession.transactionId,
                    providerId: paymentSession.providerId
                  })
                });

                const confirmData = await confirmRes.json();
                if (confirmData.success) {
                  confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                  });
                  setIsPaymentSuccess(true);
                  showToast("✓ Paiement automatique reçu et validé avec succès !");
                } else {
                  setIsPaymentSuccess(true);
                }
              } catch (err) {
                console.error("Auto confirmation error:", err);
                setIsPaymentSuccess(true);
              } finally {
                setIsPaymentVerifying(false);
              }
            }, 1200);
          }, 1500);
        }, 1200);
      }, 800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isPaymentModalOpen, paymentSession, isPaymentSuccess, token]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  
  // Auth Form Fields State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authQuartier, setAuthQuartier] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Client Dashboard/Profile Drawer State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editQuartier, setEditQuartier] = useState("");

  const renderLogoNode = (sizeClass = "w-9 h-9") => {
    return (
      <div className={`relative ${sizeClass} flex items-center justify-center shrink-0 bg-white rounded-xl p-0.5 border border-emerald-100/80 shadow-2xs overflow-hidden`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M 43,15 L 57,15 L 81,81 L 66,81 L 50,38 L 34,81 L 19,81 Z" fill="#0D5E2F" />
          <g>
            <path d="M 27,73 C 40,49 57,39 77,46 C 60,59 44,74 27,73 Z" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M 27,73 C 41,63 59,51 77,46 C 60,57 44,72 27,73 Z" fill="#D97706" />
            <path d="M 27,73 C 40,51 57,41 77,46 C 59,51 41,63 27,73 Z" fill="#FAA61A" />
            <path d="M 27,73 C 41,63 59,51 77,46" stroke="white" strokeWidth="0.85" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  };

  // Sync / Prefill checkout details when user changes
  useEffect(() => {
    if (user) {
      setCheckoutName(user.name);
      if (user.phone) setCheckoutPhone(user.phone);
      if (user.quartier) setCheckoutQuartier(user.quartier);
    } else {
      setCheckoutName("");
      setCheckoutPhone("");
      setCheckoutQuartier("");
    }
  }, [user]);

  // Affiliate Parrainage Tracker for 30 days
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: refCode })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("asime_affiliate_ref", refCode);
          localStorage.setItem("asime_affiliate_timestamp", Date.now().toString());
          showToast(`✓ Visite affilié enregistrée : parrainé par ${data.affiliateName}`);
        }
      })
      .catch(err => console.error("Error tracking affiliate click:", err));
    }
  }, []);

  // Auto-advance promotional slides every 5 seconds when in Accueil tab
  useEffect(() => {
    if (activeTab !== "accueil" || promoSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, promoSlides.length]);

  const logoutCustomer = () => {
    localStorage.removeItem("asime-user-token");
    setToken(null);
    setUser(null);
    showToast("Déconnexion réussie");
  };

  // Fetch current user details if token is present
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": token
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            // Autofill checkout fields!
            if (data.user.name) setCheckoutName(data.user.name);
            if (data.user.phone) setCheckoutPhone(data.user.phone);
            if (data.user.quartier) setCheckoutQuartier(data.user.quartier);
          } else {
            logoutCustomer();
          }
        } else {
          logoutCustomer();
        }
      } catch (err) {
        console.error("Error loading user profile", err);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      setAuthMode("login");
      setAuthError("");
      setIsAuthOpen(true);
      showToast("Veuillez vous connecter pour enregistrer vos favoris.");
      return;
    }

    try {
      const res = await fetch("/api/auth/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({ productId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.favorites) {
          setUser(prev => prev ? { ...prev, favorites: data.favorites } : null);
          const isFav = data.favorites.includes(productId);
          showToast(isFav ? "Produit ajouté aux favoris !" : "Produit retiré des favoris !");
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Error toggling favorite", err);
      showToast("Impossible de mettre à jour vos favoris");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthSubmitting(true);

    if (!authEmail || !authPassword) {
      setAuthError("Veuillez remplir tous les champs requis.");
      setIsAuthSubmitting(false);
      return;
    }

    const payload = authMode === "login" 
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword, phone: authPhone, quartier: authQuartier };

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { success: false, error: "Service temporairement indisponible ou réponse serveur non valide." };
      }

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Une erreur s'est produite lors de la connexion.");
      } else {
        if (data.token && data.user) {
          localStorage.setItem("asime-user-token", data.token);
          setToken(data.token);
          setUser(data.user);
          setIsAuthOpen(false);
          
          // Reset form fields
          setAuthEmail("");
          setAuthPassword("");
          setAuthName("");
          setAuthPhone("");
          setAuthQuartier("");

          // Confetti!
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#d4af37", "#f59e0b", "#10b981", "#3b82f6"]
            });
          } catch (e) {
            console.warn(e);
          }

          showToast(authMode === "login" ? `Ravi de vous revoir, ${data.user.name} !` : `Bienvenue parmi nous, ${data.user.name} !`);
        } else {
          setAuthError(data.error || "Données de réponse invalides du serveur.");
        }
      }
    } catch (err) {
      console.error("Auth submit error", err);
      setAuthError("Erreur de connexion avec le serveur.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };



  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast("Le nom est obligatoire");
      return;
    }

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
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setIsEditingProfile(false);
        showToast("Profil enregistré avec succès !");
      } else {
        showToast(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error("Profile update error", err);
      showToast("Erreur de connexion.");
    }
  };

  // Modern share handler with browser sharing API & clipboard fallbacks
  const handleShareProduct = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Avoid triggering standard card detail action
    
    // Construct robust localized share URL
    const origin = window.location.origin || "https://asime.local";
    const shareUrl = `${origin}${window.location.pathname}?product=${product.id}`;
    const shareTitle = `✨ ${product.nom} | Asime Togo`;
    const shareText = `Découvrez "${product.nom}" fabriqué localement au Togo. Des exclusivités de haute volée !`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showToast("✓ Produit partagé avec succès !");
      } catch (err) {
        // If the sharing was simply cancelled/aborted, do nothing or copy
        if ((err as Error).name !== "AbortError") {
          copyLinkToClipboard(shareUrl, product.nom);
        } else {
          // If aborted, show link copied as helper anyway
          copyLinkToClipboard(shareUrl, product.nom);
        }
      }
    } else {
      copyLinkToClipboard(shareUrl, product.nom);
    }
  };

  const copyLinkToClipboard = (url: string, name: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        showToast(`✓ Lien de "${name}" copié dans le presse-papiers !`);
      })
      .catch((err) => {
        console.error("Failed to copy link via clipboard", err);
        showToast("Erreur: Impossible de copier le lien.");
      });
  };

  const handleShareApp = async () => {
    const origin = window.location.origin || "https://asime.local";
    const shareUrl = `${origin}${window.location.pathname}`;
    const shareTitle = `✨ Asime Togo | Boutique du Consommer Local`;
    const shareText = `Explorez la mode togolaise, l'artisanat local et de sublimes promotions sur Asime !`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showToast("✓ Application partagée avec succès !");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(shareUrl);
          showToast("✓ Lien de l'application copié ! Partagez-le avec vos proches.");
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("✓ Lien de l'application copié ! Partagez-le avec vos proches.");
    }
  };

  const downloadOfflineCatalogue = () => {
    const productsJson = JSON.stringify(products, null, 2);
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catalogue Offline - Asime Togo 🇹🇬</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Inter', sans-serif; background-color: #FAF9F6; }
    </style>
</head>
<body class="text-neutral-900 min-h-screen flex flex-col">
    <header class="bg-neutral-950 text-white py-6 px-4 border-b border-[#d4af37]/30 shadow-lg text-center">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-widest">ASIME TOGO</h1>
        <p class="text-[9px] text-[#d4af37] tracking-widest font-semibold uppercase mt-1">🌿 Catalogue de Poche Hors-Ligne 🌿</p>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        <div class="mb-6 bg-amber-50/70 border border-amber-200/50 p-4 text-center text-xs text-neutral-600 rounded-sm">
            <p class="font-bold text-neutral-900">Ce catalogue interactif fonctionne entièrement hors-ligne !</p>
            <p class="mt-1">Partagez ce fichier HTML par WhatsApp ou Bluetooth avec vos proches à Lomé pour qu'ils parcourent les produits sans dépenser de forfait internet.</p>
        </div>

        <div id="offline-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
    </main>

    <footer class="bg-neutral-950 text-neutral-500 py-6 text-center text-[10px] uppercase tracking-widest border-t border-neutral-800">
        <p>© ${new Date().getFullYear()} Asime. CONÇU POUR LE CONSOMMER LOCAL TOGOLAIS 🇹🇬</p>
    </footer>

    <script>
        const products = ${productsJson};
        const grid = document.getElementById('offline-grid');
        
        if (!products || products.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center text-neutral-500 font-medium">Aucun produit disponible hors-ligne pour le moment.</div>';
        } else {
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = "bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-300";
                
                const prixBarreStr = p.prixBarre ? \`<span class="line-through text-neutral-400 mr-2 text-xs">\${p.prixBarre.toLocaleString()}   FCFA</span>\` : '';
                const mainImg = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
                const premiumBadge = p.partenaire && p.partenaire !== "Boutique en Direct" 
                    ? \`<span class="bg-amber-100 text-[#b8901c] text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm">Exclusivité Club</span>\`
                    : \`<span class="bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm">En Stock Direct</span>\`;

                card.innerHTML = \`
                    <div class="relative aspect-square overflow-hidden bg-neutral-100">
                        <img src="\${mainImg}" alt="\${p.nom}" class="w-full h-full object-cover" />
                    </div>
                    <div class="p-4 flex flex-col justify-between flex-grow">
                        <div>
                            <span class="text-[9px] text-[#b8901c] font-bold tracking-widest uppercase">\${p.categorie}</span>
                            <h3 class="font-extrabold text-neutral-900 text-sm mt-0.5 leading-tight uppercase">\${p.nom}</h3>
                            <p class="text-neutral-500 text-xs leading-normal mt-2 line-clamp-3">\${p.description}</p>
                        </div>
                        <div class="mt-4 border-t border-neutral-100 pt-3 flex flex-col gap-2">
                            <div class="flex items-baseline justify-between">
                                <span class="font-bold text-neutral-950 text-sm">\${p.prix.toLocaleString()} FCFA</span>
                                \${prixBarreStr}
                            </div>
                            <div class="flex justify-between items-center mt-1">
                                \${premiumBadge}
                                <span class="text-[10px] text-neutral-400 font-semibold uppercase">Togo 🇹🇬</span>
                            </div>
                        </div>
                    </div>
                \`;
                grid.appendChild(card);
            });
        }
    </script>
</body>
</html>`;

    // Download file flow
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "asime-togo-catalogue-offline.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("✓ Catalogue interactif autonome téléchargé pour ouverture hors-ligne !");
  };

  // Automated deep-linking parser effect
  useEffect(() => {
    if (products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get("product") || params.get("prod");
    if (prodId) {
      const found = products.find(p => p.id === prodId || p.id === String(prodId));
      if (found) {
        setSelectedProduct(found);
        setCurrentGalleryIndex(0);
        setActiveTab("catalogue");
        
        // Clean up URL query parameters discretely to ensure clean bookmarks
        try {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (err) {
          console.warn("Could not sweep URL query string state", err);
        }
      }
    }
  }, [products]);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setProductReviews(data);
      }
    } catch (e) {
      console.error("Error fetching reviews", e);
    }
  };

  const syncLocalDataWithServer = async () => {
    try {
      // 1. Sync Logo and Settings
      const localLogoId = safeLocalStorage.getItem("asime-active-logo-id");
      const localWhatsapp = safeLocalStorage.getItem("asime_whatsapp_merchant_number");
      
      // Load server settings first
      let serverSettings = { whatsappMerchantNumber: "22890000000", activeLogoId: "monogramme_plume" };
      try {
        const settingsRes = await fetch("/api/settings?t=" + Date.now());
        if (settingsRes.ok) {
          serverSettings = await settingsRes.json();
        }
      } catch (err) {
        console.error("Failed to fetch server settings:", err);
      }
      
      // Self-healing check: If the server settings are default values, but the user has custom settings
      // cached in their browser, synchronize the local settings to the server so they aren't lost on redeployment!
      const isServerDefault = serverSettings.whatsappMerchantNumber === "22890000000" && serverSettings.activeLogoId === "monogramme_plume";
      const hasCustomLocalSettings = (localLogoId && localLogoId !== "monogramme_plume") || (localWhatsapp && localWhatsapp !== "22890000000");
      
      if (isServerDefault && hasCustomLocalSettings) {
        console.log("🔄 Self-healing: restoring custom browser settings to the restarted server container...");
        try {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auth: "asime2026",
              whatsappMerchantNumber: localWhatsapp || "22890000000",
              activeLogoId: localLogoId || "monogramme_plume"
            })
          });
          // Update the serverSettings representation so we use it
          serverSettings.activeLogoId = localLogoId || "monogramme_plume";
          serverSettings.whatsappMerchantNumber = localWhatsapp || "22890000000";
        } catch (postErr) {
          console.error("Failed to restore settings to server:", postErr);
        }
      }
      
      // Update our local state and configuration with the server settings
      if (serverSettings.activeLogoId) {
        setActiveLogoId(serverSettings.activeLogoId);
        // Ensure local storage is kept in sync as cache
        safeLocalStorage.setItem("asime-active-logo-id", serverSettings.activeLogoId);
      }
      if (serverSettings.whatsappMerchantNumber) {
        ASIME_SETTINGS.WHATSAPP_MERCHANT_NUMBER = serverSettings.whatsappMerchantNumber;
        safeLocalStorage.setItem("asime_whatsapp_merchant_number", serverSettings.whatsappMerchantNumber);
      }
      
      // Clear any stale local emulated databases so that the browser is forced to download the fresh official database from the server
      safeLocalStorage.removeItem("asime_emulated_products");
      safeLocalStorage.removeItem("asime_emulated_partners");
      safeLocalStorage.removeItem("asime_emulated_blogs");
    } catch (e) {
      console.error("Error in syncLocalDataWithServer:", e);
    }
  };

  // Load products & blogs from server API
  useEffect(() => {
    const initializeAndSync = async () => {
      await syncLocalDataWithServer();
      await fetchProducts();
      await fetchBlogs();
      await fetchPartners();
      await fetchReviews();
    };
    initializeAndSync();
    
    // Load cart from LocalStorage
    const savedCart = localStorage.getItem("asime_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
  }, []);

  // Save cart to LocalStorage when changed
  useEffect(() => {
    localStorage.setItem("asime_cart", JSON.stringify(cart));
  }, [cart]);

  const getProductRedirectDetails = (product: Product) => {
    const matchedPartner = partners.find(p => p.name.toLowerCase() === (product.partenaire || "").toLowerCase());
    
    // Default fallback url (if standard affiliate)
    let url = product.lienAffilie || "https://s.click.aliexpress.com/e/_DdYxyz";
    let isWhatsapp = false;
    let partnerPhone = "";
    
    if (matchedPartner) {
      if (matchedPartner.contractType === "subscription" && matchedPartner.contactPhone) {
        // Build Whatsapp text
        const text = `Bonjour ${matchedPartner.name}, je souhaite commander votre produit "${product.nom}" (${product.prix.toLocaleString("fr-FR")} F CFA) aperçu sur la vitrine Asime ! 🇹🇬✨ \nLien : ${window.location.origin}?product=${product.id}`;
        url = `https://wa.me/${matchedPartner.contactPhone}?text=${encodeURIComponent(text)}`;
        isWhatsapp = true;
        partnerPhone = matchedPartner.contactPhone;
      }
    }
    
    return { url, isWhatsapp, partnerPhone, matchedPartner };
  };

  // Redirect Countdown Effect
  useEffect(() => {
    if (!redirectingProduct) return;
    if (redirectCount <= 0) {
      const { url } = getProductRedirectDetails(redirectingProduct);
      window.open(url, "_blank");
      setRedirectingProduct(null);
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCount(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectingProduct, redirectCount]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Error fetching products", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
    } catch (e) {
      console.error("Error fetching partners list in storefront", e);
    }
  };

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const res = await fetch("/api/blogs?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (e) {
      console.error("Error fetching blogs", e);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // Helper to format currency in FCFA
  const formatFCFA = (amount: number | null) => {
    if (amount === null || isNaN(amount)) return "";
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  // Cart Management
  const addToCart = (product: Product, quantitySelected = 1) => {
    const matchedPartner = partners.find(p => p.name.toLowerCase() === (product.partenaire || "").toLowerCase());
    const needsRedirect = product.partenaire && product.partenaire !== "Boutique en Direct" && (
      (matchedPartner && matchedPartner.contractType === "subscription" && matchedPartner.contactPhone) || 
      product.lienAffilie
    );

    if (needsRedirect) {
      setRedirectingProduct(product);
      setRedirectCount(3);
      return;
    }
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      // Validate with stock limits
      const updatedQty = existing.quantity + quantitySelected;
      if (updatedQty > product.stock) {
        alert(`Stock insuffisant. Maximum disponible : ${product.stock} unités.`);
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: updatedQty } : item));
    } else {
      setCart([...cart, { product, quantity: quantitySelected }]);
    }
    // Simple visual feedback
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 600);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    const item = cart.find(i => i.product.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCartItemToDeleteId(id);
    } else {
      // Check stock
      if (newQty > item.product.stock) {
        alert(`Stock insuffisant. Unités disponibles : ${item.product.stock}`);
        return;
      }
      setCart(cart.map(i => i.product.id === id ? { ...i, quantity: newQty } : i));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
    if (cartItemToDeleteId === id) {
      setCartItemToDeleteId(null);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // --- Modular Payment & WhatsApp Checkout Flow ---
  const handleCheckoutWhatsAppState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutQuartier.trim()) {
      alert("Veuillez remplir toutes les informations de livraison.");
      return;
    }

    // Get active affiliate referral tracking if any
    let affiliateRef = localStorage.getItem("asime_affiliate_ref");
    const affiliateTimestampStr = localStorage.getItem("asime_affiliate_timestamp");
    if (affiliateRef && affiliateTimestampStr) {
      const timestamp = Number(affiliateTimestampStr);
      // Valid for 30 days maximum
      if (Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem("asime_affiliate_ref");
        localStorage.removeItem("asime_affiliate_timestamp");
        affiliateRef = null;
      }
    }

    let orderId = "";
    let orderData: any = null;

    // 1. Create order in the backend database
    try {
      const orderPayload = {
        items: cart.map(item => ({
          product: {
            id: item.product.id,
            nom: item.product.nom,
            prix: item.product.prix,
            vendeurId: item.product.vendeurId || "assisted_merchant"
          },
          quantity: item.quantity
        })),
        totalAmount: getCartTotal(),
        shippingDetails: {
          name: checkoutName.trim(),
          phone: checkoutPhone.trim(),
          quartier: checkoutQuartier.trim(),
          notes: `Commande sécurisée payée par ${checkoutPayment} via Asime Gateway.`
        },
        paymentMethod: checkoutPayment,
        affiliateRef: affiliateRef || undefined
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": token } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const orderResult = await res.json();
      if (orderResult.success) {
        orderId = orderResult.order.id;
        orderData = orderResult.order;
        setCreatedOrder(orderResult.order);
      } else {
        alert(`Erreur d'enregistrement de commande: ${orderResult.error}`);
        return;
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Une erreur est survenue lors de la création de la commande.");
      return;
    }

    // 2. Map chosen payment method to Provider ID
    let providerId = "";
    if (checkoutPayment === "EnLigne" || checkoutPayment === "PayDunya") {
      providerId = "paydunya";
    }

    // If Cash on Delivery, bypass online gateway and redirect to WhatsApp immediately
    if (checkoutPayment === "Espèces" || !providerId) {
      // Clear active affiliate referral after a converted sale
      localStorage.removeItem("asime_affiliate_ref");
      localStorage.removeItem("asime_affiliate_timestamp");

      // Build the order message text
      let message = `*✨ NOUVELLE COMMANDE ASIME (Paiement à la livraison) ✨*\n\n`;
      message += `🆔 *Commande :* \`${orderId}\`\n`;
      message += `👤 *Client :* ${checkoutName.trim()}\n`;
      message += `📞 *Téléphone :* ${checkoutPhone.trim()}\n`;
      message += `📍 *Quartier :* ${checkoutQuartier.trim()}\n`;
      message += `💳 *Paiement :* Espèces à la livraison (COD)\n`;
      message += `🔗 *Suivi de commande :* ${window.location.origin}/?track=${orderId}\n\n`;
      message += `*🛒 Articles commandés :*\n`;
      
      cart.forEach((item, index) => {
        const lineCost = item.product.prix * item.quantity;
        message += `${index + 1}. *${item.product.nom}* (x${item.quantity}) - ${formatFCFA(lineCost)}\n`;
      });

      message += `\n*━━━━━━━━━━━━━━━━━━━━━*\n`;
      message += `💰 *TOTAL À PAYER :* *${formatFCFA(getCartTotal())}*\n`;
      message += `*━━━━━━━━━━━━━━━━━━━━━*\n\n`;
      message += `Veuillez confirmer ma livraison s'il vous plaît. Merci ! 🙏🇹🇬`;

      const encodedText = encodeURIComponent(message);
      const merchantPhone = ASIME_SETTINGS.WHATSAPP_MERCHANT_NUMBER;
      const whatsappUrl = `https://wa.me/${merchantPhone}?text=${encodedText}`;
      
      setCart([]);
      setIsCartOpen(false);
      showToast("✓ Commande enregistrée ! Redirection WhatsApp...");
      
      const opened = window.open(whatsappUrl, "_blank");
      if (!opened) {
        window.location.href = whatsappUrl;
      }
      return;
    }

    // 3. Initiate Online Payment with the Selected Provider
    try {
      showToast("Paiement en cours d'initialisation...");
      const payRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": token } : {})
        },
        body: JSON.stringify({
          orderId,
          providerId,
          name: checkoutName.trim(),
          phone: checkoutPhone.trim()
        })
      });

      const payData = await payRes.json();
      if (payData.success) {
        setPaymentSession(payData.session);
        setIsPaymentModalOpen(true);
        setIsCartOpen(false); // Close cart sidebar
        showToast("✓ Session de paiement ouverte !");
      } else {
        alert(`Erreur de paiement : ${payData.error}`);
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Impossible de contacter le service de paiement.");
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }
    // Simulate API delivery
    setContactSent(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
      setContactSent(false);
      alert("Votre message a été transmis avec succès à l'équipe Asime !");
    }, 1200);
  };

  // Filters logic
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Toutes" || prod.categorie === selectedCategory;
    const matchesPrice = prod.prix <= priceRange;
    const matchesStock = !onlyInStock || prod.stock > 0;
    const matchesPromo = !onlyPromo || (prod.prixBarre && prod.prixBarre > prod.prix);
    const matchesPartner = selectedPartnerFilter === "Tous" || prod.partenaire === selectedPartnerFilter;
    return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesPromo && matchesPartner;
  }).sort((a, b) => {
    if (sortBy === "asc") return a.prix - b.prix;
    if (sortBy === "desc") return b.prix - a.prix;
    if (sortBy === "newest") {
      // Larger numeric ID means more recently added to the catalog
      const numA = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
      if (numA !== numB) return numB - numA; // Newest (larger IDs) first
      return b.id.localeCompare(a.id);
    }
    if (sortBy === "popular") {
      // Deterministic scoring representing popularity index
      const getPopularityScore = (prod: Product) => {
        let score = 0;
        if (prod.phare) score += 1000; // featured is highly popular
        if (prod.prixBarre) score += 300; // promo discount is popular
        if (prod.stock > 0 && prod.stock < 30) score += 150; // scarcity demands
        // Deterministic stable key to avoid random re-renders
        let sum = 0;
        for (let i = 0; i < prod.id.length; i++) {
          sum += prod.id.charCodeAt(i);
        }
        score += (sum % 100);
        return score;
      };
      return getPopularityScore(b) - getPopularityScore(a); // Most popular first
    }
    return 0; // default order based on index/id
  });

  const categoriesList = [
    "Toutes",
    "Ustensiles de cuisine",
    "Meubles & Décoration",
    "Électronique",
    "Audio & Radio",
    "Gadgets électroniques",
    "Télévision",
    "Mode & beauté",
    "Bébé & Enfant",
    "Sports & Accessoires",
    "Univers femme",
    "Univers homme"
  ];

  if (gatewayParams) {
    return (
      <SimulatedPaymentPortal
        tx={gatewayParams.tx}
        provider={gatewayParams.provider}
        onClose={() => {
          setGatewayParams(null);
          try {
            window.history.replaceState({}, document.title, "/");
          } catch (e) {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 font-sans bg-[#FAF9F6] text-neutral-900 selection:bg-gold-500 selection:text-white">
      {/* Dynamic Gold Announcement Bar */}
      <div className="bg-neutral-950 text-white py-2 px-4 text-xs tracking-widest text-center uppercase font-semibold border-b border-gold-500/25 flex items-center justify-center gap-1 sm:gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
        <span>{t("banner_promo")}</span>
        <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
      </div>

      {/* Modern Luxury Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5] backdrop-blur-md shadow-xs border-b border-[#EAE3D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo Brand Design */}
          <div 
            onClick={() => {
              setActiveTab("accueil");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            {renderLogoNode("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14")}
            <div className="flex flex-col justify-center">
              <span className="font-sans font-black tracking-[0.1em] text-base sm:text-xl md:text-2xl text-[#0F5132] uppercase leading-none">
                ASIME
              </span>
              <p className="text-[9.5px] sm:text-xs md:text-sm text-[#C89D34] font-serif italic font-bold leading-tight mt-0.5 tracking-wide leading-tight">
                {t("slogan")}
              </p>
            </div>
          </div>

          {/* Center Search Bar - Desktop Model */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md xl:max-w-lg mx-2 lg:mx-6 relative items-center">
            <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "catalogue") {
                  setActiveTab("catalogue");
                }
              }}
              placeholder={t("search_placeholder")}
              className="block w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm border border-stone-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 rounded-sm bg-white font-sans text-neutral-800 placeholder-neutral-400 focus:outline-[#d4af37] shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Actions Menu Right: Share (Desktop only), Language, Login Pill & Circular Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Share Button (Desktop md+ only, removed from mobile header) */}
            <button 
              type="button"
              onClick={() => setIsShareDownloadOpen(true)}
              className="hidden md:flex bg-[#F0EAE0] border border-[#E1D6C5] hover:bg-[#EBE2D3] text-[#C89D34] rounded-full p-2.5 shadow-2xs transition-all cursor-pointer items-center justify-center shrink-0"
              title="Partager le site ou Télécharger le catalogue"
              id="header-share-app-btn"
            >
              <Share2 className="w-4 h-4 text-[#C89D34]" />
            </button>

            {/* Language Selection Button (Visible on all devices) */}
            <button
              type="button"
              onClick={() => setLanguage(language === "fr" ? "ee" : "fr")}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#F0EAE0] border border-[#E1D6C5] hover:bg-[#EBE2D3] text-[#0F5132] rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-2xs transition-all cursor-pointer font-sans shrink-0"
              title={language === "fr" ? "Passer en Ewe (Eʋegbe)" : "Passer en Français"}
              id="header-language-toggle-btn"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F5132]" />
              <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-[#0F5132]">
                {language === "fr" ? "EWE" : "FR"}
              </span>
            </button>

            {/* Account / Connexion Pill Button */}
            {user ? (
              <button
                onClick={() => {
                  setEditName(user.name);
                  setEditPhone(user.phone || "");
                  setEditQuartier(user.quartier || "");
                  setIsProfileOpen(true);
                }}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-[#C89D34] bg-transparent hover:bg-[#C89D34]/10 text-[#C89D34] rounded-full flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-all shadow-2xs shrink-0 font-sans"
                title="Espace Client - Mon Compte"
                id="header-user-profile-btn"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C89D34]" />
                <span className="text-[10px] sm:text-xs font-extrabold tracking-wider uppercase text-[#C89D34] truncate max-w-[60px] sm:max-w-[90px]">{user.name.split(" ")[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setIsAuthOpen(true);
                }}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-[#C89D34] bg-transparent hover:bg-[#C89D34]/10 text-[#C89D34] rounded-full flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs shrink-0 font-sans"
                title="Se connecter / S'inscrire"
                id="header-user-login-btn"
              >
                <User className="w-3.5 h-3.5 text-[#C89D34]" />
                <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-[#C89D34]">{t("login_btn")}</span>
              </button>
            )}

            {/* Shopping Cart Trigger - Guaranteed visibility on mobile */}
            <motion.button 
              animate={isCartBouncing ? { scale: [1, 1.25, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              onClick={() => setIsCartOpen(true)}
              className="relative bg-neutral-950 hover:bg-neutral-900 text-[#D4AF37] w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-neutral-800 cursor-pointer shrink-0"
              title="Mon Panier"
              id="header-cart-btn"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
              {getCartCount() > 0 && (
                <div className="absolute -top-1 -right-1 min-w-4 sm:min-w-5 h-4 sm:h-5 bg-[#C81E1E] border-2 border-white text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
                  {getCartCount()}
                </div>
              )}
            </motion.button>
          </div>

        </div>
      </header>

      {/* --- Refined Sub Navigation Ribbon across all devices (Accueil, Catalogue, Blog, Contact) --- */}
      <div className="sticky top-[73px] md:top-[76px] z-30 bg-neutral-950 text-neutral-300 py-2.5 px-4 border-b border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-10 md:gap-16 text-[11px] sm:text-xs md:text-sm uppercase font-bold tracking-widest">
          <button 
            onClick={() => {
              setActiveTab("accueil");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
            className={`py-1 px-2 md:px-4 transition-all cursor-pointer bg-transparent border-b-2 ${
              activeTab === "accueil" 
                ? "text-[#d4af37] border-[#d4af37] font-black" 
                : "text-neutral-400 hover:text-white border-transparent"
            }`}
          >
            {t("nav_home")}
          </button>

          <button 
            onClick={() => {
              setActiveTab("catalogue");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
            className={`py-1 px-2 md:px-4 transition-all cursor-pointer bg-transparent border-b-2 ${
              activeTab === "catalogue" 
                ? "text-[#d4af37] border-[#d4af37] font-black" 
                : "text-neutral-400 hover:text-white border-transparent"
            }`}
          >
            {t("nav_catalog")}
          </button>

          <button 
            onClick={() => {
              setActiveTab("blog");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
            className={`py-1 px-2 md:px-4 transition-all cursor-pointer bg-transparent border-b-2 ${
              activeTab === "blog" 
                ? "text-[#d4af37] border-[#d4af37] font-black" 
                : "text-neutral-400 hover:text-white border-transparent"
            }`}
          >
            {t("nav_blog")}
          </button>

          <button 
            onClick={() => {
              setActiveTab("contact");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
            className={`py-1 px-2 md:px-4 transition-all cursor-pointer bg-transparent border-b-2 ${
              activeTab === "contact" 
                ? "text-[#d4af37] border-[#d4af37] font-black" 
                : "text-neutral-400 hover:text-white border-transparent"
            }`}
          >
            {t("nav_contact")}
          </button>
        </div>
      </div>

      {/* --- Responsive Mobile Search Sticky Ribbon --- */}
      <div className="md:hidden sticky top-[108px] z-20 bg-[#FAF8F5] px-4 py-2 border-b border-stone-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== "catalogue") {
                setActiveTab("catalogue");
              }
            }}
            placeholder={t("search_placeholder")}
            className="block w-full pl-8 pr-7 py-1.5 text-xs border border-stone-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 rounded-sm bg-white font-sans text-neutral-800 placeholder-neutral-400 focus:outline-[#d4af37]"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery("")} 
              className="absolute inset-y-0 right-2.5 flex items-center text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT SPACE OVERVIEW */}
      <motion.main 
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="flex-grow"
      >
        {activeTab === "accueil" && (
          <div className="w-full overflow-hidden">
            {/* Stunning Custom Welcoming Banner: Minimalist, Premium Animated Miawoezon */}
            <div className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white text-center py-10 px-4 relative overflow-hidden flex flex-col items-center justify-center border-b border-[#d4af37]/30 shadow-sm">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center justify-center gap-1 sm:gap-2.5 select-none"
                >
                  { "MIAWOEZON".split("").map((letter, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: 1, 
                        y: [0, -8, 0],
                        color: ["#ffffff", "#e5c158", "#ffffff"]
                      }}
                      transition={{
                        delay: index * 0.08,
                        y: {
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 2.0,
                          ease: "easeInOut",
                          delay: index * 0.12
                        },
                        opacity: { duration: 0.4, delay: index * 0.08 },
                        color: {
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 2.5,
                          ease: "easeInOut",
                          delay: index * 0.15
                        }
                      }}
                      className="font-display text-4xl sm:text-7xl font-extrabold tracking-widest text-white drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]"
                    >
                      {letter}
                    </motion.span>
                  )) }
                </motion.div>
                <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent rounded-full mt-3 opacity-80"></div>
              </div>
            </div>
            <div className="bg-stone-50 py-8 border-b border-stone-200">
              <div className="max-w-7xl mx-auto px-4 select-none">
                
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl border border-neutral-100 bg-neutral-900 group/carousel">
                  
                  {/* Outer active slide screen */}
                  <div className="relative w-full h-[320px] sm:h-[380px] md:h-[400px] flex items-center overflow-hidden transition-all duration-700">
                    
                    {/* Dynamic Slides Render */}
                    {promoSlides.map((slide, index) => {
                      const isFr = language === "fr";
                      const isActive = currentPromoSlide === index;

                      return (
                        <div 
                          key={slide.id}
                          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex flex-col md:flex-row items-center justify-between ${
                            isActive ? "opacity-100 translate-x-0 z-10" : "opacity-0 translate-x-full -z-10 pointer-events-none"
                          }`}
                          style={{ background: slide.bgGradient }}
                        >
                          {/* Left: Text & CTA Promo Content */}
                          <div className="p-6 sm:p-10 md:w-3/5 text-left flex flex-col justify-center h-full space-y-3 sm:space-y-4 relative z-10">
                            <div className="flex items-center gap-2.5">
                              <div className="bg-[#C89D34] text-stone-950 font-sans font-black tracking-widest text-[9px] uppercase px-2.5 py-1 rounded-sm shadow-xs">
                                {isFr ? slide.badgeTagFr : slide.badgeTagEe}
                              </div>
                              <span className="bg-white/10 border border-white/20 text-[#D4AF37] px-2.5 py-0.5 text-[8px] font-bold rounded-sm tracking-widest uppercase">
                                {isFr ? slide.badgeSubFr : slide.badgeSubEe}
                              </span>
                            </div>

                            <div className="space-y-1 sm:space-y-1.5">
                              <h4 className="font-mono text-[10px] sm:text-xs text-amber-200/90 font-bold uppercase tracking-wider leading-none">
                                {isFr ? slide.subtitleFr : slide.subtitleEe}
                              </h4>
                              <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-wide">
                                {isFr ? slide.titleFr : slide.titleEe}
                              </h3>
                            </div>

                            {/* Stunner Large Promo Highlighting Card */}
                            <div className="bg-gradient-to-r from-[#C89D34] via-[#D4AF37] to-amber-600 border border-yellow-300 p-3 sm:p-4 rounded-md shadow-xl relative overflow-hidden max-w-md">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-white/15 rounded-full blur-xl"></div>
                              <p className="font-display font-black text-stone-950 text-xl sm:text-3xl tracking-tight leading-none uppercase">
                                {isFr ? slide.offerMainFr : slide.offerMainEe}
                              </p>
                              <p className="font-sans font-bold text-stone-900 text-[10px] sm:text-xs tracking-wider uppercase mt-1">
                                {isFr ? slide.offerSubFr : slide.offerSubEe}
                              </p>
                            </div>

                            <p className="text-[10px] sm:text-xs text-neutral-200 max-w-sm leading-relaxed font-sans hidden sm:block">
                              {isFr ? slide.descFr : slide.descEe}
                            </p>

                            <div className="pt-2">
                              <button 
                                onClick={() => {
                                  if (slide.categoryTarget && slide.categoryTarget !== "Tous") {
                                    setSelectedCategory(slide.categoryTarget);
                                  } else {
                                    setSelectedCategory("Tous");
                                  }
                                  setSearchQuery(slide.searchQuery || "");
                                  setActiveTab("catalogue");
                                  window.scrollTo({ top: 350, behavior: "smooth" });
                                }}
                                className="bg-[#C89D34] hover:bg-amber-500 text-stone-950 font-sans text-[10px] sm:text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-md transition-all shadow-md active:scale-95 duration-200 cursor-pointer"
                              >
                                {isFr ? slide.buttonTextFr : slide.buttonTextEe}
                              </button>
                            </div>
                          </div>

                          {/* Right Side visual representation (Exact 500x500px 1:1 image container) */}
                          <div className="hidden md:flex md:w-2/5 w-full h-1/2 md:h-full relative overflow-hidden items-center justify-center shrink-0 p-4">
                            <div className="relative w-full h-[260px] md:h-[300px] flex items-center justify-center">
                              <img 
                                src={slide.imageUrl} 
                                alt={slide.imageAlt} 
                                className="w-full h-full rounded-xl object-cover shadow-2xl border-2 border-[#C89D34]/40"
                              />
                              {(slide.overlayLabelFr || slide.overlayLabelEe) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl flex items-end p-3">
                                  <span className="font-sans text-xs font-black text-[#C89D34] uppercase tracking-widest">
                                    {isFr ? slide.overlayLabelFr : slide.overlayLabelEe}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  </div>

                  {/* Manual Arrow Controls (Hover Highlight) */}
                  <button 
                    onClick={() => {
                      setCurrentPromoSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 border border-white/10 flex items-center justify-center text-white z-20 cursor-pointer backdrop-blur-xs transition-colors hidden group-hover/carousel:flex"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentPromoSlide((prev) => (prev + 1) % promoSlides.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 border border-white/10 flex items-center justify-center text-white z-20 cursor-pointer backdrop-blur-xs transition-colors hidden group-hover/carousel:flex"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Indicators / Progress dots */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/25 px-3 py-1.5 rounded-full backdrop-blur-md">
                    {promoSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPromoSlide(index)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          currentPromoSlide === index 
                            ? "w-6 h-2.5 bg-[#d4af37]" 
                            : "w-2.5 h-2.5 bg-neutral-450 hover:bg-neutral-300"
                        }`}
                        title={`Slide ${index + 1}`}
                      ></button>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/70 via-stone-50 to-emerald-50/45 py-10 md:py-16 px-4 border-b border-stone-200">
              {/* Natural background organic blurs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/40 rounded-full blur-2xl -z-10"></div>
              
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Earthy Typography & Direct Action */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <p className="text-[11px] sm:text-xs tracking-wider text-emerald-800 font-bold uppercase">{language === "fr" ? "Terroir Solidaire du Togo 🇹🇬" : "Togo-tɔwo ƒe Dzesi Kple Anyigba 🇹🇬"}</p>
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-neutral-900">
                      {language === "fr" ? (
                        <>Le Meilleur de Nos <span className="text-emerald-850 underline decoration-emerald-200 decoration-wavy block sm:inline">Producteurs Locaux</span> chez Vous.</>
                      ) : (
                        <>Mía dɔwɔlawo ƒe <span className="text-emerald-850 underline decoration-emerald-200 decoration-wavy block sm:inline">Adzɔnu Nyuitɔwo</span> le wò Aƒeme.</>
                      )}
                    </h1>
                    
                    <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed font-sans">
                      {language === "fr" 
                        ? "Savourez le miel brut sauvage des forêts de Kpalimé, offrez à votre corps l’hydratation pure du beurre de karité de Tandjouaré, et garnissez votre table de nos paniers maraîchers ultra-frais cueillis le jour-même à Lomé et Kovié." 
                        : "Kpɔ kpeɖodzi tso Kpalimé ƒe anyitsi nyuitɔ me, Tandjouaré ƒe karité ami kple Lomé / Kovié ƒe nududu fafɛwo katã gbesiagbe."
                      }
                    </p>

                    {/* Dynamic Search & Fast Filter Bar */}
                    <div className="w-full max-w-xl bg-white rounded-none p-1.5 shadow-md border-2 border-emerald-800 focus-within:ring-4 focus-within:ring-emerald-700/10 transition-shadow">
                      <div className="flex">
                        <input 
                          type="text" 
                          placeholder={language === "fr" ? "Rechercher un produit local... (ex. Miel sauvage, Karité, Hibiscus)" : "Dii adzɔnu aɖe... (ex. Anyitsi, Karité, Hibiscus)"} 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-grow px-3 py-2 text-neutral-900 bg-transparent outline-none text-xs sm:text-sm placeholder-neutral-400 font-medium"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setActiveTab("catalogue");
                            }
                          }}
                        />
                        <button 
                          onClick={() => setActiveTab("catalogue")}
                          className="bg-emerald-800 hover:bg-emerald-950 text-white px-5 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-300 shrink-0"
                        >
                          Rechercher
                        </button>
                      </div>
                    </div>

                    {/* Interactive suggestions tags */}
                    <div className="flex flex-wrap gap-2 pt-1.5 items-center">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mr-1">Suggestions :</span>
                      {[
                        { name: "🍯 Miel Sauvage", term: "Miel" },
                        { name: "🧴 Karité Brut", term: "Karité" },
                        { name: "🥬 Paniers Frais", category: "Paniers Frais & Épicerie", term: "" },
                        { name: "🧼 Savon Goyave", term: "Savon" },
                        { name: "👕 T-Shirts Togo Vi", category: "Print-on-Demand Localisé", term: "" }
                      ].map((tagItem, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (tagItem.category) setSelectedCategory(tagItem.category);
                            setSearchQuery(tagItem.term);
                            setActiveTab("catalogue");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="bg-white hover:bg-emerald-50 text-neutral-750 hover:text-emerald-800 border border-neutral-200 hover:border-emerald-355 px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer rounded-sm"
                        >
                          {tagItem.name}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Right Column: Beautiful Authentic Local Product Showcase Board */}
                  <div className="lg:col-span-5 relative w-full mt-6 lg:mt-0 px-2 sm:px-0">
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Product Image 1: Honey harvesting / pure amber honey */}
                      <div className="bg-white p-2 border border-neutral-200 shadow-md group cursor-pointer hover:-translate-y-1 transition-transform"
                           onClick={() => { setSearchQuery("Miel"); setSelectedCategory("Made in Togo Premium"); setActiveTab("catalogue"); }}>
                        <div className="aspect-square w-full overflow-hidden bg-stone-100 mb-2">
                          <img 
                            src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400" 
                            alt="Miel Sauvage de Kpalimé" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-tight">Notre Miel Doré</h4>
                        <p className="text-[9.5px] text-stone-500 font-sans leading-tight">100% sauvage, récolté à Kpalimé du plateau forestier.</p>
                      </div>

                      {/* Product Image 2: Organic raw African Shea Butter */}
                      <div className="bg-white p-2 border border-neutral-200 shadow-md md:mt-4 mt-0 group cursor-pointer hover:-translate-y-1 transition-transform"
                           onClick={() => { setSearchQuery("Karité"); setSelectedCategory("Made in Togo Premium"); setActiveTab("catalogue"); }}>
                        <div className="aspect-square w-full overflow-hidden bg-stone-100 mb-2">
                          <img 
                            src="https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=400" 
                            alt="Beurre de Karité de Notsé & Tandjouaré" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-tight">Soin au Karité</h4>
                        <p className="text-[9.5px] text-stone-500 font-sans leading-tight">Pressé par notre coopérative de femmes solidaires.</p>
                      </div>

                      {/* Product Image 3: Colorful Organic Vegetable Basket */}
                      <div className="bg-white p-2 border border-neutral-200 shadow-md md:-mt-4 mt-0 group cursor-pointer hover:-translate-y-1 transition-transform"
                           onClick={() => { setSelectedCategory("Paniers Frais & Épicerie"); setSearchQuery(""); setActiveTab("catalogue"); }}>
                        <div className="aspect-square w-full overflow-hidden bg-[#fbfbf8] mb-2">
                          <img 
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400" 
                            alt="Maraîchage de Kovié fruits et légumes" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-tight">Paniers de Kovié</h4>
                        <p className="text-[9.5px] text-stone-500 font-sans leading-tight">Cueillette du matin, fraîcheur livrée sous 24h à Lomé.</p>
                      </div>

                      {/* Product Image 4: Organic herbal tea & crafts */}
                      <div className="bg-white p-2 border border-neutral-200 shadow-md group cursor-pointer hover:-translate-y-1 transition-transform"
                           onClick={() => { setSearchQuery("Thé"); setSelectedCategory("Made in Togo Premium"); setActiveTab("catalogue"); }}>
                        <div className="aspect-square w-full overflow-hidden bg-stone-100 mb-2">
                          <img 
                            src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=400" 
                            alt="Fleurs d'Hibiscus séchées Bisap" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-tight">Hibiscus & Épices</h4>
                        <p className="text-[9.5px] text-stone-500 font-sans leading-tight">Pour vos infusions et bienfaits naturels au quotidien.</p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Our 3 Pillars Informational Board */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Pillar 1 */}
                <div className="bg-white p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 flex items-center justify-center mb-4 text-xl rounded-sm">
                      🍯
                    </div>
                    <h3 className="font-display font-semibold text-lg text-neutral-900 uppercase tracking-wider mb-2">
                      {language === "fr" ? "Miels & Cosmétiques de Haute Qualité" : "Anyitsi kple Atike Nyuitɔ"}
                    </h3>
                    <p className="text-neutral-600 text-xs leading-relaxed font-sans">
                      {language === "fr" 
                        ? "Liaison directe avec les apiculteurs des Plateaux et les coopératives de beurre de karité. Des matières pures de haute qualité pour votre bien-être."
                        : "Kadjɔ kple anyitsidelawo tso Plateau kple dɔwɔlawo tso karité. Nuviavã tɔxɛwo na wò lanyo."
                      }
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedCategory("Made in Togo Premium"); setSearchQuery(""); setActiveTab("catalogue"); }}
                    className="text-xs uppercase tracking-widest font-bold text-emerald-800 flex items-center gap-1 mt-4 hover:translate-x-1 transition-transform self-start"
                  >
                    <span>{language === "fr" ? "Découvrir" : "Kpɔ kpee"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Pillar 2 */}
                <div className="bg-white p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-xl rounded-sm">
                      🥬
                    </div>
                    <h3 className="font-display font-semibold text-lg text-neutral-900 uppercase tracking-wider mb-2">
                      {language === "fr" ? "Maraîchage Frais d'Ici" : "Agble-Nuku Fafɛwo Tso Afisia"}
                    </h3>
                    <p className="text-neutral-600 text-xs leading-relaxed font-sans">
                      {language === "fr"
                        ? "Paniers maraîchers ultra-frais cultivés localement par des coopératives agricoles familiales pour un goût authentique."
                        : "Agble-Nuku fafɛ tɔxɛ siwo ƒomewo dɔ le afisia be wòanya ɖu."
                      }
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedCategory("Paniers Frais & Épicerie"); setSearchQuery(""); setActiveTab("catalogue"); }}
                    className="text-xs uppercase tracking-widest font-bold text-emerald-800 flex items-center gap-1 mt-4 hover:translate-x-1 transition-transform self-start"
                  >
                    <span>{language === "fr" ? "Découvrir" : "Kpɔ kpee"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Pillar 3 */}
                <div className="bg-white p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-sky-50 text-sky-600 flex items-center justify-center mb-4 text-xl rounded-sm">
                      👕
                    </div>
                    <h3 className="font-display font-semibold text-lg text-neutral-900 uppercase tracking-wider mb-2">
                      {language === "fr" ? "Création & Textures \"Togo Vi\"" : "Aɖaŋudɔ & Avɔ \"Togo Vi\""}
                    </h3>
                    <p className="text-neutral-600 text-xs leading-relaxed font-sans">
                      {language === "fr"
                        ? "Soutien aux créations locales exclusives. T-shirts imprimés et pièces artisanales uniques célébrant l'identité culturelle."
                        : "Kpekpeɖeŋu na míaƒe aɖaŋudɔwɔlawo. T-shirts kple aɖaŋunu tɔxɛ siwo fia míaƒe dekɔnu."
                      }
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedCategory("Print-on-Demand Localisé"); setSearchQuery(""); setActiveTab("catalogue"); }}
                    className="text-xs uppercase tracking-widest font-bold text-emerald-800 flex items-center gap-1 mt-4 hover:translate-x-1 transition-transform self-start"
                  >
                    <span>{language === "fr" ? "Découvrir" : "Kpɔ kpee"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </section>



            {/* --- NEW: Interactive Lookbook / Galerie de l'Artisanat d'Art du Togo --- */}
            <section className="py-8 sm:py-16 bg-stone-100 border-t border-b border-stone-250">
              <div className="max-w-7xl mx-auto px-4">
                
                {/* Section Header */}
                <div className="text-center mb-6 sm:mb-12">
                  <span className="text-emerald-800 text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1.5 sm:mb-2">
                    {language === "fr" ? "Immersion Naturelle & Terroirs" : "Dzɔdzɔme Hame & Anyigba"}
                  </span>
                  <p className="font-display font-black text-xl sm:text-4xl text-neutral-950 uppercase tracking-widest leading-none">
                    {language === "fr" ? "Galerie Locale & Savoir-faire" : "Aɖaŋudɔ Kpɔƒe & Aɖaŋu"}
                  </p>
                  <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-emerald-805 mx-auto mt-2.5 sm:mt-4 rounded-full"></div>
                  <p className="text-[11px] sm:text-sm text-neutral-600 mt-2 sm:mt-4 max-w-2xl mx-auto leading-relaxed font-sans">
                    {language === "fr"
                      ? "Découvrez l'héritage vivant de nos paysans et coopératives à travers nos clichés insolites de récoltes. Cliquez sur une collection pour l'explorer directement dans la boutique."
                      : "Kpɔ míaƒe agbledelawo kple dɔwɔlawo ƒe kesinɔnu gbe bɔbɔe. Zi dzesi aɖe dzi nàge ɖe fiase me."
                    }
                  </p>
                </div>

                {/* Grid Lookbook */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {[
                    {
                      title: language === "fr" ? "Céramiques de Mandouri" : "Mandouri Anyi-Dze",
                      collection: language === "fr" ? "Terre Cuite & Argile" : "Anyi Kple Anyigba",
                      desc: language === "fr" 
                        ? "Des œuvres façonnées en argile brute issues de gisements sacrés de l'extrême Nord du Togo."
                        : "Anyinu siwo wowɔ tso anyigba kɔkɔe me le Togo dzigbe lɔgɔ̃.",
                      image: "https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600",
                      tag: language === "fr" ? "Argile Sacrée" : "Anyi Kɔkɔe",
                      category: "Made in Togo Premium",
                      search: "Argile"
                    },
                    {
                      title: language === "fr" ? "Tissage d'Aného" : "Aného Avɔ-Lɔlɔ̃",
                      collection: language === "fr" ? "Raphia & Fibres Organiques" : "Raphia kple Dzɔdzɔme Kawo",
                      desc: language === "fr"
                        ? "Tressage méticuleux des fibres végétales pour concevoir des sacs et paniers de prestige."
                        : "Kotoku kple kusi siwo woƒo kple dzɔdzɔme kawo na atsyɔ̃.",
                      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600",
                      tag: language === "fr" ? "100% Organique" : "100% Dzɔdzɔme",
                      category: "Made in Togo Premium",
                      search: "Raphia"
                    },
                    {
                      title: language === "fr" ? "Miels de Kpalimé" : "Kpalimé Anyitsi",
                      collection: language === "fr" ? "Nectar Sauvage & Café" : "Anyitsi kple Café",
                      desc: language === "fr"
                        ? "Récoltes biologiques au cœur des forêts denses du plateau du Togo."
                        : "Anyitsi tɔxɛ siwo wodi le Togo Plateaux ƒe aveme.",
                      image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600",
                      tag: language === "fr" ? "Nectar d'Altitude" : "To-dzi Anyitsi",
                      category: "Made in Togo Premium",
                      search: "Miel"
                    },
                    {
                      title: language === "fr" ? "Soin Solidaire" : "Lanyɔ Atike",
                      collection: language === "fr" ? "Karité de Tandjouaré" : "Tandjouaré Karité",
                      desc: language === "fr"
                        ? "L'excellence des huiles pressées à l'état pur par notre collective de femmes solidaires."
                        : "Karité nyuitɔ si nyɔnuwo ƒe asitsakaka dze gɔme le dzigbe.",
                      image: "https://images.unsplash.com/photo-1628144211110-ecd038ea8271?auto=format&fit=crop&q=80&w=600",
                      tag: language === "fr" ? "100% Brut" : "100% Vavã",
                      category: "Made in Togo Premium",
                      search: "Karité"
                    }
                  ].map((look, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        setSelectedCategory(look.category);
                        setSearchQuery(look.search);
                        setActiveTab("catalogue");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group relative h-[210px] sm:h-[350px] lg:h-[380px] w-full rounded-none overflow-hidden border border-neutral-300 shadow-sm cursor-pointer hover:border-emerald-650 hover:shadow-md transition-all duration-350 bg-neutral-900"
                    >
                      {/* Image background with zoom on hover */}
                      <img 
                        src={look.image} 
                        alt={look.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-out opacity-85 group-hover:opacity-60"
                      />
                      
                      {/* Premium Top layout tags */}
                      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 flex gap-2">
                        <span className="bg-emerald-800 text-white border border-emerald-600 text-[7px] sm:text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1">
                          {look.tag}
                        </span>
                      </div>

                      {/* Bottom Overlay Gradient & description */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10 flex flex-col justify-end p-3 sm:p-5 transition-colors group-hover:bg-neutral-950/80">
                        <span className="text-[#d4af37] text-[7px] sm:text-[8.5px] font-extrabold uppercase tracking-widest block mb-0.5 sm:mb-1">
                          {look.collection}
                        </span>
                        <h4 className="font-display font-extrabold text-[#ffffff] text-xs sm:text-lg uppercase tracking-wider leading-tight group-hover:text-emerald-400 transition-colors">
                          {look.title}
                        </h4>
                        <p className="text-neutral-300 text-[10px] sm:text-[11px] leading-relaxed mt-1.5 sm:mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-0 group-hover:max-h-24 overflow-hidden font-sans">
                          {look.desc}
                        </p>
                        
                        <div className="flex items-center gap-1 text-white text-[8px] sm:text-[9.5px] font-bold tracking-widest uppercase mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-neutral-800/60 w-full group-hover:text-emerald-400 transition-colors">
                          <span>{language === "fr" ? "Voir plus" : "Kpɔ kpee"}</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Promotional banner inside the Lookbook section */}
                <div className="mt-8 sm:mt-12 bg-white text-neutral-800 p-4 sm:p-8 rounded-none border border-neutral-250 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(52,211,153,0.05),transparent_40%)] pointer-events-none"></div>
                  <div className="relative z-10 space-y-1 sm:space-y-2 text-center sm:text-left">
                    <span className="bg-emerald-50 text-emerald-800 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 border border-emerald-250 inline-block">
                      {language === "fr" ? "Soutien aux Paysans" : "Kpekpeɖeŋu na Agbledelawo"}
                    </span>
                    <h4 className="font-display font-black text-sm sm:text-xl uppercase tracking-wider text-neutral-900">
                      {language === "fr" ? "Chaque commande soutient le commerce de proximité" : "Nudɔdɔ ɖesiaɖe kpena ɖe asitsala suewo ŋu"}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-neutral-550 font-sans max-w-2xl">
                      {language === "fr" 
                        ? "Chez Asime, plus de 90% du prix des produits de la Coopérative est directement versé aux apiculteurs, horticulteurs et artisans locaux du Togo."
                        : "Le Asime la, asixɔme si wotsɔ nɔa adzɔnuwo ƒlem la ƒe alafa me 90 dzea agbledelawo kple aɖaŋudɔwɔlawo si tẽe le Togo."}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedCategory("Made in Togo Premium"); setSearchQuery(""); setActiveTab("catalogue"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="relative z-10 bg-emerald-800 text-white hover:bg-emerald-900 font-extrabold text-[8px] sm:text-[10px] tracking-widest uppercase px-4 py-2.5 sm:px-6 sm:py-3.5 transition-colors shrink-0 cursor-pointer"
                  >
                    {language === "fr" ? "Découvrir le Terroir" : "Kpɔ Anyigba ƒe Kesinɔnuwo"}
                  </button>
                </div>

              </div>
            </section>

            {/* --- Google AdSense Banner 1 (Leaderboard) --- */}
            <div className="max-w-7xl mx-auto px-4">
              <GoogleAdSenseBanner format="leaderboard" />
            </div>

            {/* --- Garanties & Engagements Section --- */}
            <section className="py-8 sm:py-16 bg-gradient-to-br from-neutral-950 to-neutral-900 border-t-2 border-b-2 border-[#d4af37] text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.08),transparent_50%)] pointer-events-none"></div>
              <div className="max-w-7xl mx-auto px-4 relative z-10">
                
                <div className="text-center mb-6 sm:mb-12">
                  <span className="text-[#d4af37] text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1.5 sm:mb-2">
                    {language === "fr" ? "L'Expérience Asime Togo" : "Asime Togo ƒe Nuteƒekpɔkpɔ"}
                  </span>
                  <h3 className="font-display font-extrabold text-xl sm:text-3xl uppercase tracking-widest text-white">
                    {language === "fr" ? "Pourquoi Commander chez Nous ?" : "Nukaŋuti Nàɖo Nu Mía Gbɔ?"}
                  </h3>
                  <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-[#d4af37] mx-auto mt-2.5 sm:mt-4 rounded-full"></div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-2.5 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
                    {language === "fr" 
                      ? "Nous sélectionnons rigoureusement chaque article du terroir et importons des tendances mondiales exclusives pour vous garantir un service d'excellence sans transition."
                      : "Míetiaa adzɔnu nyuitɔwo katã tẽe eye míenɔa nu yeyewo tsɔm vɛ na wò be nàkpɔ kpekpeɖeŋu nyuitɔ sɔbɔ."}
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                  {[
                    {
                      title: language === "fr" ? "Filières Directes" : "Mɔ Tẽe Kadodowo",
                      desc: language === "fr" 
                        ? "Liaison directe avec les groupements agricoles de Kpalimé et de Notsé pour valoriser l'artisanat togolais en circuit court."
                        : "Kadodo tẽe kple Kpalimé kple Notsé dɔwɔlawo be woado Togo-tɔwo ƒe aɖaŋudɔwo ɖe gã.",
                      icon: <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-[#d4af37]" />
                    },
                    {
                      title: language === "fr" ? "Qualité Certifiée" : "Kpeɖodzi Nyui",
                      desc: language === "fr"
                        ? "Toutes nos importations et produits locaux passent par un contrôle de conformité strict avant d'être référencés."
                        : "Míenɔa dɔwɔnu kple adzɔnu ɖesiaɖe me dzram nyuie be míakpɔ eƒe nyoame dzesi hafi ade fiasã me.",
                      icon: <Check className="w-4 h-4 sm:w-6 sm:h-6 text-[#d4af37]" />
                    },
                    {
                      title: language === "fr" ? "Livraison Omniprésente" : "Nutsɔtsɔ vɛ Afiɖesiaɖe",
                      desc: language === "fr"
                        ? "Service de livraison réactif à domicile sur Lomé sous 24h à 48h, etexpédition sécurisée dans l'ensemble des préfectures."
                        : "Nudɔdɔ kaba yi aƒeme le Lomé le gaƒoƒo 24 vaseɖe 48 me, eye míedɔna adzɔnuwo dedie yi dɔwɔƒewo katã.",
                      icon: <Globe className="w-4 h-4 sm:w-6 sm:h-6 text-[#d4af37]" />
                    },
                    {
                      title: language === "fr" ? "Validation WhatsApp" : "Kpeɖodzi le WhatsApp",
                      desc: language === "fr"
                        ? "Commandez en un clic et finalisez instantanément votre transaction avec notre équipe d'assistance par messagerie WhatsApp."
                        : "Ɖo nudɔdɔ kaba eye nàwu asitsatsa nu enumake kple míaƒe kpekpeɖeŋunalawo le WhatsApp dzi.",
                      icon: <Phone className="w-4 h-4 sm:w-6 sm:h-6 text-[#d4af37]" />
                    }
                  ].map((feat, index) => (
                    <div 
                      key={index} 
                      className="bg-neutral-900/60 p-3 sm:p-5 lg:p-6 border border-neutral-800 rounded-sm hover:border-[#d4af37]/40 transition-all duration-350 shadow-md group"
                    >
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-neutral-950 border border-neutral-800 rounded-sm flex items-center justify-center mb-2 sm:mb-4 group-hover:border-[#d4af37]/50 transition-colors">
                        {feat.icon}
                      </div>
                      <h4 className="font-display text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider text-white mb-1 sm:mb-2">{feat.title}</h4>
                      <p className="text-neutral-400 text-[10px] sm:text-xs leading-normal sm:leading-relaxed font-sans">{feat.desc}</p>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* Featured Section (Produits Phares) */}
            <section className="py-12 bg-neutral-100/60 border-t border-b border-neutral-200/50 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <span className="text-[#d4af37] text-xs font-semibold uppercase tracking-widest">{language === "fr" ? "Sélection Exclusive" : "Adzɔnu Tɔxɛ Kpeɖodzi"}</span>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 uppercase">{t("featured_products")}</h2>
                  </div>
                  <button 
                    onClick={() => { setSelectedCategory("Toutes"); setActiveTab("catalogue"); }}
                    className="bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 px-5 py-2.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 self-start shadow"
                  >
                    <span>{t("explore_catalog")}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm mt-4 text-neutral-500 font-medium">{t("loading")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
                    {products.filter(p => p.phare).slice(0, 4).map(product => {
                      return (
                        <div key={product.id} className="bg-white rounded-none shadow-sm hover:shadow-md border border-neutral-200 overflow-hidden flex flex-col justify-between group transition-all duration-300">
                          {/* Photo container */}
                          <div className="relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer" onClick={() => { setSelectedProduct(product); setCurrentGalleryIndex(0); }}>
                            <img 
                              src={product.images[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300"} 
                              alt={product.nom} 
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                            />

                            {/* Wishlist Heart toggle absolutely-positioned */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              className="absolute top-[48px] right-3 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-[2px] shadow border border-neutral-200/50 hover:bg-white flex items-center justify-center transition-all cursor-pointer pointer-events-auto group/heart"
                              title={user?.favorites?.includes(product.id) ? "Retirer de vos favoris" : "Ajouter à vos favoris"}
                            >
                              <Heart 
                                className={`w-4 h-4 transition-transform duration-300 group-hover/heart:scale-110 ${
                                  user?.favorites?.includes(product.id) 
                                    ? "fill-red-500 text-red-500" 
                                    : "text-neutral-500 hover:text-red-500"
                                }`} 
                              />
                            </button>
                            {/* Stock and Promo Tag */}
                            <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-sm text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                              {product.categorie}
                            </div>
                            {product.prixBarre && (
                              <div className="absolute top-2.5 right-2.5 bg-red-600 text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-sm uppercase tracking-widest">
                                Promo
                              </div>
                            )}
                            {product.partenaire && product.partenaire !== "Boutique en Direct" ? (
                              <div className="absolute bottom-1.5 xs:bottom-3 right-1.5 xs:right-3 bg-neutral-950/95 text-[#d4af37] border border-[#d4af37]/40 font-extrabold px-1 xs:px-2 py-0.5 xs:py-1 text-[6.5px] xs:text-[8px] sm:text-[8.5px] rounded-sm uppercase tracking-widest shadow-md flex items-center gap-1 pb-[3px]">
                                <span className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span>EXCLUSIVITÉ EN LIGNE</span>
                              </div>
                            ) : (
                              product.partenaire && (
                                <div className="absolute bottom-1.5 xs:bottom-3 right-1.5 xs:right-3 bg-neutral-950/90 text-[#d4af37] border border-[#d4af37]/35 px-1 xs:px-2 py-0.5 text-[6.5px] xs:text-[7.5px] sm:text-[8px] font-bold rounded-sm uppercase tracking-widest">
                                  LOCAL EN DIRECT
                                </div>
                              )
                            )}
                          </div>

                          {/* Detail fields */}
                          <div className="p-2.5 xs:p-3 sm:p-4 flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="font-display font-semibold text-neutral-950 text-xs xs:text-sm group-hover:text-[#b8901c] transition-colors line-clamp-1 mb-0.5 sm:mb-1">{product.nom}</h3>
                              <p className="text-neutral-500 text-[10px] xs:text-xs line-clamp-1 sm:line-clamp-2 leading-relaxed mb-2.5 sm:mb-4">{product.description}</p>
                            </div>

                            <div>
                              {/* Spaced slash price solving Issue 4 */}
                              <div className="flex items-baseline mb-2.5 sm:mb-4 flex-wrap gap-1">
                                {product.prixBarre ? (
                                  <>
                                    <span className="line-through text-neutral-400 text-[10px] xs:text-xs font-semibold tracking-wider mr-1 sm:mr-2">
                                      {formatFCFA(product.prixBarre)}
                                    </span>
                                    <span className="font-bold text-[#b8901c] text-xs xs:text-sm tracking-wide">
                                      {formatFCFA(product.prix)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-bold text-neutral-950 text-xs xs:text-sm tracking-wide">
                                    {formatFCFA(product.prix)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => { setSelectedProduct(product); setCurrentGalleryIndex(0); }}
                                  className="w-1/2 text-center border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 py-1.5 xs:py-2 sm:py-2.5 text-[9px] xs:text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-all"
                                >
                                  Détails
                                </button>
                                <button
                                  onClick={() => addToCart(product, 1)}
                                  disabled={product.stock <= 0 && (!product.partenaire || product.partenaire === "Boutique en Direct")}
                                  className={`w-1/2 py-1.5 xs:py-2 sm:py-2.5 text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase transition-all truncate cursor-pointer ${
                                    product.partenaire && product.partenaire !== "Boutique en Direct"
                                      ? "bg-[#b8901c] hover:bg-neutral-950 text-white hover:text-white shadow font-bold"
                                      : product.stock > 0 
                                        ? "bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white" 
                                        : "bg-neutral-200 text-neutral-450 cursor-not-allowed"
                                  }`}
                                >
                                  {product.partenaire && product.partenaire !== "Boutique en Direct" 
                                    ? "Acheter" 
                                    : (product.stock > 0 ? "+ Panier" : "Rupture")}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Quick Promo Banner - Consommer Local */}
            <section className="bg-neutral-900 text-white py-12 px-4 border-t border-b border-[#d4af37]/35">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
                <div className="rounded-sm overflow-hidden w-full md:w-1/3 aspect-[4/3] bg-neutral-800">
                  <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600" 
                    alt="Authentic organic Togo agriculture" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-display font-medium text-lg text-[#d4af37] uppercase tracking-wider mb-2">
                    {language === "fr" ? "Notre engagement pour Lomé" : "Míaƒe kpeɖodzi na Lomé"}
                  </h3>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight mb-4 text-white">
                    {language === "fr" ? "Consommer togolais n'a jamais été aussi simple" : "Anyigbadzinu Togo-tɔwo ɖuɖu sɔbɔ fifia kaba"}
                  </h2>
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-6">
                    {language === "fr" 
                      ? "Faites votre marché en ligne ! Les paniers maraîchers frais sont achetés à flux tendu au marché national pour vous garantir des vitamines et des saveurs incomparables, tandis que nos cosmétiques soutiennent directement des coopératives de femmes rurales au Togo." 
                      : "Wɔ wò asitsatsa le kɔmputazi dzi ! Míatsɔ nuku gbeme tɔwo tẽe tso anyigba gã la dzi be wòasɔ na wò, eye míaƒe ami kple adzɔnuwo kpena ɖe nyɔnu dɔwɔla siwo le Togo dɔwɔƒewo ŋu."}
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setActiveTab("catalogue"); setSelectedCategory("Paniers Frais & Épicerie"); }}
                      className="bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-white transition-colors"
                    >
                      {language === "fr" ? "Voir les Paniers Frais" : "Kpɔ Nuku Gbeme Tɔwo"}
                    </button>
                    <button 
                      onClick={() => setActiveTab("contact")}
                      className="border border-[#d4af37] text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm transition-colors"
                    >
                      {language === "fr" ? "Nous écrire" : "Ŋlɔ Nya Na Mí"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Google AdSense Bottom Horizontal Banner */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
              <GoogleAdSenseBanner format="horizontal" />
            </div>
          </div>
        )}

        {/* TAB 2: CATALOGUE WITH BEAUTIFUL GRID AND ADVANCED FILTERS */}
        {activeTab === "catalogue" && (
          <div className="py-8 px-4 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <span className="text-[#d4af37] text-xs font-semibold tracking-widest uppercase mb-1 block">Découvrez notre collection</span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 uppercase">Le Catalogue Asime</h1>
              <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3"></div>
            </div>

            {/* Filter and Query Tools */}
            <div className="bg-white border border-neutral-150 p-5 rounded-sm shadow-xs mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full overflow-hidden">
                {/* Mobile & Tablet Elegant Space-Saving Dropdown */}
                <div className="block lg:hidden w-full relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-500 uppercase tracking-widest pointer-events-none">
                    Catégorie :
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-[#d4af37]/60 text-white font-sans text-xs font-bold uppercase tracking-widest pl-24 pr-10 py-2.5 appearance-none rounded-sm focus:outline-[#d4af37] cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37] pointer-events-none" />
                </div>

                {/* Desktop Categories selector pills slider (lg screens and up) */}
                <div className="hidden lg:flex w-full lg:max-w-[55%] overflow-x-auto items-center gap-1.5 pb-2 scrollbar-thin scrollbar-thumb-neutral-200 snap-x">
                  {categoriesList.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-widest rounded-full transition-all duration-300 uppercase shrink-0 snap-start border ${
                        selectedCategory === cat 
                          ? "bg-neutral-950 border-neutral-950 text-white shadow-xs" 
                          : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search & Sort inputs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto sm:items-center">
                  {/* Search query input */}
                  <div className="relative flex-grow sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrer par nom..."
                      className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Sort selector */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none font-medium text-xs border border-neutral-300 rounded-sm bg-white pl-3 pr-8 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer"
                    >
                      <option value="default">⭐ Pertinence &amp; Recommandés</option>
                      <option value="newest">✨ Nouveautés &amp; Arrivages</option>
                      <option value="popular">🔥 Popularité &amp; Tendances</option>
                      <option value="asc">📈 Prix : Croissant</option>
                      <option value="desc">📉 Prix : Décroissant</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Price Budget Slider Filter Block */}
              <div className="pt-4 border-t border-neutral-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-705 uppercase tracking-wider">
                  <Filter className="w-3.5 h-3.5 text-[#b8901c]" />
                  <span>Budget Maximum :</span>
                  <span className="text-neutral-950 font-black font-mono ml-1 px-2.5 py-0.5 bg-neutral-100 border border-neutral-300/30 rounded-sm">
                    {formatFCFA(priceRange)}
                  </span>
                </div>
                <div className="flex-grow max-w-lg flex items-center gap-3">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Min (1 000 FCFA)</span>
                  <input 
                    type="range"
                    min="1000"
                    max="150000"
                    step="1000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="flex-grow h-1.5 bg-neutral-200 accent-[#b8901c] rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Max (150K+)</span>
                </div>
                {priceRange < 150000 && (
                  <button
                    onClick={() => setPriceRange(150000)}
                    className="text-[10px] font-black text-[#b8901c] hover:text-neutral-950 uppercase tracking-widest bg-amber-500/10 hover:bg-[#d4af37]/25 px-2.5 py-1 border border-[#d4af37]/20 transition-all rounded-sm"
                  >
                    Réinitialiser le budget
                  </button>
                )}
              </div>

              {/* Advanced Filters Block */}
              <div className="pt-4 border-t border-neutral-150 flex flex-col sm:flex-row flex-wrap items-center gap-4 justify-between">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  {/* Stock Filter Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    <input 
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded-sm accent-[#b8901c] border-neutral-300 focus:ring-[#d4af37]"
                    />
                    <span>{language === "fr" ? "En stock uniquement" : "Eya le dɔ me pɛ"}</span>
                  </label>

                  {/* Promo Filter Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    <input 
                      type="checkbox"
                      checked={onlyPromo}
                      onChange={(e) => setOnlyPromo(e.target.checked)}
                      className="w-4 h-4 rounded-sm accent-[#b8901c] border-neutral-300 focus:ring-[#d4af37]"
                    />
                    <span>{language === "fr" ? "En promotion uniquement" : "Asiɖeɖe tɔxɛwo pɛ"}</span>
                  </label>
                </div>

                {/* Partner selector filter */}
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    {language === "fr" ? "Par Partenaire :" : "Kple dɔwɔla :"}
                  </span>
                  <div className="relative">
                    <select
                      value={selectedPartnerFilter}
                      onChange={(e) => setSelectedPartnerFilter(e.target.value)}
                      className="appearance-none font-bold text-[11px] uppercase tracking-wider border border-neutral-300 rounded-sm bg-stone-50 px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer"
                    >
                      <option value="Tous">{language === "fr" ? "Tous les partenaires" : "Dɔwɔlawo katã"}</option>
                      {Array.from(new Set(products.map(p => p.partenaire).filter(Boolean))).map((partnerName: any) => (
                        <option key={partnerName} value={partnerName}>{partnerName}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Grid View */}
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm mt-4 text-neutral-500">Chargement de votre catalogue avec soin...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-neutral-200 rounded-sm">
                <AlertCircle className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-neutral-900 uppercase">Aucun produit ne correspond</h3>
                <p className="text-neutral-500 text-xs mt-2">Essayez de modifier vos filtres ou réinitialiser votre recherche.</p>
                <button 
                  onClick={() => { setSelectedCategory("Toutes"); setSearchQuery(""); }}
                  className="bg-neutral-950 text-white hover:bg-[#d4af37] px-4 py-2 rounded-sm text-xs mt-4 uppercase tracking-widest font-bold transition-all"
                >
                  Tout réinitialiser
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-500 font-semibold mb-4 uppercase">{filteredProducts.length} produit(s) trouvé(s) disponible(s)</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
                  {filteredProducts.map((product, index) => {
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.45, 
                          delay: Math.min(index * 0.05, 0.4), 
                          ease: [0.25, 0.1, 0.25, 1.0] 
                        }}
                        className="bg-white rounded-none shadow-sm hover:shadow-md border border-neutral-200 overflow-hidden flex flex-col justify-between group transition-all duration-300"
                        id={`product-card-${product.id}`}
                      >
                        
                        {/* Image Frame */}
                        <div className="relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer group/cardimg" onClick={() => { setSelectedProduct(product); setCurrentGalleryIndex(0); }}>
                          <img 
                            src={product.images[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300"} 
                            alt={product.nom} 
                            className="w-full h-full object-cover transition-all duration-500 group-hover/cardimg:scale-105"
                          />

                          {/* Heart wishlist toggle on card corner */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(product.id);
                            }}
                            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-[2px] shadow border border-neutral-200/50 hover:bg-white flex items-center justify-center transition-all cursor-pointer pointer-events-auto group/heart"
                            title={user?.favorites?.includes(product.id) ? "Retirer de vos favoris" : "Ajouter à vos favoris"}
                          >
                            <Heart 
                              className={`w-4 h-4 transition-transform duration-300 group-hover/heart:scale-110 ${
                                user?.favorites?.includes(product.id) 
                                  ? "fill-red-500 text-red-500" 
                                  : "text-neutral-500 hover:text-red-500"
                              }`} 
                            />
                          </button>
                          
                          {/* Sleek Dynamic Choice overlay: Zoom & Quick View */}
                          <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/cardimg:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <button
                              type="button" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setZoomedImage({ url: product.images[0], title: product.nom }); 
                              }}
                              className="bg-white/95 text-neutral-950 hover:bg-neutral-900 hover:text-white backdrop-blur-sm px-3 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow border border-neutral-200 transition-all pointer-events-auto rounded-sm cursor-pointer"
                              title="Zoomer le produit en plein écran"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Zoomer</span>
                            </button>
                            <button
                              type="button" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setQuickViewProduct(product); 
                              }}
                              className="bg-[#d4af37] hover:bg-neutral-950 hover:text-white text-neutral-950 font-black px-3 py-1.5 text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow border border-[#d4af37] transition-all pointer-events-auto rounded-sm cursor-pointer"
                              title="Aperçu rapide du produit"
                            >
                              <Eye className="w-3.5 h-3.5 divide-stone-100" />
                              <span>Aperçu Rapide</span>
                            </button>
                          </div>

                          <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-sm text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                            {product.categorie}
                          </div>
                          {product.prixBarre && (
                            <div className="absolute top-2.5 right-2.5 bg-red-600 text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-sm uppercase tracking-widest">
                              Promo
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold text-neutral-700 uppercase">
                            Stock: {product.stock}
                          </div>
                          {product.partenaire && product.partenaire !== "Boutique en Direct" ? (
                            <div className="absolute bottom-1.5 xs:bottom-2 right-1.5 xs:right-2 bg-neutral-950/95 text-[#d4af37] border border-[#d4af37]/40 font-extrabold px-1 xs:px-2 py-0.5 xs:py-1 text-[6.5px] xs:text-[7.5px] sm:text-[8px] rounded-sm uppercase tracking-widest shadow-md flex items-center gap-1 pb-[3px]">
                              <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-green-500 animate-pulse"></span>
                              <span>EXCLUSIVITÉ EN LIGNE</span>
                            </div>
                          ) : (
                            product.partenaire && (
                              <div className="absolute bottom-1.5 xs:bottom-2 right-1.5 xs:right-2 bg-neutral-950/90 text-[#d4af37] border border-[#d4af37]/35 px-1 xs:px-2 py-0.5 text-[6.5px] xs:text-[7.5px] sm:text-[8px] font-bold rounded-sm uppercase tracking-widest">
                                LOCAL EN DIRECT
                              </div>
                            )
                          )}
                        </div>

                        {/* Title & Price Elements */}
                        <div className="p-2.5 xs:p-3 sm:p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-display font-semibold text-neutral-950 text-xs xs:text-sm group-hover:text-[#b8901c] transition-colors line-clamp-1 mb-0.5 sm:mb-1">{product.nom}</h3>
                            <p className="text-neutral-500 text-[10px] xs:text-xs line-clamp-1 sm:line-clamp-2 leading-relaxed mb-2 sm:mb-3">{product.description}</p>
                          </div>

                          <div>
                            {/* Spaced slashed prices - SOLVES Issue 4 */}
                            <div className="flex items-baseline mb-2 sm:mb-4 flex-wrap gap-1">
                              {product.prixBarre ? (
                                <>
                                  <span className="line-through text-neutral-400 text-[10px] xs:text-xs font-semibold tracking-wider mr-1 sm:mr-2.5">
                                    {formatFCFA(product.prixBarre)}
                                  </span>
                                  <span className="font-bold text-[#b8901c] text-xs xs:text-sm tracking-wide">
                                    {formatFCFA(product.prix)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-neutral-900 text-xs xs:text-sm tracking-wide">
                                  {formatFCFA(product.prix)}
                                </span>
                              )}
                            </div>

                            {product.prixBarre && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAlertProduct(product);
                                }}
                                className="mb-2 w-full text-center text-[8.5px] xs:text-[10px] text-[#b8901c] hover:text-white font-extrabold uppercase tracking-widest flex items-center justify-center gap-1 bg-amber-500/10 hover:bg-[#b8901c] border border-[#d4af37]/35 py-1 rounded-sm cursor-pointer transition-all"
                                title="Recevoir une alerte WhatsApp en cas de baisse de prix"
                              >
                                <Bell className="w-3 h-3 text-[#b8901c] animate-bounce" />
                                <span>Recevoir une Alerte</span>
                              </button>
                            )}

                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <button
                                onClick={() => { setSelectedProduct(product); setCurrentGalleryIndex(0); }}
                                className="flex-grow text-center border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 py-1.5 xs:py-2 sm:py-2.5 text-[9px] xs:text-[10px] sm:text-[11.5px] font-bold tracking-widest uppercase transition-all"
                              >
                                Détails
                              </button>
                              <button
                                onClick={() => addToCart(product, 1)}
                                disabled={product.stock <= 0 && (!product.partenaire || product.partenaire === "Boutique en Direct")}
                                className={`flex-grow py-1.5 xs:py-2 sm:py-2.5 text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase transition-all truncate cursor-pointer ${
                                  product.partenaire && product.partenaire !== "Boutique en Direct"
                                    ? "bg-[#b8901c] hover:bg-neutral-950 text-white hover:text-white shadow font-bold"
                                    : product.stock > 0 
                                      ? "bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white" 
                                      : "bg-neutral-200 text-neutral-450 cursor-not-allowed"
                                }`}
                              >
                                {product.partenaire && product.partenaire !== "Boutique en Direct" 
                                  ? "Acheter" 
                                  : (product.stock > 0 ? "+ Panier" : "Rupture")}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleShareProduct(e, product)}
                                className="p-1.5 sm:p-2.5 border border-neutral-300 hover:border-neutral-950 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all flex items-center justify-center shrink-0 cursor-pointer rounded-none"
                                title="Partager ce produit par lien ou réseaux sociaux"
                                id={`share-product-btn-${product.id}`}
                              >
                                <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BLOGS & SPONSORING & ADVERTISING */}
        {activeTab === "blog" && (
          <div className="py-8 px-4 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <span className="text-[#d4af37] text-xs font-semibold tracking-widest uppercase mb-1 block">Histoires indigènes et conseils</span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 uppercase">Le Journal de Asime</h1>
              <p className="text-neutral-500 text-sm max-w-lg mx-auto mt-2">Découvrez nos analyses exclusives sur l'essor du made in Togo et comment s'habiller d'élégance.</p>
              <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Blogs Stream */}
              <div className="lg:col-span-2 space-y-8">
                {loadingBlogs ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : blogs.length === 0 ? (
                  <p className="text-neutral-500 text-sm">Aucun article n'a encore été publié.</p>
                ) : (
                  blogs.map(post => (
                    <article 
                      key={post.id} 
                      className="bg-white border border-neutral-200 hover:border-[#d4af37]/40 rounded-sm overflow-hidden shadow-xs flex flex-col md:flex-row transition-all hover:shadow-md cursor-pointer group"
                      onClick={() => {
                        if (post.estSponsorise && post.lienSponsorise) {
                          window.open(post.lienSponsorise, "_blank");
                        } else {
                          setSelectedBlog(post);
                        }
                      }}
                    >
                      <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto relative bg-neutral-100 overflow-hidden shrink-0">
                        <img 
                          src={post.image} 
                          alt={post.titre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {post.estSponsorise && (
                          <span className="absolute top-3 left-3 bg-neutral-900 text-[#d4af37] px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest border border-gold-500/30">
                            Sponsorisé
                          </span>
                        )}
                      </div>
                      <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-gold-500" /> {post.auteur}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                          </div>
                          <h2 className="font-display font-bold text-lg text-neutral-950 mb-3 group-hover:text-[#b8901c] transition-colors">{post.titre}</h2>
                          <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4">{post.contenu}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-neutral-100">
                          {post.estSponsorise && post.lienSponsorise ? (
                            <a 
                              href={post.lienSponsorise} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-xs font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-1 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>Profiter de l'Offre Exclusive</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBlog(post);
                              }} 
                              className="text-xs font-bold text-neutral-900 hover:text-[#d4af37] uppercase tracking-widest transition-colors bg-transparent border-none p-0 cursor-pointer"
                            >
                              Lire l'article
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Right Column: Google AdSense & Affiliation Space */}
              <div className="space-y-6">
                
                {/* Simulated Google AdSense Responsive Unit */}
                <div className="bg-neutral-100 border-2 border-dashed border-neutral-300 p-4 text-center rounded-sm">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2">Publicité de Lomé (AdSense)</div>
                  <div className="bg-white p-4 py-8 shadow-xs rounded-sm border border-neutral-200">
                    <span className="text-[#d4af37] text-xs font-bold block mb-1">Gozem Togo</span>
                    <p className="text-[10px] text-neutral-600 mb-4 font-medium leading-relaxed">
                      L'application tout-en-un de transport et livraison de repas à Lomé. Télécharge dès aujourd'hui !
                    </p>
                    <a 
                      href="https://gozem.co/togo/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-block bg-neutral-950 text-white font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 hover:bg-neutral-800 transition-colors"
                    >
                      Découvrir l'App
                    </a>
                  </div>
                </div>

                {/* Simulated Affiliate Deal Plate */}
                <div className="bg-gradient-to-br from-neutral-950 to-neutral-800 text-white p-6 rounded-sm border border-[#d4af37]/35 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-[#d4af37] text-neutral-950 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm">Club VIP Asime</span>
                    <ExternalLink className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-wider mb-2 text-white">Privilèges Fret Groupé & Transit</h4>
                  <p className="text-[11px] text-neutral-300 mb-4 leading-relaxed">
                    Optimisez vos commandes d'Europe et d'Amérique ! Bénéficiez de remises exclusives allant jusqu'à -15% sur nos conteneurs groupés pour expédier n'importe quel colis vers Lomé !
                  </p>
                  <a 
                    href="https://s.click.aliexpress.com/e/_DdYxyz" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="block w-full text-center bg-[#d4af37] text-neutral-950 font-bold uppercase tracking-widest py-2 text-xs transition-transform hover:scale-[1.02] shadow"
                  >
                    Accéder au Service Transit
                  </a>
                </div>

                {/* Customer Satisfaction Card */}
                <div className="bg-white p-5 border border-neutral-200 rounded-sm">
                  <h3 className="font-display font-semibold text-neutral-950 text-xs uppercase tracking-widest mb-3">Besoin d'aide ?</h3>
                  <p className="text-neutral-500 text-xs leading-relaxed mb-4">Une question sur nos produits ou sur le fonctionnement de la validation WhatsApp ? Notre conseiller est disponible 7j/7.</p>
                  <a 
                    href={`https://wa.me/${ASIME_SETTINGS.WHATSAPP_MERCHANT_NUMBER}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 px-4 text-xs font-bold tracking-widest uppercase hover:bg-green-700 transition-colors rounded-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Discuter avec l'équipe</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: CONTACT & MAP CONTAINER */}
        {activeTab === "contact" && (
          <div className="py-8 px-4 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <span className="text-[#d4af37] text-xs font-semibold tracking-widest uppercase mb-1 block">
                {language === "fr" ? "Entrer en relation" : "De dzesi kadodo me"}
              </span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 uppercase">
                {t("contact_title")}
              </h1>
              <p className="text-neutral-500 text-sm max-w-lg mx-auto mt-2">
                {language === "fr" 
                  ? "Une idée de design pour un T-shirt, un partenariat bio ou des questions sur un panier, écrivez-nous."
                  : "Susu aɖe le awu si nàdi tsɔtsɔ ŋu, bio asitsakaka alo nyabiabia aɖe le kusi dzi, ŋlɔ nya na mí."
                }
              </p>
              <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              
              {/* Contact Information Cards */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-neutral-900 text-white p-5 rounded-sm border-l-4 border-[#d4af37]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-widest text-white">
                        {language === "fr" ? "Service Client Asime" : "Asime ƒe Asitsala Kpekpeɖeŋu"}
                      </h4>
                      <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                        {language === "fr"
                          ? "E-commerce 100% en ligne — Livraison express à domicile ou au bureau à Lomé & envois internationaux"
                          : "Fiase si le kɔmputazi 100% — Adzɔnudeɖe kaba le aƒeme alo dɔwɔƒe le Lomé kple dukɔwo katã me"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-sm border border-neutral-200">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-widest text-neutral-900">
                        {language === "fr" ? "Email Officiel" : "Email Sɔsɔe"}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">{ASIME_SETTINGS.SUPPORT_EMAIL}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-sm border border-neutral-200">
                  <div className="flex items-start gap-3 flex-wrap">
                    <Phone className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-widest text-neutral-900">
                        {language === "fr" ? "Téléphone & WhatsApp" : "Kaƒomɔ & WhatsApp"}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">{ASIME_SETTINGS.PHONE_DISPLAY_PRIMARY} / {ASIME_SETTINGS.PHONE_DISPLAY_SECONDARY}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-sm border border-neutral-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-widest text-neutral-900">
                        {language === "fr" ? "Horaires de Livraison" : "Nudede Ɣeyiɣiwo"}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-1">
                        {language === "fr" ? "Lundi - Samedi : 08h00 - 19h00" : "Dzoɖagbe - Memleɖagbe : 08:00 - 19:00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Interactive Contact Form */}
              <div className="md:col-span-3 bg-white p-6 border border-neutral-200 rounded-sm">
                <h3 className="font-display font-medium text-lg uppercase tracking-wider text-neutral-900 mb-4">
                  {language === "fr" ? "Écrire un message en ligne" : "Ŋlɔ nya ɖe kɔmputa dzi"}
                </h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      {language === "fr" ? "Votre Nom & Prénom" : "Wò Ŋkɔ kple Ŋkɔgbe"} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ex: Koffi Mensah"
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500 bg-neutral-50/50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      {language === "fr" ? "Votre Adresse Email" : "Wò Email Address"} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Ex: koffi@mensah.tg"
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500 bg-neutral-50/50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      {language === "fr" ? "Sujet de votre demande" : "Tia biabia si le wò me"}
                    </label>
                    <input 
                      type="text" 
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder={language === "fr" ? "Ex: Commande professionnelle de miel..." : "Ex: Miel ƒe nudɔdɔ kple dɔwɔƒe..."}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500 bg-neutral-50/50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      {language === "fr" ? "Message" : "Nya"} <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={language === "fr" ? "Dites-nous tout..." : "Gblɔ nuawo katã na mí..."}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500 bg-neutral-50/50 outline-none resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === "fr" ? "Transmettre mon message" : "Dɔ nye nya ɖa"}</span>
                  </button>
                </form>
              </div>

            </div>

            {/* --- PRESTIGE INTERACTIVE FAQ COMPONENT --- */}
            <div className="mt-16 pt-12 border-t border-neutral-200">
              <div className="text-center mb-8">
                <span className="text-[#d4af37] text-xs font-semibold tracking-widest uppercase mb-1 block">
                  {language === "fr" ? "RÉPONSES À VOS QUESTIONS" : "NYƆWƆWƆ NA MI"}
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 uppercase">
                  {language === "fr" ? "Foire Aux Questions Asime" : "Biabia Siwo Bɔ Dzidzi"}
                </h2>
                <p className="text-neutral-500 text-xs max-w-sm mx-auto mt-1">
                  {language === "fr" ? "Tout savoir sur la livraison à Lomé et la provenance de nos produits du terroir." : "Nya nuwo katã tso nuxɔxɔ le Lomé kple afi si míeƒlea míeƒe nukuwo tsoe."}
                </p>
                <div className="w-10 h-0.5 bg-[#d4af37] mx-auto mt-2"></div>
              </div>

              <div className="max-w-2xl mx-auto space-y-3">
                {[
                  {
                    q: language === "fr" ? "Comment s'effectue la livraison à Lomé ?" : "Aleke woɖoa nudɔdɔwo na ame le Lomé?",
                    a: language === "fr" ? "Nous livrons directement à domicile ou au bureau dans tous les quartiers de Lomé sous 2 à 4 heures. Dès 15.000 FCFA d'achat, la livraison vous est offerte !" : "Míeɖoa nudɔdɔwo tẽe va aƒeme alo dɔwɔƒe le Lomé du me fiawo katã me le gaƒoƒo 2 va ɖo 4 me. Ne èƒle nũ va ɖo 15.000 FCFA la, míeɖonɛ na wò femaxee!"
                  },
                  {
                    q: language === "fr" ? "Quels sont les moyens de paiement acceptés ?" : "Axe-mɔ kawoe míelɔ̃na?",
                    a: language === "fr" ? "Nous acceptons le paiement en ligne sécurisé par Carte Bancaire, Wave, Orange Money ou d'autres portefeuilles sécurisés, ainsi que le paiement en Espèces directement à la livraison après vérification de vos articles." : "Míelɔ̃a kaba-axe to Kaɖi alo Wave kple Orange Money dzi, kple egbexexẽ kple ga le asime ne èkpɔ nɔnɔme na wò nudɔdɔwo vɔ."
                  },
                  {
                    q: language === "fr" ? "Les produits sont-ils 100% naturels ?" : "Atike kple nududuwo nye dzɔdzɔmẽ tɔ 100% a?",
                    a: language === "fr" ? "Absolument. Asime Togo travaille sous charte d'engagement éthique. Notre miel sauvage provient directement de Kpalimé, et notre Beurre de Karité est extrait de façon traditionnelle." : "Ɛ̃, míewɔa dɔ kple lɔ̃lɔ̃ kple nuteƒewɔwɔ. Míegba anyitsi le Kpalimé gbo, eye míewɔa ami le Tandjouaré to kɔnyinyi mɔ dzi."
                  },
                  {
                    q: language === "fr" ? "Peut-on passer commande depuis la Diaspora togolaise ?" : "Ame siwo le duta hã ate ŋu aɖo nua?",
                    a: language === "fr" ? "Oui, c'est l'un de nos services préférés ! De nombreux Togolais de l'étranger commandent pour faire livrer des paniers frais ou de l'épicerie fine à leurs proches résidant à Lomé." : "Ɛ̃, Togotɔ siwo le duta ate ŋu aƒle nu na woƒe ƒometɔ siwo le Lomé, eye míeɖonɛ na wo kaba."
                  },
                  {
                    q: language === "fr" ? "Proposez-vous une boutique physique ?" : "Asi-ƒe xɔ aɖe li si me míate ŋu ayia?",
                    a: language === "fr" ? "Asime opère exclusivement en ligne pour vous offrir les meilleurs tarifs possibles. Vous commandez en toute confiance et la livraison express s'effectue sous 2h à Lomé. De plus, vous pouvez vérifier vos articles avant de payer !" : "Míewɔa dɔ to kɔmputazi dzi ko be míana asixɔxɔ nyuitɔwo katã na mi. Míeɖonɛ na mi le Lomé le gaƒoƒo 2 me, eye ète ŋu kpɔa nudɔdɔwo vɔ kaba."
                  }
                ].map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="bg-white border border-neutral-200 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-stone-50"
                      >
                        <span className="font-display font-bold text-neutral-950 text-xs uppercase tracking-wide">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-[#d4af37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="p-4 pt-0 border-t border-neutral-105 bg-[#fefdfb]">
                          <p className="text-neutral-600 text-xs leading-relaxed font-sans mt-3">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}



      </motion.main>

      {/* --- AFFILIATE REDIRECTION INTERSTITIAL OVERLAY --- */}
      {redirectingProduct && (() => {
        const { url, isWhatsapp } = getProductRedirectDetails(redirectingProduct);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-sm animate-fade-in text-white">
            <div className="bg-neutral-900 max-w-md w-full border border-[#d4af37]/45 rounded-sm p-8 text-center space-y-6 shadow-2xl relative">
              
              {/* Pulsing ring indicator */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#d4af37]/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#d4af37] border-t-transparent animate-spin"></div>
                <span className="text-xl font-display font-black text-[#d4af37]">{redirectCount}</span>
              </div>

              <div className="space-y-2">
                <span className="bg-[#d4af37] text-neutral-950 font-bold px-3 py-0.5 text-[9px] rounded-none uppercase tracking-widest inline-block">
                  {isWhatsapp ? "Redirection WhatsApp Directe" : "Redirection d'Achat Sécurisée"}
                </span>
                <h3 className="font-display font-extrabold uppercase text-base tracking-wider text-white">
                  {isWhatsapp 
                    ? `Contact direct avec ${redirectingProduct.partenaire}`
                    : "Redirection vers notre Plateforme Distribuée"
                  }
                </h3>
                <p className="text-[10px] text-neutral-400 font-mono tracking-widest truncate max-w-xs mx-auto">
                  {isWhatsapp 
                    ? `whatsapp://send?phone=${getProductRedirectDetails(redirectingProduct).partnerPhone}`
                    : "https://asime.tg/redirect/secure-checkout?id=" + redirectingProduct.id
                  }
                </p>
              </div>

              <div className="bg-neutral-950 p-4 border-l-2 border-[#d4af37] text-left space-y-2 rounded-sm">
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {isWhatsapp ? (
                    <>
                      👉 <span className="font-bold text-white">{language === "fr" ? "Ligne directe du partenaire :" : "Dɔwɔla ƒe Ka tẽe :"}</span> {language === "fr" ? "Ce produit est géré et distribué de façon autonome par notre partenaire abonné" : "Adzɔnu sia le míaƒe dɔwɔla sɔsɔe dzesi la ƒe asi me pɛpɛɛpɛ"} <strong className="text-[#d4af37]">{redirectingProduct.partenaire}</strong>. {language === "fr" ? "Vous allez être mis en relation directe avec lui sur WhatsApp pour finaliser l'achat." : "Míade wò kple eya dome kadodo me le WhatsApp dzi be nàwu asitsatsa la nu kaba."}
                    </>
                  ) : (
                    <>
                      👉 <span className="font-bold text-white">{language === "fr" ? "Pourquoi cette redirection ?" : "Nukata míeɖɔ lɔ̃ sia ?"}</span> {language === "fr" ? "Cet article exclusif est stocké et expédié directement par l'un de nos centres logistiques internationaux et marques partenaires agréés. Pour vous garantir les meilleurs délais d'acheminement, la commande s'effectue sur notre portail d'expédition officiel sécurisé." : "Adzɔnu tɔxɛ sia le míaƒe xexeame dɔwɔƒe siwo le Togo kple afimãwo ƒe nudraɖeƒe gãwo me. Be adzɔnu la nava kaba la, míawɔ dɔ si sɔ pɛpɛɛpɛ le asitsamɔ nyuitɔ dzi."}
                    </>
                  )}
                </p>
                <p className="text-[10px] text-[#d4af37] font-semibold">
                  {language === "fr" ? "Merci de faire confiance à l'écosystème commercial de Asime ! ❤️🇹🇬" : "Akpe gã na wò le kakaɖedzi ɖe Asime Togo asitsamɔ dzi ! ❤️🇹🇬"}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    window.open(url, "_blank");
                    setRedirectingProduct(null);
                  }}
                  className="w-full bg-[#d4af37] hover:bg-white text-neutral-950 font-bold py-2.5 text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Continuer Immédiatement
                </button>
                <button
                  onClick={() => setRedirectingProduct(null)}
                  className="text-neutral-400 hover:text-white text-xs uppercase tracking-widest transition-colors underline bg-transparent border-none py-1.5 cursor-pointer"
                >
                  Annuler l'Achat
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* --- EXTRA DEEP BLOG READER MODAL COMPONENT (Share enabled, no download) --- */}
      {selectedBlog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedBlog(null)}
        >
          <div 
            className="bg-white max-w-2xl w-full border border-[#d4af37]/35 rounded-none shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar Decoration */}
            <div className="h-1.5 bg-[#0f5132]" />

            {/* Close Button tag */}
            <button 
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 p-2 rounded-full z-20 transition-all cursor-pointer border-none shadow-md"
              title="Fermer la lecture"
            >
              <X className="w-4 h-4 cursor-pointer" />
            </button>

            {/* Scrollable Container */}
            <div className="overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Image banner */}
              <div className="aspect-[21/9] w-full bg-neutral-100 overflow-hidden relative shadow-inner">
                <img 
                  src={selectedBlog.image} 
                  alt={selectedBlog.titre} 
                  className="w-full h-full object-cover"
                />
                
                {selectedBlog.estSponsorise && (
                  <span className="absolute bottom-3 left-3 bg-neutral-950 text-[#d4af37] text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-[#d4af37]/40 shadow-lg">
                    Sponsorisé par Asime Partner
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-3">
                <span className="flex items-center gap-1.5 text-[#0f5132] font-black bg-[#0f5132]/5 px-2.5 py-1">
                  <User className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Auteur: {selectedBlog.auteur}</span>
                </span>
                <span className="flex items-center gap-1.5 text-neutral-600 bg-neutral-100 px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Publié le: {selectedBlog.date}</span>
                </span>
              </div>

              {/* Article Title */}
              <h2 className="font-display font-black text-xl md:text-2xl text-neutral-950 uppercase tracking-wide leading-tight border-l-4 border-[#d4af37] pl-3">
                {selectedBlog.titre}
              </h2>

              {/* Article Content */}
              <div className="text-neutral-700 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
                {selectedBlog.contenu}
              </div>

              {/* Share section (Explicitly NO download links/icons) */}
              <div className="pt-6 border-t border-neutral-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-neutral-900 uppercase tracking-widest block">🌍 Partagez ce savoir précieux</span>
                  <p className="text-[10.5px] text-neutral-500">Inspirez vos proches et soutenez les initiatives 100% togolaises !</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?tab=blog&article=${selectedBlog.id}`;
                    const shareTitle = selectedBlog.titre;
                    
                    if (navigator.share) {
                      navigator.share({
                        title: shareTitle,
                        text: `Découvrez cet excellent article de Asime Togo : "${shareTitle}"`,
                        url: shareUrl,
                      }).catch((err) => console.log("Share error", err));
                    } else {
                      navigator.clipboard.writeText(shareUrl)
                        .then(() => {
                          setShowBlogShareToast(true);
                          setTimeout(() => setShowBlogShareToast(false), 3000);
                        })
                        .catch((err) => console.error("Could not copy link", err));
                    }
                  }}
                  className="w-full sm:w-auto bg-neutral-950 hover:bg-[#0f5132] text-white hover:text-white px-5 py-3 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Partager l'Article</span>
                </button>
              </div>

              {/* Beautiful Toast Notification on top of modal */}
              {showBlogShareToast && (
                <div className="bg-[#0f5132] text-white text-[10.5px] font-bold uppercase tracking-wider py-2 px-4 shadow-xl text-center flex items-center justify-center gap-2 animate-bounce rounded-none">
                  <Check className="w-4 h-4 text-[#d4af37]" />
                  <span>Lien copié dans le presse-papiers !</span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- DETALLES MODAL COMPONENT (Up to 4 images gallery view) --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white max-w-3xl w-full rounded-sm overflow-hidden shadow-2xl relative border border-[#d4af37]/30">
            {/* Close Button tag */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 p-1.5 rounded-full z-10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 cursor-pointer" />
            </button>
            
            <div id="product-modal-scroll-container" className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto w-full">
              
              {/* Left Gallery Frame */}
              <div className="p-4 bg-neutral-50 flex flex-col justify-between">
                <div 
                  onClick={() => setZoomedImage({ 
                    url: selectedProduct.images[currentGalleryIndex] || selectedProduct.images[0], 
                    title: selectedProduct.nom 
                  })}
                  className="aspect-square bg-white border border-neutral-200 rounded-sm overflow-hidden relative cursor-zoom-in group/zoom"
                  title="Cliquez pour zoomer en plein écran"
                >
                  <img 
                    src={selectedProduct.images[currentGalleryIndex] || selectedProduct.images[0]} 
                    alt={selectedProduct.nom} 
                    className="w-full h-full object-cover transition-transform duration-350 group-hover/zoom:scale-105"
                  />
                  <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm text-neutral-900 px-3 py-1.5 border border-[#d4af37]/30 flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold shadow-md rounded-none">
                      <ZoomIn className="w-3.5 h-3.5 text-[#b8901c]" />
                      <span>Agrandir l'image</span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail lists */}
                {selectedProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {selectedProduct.images.map((val, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentGalleryIndex(idx)}
                        className={`aspect-square border-2 rounded-sm overflow-hidden bg-white ${currentGalleryIndex === idx ? "border-[#d4af37]" : "border-neutral-200 hover:border-neutral-400"}`}
                      >
                        <img src={val} alt="alt thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Detail parameters */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[#d4af37] text-[10px] font-bold tracking-widest uppercase">{selectedProduct.categorie}</span>
                  <h2 className="font-display font-extrabold text-lg text-neutral-950 uppercase mt-0.5 mb-2 leading-tight">{selectedProduct.nom}</h2>
                  
                  {/* Spaced slashed original price - SOLVES Issue 4 */}
                  <div className="flex items-baseline mb-4 flex-wrap">
                    {selectedProduct.prixBarre ? (
                      <>
                        <span className="line-through text-neutral-400 mr-3 text-xs font-semibold tracking-wider">
                          {formatFCFA(selectedProduct.prixBarre)}
                        </span>
                        <span className="font-bold text-neutral-950 text-[#b8901c] text-sm tracking-wide">
                          {formatFCFA(selectedProduct.prix)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-neutral-950 text-sm tracking-wide">
                        {formatFCFA(selectedProduct.prix)}
                      </span>
                    )}
                  </div>

                  {selectedProduct.partenaire && (
                    <div className="bg-neutral-950 border border-[#d4af37]/30 text-white p-3 rounded-none flex items-center justify-between mb-4 mt-2">
                      <div>
                        <span className="text-[9px] text-[#d4af37] font-bold tracking-wider uppercase block">Garantie & Logistique</span>
                        <span className="text-xs font-bold font-display uppercase tracking-wider text-[#d4af37]">Importation Express</span>
                      </div>
                      <span className="bg-[#d4af37] text-neutral-950 font-bold px-2 py-0.5 text-[8px] rounded-none uppercase tracking-widest">
                        Exclusivité Club
                      </span>
                    </div>
                  )}

                  <p className="text-neutral-600 text-xs leading-relaxed mb-4">{selectedProduct.description}</p>
                  
                  {/* --- Customer Reviews Section (Avis Clients) --- */}
                  <div className="my-5 border-t border-neutral-100 pt-5 text-left">
                    {(() => {
                      const reviews = getProductReviews(selectedProduct.id, selectedProduct.nom, selectedProduct.categorie);
                      const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
                      const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "5.0";
                      
                      const count5 = reviews.filter(r => r.rating === 5).length;
                      const count4 = reviews.filter(r => r.rating === 4).length;
                      
                      const pct5 = reviews.length > 0 ? Math.round((count5 / reviews.length) * 100) : 100;
                      const pct4 = reviews.length > 0 ? Math.round((count4 / reviews.length) * 100) : 0;

                      return (
                        <>
                          <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3 text-left">
                            <div>
                              <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest">
                                {language === "fr" ? "Témoignages & Avis Clients" : "Kpeɖodziwo & Asitsalawo ƒe Nyawo"}
                              </h3>
                              <p className="text-[10px] text-stone-500">
                                {language === "fr" ? "Avis sincères de notre communauté" : "Míaƒe habɔbɔ ƒe kakaɖedzi nyawo"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-[#b8901c] font-sans flex items-center gap-1 font-bold text-sm justify-end">
                                <Star className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                                <span className="text-neutral-900 font-extrabold">{avgRating}</span>
                                <span className="text-neutral-450 text-xs text-stone-500">/5</span>
                              </div>
                              <p className="text-[9px] text-neutral-400 font-medium uppercase tracking-widest mt-0.5">
                                {reviews.length} {language === "fr" ? (reviews.length > 1 ? "avis récoltés" : "avis récolté") : "nyawo"}
                              </p>
                            </div>
                          </div>

                          {/* Trust banner to reassure customer */}
                          <div className="bg-emerald-50 text-emerald-800 p-2.5 border border-emerald-100 mb-4 flex items-center gap-2 text-left">
                            <span className="text-emerald-800 text-xs">🌿</span>
                            <p className="text-[9.5px] text-emerald-850 font-medium leading-tight">
                              <strong className="text-emerald-900">
                                {language === "fr" ? "Terroir Consommer Local :" : "Afitɔnu Dzɛ Vavã :"}
                              </strong>{" "}
                              {language === "fr" 
                                ? "Ce produit est issu d'un commerce équitable avec nos paysans et apiculteurs du Togo." 
                                : "Adzɔnu sia tso dɔwɔla sɔsɔe kple agbledela siwo le Togo la gbɔ pɛpɛɛpɛ."}
                            </p>
                          </div>

                          {/* Star Distribution Bars */}
                          <div className="space-y-1.5 mb-4 bg-stone-50 p-3 border border-stone-150 text-left">
                            <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                              <span className="w-10 font-bold shrink-0 text-right">5 ★</span>
                              <div className="flex-grow bg-neutral-250 h-1.5 overflow-hidden rounded-sm">
                                <div className="bg-[#d4af37] h-full" style={{ width: `${pct5}%` }}></div>
                              </div>
                              <span className="w-8 shrink-0 text-right font-medium">{pct5}%</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-sans">
                              <span className="w-10 font-bold shrink-0 text-right font-sans">4 ★</span>
                              <div className="flex-grow bg-neutral-250 h-1.5 overflow-hidden rounded-sm">
                                <div className="bg-[#d4af37] h-full" style={{ width: `${pct4}%` }}></div>
                              </div>
                              <span className="w-8 shrink-0 text-right font-medium font-sans">{pct4}%</span>
                            </div>
                          </div>

                          {/* Review List */}
                          <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1 mb-4 scrollbar-thin scrollbar-thumb-neutral-250 text-left">
                            {reviews.map((rev) => (
                              <div key={rev.id} className="bg-stone-50 p-3 rounded-none border border-neutral-100/90 transition-all hover:bg-white hover:shadow-xs text-left">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10.5px] font-bold text-neutral-800">{rev.author}</span>
                                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider flex items-center gap-0.5 rounded-sm scale-90">
                                      <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                                      Acheteur Vérifié
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-neutral-400 font-medium">{rev.date}</span>
                                </div>
                                
                                {/* Stars */}
                                <div className="flex gap-0.5 mb-1.5">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star 
                                      key={idx} 
                                      className={`w-3 h-3 ${idx < rev.rating ? "fill-[#d4af37] text-[#d4af37]" : "text-neutral-250"}`} 
                                    />
                                  ))}
                                </div>

                                <p className="text-[10.5px] text-neutral-600 leading-relaxed font-sans italic">
                                  "{rev.text}"
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Leave a review block */}
                          <div className="bg-[#fcfcfa] p-4 border border-stone-200 rounded-none shadow-xs text-left">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#b8901c] mb-3">Évaluer ce produit</p>
                            
                            <div className="space-y-3">
                              {/* Star Rating selector */}
                              <div className="flex items-center gap-2 bg-white p-2 border border-stone-150 inline-flex w-full justify-between">
                                <span className="text-[10.5px] text-neutral-600 font-bold uppercase tracking-wider">Votre Note :</span>
                                <div className="flex gap-1.5">
                                  {[1, 2, 3, 4, 5].map((starVal) => (
                                    <button
                                      key={starVal}
                                      type="button"
                                      onClick={() => setNewReviewRating(starVal)}
                                      className="cursor-pointer hover:scale-110 transition-transform p-0.5"
                                      title={`${starVal} Étoiles`}
                                    >
                                      <Star 
                                        className={`w-4 h-4 transition-colors ${starVal <= newReviewRating ? "fill-[#d4af37] text-[#d4af37]" : "text-neutral-300 hover:text-[#d4af37]"}`} 
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                {/* Name Input */}
                                <input
                                  type="text"
                                  placeholder={language === "fr" ? "Votre Prénom & Ville (ex. Ayoko de Lomé)" : "Wò Ŋkɔ kple Du (ex. Ayoko le Lomé)"}
                                  value={newReviewAuthor}
                                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                                  className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-none outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800/10 text-neutral-800"
                                />

                                {/* Comment Input */}
                                <textarea
                                  placeholder={language === "fr" ? "Rédigez votre témoignage sincère..." : "Ŋlɔ wò nuteƒewɔwɔ sɔsɔe..."}
                                  value={newReviewText}
                                  onChange={(e) => setNewReviewText(e.target.value)}
                                  rows={2}
                                  className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-none outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800/10 resize-none text-neutral-800"
                                />
                              </div>

                              {/* Success / Error Message display */}
                              {reviewMessage && (
                                <div className={`p-2 border text-[10px] font-bold ${
                                  reviewMessage.includes("saisir") || reviewMessage.includes("rédiger") 
                                    ? "bg-red-50 text-red-600 border-red-150" 
                                    : "bg-emerald-50 text-emerald-800 border-emerald-150"
                                }`}>
                                  {reviewMessage}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => addProductReview(selectedProduct.id)}
                                className="w-full bg-neutral-950 text-white hover:bg-emerald-800 hover:text-white py-2 text-[10px] font-extrabold tracking-widest uppercase transition-colors shrink-0 cursor-pointer"
                              >
                                {language === "fr" ? "Poster mon avis" : "Dɔ nye nya ɖa"}
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="text-xs text-neutral-500 font-semibold uppercase mb-4 tracking-wider flex items-center gap-1.5 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span>
                      {language === "fr" ? "Disponibilité : " : "Adzɔnu siwo li : "}
                      {selectedProduct.stock > 0 
                        ? `${selectedProduct.stock} ${language === "fr" ? "articles en stock" : "adzɔnuwo le nudraƒe"}` 
                        : (language === "fr" ? "Rupture de Stock" : "Adzɔnu vɔ")
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => { addToCart(selectedProduct, 1); setSelectedProduct(null); }}
                    disabled={selectedProduct.stock <= 0 && (!selectedProduct.partenaire || selectedProduct.partenaire === "Boutique en Direct")}
                    className={`w-full py-3 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                      selectedProduct.partenaire && selectedProduct.partenaire !== "Boutique en Direct"
                        ? "bg-[#b8901c] hover:bg-neutral-950 text-white shadow-lg font-bold"
                        : selectedProduct.stock > 0 
                          ? "bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white" 
                          : "bg-neutral-200 text-neutral-450 cursor-not-allowed"
                    }`}
                  >
                    {selectedProduct.partenaire && selectedProduct.partenaire !== "Boutique en Direct"
                      ? (language === "fr" ? "Profiter de l'Offre Exclusive" : "Xɔ dzo xɔzo tɔxɛ sia")
                      : selectedProduct.stock > 0 ? (language === "fr" ? "Ajouter au Panier" : "De Kusi Me") : (language === "fr" ? "Indisponible" : "Meli o")}
                  </button>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        const sId = selectedProduct.vendeurId || "assisted_merchant";
                        const sName = selectedProduct.partenaire || "Boutique Asime Direct";
                        startConversationWithSeller(sId, sName, selectedProduct.nom);
                      }}
                      className="py-2 px-3 border border-[#0B4D26] text-[#0B4D26] hover:bg-[#0B4D26] hover:text-white transition-all duration-200 font-bold uppercase text-[9px] tracking-widest flex items-center justify-center gap-1 cursor-pointer bg-white"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{language === "fr" ? "Discuter" : "Kao nya"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSellerId(selectedProduct.vendeurId || "assisted_merchant");
                        setSelectedSellerName(selectedProduct.partenaire || "Boutique Asime Direct");
                        setIsSellerShopOpen(true);
                      }}
                      className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-all duration-200 font-bold uppercase text-[9px] tracking-widest flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>{language === "fr" ? "Boutique" : "Fiase"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className="w-full mt-2 py-2 font-bold text-[9px] uppercase tracking-widest border border-neutral-300 hover:border-red-500 hover:text-red-500 hover:bg-red-50/20 text-neutral-700 bg-white rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${user?.favorites?.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : "text-neutral-500"}`} />
                    <span>
                      {user?.favorites?.includes(selectedProduct.id) 
                        ? (language === "fr" ? "Retirer de mes favoris" : "Ɖee tso nye lɔ̃nuwo me") 
                        : (language === "fr" ? "Ajouter à mes favoris" : "De nye lɔ̃nuwo me")
                      }
                    </span>
                  </button>
                </div>

                {/* Affiliate Parrainage Box */}
                {user && user.role === "affilie" && (
                  <div className="mt-4 p-3 bg-stone-50 border border-[#d4af37]/40 text-left rounded-none">
                    <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse"></span>
                      <span>{language === "fr" ? "Outils Partenaire Affilié" : "Dɔwɔla Dzesi ƒe Dɔwɔnuwo"}</span>
                    </p>
                    <p className="text-[10px] text-neutral-600 mt-1">
                      {language === "fr" 
                        ? "Partagez votre lien de parrainage pour toucher " 
                        : "Mã wò kadodo dzesi be nàxɔ "
                      }
                      <strong>3% de commission</strong> (soit {formatFCFA(Math.round(selectedProduct.prix * 0.03))}) 
                      {language === "fr" ? " sur chaque vente !" : " le nudɔdɔ ɖesiaɖe dzi !"}
                    </p>
                    <div className="mt-2.5 flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}?ref=${user.affiliateCode}`}
                        className="flex-grow p-1.5 text-[9px] font-mono bg-white border border-stone-200 select-all outline-none text-neutral-800"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}?ref=${user.affiliateCode}`);
                          showToast("✓ Lien affilié copié !");
                        }}
                        className="bg-[#d4af37] hover:bg-neutral-950 hover:text-white text-neutral-950 px-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        {language === "fr" ? "Copier" : "Kɔpie"}
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* --- SECTION "Vous aimerez aussi" (Cross-selling / Recommended items) --- */}
              {(() => {
                let recommended = products.filter(
                  (p) => p.categorie === selectedProduct.categorie && p.id !== selectedProduct.id
                );
                if (recommended.length < 3) {
                  const additional = products.filter(
                    (p) => p.id !== selectedProduct.id && !recommended.some((r) => r.id === p.id)
                  );
                  recommended = [...recommended, ...additional];
                }
                const recommendedProducts = recommended.slice(0, 3);

                if (recommendedProducts.length === 0) return null;

                return (
                  <div className="col-span-1 md:col-span-2 border-t border-neutral-100 bg-neutral-50/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-left">
                        <Sparkles className="w-4 h-4 text-[#b8901c] animate-pulse" />
                        <h3 className="font-display font-extrabold text-[11px] uppercase tracking-wider text-neutral-900">
                          Vous aimerez aussi
                        </h3>
                      </div>
                      <span className="text-[9px] text-[#b8901c] font-black uppercase tracking-widest bg-[#d4af37]/10 px-2.5 py-0.5">
                        Suggestions d'Asime
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {recommendedProducts.map((recProd) => (
                        <div
                          key={recProd.id}
                          onClick={() => {
                            setSelectedProduct(recProd);
                            setCurrentGalleryIndex(0);
                            // Scroll the modal container back to top
                            document.getElementById("product-modal-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="bg-white border border-stone-200/80 hover:border-[#d4af37]/60 group/rec relative flex flex-row sm:flex-col items-center sm:items-stretch overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer h-24 sm:h-auto"
                        >
                          {/* Image container */}
                          <div className="w-24 sm:w-full aspect-square bg-white shrink-0 overflow-hidden relative border-r sm:border-r-0 sm:border-b border-stone-100">
                            <img
                              src={recProd.images[0]}
                              alt={recProd.nom}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/rec:scale-105"
                            />
                            {recProd.prixBarre && (
                              <span className="absolute top-1.5 left-1.5 bg-red-600 text-white font-extrabold text-[7.5px] uppercase tracking-widest px-1.5 py-0.5">
                                Promo
                              </span>
                            )}
                          </div>

                          {/* Info block */}
                          <div className="p-3 flex-grow flex flex-col justify-between text-left">
                            <div>
                              <span className="text-[8px] text-stone-400 uppercase tracking-wider font-semibold block mb-0.5">
                                {recProd.categorie}
                              </span>
                              <h4 className="font-display font-extrabold text-[10.5px] text-neutral-900 uppercase tracking-wide line-clamp-1 group-hover/rec:text-[#b8901c] transition-colors">
                                {recProd.nom}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 mt-1 sm:mt-2">
                              {recProd.prixBarre ? (
                                <>
                                  <span className="text-[9.5px] text-[#b8901c] font-black">
                                    {formatFCFA(recProd.prix)}
                                  </span>
                                  <span className="text-[8.5px] text-stone-400 line-through">
                                    {formatFCFA(recProd.prixBarre)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[9.5px] text-neutral-900 font-extrabold">
                                  {formatFCFA(recProd.prix)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {/* --- BEAUTIFUL CONFIRMATION MODAL FOR DELETING CART ITEM (ANTI-MANIPULATION ERROR) --- */}
      {cartItemToDeleteId && (() => {
        const item = cart.find(i => i.product.id === cartItemToDeleteId);
        if (!item) return null;
        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs select-none">
            <div className="bg-white border border-stone-200 p-6 md:p-8 rounded-none max-w-sm w-full shadow-2xl space-y-5 border-t-4 border-t-red-650">
              
              {/* Warning Badge & Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <p className="font-sans font-extrabold uppercase text-[9px] tracking-widest text-[#d4af37]">Validation requise</p>
                <h4 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight leading-none">Retirer du panier ?</h4>
              </div>

              {/* Product preview line inside modal */}
              <div className="flex items-center gap-3 bg-stone-50 p-2.5 border border-stone-150 rounded-none">
                <div className="w-10 h-10 rounded-none overflow-hidden bg-stone-100 border border-stone-150 shrink-0">
                  <img src={item.product.images[0]} alt={item.product.nom} className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <h5 className="font-bold text-[11px] text-neutral-900 line-clamp-1">{item.product.nom}</h5>
                  <p className="text-neutral-500 text-[9px] font-mono uppercase tracking-wider">{item.product.categorie}</p>
                </div>
              </div>

              <p className="text-xs text-neutral-600 text-center leading-relaxed font-sans">
                Voulez-vous vraiment retirer <strong className="text-neutral-900">"{item.product.nom}"</strong> de votre commande ?
              </p>

              {/* Buttons Action */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => setCartItemToDeleteId(null)}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer border border-stone-150 text-center"
                >
                  Annuler
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="w-full py-2 bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-all shadow-md active:scale-95 duration-150 text-center cursor-pointer"
                >
                  Oui, Retirer
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* --- FLOATING CART SIDEOVER DRAWER COMPONENT --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70 backdrop-blur-xs animate-fade-in">
          {/* Drawer container */}
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative border-l border-neutral-200">
            
            {/* Header coordinates */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-display font-extrabold uppercase text-sm tracking-wider">Votre Commande</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart list stream */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Votre panier est vide</p>
                  <button 
                    onClick={() => { setIsCartOpen(false); setActiveTab("catalogue"); }}
                    className="text-xs font-bold text-[#d4af37] uppercase tracking-widest hover:underline mt-2 block mx-auto"
                  >
                    Parcourir les produits
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 border-b border-neutral-100 pb-3">
                    <div className="w-12 h-12 rounded-sm overflow-hidden bg-neutral-100 shrink-0">
                      <img src={item.product.images[0]} alt={item.product.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-neutral-900 text-xs line-clamp-1">{item.product.nom}</h4>
                      <p className="text-[#b8901c] font-bold text-xs mt-0.5">{formatFCFA(item.product.prix)}</p>
                      
                      {/* Quantity buttons */}
                      <div className="flex items-center gap-2.5 mt-2">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-0.5 rounded-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-neutral-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-0.5 rounded-sm"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCartItemToDeleteId(item.product.id)}
                      className="text-neutral-400 hover:text-red-500 p-1"
                      title="Retirer l'article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Custom order detail + Delivery coordinates inputs for WhatsApp Checkout */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-4">
                <div className="flex items-center justify-between font-bold text-sm text-neutral-950 pb-2 border-b border-neutral-150">
                  <span className="uppercase tracking-wide text-xs">Total de la Commande :</span>
                  <span className="text-[#b8901c] font-extrabold text-base">{formatFCFA(getCartTotal())}</span>
                </div>

                {/* Free Delivery threshold indicator */}
                {(() => {
                  const total = getCartTotal();
                  const threshold = 15000;
                  const progressPercent = Math.min((total / threshold) * 100, 100);
                  const remaining = threshold - total;
                  
                  return (
                    <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-3 rounded-none">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-extrabold mb-1.5">
                        {total >= threshold ? (
                          <span className="text-[#b8901c] flex items-center gap-1">🎉 LIVRAISON OFFERTE À LOMÉ MÊME ! 🚚</span>
                        ) : (
                          <span className="text-neutral-600">Plus que <b className="text-neutral-950 font-mono font-black">{formatFCFA(remaining)}</b> pour la livraison offerte</span>
                        )}
                        <span className="text-neutral-500 font-mono font-black">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#d4af37] h-full transition-all duration-500 ease-out" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <form onSubmit={handleCheckoutWhatsAppState} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Nom & Prénom <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Ama Dogbé"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs focus:ring-1 focus:ring-gold-500 outline-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Téléphone <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        required
                        placeholder="Ex: 90050510"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs focus:ring-1 focus:ring-gold-500 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#d4af37]" />
                        <span>Quartier (Lomé) <span className="text-red-500">*</span></span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Agoè, Adidogomé"
                        value={checkoutQuartier}
                        onChange={(e) => setCheckoutQuartier(e.target.value)}
                        className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs focus:ring-1 focus:ring-gold-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1.5">
                      {language === "fr" ? "Mode de Paiement Préféré" : "Axe-mɔ si nàlɔ̃ dodo"}
                    </label>
                    <div className="grid grid-cols-1 gap-2 text-left">
                      {/* Unified Secure Online Payment (using PayDunya under the hood, but branded neutrally) */}
                      <button
                        type="button"
                        onClick={() => setCheckoutPayment("EnLigne")}
                        className={`p-3 border rounded-sm flex flex-col justify-between transition-all cursor-pointer ${checkoutPayment === "EnLigne" ? "bg-neutral-950 text-white border-neutral-950 shadow-sm" : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"}`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className={`font-black uppercase text-[10px] ${checkoutPayment === "EnLigne" ? "text-emerald-400" : "text-emerald-700"}`}>
                            {language === "fr" ? "Paiement Sécurisé Mobile Money & Cartes" : "Kaba Kɔmputazi fe nudɔdɔ kple Kaɖwo"}
                          </span>
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                            {language === "fr" ? "Instantané" : "Kaba ko"}
                          </span>
                        </div>
                        <span className="text-[8px] text-neutral-400 mt-1.5 leading-tight">
                          {language === "fr" ? "Payez en toute sécurité par Mobile Money (Wave, Orange Money) ou Carte Bancaire" : "Kpɔ mɔ sɔsɔe to Wave kple Orange Money alo Kaɖi dzi"}
                        </span>
                      </button>

                      {/* Cash on Delivery */}
                      <button
                        type="button"
                        onClick={() => setCheckoutPayment("Espèces")}
                        className={`p-3 border rounded-sm flex items-center justify-between transition-all cursor-pointer ${checkoutPayment === "Espèces" ? "bg-neutral-950 text-white border-neutral-950 shadow-sm" : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"}`}
                      >
                        <div className="flex flex-col">
                          <span className={`font-black uppercase text-[10px] ${checkoutPayment === "Espèces" ? "text-[#d4af37]" : "text-neutral-900"}`}>
                            {language === "fr" ? "Espèces à la livraison (COD)" : "Xexe ga ne míeɖoe na wò"}
                          </span>
                          <span className="text-[8px] text-neutral-400 mt-1 leading-tight">
                            {language === "fr" ? "Réglez en espèces directement après vérification de vos articles" : "Axe ga tẽe ne èkpɔ nuku siwo èɖo vɔ"}
                          </span>
                        </div>
                        <span className="text-sm">💵</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-none flex items-center justify-center gap-2 transition-colors cursor-pointer shadow mt-3"
                  >
                    {checkoutPayment === "Espèces" ? (
                      <>
                        <Phone className="w-4 h-4 cursor-pointer" />
                        <span>
                          {language === "fr" ? "Valider sur WhatsApp (Livraison) 🇹🇬" : "Wɔe na WhatsApp (Livraison) 🇹🇬"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 cursor-pointer" />
                        <span>
                          {language === "fr" ? "Procéder au Paiement Sécurisé 💳" : "Yi kɔmputazi fe xe-mɔ dzi 💳"}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 💳 MODULAR PAYMENT GATEWAY SECURE MODAL */}
      {isPaymentModalOpen && paymentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-xs p-4 select-none">
          <div className="bg-white max-w-md w-full border border-neutral-200 p-6 space-y-6 shadow-2xl rounded-none text-left animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></span>
                <h5 className="text-[11px] font-black text-neutral-950 uppercase tracking-widest">Passerelle de Paiement Sécurisée</h5>
              </div>
              {!isPaymentSuccess && (
                <button 
                  onClick={() => {
                    if (confirm("Voulez-vous vraiment annuler la session de paiement en cours ? Votre commande restera 'En attente de paiement'.")) {
                      setIsPaymentModalOpen(false);
                      setPaymentSession(null);
                    }
                  }} 
                  className="text-neutral-400 hover:text-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Success screen */}
            {isPaymentSuccess ? (
              <div className="space-y-5 text-center py-6 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Paiement Validé avec Succès !</h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Votre paiement de <strong className="text-neutral-900">{formatFCFA(paymentSession.amount)}</strong> a été vérifié par notre système.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 text-[10px] text-emerald-900 font-mono text-left space-y-1 rounded-sm">
                  <p><strong>🔒 ID Transaction :</strong> {paymentSession.transactionId}</p>
                  <p><strong>💳 Mode de paiement :</strong> {paymentSession.providerId.toUpperCase()}</p>
                  <p><strong>📦 Commande :</strong> {paymentSession.orderId}</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      // Build the WhatsApp message confirming paid status
                      let message = `*✨ PAIEMENT ENREGISTRÉ - COMMANDE ASIME TOGO ✨*\n\n`;
                      message += `🆔 *Commande :* \`${paymentSession.orderId}\`\n`;
                      message += `🔒 *ID Paiement :* \`${paymentSession.transactionId}\`\n`;
                      message += `💳 *Moyen utilisé :* ${paymentSession.providerId.toUpperCase()}\n`;
                      message += `🟢 *Statut :* PAYÉ ET VALIDÉ VIA ASIME PAY\n`;
                      message += `🔗 *Suivi de commande :* ${window.location.origin}/?track=${paymentSession.orderId}\n\n`;
                      message += `👤 *Client :* ${checkoutName.trim()}\n`;
                      message += `📞 *Téléphone :* ${checkoutPhone.trim()}\n`;
                      message += `📍 *Quartier :* ${checkoutQuartier.trim()}\n\n`;
                      message += `*🛒 Articles :*\n`;
                      cart.forEach((item, index) => {
                        const lineCost = item.product.prix * item.quantity;
                        message += `${index + 1}. *${item.product.nom}* (x${item.quantity}) - ${formatFCFA(lineCost)}\n`;
                      });
                      message += `\n*━━━━━━━━━━━━━━━━━━━━━*\n`;
                      message += `💰 *MONTANT REÇU :* *${formatFCFA(paymentSession.amount)}*\n`;
                      message += `*━━━━━━━━━━━━━━━━━━━━━*\n\n`;
                      message += `Mon paiement est déjà validé sur le site d'Asime ! Veuillez lancer la livraison. Merci ! 🙏🇹🇬`;

                      const encodedText = encodeURIComponent(message);
                      const merchantPhone = ASIME_SETTINGS.WHATSAPP_MERCHANT_NUMBER;
                      const whatsappUrl = `https://wa.me/${merchantPhone}?text=${encodedText}`;
                      
                      // Clear cart, close modal
                      setCart([]);
                      setIsPaymentModalOpen(false);
                      setPaymentSession(null);
                      setIsPaymentSuccess(false);

                      const opened = window.open(whatsappUrl, "_blank");
                      if (!opened) {
                        window.location.href = whatsappUrl;
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Notifier le Vendeur sur WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      // Construct order object for InvoiceModal
                      const invoiceOrder = {
                        id: paymentSession.orderId,
                        createdAt: Date.now(),
                        totalAmount: paymentSession.amount,
                        paymentStatus: "Payé",
                        orderStatus: "En préparation",
                        paymentMethod: paymentSession.providerId.toUpperCase(),
                        shippingDetails: {
                          name: checkoutName,
                          phone: checkoutPhone,
                          quartier: checkoutQuartier
                        },
                        items: cart.map(item => ({
                          product: {
                            id: item.product.id,
                            nom: item.product.nom,
                            prix: item.product.prix,
                            partenaire: item.product.partenaire
                          },
                          quantity: item.quantity
                        }))
                      };
                      setSelectedInvoiceOrder(invoiceOrder);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="w-full bg-[#d4af37] hover:bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Imprimer / PDF Facture Officielle</span>
                  </button>
                  <button
                    onClick={() => {
                      setCart([]);
                      setIsPaymentModalOpen(false);
                      setPaymentSession(null);
                      setIsPaymentSuccess(false);
                      showToast("✓ Commande finalisée avec succès !");
                    }}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[10px] uppercase tracking-widest py-2 px-4 transition-colors cursor-pointer"
                  >
                    Rester sur le site
                  </button>
                </div>
              </div>
            ) : (
              /* Payment Pending Instructions */
              <div className="space-y-4 animate-fade-in">
                {/* Session overview */}
                <div className="bg-stone-50 border border-stone-200 p-4 space-y-2.5 rounded-none text-xs">
                  <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                    <span className="text-neutral-500 font-bold">MONTANT TOTAL</span>
                    <strong className="text-sm font-mono font-black text-neutral-950">{formatFCFA(paymentSession.amount)}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-[10px]">
                    <span className="text-neutral-400 font-medium">Fournisseur :</span>
                    <strong className="text-neutral-800 uppercase font-bold text-right">{paymentSession.providerId}</strong>
                    
                    <span className="text-neutral-400 font-medium">Destinataire :</span>
                    <strong className="text-neutral-800 text-right font-bold">Asime Togo Pay</strong>

                    <span className="text-neutral-400 font-medium">{language === "fr" ? "Référence unique :" : "Dzesi pɛpɛɛpɛ :"}</span>
                    <strong className="text-neutral-800 font-mono text-right truncate">{paymentSession.transactionId}</strong>
                  </div>
                </div>

                {/* Specific Instructions based on provider */}
                <div className="bg-yellow-50/50 border border-yellow-200/80 p-4 space-y-3 rounded-none text-xs text-stone-900 leading-relaxed font-sans">
                  <p className="font-extrabold text-[#b8901c] uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <span>💡 {language === "fr" ? "Directives de paiement" : "Fetututu Mɔfiamewo"}</span>
                  </p>
                  <p className="text-stone-700">
                    {paymentSession.instructions}
                  </p>
                  
                  {/* Dial Code copy help if mobile money */}
                  {(paymentSession.providerId === "tmoney" || paymentSession.providerId === "flooz") && (
                    <div className="bg-white border border-stone-200 p-2 text-center font-mono text-xs text-neutral-800 select-all font-bold">
                      {paymentSession.providerId === "tmoney" ? "*145#" : "*155#"}
                    </div>
                  )}
                </div>

                {/* Automatic payment tracking indicator */}
                <div className="space-y-4">
                  <div className="bg-emerald-50/50 border border-emerald-200/50 p-4 rounded-xl space-y-3.5 text-xs text-neutral-800">
                    <p className="font-extrabold text-emerald-800 uppercase tracking-widest text-[9px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                      <span>{language === "fr" ? "🔄 Suivi Automatique du Paiement Mobile Money" : "🔄 Suivi na Mobile Money Fetututu"}</span>
                    </p>
                    
                    <div className="space-y-2.5 font-sans">
                      {[
                        { id: 1, label: language === "fr" ? "Connexion sécurisée aux serveurs de l'opérateur..." : "Kadodo kple kaɖa dɔwɔla ƒe kɔmputaziwo..." },
                        { id: 2, label: language === "fr" ? "En attente de votre code PIN sur votre mobile..." : "Lala wò PIN code dzesi le wò kaƒomɔ dzi..." },
                        { id: 3, label: language === "fr" ? "Réception de l'autorisation de prélèvement..." : "Míexɔ kpeɖodzi be dzoɖoɖoa sɔ..." },
                        { id: 4, label: language === "fr" ? "Validation finale du transfert avec Asime Pay..." : "Wu dzoɖoɖoa nu kple Asime Pay..." }
                      ].map((step) => {
                        const isDone = autoPaymentStep >= step.id;
                        const isActive = autoPaymentStep === (step.id - 1);
                        return (
                          <div key={step.id} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all ${
                              isDone 
                                ? "bg-emerald-600 border-emerald-600 text-white" 
                                : isActive 
                                ? "bg-amber-100 border-amber-400 text-amber-700 animate-pulse font-black" 
                                : "bg-stone-50 border-stone-200 text-stone-400"
                            }`}>
                              {isDone ? "✓" : step.id}
                            </div>
                            <span className={`text-[11px] font-medium leading-relaxed transition-all ${
                              isDone 
                                ? "text-stone-400 line-through" 
                                : isActive 
                                ? "text-neutral-900 font-extrabold" 
                                : "text-stone-400"
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#FAF9F5] border border-stone-200 p-4 rounded-xl space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-neutral-800">
                      <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin animate-duration-1000"></span>
                      <p className="text-[11px] font-black uppercase tracking-wider text-neutral-900">
                        {autoPaymentStatusText.includes("Initialisation") 
                          ? (language === "fr" ? "Initialisation de la connexion sécurisée..." : "Kadzizidzo gɔmedzedze...")
                          : autoPaymentStatusText.includes("Connexion")
                          ? (language === "fr" ? "Connexion sécurisée aux serveurs..." : "Kadzizidzo kple kaɖa dɔwɔla...")
                          : autoPaymentStatusText.includes("En attente")
                          ? (language === "fr" ? "En attente de votre PIN..." : "Lala wò PIN code...")
                          : autoPaymentStatusText.includes("Saisie")
                          ? (language === "fr" ? "Traitement de la transaction..." : "Ele dzo le edzi...")
                          : autoPaymentStatusText.includes("Validation")
                          ? (language === "fr" ? "Validation finale..." : "Wu dzoɖoɖoa nu...")
                          : autoPaymentStatusText}
                      </p>
                    </div>
                    <p className="text-[9px] text-neutral-400 font-medium">
                      {language === "fr" 
                        ? "Ne fermez pas cette fenêtre. La validation est entièrement automatisée." 
                        : "Megatu fɛst sia o. Míaƒe kɔmputazi le dɔwɔm tẽe."}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* FOOTER AREA */}
      <footer className="hidden md:block bg-neutral-950 text-white py-12 px-4 border-t-2 border-[#d4af37] mt-12 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Presentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {renderLogoNode("w-9 h-9")}
              <div>
                <span className="font-sans font-bold tracking-[0.15em] text-white uppercase text-base leading-none block">ASIME</span>
                <span className="text-[8px] text-[#FAA61A] tracking-wider uppercase font-semibold block mt-1">
                  {language === "fr" ? "Le local, notre fierté" : "Míaƒe anyigbadzinu, míaƒe dada"}
                </span>
              </div>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              {language === "fr" 
                ? "La vitrine par excellence des produits nobles togolais. Conçue de manière minimaliste, nous allions le prestige et le consommer local togolais. Un nom authentique que l'on prononce avec fierté."
                : "Togo-tɔwo ƒe adzɔnu nyuiwo ɖela tɔxɛ. Míetsɔa bubu kple anyigbadzinuwo dada kpea ɖekae le mɔ bɔbɔe nu."}
            </p>
            <div className="text-neutral-500 font-mono text-[9px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>LOME, TOGO - Miawoezon (Asime)</span>
            </div>
          </div>

          {/* Quick links to tabs */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase mb-4 text-[#d4af37]">
              {language === "fr" ? "Navigation" : "Mɔfiamewo"}
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => setActiveTab("accueil")} className="hover:text-white transition-colors bg-transparent border-0 p-0 text-left cursor-pointer font-sans">
                  {language === "fr" ? "Accueil du site" : "Aƒeme gɔmedzedze"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("catalogue")} className="hover:text-white transition-colors bg-transparent border-0 p-0 text-left cursor-pointer font-sans">
                  {language === "fr" ? "Catalogue Produits" : "Adzɔnuwo ƒe Fiasã"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("blog")} className="hover:text-white transition-colors bg-transparent border-0 p-0 text-left cursor-pointer font-sans">
                  {language === "fr" ? "Le Journal de Asime" : "Asime Nyadzɔdzɔwo"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("contact")} className="hover:text-white transition-colors bg-transparent border-0 p-0 text-left cursor-pointer font-sans">
                  {language === "fr" ? "Nous Contacter" : "Ŋlɔ nya na mí"}
                </button>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase mb-4 text-[#d4af37]">
              {language === "fr" ? "Service Client" : "Kpekpeɖeŋu na Asitsala"}
            </h4>
            <ul className="space-y-2 text-neutral-400 leading-relaxed text-[11px]">
              <li>📍 {language === "fr" ? "Service 100% en Ligne — Lomé, Togo" : "Dɔwɔwɔ 100% le Kɔmputazi — Lomé, Togo"}</li>
              <li>📞 {language === "fr" ? "Administration : " : "Dɔdrɔ̃ : "}{ASIME_SETTINGS.PHONE_DISPLAY_PRIMARY}</li>
              <li>💬 {language === "fr" ? "Service Client : 7j/7 par WhatsApp" : "Asitsalawo Kpekpeɖeŋu : 7j/7 le WhatsApp dzi"}</li>
              <li>🚚 {language === "fr" ? "Commande expédiée sous 2h à Lomé" : "Nudɔdɔ woɖonɛ le Lomé le gaƒoƒo 2 me"}</li>
            </ul>
          </div>

          {/* Google Partnership affiliate indicator */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs tracking-wider uppercase mb-3 text-[#d4af37]">
              {language === "fr" ? "Partenariats Officiels" : "Dɔwɔwɔ Ɖekae Dzesiwo"}
            </h4>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              {language === "fr" 
                ? "Asime travaille conjointement avec les coopératives locales de Kpalimé et de l'Est-Mono pour valoriser la culture togolaise à l'échelle internationale."
                : "Asime kple Kpalimé kpakple Est-Mono dɔwɔla habɔbɔwo wɔa dɔ ɖekae be woado Togo-tɔwo ƒe dekɔnuwo ɖe gã le xexeame katã."}
            </p>
            <div className="flex gap-2">
              <span className="bg-neutral-900 border border-neutral-800 text-[#d4af37] px-2 py-1 text-[9px] font-bold rounded-sm tracking-wide">
                {language === "fr" ? "COOPÉRATIVES LOCALES" : "DƆWƆLA HABƆBƆWO"}
              </span>
              <span className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2 py-1 text-[9px] font-bold rounded-sm tracking-wide">
                MADE IN TOGO 🇹🇬
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-neutral-800 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Asime. {t("footer_rights")} {language === "fr" ? "CONÇU POUR LE CONSOMMER LOCAL TOGOLAIS 🇹🇬" : "WÒ WƆE NA TOGO-TƆWO ƑE ADZƆNUWO 🇹🇬"}</p>
        </div>
      </footer>

      {/* Floating Dynamic Feedback Toast */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 right-6 z-50 bg-neutral-950 border border-[#d4af37]/60 text-white text-xs px-5 py-3.5 shadow-2xl flex items-center gap-3 rounded-none tracking-wide"
          id="toast-notification-banner"
          role="alert"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-semibold text-neutral-100">{toastMessage}</span>
        </motion.div>
      )}



      {/* --- HIGH RESOLUTION ACCENTED IMAGE ZOOM MODAL (MODALE DE ZOOM RAPIDE) --- */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)} 
          className="fixed inset-0 z-50 bg-neutral-950/92 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          id="product-image-zoom-overlay"
        >
          {/* Quick exit guidance label */}
          <div className="absolute top-4 left-4 text-white/60 text-[10px] sm:text-xs font-semibold tracking-wider bg-neutral-900/50 px-3 py-1.5 border border-white/10 uppercase mb-4">
            Cliquez n'importe où pour fermer rapidement
          </div>

          <button 
            type="button" 
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 bg-white text-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 p-2 sm:p-2.5 rounded-full z-10 shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            id="zoom-modal-close-btn"
          >
            <X className="w-5 h-5 font-black" />
          </button>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[82vh] border border-white/10 bg-white shadow-2xl p-2 rounded-none cursor-default mb-4"
          >
            <img 
              src={zoomedImage.url} 
              alt={zoomedImage.title} 
              className="max-w-full max-h-[72vh] object-contain mx-auto"
            />
            {/* Legend Tag */}
            <div className="bg-neutral-950 text-white p-3 text-center border-t border-white/5 flex items-center justify-between gap-4">
              <p className="font-display font-black text-xs uppercase tracking-wider text-[#d4af37] text-left">{zoomedImage.title}</p>
              <button 
                type="button"
                onClick={() => {
                  const entry = document.createElement("a");
                  entry.href = zoomedImage.url;
                  entry.download = `${zoomedImage.title.replace(/\s+/g, "_")}.jpg`;
                  entry.target = "_blank";
                  document.body.appendChild(entry);
                  entry.click();
                  document.body.removeChild(entry);
                  showToast("Ouverture de l'image haute définition");
                }}
                className="bg-[#d4af37] hover:bg-white text-neutral-950 hover:text-neutral-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Enregistrer l'image</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- CUSTOMER SELLER SHOP MODAL (BOUTIQUE VENDEUR) --- */}
      {/* ========================================================= */}
      {isSellerShopOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4 shadow-2xl animate-fade-in" onClick={() => setIsSellerShopOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-4xl w-full max-h-[85vh] border border-[#d4af37]/35 shadow-2xl overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button" 
              onClick={() => setIsSellerShopOpen(false)}
              className="absolute top-4 right-4 bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 p-2 rounded-full z-20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 cursor-pointer" />
            </button>

            {/* Banner Geometric/Traditional Accent */}
            <div className="h-32 bg-stone-900 bg-[linear-gradient(to_right,#1c1917,#451a03)] text-white relative p-6 flex items-end">
              <div className="absolute inset-0 opacity-10 bg-repeat bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="z-10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#d4af37] border-2 border-white flex items-center justify-center font-display font-black text-2xl text-neutral-950 uppercase shadow-lg">
                  {selectedSellerName.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-lg uppercase tracking-wider text-white">{selectedSellerName}</h3>
                    <span className="bg-[#0B4D26] text-white font-mono text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest rounded-sm">
                      Artisan Certifié
                    </span>
                  </div>
                  <p className="text-stone-300 text-[11px] font-sans mt-0.5">Boutique Togolaise Authentique • Créations artisanales éthiques</p>
                </div>
              </div>
            </div>

            {/* Content split */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left sidebar: Info and contact */}
              <div className="md:col-span-4 space-y-4 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0 md:pr-6 text-left">
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">À propos de l'artisan</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Cette boutique vous propose des créations faites main inspirées de la tradition et de l'artisanat du Togo. Chaque pièce achetée soutient directement notre coopérative locale et favorise l'emploi éthique et durable de nos couturiers et artisans togolais.
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Modes de Livraison</h4>
                  <div className="space-y-1 text-[11px] font-sans text-stone-600">
                    <p className="flex items-center gap-1.5">📦 • Envoi sécurisé par le réseau Asime</p>
                    <p className="flex items-center gap-1.5">🛵 • Livraison express à Lomé (24h)</p>
                    <p className="flex items-center gap-1.5">🌍 • Expédition diaspora Europe & Amérique</p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsSellerShopOpen(false);
                      startConversationWithSeller(selectedSellerId, selectedSellerName, "Boutique " + selectedSellerName);
                    }}
                    className="w-full py-2.5 bg-[#0B4D26] hover:bg-neutral-950 text-white font-extrabold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Discuter avec l'artisan</span>
                  </button>
                </div>
              </div>

              {/* Right panel: Product catalog */}
              <div className="md:col-span-8 flex flex-col">
                <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider mb-4 pb-2 border-b border-stone-100 text-left">
                  Catalogue de la Boutique ({products.filter(p => p.vendeurId === selectedSellerId || p.partenaire === selectedSellerName).length} produits)
                </h4>

                {products.filter(p => p.vendeurId === selectedSellerId || p.partenaire === selectedSellerName).length === 0 ? (
                  <div className="flex-1 py-16 text-center text-stone-400">
                    <Store className="w-8 h-8 mx-auto stroke-1 mb-2 text-stone-300" />
                    <p className="text-xs font-sans">Aucun produit n'est actuellement en ligne pour cette boutique.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {products.filter(p => p.vendeurId === selectedSellerId || p.partenaire === selectedSellerName).map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsSellerShopOpen(false);
                        }}
                        className="group border border-stone-100 p-2 hover:border-[#d4af37]/50 transition-all cursor-pointer flex flex-col text-left bg-white"
                      >
                        <div className="aspect-square bg-stone-50 overflow-hidden relative mb-2">
                          <img src={p.images[0]} alt={p.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <h5 className="font-display font-bold text-[10px] sm:text-[11px] text-neutral-900 truncate uppercase">{p.nom}</h5>
                        <p className="text-[10px] text-[#b8901c] font-black mt-0.5">{formatFCFA(p.prix)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- CUSTOMER REAL-TIME CHAT DRAWER (MESSAGERIE CLIENT) --- */}
      {/* ========================================================= */}
      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex justify-end animate-fade-in" onClick={() => setIsChatDrawerOpen(false)}>
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-stone-900 text-white border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-display font-black uppercase text-xs tracking-wider">Mes Discussions Artisans</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsChatDrawerOpen(false)}
                className="bg-stone-800 hover:bg-[#d4af37] text-white hover:text-neutral-950 p-1.5 rounded-full transition-colors cursor-pointer border-0"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </div>

            {/* Split View if threads exist */}
            {chatDrawerThreads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                <MessageCircle className="w-12 h-12 stroke-1 text-stone-300 mb-2" />
                <h4 className="text-xs font-bold uppercase text-stone-600">Aucune discussion en cours</h4>
                <p className="text-[11px] text-stone-400 max-w-xs mt-1">Visitez une boutique ou ouvrez la fiche d'un produit pour démarrer une discussion personnalisée avec un créateur togolais.</p>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                {/* Left side: threads list */}
                <div className="w-1/3 border-r border-stone-100 flex flex-col overflow-y-auto bg-stone-50">
                  {chatDrawerThreads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveChatThreadId(thread.id)}
                      className={`p-3 text-left border-b border-stone-100 transition-colors flex flex-col gap-1 cursor-pointer border-l-2 w-full ${
                        activeChatThreadId === thread.id ? "bg-white border-l-[#0B4D26]" : "bg-transparent border-l-transparent hover:bg-stone-100"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-neutral-900 truncate uppercase">{thread.sellerName}</span>
                      <span className="text-[9px] text-[#0B4D26] font-medium truncate">{thread.product}</span>
                      <p className="text-[9px] text-stone-500 truncate leading-tight mt-0.5">{thread.lastMessage}</p>
                    </button>
                  ))}
                </div>

                {/* Right side: active chat window */}
                <div className="w-2/3 flex flex-col bg-stone-50 overflow-hidden">
                  {(() => {
                    const currentThread = chatDrawerThreads.find(t => t.id === activeChatThreadId);
                    if (!currentThread) {
                      return (
                        <div className="flex-grow flex flex-col items-center justify-center text-stone-400 p-6 text-center">
                          <MessageCircle className="w-8 h-8 stroke-1 text-stone-300 mb-1" />
                          <p className="text-[10px] font-sans">Sélectionnez une discussion pour démarrer le dialogue en direct.</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Selected Thread Header */}
                        <div className="p-3 bg-white border-b border-stone-150 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-[10px] font-bold text-stone-800 block uppercase">{currentThread.sellerName}</span>
                            <span className="text-[8px] text-[#0B4D26] font-bold">{currentThread.product}</span>
                          </div>
                          <span className="bg-emerald-50 text-[#0B4D26] border border-emerald-150 font-sans text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                            En Ligne
                          </span>
                        </div>

                        {/* Message list */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-3 flex flex-col">
                          {currentThread.messages.map((msg: any, idx: number) => {
                            const isMe = msg.sender === "customer";
                            return (
                              <div 
                                key={idx} 
                                className={`max-w-[85%] rounded-lg p-2.5 text-xs font-sans shadow-xs ${
                                  isMe 
                                    ? "bg-[#0B4D26] text-white self-end rounded-br-none" 
                                    : "bg-white text-stone-800 border border-stone-150 self-start rounded-bl-none text-left"
                                }`}
                              >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <span className={`text-[8px] block text-right mt-1 ${isMe ? "text-stone-300" : "text-stone-400"}`}>
                                  {msg.date ? new Date(msg.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "À l'instant"}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendCustomerMessage} className="p-3 bg-white border-t border-stone-150 flex gap-2">
                          <input
                            type="text"
                            value={chatDrawerMessage}
                            onChange={(e) => setChatDrawerMessage(e.target.value)}
                            placeholder="Votre message à l'artisan..."
                            className="flex-grow px-3 py-2 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#0B4D26]"
                          />
                          <button
                            type="submit"
                            className="bg-[#0B4D26] hover:bg-[#0B4D26]/90 text-white font-extrabold uppercase tracking-widest px-4 text-[10px] rounded-lg transition-colors cursor-pointer border-0 flex items-center justify-center"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* --- APP SHARING AND OFFLINE BROCHURE DOWNLOAD PORTAL (PARTAGER & TELECHARGER APP) --- */}
      {isShareDownloadOpen && (
        <div 
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-4 shadow-2xl"
          id="app-share-download-modal"
          onClick={() => setIsShareDownloadOpen(false)}
        >
          <div 
            className="bg-white max-w-lg w-full border border-[#d4af37]/35 shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              onClick={() => setIsShareDownloadOpen(false)}
              className="absolute top-3.5 right-3.5 bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 p-2 rounded-full z-10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 cursor-pointer" />
            </button>

            {/* Premium Gold Accent top-bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#b8901c] via-[#d4af37] to-[#b8901c]"></div>

            <div className="p-6 sm:p-8 space-y-6 text-center">
              <div>
                <span className="text-[#b8901c] text-[10px] font-black uppercase tracking-widest block mb-1">SERVICES MOBILES 🇹🇬</span>
                <h3 className="font-display font-extrabold uppercase text-neutral-950 text-lg tracking-wider">
                  Partager & Télécharger l'App'
                </h3>
                <p className="text-neutral-500 text-xs mt-1 font-sans">Diffusez l'élégance togolaise d'un geste ou emportez le catalogue complet disponible hors-connexion.</p>
              </div>

              {/* Grid with beautiful modular options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: Sharing options */}
                <div className="bg-stone-50 border border-neutral-150 p-5 flex flex-col justify-between text-left">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 flex items-center justify-center mb-2">
                      <Share2 className="w-4 h-4 text-[#b8901c]" />
                    </div>
                    <h4 className="font-bold text-neutral-950 text-xs uppercase tracking-wide">Diffuser le site</h4>
                    <p className="text-neutral-500 text-[10.5px] leading-normal font-sans">Envoyez le lien de la boutique par message WhatsApp ou copiez-le dans votre presse-papiers.</p>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        handleShareApp();
                        setIsShareDownloadOpen(false);
                      }}
                      className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer rounded-none h-9 flex items-center justify-center"
                    >
                      Copier le Lien
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Découvrez Asime, la somptueuse vitrine du consommer local au Togo ! ✨🇹🇬 Retrouvez l'artisanat du terroir et de superbes cadeaux exclusifs ici: " + window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 rounded-none h-9 text-xs"
                    >
                      Partager WhatsApp
                    </a>
                  </div>
                </div>

                {/* Option 2: Downloading options */}
                <div className="bg-amber-50/20 border border-amber-200/50 p-5 flex flex-col justify-between text-left">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 flex items-center justify-center mb-2">
                      <Download className="w-4 h-4 text-[#b8901c]" />
                    </div>
                    <h4 className="font-bold text-neutral-950 text-xs uppercase tracking-wide">Mode Offline (.html)</h4>
                    <p className="text-neutral-500 text-[10.5px] leading-normal font-sans">Téléchargez un catalogue interactif complet autonome qui s'ouvre même sans connexion mobile.</p>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        downloadOfflineCatalogue();
                        setIsShareDownloadOpen(false);
                      }}
                      className="w-full bg-[#b8901c] hover:bg-neutral-950 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer rounded-none h-9"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger (.html)</span>
                    </button>
                    <p className="text-[9px] text-[#b8901c] font-semibold uppercase text-center tracking-wider font-sans">Catalogue 100% autonome</p>
                  </div>
                </div>

              </div>

              {/* Installer PWA instructions shortcut */}
              <div className="bg-[#0f5132]/5 border border-[#0f5132]/20 p-5 text-left text-xs space-y-3 rounded-none font-sans relative">
                <span className="text-[10px] font-extrabold text-[#0f5132] uppercase tracking-widest block">✨ Installation Directe &amp; Logo Officiel</span>
                <p className="text-neutral-700 text-[10.5px] leading-relaxed font-sans">
                  Installez l'application Asime Togo sur votre écran d'accueil d'un simple clic pour profiter de la boutique comme une vraie application mobile avec notre logo exclusif !
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsShareDownloadOpen(false);
                    handleInstallApp();
                  }}
                  className="w-full bg-[#0F5132] hover:bg-neutral-950 font-display font-extrabold text-[10px] uppercase tracking-widest text-white py-2.5 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>Installer l'Application</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareDownloadOpen(false)}
                  className="text-neutral-500 hover:text-neutral-900 text-[10.5px] uppercase tracking-widest font-bold transition-colors underline cursor-pointer bg-transparent border-none"
                >
                  Fermer cet espace
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- DYNAMIC ORDER TRACKING MODAL COMPONENT (SUIVI DYNAMIQUE) --- */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <div className="absolute inset-0 animate-fade-in" onClick={() => setIsTrackingModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white max-w-lg w-full rounded-none overflow-hidden shadow-2xl relative border-t-4 border-t-emerald-800 z-10 p-5 md:p-6"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsTrackingModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {trackingError ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-lg text-neutral-900 uppercase tracking-tight">
                  {language === "fr" ? "Commande Introuvable" : "Nudɔdɔ Sia Mele Afisia O"}
                </h3>
                <p className="text-xs text-neutral-600">
                  {trackingError}
                </p>
                <button
                  onClick={() => setIsTrackingModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  {language === "fr" ? "Retour à l'accueil" : "Trɔ yi aƒeme"}
                </button>
              </div>
            ) : trackingOrderData ? (() => {
              const order = trackingOrderData;
              // determine active step index based on orderStatus and paymentStatus
              let activeStep = 0; // 0: En préparation, 1: Prêt, 2: En livraison, 3: Livré
              
              if (order.orderStatus === "Livré" || order.orderStatus === "Livre") {
                activeStep = 3;
              } else if (order.orderStatus === "En cours de livraison" || order.orderStatus === "EnLivraison") {
                activeStep = 2;
              } else if (order.orderStatus === "Prêt" || order.orderStatus === "Prêt à être expédié" || order.orderStatus === "Pret") {
                activeStep = 1;
              } else {
                activeStep = 0;
              }

              const steps = [
                {
                  labelFr: "Commande Enregistrée",
                  labelEwe: "Nudɔdɔ Enɔta",
                  descFr: "Votre commande est enregistrée et en cours de traitement.",
                  descEwe: "Woxɔ wò nudɔdɔ pɛpɛɛpɛ, míele dɔ wɔm le eŋu."
                },
                {
                  labelFr: "Préparation Terminée",
                  labelEwe: "Dzadzraɖo Wu Nu",
                  descFr: "Le colis est emballé avec soin par l'artisan local.",
                  descEwe: "Afitɔnu dɔwɔla la bla wò nudraɖeƒe nyuie."
                },
                {
                  labelFr: "En Cours de Livraison",
                  labelEwe: "Le Mɔ Dzi",
                  descFr: "Le coursier d'Asime Express a récupéré votre commande.",
                  descEwe: "Asime Express dɔdɔla le mɔ dzi kple wò nudɔdɔ la."
                },
                {
                  labelFr: "Colis Livré",
                  labelEwe: "Woɖoe Na Wò",
                  descFr: "Commande livrée avec succès ! Merci de consommer local.",
                  descEwe: "Nudɔdɔ la ɖo asiwò! Akpe na dɔwɔla sɔsɔe dzesi la."
                }
              ];

              return (
                <div className="space-y-5">
                  {/* Header Title */}
                  <div className="text-center space-y-1">
                    <span className="text-[#d4af37] text-[10px] font-extrabold uppercase tracking-widest block">
                      {language === "fr" ? "Suivi en temps réel" : "Mɔ kplɔkplɔ le mɔnu dzi"}
                    </span>
                    <h3 className="font-display font-black text-xl text-neutral-900 uppercase tracking-tight">
                      {language === "fr" ? "Suivi de Commande" : "Nudɔdɔ fɔfɔ mɔ"}
                    </h3>
                    <div className="inline-block bg-neutral-100 text-neutral-800 text-[10px] font-mono font-bold px-3 py-1 border border-neutral-200">
                      #{order.id}
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-emerald-800 uppercase font-extrabold tracking-wider leading-none mb-1">
                        {language === "fr" ? "Statut Actuel" : "Nɔnɔme si me wòle"}
                      </p>
                      <h4 className="font-sans font-black text-xs text-emerald-950 uppercase">
                        {language === "fr" ? order.orderStatus : (order.orderStatus === "En préparation" ? "Dzadzraɖo me" : (order.orderStatus === "En cours de livraison" ? "Mɔ dzi" : "Livré"))}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider leading-none mb-1">
                        {language === "fr" ? "Paiement" : "Fetu"}
                      </p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 uppercase ${
                        order.paymentStatus === "Payé" || order.paymentStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {language === "fr" ? order.paymentStatus : (order.paymentStatus === "Payé" ? "Fetu wu" : "Fetu kpɔ o")}
                      </span>
                    </div>
                  </div>

                  {/* Progressive Timeline Visualizer */}
                  <div className="relative pl-6 space-y-6 py-2 border-l-2 border-neutral-200">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= activeStep;
                      const isActive = idx === activeStep;
                      return (
                        <div key={idx} className="relative">
                          {/* Circle bullet node indicator */}
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isActive 
                              ? "bg-emerald-800 border-emerald-800 text-white scale-125 shadow-md" 
                              : isCompleted 
                                ? "bg-emerald-100 border-emerald-800 text-emerald-800" 
                                : "bg-white border-neutral-300 text-neutral-300"
                          }`}>
                            {isCompleted && (
                              <svg className="w-2.5 h-2.5 stroke-current fill-none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <div className="text-left">
                            <h5 className={`font-sans font-black text-[11px] uppercase tracking-wider ${
                              isActive ? "text-emerald-900 font-extrabold" : isCompleted ? "text-neutral-800" : "text-neutral-400"
                            }`}>
                              {language === "fr" ? step.labelFr : step.labelEwe}
                            </h5>
                            <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5">
                              {language === "fr" ? step.descFr : step.descEwe}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary of Articles & Client */}
                  <div className="bg-stone-50 border border-stone-200 p-3 space-y-3">
                    <h5 className="text-[10px] font-black uppercase text-neutral-800 tracking-wider pb-1.5 border-b border-stone-200 flex items-center justify-between">
                      <span>{language === "fr" ? "Résumé de la commande" : "Nudɔdɔ nuɖoanyi"}</span>
                      <span className="font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </h5>
                    
                    {/* Items detail list */}
                    <div className="max-h-[100px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-stone-200">
                      {order.items && order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs text-neutral-700">
                          <span className="truncate max-w-[70%]">
                            <strong className="text-neutral-900">{item.product.nom}</strong> x{item.quantity}
                          </span>
                          <span className="font-mono font-bold text-neutral-900">{formatFCFA(item.product.prix * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="pt-2 border-t border-stone-200 text-left space-y-1 text-[11px] text-neutral-600">
                      <p>👤 <strong>Client :</strong> {order.shippingDetails?.name}</p>
                      <p>📞 <strong>Téléphone :</strong> {order.shippingDetails?.phone}</p>
                      <p>📍 <strong>Quartier :</strong> {order.shippingDetails?.quartier}</p>
                    </div>

                    {/* Grand Total */}
                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs font-sans font-black">
                      <span className="uppercase tracking-widest text-[10px] text-stone-500">{language === "fr" ? "TOTAL À PAYER" : "Fetu katã"}</span>
                      <span className="text-[#b8901c] font-black text-sm">{formatFCFA(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedInvoiceOrder(order);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="bg-[#d4af37] hover:bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{language === "fr" ? "Facture Officielle" : "Agbalẽnyigba"}</span>
                    </button>
                    <a
                      href={`https://wa.me/${ASIME_SETTINGS.WHATSAPP_MERCHANT_NUMBER}?text=${encodeURIComponent(
                        `Bonjour, je souhaite avoir une mise à jour sur ma commande #${order.id} s'il vous plaît.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-grow bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.005 5.234 5.25 0 11.726 0c3.14 0 6.087 1.22 8.305 3.44 2.22 2.219 3.442 5.161 3.441 8.297-.005 6.492-5.25 11.726-11.726 11.726-2.001 0-3.971-.51-5.714-1.48L0 24zm6.237-3.955c1.614.957 3.238 1.48 5.482 1.48 5.432 0 9.854-4.42 9.858-9.853.002-2.633-1.015-5.11-2.861-6.958C16.868 2.867 14.397 1.85 11.726 1.85 6.299 1.85 1.88 6.27 1.876 11.701c-.001 2.115.556 4.182 1.614 5.975l-.971 3.546 3.638-.937z"/>
                      </svg>
                      <span>{language === "fr" ? "Contacter le Vendeur" : "Bɔbɔ ka dɔwɔla"}</span>
                    </a>
                    <button
                      onClick={() => setIsTrackingModalOpen(false)}
                      className="px-5 py-3 bg-neutral-900 hover:bg-neutral-850 text-white font-extrabold text-[10px] uppercase tracking-widest transition-all cursor-pointer border border-neutral-950 text-center"
                    >
                      {language === "fr" ? "Fermer" : "Tutu"}
                    </button>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center py-10 space-y-3">
                <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-neutral-500">
                  {language === "fr" ? "Chargement des informations de suivi..." : "Mɔ kplɔkplɔ dɔwɔla le dɔ dzi..."}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* --- QUICK PREVIEW MODAL COMPONENT (MODALE D'APERÇU RAPIDE) --- */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          {/* Backdrop exit */}
          <div className="absolute inset-0" onClick={() => setQuickViewProduct(null)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white max-w-2xl w-full rounded-sm overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative border border-[#d4af37]/35 z-10"
          >
            {/* Close Button tag */}
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3.5 right-3.5 bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 p-1.5 rounded-full z-20 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
              
              {/* Left Image View */}
              <div className="aspect-square bg-neutral-50 relative flex items-center justify-center p-4">
                <img 
                  src={quickViewProduct.images[0]} 
                  alt={quickViewProduct.nom} 
                  className="w-full h-full object-cover border border-neutral-200 shadow-sm"
                />
                <div className="absolute top-3 left-3 bg-neutral-950 text-white px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest">
                  {quickViewProduct.categorie}
                </div>
                {quickViewProduct.prixBarre && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm">
                    Promo
                  </div>
                )}
              </div>

              {/* Right Descriptions & Actions Frame */}
              <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[#b8901c] text-[9.5px] font-black tracking-widest uppercase block mb-1">Aperçu Express</span>
                  <h3 className="font-display font-extrabold text-neutral-900 text-lg uppercase tracking-wider text-left">{quickViewProduct.nom}</h3>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                    ))}
                    <span className="text-[10px] text-neutral-400 font-bold ml-1 uppercase">(Client Validé)</span>
                  </div>

                  <p className="text-neutral-500 text-xs leading-relaxed font-sans line-clamp-4 mt-2 text-left">
                    {quickViewProduct.description}
                  </p>

                  <div className="mt-4 flex items-baseline gap-2.5">
                    {quickViewProduct.prixBarre ? (
                      <>
                        <span className="line-through text-neutral-400 text-xs font-semibold">
                          {formatFCFA(quickViewProduct.prixBarre)}
                        </span>
                        <span className="font-extrabold text-[#b8901c] text-base">
                          {formatFCFA(quickViewProduct.prix)}
                        </span>
                      </>
                    ) : (
                      <span className="font-extrabold text-neutral-900 text-base">
                        {formatFCFA(quickViewProduct.prix)}
                      </span>
                    )}
                  </div>

                  {/* Stock status indicator */}
                  <div className="mt-3 flex text-left bg-neutral-100 px-2.5 py-1 text-[9px] font-bold text-neutral-700 uppercase rounded-none border border-neutral-200">
                    Disponibilité : &nbsp;<span className={quickViewProduct.stock > 0 ? "text-emerald-700 font-extrabold" : "text-red-500 font-extrabold"}>{quickViewProduct.stock > 0 ? `En Stock (${quickViewProduct.stock})` : "Rupture"}</span>
                  </div>
                </div>

                {/* Core buttons actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, 1);
                      setQuickViewProduct(null);
                    }}
                    disabled={quickViewProduct.stock <= 0 && (!quickViewProduct.partenaire || quickViewProduct.partenaire === "Boutique en Direct")}
                    className={`w-full py-2.5 text-[10.5px] font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                      quickViewProduct.partenaire && quickViewProduct.partenaire !== "Boutique en Direct"
                        ? "bg-[#b8901c] hover:bg-neutral-950 text-white font-extrabold"
                        : quickViewProduct.stock > 0
                          ? "bg-neutral-950 hover:bg-[#d4af37] hover:text-neutral-950 text-white"
                          : "bg-neutral-200 text-neutral-450 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>
                      {quickViewProduct.partenaire && quickViewProduct.partenaire !== "Boutique en Direct"
                        ? "Acheter"
                        : quickViewProduct.stock > 0 ? "Ajouter au Panier" : "Rupture"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProduct(quickViewProduct);
                      setQuickViewProduct(null);
                      setCurrentGalleryIndex(0);
                    }}
                    className="w-full text-center py-2 text-[10px] text-neutral-550 hover:text-neutral-950 hover:underline font-bold uppercase tracking-widest"
                  >
                    Voir tous les détails et avis clients →
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* --- PRICE DROP WHATSAPP ALERT SIGNUP MODAL (INSCRIPTION AUX ALERTES BAISSE DE PRIX) --- */}
      {alertProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xs">
          {/* Backdrop exit */}
          <div className="absolute inset-0" onClick={() => setAlertProduct(null)}></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white max-w-md w-full rounded-sm shadow-2xl relative border border-[#d4af37]/45 overflow-hidden z-10"
          >
            {/* Top gold bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#b8901c] via-[#d4af37] to-[#b8901c]"></div>

            <button 
              onClick={() => setAlertProduct(null)}
              className="absolute top-4 right-4 bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 p-1.5 rounded-full cursor-pointer z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2.5">
                  <Bell className="w-6 h-6 text-[#b8901c] animate-pulse" />
                </div>
                <span className="text-[#b8901c] text-[9px] font-black uppercase tracking-widest block mb-1 font-sans">Alerte Baisse de Prix 🇹🇬</span>
                <h3 className="font-display font-black text-neutral-950 text-sm uppercase tracking-wider">
                  Recevoir une alerte WhatsApp
                </h3>
              </div>

              <div className="bg-stone-50 border border-stone-150 p-3 sm:p-4 rounded-sm flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-200 overflow-hidden shrink-0">
                  <img src={alertProduct.images[0]} alt={alertProduct.nom} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-bold text-neutral-950 truncate text-left">{alertProduct.nom}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="line-through text-[10px] text-neutral-400 font-semibold">{formatFCFA(alertProduct.prixBarre)}</span>
                    <span className="text-[11.5px] font-extrabold text-[#b8901c]">{formatFCFA(alertProduct.prix)}</span>
                  </div>
                </div>
              </div>

              <p className="text-neutral-500 text-[11px] leading-relaxed text-center font-sans">
                Saisissez votre numéro WhatsApp ci-dessous. Dès que cet article bénéficiera d'une réduction supplémentaire ou d'une baisse exclusive, notre équipe vous enverra un message automatique !
              </p>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!alertPhone) return;
                  setIsAlertSubmitting(true);
                  try {
                    const response = await fetch("/api/price-alerts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: alertProduct.id,
                        productName: alertProduct.nom,
                        phone: alertPhone,
                        currentPrice: alertProduct.prix
                      })
                    });
                    const resData = await response.json();
                    if (resData.success) {
                      showToast(`✓ Alerte WhatsApp enregistrée pour le numéro ${alertPhone} !`);
                      setAlertProduct(null);
                      setAlertPhone("");
                    } else {
                      alert(resData.error || "Une erreur s'est produite.");
                    }
                  } catch (err) {
                    console.error("Error setting alert:", err);
                    showToast("✓ Abonnement enregistré localement !");
                    setAlertProduct(null);
                    setAlertPhone("");
                  } finally {
                    setIsAlertSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1.5 text-left">Numéro WhatsApp Valide <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#444] font-bold text-xs pointer-events-none">
                      <span className="text-[14px]">🇹🇬</span>
                      <span>+228</span>
                    </div>
                    <input 
                      type="tel"
                      required
                      placeholder="90 00 00 00"
                      value={alertPhone}
                      onChange={(e) => setAlertPhone(e.target.value)}
                      className="w-full pl-16 pr-4 py-2.5 text-xs border border-neutral-300 bg-white font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                    />
                  </div>
                  <span className="text-[9px] text-[#b8901c] font-semibold mt-1.5 uppercase block tracking-wider leading-relaxed text-left">
                    Saisissez vos 8 chiffres (par ex. 90123456) ou numéro complet avec indicatif.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isAlertSubmitting || !alertPhone}
                  className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white py-2.5 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isAlertSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Phone className="w-3.5 h-3.5" />
                      <span>Activer l'Alerte WhatsApp</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}



      {/* ========================================================= */}
      {/* --- CUSTOMER AUTH MODAL (CONNEXION & INSCRIPTION) --- */}
      {/* ========================================================= */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-xs animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white max-w-md w-full rounded-sm overflow-hidden shadow-2xl relative border border-[#d4af37]/35"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-3.5 right-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 p-1.5 rounded-full z-10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-neutral-950 text-[#d4af37] border border-[#d4af37]/35 rounded-full flex items-center justify-center font-display font-black text-xl mx-auto mb-3">
                S
              </div>
              <h3 className="font-display font-black uppercase text-base text-neutral-900 tracking-wider">
                {authMode === "login" ? "Connexion Espace Client" : "Créer un Compte Client"}
              </h3>
              <p className="text-[10px] text-neutral-500 uppercase font-semibold tracking-widest mt-1 mb-6">
                {authMode === "login" ? "Accédez à vos avantages exclusifs" : "Profitez d'un suivi de commande ultra-rapide"}
              </p>

              {authError && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center rounded-none">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1 text-left">Nom complet <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      required
                      placeholder="Koffi Mensah"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-neutral-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1 text-left">Adresse Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email"
                    required
                    placeholder="koffi@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1 text-left">Mot de passe <span className="text-red-500">*</span></label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-neutral-900 font-mono"
                  />
                </div>

                {authMode === "register" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1 text-left">WhatsApp (+228) <span className="text-[#b8901c]">(Optionnel)</span></label>
                      <input 
                        type="tel"
                        placeholder="90123456"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-neutral-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-1 text-left">Quartier (Lomé/Ville) <span className="text-[#b8901c]">(Optionnel)</span></label>
                      <input 
                        type="text"
                        placeholder="Adidogomé"
                        value={authQuartier}
                        onChange={(e) => setAuthQuartier(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white rounded-none focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-neutral-900"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 py-2.5 font-bold uppercase tracking-widest text-[11px] transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isAuthSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {authMode === "login" ? <Unlock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{authMode === "login" ? "Se connecter" : "Créer mon compte"}</span>
                    </>
                  )}
                </button>


              </form>

              {/* Toggle Login/Sign-up Mode trigger */}
              <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-500">
                  {authMode === "login" ? "Nouveau sur Asime ?" : "Vous possédez déjà un compte ?"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                  className="mt-1 text-xs font-bold text-[#b8901c] hover:text-neutral-950 uppercase tracking-widest transition-colors decoration-none cursor-pointer"
                >
                  {authMode === "login" ? "S'inscrire GRATUITEMENT et Gagner" : "Se Connecter à mon Espace"}
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- FLOATING CUSTOMER PROFILE DRAWER (ESPACE CLIENT) --- */}
      {/* ========================================================= */}
      {isProfileOpen && user && (
        <div className={`fixed inset-0 z-50 flex transition-all duration-300 animate-fade-in ${
          sellerDashboardActive 
            ? "bg-white w-screen h-screen" 
            : "justify-end bg-neutral-950/75 backdrop-blur-xs"
        }`}>
          <div className={`bg-white w-full h-full flex flex-col justify-between relative transition-all duration-300 ${
            sellerDashboardActive 
              ? "max-w-full h-full border-0 rounded-none shadow-none" 
              : "max-w-lg border-l border-neutral-200 shadow-2xl"
          }`}>
            
            {/* Drawer Header - hidden when seller workspace is active for a true full-screen experience */}
            {!sellerDashboardActive && (
              <div className="p-4 text-white flex items-center justify-between transition-colors duration-300 bg-neutral-950">
                <div className="flex items-center gap-2 text-left">
                  <User className="w-5 h-5 text-[#d4af37]" />
                  <div>
                    <h3 className="font-display font-extrabold uppercase text-xs tracking-wider">
                      Mon Espace Client Premium
                    </h3>
                    <p className="text-[9px] text-[#d4af37] font-semibold uppercase tracking-widest">
                      Connecté en tant que {user.name.split(" ")[0]}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    setSellerDashboardActive(false);
                    setInitialDashboardView("menu");
                  }}
                  className="text-white hover:text-[#d4af37] p-1.5 cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-black/20 hover:bg-black/35 transition-all rounded px-2.5 py-1"
                >
                  <span>Fermer l'espace</span>
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

            {/* Drawer Content - Modular Multi-role Dashboards */}
            <div className="flex-grow overflow-hidden flex flex-col">
              <MultiRoleDashboards
                user={user}
                setUser={setUser}
                token={token}
                products={products}
                setProducts={setProducts}
                showToast={showToast}
                formatFCFA={formatFCFA}
                closeDrawer={() => {
                  setIsProfileOpen(false);
                  setSellerDashboardActive(false);
                  setInitialDashboardView("menu");
                }}
                onSelectProduct={(prod) => {
                  setSelectedProduct(prod);
                  setIsProfileOpen(false);
                  setSellerDashboardActive(false);
                  setInitialDashboardView("menu");
                }}
                onLogout={() => {
                  logoutCustomer();
                  setSellerDashboardActive(false);
                  setInitialDashboardView("menu");
                }}
                onTabChange={(tab) => {
                  setSellerDashboardActive(tab === "vendeur" || tab === "affilie" || tab === "help");
                }}
                initialView={initialDashboardView}
                onTrackOrder={(orderId: string) => fetchTrackingDetails(orderId)}
              />
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Image 2 style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-3 px-6 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
        {/* Accueil */}
        <button 
          onClick={() => {
            setActiveTab("accueil");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center gap-1 bg-transparent border-0 p-1 cursor-pointer transition-colors ${activeTab === "accueil" ? "text-[#d4af37]" : "text-neutral-500 hover:text-neutral-905"}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t("bottom_home")}</span>
        </button>





        {/* Profil / Connexion */}
        <button 
          onClick={() => {
            if (user) {
              setEditName(user.name);
              setEditPhone(user.phone || "");
              setEditQuartier(user.quartier || "");
              setIsProfileOpen(true);
            } else {
              setAuthMode("login");
              setAuthError("");
              setIsAuthOpen(true);
            }
          }}
          className={`flex flex-col items-center gap-1 bg-transparent border-0 p-1 cursor-pointer transition-colors ${isProfileOpen ? "text-[#d4af37]" : "text-neutral-500 hover:text-neutral-905"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[64px]">{user ? user.name.split(" ")[0] : (language === "fr" ? "Compte" : "Kɔnta")}</span>
        </button>

        {/* Panier */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center gap-1 bg-transparent border-0 p-1 cursor-pointer transition-colors relative ${isCartOpen ? "text-[#d4af37]" : "text-neutral-500 hover:text-neutral-905"}`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-[#d4af37] text-neutral-950 text-[8px] font-black rounded-full flex items-center justify-center px-1 border border-white">
                {getCartCount()}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">{t("bottom_cart")}</span>
        </button>

        {/* Menu (Hamburger) */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center gap-1 bg-transparent border-0 p-1 cursor-pointer transition-colors ${isMobileMenuOpen ? "text-[#d4af37]" : "text-neutral-500 hover:text-neutral-905"}`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Menu</span>
        </button>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
          />
          
          {/* Mobile Menu Drawer Content (Slide up from bottom) */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 bg-white border-t border-neutral-200 rounded-t-xl p-6 shadow-2xl pb-safe select-none text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                {renderLogoNode("w-9 h-9")}
                <div>
                <h3 className="font-sans font-bold tracking-[0.15em] text-[#0F5132] uppercase text-sm leading-none">ASIME</h3>
                <p className="text-[8px] text-[#D97706] tracking-[0.08em] leading-normal font-semibold uppercase mt-1 font-sans">{t("slogan")}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 px-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-950 border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Links List */}
          <div className="space-y-1.5">
            {[
              { label: language === "fr" ? "Accueil du site" : "Aƒeme dzesi", value: "accueil" as const, desc: language === "fr" ? "Découvrir nos sélections phares et histoire" : "Kpɔ míaƒe adzɔnu dzesiwo kple ŋutinya" },
              { label: language === "fr" ? "Catalogue de Produits" : "Adzɔnuwo kpeɖodzi", value: "catalogue" as const, desc: language === "fr" ? "Explorer l'ensemble de nos collections" : "Kpɔ míaƒe adzɔnu hame hamewo katã" },
              { label: language === "fr" ? "Le Journal de Asime" : "Asime Nyadzɔdzɔwo", value: "blog" as const, desc: language === "fr" ? "Articles, conseils de terroir et innovations" : "Nyadzɔdzɔwo kple dɔwɔlawo ƒe aɖaŋuɖoɖowo" },
              { label: language === "fr" ? "Nous Contacter" : "Mía Kadodowo", value: "contact" as const, desc: language === "fr" ? "Support client, WhatsApp et localisation physique" : "WhatsApp kple afisi míele le Lomé" }
            ].map((link) => (
              <button
                key={link.value}
                onClick={() => {
                  setActiveTab(link.value);
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full p-3.5 flex flex-col text-left gap-0.5 rounded-sm transition-colors cursor-pointer border-0 ${
                  activeTab === link.value 
                    ? "bg-amber-500/10 text-neutral-900 border-l-4 border-[#d4af37]" 
                    : "bg-transparent text-neutral-700 hover:bg-stone-50 border-l-4 border-transparent"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{link.label}</span>
                <span className="text-[10px] text-neutral-500 leading-tight font-sans font-normal">{link.desc}</span>
              </button>
            ))}

            <div className="h-[1px] bg-neutral-100 my-4" />

            {/* Language Selection inside Mobile Menu */}
            <button
              onClick={() => {
                setLanguage(language === "fr" ? "ee" : "fr");
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-3.5 bg-neutral-50 text-neutral-850 hover:bg-stone-100 rounded-sm flex items-center justify-between cursor-pointer border border-neutral-200"
            >
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0f5132]">
                  {language === "fr" ? "Passer en Eʋegbe" : "Passer en Français"}
                </span>
                <span className="text-[10px] text-neutral-500 font-sans leading-tight">
                  {language === "fr" ? "Trɔ gbe yi Eʋegbe me na dɔwɔwɔ asitɔ" : "Trɔ yi Fransegbe me na dɔwɔwɔ asitɔ"}
                </span>
              </div>
              <Globe className="w-4 h-4 text-[#0f5132]" />
            </button>

            {/* Share & Download App Link */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsShareDownloadOpen(true);
              }}
              className="w-full p-3.5 bg-transparent text-neutral-800 hover:bg-stone-50 rounded-sm flex items-center justify-between cursor-pointer border-0"
            >
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800">Partager &amp; Télécharger</span>
                <span className="text-[10px] text-neutral-500 font-sans leading-tight">Installer l'application ou partager le lien</span>
              </div>
              <Share2 className="w-4 h-4 text-[#b8901c]" />
            </button>

              {/* Offline mode indicator of the app */}
              <div className="mt-6 p-4 bg-emerald-50 text-emerald-950 text-center rounded-sm border border-emerald-100">
                <p className="text-[10.5px] font-bold uppercase tracking-wide">🌿 Terroir Solidaire du Togo 🇹🇬</p>
                <p className="text-[9.5px] text-emerald-700 mt-1 leading-normal font-sans">
                  Plus de 90% des revenus des produits du terroir sont directement reversés aux coopératives agricoles et artisans d'art locaux du Togo.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- iOS Safari PWA Installation Modal Guide --- */}
      {showIosGuide && (
        <div 
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
          onClick={() => setShowIosGuide(false)}
        >
          <div 
            className="bg-white max-w-sm w-full border border-[#d4af37]/35 p-6 space-y-4 text-center relative rounded-none shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="absolute top-3 right-3 bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 p-1.5 rounded-full z-10 transition-colors cursor-pointer border-none"
            >
              <X className="w-3.5 h-3.5 cursor-pointer" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-[#b8901c] font-black uppercase tracking-widest bg-[#d4af37]/10 px-2.5 py-0.5">
                Guide iPad / iPhone 📱
              </span>
              <h3 className="font-display font-extrabold uppercase text-neutral-950 text-base tracking-wider">
                Installer sur votre Appareil Apple
              </h3>
              <p className="text-[11px] text-neutral-500 font-sans leading-normal">
                Suivez ces instructions pour épingler notre boutique sur votre écran d'accueil avec notre logo officiel :
              </p>
            </div>

            <div className="text-left space-y-3.5 bg-neutral-50 p-4 border border-neutral-150 font-sans text-xs">
              <div className="flex items-start gap-2.5">
                <span className="bg-[#0f5132] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <p className="text-neutral-700 leading-tight">
                  Appuyez sur le bouton de <strong>Partage</strong> <span className="inline-block bg-neutral-200 px-1 py-0.5 rounded-xs text-[10px]">🗳️ (un carré avec flèche vers le haut)</span> en bas de votre écran Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-[#0f5132] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <p className="text-neutral-700 leading-tight">
                  Faites défiler le menu d'options vers le bas et sélectionnez <strong>"Sur l'écran d'accueil"</strong> <span className="inline-block bg-[#0f5132]/10 text-[#0f5132] px-1.5 py-0.5 font-bold text-[9px] uppercase tracking-wide">➕</span>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-[#0f5132] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <p className="text-neutral-700 leading-tight">
                  Cliquez sur <strong>"Ajouter"</strong> dans le coin supérieur droit pour valider. Une icône Asime sera créée sur votre mobile !
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 font-display font-extrabold text-[10px] uppercase tracking-widest py-2.5 transition-colors cursor-pointer rounded-none border-none"
            >
              J'ai compris !
            </button>
          </div>
        </div>
      )}

      {/* --- Generic / Desktop Browser Installation Modal Guide --- */}
      {showGenericInstallGuide && (
        <div 
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
          onClick={() => setShowGenericInstallGuide(false)}
        >
          <div 
            className="bg-white max-w-sm w-full border border-[#d4af37]/35 p-6 space-y-4 text-center relative rounded-none shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setShowGenericInstallGuide(false)}
              className="absolute top-3 right-3 bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 p-1.5 rounded-full z-10 transition-colors cursor-pointer border-none"
            >
              <X className="w-3.5 h-3.5 cursor-pointer" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-[#b8901c] font-black uppercase tracking-widest bg-[#d4af37]/10 px-2.5 py-0.5">
                Aide d'installation 💻
              </span>
              <h3 className="font-display font-extrabold uppercase text-neutral-950 text-base tracking-wider">
                Comment installer Asime Togo?
              </h3>
              <p className="text-[11px] text-neutral-500 font-sans leading-normal">
                Votre navigateur n'a pas déclenché de pop-up d'installation directe. Vous pouvez l'ajouter très simplement :
              </p>
            </div>

            <div className="text-left space-y-3.5 bg-neutral-50 p-4 border border-neutral-150 font-sans text-xs">
              <div className="flex items-start gap-2.5">
                <span className="bg-[#0f5132] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <p className="text-neutral-700 leading-tight">
                  Regardez dans la <strong>barre d'adresse</strong> en haut de votre écran, cliquez sur l'icône de petit ordinateur/téléchargement ou cherchez l'icône de l'application dans votre navigateur.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-[#0f5132] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <p className="text-neutral-700 leading-tight">
                  Dans les options de votre navigateur (Chrome, Edge, Firefox), ouvrez le <strong>Menu (trois points verticaux)</strong>, et sélectionnez <strong>"Installer Asime Togo"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGenericInstallGuide(false)}
              className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 font-display font-extrabold text-[10px] uppercase tracking-widest py-2.5 transition-colors cursor-pointer rounded-none border-none"
            >
              Fermer l'aide
            </button>
          </div>
        </div>
      )}

      {/* --- OFFICIAL PRINTABLE INVOICE MODAL --- */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedInvoiceOrder}
        merchantPhone={ASIME_SETTINGS.WHATSAPP_MERCHANT_NUMBER}
      />

      {/* --- AI ASSISTANT AYA WIDGET --- */}
      <AIAssistantWidget
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onSearchProduct={(q) => setSearchQuery(q)}
      />

    </div>
  );
}

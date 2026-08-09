import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
const LOGO_DESIGNS = [
  { id: "monogramme_plume", name: "Lettre A & Plume d'Or (Officiel) 🪶", src: "/icon.svg" },
];
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
  CheckCircle2
} from "lucide-react";
import { Product } from "./types";
import AdminStats from "./components/AdminStats";
import { InvoiceModal } from "./components/InvoiceModal";
import { INITIAL_PROMO_SLIDES, PromoSlide } from "./data/promoBanners";

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<"catalog" | "banners" | "stats" | "settings" | "requests">("catalog");
  const [adminPromoSlides, setAdminPromoSlides] = useState<PromoSlide[]>(() => {
    try {
      const saved = localStorage.getItem("asime_promo_slides");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMO_SLIDES;
  });
  const [promoSaveSuccess, setPromoSaveSuccess] = useState(false);

  const saveAdminPromoSlides = (newSlides: PromoSlide[]) => {
    setAdminPromoSlides(newSlides);
    try {
      localStorage.setItem("asime_promo_slides", JSON.stringify(newSlides));
    } catch (e) {
      console.error("Failed to save promo slides to localStorage", e);
    }
    setPromoSaveSuccess(true);
    setTimeout(() => setPromoSaveSuccess(false), 3000);
  };

  const handleSlideImageUpload = (index: number, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const updated = [...adminPromoSlides];
        updated[index] = { ...updated[index], imageUrl: reader.result as string };
        saveAdminPromoSlides(updated);
      }
    };
    reader.readAsDataURL(file);
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
  const [activeLogoId, setActiveLogoId] = useState("monogramme_plume");
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
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products inside administration console:", err);
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

  useEffect(() => {
    fetchProducts();
    fetchPartners();
    // Check local session token
    const token = sessionStorage.getItem("asime_admin_token");
    if (token === "asime2026-auth-session") {
      setIsAdminAuthenticated(true);
    }
    
    // Fetch global server-side settings
    fetch("/api/settings?t=" + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.whatsappMerchantNumber) setWhatsappDisplaySetting(data.whatsappMerchantNumber);
          if (data.activeLogoId) setActiveLogoId(data.activeLogoId);
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
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
    setFormError("");
    setFormSuccess("");
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 4 - formImages.length;
    if (remainingSlots <= 0) {
      setFormError("Vous pouvez télécharger jusqu'à 4 images au maximum.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setFormImages(prev => [...prev, base64String].slice(0, 4));
      };
      reader.onerror = () => {
        setFormError("Erreur lors de la lecture d'un fichier image.");
      };
      reader.readAsDataURL(file);
    });

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

    const payload = {
      id: editingProduct?.id || null,
      nom: formName,
      description: formDescription,
      prix: parsedPrix,
      prixBarre: parsedPrixBarre,
      images: formImages.length > 0 ? formImages : ["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"],
      categorie: formCategory,
      phare: formPhare,
      stock: parsedStock,
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
        setFormSuccess(editingProduct ? "Produit mis à jour avec succès !" : "Nouveau produit enregistré avec succès !");
        fetchProducts();
        setTimeout(() => {
          resetForm();
        }, 1500);
      } else {
        setFormError(responseData.error || "Erreur de sauvegarde.");
      }
    } catch (err) {
      setFormError("Erreur réseau. Impossible de sauvegarder.");
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
        fetchProducts();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (e) {
      alert("Impossible de supprimer le produit.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 font-sans">
      
      {/* Top Banner Administration Header */}
      <nav className="bg-neutral-950 text-white py-4 px-6 shadow-md border-b border-[#d4af37]/35">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🇹🇬</span>
            <span className="font-display font-black text-sm uppercase tracking-widest text-[#d4af37]">Asime Togo</span>
            <span className="bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-sm ml-2">Console Administration</span>
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
            <p className="text-[10px] text-neutral-400 mt-6 uppercase tracking-wider">Indice : Utilisez "asime2026" pour vous connecter.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* Session Info card */}
            <div className="bg-neutral-950 text-white p-6 rounded-sm border border-[#d4af37]/35 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-[#d4af37]" />
                  <h2 className="font-display font-extrabold text-lg uppercase tracking-wider">Bienvenue Gérant Asime</h2>
                </div>
                <p className="text-xs text-neutral-300 mt-1">Vous pouvez ajouter de nouveaux produits, modifier le catalogue national en temps réel et contrôler les stocks.</p>
              </div>
              <button 
                onClick={handleAdminLogout}
                className="border border-white/20 text-white hover:bg-white/10 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-colors cursor-pointer"
              >
                Se Déconnecter
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-neutral-200 gap-2 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "catalog"
                    ? "border-[#d4af37] text-neutral-955 font-black"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Gestion Catalogue</span>
              </button>
              <button
                onClick={() => setActiveTab("banners")}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "banners"
                    ? "border-[#d4af37] text-neutral-955 font-black"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                <span>Affiches & Bannières ({adminPromoSlides.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "requests"
                    ? "border-[#d4af37] text-neutral-955"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
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
                className={`py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "stats"
                    ? "border-[#d4af37] text-neutral-955"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Statistiques de Ventes</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "settings"
                    ? "border-[#d4af37] text-neutral-955"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configuration de la Redirection</span>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral-100 mb-4 gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-neutral-950">
                      Base de Données ({products.length} produits)
                    </h3>
                    <p className="text-[9.5px] text-neutral-400 uppercase tracking-wider font-semibold">Filtrer par Boutique / Vendeur</p>
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
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-405 text-neutral-400" />
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

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-600 text-[10px]">
                        <th className="py-2.5 px-3">Produit</th>
                        <th className="py-2.5 px-2">Catégorie</th>
                        <th className="py-2.5 px-2 text-right">Prix</th>
                        <th className="py-2.5 px-2 text-center">Stock</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => {
                          const matchesSearch = p.nom.toLowerCase().includes(adminSearchQuery.toLowerCase());
                          const matchesPartner = adminPartnerFilter === "Tous" || (p.partenaire || "Boutique en Direct") === adminPartnerFilter;
                          return matchesSearch && matchesPartner;
                        })
                        .map(prod => (
                          <tr key={prod.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-sm overflow-hidden bg-neutral-100 shrink-0">
                                  <img src={prod.images[0]} alt={prod.nom} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-bold text-neutral-900 line-clamp-1">{prod.nom}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[8px] bg-amber-550/10 text-amber-700 bg-amber-50 border border-[#d4af37]/25 font-black px-1 py-0.1 select-none rounded-[1px] uppercase tracking-wider">
                                      {prod.partenaire || "Boutique en Direct"}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-mono tracking-wider">{prod.id}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          <td className="py-3 px-2 text-[#b8901c] font-medium uppercase tracking-wider text-[10.5px] font-sans">{prod.categorie.split(" ")[0]}</td>
                          <td className="py-3 px-2 text-right font-bold text-neutral-900 font-mono">
                            {formatFCFA(prod.prix)}
                            {prod.prixBarre && (
                              <div className="line-through text-neutral-400 text-[10px] font-normal">{formatFCFA(prod.prixBarre)}</div>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              prod.stock > 10 
                                ? "bg-green-100 text-green-700" 
                                : prod.stock > 0 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {prod.stock}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditProduct(prod)}
                                className="p-1.5 text-neutral-505 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 cursor-pointer border border-neutral-200 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.nom)}
                                className="p-1.5 text-red-650 text-red-600 hover:text-white hover:bg-red-600 cursor-pointer border border-neutral-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
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
                  <h3 className="font-display font-extrabold text-lg uppercase tracking-wider text-white">Gestion des Affiches & Images de l'Accueil</h3>
                </div>
                <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  Remplacez facilement les affiches promotionnelles affichées dans le carrousel principal de la page d'accueil. 
                  Vous pouvez **télécharger directement une image** depuis votre appareil ou **coller une URL d'image**.
                </p>
              </div>
              <button
                onClick={handleAddNewSlide}
                className="bg-[#d4af37] hover:bg-amber-400 text-neutral-955 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Affiche</span>
              </button>
            </div>

            {promoSaveSuccess && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 p-3 rounded text-xs font-bold flex items-center gap-2">
                <span>✓</span>
                <span>Affiches mises à jour et enregistrées avec succès ! La page d'accueil a été actualisée.</span>
              </div>
            )}

            {/* Grid of Banner Slides */}
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

                    {/* Image Preview Box */}
                    <div className="relative w-full h-48 bg-neutral-900 rounded border border-neutral-200 overflow-hidden mb-3 group">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.titleFr || "Affiche Promo"} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-xs font-bold">
                        {slide.titleFr}
                      </div>
                    </div>

                    {/* Image Change Controls */}
                    <div className="space-y-2 mb-4 bg-stone-50 p-3 rounded border border-stone-200">
                      <label className="block text-[10px] font-bold text-neutral-800 uppercase tracking-wider">
                        Remplacer le visuel / l'image :
                      </label>
                      
                      {/* Option 1: File Upload */}
                      <label className="w-full bg-neutral-900 hover:bg-[#d4af37] text-white hover:text-neutral-955 font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer">
                        <ImageIcon className="w-4 h-4 text-[#d4af37] group-hover:text-neutral-955" />
                        <span>Télécharger une Image (Fichier)</span>
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

                      {/* Option 2: Image URL */}
                      <div className="pt-1">
                        <span className="text-[9px] text-neutral-500 block mb-1">Ou collez l'URL direct de l'image :</span>
                        <input 
                          type="url"
                          value={slide.imageUrl}
                          onChange={(e) => {
                            const updated = [...adminPromoSlides];
                            updated[index] = { ...updated[index], imageUrl: e.target.value };
                            saveAdminPromoSlides(updated);
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full text-xs font-mono border border-stone-300 p-2 rounded bg-white text-neutral-900 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
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

                  {/* Logo Style Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-3">
                      Design Officiel du Logo de l'Application <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[10px] text-neutral-500 mb-4 leading-relaxed">
                      Sélectionnez le style de logo haut de gamme à appliquer globalement sur l'en-tête de la boutique pour tous vos visiteurs sur ordinateur et mobile.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {LOGO_DESIGNS.map((logo) => {
                        const isSelected = activeLogoId === logo.id;
                        return (
                          <div 
                            key={logo.id}
                            onClick={() => setActiveLogoId(logo.id)}
                            className={`group relative flex flex-col items-center justify-between p-3 border rounded-md cursor-pointer transition-all bg-white hover:shadow-md ${
                              isSelected 
                                ? "border-[#d4af37] bg-amber-50/20 shadow-xs ring-1 ring-[#d4af37]" 
                                : "border-neutral-200 hover:border-neutral-400"
                            }`}
                          >
                             <div className="w-16 h-16 flex items-center justify-center p-1 rounded bg-white border border-neutral-200 shadow-3xs mb-2.5 overflow-hidden">
                               {logo.id === "monogramme_plume" ? (
                                 <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                   <path d="M 43,15 L 57,15 L 81,81 L 66,81 L 50,38 L 34,81 L 19,81 Z" fill="#0D5E2F" />
                                   <g>
                                     <path d="M 27,73 C 40,49 57,39 77,46 C 60,59 44,74 27,73 Z" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                                     <path d="M 27,73 C 41,63 59,51 77,46 C 60,57 44,72 27,73 Z" fill="#D97706" />
                                     <path d="M 27,73 C 40,51 57,41 77,46 C 59,51 41,63 27,73 Z" fill="#FAA61A" />
                                     <path d="M 27,73 C 41,63 59,51 77,46" stroke="white" strokeWidth="0.85" strokeLinecap="round" />
                                   </g>
                                 </svg>
                               ) : (
                                 <img 
                                   src={logo.src} 
                                   alt={logo.name} 
                                   className="w-full h-full object-contain rounded" 
                                   referrerPolicy="no-referrer"
                                 />
                               )}
                             </div>
                            <span className="text-[9px] text-center font-bold text-neutral-800 leading-tight group-hover:text-neutral-950">
                              {logo.name}
                            </span>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-[#d4af37] text-neutral-955 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                Actif
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {saveConfigSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 text-xs rounded-sm font-bold animate-fade-in flex items-center gap-2">
                      <span className="text-sm">✓</span>
                      <span>Configuration enregistrée avec succès ! Le logo et le numéro WhatsApp ont été mis à jour globalement sur le serveur.</span>
                    </div>
                  )}

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
    </div>
  );
}

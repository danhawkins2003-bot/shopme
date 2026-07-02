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
  FileText
} from "lucide-react";
import { Product } from "./types";
import AdminStats from "./components/AdminStats";

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<"catalog" | "stats" | "settings" | "partners">("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [populating, setPopulating] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminPartnerFilter, setAdminPartnerFilter] = useState("Tous");

  const [whatsappDisplaySetting, setWhatsappDisplaySetting] = useState("22890000000");
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);

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
      const res = await fetch("/api/partners");
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
      const res = await fetch("/api/products");
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

  useEffect(() => {
    fetchProducts();
    fetchPartners();
    // Check local session token
    const token = sessionStorage.getItem("asime_admin_token");
    if (token === "asime2026-auth-session") {
      setIsAdminAuthenticated(true);
    }
    const storedWp = localStorage.getItem("asime_whatsapp_merchant_number") || "22890000000";
    setWhatsappDisplaySetting(storedWp);
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
                    ? "border-[#d4af37] text-neutral-955"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Gestion Catalogue</span>
              </button>
              <button
                onClick={() => setActiveTab("partners")}
                className={`py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "partners"
                    ? "border-[#d4af37] text-neutral-955"
                    : "border-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Profils Partenaires/Contrats</span>
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
                      Partenaire ou Client Contractuel <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formPartenaire}
                      onChange={(e) => setFormPartenaire(e.target.value)}
                      className="w-full border border-neutral-300 rounded-sm px-2 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none bg-white font-medium"
                    >
                      {["Boutique en Direct", ...Array.from(new Set(partnersList.map(p => p.name)))].map(opt => (
                        <option key={opt} value={opt}>
                          {opt === "Boutique en Direct" ? "Boutique en Direct (Stock Interne)" : opt}
                        </option>
                      ))}
                      {formPartenaire && formPartenaire !== "Boutique en Direct" && !partnersList.some(p => p.name === formPartenaire) && (
                        <option value={formPartenaire}>{formPartenaire} (Non enregistré)</option>
                      )}
                    </select>
                    <p className="text-[9px] text-neutral-400 mt-1 uppercase">
                      Sélectionnez "Boutique en Direct" pour vos stocks, ou un partenaire client configuré. Vous pouvez créer un partenaire sous l'onglet "Profils Partenaires" ci-dessus.
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
                    <p className="text-[9.5px] text-neutral-400 uppercase tracking-wider font-semibold">Filtrer par contrat / partenaire client</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Partner Selector Filter */}
                    <select
                      value={adminPartnerFilter}
                      onChange={(e) => setAdminPartnerFilter(e.target.value)}
                      className="border border-neutral-300 rounded-sm px-2.5 py-1.5 text-xs outline-none bg-white font-sans text-neutral-800 font-semibold tracking-wide uppercase cursor-pointer"
                    >
                      <option value="Tous">Tous les contrats/clients</option>
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
        ) : activeTab === "partners" ? (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* Partner Dashboard stats overview row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Contrats Actifs</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-neutral-955">{partnersData.length}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase">En cours</span>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Produits Associés</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-neutral-955">
                    {partnersData.reduce((acc, p) => acc + p.totalProducts, 0)}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase">Au total</span>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Volume de Stock</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-neutral-955">
                    {partnersData.reduce((acc, p) => acc + p.totalStock, 0)}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase">Unités</span>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-xs border-l-4 border-amber-500">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Alertes Ruptures / Stocks Bas</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-amber-700">
                    {partnersData.reduce((acc, p) => acc + p.outOfStockCount, 0)}
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium uppercase font-sans">À réapprovisionner</span>
                </div>
              </div>
            </div>

            {/* Form to Add Partner */}
            <div className="bg-white border border-neutral-200 rounded-sm p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <Plus className="w-4 h-4 text-[#b8901c]" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900 font-sans">Enregistrer un Nouveau Partenaire Contractuel</h3>
              </div>

              <form onSubmit={handleCreatePartner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">
                      Nom du Partenaire / Client <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      value={partnerFormName}
                      onChange={(e) => setPartnerFormName(e.target.value)}
                      placeholder="Ex: Coopérative Atakpamé, Entreprise Kpessi..."
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-neutral-50/50 focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">
                      Description ou Notes (Facultatif)
                    </label>
                    <input 
                      type="text"
                      value={partnerFormDescription}
                      onChange={(e) => setPartnerFormDescription(e.target.value)}
                      placeholder="Ex: Contrat de revente locale d'artisanat"
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-neutral-50/50 focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">
                      Type de Contrat de Collaboration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={partnerFormContractType}
                      onChange={(e) => {
                        const val = e.target.value as "subscription" | "commission";
                        setPartnerFormContractType(val);
                        if (val === "subscription") {
                          setPartnerFormAutoPublish(true);
                        } else {
                          setPartnerFormAutoPublish(false);
                        }
                      }}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-neutral-50/50 focus:ring-1 focus:ring-amber-500 font-sans"
                    >
                      <option value="subscription">Abonnement Mensuel (Le partenaire gère sa redirection/diffusion)</option>
                      <option value="commission">Commission sur Ventes (L'admin publie & gagne un %)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 bg-stone-50/50 p-3 rounded-sm border border-stone-200">
                  {partnerFormContractType === "subscription" ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">
                          Frais Mensuels d'Abonnement (FCFA / mois)
                        </label>
                        <input 
                          type="number"
                          min="0"
                          value={partnerFormMonthlyFee}
                          onChange={(e) => setPartnerFormMonthlyFee(Number(e.target.value))}
                          placeholder="Ex: 5000"
                          className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-white focus:ring-1 focus:ring-amber-500 font-sans font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">
                          Téléphone Whatsapp Direct du Partenaire
                        </label>
                        <span className="text-[9px] text-neutral-400 block mb-1 uppercase">Redirection automatique des acheteurs</span>
                        <input 
                          type="text"
                          value={partnerFormContactPhone}
                          onChange={(e) => setPartnerFormContactPhone(e.target.value)}
                          placeholder="Ex: 22890123456"
                          className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-white focus:ring-1 focus:ring-amber-500 font-sans font-mono"
                        />
                      </div>
                      <div className="flex flex-col justify-end pb-1.5 col-span-1">
                        <label className="flex items-center gap-2 cursor-pointer py-1">
                          <input 
                            type="checkbox"
                            checked={partnerFormAutoPublish}
                            onChange={(e) => setPartnerFormAutoPublish(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                          />
                          <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider select-none">
                            Autonomie : Gère ses publications seul
                          </span>
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">
                          Taux de Commission Souhaité (%)
                        </label>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={partnerFormCommissionRate}
                          onChange={(e) => setPartnerFormCommissionRate(Number(e.target.value))}
                          placeholder="Ex: 10"
                          className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-white focus:ring-1 focus:ring-amber-500 font-sans font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1.5">
                          Whatsapp redirection du Partenaire (Optionnel)
                        </label>
                        <span className="text-[9px] text-neutral-400 block mb-1 uppercase">Laisse vide pour utiliser votre numéro</span>
                        <input 
                          type="text"
                          value={partnerFormContactPhone}
                          onChange={(e) => setPartnerFormContactPhone(e.target.value)}
                          placeholder="Ex: 22890000000"
                          className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs outline-none bg-white focus:ring-1 focus:ring-amber-500 font-sans font-mono"
                        />
                      </div>
                      <div className="flex flex-col justify-end pb-1.5 col-span-1">
                        <label className="flex items-center gap-2 cursor-pointer py-1">
                          <input 
                            type="checkbox"
                            checked={partnerFormAutoPublish}
                            onChange={(e) => setPartnerFormAutoPublish(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                          />
                          <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider select-none">
                            Publication assistée par l'admin
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-neutral-950 text-white font-black text-[10px] uppercase tracking-wider px-6 py-2.5 hover:bg-[#d4af37] hover:text-black transition-colors rounded-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer le Partenaire</span>
                  </button>
                </div>
              </form>

              {partnerFormError && (
                <p className="text-[10px] text-red-650 uppercase font-bold">{partnerFormError}</p>
              )}
              {partnerFormSuccess && (
                <p className="text-[10px] text-emerald-600 uppercase font-bold">{partnerFormSuccess}</p>
              )}
            </div>

            {/* Partner profiles detailed list */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-stone-100 p-4 border border-stone-250 rounded-sm">
                <div>
                  <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-neutral-955">Fiches de suivi des contrats clients</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Consultez les conditions d'abonnements ou commissions, redirection whatsapp, et niveau de stocks</p>
                </div>
              </div>

              {partnersData.length === 0 ? (
                <div className="bg-white border border-neutral-200 p-12 text-center rounded-sm">
                  <Users className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                  <p className="text-xs text-neutral-500 font-medium font-sans">Aucun partenaire n'a été configuré sur vos produits actuellement.</p>
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className="mt-3 bg-neutral-955 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:bg-[#d4af37] hover:text-black rounded-sm transition-colors cursor-pointer"
                  >
                    Ajouter un premier produit avec partenaire
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnersData.map(partner => {
                    const hasAlert = partner.outOfStockCount > 0;
                    
                    return (
                      <div 
                        key={partner.name}
                        className={`bg-white border border-neutral-205 p-5 rounded-sm shadow-xs hover:shadow-sm hover:border-[#d4af37]/60 transition-all flex flex-col justify-between space-y-4 relative ${
                          partner.name === "Boutique en Direct" ? "bg-stone-50/40" : ""
                        }`}
                      >
                        <div>
                          {/* Header & Initials Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-neutral-955 text-[#d4af37] font-display font-black text-xs uppercase flex items-center justify-center tracking-widest rounded-sm shrink-0 border border-[#d4af37]/20 font-sans">
                                {partner.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-display font-black text-neutral-900 uppercase tracking-wider text-xs pr-6">
                                  {partner.name}
                                </h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5 tracking-wide uppercase font-semibold font-sans">
                                  {partner.name === "Boutique en Direct" ? "Gestion de Stock Interne" : "Contrat / Vente Partenaire"}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-neutral-100 text-neutral-850 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider select-none font-mono">
                              {partner.name === "Boutique en Direct" ? "Direct" : "Contrat Actif"}
                            </span>
                          </div>

                          {/* Delete & Edit partner buttons (exclude Boutique en Direct) */}
                          {partner.name !== "Boutique en Direct" && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5">
                              <button
                                onClick={() => startEditingPartner(partner)}
                                className="text-neutral-400 hover:text-amber-600 p-1 rounded-sm transition-colors cursor-pointer"
                                title="Modifier les conditions du contrat"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePartner(partner.name)}
                                className="text-neutral-400 hover:text-red-650 p-1 rounded-sm transition-colors cursor-pointer"
                                title="Supprimer ce partenaire"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {partner.description && (
                            <p className="text-[10.5px] text-neutral-500 italic mt-3 bg-neutral-50/50 p-2 rounded-sm border border-neutral-100 leading-normal font-sans">
                              💡 {partner.description}
                            </p>
                          )}

                          {/* Contract parameters */}
                          {partner.name !== "Boutique en Direct" && (
                            <div className="mt-3.5 bg-amber-50/40 border border-[#d4af37]/20 p-3 rounded-xs space-y-1.5 font-sans">
                              <div className="flex items-center justify-between pb-1 border-b border-[#d4af37]/10">
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Plan d'Affiliation</span>
                                {partner.contractType === "subscription" ? (
                                  <span className="bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border border-emerald-500/20 font-mono">
                                    Abonnement Mensuel
                                  </span>
                                ) : (
                                  <span className="bg-indigo-500/10 text-indigo-700 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border border-indigo-500/20 font-mono font-sans">
                                    Commission sur vente
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5 text-neutral-700 text-[11px] font-sans">
                                {partner.contractType === "subscription" ? (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500">Tarif abonnement :</span>
                                    <span className="font-extrabold text-neutral-900 font-mono">{(partner.monthlyFee ?? 5000).toLocaleString("fr-FR")} F CFA / mois</span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500">Taux prélevé :</span>
                                    <span className="font-extrabold text-[#b8901c] font-mono">{partner.commissionRate ?? 10} % commission</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Mode de redirection :</span>
                                  <span className="font-extrabold text-neutral-900 font-mono">
                                    {partner.contactPhone ? `+${partner.contactPhone}` : "Défaut (Admin Whatsapp)"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Gestion diffusion :</span>
                                  <span className="font-semibold text-neutral-800">
                                    {partner.autoPublish ? "Autonome (Le partenaire gère)" : "Assisté (Publié par l'admin)"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Inline Contract Editor form */}
                          {editingPartnerId === partner.id && (
                            <div className="mt-4 bg-stone-100 border border-stone-300 p-3.5 rounded-sm space-y-3 animate-fade-in text-[11px] text-neutral-800 relative z-20 font-sans">
                              <div className="flex justify-between items-center pb-1.5 border-b border-stone-250">
                                <span className="font-bold text-neutral-900 uppercase text-[9.5px] tracking-wider">Ajuster le Contrat : {partner.name}</span>
                                <button className="text-neutral-400 hover:text-neutral-600 font-bold" onClick={() => setEditingPartnerId(null)}>
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="space-y-2.5 font-sans">
                                <div>
                                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Notes / Description de l'accord</label>
                                  <input 
                                    type="text"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full bg-white border border-neutral-300 p-1.5 rounded-sm text-xs outline-none focus:border-amber-500"
                                    placeholder="Ex: Collaboration ou abonnement"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Modèle</label>
                                    <select
                                      value={editContractType}
                                      onChange={(e) => {
                                        const val = e.target.value as "subscription" | "commission";
                                        setEditContractType(val);
                                        if (val === "subscription") setEditAutoPublish(true);
                                        else setEditAutoPublish(false);
                                      }}
                                      className="w-full bg-white border border-neutral-300 p-1.5 rounded-sm text-xs outline-none font-sans"
                                    >
                                      <option value="subscription">Abonnement</option>
                                      <option value="commission">Commission</option>
                                    </select>
                                  </div>

                                  <div>
                                    {editContractType === "subscription" ? (
                                      <div>
                                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Frais / mois (FCFA)</label>
                                        <input 
                                          type="number"
                                          value={editMonthlyFee}
                                          onChange={(e) => setEditMonthlyFee(Number(e.target.value))}
                                          className="w-full bg-white border border-neutral-300 p-1.5 rounded-sm text-xs outline-none font-mono"
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Commission (%)</label>
                                        <input 
                                          type="number"
                                          value={editCommissionRate}
                                          onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                                          className="w-full bg-white border border-neutral-300 p-1.5 rounded-sm text-xs outline-none font-mono"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 items-center">
                                  <div>
                                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Tel Whatsapp direct</label>
                                    <input 
                                      type="text"
                                      value={editContactPhone}
                                      onChange={(e) => setEditContactPhone(e.target.value)}
                                      className="w-full bg-white border border-neutral-300 p-1.5 rounded-sm text-xs outline-none font-mono"
                                      placeholder="Ex: 22890123456"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-3">
                                    <input 
                                      type="checkbox"
                                      id={`edit_auth_${partner.id}`}
                                      checked={editAutoPublish}
                                      onChange={(e) => setEditAutoPublish(e.target.checked)}
                                      className="h-3.5 w-3.5 rounded text-amber-600 focus:ring-amber-500"
                                    />
                                    <label htmlFor={`edit_auth_${partner.id}`} className="text-[9px] text-neutral-650 font-bold uppercase tracking-wide cursor-pointer select-none">
                                      {editContractType === "subscription" ? "Autonomie complète" : "Diffusion Assistée"}
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                                <button
                                  type="button"
                                  onClick={() => setEditingPartnerId(null)}
                                  className="px-3 py-1.5 bg-neutral-200 text-neutral-600 text-[10px] font-bold uppercase hover:bg-neutral-250 rounded-sm"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePartner(partner.id)}
                                  className="px-3 py-1.5 bg-neutral-950 text-white text-[10px] font-black uppercase hover:bg-amber-500 hover:text-black rounded-sm"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Stats breakdown */}
                          <div className="grid grid-cols-3 gap-2 mt-5 bg-neutral-50 border border-neutral-150 p-2.5 rounded-sm">
                            <div className="text-center border-r border-neutral-200">
                              <p className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest">Produits</p>
                              <p className="font-display font-black text-sm text-neutral-900 mt-0.5">{partner.totalProducts}</p>
                            </div>
                            <div className="text-center border-r border-neutral-200">
                              <p className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest">En Stock</p>
                              <p className={`font-display font-black text-sm mt-0.5 ${partner.totalStock === 0 ? "text-red-600 font-bold" : "text-neutral-950"}`}>
                                {partner.totalStock}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest">Gamme Prix</p>
                              <p className="font-display font-black text-[10px] text-[#b8901c] mt-1 font-mono tracking-tighter truncate">
                                {partner.minPrice === partner.maxPrice 
                                  ? `${partner.minPrice} F`
                                  : `${partner.minPrice}-${partner.maxPrice} F`
                                }
                              </p>
                            </div>
                          </div>

                          {/* Categories & Stock Status */}
                          <div className="mt-4 space-y-2.5">
                            <div>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Catégories d'activités</span>
                              <div className="flex flex-wrap gap-1.5">
                                {partner.categories.map(cat => (
                                  <span key={cat} className="text-[9px] bg-[#d4af37]/10 text-amber-800 border border-[#d4af37]/20 px-2 py-0.5 rounded-[1px] select-none font-medium capitalize">
                                    {cat}
                                  </span>
                                ))}
                                {partner.categories.length === 0 && (
                                  <span className="text-[9px] text-neutral-400 italic font-mono">Aucune catégorie</span>
                                )}
                              </div>
                            </div>

                            {/* Stock Health Bar */}
                            <div>
                              <div className="flex justify-between items-center text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                                <span>État général des stocks</span>
                                <span className="text-neutral-600 font-mono">
                                  {partner.outOfStockCount === 0 ? "100% OK" : `${Math.round(((partner.totalProducts - partner.outOfStockCount) / Math.max(1, partner.totalProducts)) * 100)}% en stock`}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    hasAlert ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.max(10, Math.min(100, ((partner.totalProducts - partner.outOfStockCount) / Math.max(1, partner.totalProducts)) * 100))}%` }}
                                ></div>
                              </div>
                            </div>

                            {hasAlert && (
                              <div className="bg-amber-50 text-amber-850 border border-amber-200 p-2.5 rounded-sm flex items-start gap-2 text-[10px] leading-relaxed">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong>Alerte Réapprovisionnement :</strong> {partner.outOfStockCount} produit(s) en rupture sur ce contrat. Prévoyez un stock pour cet affilié.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct Link to Edit Inventory */}
                        <div className="pt-3 border-t border-neutral-100">
                          <button
                            onClick={() => {
                              setAdminPartnerFilter(partner.name);
                              setActiveTab("catalog");
                              window.scrollTo({ top: 350, behavior: "smooth" });
                            }}
                            className="w-full bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-black py-2 rounded-sm text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Gérer l'inventaire ({partner.totalProducts})</span>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-305 pointer-events-none" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "stats" ? (
          <AdminStats />
            ) : (
              <div className="bg-white border border-neutral-200 p-8 rounded-sm shadow-sm max-w-xl mx-auto animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-neutral-100">
                  <div className="bg-[#d4af37]/10 p-2.5 text-[#b8901c] rounded-sm">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base uppercase text-neutral-950">Configuration de l'Application</h2>
                    <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-semibold font-mono">Numéros de redirections et coordonnées</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-neutral-800">
                  <div>
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

                  {saveConfigSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 text-xs rounded-sm font-bold animate-fade-in flex items-center gap-2">
                      <span>✓</span>
                      <span>Numéro WhatsApp mis à jour avec succès ! Les validations de paniers redirigeront désormais vers ce numéro.</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      localStorage.setItem("asime_whatsapp_merchant_number", whatsappDisplaySetting);
                      setSaveConfigSuccess(true);
                      setTimeout(() => setSaveConfigSuccess(false), 4000);
                    }}
                    className="w-full bg-neutral-950 text-white hover:bg-[#d4af37] hover:text-neutral-950 py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Enregistrer la Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

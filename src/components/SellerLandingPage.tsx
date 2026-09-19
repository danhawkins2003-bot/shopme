import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Store, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  PhoneCall, 
  ArrowRight, 
  Users, 
  Coins, 
  HeartHandshake,
  Award,
  ChevronRight,
  UserCheck,
  Building2,
  Package,
  Layers,
  Smartphone,
  Globe,
  Star,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  HelpCircle,
  Clock,
  Crown,
  AlertCircle,
  Percent,
  Image as ImageIcon,
  CheckCircle,
  MessageSquare,
  Truck
} from "lucide-react";
import confetti from "canvas-confetti";
import { SellerPlan } from "../types";
import { SUPPORTED_COUNTRIES, getCountryByCode, isSupportedCountry, DEFAULT_COUNTRY_CODE, formatPrice } from "../data/westAfricanCountries";

interface SellerPageProps {
  onOpenRegisterSeller: () => void;
  onOpenLogin: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToContact: () => void;
  user: any;
  onOpenSellerDashboard?: () => void;
  onDirectRegisterSeller?: (formData: any) => Promise<boolean>;
  formatFCFA: (amount: number) => string;
}

export const SellerLandingPage: React.FC<SellerPageProps> = ({
  onOpenRegisterSeller,
  onOpenLogin,
  onNavigateToCatalog,
  onNavigateToContact,
  user,
  onOpenSellerDashboard,
  onDirectRegisterSeller,
  formatFCFA
}) => {
  // -------------------------------------------------------------
  // MULTI-STEP REGISTRATION FORM STATE
  // -------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Étape 1 : Informations personnelles
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Étape 2 : Informations de la boutique
  const defaultCountry = (user?.countryCode && isSupportedCountry(user.countryCode))
    ? user.countryCode.toUpperCase()
    : DEFAULT_COUNTRY_CODE;
  const [sellerCountryCode, setSellerCountryCode] = useState<string>(defaultCountry);

  useEffect(() => {
    if (user?.countryCode && isSupportedCountry(user.countryCode)) {
      setSellerCountryCode(user.countryCode.toUpperCase());
    }
  }, [user?.countryCode]);

  const selectedCountry = getCountryByCode(sellerCountryCode);
  const sellerCurrencyCode = selectedCountry.currencyCode;

  const [boutiqueName, setBoutiqueName] = useState("");
  const [boutiqueDescription, setBoutiqueDescription] = useState("");
  const [category, setCategory] = useState("Agroalimentaire & Épicerie Fine");
  const [boutiqueLogo, setBoutiqueLogo] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [quartierVille, setQuartierVille] = useState("");

  // Étape 3 : Choix de la formule (Gratuit | PRO | BUSINESS)
  const [selectedPlan, setSelectedPlan] = useState<SellerPlan>("Gratuit");
  const [customSlug, setCustomSlug] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{ available: boolean; reason?: string; formattedSlug: string } | null>(null);

  // Étape 4 : Conditions générales et politique
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Status de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // -------------------------------------------------------------
  // SLUG AVAILABILITY VERIFICATION (DEBOUNCED)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!customSlug || selectedPlan === "Gratuit") {
      setSlugAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await fetch(`/api/shops/check-slug?slug=${encodeURIComponent(customSlug)}`);
        const data = await res.json();
        setSlugAvailability(data);
      } catch (e) {
        setSlugAvailability({ available: false, reason: "Erreur lors de la vérification", formattedSlug: customSlug });
      } finally {
        setSlugChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [customSlug, selectedPlan]);

  // Suggest slug when choosing PRO or BUSINESS
  const handleSelectPlan = (plan: SellerPlan) => {
    setSelectedPlan(plan);
    if (plan !== "Gratuit" && !customSlug && boutiqueName) {
      const suggested = boutiqueName
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setCustomSlug(suggested);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const isStep1Valid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      fullName.trim().length >= 2 &&
      phone.trim().length >= 8 &&
      emailRegex.test(email.trim()) &&
      password.length >= 6 &&
      password === passwordConfirm
    );
  };

  const isStep2Valid = () => {
    return (
      boutiqueName.trim().length >= 2 &&
      boutiqueDescription.trim().length >= 10 &&
      quartierVille.trim().length >= 2
    );
  };

  const isStep3Valid = () => {
    if (selectedPlan === "Gratuit") return true;
    return slugAvailability?.available === true;
  };

  const isStep4Valid = () => {
    return acceptTerms && acceptPrivacy;
  };

  const handleNextStep = () => {
    setFormError("");
    if (currentStep === 1) {
      if (!isStep1Valid()) {
        if (password !== passwordConfirm) {
          setFormError("Les deux mots de passe saisis ne sont pas identiques.");
        } else if (password.length < 6) {
          setFormError("Le mot de passe doit contenir au minimum 6 caractères.");
        } else {
          setFormError("Veuillez renseigner tous les champs obligatoires de l'étape 1.");
        }
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isStep2Valid()) {
        setFormError("Veuillez renseigner le nom, la description (au moins 10 caractères) et la localisation de votre boutique.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!isStep3Valid()) {
        setFormError("Veuillez choisir un nom d'URL valide et disponible pour votre boutique.");
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid() || !isStep4Valid()) {
      setFormError("Veuillez vérifier les informations renseignées et cocher les conditions obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onDirectRegisterSeller) {
        const success = await onDirectRegisterSeller({
          name: fullName.trim(),
          boutiqueName: boutiqueName.trim(),
          businessName: boutiqueName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          phone: phone.trim(),
          quartier: quartierVille.trim(),
          role: "vendeur",
          category: category,
          countryCode: selectedCountry.code,
          country: selectedCountry.name,
          currencyCode: selectedCountry.currencyCode,
          vendeurPlan: selectedPlan,
          plan: selectedPlan,
          vendeurSubscription: selectedPlan === "BUSINESS" ? "Offre 3" : selectedPlan === "PRO" ? "Offre 2" : "Offre 1",
          boutiqueSlug: selectedPlan !== "Gratuit" ? (slugAvailability?.formattedSlug || customSlug) : "",
          vendeurSlug: selectedPlan !== "Gratuit" ? (slugAvailability?.formattedSlug || customSlug) : "",
          boutiqueDescription: boutiqueDescription.trim(),
          boutiqueBio: boutiqueDescription.trim(),
          boutiqueWhatsapp: whatsappNumber.trim() || phone.trim(),
          boutiqueLogo: boutiqueLogo.trim()
        });

        if (success) {
          setFormSuccess(true);
          try {
            confetti({
              particleCount: 160,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#d4af37", "#0B4D26", "#10b981", "#f59e0b"]
            });
          } catch (e) {}
        } else {
          setFormError("Une erreur est survenue lors de la création de votre compte vendeur. L'email ou l'URL est peut-être déjà utilisé.");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      q: "Comment fonctionne la commission de 10% sur les ventes ?",
      a: "La création de compte vendeur et la mise en ligne de votre catalogue sont 100% gratuites. Miabé Asi prélève uniquement une commission de 10% sur les commandes effectivement réglées et livrées. Cette commission couvre les frais de la plateforme, la sécurité des paiements et le support client."
    },
    {
      q: "Pourquoi le compte GRATUIT n'a-t-il pas d'URL publique de boutique ?",
      a: "Avec la formule Gratuite (0 FCFA), vos produits sont directement répertoriés et achetables sur le catalogue général et les moteurs de recherche de Miabé Asi. Pour obtenir une vitrine exclusive avec votre propre lien personnalisable (ex : miabeasi.com/boutique/votre-nom) à partager sur vos réseaux sociaux ou WhatsApp, les formules PRO (1 600 FCFA/mois) et BUSINESS (3 200 FCFA/mois) sont disponibles."
    },
    {
      q: "Comment fonctionnent les Produits Phares ?",
      a: "Les vendeurs PRO et BUSINESS peuvent proposer leurs articles phares à l'administration de Miabé Asi. Une fois validés par l'équipe, ces produits bénéficient d'un positionnement privilégié en tête de page d'accueil et dans les sélections recommandées. Les abonnés BUSINESS bénéficient d'une priorité de mise en avant supérieure et d'un quota de propositions plus large."
    },
    {
      q: "Comment fonctionne la Bannière d'Accueil pour les vendeurs BUSINESS ?",
      a: "Réservée exclusivement à l'abonnement BUSINESS (3 200 FCFA/mois), la bannière d'accueil permet de mettre en avant votre marque avec un visuel percutant directement au sommet de la marketplace. La bannière est soumise à validation par notre équipe afin de garantir une qualité d'image optimale."
    },
    {
      q: "Comment et quand suis-je payé pour mes ventes ?",
      a: "Dès qu'une commande est validée et livrée au client, votre solde net (prix de vente moins 10% de commission) est instantanément crédité sur votre portefeuille vendeur. Vous pouvez demander un virement direct vers votre numéro T-Money, Flooz ou Mix by Yas à tout moment depuis votre tableau de bord."
    },
    {
      q: "Puis-je changer d'abonnement à tout moment ?",
      a: "Absolument ! Vous pouvez commencer gratuitement en formule 0 FCFA, puis passer à PRO ou BUSINESS dès que vous souhaitez professionnaliser votre visibilité ou obtenir votre lien personnalisé."
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-stone-900 font-sans min-h-screen animate-fade-in pb-20">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative bg-stone-950 text-white py-16 sm:py-24 px-4 sm:px-6 overflow-hidden border-b border-[#0B4D26]/40">
        {/* Background ambient lighting */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0B4D26]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#0B4D26]/40 border border-[#0B4D26] px-3.5 py-1.5 rounded-full text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
              <Store className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Espace Vendeurs &amp; Artisans Miabé Asi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.1]">
              Vendez sur <span className="text-[#d4af37]">Miabé Asi</span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Créez votre espace vendeur gratuitement et développez votre activité grâce à notre marketplace.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {user ? (
                <button
                  type="button"
                  onClick={() => onOpenSellerDashboard && onOpenSellerDashboard()}
                  className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0B4D26]/30 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#d4af37]" />
                  <span>Accéder à mon Espace Vendeur</span>
                </button>
              ) : (
                <>
                  <a
                    href="#formulaire-inscription"
                    className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0B4D26]/30 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    <span>Créer ma boutique</span>
                  </a>

                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="bg-white/5 hover:bg-white/10 text-white border border-stone-700 hover:border-stone-500 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-stone-400" />
                    <span>Se connecter</span>
                  </button>
                </>
              )}
            </div>

            {/* Micro Trust Proofs */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-stone-400 text-xs font-medium border-t border-stone-800">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Inscription 0 FCFA</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Retraits T-Money &amp; Flooz</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Commission 10% aux ventes</span>
              </span>
            </div>
          </div>

          {/* Hero Right Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0B4D26] flex items-center justify-center text-white">
                    <Store className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">Aperçu Vitrine Miabé Asi</h4>
                    <span className="text-[10px] text-[#d4af37] font-mono font-bold">Produits 100% Locaux</span>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Actif
                </span>
              </div>

              {/* Sample Product Visuals in Hero Card */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700/50 space-y-1.5">
                  <div className="h-20 bg-stone-700 rounded-lg overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80" 
                      alt="Miel Pur" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 right-1 bg-black/70 text-[#d4af37] text-[8px] font-bold px-1.5 py-0.5 rounded">
                      En stock
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-white truncate">Miel Sauvage Pur</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-black">3 500 FCFA</p>
                </div>

                <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700/50 space-y-1.5">
                  <div className="h-20 bg-stone-700 rounded-lg overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1608248597359-291771141e97?auto=format&fit=crop&w=400&q=80" 
                      alt="Savon Noir" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 right-1 bg-black/70 text-[#d4af37] text-[8px] font-bold px-1.5 py-0.5 rounded">
                      Phare
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-white truncate">Savon Noir &amp; Curcuma</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-black">1 800 FCFA</p>
                </div>
              </div>

              <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-stone-400">Paiement Mobile Money direct :</span>
                <span className="font-mono font-bold text-[#d4af37]">TMoney &bull; Flooz &bull; Mix</span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* 2. AVANTAGES SECTION */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0B4D26]">Pourquoi nous choisir</span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight">
            Les avantages de vendre sur Miabé Asi
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Une plateforme pensée pour valoriser les artisans, transformateurs et commerçants togolais auprès d'un large public.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-[#0B4D26]/40 transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#0B4D26] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold uppercase text-stone-900">Audience Ciblée Togo &amp; Diaspora</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Touchez des milliers d'acheteurs à Lomé, dans toutes les régions du Togo et auprès de la diaspora à la recherche de produits locaux authentiques.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-[#0B4D26]/40 transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold uppercase text-stone-900">Paiements Locaux Sécurisés</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Vos clients règlent en toute confiance par T-Money, Flooz ou Mix by Yas. Vos fonds vous sont reversés directement sur votre compte Mobile Money.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-[#0B4D26]/40 transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold uppercase text-stone-900">Logistique &amp; Livraison Simplifiées</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Recevez les commandes en direct avec les coordonnées précises du client et son quartier pour une livraison rapide et sans tracas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-[#0B4D26]/40 transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold uppercase text-stone-900">Zéro Frais d'Entrée</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Créez votre boutique et publiez votre catalogue sans débourser le moindre franc. Nous ne gagnons que lorsque vous vendez.
            </p>
          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* 3. FONCTIONNEMENT SECTION */}
      {/* ============================================================ */}
      <section className="py-16 bg-white border-y border-stone-200 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-left">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B4D26]">Simple &amp; Rapide</span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight">
              Comment ça fonctionne ?
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Démarrez votre activité en ligne en 3 étapes simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-stone-200 relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#0B4D26] text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-stone-900 uppercase">1. Inscription Rapide</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Remplissez vos informations personnelles et le nom de votre enseigne. Choisissez votre formule adaptée (Gratuit, PRO ou BUSINESS) en moins de 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-stone-200 relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#0B4D26] text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-stone-900 uppercase">2. Ajout de vos Produits</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Ajoutez facilement vos photos, descriptions, prix en FCFA et gérez vos niveaux de stocks depuis votre tableau de bord interactif.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-stone-200 relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#0B4D26] text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-stone-900 uppercase">3. Ventes &amp; Encaissement</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Recevez les notifications de commandes en temps réel, livrez vos clients et transférez vos revenus directement vers votre numéro Mobile Money.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* 4. TARIFS & MODÈLE ÉCONOMIQUE */}
      {/* ============================================================ */}
      <section id="tarifs" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0B4D26]">Modèle Transparent</span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight">
            Nos Formules Vendeurs &amp; Tarification
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Commencez gratuitement sans abonnement fixe, ou passez à la vitesse supérieure avec nos abonnements PRO et BUSINESS.
          </p>
        </div>

        {/* Commission Notice Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-10 max-w-3xl mx-auto flex items-start gap-3.5 text-left">
          <Percent className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Commission marketplace de 10% sur les ventes</h4>
            <p className="text-xs text-amber-800 leading-relaxed font-sans">
              La création de compte reste 100% gratuite. Miabé Asi prélève <strong>10% sur le montant des commandes</strong> afin d'assurer l'infrastructure technique, la passerelle de paiement sécurisée et la visibilité marketing. Les abonnements mensuels payants permettent de débloquer des outils de visibilité avancés mais ne suppriment pas cette commission.
            </p>
          </div>
        </div>

        {/* The 3 Subscription Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
          
          {/* PLAN 1: GRATUIT */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-xs hover:border-stone-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Formule Découverte</span>
                <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{formatPrice(0, sellerCurrencyCode)}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase">GRATUIT</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-stone-900">{formatPrice(0, sellerCurrencyCode)}</span>
                  <span className="text-xs text-stone-400 font-bold">/ mois</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Parfait pour tester la marketplace et commencer à vendre sans aucun engagement financier.
              </p>

              <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Création de compte vendeur</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gestion des produits &amp; du catalogue</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gestion des stocks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gestion des commandes clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tableau de bord vendeur complet</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <X className="w-4 h-4 text-stone-300 shrink-0" />
                  <span className="line-through text-stone-400">Aucune URL publique de boutique</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <X className="w-4 h-4 text-stone-300 shrink-0" />
                  <span className="line-through text-stone-400">Accès Produits phares</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="#formulaire-inscription"
                onClick={() => setSelectedPlan("Gratuit")}
                className="w-full block py-2.5 text-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Choisir Gratuit
              </a>
            </div>
          </div>

          {/* PLAN 2: PRO */}
          <div className="bg-white rounded-2xl border-2 border-[#0B4D26] p-6 flex flex-col justify-between shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B4D26] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
              Recommandé
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B4D26] uppercase tracking-wider">Visibilité &amp; Marque</span>
                <span className="bg-emerald-100 text-[#0B4D26] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">PRO</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase">PRO</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-[#0B4D26]">{formatPrice(1600, sellerCurrencyCode)}</span>
                  <span className="text-xs text-stone-500 font-bold">/ mois</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Débloquez votre URL publique personnalisée et renforcez votre image de marque auprès de vos clients.
              </p>

              <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs text-stone-700">
                <div className="flex items-center gap-2 font-bold text-[#0B4D26]">
                  <Check className="w-4 h-4 text-[#0B4D26] shrink-0" />
                  <span>URL publique de boutique dédiée</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Check className="w-4 h-4 text-[#0B4D26] shrink-0" />
                  <span>URL personnalisée (miabeasi.com/boutique/...)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B4D26] shrink-0" />
                  <span>Personnalisation avancée de la vitrine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B4D26] shrink-0" />
                  <span>Statistiques et rapports avancés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B4D26] shrink-0" />
                  <span>Accès aux demandes de Produits Phares</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B4D26] shrink-0" />
                  <span>Badge Vendeur PRO officiel</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="#formulaire-inscription"
                onClick={() => setSelectedPlan("PRO")}
                className="w-full block py-2.5 text-center rounded-xl bg-[#0B4D26] hover:bg-[#083a1d] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0B4D26]/20 transition-colors"
              >
                Choisir PRO
              </a>
            </div>
          </div>

          {/* PLAN 3: BUSINESS */}
          <div className="bg-stone-900 text-white rounded-2xl border border-stone-800 p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">Haute Visibilité</span>
                <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">VIP</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase">BUSINESS</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-[#d4af37]">{formatPrice(3200, sellerCurrencyCode)}</span>
                  <span className="text-xs text-stone-400 font-bold">/ mois</span>
                </div>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                La formule suprême pour dominer la marketplace avec bannière d'accueil et priorité maximale.
              </p>

              <div className="border-t border-stone-800 pt-4 space-y-2.5 text-xs text-stone-200">
                <div className="flex items-center gap-2 font-bold text-[#d4af37]">
                  <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Tout ce qui est inclus dans PRO</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Bannière sur la page d'accueil (validation admin)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Meilleure visibilité &amp; priorité Produits Phares</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Jusqu'à 5 produits proposés en Produits Phares</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Badge Vendeur BUSINESS certifié</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>Support prioritaire 24/7</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="#formulaire-inscription"
                onClick={() => setSelectedPlan("BUSINESS")}
                className="w-full block py-2.5 text-center rounded-xl bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 font-black text-xs uppercase tracking-wider transition-colors"
              >
                Choisir BUSINESS
              </a>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* 5. PRODUITS PHARES & BANNIÈRE D'ACCUEIL SECTION */}
      {/* ============================================================ */}
      <section className="py-16 bg-white border-y border-stone-200 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12 text-left">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B4D26]">Visibilité Renforcée</span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight">
              Produits Phares &amp; Bannières d'Accueil
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Un système de modération transparent pour garantir la qualité et l'authenticité des mises en avant.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Feature 1: Produits phares */}
            <div className="bg-[#FAF9F6] p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Star className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-lg font-black text-stone-900 uppercase">⭐ Les Produits Phares</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Accessible aux abonnements <strong>PRO</strong> et <strong>BUSINESS</strong>, cette fonctionnalité permet de soumettre vos meilleurs articles à l'équipe Miabé Asi.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 border-t border-stone-200 pt-3 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Modération humaine :</strong> L'administration valide chaque demande pour assurer l'ordre d'affichage, la durée et l'harmonie.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Priorité BUSINESS :</strong> Les abonnés BUSINESS bénéficient d'un placement prioritaire en tête de sélection.</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Bannière d'accueil */}
            <div className="bg-[#FAF9F6] p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-stone-900 text-[#d4af37] flex items-center justify-center font-bold">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-stone-900 uppercase">🖼️ La Bannière d'Accueil (Exclusivité BUSINESS)</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Réservée exclusivement à l'abonnement <strong>BUSINESS</strong> ({formatPrice(3200, sellerCurrencyCode)} / mois), la bannière d'accueil offre un impact visuel maximal auprès de chaque visiteur du site.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 border-t border-stone-200 pt-3 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <span><strong>Workflow propre :</strong> Vendeur soumet son visuel &rarr; Validation admin &rarr; Publication programmée sur la marketplace.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <span><strong>Lien direct :</strong> Redirige immédiatement les acheteurs vers votre vitrine ou votre produit phare.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* 6. FAQ VENDEUR */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-left">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0B4D26]">Vos Questions Fréquentes</span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
            Foire Aux Questions des Vendeurs
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-stone-900">{item.q}</span>
                  <ChevronRight className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90 text-[#0B4D26]" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3 font-sans">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* ============================================================ */}
      {/* 7. NOUVEAU FORMULAIRE D'INSCRIPTION VENDEUR MULTI-ÉTAPES */}
      {/* ============================================================ */}
      <section id="formulaire-inscription" className="py-16 bg-stone-950 text-white px-4 sm:px-6 border-t border-stone-800">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Inscription Partenaire</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Créer votre boutique en quelques clics
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto">
              Rejoignez la plus grande communauté d'artisans et commerçants locaux du Togo.
            </p>
          </div>

          {formSuccess ? (
            <div className="bg-stone-900 border-2 border-emerald-500 p-8 rounded-2xl text-center space-y-5 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase text-white">Félicitations ! Votre boutique est prête</h3>
              <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                Votre compte vendeur pour <strong>« {boutiqueName} »</strong> a été configuré avec succès avec la formule <strong>{selectedPlan}</strong>.
              </p>
              {selectedPlan !== "Gratuit" && (
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 font-mono text-xs text-[#d4af37]">
                  Votre URL : miabeasi.com/boutique/{slugAvailability?.formattedSlug || customSlug}
                </div>
              )}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => onOpenSellerDashboard && onOpenSellerDashboard()}
                  className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  Accéder à mon tableau de bord vendeur &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 text-left shadow-2xl space-y-6">
              
              {/* Stepper Progress Header */}
              <div className="grid grid-cols-4 gap-2 pb-6 border-b border-stone-800">
                {[
                  { step: 1, title: "Personnel" },
                  { step: 2, title: "Boutique" },
                  { step: 3, title: "Abonnement" },
                  { step: 4, title: "Validation" }
                ].map((s) => (
                  <div key={s.step} className="text-center space-y-1">
                    <div className={`h-1.5 rounded-full transition-all ${
                      currentStep >= s.step ? "bg-[#0B4D26]" : "bg-stone-800"
                    }`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider block truncate ${
                      currentStep === s.step ? "text-[#d4af37]" : "text-stone-500"
                    }`}>
                      {s.step}. {s.title}
                    </span>
                  </div>
                ))}
              </div>

              {formError && (
                <div className="bg-red-950/60 border border-red-800 p-3.5 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ---------------- ÉTAPE 1 : INFOS PERSONNELLES ---------------- */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b border-stone-800 pb-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Étape 1 : Vos Informations Personnelles</h3>
                      <p className="text-xs text-stone-400">Ces informations serviront à administrer votre compte sécurisé.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nom complet *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex: Koffi Mensah"
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Numéro de téléphone WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ex: 90123456"
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Adresse Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: koffi@example.com"
                        className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">Mot de passe *</label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[10px] text-stone-500 hover:text-stone-300"
                          >
                            {showPassword ? "Masquer" : "Afficher"}
                          </button>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 caractères"
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Confirmer le mot de passe *</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          placeholder="Répétez le mot de passe"
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- ÉTAPE 2 : INFOS BOUTIQUE ---------------- */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b border-stone-800 pb-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Étape 2 : Informations de votre Boutique</h3>
                      <p className="text-xs text-stone-400">Présentez votre enseigne et votre savoir-faire artisanal.</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nom de la boutique / Enseigne *</label>
                      <input
                        type="text"
                        required
                        value={boutiqueName}
                        onChange={(e) => setBoutiqueName(e.target.value)}
                        placeholder="Ex: Chez Koffi - Saveurs du Terroir"
                        className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Description de votre activité *</label>
                      <textarea
                        required
                        rows={3}
                        value={boutiqueDescription}
                        onChange={(e) => setBoutiqueDescription(e.target.value)}
                        placeholder="Décrivez vos créations, produits et méthodes de fabrication locales..."
                        className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Catégorie principale *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0B4D26]"
                        >
                          <option value="Agroalimentaire & Épicerie Fine">Agroalimentaire &amp; Épicerie Fine</option>
                          <option value="Mode, Vêtements & Tissus (Batik, Pagne)">Mode, Vêtements &amp; Tissus</option>
                          <option value="Cosmétiques & Soins Naturels">Cosmétiques &amp; Soins Naturels</option>
                          <option value="Artisanat, Poterie & Décoration">Artisanat, Poterie &amp; Décoration</option>
                          <option value="Bijoux & Accessoires">Bijoux &amp; Accessoires</option>
                          <option value="Autre Commerce Local">Autre Commerce Local</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Localisation (Quartier / Ville) *</label>
                        <input
                          type="text"
                          required
                          value={quartierVille}
                          onChange={(e) => setQuartierVille(e.target.value)}
                          placeholder="Ex: Bè-Kpota, Lomé"
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#0B4D26]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Pays d'implantation *</label>
                        <select
                          value={sellerCountryCode}
                          onChange={(e) => setSellerCountryCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0B4D26]"
                        >
                          {SUPPORTED_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flagEmoji} {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Devise de facturation</label>
                        <div className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-emerald-400 font-mono font-bold flex items-center justify-between">
                          <span>Franc CFA ({sellerCurrencyCode})</span>
                          <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-sans font-normal">Automatique</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- ÉTAPE 3 : CHOIX FORMULE & URL ---------------- */}
                {currentStep === 3 && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-stone-800 pb-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Étape 3 : Choix de votre Formule</h3>
                      <p className="text-xs text-stone-400">Sélectionnez votre formule selon vos ambitions.</p>
                    </div>

                    {/* Plan Radio Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Gratuit */}
                      <button
                        type="button"
                        onClick={() => handleSelectPlan("Gratuit")}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedPlan === "Gratuit"
                            ? "bg-[#0B4D26]/20 border-[#0B4D26] ring-1 ring-[#0B4D26]"
                            : "bg-stone-950 border-stone-800 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase text-white">Gratuit</span>
                          <span className="text-[10px] font-mono font-bold text-stone-400">{formatPrice(0, sellerCurrencyCode)}</span>
                        </div>
                        <p className="text-[10px] text-stone-400">Gestion catalogue &amp; commandes.</p>
                        <span className="text-[9px] text-stone-500 block mt-2 font-mono">Sans URL publique</span>
                      </button>

                      {/* PRO */}
                      <button
                        type="button"
                        onClick={() => handleSelectPlan("PRO")}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedPlan === "PRO"
                            ? "bg-[#0B4D26]/30 border-emerald-500 ring-1 ring-emerald-500"
                            : "bg-stone-950 border-stone-800 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase text-emerald-400">PRO</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">{formatPrice(1600, sellerCurrencyCode)}/m</span>
                        </div>
                        <p className="text-[10px] text-stone-300">URL personnalisée + Produits phares.</p>
                        <span className="text-[9px] text-emerald-400 font-bold block mt-2 font-mono">URL personnalisée ✓</span>
                      </button>

                      {/* BUSINESS */}
                      <button
                        type="button"
                        onClick={() => handleSelectPlan("BUSINESS")}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedPlan === "BUSINESS"
                            ? "bg-[#d4af37]/15 border-[#d4af37] ring-1 ring-[#d4af37]"
                            : "bg-stone-950 border-stone-800 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase text-[#d4af37]">BUSINESS</span>
                          <span className="text-[10px] font-mono font-bold text-[#d4af37]">{formatPrice(3200, sellerCurrencyCode)}/m</span>
                        </div>
                        <p className="text-[10px] text-stone-300">Bannière accueil + Haute priorité.</p>
                        <span className="text-[9px] text-[#d4af37] font-bold block mt-2 font-mono">Bannière accueil ✓</span>
                      </button>

                    </div>

                    {/* URL INPUT FIELD (ONLY FOR PRO & BUSINESS) */}
                    {selectedPlan !== "Gratuit" ? (
                      <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-[#d4af37] uppercase tracking-wider">
                            Choisissez votre URL de Boutique Personnalisée
                          </label>
                          {slugChecking && (
                            <span className="text-[10px] text-stone-400 animate-pulse">Vérification en cours...</span>
                          )}
                        </div>

                        <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl overflow-hidden px-3 py-2 text-xs">
                          <span className="text-stone-500 font-mono select-none">miabeasi.com/boutique/</span>
                          <input
                            type="text"
                            required
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                            placeholder="nom-boutique"
                            className="bg-transparent text-white font-mono flex-grow focus:outline-none pl-1"
                          />
                        </div>

                        {/* Availability Feedback */}
                        {slugAvailability && (
                          <div className={`text-xs flex items-center gap-1.5 ${
                            slugAvailability.available ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {slugAvailability.available ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>URL disponible : <strong>miabeasi.com/boutique/{slugAvailability.formattedSlug}</strong></span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{slugAvailability.reason || "Ce nom d'URL n'est pas disponible."}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs text-stone-400 leading-relaxed">
                        ℹ️ <strong>Rappel Compte Gratuit :</strong> Votre compte ne possèdera aucune URL publique de boutique. Vos produits apparaîtront dans le catalogue général. Vous pourrez passer à PRO ou BUSINESS ultérieurement pour activer une URL dédiée.
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------- ÉTAPE 4 : CGV & VALIDATION ---------------- */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b border-stone-800 pb-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Étape 4 : Validation &amp; Conditions</h3>
                      <p className="text-xs text-stone-400">Vérifiez votre récapitulatif avant de valider.</p>
                    </div>

                    {/* Summary box */}
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-stone-900">
                        <span className="text-stone-500">Nom du gérant :</span>
                        <span className="font-bold text-white">{fullName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-900">
                        <span className="text-stone-500">Nom de la boutique :</span>
                        <span className="font-bold text-white">{boutiqueName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-900">
                        <span className="text-stone-500">Formule choisie :</span>
                        <span className="font-bold text-[#d4af37]">
                          {selectedPlan} {selectedPlan === "BUSINESS" ? "(3 200 FCFA/mois)" : selectedPlan === "PRO" ? "(1 600 FCFA/mois)" : "(0 FCFA)"}
                        </span>
                      </div>
                      {selectedPlan !== "Gratuit" && (
                        <div className="flex justify-between py-1">
                          <span className="text-stone-500">URL réservée :</span>
                          <span className="font-mono font-bold text-emerald-400">miabeasi.com/boutique/{slugAvailability?.formattedSlug || customSlug}</span>
                        </div>
                      )}
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-300 select-none">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded bg-stone-950 border-stone-800 text-[#0B4D26] focus:ring-[#0B4D26]"
                        />
                        <span>
                          J'accepte les <strong>Conditions Générales de Vente Partenaire</strong> de Miabé Asi et certifie que mes produits sont fabriqués, transformés ou distribués localement au Togo.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-300 select-none">
                        <input
                          type="checkbox"
                          checked={acceptPrivacy}
                          onChange={(e) => setAcceptPrivacy(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded bg-stone-950 border-stone-800 text-[#0B4D26] focus:ring-[#0B4D26]"
                        />
                        <span>
                          J'accepte la <strong>Politique de Confidentialité</strong> et le prélèvement de 10% de commission sur les ventes validées.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                      className="px-5 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      &larr; Précédent
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                    >
                      Suivant &rarr;
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !acceptTerms || !acceptPrivacy}
                      className="bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 disabled:opacity-40 px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          <span>Création en cours...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Créer ma boutique maintenant</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </form>
            </div>
          )}

        </div>
      </section>

    </div>
  );
};

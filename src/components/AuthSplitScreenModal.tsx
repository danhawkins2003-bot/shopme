import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  User,
  Store,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  ChevronDown,
  ShieldCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Unlock,
  Plus,
  Truck,
  CreditCard,
  Info
} from "lucide-react";
import { SUPPORTED_COUNTRIES, getCountryByCode } from "../data/westAfricanCountries";
import { LegalTab } from "./LegalPoliciesModal";

interface AuthSplitScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  authRole: "client" | "vendeur";
  setAuthRole: (role: "client" | "vendeur") => void;
  authEmail: string;
  setAuthEmail: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authName: string;
  setAuthName: (val: string) => void;
  authBoutiqueName: string;
  setAuthBoutiqueName: (val: string) => void;
  authCountryCode: string;
  setAuthCountryCode: (val: string) => void;
  authPhone: string;
  setAuthPhone: (val: string) => void;
  authCity: string;
  setAuthCity: (val: string) => void;
  setAuthQuartier: (val: string) => void;
  authError: string;
  setAuthError: (val: string) => void;
  isAuthSubmitting: boolean;
  handleAuthSubmit: (e: React.FormEvent) => void;
  openLegalModal: (tab: LegalTab) => void;
  officialLogoImg: string;
}

export const AuthSplitScreenModal: React.FC<AuthSplitScreenModalProps> = ({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  authRole,
  setAuthRole,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authBoutiqueName,
  setAuthBoutiqueName,
  authCountryCode,
  setAuthCountryCode,
  authPhone,
  setAuthPhone,
  authCity,
  setAuthCity,
  setAuthQuartier,
  authError,
  setAuthError,
  isAuthSubmitting,
  handleAuthSubmit,
  openLegalModal,
  officialLogoImg
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(true);
  const [showLegalPreview, setShowLegalPreview] = useState<"none" | "cgu" | "confidentialite">("none");

  if (!isOpen) return null;

  const selectedAuthCountry = getCountryByCode(authCountryCode);

  const onFormSubmit = (e: React.FormEvent) => {
    if (authMode === "register" && !acceptedLegal) {
      e.preventDefault();
      setAuthError("Veuillez accepter les Conditions d'Utilisation et la Politique de Confidentialité pour créer votre compte.");
      return;
    }
    handleAuthSubmit(e);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-neutral-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#d4af37]/35 grid grid-cols-1 lg:grid-cols-12 my-auto max-h-[94vh] lg:max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-950 text-neutral-700 hover:text-[#d4af37] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ===================================================================== */}
        {/* LEFT COLUMN: MIABÉ ASI PRESENTATION, WELCOME & DECORATIVE GRAPHICS    */}
        {/* ===================================================================== */}
        <div className="lg:col-span-5 relative bg-neutral-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#d4af37]/25">
          {/* Decorative Graphical Elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Forest Green & Gold ambient glows */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#0f5132]/35 blur-3xl" />
            <div className="absolute top-1/3 -right-24 w-64 h-64 rounded-full bg-[#d4af37]/15 blur-3xl" />
            <div className="absolute -bottom-28 left-1/4 w-80 h-80 rounded-full bg-[#0f5132]/25 blur-3xl" />

            {/* Decorative Geometric Circles & African Pattern Lines */}
            <svg
              className="absolute top-6 right-6 w-40 h-40 text-[#d4af37]/10"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 5" />
              <path d="M100 10 L100 190 M10 100 L190 100" stroke="currentColor" strokeWidth="0.75" />
            </svg>

            <svg
              className="absolute -bottom-10 -left-10 w-48 h-48 text-[#d4af37]/10"
              viewBox="0 0 200 200"
              fill="none"
            >
              <rect x="25" y="25" width="150" height="150" rx="24" stroke="currentColor" strokeWidth="1.2" transform="rotate(15 100 100)" />
              <rect x="45" y="45" width="110" height="110" rx="16" stroke="currentColor" strokeWidth="1" transform="rotate(30 100 100)" />
            </svg>
          </div>

          {/* Top Brand Identity */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1 border border-[#d4af37]/60 shadow-md shrink-0 overflow-hidden">
                <img
                  src={officialLogoImg}
                  alt="Miabé Asi Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-black text-base uppercase tracking-widest text-[#d4af37] block leading-none">
                  Miabé Asi
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-widest mt-1 block">
                  Marketplace Panafricaine
                </span>
              </div>
            </div>

            {/* Welcome Message & Brand Presentation */}
            <div className="mt-6 lg:mt-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f5132]/60 border border-emerald-500/30 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>
                  {authMode === "register"
                    ? "Bienvenue dans la communauté"
                    : "Heureux de vous retrouver"}
                </span>
              </div>

              <h2 className="font-display font-extrabold text-xl sm:text-2xl lg:text-[26px] text-white leading-tight tracking-tight">
                {authMode === "register"
                  ? authRole === "vendeur"
                    ? "Ouvrez votre boutique et rayonnez dans 7 pays africains."
                    : "Rejoignez le marché d'excellence du terroir et de l'artisanat."
                  : "Accédez à votre espace personnel Miabé Asi."}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                {authMode === "register"
                  ? "Miabé Asi connecte en direct les acheteurs, artisans, coopératives et marques locales à travers le Togo, le Bénin, la Côte d'Ivoire, le Sénégal, le Burkina Faso, le Mali et le Cameroun."
                  : "Retrouvez vos commandes en temps réel, vos produits favoris, vos factures officielles et votre portefeuille sécurisé."}
              </p>
            </div>

            {/* Decorative Feature Cards (Hidden on tiny screens to keep mobile compact, visible from sm/lg) */}
            <div className="hidden sm:grid grid-cols-1 gap-3 mt-6 lg:mt-8">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Transactions &amp; Données Protégées
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    Paiements Mobile Money (T-Money, Flooz, Wave, Orange Money) &amp; Cartes via PayDunya et infrastructure Supabase sécurisée.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0f5132]/50 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {authRole === "vendeur"
                      ? "90% des ventes reversés au vendeur"
                      : "Produits Nobles & Créateurs Vérifiés"}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    {authRole === "vendeur"
                      ? "Inscription dès 0 FCFA, gestion de stock simplifiée et retraits directs vers votre compte Mobile Money."
                      : "Commandez en direct auprès des meilleurs producteurs et suivez la livraison étape par étape."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Decorative Country & Trust Footer */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span>🇹🇬 🇧🇯 🇨🇮 🇸🇳 🇧🇫 🇲🇱 🇨🇲</span>
              <span className="font-semibold text-[#d4af37]">7 Pays couverts</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400">
              XOF &amp; XAF • 24h/7j
            </span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: MODERN REGISTRATION / AUTH FORM WITH ICONS & LEGAL      */}
        {/* ===================================================================== */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-[65vh] lg:max-h-[90vh] flex flex-col justify-between">
          <div>
            {/* Top Mode Switcher & Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200/80 pr-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8901c] block">
                  {authMode === "register" ? "Nouveau Membre Miabé Asi" : "Portail d'Authentification"}
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-neutral-950 tracking-tight mt-0.5">
                  {authMode === "register" ? "Créer votre compte" : "Connexion à votre compte"}
                </h3>
              </div>

              {/* Segmented Switcher: Inscription / Connexion */}
              <div className="inline-flex p-1 bg-neutral-200/70 rounded-xl border border-neutral-300/60 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "register"
                      ? "bg-neutral-950 text-[#d4af37] shadow-xs"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  S&apos;inscrire
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "login"
                      ? "bg-neutral-950 text-[#d4af37] shadow-xs"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  Se connecter
                </button>
              </div>
            </div>

            {/* Error Alert Banner */}
            {authError && (
              <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2.5">
                <span className="text-base leading-none">⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            {/* User Role Selector (Client / Vendeur) in Register Mode */}
            {authMode === "register" && (
              <div className="mt-5">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Choisissez votre profil <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthRole("client")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      authRole === "client"
                        ? "border-[#d4af37] bg-white text-neutral-950 ring-2 ring-[#d4af37]/40 shadow-xs"
                        : "border-neutral-200/90 bg-white/70 text-neutral-600 hover:bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        authRole === "client"
                          ? "bg-neutral-950 text-[#d4af37]"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-950">Compte Client</span>
                        {authRole === "client" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0f5132] shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 leading-snug block mt-0.5">
                        Acheter, enregistrer mes favoris &amp; suivre mes colis
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthRole("vendeur")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      authRole === "vendeur"
                        ? "border-[#d4af37] bg-white text-neutral-950 ring-2 ring-[#d4af37]/40 shadow-xs"
                        : "border-neutral-200/90 bg-white/70 text-neutral-600 hover:bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        authRole === "vendeur"
                          ? "bg-[#0f5132] text-[#d4af37]"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-950">Compte Vendeur</span>
                        {authRole === "vendeur" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0f5132] shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 leading-snug block mt-0.5">
                        Ouvrir ma boutique &amp; vendre mes produits
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Main Registration / Login Form */}
            <form onSubmit={onFormSubmit} className="mt-5 space-y-4 text-left">
              {authMode === "register" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className={authRole === "vendeur" ? "" : "sm:col-span-2"}>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                      {authRole === "vendeur" ? "Nom & Prénoms du Gérant" : "Nom complet"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Koffi Mensah"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] text-neutral-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Boutique Name (when Vendeur) */}
                  {authRole === "vendeur" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                        Nom de la Boutique / Atelier <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 text-[#b8901c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Terroir & Saveurs du Togo"
                          value={authBoutiqueName}
                          onChange={(e) => setAuthBoutiqueName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] text-neutral-900 transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email & Password Row */}
              <div className={authMode === "register" ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5" : "space-y-4"}>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                    Adresse Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="votre-email@exemple.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] text-neutral-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] text-neutral-900 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Country, Phone & City (Register Mode) */}
              {authMode === "register" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                      Pays de résidence / d&apos;activité <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#0f5132] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        required
                        value={authCountryCode}
                        onChange={(e) => setAuthCountryCode(e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] text-neutral-900 appearance-none font-medium cursor-pointer transition-all"
                      >
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flagEmoji} {c.name} ({c.phoneCode}) — Devise {c.currencyCode}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                        Téléphone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="flex rounded-xl overflow-hidden border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-[#d4af37]/30 focus-within:border-[#d4af37] transition-all">
                        <span className="inline-flex items-center gap-1 px-3 text-xs bg-neutral-100 border-r border-neutral-300 text-neutral-700 font-mono select-none font-semibold shrink-0">
                          <Phone className="w-3.5 h-3.5 text-[#0f5132]" />
                          <span>{selectedAuthCountry.phoneCode}</span>
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="90 00 00 00"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-white focus:outline-none text-neutral-900 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                        {authRole === "vendeur" ? "Ville / Région" : "Ville / Quartier"}{" "}
                        <span className="text-[#b8901c] font-normal">(Optionnel)</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder={
                            selectedAuthCountry.code === "TG"
                              ? "Ex: Lomé - Adidogomé, Kara..."
                              : `Ex: Ville (${selectedAuthCountry.name})`
                          }
                          value={authCity}
                          onChange={(e) => {
                            setAuthCity(e.target.value);
                            setAuthQuartier(e.target.value);
                          }}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] text-neutral-900 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ===================================================================== */}
              {/* CLEAR PRESENTATION OF TERMS OF USE (CGU) & PRIVACY POLICY             */}
              {/* ===================================================================== */}
              {authMode === "register" && (
                <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="register-legal-consent"
                      type="checkbox"
                      checked={acceptedLegal}
                      onChange={(e) => setAcceptedLegal(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-[#0f5132] cursor-pointer shrink-0"
                    />
                    <label
                      htmlFor="register-legal-consent"
                      className="text-xs text-neutral-700 leading-relaxed cursor-pointer select-none"
                    >
                      J&apos;accepte les{" "}
                      <button
                        type="button"
                        onClick={() =>
                          setShowLegalPreview(showLegalPreview === "cgu" ? "none" : "cgu")
                        }
                        className="font-bold text-[#0f5132] underline decoration-[#d4af37] underline-offset-2 hover:text-neutral-950 cursor-pointer"
                      >
                        Conditions Générales d&apos;Utilisation (CGU)
                      </button>{" "}
                      et la{" "}
                      <button
                        type="button"
                        onClick={() =>
                          setShowLegalPreview(
                            showLegalPreview === "confidentialite" ? "none" : "confidentialite"
                          )
                        }
                        className="font-bold text-[#0f5132] underline decoration-[#d4af37] underline-offset-2 hover:text-neutral-950 cursor-pointer"
                      >
                        Politique de Confidentialité
                      </button>{" "}
                      de Miabé Asi.
                    </label>
                  </div>

                  {/* Quick Pills to Preview or Open Full Legal Documents */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowLegalPreview(showLegalPreview === "cgu" ? "none" : "cgu")
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10.5px] font-semibold transition-colors cursor-pointer ${
                          showLegalPreview === "cgu"
                            ? "bg-neutral-950 text-[#d4af37] border-neutral-950"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-[#d4af37]"
                        }`}
                      >
                        <FileText className="w-3 h-3 text-[#d4af37]" />
                        <span>Résumé CGU / CGV</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowLegalPreview(
                            showLegalPreview === "confidentialite" ? "none" : "confidentialite"
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10.5px] font-semibold transition-colors cursor-pointer ${
                          showLegalPreview === "confidentialite"
                            ? "bg-neutral-950 text-[#d4af37] border-neutral-950"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-[#d4af37]"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-[#0f5132]" />
                        <span> Confidentialité &amp; Données</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openLegalModal(
                          showLegalPreview === "cgu" ? "cgu" : "confidentialite"
                        )
                      }
                      className="text-[10.5px] font-bold text-[#b8901c] hover:text-neutral-950 transition-colors cursor-pointer"
                    >
                      Lire le texte intégral &rarr;
                    </button>
                  </div>

                  {/* Inline Expandable Summary of CGU or Privacy Policy */}
                  <AnimatePresence>
                    {showLegalPreview !== "none" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        {showLegalPreview === "cgu" ? (
                          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1.5 leading-relaxed">
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#0f5132]" />
                              <span>Points clés des Conditions Générales d&apos;Utilisation (CGU / CGV)</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>
                                <strong>Marketplace Panafricaine :</strong> Mise en relation directe entre acheteurs et vendeurs vérifiés dans 7 pays (XOF &amp; XAF).
                              </li>
                              <li>
                                <strong>Vendeurs partenaires :</strong> 90% du montant des ventes est reversé au vendeur (commission plateforme de 10% sur ventes validées).
                              </li>
                              <li>
                                <strong>Garantie acheteur :</strong> Paiements sécurisés via PayDunya ou à la livraison, réclamation possible sous 48h après réception.
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1.5 leading-relaxed">
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0f5132]" />
                              <span>Protection des Données &amp; Confidentialité (APDP &amp; Supabase RLS)</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>
                                <strong>Collecte strictement nécessaire :</strong> Nom, téléphone WhatsApp et adresse uniquement pour le suivi des commandes et paiements.
                              </li>
                              <li>
                                <strong>Sécurité bancaire :</strong> Aucun code PIN ou numéro complet de carte n&apos;est stocké par Miabé Asi.
                              </li>
                              <li>
                                <strong>Zéro revente :</strong> Vos données sont chiffrées sur Supabase Cloud et ne sont jamais cédées à des tiers publicitaires.
                              </li>
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Primary Submit CTA Button */}
              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 py-3.5 px-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isAuthSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {authMode === "login" ? (
                      <Unlock className="w-4 h-4 text-[#d4af37] group-hover:text-neutral-950" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    <span>
                      {authMode === "login"
                        ? "Accéder à mon Espace"
                        : authRole === "vendeur"
                        ? "Inscrire ma Boutique sur Miabé Asi"
                        : "Créer mon Compte Client"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Switch Link & Reassurance */}
          <div className="mt-6 pt-4 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <div>
              {authMode === "register" ? (
                <span>
                  Vous avez déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className="font-bold text-neutral-950 hover:text-[#b8901c] underline cursor-pointer"
                  >
                    Se connecter
                  </button>
                </span>
              ) : (
                <span>
                  Nouveau sur Miabé Asi ?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                    className="font-bold text-neutral-950 hover:text-[#b8901c] underline cursor-pointer"
                  >
                    Créer un compte gratuitement
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-neutral-500">
              <button
                type="button"
                onClick={() => openLegalModal("cgu")}
                className="hover:text-neutral-900 underline cursor-pointer"
              >
                CGU
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalModal("confidentialite")}
                className="hover:text-neutral-900 underline cursor-pointer"
              >
                Confidentialité
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

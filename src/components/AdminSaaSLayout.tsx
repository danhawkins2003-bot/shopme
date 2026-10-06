import React, { useState } from "react";
import {
  LayoutDashboard,
  Database,
  TrendingUp,
  Bell,
  Users,
  Image as ImageIcon,
  BarChart3,
  BookOpen,
  Settings,
  Search,
  RefreshCw,
  LogOut,
  ExternalLink,
  Lock,
  Menu,
  X,
  Plus,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { AdminTabType } from "./AdminOverviewDashboard";

interface AdminSaaSLayoutProps {
  isAdminAuthenticated: boolean;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  adminAuthError: string;
  handleAdminLogin: (e: React.FormEvent) => void;
  handleAdminLogout: () => void;
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  officialLogoImg: string;
  productsCount: number;
  sellersCount: number;
  pendingAlertsCount: number;
  blogsCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  isRefreshing: boolean;
  onRefreshAll: () => void;
  onQuickAddProduct: () => void;
  onSelectAnalyticsTab: () => void;
  onSelectBlogsTab: () => void;
  children: React.ReactNode;
}

const TAB_META: Record<AdminTabType, { title: string; subtitle: string }> = {
  overview: {
    title: "Tableau de Bord Exécutif",
    subtitle: "Indicateurs clés, évolution graphique des ventes et journal des opérations récentes"
  },
  catalog: {
    title: "Catalogue & Gestion des Statuts",
    subtitle: "Ajout, édition et pilotage en direct de la disponibilité des produits"
  },
  analytics: {
    title: "Analytics par Produit",
    subtitle: "Consultations, ventes confirmées, chiffre d'affaires et taux de conversion"
  },
  requests: {
    title: "Opérations, Commandes & Demandes",
    subtitle: "Suivi des commandes clients, retraits portefeuille et validations boutiques"
  },
  vendors: {
    title: "Vendeurs & Abonnements",
    subtitle: "Supervision des boutiques partenaires et répartition par formules (Offre 1, PRO, BUSINESS)"
  },
  banners: {
    title: "Bannières & Vitrines d'Accueil",
    subtitle: "Gestion visuelle des cartes Terroirs, Lookbook Savoir-faire et Carrousel Promo"
  },
  stats: {
    title: "Finances & Statistiques Consolidées",
    subtitle: "Analyse financière annuelle, projections et export comptable CSV"
  },
  blogs: {
    title: "Le Journal de Miabé Asi — Blog",
    subtitle: "Rédaction, publication et gestion des articles éditoriaux et sponsorisés"
  },
  settings: {
    title: "Paramètres & Passerelle PayDunya",
    subtitle: "Configuration WhatsApp, identité visuelle et clés API de paiement"
  }
};

export default function AdminSaaSLayout({
  isAdminAuthenticated,
  adminPassword,
  setAdminPassword,
  adminAuthError,
  handleAdminLogin,
  handleAdminLogout,
  activeTab,
  setActiveTab,
  officialLogoImg,
  productsCount,
  sellersCount,
  pendingAlertsCount,
  blogsCount,
  searchQuery,
  onSearchChange,
  isRefreshing,
  onRefreshAll,
  onQuickAddProduct,
  onSelectAnalyticsTab,
  onSelectBlogsTab,
  children
}: AdminSaaSLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 font-sans flex flex-col justify-between">
        {/* Top bar */}
        <header className="h-16 bg-neutral-950 text-white px-6 border-b border-[#d4af37]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#d4af37]/50 bg-white p-0.5 shrink-0">
              <img
                src={officialLogoImg}
                alt="Miabé Asi Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wide text-[#d4af37] block leading-none">
                Miabé Asi
              </span>
              <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
                Portail Administrateur
              </span>
            </div>
          </div>
          <a
            href="/"
            className="text-xs text-neutral-300 hover:text-white transition-colors font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-800 hover:border-neutral-700 whitespace-nowrap"
          >
            <span>Retour à la boutique</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
          </a>
        </header>

        {/* Split-Screen SaaS Admin Authentication Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-5xl bg-white border border-neutral-200/90 rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT PANEL: Miabé Asi Admin Brand Presentation & Decorative Elements */}
            <div className="lg:col-span-5 relative bg-neutral-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#d4af37]/20">
              {/* Decorative Ambient Glows & Pattern */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#0f5132]/35 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#d4af37]/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)",
                  backgroundSize: "24px 24px"
                }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white p-1 border border-[#d4af37]/50 shadow-sm shrink-0">
                    <img
                      src={officialLogoImg}
                      alt="Miabé Asi"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-display font-bold text-base tracking-wide text-[#d4af37] block leading-none">
                      Miabé Asi
                    </span>
                    <span className="text-[11px] text-neutral-400 font-medium block mt-1">
                      Console SaaS de Pilotage Exécutif
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-[#0f5132]/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Supervision Temps Réel · Supabase &amp; PayDunya</span>
                  </div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-white leading-snug">
                    Pilotez le catalogue, les vendeurs et les opérations financières
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Accédez à votre interface d&apos;administration unifiée pour valider les commandes, gérer les retraits Mobile Money et suivre la croissance du terroir.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      title: "Statistiques & Graphiques Interactifs",
                      desc: "Visualisez le chiffre d'affaires, le panier moyen et les conversions."
                    },
                    {
                      title: "Validation Commandes & Retraits",
                      desc: "Approuvez les paiements et générez les factures PDF officielles."
                    },
                    {
                      title: "Gestion Catalogue & Vendeurs",
                      desc: "Activez les boutiques partenaires (Gratuit, PRO, BUSINESS)."
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/10"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Session chiffrée &amp; auditée</span>
                </span>
                <span className="font-mono text-[#d4af37]">v2026 · SaaS</span>
              </div>
            </div>

            {/* RIGHT PANEL: Modern Authentication Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-neutral-950 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-xl text-neutral-950">
                      Connexion Administrateur
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Saisissez votre clé d&apos;accès sécurité pour déverrouiller le dashboard.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Clé d&apos;accès administrateur <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required
                        placeholder="Entrez votre mot de passe administrateur"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full border border-neutral-200 rounded-xl pl-10 pr-10 py-3 text-xs bg-neutral-50/70 focus:bg-white focus:ring-2 focus:ring-[#0f5132]/15 focus:border-[#0f5132] outline-none text-neutral-950 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showAdminPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {adminAuthError && (
                    <div className="text-rose-700 bg-rose-50 border border-rose-200 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{adminAuthError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 py-3.5 px-5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Accéder au Dashboard Administrateur</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                    <span>Accès rapide de démonstration</span>
                    <span className="text-[11px] font-mono text-[#0f5132]">Autorisé</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Utilisez la clé <code className="font-mono font-semibold text-neutral-900 bg-white px-1.5 py-0.5 rounded border border-neutral-200">miabeasi2026</code> ou <code className="font-mono font-semibold text-neutral-900 bg-white px-1.5 py-0.5 rounded border border-neutral-200">asime2026</code> pour vous authentifier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-neutral-400">
          Miabé Asi · Console d&apos;Administration SaaS Sécurisée
        </footer>
      </div>
    );
  }

  const navGroups: Array<{
    groupLabel: string;
    items: Array<{
      id: AdminTabType;
      domId?: string;
      label: string;
      icon: React.ElementType;
      badge: number | null;
      badgeTone?: "neutral" | "alert" | "emerald";
      onClick: () => void;
    }>;
  }> = [
    {
      groupLabel: "Pilotage & Analyse",
      items: [
        {
          id: "overview" as AdminTabType,
          label: "Tableau de Bord",
          icon: LayoutDashboard,
          badge: null,
          onClick: () => setActiveTab("overview")
        },
        {
          id: "stats" as AdminTabType,
          domId: "tab-btn-stats",
          label: "Finances & Statistiques",
          icon: BarChart3,
          badge: null,
          onClick: () => setActiveTab("stats")
        },
        {
          id: "analytics" as AdminTabType,
          label: "Analytics par Produit",
          icon: TrendingUp,
          badge: null,
          onClick: onSelectAnalyticsTab
        }
      ]
    },
    {
      groupLabel: "Commerce & Opérations",
      items: [
        {
          id: "catalog" as AdminTabType,
          label: "Catalogue & Statuts",
          icon: Database,
          badge: productsCount,
          badgeTone: "neutral",
          onClick: () => setActiveTab("catalog")
        },
        {
          id: "requests" as AdminTabType,
          label: "Alertes & Demandes",
          icon: Bell,
          badge: pendingAlertsCount > 0 ? pendingAlertsCount : null,
          badgeTone: "alert",
          onClick: () => setActiveTab("requests")
        },
        {
          id: "vendors" as AdminTabType,
          label: "Vendeurs & Offres",
          icon: Users,
          badge: sellersCount > 0 ? sellersCount : null,
          badgeTone: "emerald",
          onClick: () => setActiveTab("vendors")
        }
      ]
    },
    {
      groupLabel: "Contenu & Configuration",
      items: [
        {
          id: "banners" as AdminTabType,
          label: "Bannières & Vitrines",
          icon: ImageIcon,
          badge: null,
          onClick: () => setActiveTab("banners")
        },
        {
          id: "blogs" as AdminTabType,
          label: "Articles de Blog",
          icon: BookOpen,
          badge: blogsCount,
          badgeTone: "neutral",
          onClick: onSelectBlogsTab
        },
        {
          id: "settings" as AdminTabType,
          label: "Paramètres & Logo",
          icon: Settings,
          badge: null,
          onClick: () => setActiveTab("settings")
        }
      ]
    }
  ];

  const currentMeta = TAB_META[activeTab] || TAB_META.overview;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 font-sans flex">
      {/* MOBILE SIDEBAR BACKDROP */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-neutral-950 text-white border-r border-neutral-800/80 flex flex-col justify-between transition-transform duration-200 ease-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Brand Zone */}
        <div>
          <div className="h-16 px-5 border-b border-neutral-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveTab("overview");
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#d4af37]/50 bg-white p-0.5 shrink-0">
                <img
                  src={officialLogoImg}
                  alt="Miabé Asi Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-bold text-sm tracking-wide text-[#d4af37] block leading-none">
                  Miabé Asi
                </span>
                <span className="text-[10px] text-neutral-400 font-medium block mt-1">
                  Workspace Admin
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3.5 space-y-6 overflow-y-auto max-h-[calc(100vh-145px)]">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-semibold text-neutral-500 tracking-wide">
                  {group.groupLabel}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={item.domId}
                      type="button"
                      onClick={() => {
                        item.onClick();
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-[#d4af37] text-neutral-950 font-semibold shadow-2xs"
                          : "text-neutral-300 hover:bg-white/6 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-neutral-950" : "text-[#d4af37]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>

                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`font-mono tabular-nums text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? "bg-neutral-950/15 text-neutral-950"
                              : item.badgeTone === "alert"
                              ? "bg-rose-600 text-white"
                              : item.badgeTone === "emerald"
                              ? "bg-[#0f5132] text-emerald-200"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3.5 border-t border-neutral-800/80 space-y-1.5 bg-neutral-950">
          <a
            href="/"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/6 hover:text-white transition-colors"
          >
            <span>Boutique publique</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
          </a>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <span>Se déconnecter</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE COLUMN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR WITH SEARCH & ADMINISTRATOR PROFILE */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 px-4 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile menu button + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 cursor-pointer shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-neutral-500 truncate">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="hover:text-neutral-900 transition-colors cursor-pointer hidden sm:inline"
              >
                Administration
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline shrink-0" />
              <span className="font-display font-bold text-sm text-neutral-950 truncate">
                {currentMeta.title}
              </span>
            </div>
          </div>

          {/* Right: Global Search, Quick Actions & Admin Profile */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-64 lg:w-72">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher produit, commande, vendeur..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-[#d4af37] rounded-xl outline-none text-neutral-900 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefreshAll}
              title="Actualiser les données en direct"
              className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#0f5132]" : ""}`} />
            </button>

            {/* Alerts Shortcut */}
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              title="Opérations et demandes en attente"
              className="relative p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
            >
              <Bell className="w-4 h-4" />
              {pendingAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-mono tabular-nums text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingAlertsCount}
                </span>
              )}
            </button>

            {/* Quick Add Product Button */}
            <button
              type="button"
              onClick={onQuickAddProduct}
              className="hidden sm:flex items-center gap-1.5 bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau produit</span>
            </button>

            {/* Administrator Profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-xl bg-neutral-950 text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center font-display font-bold text-xs shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <div className="text-xs font-semibold text-neutral-950">Administrateur</div>
                <div className="text-[10px] text-[#0f5132] font-medium">Direction · En ligne</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT VIEWPORT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Contextual Section Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-neutral-950 tracking-tight">
                {currentMeta.title}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {currentMeta.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeTab !== "overview" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  ← Vue d&apos;ensemble
                </button>
              )}
              {activeTab === "overview" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("catalog")}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:border-[#d4af37] text-neutral-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Gérer le Catalogue ({productsCount})</span>
                </button>
              )}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

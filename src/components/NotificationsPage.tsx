import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  Volume2, 
  VolumeX, 
  Sparkles,
  RefreshCw,
  ArrowLeft,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  XCircle,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppNotification } from "../types";

interface NotificationsPageProps {
  user: any | null;
  token: string | null;
  showToast: (msg: string) => void;
  onTrackOrder?: (orderId: string) => void;
  onOpenInvoice?: (order: any) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToHome?: () => void;
}

// Subtle Web Audio API chime generator
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Note 1: High crisp chime (E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Note 2: Harmonious chime (B6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1975.53, ctx.currentTime + 0.08);
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.65);
  } catch (e) {
    // AudioContext blocked or unsupported
  }
};

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  user,
  token,
  showToast,
  onTrackOrder,
  onOpenInvoice,
  onNavigateToCatalog,
  onNavigateToHome
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "orders" | "system" | "unread">("all");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("asime_notif_sound");
      return saved !== "false";
    } catch (e) {
      return true;
    }
  });
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simOrderId, setSimOrderId] = useState("CMD-98189");
  const [simStatus, setSimStatus] = useState<string>("Expédiée");

  // Load initial notifications
  const loadNotifications = () => {
    let list: AppNotification[] = [];

    // 1. From User Object if logged in
    if (user && Array.isArray(user.notifications)) {
      list = [...user.notifications];
    } else if (token) {
      try {
        const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
        const currentUser = users.find((u: any) => u.id === user?.id || (user && u.email === user.email));
        if (currentUser && Array.isArray(currentUser.notifications)) {
          list = [...currentUser.notifications];
        }
      } catch (e) {}
    }

    // 2. Add Global Order Status Notifications
    try {
      const globalNotifs: AppNotification[] = JSON.parse(localStorage.getItem("asime_global_notifications") || "[]");
      if (Array.isArray(globalNotifs)) {
        const existingIds = new Set(list.map((n) => n.id));
        for (const gn of globalNotifs) {
          if (!existingIds.has(gn.id)) {
            list.push(gn);
          }
        }
      }
    } catch (e) {}

    // Sort newest first
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fallback default demos
    if (list.length === 0) {
      const initialDemos: AppNotification[] = [
        {
          id: "notif_welcome_1",
          orderId: "CMD-98189",
          oldStatus: "En préparation",
          newStatus: "Expédiée",
          title: "Colis en cours de livraison",
          text: "Votre commande #CMD-98189 a été confiée à notre livreur partenaire à Lomé. Arrivée estimée sous 2h.",
          type: "order_status",
          read: false,
          date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          totalAmount: 5400
        },
        {
          id: "notif_welcome_2",
          orderId: "CMD-84210",
          oldStatus: "En attente",
          newStatus: "Confirmée",
          title: "Paiement Validé & Commande Confirmée",
          text: "Votre commande #CMD-84210 (Miel Sauvage de Kpalimé) a été validée par l'artisan vendeur.",
          type: "order_status",
          read: false,
          date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          totalAmount: 12500
        },
        {
          id: "notif_welcome_3",
          title: "Bienvenue sur le Centre d'Alertes Miabé Asi",
          text: "Retrouvez ici l'historique complet de vos suivis d'expéditions, factures téléchargeables et informations de commande en direct.",
          type: "system",
          read: true,
          date: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        }
      ];
      list = initialDemos;
    }

    setNotifications(list);
    return list;
  };

  useEffect(() => {
    loadNotifications();
  }, [user, token]);

  // Listen for real-time order status updates via CustomEvent and Storage
  useEffect(() => {
    const handleOrderStatusEvent = (e: any) => {
      const notif: AppNotification = e.detail;
      if (!notif) return;

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== notif.id);
        return [notif, ...filtered];
      });

      if (soundEnabled) {
        playNotificationChime();
      }
    };

    window.addEventListener("asime-order-status-update", handleOrderStatusEvent);
    return () => {
      window.removeEventListener("asime-order-status-update", handleOrderStatusEvent);
    };
  }, [soundEnabled]);

  // Save sound setting
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("asime_notif_sound", String(next));
    } catch (e) {}
    if (next) {
      playNotificationChime();
      showToast("🔔 Sons de notifications activés");
    } else {
      showToast("🔕 Sons de notifications désactivés");
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);

    try {
      localStorage.setItem("asime_global_notifications", JSON.stringify(updated));
    } catch (e) {}

    showToast("✓ Toutes les notifications ont été marquées comme lues");
  };

  // Mark single as read
  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    try {
      localStorage.setItem("asime_global_notifications", JSON.stringify(updated));
    } catch (e) {}
  };

  // Delete single notification
  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    try {
      localStorage.setItem("asime_global_notifications", JSON.stringify(updated));
    } catch (e) {}
    showToast("Notification supprimée");
  };

  // Clear all
  const clearAllNotifications = () => {
    if (notifications.length === 0) return;
    if (window.confirm("Êtes-vous sûr de vouloir effacer tout l'historique des notifications ?")) {
      setNotifications([]);
      try {
        localStorage.setItem("asime_global_notifications", JSON.stringify([]));
      } catch (e) {}
      showToast("Historique de notifications vidé");
    }
  };

  // Trigger test simulation
  const handleSimulateStatusChange = () => {
    const notifId = "notif_sim_" + Date.now();
    const newNotif: AppNotification = {
      id: notifId,
      orderId: simOrderId.trim() || "CMD-98189",
      oldStatus: "En préparation",
      newStatus: simStatus,
      title: `Statut Commande : ${simStatus}`,
      text: `Mise à jour pour votre commande #${simOrderId.trim() || "CMD-98189"} : passage à l'étape "${simStatus}".`,
      type: "order_status",
      read: false,
      date: new Date().toISOString(),
      totalAmount: 14500
    };

    // Save in global storage
    try {
      const globalNotifs: AppNotification[] = JSON.parse(localStorage.getItem("asime_global_notifications") || "[]");
      localStorage.setItem("asime_global_notifications", JSON.stringify([newNotif, ...globalNotifs]));
    } catch (e) {}

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("asime-order-status-update", {
        detail: newNotif
      })
    );

    showToast(`🚀 Simulation déclenchée : #${newNotif.orderId} → ${simStatus}`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const orderCount = notifications.filter((n) => n.type === "order_status").length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "unread") return !n.read;
    if (filterTab === "orders") return n.type === "order_status";
    if (filterTab === "system") return n.type !== "order_status";
    return true;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "En attente":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
          label: "En attente"
        };
      case "Confirmée":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
          label: "Confirmée"
        };
      case "En préparation":
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-300",
          icon: <Package className="w-3.5 h-3.5 text-amber-700 shrink-0" />,
          label: "En préparation"
        };
      case "Expédiée":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-200",
          icon: <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />,
          label: "En cours de livraison"
        };
      case "Livrée":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
          label: "Livrée avec succès"
        };
      case "Annulée":
        return {
          bg: "bg-red-50 text-red-800 border-red-200",
          icon: <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />,
          label: "Annulée"
        };
      default:
        return {
          bg: "bg-stone-100 text-stone-800 border-stone-200",
          icon: <Bell className="w-3.5 h-3.5 text-stone-600 shrink-0" />,
          label: status || "Notification"
        };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Breadcrumbs & Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={onNavigateToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              Lomé, Togo 🇹🇬
            </span>
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="bg-neutral-950 text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-[#d4af37]/35 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d4af37]/15 border border-[#d4af37]/30 rounded-full text-[#d4af37] text-[10px] font-black uppercase tracking-widest">
                <Bell className="w-3.5 h-3.5" />
                <span>Centre d'Alertes en Temps Réel</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wide">
                Mes Notifications & Suivis de Colis
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-sans leading-relaxed">
                Suivez en temps réel l'avancement de vos commandes, l'expédition par les livreurs à Lomé, et accédez directement à vos reçus officiels.
              </p>
            </div>

            {/* Quick Stats Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-3.5 text-center min-w-[90px]">
                <span className="block text-xl font-display font-black text-[#d4af37]">{notifications.length}</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total</span>
              </div>
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-3.5 text-center min-w-[90px]">
                <span className={`block text-xl font-display font-black ${unreadCount > 0 ? "text-amber-400" : "text-neutral-400"}`}>
                  {unreadCount}
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Non lues</span>
              </div>
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-3.5 text-center min-w-[90px]">
                <span className="block text-xl font-display font-black text-emerald-400">{orderCount}</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Commandes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de Notifications & Annonces Officielles (transférée sur cette page dédiée) */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-[#b8901c] border border-amber-200">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-display font-black text-sm uppercase tracking-wider text-neutral-900">
                  Flash Info & Annonces Officielles Miabé Asi
                </h2>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Toutes les informations et alertes officielles en direct de la plateforme
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#b8901c] bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-200">
              En direct
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {[
              {
                icon: "🇹🇬",
                badge: "OFFICIEL",
                title: "Boutique Officielle Miabé Asi",
                desc: "Le 1er E-Shop d'Excellence & Terroir du Togo. Produits 100% vérifiés et certifiés locaux.",
                action: "Explorer le catalogue"
              },
              {
                icon: "🍯",
                badge: "QUALITÉ SUPÉRIEURE",
                title: "Miels Purs & Cosmétiques Naturels",
                desc: "Récolte artisanale dans les Plateaux et coopératives de beurre de karité authentique.",
                action: "Voir la sélection"
              },
              {
                icon: "🚚",
                badge: "EXPRESS LOMÉ",
                title: "Livraison Rapide Partout au Togo",
                desc: "Expédition sécurisée sous 2h à 24h avec paiement sécurisé à la livraison (T-Money, Flooz, Cash).",
                action: "Consulter les options"
              },
              {
                icon: "🤝",
                badge: "ARTISANS DIRECT",
                title: "Rejoindre les Créateurs & Vendeurs",
                desc: "Publiez vos produits et développez votre activité sur la vitrine togolaise de référence.",
                action: "Espace Vendeurs"
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-lg bg-[#FAF8F5] border border-stone-200/80 hover:border-[#d4af37] transition-all flex items-start gap-3"
              >
                <span className="text-2xl shrink-0 p-1 bg-white rounded-md border border-stone-200 shadow-2xs">
                  {item.icon}
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8.5px] font-black uppercase tracking-widest bg-neutral-950 text-[#d4af37] px-1.5 py-0.5 rounded-xs">
                      {item.badge}
                    </span>
                    <h3 className="font-sans font-bold text-xs text-neutral-900 line-clamp-1">{item.title}</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">{item.desc}</p>
                  {onNavigateToCatalog && (
                    <button 
                      onClick={onNavigateToCatalog}
                      className="text-[10px] font-bold text-[#b8901c] hover:text-neutral-950 uppercase tracking-wider inline-flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <span>{item.action}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all" as const, label: "Toutes", count: notifications.length },
              { key: "orders" as const, label: "📦 Commandes & Livraisons", count: orderCount },
              { key: "unread" as const, label: "✨ Non lues", count: unreadCount },
              { key: "system" as const, label: "🔔 Système & Infos", count: notifications.length - orderCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterTab === tab.key
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-full ${
                    filterTab === tab.key ? "bg-[#d4af37] text-neutral-950" : "bg-stone-300 text-stone-800"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
              }`}
              title={soundEnabled ? "Sons activés (cliquer pour couper)" : "Sons coupés (cliquer pour activer)"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
              <span className="hidden md:inline">{soundEnabled ? "Sons Activés" : "Silencieux"}</span>
            </button>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#916b08] border border-[#d4af37]/35 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Tout marquer comme lu</span>
              </button>
            )}

            {/* Simulator Toggle */}
            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className={`p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${
                isSimulatorOpen
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-white hover:bg-stone-50 text-stone-700 border-stone-300"
              }`}
              title="Tester les changements de statut de commande"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Simulateur</span>
            </button>

            {/* Clear All */}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-2 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 border border-stone-200 transition-all cursor-pointer"
                title="Effacer tout l'historique"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Change Simulator Panel */}
        <AnimatePresence>
          {isSimulatorOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300/80 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-neutral-900">
                      Simulateur de Notification en Temps Réel
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full uppercase">
                    Outil de Test Démonstration
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                      Numéro de Commande
                    </label>
                    <input
                      type="text"
                      value={simOrderId}
                      onChange={(e) => setSimOrderId(e.target.value)}
                      placeholder="CMD-98189"
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-700 mb-1">
                      Nouveau Statut à Déclencher
                    </label>
                    <select
                      value={simStatus}
                      onChange={(e) => setSimStatus(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                    >
                      <option value="En attente">En attente</option>
                      <option value="Confirmée">Confirmée</option>
                      <option value="En préparation">En préparation</option>
                      <option value="Expédiée">Expédiée (En cours de livraison)</option>
                      <option value="Livrée">Livrée</option>
                      <option value="Annulée">Annulée</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSimulateStatusChange}
                      className="w-full bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-[#d4af37]" />
                      <span>Déclencher l'Alerte</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Stream */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base uppercase tracking-wider text-neutral-900">
                Aucune notification trouvée
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-sans">
                {filterTab === "unread"
                  ? "Toutes vos alertes ont été lues."
                  : "Vous recevrez ici des notifications en direct lors de chaque mise à jour de vos commandes."}
              </p>
            </div>

            {onNavigateToCatalog && (
              <button
                onClick={onNavigateToCatalog}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-[#d4af37] text-white hover:text-neutral-950 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explorer le catalogue</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const badge = getStatusBadge(notif.newStatus);
              const isOrder = notif.type === "order_status";

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`bg-white rounded-xl border transition-all duration-200 p-5 shadow-xs relative overflow-hidden ${
                    notif.read
                      ? "border-stone-200 hover:border-stone-300"
                      : "border-amber-300 bg-amber-50/20 shadow-sm"
                  }`}
                >
                  {/* Unread Accent Stripe */}
                  {!notif.read && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#d4af37]"></div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pl-1">
                    
                    {/* Left: Icon & Content */}
                    <div className="flex items-start gap-3.5 flex-grow">
                      <div className={`p-2.5 rounded-lg shrink-0 ${
                        isOrder ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-700"
                      }`}>
                        {isOrder ? (
                          notif.newStatus === "Expédiée" ? (
                            <Truck className="w-5 h-5 text-amber-700" />
                          ) : notif.newStatus === "Livrée" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                          ) : (
                            <Package className="w-5 h-5 text-amber-700" />
                          )
                        ) : (
                          <Bell className="w-5 h-5 text-stone-700" />
                        )}
                      </div>

                      <div className="space-y-1.5 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-extrabold text-sm uppercase tracking-wide text-neutral-950">
                            {notif.title}
                          </h4>
                          
                          {notif.orderId && (
                            <span className="font-mono text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-sm">
                              #{notif.orderId}
                            </span>
                          )}

                          {isOrder && notif.newStatus && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.bg}`}>
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          )}

                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Non lu"></span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                          {notif.text}
                        </p>

                        {/* Order Timeline Progress Bar if order notification */}
                        {isOrder && notif.newStatus && (
                          <div className="pt-2 max-w-md">
                            <div className="grid grid-cols-4 gap-1.5 text-center">
                              {[
                                { step: 1, name: "Confirmée", activeKey: "Confirmée" },
                                { step: 2, name: "Préparation", activeKey: "En préparation" },
                                { step: 3, name: "Expédiée", activeKey: "Expédiée" },
                                { step: 4, name: "Livrée", activeKey: "Livrée" }
                              ].map((st) => {
                                const orderSteps = ["Confirmée", "En préparation", "Expédiée", "Livrée"];
                                const currentIndex = orderSteps.indexOf(notif.newStatus || "");
                                const thisIndex = orderSteps.indexOf(st.activeKey);
                                const isPassed = currentIndex >= thisIndex && currentIndex !== -1;
                                const isCurrent = currentIndex === thisIndex;

                                return (
                                  <div key={st.step} className="flex flex-col items-center gap-1">
                                    <div className={`h-1.5 w-full rounded-full ${
                                      isPassed ? "bg-emerald-500" : "bg-stone-200"
                                    }`}></div>
                                    <span className={`text-[8.5px] uppercase tracking-tighter ${
                                      isCurrent
                                        ? "font-black text-emerald-800"
                                        : isPassed
                                        ? "font-bold text-neutral-700"
                                        : "text-neutral-400"
                                    }`}>
                                      {st.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Timestamp & Action Controls */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider whitespace-nowrap">
                        {formatTime(notif.date)}
                      </span>

                      <div className="flex items-center gap-2">
                        {isOrder && notif.orderId && onTrackOrder && (
                          <button
                            onClick={() => onTrackOrder(notif.orderId!)}
                            className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-[#d4af37] text-white hover:text-neutral-950 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="Voir le suivi de livraison détaillé"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Suivre</span>
                          </button>
                        )}

                        {isOrder && notif.orderId && onOpenInvoice && (
                          <button
                            onClick={() => {
                              const dummyOrder = {
                                id: notif.orderId,
                                createdAt: new Date(notif.date).getTime(),
                                totalAmount: notif.totalAmount || 5400,
                                paymentStatus: "Payé",
                                orderStatus: notif.newStatus || "Confirmée",
                                paymentMethod: "MOBILE MONEY",
                                shippingDetails: {
                                  name: user?.name || "Client Miabé Asi",
                                  phone: user?.phone || "+228 90 00 00 00",
                                  quartier: "Lomé, Togo"
                                },
                                items: [
                                  {
                                    product: {
                                      id: "item_notif_1",
                                      nom: "Article commandé #" + notif.orderId,
                                      prix: notif.totalAmount || 5400,
                                      partenaire: "Miabé Asi Direct"
                                    },
                                    quantity: 1
                                  }
                                ]
                              };
                              onOpenInvoice(dummyOrder);
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                            title="Télécharger la facture"
                          >
                            <FileText className="w-3 h-3 text-[#d4af37]" />
                            <span className="hidden sm:inline">Facture</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => deleteNotification(notif.id, e)}
                          className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Supprimer cette notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
};

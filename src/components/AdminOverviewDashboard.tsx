import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  Eye,
  Power,
  AlertCircle,
  CheckCircle2,
  FileText,
  ArrowUpRight,
  Search,
  Clock,
  Store,
  Image as ImageIcon,
  Sparkles,
  Plus,
  ChevronRight
} from "lucide-react";
import AdminStats from "./AdminStats";
import { Product } from "../types";

export type AdminTabType =
  | "overview"
  | "catalog"
  | "analytics"
  | "requests"
  | "vendors"
  | "banners"
  | "stats"
  | "settings"
  | "blogs";

interface AdminOverviewDashboardProps {
  products: Product[];
  orders: any[];
  withdrawals: any[];
  usersList: any[];
  bannerRequests: any[];
  featuredRequests: any[];
  formatFCFA: (amount: number | null) => string;
  setActiveTab: (tab: AdminTabType) => void;
  setAdminStatusFilter: (status: "all" | "actif" | "inactif" | "en_rupture") => void;
  handleValidatePayment: (orderId: string) => void;
  handleUpdateOrderStatus: (orderId: string, status: string) => void;
  handleApproveWithdrawal: (id: string) => void;
  handleRejectWithdrawal: (id: string) => void;
  handleApproveSeller: (userId: string) => void;
  handleRejectSeller: (userId: string) => void;
  handleApproveBanner: (id: string) => void;
  handleApproveFeatured: (productId: string) => void;
  onOpenInvoice: (order: any) => void;
  globalSearchQuery: string;
}

export default function AdminOverviewDashboard({
  products,
  orders,
  withdrawals,
  usersList,
  bannerRequests,
  featuredRequests,
  formatFCFA,
  setActiveTab,
  setAdminStatusFilter,
  handleValidatePayment,
  handleUpdateOrderStatus,
  handleApproveWithdrawal,
  handleRejectWithdrawal,
  handleApproveSeller,
  handleRejectSeller,
  handleApproveBanner,
  handleApproveFeatured,
  onOpenInvoice,
  globalSearchQuery
}: AdminOverviewDashboardProps) {
  const [activityFilter, setActivityFilter] = useState<"all" | "orders" | "withdrawals" | "vendors">("all");
  const [localActivitySearch, setLocalActivitySearch] = useState("");

  const effectiveSearch = (localActivitySearch || globalSearchQuery || "").trim().toLowerCase();

  // Compute real platform metrics combined with annual baseline
  const paidOrders = useMemo(
    () => orders.filter((o) => o.paymentStatus === "Payé" || o.orderStatus === "Livré"),
    [orders]
  );
  const liveOrdersRevenue = useMemo(
    () => paidOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0),
    [paidOrders]
  );
  const catalogRevenue = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.salesCount) || 0) * (Number(p.prix) || 0), 0),
    [products]
  );
  const displayedRevenue = Math.max(liveOrdersRevenue, catalogRevenue, 12520000);

  const activeProductsCount = useMemo(
    () => products.filter((p) => (p.status || "actif") === "actif" && (p.stock || 0) > 0).length,
    [products]
  );
  const inactiveProductsCount = useMemo(
    () => products.filter((p) => p.status === "inactif").length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.status === "en_rupture" || (p.stock || 0) <= 0).length,
    [products]
  );

  const sellersList = useMemo(
    () => usersList.filter((u) => u.role === "vendeur" || u.vendeurSubscription),
    [usersList]
  );
  const pendingSellers = useMemo(
    () => usersList.filter((u) => u.vendeurStatus === "En attente d'activation"),
    [usersList]
  );
  const pendingWithdrawals = useMemo(
    () => withdrawals.filter((w) => w.status === "En attente"),
    [withdrawals]
  );
  const unpaidOrdersCount = useMemo(
    () => orders.filter((o) => o.paymentStatus !== "Payé" && o.paymentMethod !== "Espèces").length,
    [orders]
  );
  const pendingBanners = useMemo(
    () => bannerRequests.filter((b) => b.status === "pending"),
    [bannerRequests]
  );
  const pendingFeatured = useMemo(
    () => featuredRequests.filter((p) => p.phareStatus === "pending"),
    [featuredRequests]
  );

  // Build unified Recent Activities & Operations list
  const unifiedOperations = useMemo(() => {
    const items: Array<{
      id: string;
      type: "order" | "withdrawal" | "vendor" | "banner" | "featured";
      title: string;
      subtitle: string;
      actor: string;
      actorContact: string;
      dateStr: string;
      timestamp: number;
      amount: number | null;
      statusLabel: string;
      statusTone: "emerald" | "amber" | "rose" | "neutral";
      raw: any;
    }> = [];

    orders.forEach((o) => {
      const isPaid = o.paymentStatus === "Payé";
      const isDelivered = o.orderStatus === "Livré";
      const isCancelled = o.orderStatus === "Annulé";
      const ts = o.createdAt ? new Date(o.createdAt).getTime() : Date.now();
      const firstItem = o.items?.[0]?.product?.nom || "Commande boutique";
      const extraCount = (o.items?.length || 1) - 1;

      items.push({
        id: `ord-${o.id}`,
        type: "order",
        title: `Commande #${o.id}`,
        subtitle: extraCount > 0 ? `${firstItem} (+${extraCount} autre${extraCount > 1 ? "s" : ""})` : firstItem,
        actor: o.shippingDetails?.name || "Client Boutique",
        actorContact: o.shippingDetails?.phone ? `+${String(o.shippingDetails.phone).replace(/^\+/, "")}` : (o.shippingDetails?.quartier || "Lomé"),
        dateStr: o.createdAt ? new Date(o.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Aujourd'hui",
        timestamp: isNaN(ts) ? 0 : ts,
        amount: Number(o.totalAmount) || 0,
        statusLabel: isCancelled ? "Annulé" : isDelivered ? "Livré" : isPaid ? "Payé" : "En attente",
        statusTone: isCancelled ? "rose" : isDelivered || isPaid ? "emerald" : "amber",
        raw: o
      });
    });

    withdrawals.forEach((w) => {
      const userObj = usersList.find((u) => u.id === w.userId);
      const displayName = userObj?.businessName || userObj?.name || w.userId || "Vendeur";
      const ts = w.createdAt ? new Date(w.createdAt).getTime() : Date.now();
      const isPending = w.status === "En attente";
      const isPaid = w.status === "Payé";

      items.push({
        id: `wth-${w.id}`,
        type: "withdrawal",
        title: `Retrait #${w.id}`,
        subtitle: `Portefeuille · ${w.method || "Mobile Money"}`,
        actor: displayName,
        actorContact: w.phone ? `+${String(w.phone).replace(/^\+/, "")}` : "Mobile Money",
        dateStr: w.createdAt ? new Date(w.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Récent",
        timestamp: isNaN(ts) ? 0 : ts,
        amount: Number(w.amount) || 0,
        statusLabel: w.status || "En attente",
        statusTone: isPaid ? "emerald" : isPending ? "amber" : "neutral",
        raw: w
      });
    });

    pendingSellers.forEach((u) => {
      const ts = u.createdAt ? new Date(u.createdAt).getTime() : Date.now();
      items.push({
        id: `vnd-${u.id}`,
        type: "vendor",
        title: `Activation Boutique`,
        subtitle: `${u.vendeurSubscription || "Offre 1"} · ${u.vendeurPaymentMethod || "Mobile Money"}`,
        actor: u.businessName || u.name || "Nouveau Vendeur",
        actorContact: u.email || (u.phone ? `+${u.phone}` : "Togo"),
        dateStr: "En attente",
        timestamp: isNaN(ts) ? Date.now() : ts,
        amount: u.vendeurSubscription === "Offre 3" ? 3200 : u.vendeurSubscription === "Offre 2" ? 1600 : 0,
        statusLabel: "À activer",
        statusTone: "amber",
        raw: u
      });
    });

    pendingBanners.forEach((b) => {
      items.push({
        id: `bnr-${b.id}`,
        type: "banner",
        title: `Bannière BUSINESS`,
        subtitle: b.title || "Visuel d'accueil soumis",
        actor: b.boutiqueName || b.vendeurName || "Partenaire VIP",
        actorContact: "Offre 3 · Business",
        dateStr: "En attente",
        timestamp: Date.now(),
        amount: null,
        statusLabel: "À valider",
        statusTone: "amber",
        raw: b
      });
    });

    pendingFeatured.forEach((p) => {
      items.push({
        id: `ftr-${p.id}`,
        type: "featured",
        title: `Produit Phare`,
        subtitle: p.nom || "Mise en avant demandée",
        actor: p.partenaire || "Vendeur Pro",
        actorContact: p.categorie || "Catalogue",
        dateStr: "En attente",
        timestamp: Date.now(),
        amount: Number(p.prix) || 0,
        statusLabel: "À valider",
        statusTone: "amber",
        raw: p
      });
    });

    return items
      .filter((item) => {
        if (activityFilter === "orders" && item.type !== "order") return false;
        if (activityFilter === "withdrawals" && item.type !== "withdrawal") return false;
        if (activityFilter === "vendors" && !["vendor", "banner", "featured"].includes(item.type)) return false;

        if (effectiveSearch) {
          const hay = `${item.title} ${item.subtitle} ${item.actor} ${item.actorContact} ${item.statusLabel}`.toLowerCase();
          return hay.includes(effectiveSearch);
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [orders, withdrawals, usersList, pendingSellers, pendingBanners, pendingFeatured, activityFilter, effectiveSearch]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SECTION 1: 4 EXECUTIVE KPI CARDS WITH EVOLUTION INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Revenue */}
        <div
          onClick={() => setActiveTab("stats")}
          className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs hover:border-[#d4af37] transition-colors cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Chiffre d&apos;Affaires Global</span>
            <div className="w-10 h-10 rounded-xl bg-neutral-950 text-[#d4af37] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono tabular-nums text-neutral-950 tracking-tight">
              {formatFCFA(displayedRevenue)}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs">
              <span className="text-emerald-700 font-mono tabular-nums font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+45.2%</span>
              </span>
              <span className="text-neutral-400 flex items-center gap-1 group-hover:text-neutral-900 transition-colors">
                <span>Rapports financiers</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders & Operations */}
        <div
          onClick={() => setActiveTab("requests")}
          className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs hover:border-[#d4af37] transition-colors cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Commandes &amp; Opérations</span>
            <div className="w-10 h-10 rounded-xl bg-[#0f5132]/10 text-[#0f5132] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-950 tracking-tight">
                {orders.length}
              </span>
              <span className="text-xs text-neutral-500 font-medium">commandes enregistrées</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs">
              <span className="text-emerald-700 font-mono tabular-nums font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+36.1%</span>
              </span>
              <span className="text-neutral-500 font-mono tabular-nums">
                {unpaidOrdersCount > 0 ? (
                  <strong className="text-amber-700">{unpaidOrdersCount} à valider</strong>
                ) : (
                  "Toutes à jour"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Catalog */}
        <div
          onClick={() => {
            setAdminStatusFilter("all");
            setActiveTab("catalog");
          }}
          className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs hover:border-[#d4af37] transition-colors cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Catalogue &amp; Inventaire</span>
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#b8901c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-950 tracking-tight">
                {activeProductsCount}
              </span>
              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                / {products.length} actifs
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs">
              <span className="text-emerald-700 font-mono tabular-nums font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4%</span>
              </span>
              <span className="text-neutral-500 font-mono tabular-nums">
                {outOfStockCount > 0 ? (
                  <span className="text-rose-600 font-semibold">{outOfStockCount} en rupture</span>
                ) : (
                  "Stock optimal"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Vendors & Members */}
        <div
          onClick={() => setActiveTab("vendors")}
          className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs hover:border-[#d4af37] transition-colors cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Réseau Vendeurs &amp; Membres</span>
            <div className="w-10 h-10 rounded-xl bg-[#0f5132]/10 text-[#0f5132] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-950 tracking-tight">
                {sellersList.length}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                boutiques · {usersList.length} membres
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs">
              <span className="text-emerald-700 font-mono tabular-nums font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+28.5%</span>
              </span>
              <span className="text-neutral-500">
                {pendingSellers.length > 0 ? (
                  <strong className="text-amber-700">{pendingSellers.length} en attente</strong>
                ) : (
                  "Réseau vérifié"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GRAPHICAL STATISTICS VISUALIZATION */}
      <AdminStats compact={true} />

      {/* SECTION 3: RECENT ACTIVITIES & OPERATIONS TABLE */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-neutral-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <span>Activités &amp; Opérations Récentes</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Suivi en temps réel des commandes clients, demandes de retrait portefeuille et validations vendeurs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Filter Controls */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200/70">
              <button
                type="button"
                onClick={() => setActivityFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === "all"
                    ? "bg-white text-neutral-950 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Toutes ({orders.length + withdrawals.length + pendingSellers.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("orders")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === "orders"
                    ? "bg-white text-neutral-950 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Commandes ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("withdrawals")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === "withdrawals"
                    ? "bg-white text-neutral-950 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Retraits ({withdrawals.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("vendors")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activityFilter === "vendors"
                    ? "bg-white text-neutral-950 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Demandes ({pendingSellers.length + pendingBanners.length + pendingFeatured.length})
              </button>
            </div>

            {/* Table Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localActivitySearch}
                onChange={(e) => setLocalActivitySearch(e.target.value)}
                placeholder="Filtrer une opération..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#d4af37] text-neutral-900"
              />
            </div>
          </div>
        </div>

        {unifiedOperations.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-800">Aucune opération récente trouvée</p>
            <p className="text-xs text-neutral-500 mt-1">
              Les nouvelles commandes PayDunya, demandes de retrait et activations de boutiques apparaîtront automatiquement ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px]">
                  <th className="py-3.5 px-6">Opération &amp; Référence</th>
                  <th className="py-3.5 px-4">Client / Partenaire</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-6 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {unifiedOperations.slice(0, 12).map((op) => {
                  const isOrder = op.type === "order";
                  const isWithdrawal = op.type === "withdrawal";
                  const isVendor = op.type === "vendor";
                  const isBanner = op.type === "banner";
                  const isFeatured = op.type === "featured";

                  return (
                    <tr key={op.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isOrder
                                ? "bg-[#0f5132]/10 text-[#0f5132]"
                                : isWithdrawal
                                ? "bg-[#d4af37]/15 text-[#b8901c]"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {isOrder ? (
                              <ShoppingBag className="w-4 h-4" />
                            ) : isWithdrawal ? (
                              <CreditCard className="w-4 h-4" />
                            ) : isVendor ? (
                              <Store className="w-4 h-4" />
                            ) : isBanner ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-950 font-mono tabular-nums truncate">
                              {op.title}
                            </div>
                            <div className="text-[11px] text-neutral-500 truncate max-w-xs">
                              {op.subtitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-900">{op.actor}</div>
                        <div className="text-[11px] text-neutral-400 font-mono tabular-nums">{op.actorContact}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                        {op.dateStr}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-neutral-950 whitespace-nowrap">
                        {op.amount !== null ? formatFCFA(op.amount) : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            op.statusTone === "emerald"
                              ? "text-emerald-700"
                              : op.statusTone === "amber"
                              ? "text-amber-700"
                              : op.statusTone === "rose"
                              ? "text-rose-700"
                              : "text-neutral-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              op.statusTone === "emerald"
                                ? "bg-emerald-600"
                                : op.statusTone === "amber"
                                ? "bg-amber-500"
                                : op.statusTone === "rose"
                                ? "bg-rose-600"
                                : "bg-neutral-400"
                            }`}
                          />
                          <span>{op.statusLabel}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isOrder && op.raw.paymentStatus !== "Payé" && op.raw.paymentMethod !== "Espèces" && (
                            <button
                              type="button"
                              onClick={() => handleValidatePayment(op.raw.id)}
                              className="px-2.5 py-1.5 bg-[#d4af37] hover:bg-[#e5c158] text-neutral-950 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>
                          )}

                          {isOrder && (
                            <>
                              <select
                                value={op.raw.orderStatus || "En préparation"}
                                onChange={(e) => handleUpdateOrderStatus(op.raw.id, e.target.value)}
                                className="border border-neutral-200 rounded-lg px-2 py-1 text-[11px] bg-white text-neutral-700 font-medium cursor-pointer focus:outline-none focus:border-[#d4af37]"
                              >
                                <option value="En préparation">En préparation</option>
                                <option value="En cours de livraison">En livraison</option>
                                <option value="Livré">Livré</option>
                                <option value="Annulé">Annulé</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => onOpenInvoice(op.raw)}
                                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-950 text-neutral-700 hover:text-white rounded-lg font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                title="Afficher la facture"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Facture</span>
                              </button>
                            </>
                          )}

                          {isWithdrawal && op.raw.status === "En attente" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveWithdrawal(op.raw.id)}
                                className="px-2.5 py-1.5 bg-[#0f5132] hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Approuver
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectWithdrawal(op.raw.id)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Rejeter
                              </button>
                            </>
                          )}

                          {isVendor && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveSeller(op.raw.id)}
                                className="px-2.5 py-1.5 bg-[#0f5132] hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Activer
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectSeller(op.raw.id)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Rejeter
                              </button>
                            </>
                          )}

                          {isBanner && (
                            <button
                              type="button"
                              onClick={() => handleApproveBanner(op.raw.id)}
                              className="px-2.5 py-1.5 bg-[#0f5132] hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Publier
                            </button>
                          )}

                          {isFeatured && (
                            <button
                              type="button"
                              onClick={() => handleApproveFeatured(op.raw.id)}
                              className="px-2.5 py-1.5 bg-[#0f5132] hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Valider Phare
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
        )}

        <div className="px-6 py-3.5 bg-neutral-50/60 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Affichage des {Math.min(12, unifiedOperations.length)} opérations les plus récentes sur {unifiedOperations.length}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className="font-semibold text-neutral-900 hover:text-[#b8901c] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Voir toutes les opérations &amp; demandes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 4: QUICK CATALOG INVENTORY HEALTH & SHORTCUTS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab("catalog");
            setAdminStatusFilter("all");
          }}
          className="bg-white p-4 border border-neutral-200/90 rounded-2xl hover:border-[#d4af37] transition-all cursor-pointer text-left flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-neutral-500 font-medium block">Catalogue Total</span>
            <span className="text-xl font-bold font-mono tabular-nums text-neutral-950 mt-1 block">
              {products.length} articles
            </span>
          </div>
          <Package className="w-5 h-5 text-[#d4af37]" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("catalog");
            setAdminStatusFilter("actif");
          }}
          className="bg-white p-4 border border-neutral-200/90 rounded-2xl hover:border-emerald-600 transition-all cursor-pointer text-left flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-emerald-700 font-medium block">Actifs (En Ligne)</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-800 mt-1 block">
              {activeProductsCount} visibles
            </span>
          </div>
          <Eye className="w-5 h-5 text-emerald-600" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("catalog");
            setAdminStatusFilter("inactif");
          }}
          className="bg-white p-4 border border-neutral-200/90 rounded-2xl hover:border-neutral-500 transition-all cursor-pointer text-left flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-neutral-500 font-medium block">Inactifs (Masqués)</span>
            <span className="text-xl font-bold font-mono tabular-nums text-neutral-800 mt-1 block">
              {inactiveProductsCount} masqués
            </span>
          </div>
          <Power className="w-5 h-5 text-neutral-500" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("catalog");
            setAdminStatusFilter("en_rupture");
          }}
          className="bg-white p-4 border border-neutral-200/90 rounded-2xl hover:border-rose-500 transition-all cursor-pointer text-left flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-rose-700 font-medium block">En Rupture de Stock</span>
            <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-1 block">
              {outOfStockCount} épuisés
            </span>
          </div>
          <AlertCircle className="w-5 h-5 text-rose-600" />
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { X, Printer, Share2, CheckCircle, ShieldCheck, Download, ExternalLink } from "lucide-react";

interface OrderItem {
  product: {
    id: string;
    nom: string;
    prix: number;
    partenaire?: string;
  };
  quantity: number;
}

interface OrderData {
  id: string;
  createdAt: string | number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod?: string;
  shippingDetails?: {
    name?: string;
    phone?: string;
    quartier?: string;
    city?: string;
  };
  items: OrderItem[];
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
  merchantPhone?: string;
  logoUrl?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  merchantPhone = "22890000000",
  logoUrl
}) => {
  if (!isOpen || !order) return null;

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0
    }).format(amount).replace("XOF", "FCFA");
  };

  const invoiceDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : new Date().toLocaleDateString("fr-FR");

  const trackingUrl = `${window.location.origin}/?track=${order.id}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `📄 *FACTURE ASIME TOGO #${order.id}*\n\n` +
      `👤 *Client :* ${order.shippingDetails?.name || "Client"}\n` +
      `💰 *Total :* ${formatFCFA(order.totalAmount)}\n` +
      `🟢 *Statut :* ${order.paymentStatus || "Payé"}\n` +
      `🔗 *Lien de suivi & Facture :* ${trackingUrl}\n\n` +
      `Merci d'avoir commandé sur Asime Togo ! 🇹🇬`;
    
    const url = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const isPaid = order.paymentStatus === "Payé" || order.paymentStatus === "Paid";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-xs overflow-y-auto">
      {/* Background overlay */}
      <div className="fixed inset-0 no-print" onClick={onClose} />

      {/* Main Invoice Card Container */}
      <div 
        id="printable-invoice"
        className="bg-white text-neutral-900 max-w-2xl w-full rounded-none shadow-2xl relative border-t-8 border-[#d4af37] z-10 p-6 md:p-8 space-y-6 my-auto"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Facture Officielle Client & Vendeur
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-neutral-900 hover:bg-[#d4af37] text-white hover:text-neutral-950 px-3 py-1.5 rounded-xs text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xs text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-900 transition-colors p-1 cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-logo font-black text-2xl text-neutral-950 tracking-wider">
                ASIME <span className="text-[#d4af37]">TOGO</span>
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
              Marketplace Locale de Mode & Artisanat
            </p>
            <p className="text-[10px] text-neutral-500">Lomé, République Togolaise • Tél: (+228) {merchantPhone}</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="inline-block bg-neutral-900 text-amber-400 text-xs font-mono font-extrabold px-3 py-1 uppercase tracking-wider">
              FACTURE N° {order.id.startsWith("FAC") ? order.id : `FAC-${order.id}`}
            </div>
            <p className="text-[11px] text-neutral-600 font-medium">
              Date: <strong className="text-neutral-900">{invoiceDate}</strong>
            </p>
            <div className="flex items-center sm:justify-end gap-1.5 pt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isPaid 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}>
                <CheckCircle className="w-3 h-3" />
                {isPaid ? "PAIEMENT VALIDÉ" : "EN ATTENTE DE PAIEMENT"}
              </span>
            </div>
          </div>
        </div>

        {/* Billing & Shipping Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 border border-neutral-200 rounded-xs">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#d4af37]">
              CLIENT / DESTINATAIRE
            </h4>
            <p className="text-xs font-bold text-neutral-900">
              {order.shippingDetails?.name || "Client Asime"}
            </p>
            <p className="text-xs text-neutral-700">
              📞 Téléphone : {order.shippingDetails?.phone || "N/A"}
            </p>
            <p className="text-xs text-neutral-700">
              📍 Quartier / Livraison : {order.shippingDetails?.quartier || "Lomé"}
            </p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-neutral-200 sm:pl-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#d4af37]">
              MÉTHODE DE PAIEMENT & LIVRAISON
            </h4>
            <p className="text-xs text-neutral-700">
              💳 Mode : <strong className="text-neutral-900 uppercase">{order.paymentMethod || "Asime Pay / Mobile Money"}</strong>
            </p>
            <p className="text-xs text-neutral-700">
              🚚 Statut Commande : <strong className="text-neutral-900">{order.orderStatus || "En préparation"}</strong>
            </p>
            <p className="text-xs text-neutral-700">
              🛍️ Service : Asime Express Togo
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 pb-1 border-b border-neutral-200">
            Détail des Articles Commandés
          </h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-bold uppercase text-[9.5px]">
                <th className="py-2 px-2">Article</th>
                <th className="py-2 px-2 text-center">Qté</th>
                <th className="py-2 px-2 text-right">Prix Unitaire</th>
                <th className="py-2 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items && order.items.map((item, idx) => {
                const lineTotal = (item.product?.prix || 0) * (item.quantity || 1);
                return (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-2">
                      <p className="font-bold text-neutral-900">{item.product?.nom || "Article Togolais"}</p>
                      {item.product?.partenaire && (
                        <span className="text-[9px] text-neutral-400">Vendeur: {item.product.partenaire}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-neutral-800">
                      x{item.quantity}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                      {formatFCFA(item.product?.prix || 0)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-neutral-950">
                      {formatFCFA(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-neutral-200">
          <div className="text-left space-y-1 max-w-xs">
            <p className="text-[10px] text-neutral-500 leading-tight">
              Garantie d'Authenticité Produit Local Togo. Pour toute assistance ou réclamation, contactez le support client Asime Togo au (+228) {merchantPhone}.
            </p>
            <div className="pt-2 no-print">
              <a 
                href={trackingUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-[#d4af37] hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Voir le suivi en direct</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="w-full sm:w-64 bg-neutral-950 text-white p-4 space-y-2 text-right">
            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span>Sous-total</span>
              <span className="font-mono">{formatFCFA(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span>Frais de Livraison</span>
              <span className="font-mono text-emerald-400 font-semibold">Inclus / Offert</span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex justify-between items-center font-black">
              <span className="uppercase text-[10px] tracking-wider text-[#d4af37]">TOTAL TTC</span>
              <span className="text-lg font-mono text-[#d4af37]">{formatFCFA(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center pt-4 border-t border-neutral-100 text-[10px] text-neutral-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
          <span>🇹🇬 Asime Togo • Consommer Local &amp; Promouvoir nos Artisans</span>
        </div>
      </div>
    </div>
  );
};

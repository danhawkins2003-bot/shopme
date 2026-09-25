import React, { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Store, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  MessageCircle,
  Coins,
  Globe
} from "lucide-react";

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterSeller?: () => void;
  onOpenSellerDashboard?: () => void;
  onOpenContact?: () => void;
  user?: any;
}

interface HelpItem {
  id: string;
  category: "all" | "buyer" | "seller" | "payments" | "logistics";
  question: string;
  summary: string;
  details: string[];
  cta?: {
    label: string;
    action: "seller_register" | "seller_workspace" | "contact";
  };
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenRegisterSeller,
  onOpenSellerDashboard,
  onOpenContact,
  user
}) => {
  const [activeCategory, setActiveCategory] = useState<"all" | "buyer" | "seller" | "payments" | "logistics">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("h-seller-create");

  if (!isOpen) return null;

  const helpItems: HelpItem[] = [
    {
      id: "h-seller-create",
      category: "seller",
      question: "Comment créer un compte Vendeur et ouvrir ma boutique ?",
      summary: "L'inscription vendeur est instantanée et accessible à tous les créateurs d'Afrique de l'Ouest et Centrale.",
      details: [
        "1. Cliquez sur le bouton « Devenir Vendeur » ou « Vendre sur Miabé Asi » dans le menu.",
        "2. Renseignez le nom de votre boutique ou marque, votre numéro de téléphone (WhatsApp) et votre pays d'activité.",
        "3. Choisissez votre formule de départ : Gratuite (0 F, 5 produits max), PRO (1 600 F, 50 produits, URL personnalisée) ou BUSINESS (3 200 F, produits illimités, bannière d'accueil).",
        "4. Ajoutez vos premiers articles avec photos, description et prix.",
        "5. Votre boutique est immédiatement en ligne et prête à recevoir des commandes !"
      ],
      cta: {
        label: user?.role === "vendeur" ? "Accéder à mon espace vendeur" : "Créer mon compte Vendeur maintenant",
        action: user?.role === "vendeur" ? "seller_workspace" : "seller_register"
      }
    },
    {
      id: "h-seller-plans",
      category: "seller",
      question: "Quelles sont les différences entre les abonnements Free, PRO et Business ?",
      summary: "Trois formules adaptées à chaque stade de croissance de votre activité artisanale.",
      details: [
        "• La commission est de 10% sur chaque vente effectuée pour toutes les formules. Chaque vendeur peut publier autant de produits qu'il souhaite (produits illimités pour tous).",
        "• Formule GRATUITE (0 FCFA/mois) : 10% de commission par vente, produits illimités, catalogue et encaissements Mobile Money dans les 7 pays.",
        "• Formule PRO (1 600 FCFA/mois) : 10% de commission par vente, produits illimités, URL de boutique personnalisée (miabeasi.com/boutique/votre-nom), mise en avant « Produits Phares » (jusqu'à 2 articles), badge officiel Vendeur PRO vérifié.",
        "• Formule BUSINESS (3 200 FCFA/mois) : 10% de commission par vente, produits illimités, grande bannière carrousel en page d'accueil, priorité maximale produits phares (jusqu'à 5 articles), export comptable CSV instantané et conseiller dédié 24/7."
      ],
      cta: {
        label: "Voir les offres vendeurs",
        action: user?.role === "vendeur" ? "seller_workspace" : "seller_register"
      }
    },
    {
      id: "h-buyer-order",
      category: "buyer",
      question: "Comment passer commande et payer sur Miabé Asi ?",
      summary: "Commander sur Miabé Asi est simple, rapide et 100% sécurisé via Mobile Money.",
      details: [
        "1. Parcourez le Catalogue ou choisissez une catégorie (Mode Wax, Épices, Beurre de karité, Décoration).",
        "2. Ajoutez vos articles préférés à votre Panier.",
        "3. Accédez à votre Panier et cliquez sur « Passer la commande ».",
        "4. Sélectionnez votre pays (Togo, Bénin, Côte d'Ivoire, Sénégal, Mali, Burkina Faso, Cameroun) et renseignez votre adresse de livraison.",
        "5. Réglez en toute sécurité via Mobile Money (Mix by Yas, Flooz, T-Money, Orange Money, Wave, MTN MoMo) ou carte bancaire.",
        "6. Vous recevez une confirmation instantanée et pouvez suivre votre colis en temps réel !"
      ]
    },
    {
      id: "h-payments-payouts",
      category: "payments",
      question: "Comment les vendeurs retirent-ils leurs gains de vente ?",
      summary: "Retraits directs vers votre compte Mobile Money sous 24h ouvrées.",
      details: [
        "1. Connectez-vous à votre Espace Vendeur et ouvrez l'onglet « Portefeuille & Retraits ».",
        "2. Consultez votre Solde Net Disponible (Ventes brutes minorées de la commission plateforme).",
        "3. Cliquez sur « Demander un virement » (montant minimum de 2 000 FCFA).",
        "4. Choisissez votre opérateur de paiement local (Flooz, T-Money, Mix by Yas, etc.) et votre numéro de téléphone.",
        "5. La demande est traitée sous 24 heures et vous recevez les fonds directement sur votre téléphone !"
      ],
      cta: {
        label: user?.role === "vendeur" ? "Consulter mon portefeuille" : "Ouvrir un compte vendeur",
        action: user?.role === "vendeur" ? "seller_workspace" : "seller_register"
      }
    },
    {
      id: "h-logistics-countries",
      category: "logistics",
      question: "Comment fonctionne la livraison locale et transfrontalière (7 pays) ?",
      summary: "Miabé Asi relie 7 pays ouest et centre-africains avec une logistique flexible.",
      details: [
        "• Livraison locale (dans la même ville/pays) : Effectuée par les livreurs partenaires de proximité ou le service de livraison directe du vendeur sous 24 à 48 heures.",
        "• Expédition transfrontalière : Pour les commandes passées entre deux pays différents (ex: Togo vers Côte d'Ivoire ou Bénin vers Sénégal), les détails et frais de transport sont convenus directement entre le vendeur et le client via WhatsApp.",
        "• Suivi en direct : Le numéro de suivi de commande permet de connaître l'état de préparation et d'expédition à tout moment."
      ]
    },
    {
      id: "h-guarantee-safety",
      category: "payments",
      question: "Les paiements et les achats sont-ils garantis ?",
      summary: "Protection acheteur et vendeur garantie sur chaque transaction.",
      details: [
        "• Séquestre sécurisé : Les fonds sont conservés de manière sécurisée jusqu'à ce que la livraison soit confirmée.",
        "• Vendeurs vérifiés : Chaque boutique professionnelle est authentifiée par notre équipe de modération.",
        "• Service client dédié : En cas de colis non reçu ou non conforme, notre support intervient sous 2 heures pour organiser une réexpédition ou un remboursement intégral."
      ],
      cta: {
        label: "Contacter le support client",
        action: "contact"
      }
    }
  ];

  const filteredItems = helpItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = 
      searchQuery.trim() === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCtaClick = (action: "seller_register" | "seller_workspace" | "contact") => {
    onClose();
    if (action === "seller_register" && onOpenRegisterSeller) {
      onOpenRegisterSeller();
    } else if (action === "seller_workspace" && onOpenSellerDashboard) {
      onOpenSellerDashboard();
    } else if (action === "contact" && onOpenContact) {
      onOpenContact();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Centre d'Aide &amp; Assistance Miabé Asi
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Guides détaillés pour vendeurs, acheteurs et partenaires des 7 pays
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-900 transition-colors cursor-pointer"
            title="Fermer le centre d'aide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question : créer un compte vendeur, abonnements, paiements..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0B4D26] shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-bold"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "📋 Tous les guides" },
              { id: "seller", label: "🏪 Vendre & Boutique" },
              { id: "buyer", label: "🛍️ Acheter & Panier" },
              { id: "payments", label: "💳 Paiements & Retraits" },
              { id: "logistics", label: "🚚 Livraisons (7 Pays)" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#0B4D26] text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FAF9F6]">
          {/* Quick Action Seller Banner inside modal */}
          <div className="bg-gradient-to-r from-[#0B4D26] to-[#083a1d] text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-emerald-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">Vous êtes créateur, artisan ou producteur ?</p>
                <p className="text-[11px] text-emerald-100 font-sans">Vendez vos produits à des milliers de clients au Togo et dans 6 pays partenaires.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCtaClick(user?.role === "vendeur" ? "seller_workspace" : "seller_register")}
              className="bg-[#d4af37] hover:bg-[#c49f27] text-stone-950 font-black text-xs uppercase px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              {user?.role === "vendeur" ? "Mon Espace Vendeur" : "Créer un compte Vendeur"} &rarr;
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-2 text-stone-500">
              <HelpCircle className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs font-bold text-stone-700">Aucun résultat trouvé pour votre recherche.</p>
              <p className="text-[11px] text-stone-500">Essayez un autre mot-clé ou contactez notre équipe d'assistance.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 text-xs font-bold text-[#0B4D26] underline cursor-pointer"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {item.category === "seller" ? "Boutique" : item.category === "buyer" ? "Client" : item.category === "payments" ? "Paiement" : "Logistique"}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-stone-900 uppercase">
                        {item.question}
                      </h3>
                      <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                    <div className="text-stone-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-3">
                      <div className="space-y-1.5 text-xs text-stone-700 font-sans leading-relaxed">
                        {item.details.map((detail, dIdx) => (
                          <p key={dIdx} className={detail.startsWith("•") ? "pl-2 font-medium" : ""}>
                            {detail}
                          </p>
                        ))}
                      </div>

                      {item.cta && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleCtaClick(item.cta!.action)}
                            className="bg-[#0B4D26] hover:bg-[#083a1d] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <span>{item.cta.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Support Quick Link */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Une question urgente ? Notre équipe vous répond directement sur WhatsApp.</span>
          </div>

          <button
            type="button"
            onClick={() => handleCtaClick("contact")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Contacter le support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

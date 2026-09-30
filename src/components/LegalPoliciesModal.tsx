import React, { useState } from "react";
import { X, ShieldCheck, FileText, RotateCcw, Cookie, Check } from "lucide-react";

export type LegalTab = "confidentialite" | "cgu" | "remboursement" | "cookies";

interface LegalPoliciesModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  initialTab = "confidentialite",
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-4xl w-full max-h-[90vh] rounded-none border border-[#d4af37]/40 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-1.5 bg-[#0f5132] w-full" />

        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0f5132]" />
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-neutral-900">
              Informations Légales & Conformité — Miabé Asi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex overflow-x-auto border-b border-neutral-200 bg-white px-6 scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab("confidentialite")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "confidentialite"
                ? "border-[#0f5132] text-[#0f5132] font-black"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Politique de Confidentialité</span>
          </button>

          <button
            onClick={() => setActiveTab("cgu")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "cgu"
                ? "border-[#0f5132] text-[#0f5132] font-black"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CGU & Conditions de Vente</span>
          </button>

          <button
            onClick={() => setActiveTab("remboursement")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "remboursement"
                ? "border-[#0f5132] text-[#0f5132] font-black"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retours & Remboursements</span>
          </button>

          <button
            onClick={() => setActiveTab("cookies")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "cookies"
                ? "border-[#0f5132] text-[#0f5132] font-black"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookies & Consentement</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-neutral-700 text-xs sm:text-sm font-sans leading-relaxed">
          {activeTab === "confidentialite" && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base uppercase text-neutral-900 border-l-4 border-[#0f5132] pl-3">
                Politique de Confidentialité et Protection des Données Personnelles
              </h3>
              <p className="text-neutral-500 text-xs font-mono">Dernière mise à jour : 28 Septembre 2026</p>
              
              <p>
                La plateforme <strong>Miabé Asi</strong> (« nous », « notre »), accessible à l'adresse <code>miabeasi.com</code>, s'engage résolument à garantir la confidentialité, l'intégrité et la protection des données personnelles de ses utilisateurs (acheteurs, vendeurs partenaires et visiteurs), conformément aux dispositions légales en vigueur en République Togolaise (notamment les directives de l'Autorité de Protection des Données à Caractère Personnel - APDP Togo) et aux standards internationaux de protection de la vie privée.
              </p>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">1. Données collectées</h4>
              <p>
                Dans le cadre de l'utilisation de nos services, nous collectons les informations strictement indispensables à la bonne exécution des commandes et au fonctionnement de la place de marché :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Informations de commande & livraison :</strong> nom complet, numéro de téléphone (WhatsApp / Mobile), ville, quartier et adresse de livraison.</li>
                <li><strong>Informations de compte Vendeur :</strong> nom commercial, coordonnées de contact, numéro de pièce d'identité pour la vérification KYC officielle, numéro de compte de retrait Mobile Money (TMoney, Flooz, Wave).</li>
                <li><strong>Données de transaction :</strong> montants, devises (XOF, XAF), identifiants d'opérations PayDunya sécurisées. <em>Nous ne conservons aucun code secret, code PIN ou numéro intégral de carte bancaire</em>.</li>
              </ul>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">2. Finalités du traitement</h4>
              <p>
                Vos données sont exclusivement traitées pour :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Le traitement, la préparation et la livraison physique de vos commandes.</li>
                <li>La notification en temps réel par SMS / WhatsApp / email du statut de votre colis.</li>
                <li>Le versement direct des revenus aux vendeurs partenaires après validation de la livraison.</li>
                <li>La prévention des fraudes, la lutte contre le spam et la sécurisation des transactions.</li>
              </ul>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">3. Conservation et Sécurité</h4>
              <p>
                Toutes les données sont stockées sur des infrastructures sécurisées et chiffrées (Supabase Cloud avec politiques de sécurité RLS). Elles ne sont jamais revendues, louées ou cédées à des tiers à des fins publicitaires.
              </p>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">4. Vos Droits</h4>
              <p>
                Conformément à la législation, vous disposez d'un droit permanent d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en contactant notre délégué à la protection des données par email à <code>support@miabeasi.com</code> ou directement par WhatsApp officiel.
              </p>
            </div>
          )}

          {activeTab === "cgu" && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base uppercase text-neutral-900 border-l-4 border-[#0f5132] pl-3">
                Conditions Générales d'Utilisation et de Vente (CGU / CGV)
              </h3>
              <p className="text-neutral-500 text-xs font-mono">Applicables à tous les utilisateurs et vendeurs de Miabé Asi</p>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">1. Objet de la Marketplace</h4>
              <p>
                <strong>Miabé Asi</strong> est une plateforme technologique et commerciale panafricaine mettant en relation directe des créateurs, coopératives et vendeurs togolais et régionaux avec des acheteurs au Togo et dans 7 pays d'Afrique de l'Ouest et du Centre (Togo, Bénin, Burkina Faso, Côte d'Ivoire, Mali, Sénégal, Cameroun).
              </p>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">2. Engagements des Vendeurs</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tous les produits mis en vente doivent être conformes aux critères d'authenticité et de qualité promus par Miabé Asi.</li>
                <li>Le vendeur s'engage à expédier et confier au coursier tout article commandé sous un délai maximum de 24 heures ouvrées.</li>
                <li>Une commission plateforme équitable de 10% est déduite sur chaque vente validée pour financer la logistique, l'hébergement et le support client.</li>
              </ul>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">3. Tarifs et Paiements</h4>
              <p>
                Les prix affichés sur le site sont indiqués en Francs CFA (XOF ou XAF selon le pays de l'acheteur) toutes taxes comprises. Les paiements en ligne sont traités de façon sécurisée par la passerelle agréée <strong>PayDunya</strong> (TMoney, Flooz, Wave, Cartes Visa / Mastercard). Les paiements à la livraison en espèces sont également autorisés pour les commandes locales à Lomé.
              </p>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">4. Livraison Panafricaine & Réception</h4>
              <p>
                À Lomé, la livraison standard est effectuée sous 2 à 4 heures. Pour les livraisons interurbaines et transfrontalières (Bénin, Côte d'Ivoire, etc.), les délais sont de 48h à 7 jours ouvrés selon le transporteur partenaire sélectionné.
              </p>
            </div>
          )}

          {activeTab === "remboursement" && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base uppercase text-neutral-900 border-l-4 border-[#0f5132] pl-3">
                Politique Officielle de Retour et de Remboursement
              </h3>
              <p className="text-neutral-500 text-xs font-mono">Garantie « Client Satisfait ou Remboursé »</p>

              <p>
                Chez Miabé Asi, la confiance de nos clients est notre priorité absolue. Nous veillons scrupuleusement à la satisfaction de chaque acheteur.
              </p>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">1. Délai de réclamation</h4>
              <p>
                Vous disposez d'un délai de <strong>48 heures</strong> à compter de la réception de votre colis pour signaler tout problème concernant votre commande :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Article non conforme à la description ou à la photo du catalogue.</li>
                <li>Article endommagé ou détérioré lors du transport.</li>
                <li>Erreur de taille, de couleur ou de quantité livrée.</li>
                <li>Colis non reçu après expiration du délai maximal d'acheminement.</li>
              </ul>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">2. Modalités de prise en charge</h4>
              <p>
                Dès notification auprès de notre service client (avec photo ou vidéo justificative à l'appui) :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Échange express :</strong> un nouvel article conforme vous est réexpédié sans frais supplémentaires.</li>
                <li><strong>Remboursement intégral :</strong> si le produit n'est plus en stock ou si vous préférez être remboursé, le montant intégral de l'article est recrédité sous 24h ouvrées sur votre compte Mobile Money (TMoney, Flooz, Wave) ou carte bancaire.</li>
              </ul>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">3. Exceptions</h4>
              <p>
                Pour des raisons strictes d'hygiène et de sécurité alimentaire, les denrées fraîches entamées ou les produits cosmétiques dont l'opercule de protection a été ouvert ne peuvent faire l'objet d'un retour, sauf défaut avéré à la livraison.
              </p>
            </div>
          )}

          {activeTab === "cookies" && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base uppercase text-neutral-900 border-l-4 border-[#0f5132] pl-3">
                Politique d'Utilisation des Cookies et Stockage Local
              </h3>
              <p className="text-neutral-500 text-xs font-mono">Transparence totale sur votre navigation</p>

              <p>
                Miabé Asi utilise des technologies de stockage local (cookies et localStorage du navigateur) pour assurer une expérience fluide, rapide et sécurisée.
              </p>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">1. Cookies strictement nécessaires</h4>
              <p>
                Ces éléments sont indispensables au fonctionnement de la boutique :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Session & Panier :</strong> sauvegarde temporaire des articles ajoutés à votre panier pendant votre visite.</li>
                <li><strong>Devise & Pays :</strong> mémorisation de votre pays (Togo, Bénin, Côte d'Ivoire, etc.) et de la monnaie choisie (FCFA XOF/XAF).</li>
                <li><strong>Session Vendeur / Admin :</strong> sécurisation des accès protégés pour les gérants de boutiques.</li>
              </ul>

              <h4 className="font-bold text-neutral-900 uppercase text-xs pt-2">2. Aucun cookie traceur publicitaire invasif</h4>
              <p>
                Nous n'installons <strong>aucun cookie tiers destiné à profiler ou revendre vos données</strong> à des réseaux publicitaires externes. Votre vie privée est protégée.
              </p>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm mt-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-700 shrink-0" />
                <p className="text-xs text-emerald-900 font-medium">
                  Vos préférences de consentement sont conservées pendant 12 mois et modifiables à tout moment.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-neutral-100/70 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">
            Miabé Asi — Lomé, Togo
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0f5132] hover:bg-[#0c4027] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

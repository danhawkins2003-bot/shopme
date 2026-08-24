export interface PromoSlide {
  id: string;
  badgeTagFr: string;
  badgeTagEe: string;
  badgeSubFr: string;
  badgeSubEe: string;
  subtitleFr: string;
  subtitleEe: string;
  titleFr: string;
  titleEe: string;
  offerMainFr: string;
  offerMainEe: string;
  offerSubFr: string;
  offerSubEe: string;
  descFr: string;
  descEe: string;
  buttonTextFr: string;
  buttonTextEe: string;
  categoryTarget: string;
  searchQuery?: string;
  bgGradient: string;
  imageUrl: string; // URL ou image base64 de l'affiche
  imageAlt: string;
  overlayLabelFr?: string;
  overlayLabelEe?: string;
  // Option pour afficher l'image en bannière pleine largeur
  fullImageBanner?: boolean;
}

export const RECOMMENDED_BANNER_DIMENSIONS = {
  // Format des images illustratives à droite du carrousel
  sideImage: {
    recommendedWidth: "600px",
    recommendedHeight: "400px",
    aspectRatio: "16:9 ou 3:2 (Format Paysage)",
    format: "JPG, PNG, WebP",
    maxSizeKB: 300,
    description: "Visuel produit ou modèle en format paysage"
  },
  // Format des bannières complètes (Full-width landscape posters)
  fullPoster: {
    recommendedWidth: "1200px",
    recommendedHeight: "450px",
    aspectRatio: "16:6 ou 21:9 (Format Paysage Panoramique)",
    format: "JPG, PNG, WebP",
    maxSizeKB: 500,
    description: "Affiche publicitaire complète au format paysage panoramique"
  }
};

export const INITIAL_PROMO_SLIDES: PromoSlide[] = [
  {
    id: "slide-1-mode",
    badgeTagFr: "ÉDITION SPÉCIALE TOGO 🇹🇬",
    badgeTagEe: "TOGO NYUI TƆXƐ 🇹🇬",
    badgeSubFr: "Artisanat & Textile",
    badgeSubEe: "Aɖaŋudɔ & Avɔwo",
    subtitleFr: "Créateurs & Stylistes de Lomé",
    subtitleEe: "Lomé Awutɔla Nyuitɔwo",
    titleFr: "Grande Foire du Consommer Local & Made in Togo",
    titleEe: "Togo Adzɔnuwo ƒe Fiase Gã",
    offerMainFr: "JUSQU'À -40% DE REMISE",
    offerMainEe: "ASIƉEƉE YI EDZI -40%",
    offerSubFr: "Sur la Mode Wax, Boubous Kita & Sacs Raphia",
    offerSubEe: "Le Wax, Kita kple Raphia Kotokuwo Dzi",
    descFr: "Portez l'élégance du terroir. Nos artisans locaux confectionnent avec passion des tenues sur-mesure et accessoires authentiques.",
    descEe: "Do awu kple dada kple fafɛ. Míaƒe aɖaŋudɔwɔlawo wò awu nyuiwo kple asinudɔwo na wò.",
    buttonTextFr: "Parcourir la Collection",
    buttonTextEe: "Kpɔ Adzɔnuwo Katã",
    categoryTarget: "Made in Togo Premium",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #180500 0%, #361002 50%, #521908 100%)",
    imageUrl: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Mode Wax & Artisanat Togolais",
    overlayLabelFr: "Wax & Kita Prestige",
    overlayLabelEe: "Wax kple Kita",
  },
  {
    id: "slide-2-terroir",
    badgeTagFr: "🌾 TERROIR BIO & AGROALIMENTAIRE 🇹🇬",
    badgeTagEe: "🌾 AGLE-NUKU NYUIWO 🇹🇬",
    badgeSubFr: "100% Organique",
    badgeSubEe: "100% Gbeme Nuku",
    subtitleFr: "De Kpalimé à la Kara :",
    subtitleEe: "Tso Kpalimé yi Kara :",
    titleFr: "Saveurs Authentiques & Miel Sauvage",
    titleEe: "Anyitsi kple Agble-Nuku Nyuiwo",
    offerMainFr: "MIEL PUR, CAFÉ ROBUSTA & CAJOU",
    offerMainEe: "ANYITSI, CAFÉ ROBUSTA & CAJOU",
    offerSubFr: "Directement récoltés par nos coopératives paysannes 🍯",
    offerSubEe: "Tso míaƒe agbledelawo ƒe fiase me 🍯",
    descFr: "Soutenez nos agriculteurs des Plateaux et de la Kara. Des produits purs, sans additifs, récoltés dans le respect des traditions.",
    descEe: "Ɖo adzɔnu nyuitɔ tso Togo. Míaƒe asitsakaka na asixɔme sɔsɔe agbledelawo tso Plateau kple Kara.",
    buttonTextFr: "Découvrir les Produits Bio",
    buttonTextEe: "Kpɔ Anyigba ƒe Nukuwo",
    categoryTarget: "Épicerie & Fruits Séchés",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #052312 0%, #0c3e1e 50%, #1a2e0a 100%)",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Miel Sauvage & Terroir du Togo",
    overlayLabelFr: "Miel Sauvage de Kpalimé",
    overlayLabelEe: "Kpalimé Anyitsi",
  },
  {
    id: "slide-3-beaute",
    badgeTagFr: "BEAUTÉ & BIEN-ÊTRE NATUREL 🌿",
    badgeTagEe: "ATSYƆ̃ & LÃMESƐ̃ 🌿",
    badgeSubFr: "100% Naturel",
    badgeSubEe: "100% Dzɔdzɔme",
    subtitleFr: "Secret de beauté africain :",
    subtitleEe: "Afrika ƒe atsyɔ̃beŋu :",
    titleFr: "Beurre de Karité & Huile de Baobab Pure",
    titleEe: "Kari-Bébé kple Baobab Ami Nyui",
    offerMainFr: "OFFRE SPÉCIALE DÉCOUVERTE : -30%",
    offerMainEe: "OFFRE DƐDƐ: -30%",
    offerSubFr: "Savons Noirs, Laits de Karité & Élixirs Visage",
    offerSubEe: "Kari-Bébé Adzalɛ kple Ami Nyuiwo",
    descFr: "Formules ancestrales préparées à la main par les coopératives féminines du Nord Togo pour hydrater, nourrir et protéger votre peau.",
    descEe: "Adzalɛ kple ami nyuiwo si nyɔnuwo wɔ kple asi le Togo dziehe.",
    buttonTextFr: "Voir les Soins Bio",
    buttonTextEe: "Kpɔ Atsyõ-Nuwo",
    categoryTarget: "Beauté & Santé Bio",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #241402 0%, #472905 50%, #1a0e01 100%)",
    imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Beurre de Karité & Soins Bio Togo",
    overlayLabelFr: "Cosmétiques Bio du Togo",
    overlayLabelEe: "Togo Atsyõ-Nuwo",
  },
  {
    id: "slide-4-institutionnel",
    badgeTagFr: "EXCELLENCE & IMPACT LOCAL 🇹🇬",
    badgeTagEe: "TOGO DƆWƆNYUI 🇹🇬",
    badgeSubFr: "Livraison Express",
    badgeSubEe: "Lomē Kpao-Kpao",
    subtitleFr: "Plateforme N°1 du Consommer Local :",
    subtitleEe: "Fiase N°1 le Togo :",
    titleFr: "Achetez Togolais, Soutenez Nos Producteurs !",
    titleEe: "Miɖu Anyigbadzinu Togo Katã!",
    offerMainFr: "PAIEMENT SÉCURISÉ & LIVRAISON 24H-48H",
    offerMainEe: "FEFE DEDIE & LOMÉ DELIVERY",
    offerSubFr: "Payez facilement via T-Money, Flooz ou Carte 💳",
    offerSubEe: "T-Money, Flooz kple Card 💳",
    descFr: "Chaque achat sur Miabé Asi reverse directement les revenus aux coopératives et artisans pour faire grandir l'économie togolaise.",
    descEe: "Nudɔdɔ ɖesiaɖe kpena ɖe míaƒe asitsalawo kple agbledelawo ŋu le Togo.",
    buttonTextFr: "Découvrir la Boutique Officielle",
    buttonTextEe: "Kpɔ Miabé Asi Fiase Katã",
    categoryTarget: "Tous",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #02200e 0%, #0a4020 50%, #291e02 100%)",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Boutique Officielle Miabé Asi",
    overlayLabelFr: "Boutique Officielle Miabé Asi 🇹🇬",
    overlayLabelEe: "Miabé Asi Fiase",
  }
];

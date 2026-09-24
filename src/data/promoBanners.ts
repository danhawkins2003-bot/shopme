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
    badgeTagFr: "PANAFRICAIN — 7 PAYS PARTENAIRES 🌍",
    badgeTagEe: "AFRIKA KATÃ 🌍",
    badgeSubFr: "Mode & Créations Africaines",
    badgeSubEe: "Aɖaŋudɔ & Avɔwo",
    subtitleFr: "Vendeurs & Stylistes Africains :",
    subtitleEe: "Afrika Awutɔla Nyuitɔwo :",
    titleFr: "Grande Vitrine des Produits & Créateurs Africains",
    titleEe: "Afrika Adzɔnuwo ƒe Fiase Gã",
    offerMainFr: "JUSQU'À -40% DE REMISE",
    offerMainEe: "ASIƉEƉE YI EDZI -40%",
    offerSubFr: "Sur la Mode Wax, Boubous Kita, Bogolan & Sacs Raphia",
    offerSubEe: "Le Wax, Kita, Bogolan kple Raphia Kotokuwo Dzi",
    descFr: "Portez l'élégance du continent. Nos vendeurs africains et créateurs confectionnent avec passion des tenues sur-mesure et accessoires authentiques.",
    descEe: "Do awu kple dada kple fafɛ. Míaƒe asitsalawo kple awutɔlawo na wò.",
    buttonTextFr: "Parcourir la Collection",
    buttonTextEe: "Kpɔ Adzɔnuwo Katã",
    categoryTarget: "Tous",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #180500 0%, #361002 50%, #521908 100%)",
    imageUrl: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Mode & Créations Panafricaines",
    overlayLabelFr: "Wax, Bogolan & Kita Prestige",
    overlayLabelEe: "Wax kple Bogolan",
  },
  {
    id: "slide-2-terroir",
    badgeTagFr: "🌾 TERROIRS & AGROALIMENTAIRE D'AFRIQUE 🌍",
    badgeTagEe: "🌾 AGLE-NUKU NYUIWO 🌍",
    badgeSubFr: "100% Organique",
    badgeSubEe: "100% Gbeme Nuku",
    subtitleFr: "Togo, Bénin, Côte d'Ivoire, Sénégal, Mali, Burkina, Cameroun :",
    subtitleEe: "Afrika Terroir :",
    titleFr: "Saveurs Authentiques & Terroirs Africains",
    titleEe: "Anyitsi kple Agble-Nuku Nyuiwo",
    offerMainFr: "MIEL PUR, CAFÉ, CACAO & CAJOU",
    offerMainEe: "ANYITSI, CAFÉ & CAJOU",
    offerSubFr: "Directement récoltés par nos coopératives et vendeurs partenaires 🍯",
    offerSubEe: "Tso míaƒe agbledelawo ƒe fiase me 🍯",
    descFr: "Soutenez nos producteurs et vendeurs à travers nos 7 pays partenaires. Des produits purs, sans additifs, récoltés dans le respect des traditions.",
    descEe: "Ɖo adzɔnu nyuitɔ tso Afrika. Míaƒe asitsakaka na asixɔme sɔsɔe agbledelawo.",
    buttonTextFr: "Découvrir les Produits Bio",
    buttonTextEe: "Kpɔ Anyigba ƒe Nukuwo",
    categoryTarget: "Épicerie & Fruits Séchés",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #052312 0%, #0c3e1e 50%, #1a2e0a 100%)",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Saveurs & Terroirs d'Afrique",
    overlayLabelFr: "Miel Sauvage & Épices Africaines",
    overlayLabelEe: "Afrika Anyitsi",
  },
  {
    id: "slide-3-beaute",
    badgeTagFr: "BEAUTÉ & BIEN-ÊTRE NATUREL 🌿",
    badgeTagEe: "ATSYƆ̃ & LÃMESƐ̃ 🌿",
    badgeSubFr: "100% Naturel",
    badgeSubEe: "100% Dzɔdzɔme",
    subtitleFr: "Secrets de beauté d'Afrique de l'Ouest et Centrale :",
    subtitleEe: "Afrika ƒe atsyɔ̃beŋu :",
    titleFr: "Beurre de Karité, Baobab & Cosmétiques Naturels",
    titleEe: "Kari-Bébé kple Baobab Ami Nyui",
    offerMainFr: "OFFRE SPÉCIALE DÉCOUVERTE : -30%",
    offerMainEe: "OFFRE DƐDƐ: -30%",
    offerSubFr: "Savons Noirs, Laits de Karité & Élixirs Visage",
    offerSubEe: "Kari-Bébé Adzalɛ kple Ami Nyuiwo",
    descFr: "Formules ancestrales préparées par les coopératives féminines et vendeurs africains pour hydrater, nourrir et protéger votre peau.",
    descEe: "Adzalɛ kple ami nyuiwo si nyɔnuwo wɔ le Afrika.",
    buttonTextFr: "Voir les Soins Bio",
    buttonTextEe: "Kpɔ Atsyõ-Nuwo",
    categoryTarget: "Beauté & Santé Bio",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #241402 0%, #472905 50%, #1a0e01 100%)",
    imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Beurre de Karité & Soins Naturels Africains",
    overlayLabelFr: "Cosmétiques Naturels d'Afrique",
    overlayLabelEe: "Afrika Atsyõ-Nuwo",
  },
  {
    id: "slide-4-institutionnel",
    badgeTagFr: "EXCELLENCE & IMPACT PANAFRICAIN 🌍",
    badgeTagEe: "AFRIKA DƆWƆNYUI 🌍",
    badgeSubFr: "Livraison Internationale & Locale",
    badgeSubEe: "Delivery Dedie",
    subtitleFr: "Plateforme N°1 du Consommer Local Africain :",
    subtitleEe: "Fiase N°1 le Afrika :",
    titleFr: "Achetez Africain, Soutenez Nos Vendeurs & Producteurs !",
    titleEe: "Miɖu Anyigbadzinu Afrika Katã!",
    offerMainFr: "PAIEMENT SÉCURISÉ PAYDUNYA & LIVRAISON MULTI-PAYS",
    offerMainEe: "PAYDUNYA & MULTI-COUNTRY DELIVERY",
    offerSubFr: "Togo, Bénin, Burkina Faso, Côte d'Ivoire, Mali, Sénégal, Cameroun 💳",
    offerSubEe: "Togo, Benin, BF, CI, Mali, Senegal, Cameroun 💳",
    descFr: "Chaque achat sur Miabé Asi reverse 90% directement aux vendeurs africains pour faire prospérer l'économie locale de nos 7 pays.",
    descEe: "Nudɔdɔ ɖesiaɖe kpena ɖe míaƒe asitsalawo ŋu le Afrika katã.",
    buttonTextFr: "Découvrir la Boutique Panafricaine",
    buttonTextEe: "Kpɔ Miabé Asi Fiase Katã",
    categoryTarget: "Tous",
    searchQuery: "",
    bgGradient: "linear-gradient(135deg, #02200e 0%, #0a4020 50%, #291e02 100%)",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    imageAlt: "Boutique Panafricaine Miabé Asi",
    overlayLabelFr: "Plateforme Panafricaine Miabé Asi 🌍",
    overlayLabelEe: "Miabé Asi Fiase",
  }
];

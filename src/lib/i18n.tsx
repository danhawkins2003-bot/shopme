import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "ee";

export interface TranslationDictionary {
  [key: string]: {
    fr: string;
    ee: string;
  };
}

export const translations: TranslationDictionary = {
  // Navigation / Header
  nav_home: {
    fr: "Accueil",
    ee: "Aƒeme",
  },
  nav_catalog: {
    fr: "Catalogue",
    ee: "Adzɔnuwo",
  },
  nav_blog: {
    fr: "Blog & Conseils",
    ee: "Nyadzɔdzɔ & Aɖaŋu",
  },
  nav_contact: {
    fr: "Contact",
    ee: "Kadodo",
  },
  search_placeholder: {
    fr: "Rechercher un produit...",
    ee: "Di adzɔnu aɖe...",
  },
  banner_promo: {
    fr: "📦 Boutique Officielle du Consommer Togolais 🇹🇬 | Livraison rapide à Lomé et environs.",
    ee: "📦 Togo-tɔwo ƒe Nudɔƒe Gã 🇹🇬 | Míatsɔ adzɔnuwo vɛ kaba le Lomé kple afimãwo.",
  },
  slogan: {
    fr: "Le local, notre fierté",
    ee: "Míaƒe adzɔnuwo, míaƒe dzidzɔ",
  },
  language_toggle: {
    fr: "Eʋegbe",
    ee: "Français",
  },

  // Home Page / Hero
  hero_title: {
    fr: "Sublimez votre quotidien avec le savoir-faire togolais",
    ee: "Na wò gbesiagbe agbe nanyɔ kple Togo-tɔwo ƒe aɖaŋudɔ",
  },
  hero_subtitle: {
    fr: "Des produits authentiques, écoresponsables et certifiés \"Made in Togo\". Une excellence locale sans concession.",
    ee: "Adzɔnu vavãwo kple mɔ siwo kpɔa agbe ta siwo woxɔ tso Togo dɔwɔƒewo.",
  },
  explore_catalog: {
    fr: "Explorer le Catalogue",
    ee: "Kpɔ Adzɔnuwo Katã",
  },
  register_seller: {
    fr: "Devenir Vendeur",
    ee: "Zu Asitsala",
  },
  featured_products: {
    fr: "Produits Phares Togolais",
    ee: "Togo-tɔwo ƒe Adzɔnu Dzesiwo",
  },
  featured_subtitle: {
    fr: "Une sélection exclusive d'articles artisanaux de haute qualité issus de nos régions.",
    ee: "Adzɔnu dzesi siwo fia míaƒe nutowo me aɖaŋudɔ xɔŋgɔwo.",
  },
  all_categories: {
    fr: "Catégories d'exception",
    ee: "Hame Dzesiwo",
  },
  all_categories_sub: {
    fr: "Explorez la richesse de l'artisanat et des saveurs locales du Togo.",
    ee: "Kpɔ aɖaŋudɔ siwo le Togo la ƒe kesinɔnuwo.",
  },
  blog_latest: {
    fr: "Actualités & Conseils Locaux",
    ee: "Nyadzɔdzɔ & Aɖaŋuɖoɖo Yeyewo",
  },
  blog_latest_sub: {
    fr: "Découvrez les histoires fascinantes derrière nos artisans et nos guides de consommation.",
    ee: "Kpɔ míaƒe aɖaŋudɔwɔlawo ƒe ŋutinya dzesiwo.",
  },
  newsletter_title: {
    fr: "Restez connectés au Consommer Local",
    ee: "Yi edzi nànɔ kadodo me kple Afitɔnuwo",
  },
  newsletter_sub: {
    fr: "Inscrivez-vous pour recevoir les nouveautés, les promotions de saison et l'actualité de nos artisans.",
    ee: "De ŋkɔ wòagbɔ dzesi be nàxɔ nu yeyewo kple asitsalawo ƒe nyadzɔdzɔwo.",
  },
  newsletter_btn: {
    fr: "S'abonner",
    ee: "De ŋkɔ",
  },
  email_placeholder: {
    fr: "Votre adresse email...",
    ee: "Wò email sɔsɔe...",
  },

  // Catalogue Page
  cat_title: {
    fr: "Catalogue d'Excellence",
    ee: "Adzɔnu Dzɛwo ƒe Kpeɖodzi",
  },
  cat_sub: {
    fr: "Découvrez des pièces d'exception fabriquées avec passion et fierté au Togo.",
    ee: "Di adzɔnu tɔxɛ siwo wowɔ kple lɔlɔ̃ kple dzidzɔ le Togo.",
  },
  search_product_placeholder: {
    fr: "Rechercher un produit local... (ex. Miel sauvage, Karité, Hibiscus)",
    ee: "Di afitɔwo ƒe nudɔdɔ... (ex. Anyitsi, Karité, Hibiscus)",
  },
  filter_all: {
    fr: "Toutes",
    ee: "Wo katã",
  },
  sort_by: {
    fr: "Trier par",
    ee: "Tia kaba le",
  },
  sort_default: {
    fr: "Par défaut",
    ee: "Mɔ sɔsɔe",
  },
  sort_price_asc: {
    fr: "Prix : croissant",
    ee: "Asi: Tso tsɛ yi gã",
  },
  sort_price_desc: {
    fr: "Prix : décroissant",
    ee: "Asi: Tso gã yi tsɛ",
  },
  sort_popular: {
    fr: "Popularité",
    ee: "Nudidi gã",
  },
  add_to_cart: {
    fr: "Ajouter au Panier",
    ee: "De Kusi Me",
  },
  buy_now: {
    fr: "Acheter Maintenant",
    ee: "Ƒle Fifia",
  },
  out_of_stock: {
    fr: "Rupture de stock",
    ee: "Nuɖoɖo vɔ",
  },
  featured_tag: {
    fr: "Phare",
    ee: "Dzesi",
  },
  quick_view: {
    fr: "Aperçu rapide",
    ee: "Kpɔe kaba",
  },

  // Detail / Modal
  product_details: {
    fr: "Détails du Produit",
    ee: "Adzɔnu la ƒe Tsɔtsɔmewo",
  },
  category: {
    fr: "Catégorie",
    ee: "Hame",
  },
  stock_avail: {
    fr: "Stock disponible",
    ee: "Adzɔnu siwo kpɔtɔ",
  },
  stock_units: {
    fr: "unité(s)",
    ee: "ɖeka/ɖekae",
  },
  shipping_togo: {
    fr: "Expédié depuis le Togo",
    ee: "Wotso Togo vɛ dedie",
  },
  handmade_certified: {
    fr: "Produit Artisanal Certifié",
    ee: "Aɖaŋudɔ Dzɛ si Woxɔ",
  },
  add_review: {
    fr: "Ajouter un avis",
    ee: "Gblɔ wò nya",
  },
  reviews: {
    fr: "Avis clients",
    ee: "Asitsalawo ƒe Nyawo",
  },
  no_reviews: {
    fr: "Aucun avis pour le moment.",
    ee: "Avis aɖeke meli kpɔ o.",
  },
  write_review: {
    fr: "Rédiger votre avis",
    ee: "Ŋlɔ wò nya tso adzɔnu la ŋu",
  },
  placeholder_review_text: {
    fr: "Que pensez-vous de ce produit ?",
    ee: "Nuka nèsusu le adzɔnu sia ŋu?",
  },
  rating: {
    fr: "Note",
    ee: "Dzesi",
  },
  btn_submit: {
    fr: "Valider",
    ee: "Lɔ̃ ɖe edzi",
  },

  // Cart Drawer & Checkout
  cart_title: {
    fr: "Votre Panier d'Achat",
    ee: "Wò Asitsukusi",
  },
  cart_empty: {
    fr: "Votre panier est vide.",
    ee: "Wò kusi le ƒuƒlu.",
  },
  cart_start_shopping: {
    fr: "Commencer vos achats",
    ee: "Dze nudɔdɔ gɔme",
  },
  cart_total: {
    fr: "Sous-total",
    ee: "Asi katã hatsotso",
  },
  cart_checkout: {
    fr: "Finaliser la Commande",
    ee: "Wu Kudodo Nu",
  },
  delivery_info: {
    fr: "Coordonnées de Livraison",
    ee: "Afisi Woade Nua Le",
  },
  fullname: {
    fr: "Nom complet",
    ee: "Ŋkɔ blibo",
  },
  phone_number: {
    fr: "Numéro de téléphone",
    ee: "Kaƒomɔ dzesi",
  },
  delivery_district: {
    fr: "Quartier (Lomé) *",
    ee: "Kɔƒe / Nutome (Lomé) *",
  },
  preferred_payment: {
    fr: "Mode de Paiement Préféré",
    ee: "Fetututu Mɔ si nàlɔ̃",
  },
  payment_cod: {
    fr: "Espèces à la livraison (COD)",
    ee: "Espèces le asideɖe me (COD)",
  },
  payment_online: {
    fr: "Paiement Sécurisé Mobile Money & Cartes",
    ee: "Mobile Money & Kaɖa Fetututu",
  },
  place_order: {
    fr: "Confirmer et Payer",
    ee: "Wu Fetututu kple Nudɔdɔ Nu",
  },
  coupon_code: {
    fr: "Code de réduction",
    ee: "Asiɖeɖe dzesi",
  },
  apply_coupon: {
    fr: "Appliquer",
    ee: "De asixɔme",
  },
  coupon_success: {
    fr: "Coupon appliqué avec succès !",
    ee: "Wode asiɖeɖe dzesi la dedie !",
  },

  // Blog Page
  blog_title: {
    fr: "Blog, Conseils & Artisans",
    ee: "Nyadzɔdzɔwo, Aɖaŋu & Aɖaŋudɔwɔlawo",
  },
  blog_sub: {
    fr: "L'actualité du consommer local au Togo, portraits d'artisans d'exception et recettes traditionnelles.",
    ee: "Nyadzɔdzɔwo tso afitɔnuwo ŋu le Togo kple aɖaŋudɔwɔlawo ƒe ŋutinyawo.",
  },
  read_more: {
    fr: "Lire la suite",
    ee: "Hlẽ kpee",
  },
  blog_sponsored: {
    fr: "Sponsorisé",
    ee: "Kpekpeɖeŋu tso dɔwɔƒe",
  },

  // Contact Page
  contact_title: {
    fr: "Contactez-Nous",
    ee: "Kadodo kple Mí",
  },
  contact_sub: {
    fr: "Notre équipe est entièrement à votre écoute pour toute question, réclamation ou partenariat local.",
    ee: "Mía dɔwɔlawo le klalo be wòaɖo biabiawo alo asitsakakawo ŋu.",
  },
  contact_name: {
    fr: "Votre nom",
    ee: "Wò ŋkɔ",
  },
  contact_email: {
    fr: "Votre adresse email",
    ee: "Wò email sɔsɔe",
  },
  contact_message: {
    fr: "Votre message",
    ee: "Wò nya",
  },
  contact_send: {
    fr: "Envoyer le message",
    ee: "Dɔ nya ɖa",
  },
  contact_success: {
    fr: "Votre message a été envoyé avec succès ! Notre équipe vous répondra très rapidement.",
    ee: "Wodɔ wò nya ɖa dedie! Míaɖo eŋu na wò kaba.",
  },

  // Bottom Bar / Footer
  bottom_home: {
    fr: "Accueil",
    ee: "Aƒe",
  },
  bottom_catalog: {
    fr: "Catalogue",
    ee: "Adzɔnuwo",
  },
  bottom_blog: {
    fr: "Blog",
    ee: "Nyadzɔwo",
  },
  bottom_contact: {
    fr: "Contact",
    ee: "Kadodo",
  },
  bottom_cart: {
    fr: "Panier",
    ee: "Kusi",
  },
  footer_rights: {
    fr: "Tous droits réservés.",
    ee: "Míekpɔ agbegbɔkpɔnuwo katã dzi.",
  },
  footer_slogan: {
    fr: "Miabé Asi - Le local, notre fierté. Valoriser nos artisans et producteurs locaux pour bâtir une économie togolaise forte et souveraine.",
    ee: "Miabé Asi - Le local, notre fierté. Kpekpeɖeŋu nana míaƒe aɖaŋudɔwɔlawo kple afitɔwo be Togo ƒe ganyawo gasẽ ɖe edzi.",
  },

  // Toasts / Notifications
  added_to_cart_toast: {
    fr: "✓ Produit ajouté au panier !",
    ee: "✓ Wode adzɔnu la kusi me!",
  },
  order_success: {
    fr: "✓ Commande passée avec succès ! Merci de votre confiance.",
    ee: "✓ Wodɔ adzɔnu la dedie! Akpe na wò kple kakaɖedzi.",
  },
  not_found: {
    fr: "Produit non trouvé",
    ee: "Womedi adzɔnu la o",
  },
  loading: {
    fr: "Chargement en cours...",
    ee: "Ele dzo le edzi...",
  },
  error: {
    fr: "Une erreur est survenue",
    ee: "Nuvɔ̃ aɖe dzo",
  },
  success: {
    fr: "Succès",
    ee: "Dzo nyuie",
  },
  btn_close: {
    fr: "Fermer",
    ee: "Tu eŋu",
  },
  back_to_shop: {
    fr: "Retour à la boutique",
    ee: "Trɔ yi asime",
  },
  mon_espace: {
    fr: "Mon Espace",
    ee: "Nye dɔwɔƒe",
  },
  login_btn: {
    fr: "Se Connecter",
    ee: "Ge ɖe eme",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("asime_app_lang");
    return (saved === "ee" || saved === "fr") ? (saved as Language) : "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("asime_app_lang", lang);
  };

  const t = (key: string, fallback?: string): string => {
    const item = translations[key];
    if (item) {
      return item[language] || item["fr"];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

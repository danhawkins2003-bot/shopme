export interface ShowcaseCard {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  category: string;
  searchQuery: string;
  tag?: string;
  collection?: string;
  titleEe?: string;
  subtitleEe?: string;
  collectionEe?: string;
  tagEe?: string;
}

export interface HomepageShowcaseData {
  heroCards: ShowcaseCard[];
  galleryCards: ShowcaseCard[];
}

export const DEFAULT_HERO_CARDS: ShowcaseCard[] = [
  {
    id: "miel_dore",
    title: "Notre Miel Doré",
    subtitle: "100% sauvage, récolté à Kpalimé du plateau forestier.",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
    category: "Made in Togo Premium",
    searchQuery: "Miel"
  },
  {
    id: "soin_karite",
    title: "Soin au Karité",
    subtitle: "Pressé par notre coopérative de femmes solidaires.",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600",
    category: "Made in Togo Premium",
    searchQuery: "Karité"
  },
  {
    id: "paniers_kovie",
    title: "Paniers de Kovié",
    subtitle: "Cueillette du matin, fraîcheur livrée sous 24h à Lomé.",
    imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600",
    category: "Paniers Frais & Épicerie",
    searchQuery: ""
  },
  {
    id: "hibiscus_epices",
    title: "Hibiscus & Épices",
    subtitle: "Pour vos infusions et bienfaits naturels au quotidien.",
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=600",
    category: "Made in Togo Premium",
    searchQuery: "Thé"
  }
];

export const DEFAULT_GALLERY_CARDS: ShowcaseCard[] = [
  {
    id: "ceramiques_mandouri",
    title: "Céramiques de Mandouri",
    collection: "Terre Cuite & Argile",
    tag: "Argile Sacrée",
    subtitle: "Des œuvres façonnées en argile brute issues de gisements sacrés de l'extrême Nord du Togo.",
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800",
    category: "Made in Togo Premium",
    searchQuery: "Argile"
  },
  {
    id: "tissage_aneho",
    title: "Tissage d'Aného",
    collection: "Raphia & Fibres Organiques",
    tag: "100% Organique",
    subtitle: "Tressage méticuleux des fibres végétales pour concevoir des sacs et paniers de prestige.",
    imageUrl: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=800",
    category: "Made in Togo Premium",
    searchQuery: "Raphia"
  },
  {
    id: "miels_kpalime",
    title: "Miels de Kpalimé",
    collection: "Nectar Sauvage & Café",
    tag: "Nectar d'Altitude",
    subtitle: "Récoltes biologiques au cœur des forêts denses du plateau du Togo.",
    imageUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800",
    category: "Made in Togo Premium",
    searchQuery: "Miel"
  },
  {
    id: "soin_solidaire",
    title: "Soin Solidaire",
    collection: "Karité de Tandjouaré",
    tag: "100% Brut",
    subtitle: "L'excellence des huiles pressées à l'état pur par notre collective de femmes solidaires.",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
    category: "Made in Togo Premium",
    searchQuery: "Karité"
  }
];

export type SellerPlan = "Gratuit" | "PRO" | "BUSINESS";

export type SellerType = "particulier" | "professionnel";

export type ProductCondition = "neuf" | "tres_bon_etat" | "bon_etat" | "reconditionne" | "occasion";

export type SupportedCountryCode = "TG" | "BJ" | "BF" | "CI" | "ML" | "SN" | "CM";
export type SupportedCurrencyCode = "XOF" | "XAF";

export interface Country {
  code: SupportedCountryCode | string; // ISO 2 Alpha code: "TG", "BJ", "BF", "CI", "ML", "SN", "CM"
  name: string;
  nativeName?: string;
  phoneCode: string; // e.g. "+228", "+229", "+226", "+225", "+223", "+221", "+237"
  currencyCode: SupportedCurrencyCode | string; // "XOF" | "XAF"
  flagEmoji?: string;
  isActive: boolean;
  majorCities?: string[];
}

export interface Currency {
  code: SupportedCurrencyCode | string; // "XOF" | "XAF"
  name: string;
  symbol: string; // "FCFA"
  exchangeRateToXof: number; // Pivot rate vs base XOF (1.0 pour XOF et XAF)
  decimalDigits: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  isActive: boolean;
  displayOrder?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: "client" | "vendeur" | "livreur" | "admin" | "affilie";
  sellerType?: SellerType;
  countryCode?: string;
  city?: string;
  addressLine?: string;
  quartier?: string;
  isVerified?: boolean;
  nationalIdNumber?: string; // CNI / Passeport pour particulier ou dirigeant
  taxNumber?: string; // NIF pour professionnels
  businessRegistrationNumber?: string; // RCCM pour professionnels
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number;          // Current price in local/base currency
  prixBarre: number | null; // Slashed original price
  images: string[];      // Up to 4 images (as URLs or Base64)
  categorie: string;     // e.g. Accessoires, Bijoux, Vêtements, Chaussures
  categoryId?: string;   // Foreign key to Category
  phare: boolean;        // featured (approved)
  phareStatus?: "none" | "pending" | "approved" | "rejected";
  pharePriority?: "standard" | "high";
  phareRequestedAt?: string;
  stock: number;
  partenaire?: string;
  lienAffilie?: string;
  vendeurId?: string;
  vendeurSlug?: string;
  shopId?: string;       // Foreign key to Shop
  sellerType?: SellerType; // "particulier" (occasion/vide-grenier) ou "professionnel" (boutique officielle)
  condition?: ProductCondition; // "neuf" ou "occasion"
  countryCode?: string;   // ISO 2 code (e.g. "TG", "BJ", "BF", "CI", "ML", "SN", "CM")
  countryOrigin?: string; // Country name or ISO 2 code
  city?: string;          // City (e.g. "Lomé", "Cotonou", "Abidjan", "Douala")
  quartier?: string;      // Neighborhood/Quarter
  currencyCode?: string;  // Currency ISO code (e.g. "XOF", "XAF")
  isCrossBorderEligible?: boolean; // Can be shipped between African countries
  weightKg?: number;      // For freight / shipping rate calculation
  status?: "actif" | "inactif" | "brouillon" | "en_rupture";
  valide?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerRequest {
  id: string;
  vendeurId: string;
  vendeurName: string;
  boutiqueName?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: string;
  startDate?: string;
  endDate?: string;
  rejectionReason?: string;
}

export interface ShopProfile {
  id: string;
  vendeurId: string;
  nom: string;
  slug?: string;
  sellerType?: SellerType; // Particulier ou Professionnel
  description: string;
  bio?: string;
  histoire?: string;
  logo?: string;
  coverImage?: string;
  primaryColor?: string;
  whatsapp?: string;
  phone?: string;
  countryCode?: string; // ISO 2 code (e.g. "TG", "CI", "SN")
  currencyCode?: string; // Currency ISO code (e.g. "XOF")
  city?: string;
  quartier?: string;
  address?: string;
  taxNumber?: string; // NIF pour professionnels
  businessRegistrationNumber?: string; // RCCM pour professionnels
  nationalIdNumber?: string; // CNI pour particuliers
  category?: string;
  plan: SellerPlan;
  isPublicUrlAllowed: boolean;
  isVerified?: boolean;
  noteMoyenne?: number;
  nombreVentes?: number;
  badge?: "pro" | "business" | "verifie" | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AffiliateStats {
  clicks: number;
  visiteurs: number;
  ventes: number;
  chiffreAffaires: number;
  commissionsGagnees: number;
  commissionDisponible: number;
  commissionRetiree: number;
  commissionPending?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId?: string;
  product: {
    id: string;
    nom: string;
    prix: number;
    partenaire?: string;
    images?: string[];
    shopId?: string;
    countryOrigin?: string;
    countryCode?: string;
    city?: string;
    quartier?: string;
    currencyCode?: string;
    vendeurId?: string;
  };
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
  shopId?: string;
  currencyCode?: string;
}

export interface Order {
  id: string;
  userId?: string;
  shopId?: string;
  totalAmount: number;
  currencyCode?: string;
  exchangeRateToXof?: number;
  paymentStatus: "En attente" | "Payé" | "Échoué" | "Remboursé" | string;
  orderStatus: "En attente" | "En préparation" | "En cours de livraison" | "Livré" | "Annulé" | string;
  paymentMethod?: string;
  destinationCountryCode?: string;
  destinationCity?: string;
  clientCountryCode?: string;
  clientCountryName?: string;
  clientCity?: string;
  clientName?: string;
  clientPhone?: string;
  sellerCountryCode?: string;
  sellerCountryName?: string;
  sellerCity?: string;
  sellerName?: string;
  originCountries?: string[];
  shippingDetails?: {
    name?: string;
    phone?: string;
    countryCode?: string;
    city?: string;
    currencyCode?: string;
    phoneWithCountryCode?: string;
    quartier?: string;
    address?: string;
    notes?: string;
  };
  shippingFee?: number;
  isCrossBorder?: boolean;
  splitProcessed?: boolean;
  items: OrderItem[];
  createdAt: string | number;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  titre: string;
  contenu: string;
  date: string;
  auteur: string;
  image: string;
  estSponsorise: boolean;
  lienSponsorise?: string;
}

export interface AppNotification {
  id: string;
  orderId?: string;
  oldStatus?: string;
  newStatus?: string;
  title?: string;
  text: string;
  type: "order_status" | "order" | "sale" | "withdrawal" | "system" | "promo";
  read: boolean;
  date: string;
  link?: string;
  clientPhone?: string;
  clientName?: string;
  totalAmount?: number;
}


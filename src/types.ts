export interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number;          // Current price in FCFA
  prixBarre: number | null; // Slashed original price in FCFA
  images: string[];      // Up to 4 images (as URLs or Base64)
  categorie: string;     // e.g. Accessoires, Bijoux, Vêtements, Chaussures
  phare: boolean;        // featured
  stock: number;
  partenaire?: string;
  lienAffilie?: string;
  vendeurId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
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

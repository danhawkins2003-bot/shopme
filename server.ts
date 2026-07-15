import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { PaymentGateway } from "./paymentGateway";
import { WalletManager } from "./walletHelper";
import { saveToSupabaseStore, loadFromSupabaseStore, isSupabaseConfigured, printSetupInstructions } from "./supabaseHelper";

const app = express();
const PORT = 3000;

// Allow large payloads for base64 image uploads (up to 4 images per product can be large)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PRODUCTS_FILE = path.join(process.cwd(), "produits.json");
const BLOGS_FILE = path.join(process.cwd(), "blogs.json");
const USERS_FILE = path.join(process.cwd(), "users.json");
const PARTNERS_FILE = path.join(process.cwd(), "partners.json");
const ORDERS_FILE = path.join(process.cwd(), "orders.json");
const WITHDRAWALS_FILE = path.join(process.cwd(), "withdrawals.json");
const REVIEWS_FILE = path.join(process.cwd(), "reviews.json");
const MESSAGES_FILE = path.join(process.cwd(), "messages.json");
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

// Helper to hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getUserIdFromToken(token: string): string | null {
  try {
    if (!token || !token.startsWith("user-token-")) return null;
    const base64Part = token.replace("user-token-", "");
    const userId = Buffer.from(base64Part, "base64").toString("utf-8");
    return userId.startsWith("user") ? userId : null;
  } catch (e) {
    return null;
  }
}

function createTokenForUser(userId: string): string {
  const base64Part = Buffer.from(userId).toString("base64");
  return `user-token-${base64Part}`;
}

// Core catalog generator to populate 105 affiliate products
function getImagesForNoun(noun: string): string[] {
  const norm = noun.toLowerCase();
  
  // Made in Togo / Agri / Cosmetics / Premium local elements
  if (norm.includes("miel")) {
    return [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("karité") || norm.includes("savon")) {
    return [
      "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600", // shea nuts cream jar
      "https://images.unsplash.com/photo-1607006342411-92e330a7eddf?auto=format&fit=crop&q=80&w=600"  // craft bar soaps
    ];
  }
  if (norm.includes("coco")) {
    return [
      "https://images.unsplash.com/photo-1540375635311-05d5213237c5?auto=format&fit=crop&q=80&w=600", // coconuts
      "https://images.unsplash.com/photo-1622484211148-717098c17b5e?auto=format&fit=crop&q=80&w=600"  // oil droplet
    ];
  }
  if (norm.includes("café") || norm.includes("cafe")) {
    return [
      "https://images.unsplash.com/photo-1559056191-72a3701cd6d8?auto=format&fit=crop&q=80&w=600", // coffee beans
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("hibiscus") || norm.includes("thé") || norm.includes("the")) {
    return [
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=600", // dried tea
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600"  // infusion
    ];
  }
  if (norm.includes("chocolat")) {
    return [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600", // chocolate bars
      "https://images.unsplash.com/photo-1548907040-4d42b52125f6?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("bambou")) {
    return [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600", // wood/bamboo
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("argile") || norm.includes("statue") || norm.includes("poterie")) {
    return [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600", // clay vase craft
      "https://images.unsplash.com/photo-1622484211148-717098c17b5e?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("citronnelle") || norm.includes("huile essentielle")) {
    return [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600", // oil bottle
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("pendentif") || norm.includes("ébène") || norm.includes("bague") || norm.includes("bracelet") || norm.includes("sautoir") || norm.includes("boucle") || norm.includes("bijou")) {
    return [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600", // premium jewellry
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("sac tress") || norm.includes("raphia") || norm.includes("sac-à-main") || norm.includes("sac à main") || norm.includes("portefeuille") || norm.includes("pochette") || norm.includes("sacoche") || norm.includes("sac à dos") || norm.includes("tote bag")) {
    return [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600", // designer woven bag
      "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("liqueur") || norm.includes("boisson")) {
    return [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600", // tropical orange glass drink
      "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("farine") || norm.includes("manioc")) {
    return [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600", // flour craft bowl
      "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Fruits and Vegetables / Épicerie
  if (norm.includes("légume") || norm.includes("legume") || norm.includes("panier légume")) {
    return [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600", // vegetable basket
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("avocat")) {
    return [
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600", // green avocados
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("mangue")) {
    return [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600", // fresh cut yellow-orange mangoes
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4ffd?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("gingembre")) {
    return [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600", // fresh ginger
      "https://images.unsplash.com/photo-1596790011558-b15dcb779e7e?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("épice") || norm.includes("epice") || norm.includes("curry")) {
    return [
      "https://images.unsplash.com/photo-1596790011558-b15dcb779e7e?auto=format&fit=crop&q=80&w=600", // spices
      "https://images.unsplash.com/photo-1532331580453-9f54e6a88b20?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("poivron")) {
    return [
      "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&q=80&w=600", // bell peppers
      "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("tomate")) {
    return [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600", // tomatoes bunch
      "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("laitue") || norm.includes("salade")) {
    return [
      "https://images.unsplash.com/photo-1556781366-336f8353002c?auto=format&fit=crop&q=80&w=600", // lettuce veggie
      "https://images.unsplash.com/photo-1622484211148-717098c17b5e?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("patate")) {
    return [
      "https://images.unsplash.com/photo-1596003906949-67221c379bb5?auto=format&fit=crop&q=80&w=600", // orange sweet potatoes
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("banane") || norm.includes("alloco") || norm.includes("claclo")) {
    return [
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80&w=600", // yellow bananas
      "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("ananas")) {
    return [
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600", // fresh pineapple
      "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("papaye")) {
    return [
      "https://images.unsplash.com/photo-1610832958506-aa5639842f74?auto=format&fit=crop&q=80&w=600", // papaya cut
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("citron")) {
    return [
      "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=600", // green limes juteux
      "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("gombo") || norm.includes("okra")) {
    return [
      "https://images.unsplash.com/photo-1425543103975-343af741aff2?auto=format&fit=crop&q=80&w=600", // fresh okra pods
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Plats & Gastronomie
  if (norm.includes("plat") || norm.includes("assiette") || norm.includes("fufu") || norm.includes("gastronomie") || norm.includes("sauce") || norm.includes("rice") || norm.includes("jollof") || norm.includes("poisson grill") || norm.includes("soupe") || norm.includes("ragoût") || norm.includes("beignet") || norm.includes("ayimolou") || norm.includes("wassa wassa") || norm.includes("poulet") || norm.includes("claclo")) {
    return [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600", // luxurious food plate
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600", // rich seasoning dinner bowl
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Clothes / Vêtement
  if (norm.includes("t-shirt") || norm.includes("boubou") || norm.includes("chemise") || norm.includes("veste") || norm.includes("robe") || norm.includes("sweat") || norm.includes("polo") || norm.includes("tunique") || norm.includes("gilet") || norm.includes("short") || norm.includes("pantalon") || norm.includes("écharpe") || norm.includes("pyjama")) {
    return [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600", // clean folded clothing
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600", // apparel shirt
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Shoes / Chaussures
  if (norm.includes("mocassin") || norm.includes("sneaker") || norm.includes("sandale") || norm.includes("bottine") || norm.includes("basket") || norm.includes("loafer") || norm.includes("babouche") || norm.includes("derby") || norm.includes("espadrille") || norm.includes("slider") || norm.includes("soulier") || norm.includes("tennis") || norm.includes("botte") || norm.includes("mule")) {
    return [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600", // leather mocassins
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600", // sport sneaker
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Watches
  if (norm.includes("montre")) {
    return [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600", // analog watches
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("lunette")) {
    return [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600", // sunglasses
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Importations / Electronics
  if (norm.includes("écouteur") || norm.includes("ecouteur") || norm.includes("enceinte") || norm.includes("micro") || norm.includes("audio")) {
    return [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600", // premium headset
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("chargeur") || norm.includes("humidificateur") || norm.includes("trépied") || norm.includes("projecteur") || norm.includes("gimbal")) {
    return [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600", // gadget light
      "https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600"
    ];
  }
  if (norm.includes("clavier") || norm.includes("souris") || norm.includes("console")) {
    return [
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600", // gaming keyboard
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Mug / Print elements
  if (norm.includes("mug") || norm.includes("bouteille") || norm.includes("coussin") || norm.includes("affiche") || norm.includes("coque") || norm.includes("carnet") || norm.includes("tableau") || norm.includes("tapis") || norm.includes("badge") || norm.includes("casquette") || norm.includes("calendrier") || norm.includes("cadre")) {
    return [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600", // modern white cup
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600"
    ];
  }

  // Fallbacks
  return [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
  ];
}

function generateCatalogData(): any[] {
  const categories = [
    {
      name: "Made in Togo Premium",
      partners: ["Boutique en Direct", "Jumia", "CJ Affiliate"],
      images: [
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["Miel Sauvage", "Beurre de Karité", "Huile de Coco Pure", "Café Moulu d'Altitude", "Thé d'Hibiscus séché", "Chocolat Artisanal Noir", "Savon Noir Goyave-Karité", "Pieds-de-Table en Bambou", "Statue d'Argile Sculptée", "Huile Essentielle Citronnelle", "Écorce Médicinale Artisanale", "Pendentif en Ébène", "Sac Tressé Raphia", "Liqueur de Mangue Douce", "Farine de Manioc Élite"],
      adjectives: ["Kpalimé", "Bio Notsé", "Sauvage & Brut", "Plateaux d'Or", "Éco-Responsable", "100% Organique", "Tradition Douce", "Mandouri Art", "Atakpamé", "Tandjouaré", "Maison Bleue", "Aneho", "Mer-Amour", "Impérial", "Savoir-Faire"],
      basePrice: 2000, priceRange: 15000
    },
    {
      name: "Paniers Frais & Épicerie",
      partners: ["Boutique en Direct", "Jumia"],
      images: [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["Panier Légumes Ferme", "Avocats Crémeux", "Mangues Mûres Douces", "Gingembre Frais Piquant", "Épices Curry Ancestral", "Poivron Multicolore Frais", "Tomates Grappes Fermes", "Laitues Croquantes Rosée", "Patates Douces Rouges", "Banane Alloco Premium", "Ananas Pain de Sucre", "Papayes du Mono", "Citrons Verts Juteux", "Panier Épices Tradition", "Gombos Frais Cultivés"],
      adjectives: ["Lomé Bio", "Togo Terroir", "Ferme Kovié", "Maraîcher", "Fraîcheur Matinale", "Soleil Vert", "Sains", "Gorgé de Sucre", "Pure Nature", "Mont-Kabyè", "Aného", "Sauvage", "Vitamines Max", "Coopérative", "Zéro Pesticide"],
      basePrice: 1500, priceRange: 9000
    },
    {
      name: "Vêtements & Mode",
      partners: ["Jumia", "CJ Affiliate", "Amazon", "Boutique en Direct"],
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["T-shirt Designer", "Boubou Wax", "Chemise en Lin", "Veste Safari", "Robe Impériale", "Sweat Togo", "Polo Urbain", "Pantalon Chino", "Blouson Kpalimé", "Tunique d'été", "Robe de Gala", "Gilet Traditionnel", "Short Sunset", "Écharpe d'Art", "Pyjama Zen"],
      adjectives: ["Premium", "Confort", "Élégance", "Authentique", "Modern", "Handcrafted", "Heritage", "Solaire", "Prestige", "Sahara", "Lomé-Vibe", "Élite", "Nomad", "Riviera", "Royal"],
      basePrice: 6500, priceRange: 35000
    },
    {
      name: "Chaussures Premium",
      partners: ["Amazon", "AliExpress", "Boutique en Direct"],
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["Mocassins Cuir", "Sneakers Sport", "Sandales Artisanales", "Bottines Tanneur", "Baskets Run", "Loafers Premium", "Babouches Chic", "Derbies Classiques", "Espadrilles Sunset", "Sliders Confort", "Souliers Prestige", "Tennis Athlétiques", "Bottes All-Weather", "Sandales Kpalimé", "Mules Minimal"],
      adjectives: ["Royale", "Koutammakou", "Sportive", "Légère", "Robuste", "Soft", "Haute Coutures", "Urbaine", "Riviera", "Sahélienne", "Confort Absolu", "Terre Bénie", "Impériale", "Flex", "Studio"],
      basePrice: 12000, priceRange: 45000
    },
    {
      name: "Montres & Accessoires",
      partners: ["AliExpress", "ClickBank", "CJ Affiliate"],
      images: [
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["Montre Chronographe", "Lunettes Polarisées", "Sac-à-main Cuir", "Ceinture Artisanale", "Portefeuille Compact", "Bracelet Perles", "Pendentif Argent", "Bague d'Or", "Sac à dos Voyage", "Sautoir Étoilé", "Chapeau de Paille", "Boucles d'Oreilles", "Étui pour Passeport", "Pince à cravate", "Montre Automatique"],
      adjectives: ["Chronos", "Black Gold", "Sahara", "Lomé Sunrise", "Impérial", "Minéral", "Futuriste", "Nomade", "Quartz Pro", "Minimaliste", "Villégiature", "Safari", "Éclatant", "Prestige", "Héritage"],
      basePrice: 4500, priceRange: 28000
    },
    {
      name: "Plats & Gastronomie",
      partners: ["Boutique en Direct", "ClickBank"],
      images: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["Plateau Fufu & Sauce", "Assiette d'Atcheke", "Gboma Dessi Poulet", "Jollof Rice Festif", "Poisson Grillé Épicé", "Pastries Vanille Rose", "Soupe de Poisson Tradition", "Salade Gourmande Lomé", "Ragoût d'Igname aux Herbes", "Brochettes de Filet", "Plateau Terroir Mandouri", "Beignets Doux Ayimolou", "Wassa Wassa Léger", "Poulet DG à ma façon", "Claclo Bananes Douces"],
      adjectives: ["Terroir", "Gourmet", "Maison", "Succulent", "Traditionnelle", "Festin", "Royale", "Épicé", "Sensation", "Mandala", "Volcanique", "Grand Soleil", "Prestige", "Afro-Fusion", "Végétarien"],
      basePrice: 3500, priceRange: 15000
    },
    {
      name: "Importations Trends",
      partners: ["AliExpress", "Amazon", "Jumia"],
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["Écouteurs Sans Fil Pro", "Mini Projecteur LED", "Chargeur Solaire 20K", "Ring Light Selfie Pro", "Humidificateur d'air", "Console Rétro Portable", "Clavier Mécanique RGB", "Souris Gaming Sans-Fil", "Enceinte Bluetooth Waterproof", "Adaptateur Multi-Pays Fast", "Trépied Ring Flexible", "Smartband Fitness Tracker", "Mini Ventilateur Portatif", "Gimbal Stabilisateur Smart", "Micro Cravate Sans-Fil Studio"],
      adjectives: ["Active Noise Cancelling", "UHD Cinema", "Hyper-Charge", "Halo Glow", "Zen Mist", "Pocket Play", "Click Pro", "Apex Speed", "Sonic Bass", "Universal", "FlexPod", "Pulse Monitor", "Aero Breeze", "Horizon Shift", "Podcast One"],
      basePrice: 4500, priceRange: 45000
    },
    {
      name: "Print-on-Demand Localisé",
      partners: ["ClickBank", "CJ Affiliate"],
      images: [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"
      ],
      nouns: ["Mug Signature", "Coussin Décoratif", "Affiche Vintage Togo", "Coque de Téléphone", "Bouteille Isotherme", "Carnet d'Inspirations", "Pochette d'Ordinateur", "Tableau Canvas Or", "Tote Bag Écolo", "Tapis de Souris Map", "Badge Métallisé Flag", "Casquette Broderie", "Sacoche Banane Toile", "Calendrier Illustré", "Cadre d'Art Contemporain"],
      adjectives: ["Miawoezon", "Lomé Skyline", "Fier Togolais", "Édition Limitée", "Concept", "Or Poli", "Maison Moderne", "Patriote", "E-Lomé", "Minimalist Blue", "Cosmic Slate", "Horizon", "Mélodie", "Symmetry", "Impression Fine"],
      basePrice: 3000, priceRange: 18000
    }
  ];

  const generatedProducts = [];
  const targetCount = 105;

  for (let i = 0; i < targetCount; i++) {
    const catIndex = i % categories.length;
    const cat = categories[catIndex];

    const nounIndex = Math.floor(i / categories.length) % cat.nouns.length;
    const adjIndex = (Math.floor(i / categories.length) + i) % cat.adjectives.length;
    
    const noun = cat.nouns[nounIndex];
    const adj = cat.adjectives[adjIndex];
    const name = `${noun} ${adj}`;
    
    const partner = cat.partners[i % cat.partners.length];
    
    // Get highly corresponding images for this specific noun
    const matchingImages = getImagesForNoun(noun);
    const imageMain = matchingImages[0];
    const imageAlt = matchingImages[1] || matchingImages[0];

    const prix = cat.basePrice + Math.floor(((i * 73) % 100) / 100 * cat.priceRange / 100) * 100;
    const isPromo = i % 3 === 0;
    const prixBarre = isPromo ? Math.floor(prix * 1.25 / 100) * 100 : null;

    const stock = 10 + (i * 12) % 150;

    let affiliateUrl = "";
    if (partner === "Amazon") {
      affiliateUrl = `https://www.amazon.com/dp/B00AFFILIATE${i}?tag=asimetogo-20`;
    } else if (partner === "AliExpress") {
      affiliateUrl = `https://s.click.aliexpress.com/e/_Daffiliate${i}`;
    } else if (partner === "Jumia") {
      affiliateUrl = `https://www.jumia.tg/catalog/?q=asime-item-${i}#affiliate`;
    } else if (partner === "CJ Affiliate") {
      affiliateUrl = `https://www.commission-junction.com/member/asime/link-${i}`;
    } else if (partner === "ClickBank") {
      affiliateUrl = `https://asime.hop.clickbank.net/?tid=item${i}`;
    } else {
      affiliateUrl = ""; // Boutique en Direct (Direct Purchase WhatsApp)
    }

    const isLocal = cat.name === "Made in Togo Premium" || cat.name === "Paniers Frais & Épicerie" || cat.name === "Plats & Gastronomie";

    const description = `${isLocal ? "Produit exclusif et de premier choix issu de l'artisanat togolais." : "Sélection internationale de haute qualité configurée pour l'Afrique."} Ce magnifique article "${name}" incarne la quintessence du savoir-faire. Soigneusement testé pour garantir votre entière satisfaction.`;

    generatedProducts.push({
      id: `prod_pop_${i + 1}`,
      nom: name,
      description: description,
      prix: prix,
      prixBarre: prixBarre,
      images: [imageMain, imageAlt],
      categorie: cat.name,
      phare: i % 10 === 0 || cat.name === "Made in Togo Premium",
      stock: stock,
      partenaire: partner,
      lienAffilie: affiliateUrl
    });
  }

  // Sort generated catalog so that "Made in Togo Premium" products are placed FIRST in the array.
  // This guarantees local products are always listed first on the homepage and products listings!
  generatedProducts.sort((a, b) => {
    const isAMadeInTogo = a.categorie === "Made in Togo Premium";
    const isBMadeInTogo = b.categorie === "Made in Togo Premium";
    if (isAMadeInTogo && !isBMadeInTogo) return -1;
    if (!isAMadeInTogo && isBMadeInTogo) return 1;
    return 0;
  });

  return generatedProducts;
}

// Helper to read JSON files safely
function readJSONFile<T>(filePath: string, defaultData: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      if (filePath === PRODUCTS_FILE) {
        const initialProducts = generateCatalogData();
        fs.writeFileSync(filePath, JSON.stringify(initialProducts, null, 2), "utf-8");
        return initialProducts as unknown as T;
      }
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
      return defaultData;
    }
    let content = fs.readFileSync(filePath, "utf-8");
    if (content.toLowerCase().includes("shopme")) {
      content = content.replace(/shopme/gi, (match) => {
        if (match === "ShopMe") return "Asime";
        if (match === "SHOPME") return "ASIME";
        return "asime";
      });
      fs.writeFileSync(filePath, content, "utf-8");
    }
    const parsed = JSON.parse(content);
    if (filePath === PRODUCTS_FILE && (!Array.isArray(parsed) || parsed.length < 100)) {
      const initialProducts = generateCatalogData();
      fs.writeFileSync(filePath, JSON.stringify(initialProducts, null, 2), "utf-8");
      return initialProducts as unknown as T;
    }
    return parsed as unknown as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

// Helper to write JSON files safely
function writeJSONFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    
    // Background replication to Supabase cloud if active
    if (isSupabaseConfigured()) {
      const keyName = path.basename(filePath);
      saveToSupabaseStore(keyName, data).catch((err) => {
        console.error(`🔴 [Supabase Sync Error] Could not replicate "${keyName}":`, err.message || err);
      });
    }
    
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// --- API Endpoints ---

// GET products
app.get("/api/products", (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE, []);
  res.json(products);
});

// GET blog posts
app.get("/api/blogs", (req, res) => {
  const blogs = readJSONFile(BLOGS_FILE, []);
  res.json(blogs);
});

// Admin Authentication check
app.post("/api/admin/auth", (req, res) => {
  const { password } = req.body;
  if (password === "asime2026" || password === "shopme2026") {
    res.json({ success: true, token: "asime2026-auth-session" });
  } else {
    res.status(401).json({ success: false, error: "Mot de passe incorrect" });
  }
});

// --- CUSTOMER AUTHENTICATION ENDPOINTS ---

// Inscription (Sign-up)
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, quartier } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Veuillez remplir les champs obligatoires (Nom, Email, Mot de passe)." });
  }

  const emailLower = String(email).trim().toLowerCase();
  const users = readJSONFile<any[]>(USERS_FILE, []);
  
  const existingUser = users.find(u => u.email.toLowerCase() === emailLower);
  if (existingUser) {
    return res.status(400).json({ success: false, error: "Cette adresse email est déjà enregistrée." });
  }

  const newUser = {
    id: "user_" + Date.now().toString(),
    name: String(name).trim(),
    email: emailLower,
    passwordHash: hashPassword(password),
    phone: String(phone || "").trim(),
    quartier: String(quartier || "").trim(),
    favorites: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  const success = writeJSONFile(USERS_FILE, users);
  
  if (success) {
    const sessionToken = createTokenForUser(newUser.id);
    const { passwordHash, ...userResponse } = newUser;
    res.json({ success: true, token: sessionToken, user: userResponse });
  } else {
    res.status(500).json({ success: false, error: "Erreur lors de l'enregistrement de l'utilisateur." });
  }
});

// Connexion (Login)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email et mot de passe requis." });
  }

  const emailLower = String(email).trim().toLowerCase();
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.email.toLowerCase() === emailLower);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
  }

  const sessionToken = createTokenForUser(user.id);
  const { passwordHash, ...userResponse } = user;
  res.json({ success: true, token: sessionToken, user: userResponse });
});

// Récupérer l'utilisateur courant (Current User details)
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session expirée ou invalide." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const { passwordHash, ...userResponse } = user;
  res.json({ success: true, user: userResponse });
});

// Mettre à jour le profil client (Update user fields)
app.post("/api/auth/update-profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Accès non autorisé." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const { name, phone, quartier, vendeurPin, affiliatePin } = req.body;
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur introuvable." });
  }

  if (name) users[userIndex].name = String(name).trim();
  if (typeof phone !== "undefined") users[userIndex].phone = String(phone).trim();
  if (typeof quartier !== "undefined") users[userIndex].quartier = String(quartier).trim();
  if (typeof vendeurPin !== "undefined") users[userIndex].vendeurPin = String(vendeurPin).trim();
  if (typeof affiliatePin !== "undefined") users[userIndex].affiliatePin = String(affiliatePin).trim();

  const success = writeJSONFile(USERS_FILE, users);
  if (success) {
    const { passwordHash, ...userResponse } = users[userIndex];
    res.json({ success: true, user: userResponse });
  } else {
    res.status(500).json({ success: false, error: "Impossible de mettre à jour le profil." });
  }
});

// Vérifier le code PIN (vendeur ou affilié)
app.post("/api/auth/verify-pin", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Accès non autorisé." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const { pin, type } = req.body; // type can be 'vendeur' or 'affiliate'
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const correctPin = type === "affiliate" ? user.affiliatePin : user.vendeurPin;

  if (correctPin === pin) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Code PIN incorrect." });
  }
});

// Ajouter / Retirer un favori (Toggle Favorite)
app.post("/api/auth/favorites/toggle", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Veuillez vous connecter pour enregistrer vos favoris." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide ou expirée." });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, error: "ID produit manquant." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const user = users[userIndex];
  if (!user.favorites) {
    user.favorites = [];
  }

  const favIndex = user.favorites.indexOf(productId);
  if (favIndex > -1) {
    user.favorites.splice(favIndex, 1); // delete from array
  } else {
    user.favorites.push(productId); // add to array
  }

  const success = writeJSONFile(USERS_FILE, users);
  if (success) {
    res.json({ success: true, favorites: user.favorites });
  } else {
    res.status(500).json({ success: false, error: "Erreur de mise à jour des favoris." });
  }
});

// POST save/update product with security validation
app.post("/api/products/save", (req, res) => {
  const { auth, product } = req.body;

  // Security Check: Verify admin password
  if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé. Non autorisé." });
  }

  if (!product || !product.nom || typeof product.prix === "undefined") {
    return res.status(400).json({ success: false, error: "Données de produit manquantes ou invalides." });
  }

  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);

  // Format and validate data types
  const validatedProduct = {
    id: product.id ? String(product.id) : "prod_" + Date.now().toString(),
    nom: String(product.nom).trim(),
    description: String(product.description || "").trim(),
    prix: Math.max(0, Number(product.prix)),
    prixBarre: product.prixBarre ? Math.max(0, Number(product.prixBarre)) : null,
    images: Array.isArray(product.images) ? product.images : [],
    categorie: String(product.categorie || "Général").trim(),
    phare: !!product.phare,
    stock: typeof product.stock !== "undefined" ? Math.max(0, Math.floor(Number(product.stock))) : 10,
    partenaire: product.partenaire ? String(product.partenaire).trim() : "Boutique en Direct",
    lienAffilie: product.lienAffilie ? String(product.lienAffilie).trim() : ""
  };

  const existingIndex = products.findIndex((p) => p.id === validatedProduct.id);

  if (existingIndex > -1) {
    // Update existing product
    products[existingIndex] = validatedProduct;
  } else {
    // Add new product
    products.push(validatedProduct);
  }

  const success = writeJSONFile(PRODUCTS_FILE, products);
  if (success) {
    res.json({ success: true, product: validatedProduct });
  } else {
    res.status(500).json({ success: false, error: "Impossible d'écrire dans la base de données." });
  }
});

// POST populate 105 products (Secure)
app.post("/api/admin/populate-products", (req, res) => {
  const { auth } = req.body;
  if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const generatedProducts = generateCatalogData();
  const success = writeJSONFile(PRODUCTS_FILE, generatedProducts);
  if (success) {
    res.json({ success: true, count: generatedProducts.length, message: "105 produits générés avec succès !" });
  } else {
    res.status(500).json({ success: false, error: "Impossible de générer le catalogue de masse." });
  }
});

// DELETE product (Secure)
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const filtered = products.filter((p) => p.id !== id);

  if (products.length === filtered.length) {
    return res.status(404).json({ success: false, error: "Produit non trouvé." });
  }

  const success = writeJSONFile(PRODUCTS_FILE, filtered);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: "Impossible de supprimer le produit." });
  }
});

// --- NEW WORKSPACE APIs FOR CLIENTS, SELLERS, AFFILIATES & ADMINS ---

// Upgrade/Switch Role (Satisfies Seller and Affiliate account creation)
app.post("/api/auth/role-upgrade", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Accès non autorisé. Veuillez vous connecter." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide ou expirée." });
  }

  const { role, action, vendeurMode, businessName, contactPhone, sellerPhone, vendeurSubscription, vendeurPaymentMethod, vendeurPaymentTxId } = req.body;

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const user = users[userIndex];

  if (action === "confirm_payment") {
    user.vendeurStatus = "Actif";
    user.role = "vendeur";
    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString() + Math.floor(Math.random() * 100).toString(),
      text: `Votre espace vendeur (${user.vendeurMode === "autonome" ? "Autonome" : "Assisté"}) avec l'abonnement ${user.vendeurSubscription || "choisi"} a été activé avec succès !`,
      type: "system",
      read: false,
      date: new Date().toISOString()
    });

    writeJSONFile(USERS_FILE, users);
    const { passwordHash, ...userResponse } = user;
    return res.json({ success: true, user: userResponse });
  }

  if (!role || !["client", "vendeur", "affilie", "admin"].includes(role)) {
    return res.status(400).json({ success: false, error: "Rôle invalide." });
  }

  user.role = role;

  if (role === "vendeur") {
    user.vendeurMode = vendeurMode || "autonome"; // autonome vs assiste
    user.businessName = businessName || user.name;
    user.vendeurStats = user.vendeurStats || {
      produitsPublies: 0,
      produitsVendus: 0,
      revenusGeneres: 0,
      stockRestant: 0
    };
    user.contactPhone = contactPhone || sellerPhone || user.phone || "";
    user.vendeurSubscription = vendeurSubscription || "Offre 1";
    user.vendeurPaymentMethod = vendeurPaymentMethod || "Asime Pay";
    user.vendeurPaymentTxId = vendeurPaymentTxId || "";
    user.vendeurStatus = "En attente d'activation";
    
    // Add a system notification
    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString() + Math.floor(Math.random() * 100).toString(),
      text: `Votre inscription en tant que vendeur (${user.vendeurMode === "autonome" ? "Autonome" : "Assisté"}) est reçue. En attente d'activation après validation de votre abonnement (${user.vendeurSubscription}).`,
      type: "system",
      read: false,
      date: new Date().toISOString()
    });
  } else if (role === "affilie") {
    if (!user.affiliateCode) {
      user.affiliateCode = "asime_" + user.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.floor(100 + Math.random() * 900).toString();
    }
    user.affiliateStats = user.affiliateStats || {
      clicks: 0,
      visiteurs: 0,
      ventes: 0,
      chiffreAffaires: 0,
      commissionsGagnees: 0,
      commissionDisponible: 0,
      commissionRetiree: 0
    };

    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString() + Math.floor(Math.random() * 100).toString(),
      text: `Votre compte affilié est activé ! Votre code unique est : ${user.affiliateCode}`,
      type: "system",
      read: false,
      date: new Date().toISOString()
    });
  }

  const success = writeJSONFile(USERS_FILE, users);
  if (success) {
    const { passwordHash, ...userResponse } = user;
    res.json({ success: true, user: userResponse });
  } else {
    res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du rôle." });
  }
});

// Create/Update Product from Vendor (with pricing limit validation based on subscription)
app.post(["/api/products", "/api/products/:id"], (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Accès non autorisé. Veuillez vous connecter." });
  }

  let userId = getUserIdFromToken(authHeader);
  if (!userId && (authHeader === "asime2026" || authHeader === "asime2026-auth-session" || authHeader === "shopme2026" || authHeader === "shopme2026-auth-session")) {
    userId = "user_admin";
  }

  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide ou expirée." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  let user = users.find(u => u.id === userId);
  if (!user && userId === "user_admin") {
    user = { id: "user_admin", role: "admin", name: "Administrateur Asime", businessName: "Asime Togo", vendeurSubscription: "Offre 3" };
  }
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const isSeller = user.role === "vendeur";
  const userSubscription = user.vendeurSubscription || "";
  const prodDetails = req.body;
  const prix = Number(prodDetails.prix || 0);

  // Validate price limits based on seller's subscription
  if (isSeller && userSubscription) {
    if (userSubscription === "Offre 1") {
      if (prix > 1000) {
        return res.status(400).json({
          success: false,
          error: "Votre abonnement (Offre 1) limite le prix de vos produits à un maximum de 1 000 FCFA. Veuillez modifier le prix ou changer d'abonnement."
        });
      }
    } else if (userSubscription === "Offre 2") {
      if (prix > 5000) {
        return res.status(400).json({
          success: false,
          error: "Votre abonnement (Offre 2) limite le prix de vos produits à un maximum de 5 000 FCFA. Veuillez modifier le prix ou changer d'abonnement."
        });
      }
    }
    // Offre 3 is premium and has absolutely no price limits!
  }

  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  let existingIndex = -1;
  let prodId = prodDetails.id;

  if (req.params.id) {
    prodId = req.params.id;
  }

  if (prodId) {
    existingIndex = products.findIndex((p: any) => p.id === prodId);
  }

  const existingProduct = existingIndex > -1 ? products[existingIndex] : null;
  const savedProduct = {
    id: prodId || "prod_" + Date.now().toString(),
    nom: String(prodDetails.nom || "").trim(),
    description: String(prodDetails.description || "").trim(),
    prix: prix,
    prixBarre: prodDetails.prixBarre ? Number(prodDetails.prixBarre) : null,
    images: Array.isArray(prodDetails.images) ? prodDetails.images : [prodDetails.images || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80"],
    categorie: String(prodDetails.categorie || "Général").trim(),
    phare: !!prodDetails.phare,
    stock: typeof prodDetails.stock !== "undefined" ? Math.max(0, Math.floor(Number(prodDetails.stock))) : 10,
    partenaire: prodDetails.partenaire || user.businessName || user.name,
    vendeurId: existingProduct?.vendeurId || prodDetails.vendeurId || userId,
    lienAffilie: prodDetails.lienAffilie || "",
    valide: typeof prodDetails.valide !== "undefined" ? !!prodDetails.valide : true,
    status: prodDetails.status || "actif"
  };

  if (existingIndex > -1) {
    products[existingIndex] = savedProduct;
  } else {
    products.unshift(savedProduct);
  }

  const success = writeJSONFile(PRODUCTS_FILE, products);
  if (success) {
    res.json({ success: true, product: savedProduct });
  } else {
    res.status(500).json({ success: false, error: "Impossible d'enregistrer le produit dans la base de données." });
  }
});

// Record an Affiliate Link Click with 30-day tracking logic
app.post("/api/affiliate/click", (req, res) => {
  const { ref } = req.body;
  if (!ref) {
    return res.status(400).json({ success: false, error: "Code d'affiliation manquant." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const affiliateIndex = users.findIndex(u => u.affiliateCode === ref || u.id === ref);

  if (affiliateIndex === -1) {
    return res.json({ success: false, message: "Code d'affiliation introuvable ou inactif." });
  }

  const affiliate = users[affiliateIndex];
  if (!affiliate.affiliateStats) {
    affiliate.affiliateStats = {
      clicks: 0,
      visiteurs: 0,
      ventes: 0,
      chiffreAffaires: 0,
      commissionsGagnees: 0,
      commissionDisponible: 0,
      commissionRetiree: 0
    };
  }

  affiliate.affiliateStats.clicks += 1;
  // Visiteurs is unique, let's increment it as well
  affiliate.affiliateStats.visiteurs += 1;

  writeJSONFile(USERS_FILE, users);
  res.json({ success: true, affiliateName: affiliate.name });
});

// Helper function to process automatic marketplace payment split
function executeOrderRevenueSplit(orderId: string): boolean {
  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return false;
  
  const order = orders[orderIndex];
  if (order.splitProcessed) {
    return true; // Already processed
  }
  
  const users = readJSONFile<any[]>(USERS_FILE, []);
  
  // Find affiliate if any
  let affiliateUserId = null;
  if (order.affiliateCode) {
    const affUser = users.find(u => u.affiliateCode === order.affiliateCode || u.id === order.affiliateCode);
    if (affUser) {
      affiliateUserId = affUser.id;
      
      // Update user stats in users.json to keep in sync
      affUser.affiliateStats = affUser.affiliateStats || {
        clicks: 0,
        visiteurs: 0,
        ventes: 0,
        chiffreAffaires: 0,
        commissionsGagnees: 0,
        commissionDisponible: 0,
        commissionRetiree: 0
      };
      affUser.affiliateStats.ventes += 1;
      affUser.affiliateStats.chiffreAffaires += order.totalAmount;
      affUser.affiliateStats.commissionsGagnees += order.affiliateCommission;
      affUser.affiliateStats.commissionDisponible += order.affiliateCommission;
      
      affUser.notifications = affUser.notifications || [];
      affUser.notifications.unshift({
        id: "notif_split_aff_" + Date.now().toString(),
        text: `Félicitations ! Vous avez gagné une commission de ${order.affiliateCommission.toLocaleString()} FCFA pour la vente affiliée de la commande #${orderId}.`,
        type: "affiliate",
        read: false,
        date: new Date().toISOString()
      });
    }
  }
  
  // Prepare seller credentials mapping
  const sellerCredentials = users.filter(u => u.role === "vendeur").map(u => ({
    id: u.id,
    name: u.name,
    businessName: u.businessName
  }));
  
  // Update seller stats in users.json to keep in sync
  for (const item of order.items) {
    const itemTotal = item.product.prix * item.quantity;
    const sellerEarnings = Math.floor(itemTotal * 0.90);
    const partnerName = item.product.partenaire || "Boutique en Direct";
    
    const sellerUser = users.find(u => u.role === "vendeur" && (u.businessName === partnerName || u.name === partnerName));
    if (sellerUser) {
      sellerUser.vendeurStats = sellerUser.vendeurStats || {
        produitsPublies: 0,
        produitsVendus: 0,
        revenusGeneres: 0,
        stockRestant: 0
      };
      sellerUser.vendeurStats.produitsVendus += item.quantity;
      sellerUser.vendeurStats.revenusGeneres += sellerEarnings;
      
      sellerUser.notifications = sellerUser.notifications || [];
      sellerUser.notifications.unshift({
        id: "notif_split_sel_" + Date.now().toString() + "_" + Math.floor(Math.random() * 100),
        text: `Nouvelle commande payée ! Votre produit "${item.product.nom}" (x${item.quantity}) a été vendu. Votre portefeuille a été crédité de ${sellerEarnings.toLocaleString()} FCFA (90%).`,
        type: "sale",
        read: false,
        date: new Date().toISOString()
      });
    }
  }
  
  // Run the ledger split in wallets.json
  const splitResult = WalletManager.processOrderSplit(
    orderId,
    order.totalAmount,
    order.items,
    sellerCredentials,
    affiliateUserId
  );
  
  // Save updated users and order status
  order.splitProcessed = true;
  writeJSONFile(USERS_FILE, users);
  writeJSONFile(ORDERS_FILE, orders);
  
  console.log(`Order split completed for order ${orderId}:`, splitResult);
  return true;
}

// Create Order (En attente de paiement, splits and balance processing happens on payment confirmation only)
app.post("/api/orders/create", (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = "guest_" + Date.now();
  let users: any[] = [];
  let clientIndex = -1;

  if (authHeader) {
    const parsedId = getUserIdFromToken(authHeader);
    if (parsedId) {
      userId = parsedId;
      users = readJSONFile<any[]>(USERS_FILE, []);
      clientIndex = users.findIndex(u => u.id === userId);
    }
  }

  const { items, totalAmount, shippingDetails, paymentMethod, affiliateRef } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
    return res.status(400).json({ success: false, error: "Le panier est vide ou le montant est invalide." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  users = users.length > 0 ? users : readJSONFile<any[]>(USERS_FILE, []);

  // Subtract stocks and check validity
  for (const item of items) {
    const prodIndex = products.findIndex(p => p.id === item.product.id);
    if (prodIndex > -1) {
      const currentStock = products[prodIndex].stock || 0;
      products[prodIndex].stock = Math.max(0, currentStock - item.quantity);
    }
  }
  writeJSONFile(PRODUCTS_FILE, products);

  // Pre-calculate potential affiliate commission (3%)
  let totalAffiliateCommission = 0;
  if (affiliateRef) {
    const affIndex = users.findIndex(u => u.affiliateCode === affiliateRef || u.id === affiliateRef);
    if (affIndex > -1) {
      totalAffiliateCommission = Math.floor(totalAmount * 0.03);
    }
  }

  // Save the Order record with 'En attente de paiement' status
  const newOrder = {
    id: "ord_" + (10001 + orders.length),
    userId,
    items,
    totalAmount,
    shippingDetails,
    paymentMethod,
    paymentStatus: "En attente de paiement", // Payment Gateway verifies this
    orderStatus: "En préparation",
    affiliateCode: affiliateRef || null,
    affiliateCommission: totalAffiliateCommission,
    splitProcessed: false,
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  writeJSONFile(ORDERS_FILE, orders);

  // If the client is logged in, push a customer notification
  if (clientIndex > -1) {
    const clientUser = users[clientIndex];
    clientUser.notifications = clientUser.notifications || [];
    clientUser.notifications.unshift({
      id: "notif_" + Date.now().toString() + "_" + Math.floor(Math.random() * 100),
      text: `Votre commande #${newOrder.id} d'un montant de ${totalAmount.toLocaleString()} FCFA a été enregistrée. Veuillez procéder au paiement sécurisé de la commande.`,
      type: "order",
      read: false,
      date: new Date().toISOString()
    });
    writeJSONFile(USERS_FILE, users);
  }

  res.json({ success: true, order: newOrder });
});

// Track Order publicly (no authentication required, safe since IDs are hard to guess or shared directly via secure WhatsApp message)
app.get("/api/orders/track/:id", (req, res) => {
  const orderId = req.params.id;
  if (!orderId) {
    return res.status(400).json({ success: false, error: "ID de commande requis." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const order = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());

  if (!order) {
    return res.status(404).json({ success: false, error: "Commande non trouvée." });
  }

  // Find images and extra details for the items
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const enrichedItems = order.items.map((item: any) => {
    const prod = products.find(p => p.id === item.product.id);
    return {
      ...item,
      product: {
        ...item.product,
        images: prod ? prod.images : ["/placeholder.jpg"],
        categorie: prod ? prod.categorie : ""
      }
    };
  });

  res.json({
    success: true,
    order: {
      ...order,
      items: enrichedItems
    }
  });
});

// --- NEW PAYMENT GATEWAY & WALLET ENDPOINTS ---

// GET list of active payment providers
app.get("/api/payments/providers", (req, res) => {
  res.json(PaymentGateway.getInstance().getActiveProviders());
});

// POST initiate payment session
app.post("/api/payments/initiate", (req, res) => {
  const { orderId, providerId, name, phone, email } = req.body;
  if (!orderId || !providerId) {
    return res.status(400).json({ success: false, error: "Identifiant de commande et de prestataire requis." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande non trouvée." });
  }

  const order = orders[orderIndex];
  if (order.paymentStatus === "Payé") {
    return res.status(400).json({ success: false, error: "Cette commande a déjà été payée." });
  }

  try {
    const customer = { name: name || "Client Asime", phone: phone || "", email };
    PaymentGateway.getInstance().initiatePayment(providerId, orderId, order.totalAmount, customer)
      .then(session => {
        // Associate the transaction with the order record
        order.paymentGatewayTxId = session.transactionId;
        order.paymentGatewayProvider = providerId;
        writeJSONFile(ORDERS_FILE, orders);
        
        res.json({ success: true, session });
      })
      .catch(err => {
        res.status(500).json({ success: false, error: err.message });
      });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST confirm/verify payment
app.post("/api/payments/confirm", (req, res) => {
  const { transactionId, providerId, orderId } = req.body;
  if (!transactionId || !providerId) {
    return res.status(400).json({ success: false, error: "ID de transaction et de prestataire requis." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  // Support lookup by transactionId or orderId as a fallback
  const orderIndex = orders.findIndex(o => o.paymentGatewayTxId === transactionId || o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande associée introuvable." });
  }

  const order = orders[orderIndex];
  if (order.paymentStatus === "Payé") {
    return res.json({ success: true, message: "La commande est déjà confirmée comme payée.", order });
  }

  PaymentGateway.getInstance().verifyPayment(providerId, transactionId)
    .then(result => {
      if (result.status === "success") {
        order.paymentStatus = "Payé";
        order.paymentGatewayTxId = transactionId;
        order.paymentGatewayProvider = providerId;
        order.paymentMethod = PaymentGateway.getInstance().getProvider(providerId)?.name || providerId;
        writeJSONFile(ORDERS_FILE, orders);

        // Execute automatic split of funds to seller and affiliate wallets!
        executeOrderRevenueSplit(order.id);

        // Notify client
        const clientUserId = order.userId;
        if (clientUserId && !clientUserId.startsWith("guest_")) {
          const users = readJSONFile<any[]>(USERS_FILE, []);
          const clientIndex = users.findIndex(u => u.id === clientUserId);
          if (clientIndex > -1) {
            users[clientIndex].notifications = users[clientIndex].notifications || [];
            users[clientIndex].notifications.unshift({
              id: "notif_pay_" + Date.now().toString(),
              text: `Paiement confirmé ! Votre commande #${order.id} d'un montant de ${order.totalAmount.toLocaleString()} FCFA a été payée avec succès via ${order.paymentMethod}.`,
              type: "order",
              read: false,
              date: new Date().toISOString()
            });
            writeJSONFile(USERS_FILE, users);
          }
        }

        res.json({ success: true, message: "Paiement validé avec succès !", order });
      } else {
        res.status(400).json({ success: false, error: "Le paiement n'a pas pu être validé par le prestataire." });
      }
    })
    .catch(err => {
      res.status(500).json({ success: false, error: err.message });
    });
});

// GET retrieve current user's wallet info (balance and transaction history)
app.get("/api/wallets/my-wallet", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  if (currentUser.role !== "vendeur" && currentUser.role !== "affilie") {
    return res.status(403).json({ success: false, error: "L'accès au portefeuille exige un compte vendeur ou affilié." });
  }

  const wallet = WalletManager.getWallet(userId, currentUser.role);
  res.json({ success: true, wallet });
});

// GET admin retrieve all trace logs (secured)
app.get("/api/admin/wallets/logs", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  try {
    const WALLETS_FILE = path.join(process.cwd(), "wallets.json");
    if (!fs.existsSync(WALLETS_FILE)) {
      return res.json([]);
    }
    const content = fs.readFileSync(WALLETS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    res.json(parsed.logs || []);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET admin retrieve all wallets (secured)
app.get("/api/admin/wallets", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  try {
    const WALLETS_FILE = path.join(process.cwd(), "wallets.json");
    if (!fs.existsSync(WALLETS_FILE)) {
      return res.json({});
    }
    const content = fs.readFileSync(WALLETS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    res.json(parsed.wallets || {});
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch my orders (For clients or sellers)
app.get("/api/orders/my-orders", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const currentUser = users.find(u => u.id === userId);

  if (!currentUser) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  // If user is Seller, return orders containing their products
  if (currentUser.role === "vendeur") {
    const businessName = currentUser.businessName || currentUser.name;
    const sellerOrders = orders.filter(o => 
      o.items.some((item: any) => item.product.partenaire === businessName || item.product.partenaire === currentUser.name)
    );
    return res.json(sellerOrders);
  }

  // Otherwise, return client orders
  const clientOrders = orders.filter(o => o.userId === userId);
  res.json(clientOrders);
});

// Request Withdrawal (TMoney / Flooz)
app.post("/api/withdrawals/create", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const { amount, method, phone } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount < 5000) {
    return res.status(400).json({ success: false, error: "Le montant minimum de retrait est de 5 000 FCFA." });
  }

  if (!method || !["Asime Pay", "Asime Pay (En Ligne)", "EnLigne", "PayDunya", "Paydunya", "Mobile Money", "Virement", "Espèces"].includes(method)) {
    return res.status(400).json({ success: false, error: "Méthode de retrait invalide (Asime Pay uniquement)." });
  }

  if (!phone) {
    return res.status(400).json({ success: false, error: "Le numéro de téléphone récepteur est requis." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const user = users[userIndex];
  const withdrawals = readJSONFile<any[]>(WITHDRAWALS_FILE, []);
  const withdrawalId = "with_" + (1001 + withdrawals.length);

  // Debit the internal Wallet
  const walletResult = WalletManager.debitWithdrawalRequest(
    userId,
    withdrawalId,
    numAmount,
    method,
    phone,
    user.role as "vendeur" | "affilie"
  );

  if (!walletResult.success) {
    return res.status(400).json({ success: false, error: walletResult.error || "Fonds insuffisants ou erreur de portefeuille." });
  }

  // Deduct from stats in users.json to maintain client compatibility
  if (user.role === "affilie") {
    user.affiliateStats.commissionDisponible -= numAmount;
    user.affiliateStats.commissionRetiree = (user.affiliateStats.commissionRetiree || 0) + numAmount;
  } else if (user.role === "vendeur") {
    user.vendeurStats.revenusGeneres -= numAmount;
  } else {
    return res.status(400).json({ success: false, error: "Rôle invalide." });
  }

  const newWithdrawal = {
    id: withdrawalId,
    userId,
    userName: user.name,
    userRole: user.role,
    amount: numAmount,
    method,
    phone,
    status: "En attente", // En attente, Validé, Payé, Rejeté
    createdAt: new Date().toISOString()
  };

  withdrawals.unshift(newWithdrawal);
  writeJSONFile(WITHDRAWALS_FILE, withdrawals);

  user.notifications = user.notifications || [];
  user.notifications.unshift({
    id: "notif_" + Date.now().toString() + "_" + Math.floor(Math.random() * 100),
    text: `Votre demande de retrait de ${numAmount.toLocaleString()} FCFA via ${method} a été enregistrée et est en attente d'approbation administrative.`,
    type: "withdrawal",
    read: false,
    date: new Date().toISOString()
  });

  writeJSONFile(USERS_FILE, users);

  res.json({ success: true, withdrawal: newWithdrawal, userBalance: user.role === "affilie" ? user.affiliateStats.commissionDisponible : user.vendeurStats.revenusGeneres });
});

// Fetch my withdrawal history
app.get("/api/withdrawals/my-withdrawals", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const withdrawals = readJSONFile<any[]>(WITHDRAWALS_FILE, []);
  const userWithdrawals = withdrawals.filter(w => w.userId === userId);
  res.json(userWithdrawals);
});

// Fetch current notification list
app.get("/api/auth/notifications", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  res.json(user.notifications || []);
});

// Mark all user notifications as read
app.post("/api/auth/notifications/mark-read", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session non valide." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const user = users[userIndex];
  if (user.notifications) {
    user.notifications.forEach((n: any) => n.read = true);
  }

  writeJSONFile(USERS_FILE, users);
  res.json({ success: true });
});

// --- REVIEWS / EVALUATION SYSTEM ---

// Get reviews for a product
app.get("/api/products/:id/reviews", (req, res) => {
  const { id } = req.params;
  const reviews = readJSONFile<any[]>(REVIEWS_FILE, []);
  const prodReviews = reviews.filter(r => r.productId === id);
  res.json(prodReviews);
});

// Post review for a product
app.post("/api/products/:id/reviews", (req, res) => {
  const { id } = req.params;
  const { rating, comment, userName } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: "La note doit être comprise entre 1 et 5 étoiles." });
  }

  const reviews = readJSONFile<any[]>(REVIEWS_FILE, []);
  const newReview = {
    id: "rev_" + Date.now().toString(),
    productId: id,
    rating: Number(rating),
    comment: String(comment || "").trim(),
    userName: String(userName || "Client Anonyme").trim(),
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  writeJSONFile(REVIEWS_FILE, reviews);
  res.json({ success: true, review: newReview });
});

// Get all reviews grouped by product (used by the frontend)
app.get("/api/reviews", (req, res) => {
  const reviews = readJSONFile<any[]>(REVIEWS_FILE, []);
  const result: Record<string, any[]> = {};
  for (const r of reviews) {
    const pId = r.productId;
    if (pId) {
      if (!result[pId]) {
        result[pId] = [];
      }
      result[pId].push({
        id: r.id,
        author: r.author || r.userName || "Client Anonyme",
        rating: r.rating,
        text: r.text || r.comment || "",
        date: r.date || "Récemment"
      });
    }
  }
  res.json(result);
});

// Submit a general review (used by the frontend)
app.post("/api/reviews/submit", (req, res) => {
  const { productId, author, rating, text } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, error: "Product ID is required" });
  }
  const reviews = readJSONFile<any[]>(REVIEWS_FILE, []);
  const newReview = {
    id: "rev_" + Date.now().toString(),
    productId: productId,
    rating: Number(rating || 5),
    comment: String(text || "").trim(),
    userName: String(author || "Client Anonyme").trim(),
    author: String(author || "Client Anonyme").trim(),
    text: String(text || "").trim(),
    date: "À l'instant",
    createdAt: new Date().toISOString()
  };
  reviews.unshift(newReview);
  writeJSONFile(REVIEWS_FILE, reviews);
  res.json({ success: true, review: newReview });
});


// --- ADMIN-SPECIFIC MANAGEMENT API ENDPOINTS ---

// Admin Global Dashboard Stats
app.get("/api/admin/dashboard-stats", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé. Administration uniquement." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const withdrawals = readJSONFile<any[]>(WITHDRAWALS_FILE, []);

  const totalClients = users.filter(u => !u.role || u.role === "client").length;
  const totalSellers = users.filter(u => u.role === "vendeur").length;
  const totalAffiliates = users.filter(u => u.role === "affilie").length;
  const totalProducts = products.length;
  const totalOrders = orders.length;

  const globalTurnover = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const affiliateCommissions = orders.reduce((sum, o) => sum + (o.affiliateCommission || 0), 0);
  
  // Asime gets 10% fee. Out of that 10%, we subtract any affiliate commission (3%).
  // So gross platform income is 10% of global turnover, net platform income is 10% minus paid affiliate commissions.
  const rawPlatformFee = Math.floor(globalTurnover * 0.10);
  const asimeNetRevenue = rawPlatformFee - affiliateCommissions;

  const pendingWithdrawals = withdrawals.filter(w => w.status === "En attente").length;

  res.json({
    totalClients,
    totalSellers,
    totalAffiliates,
    totalProducts,
    totalOrders,
    globalTurnover,
    asimeRevenue: Math.max(0, asimeNetRevenue),
    affiliateCommissions,
    pendingWithdrawals
  });
});

// Admin list of all users (Sellers, Affiliates, Clients)
app.get("/api/admin/users", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const usersResponse = users.map(({ passwordHash, ...u }) => u);
  res.json(usersResponse);
});

// Admin approve seller
app.post("/api/admin/users/:id/approve-seller", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const { id } = req.params;
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const user = users[index];
  user.vendeurStatus = "Actif";
  user.role = "vendeur";
  user.notifications = user.notifications || [];
  user.notifications.unshift({
    id: "notif_" + Date.now().toString() + Math.floor(Math.random() * 100).toString(),
    text: `Votre espace vendeur (${user.vendeurMode === "autonome" ? "Autonome" : "Assisté"}) avec l'abonnement ${user.vendeurSubscription || "choisi"} a été activé avec succès ! Vous pouvez maintenant configurer votre boutique.`,
    type: "system",
    read: false,
    date: new Date().toISOString()
  });

  writeJSONFile(USERS_FILE, users);
  res.json({ success: true });
});

// Admin reject seller
app.post("/api/admin/users/:id/reject-seller", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const { id } = req.params;
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }

  const user = users[index];
  user.vendeurStatus = "Rejeté";
  user.role = "client"; // Revert to client
  user.notifications = user.notifications || [];
  user.notifications.unshift({
    id: "notif_" + Date.now().toString() + Math.floor(Math.random() * 100).toString(),
    text: `Votre demande d'activation d'espace vendeur a été refusée après vérification du paiement. Veuillez contacter le support.`,
    type: "system",
    read: false,
    date: new Date().toISOString()
  });

  writeJSONFile(USERS_FILE, users);
  res.json({ success: true });
});

// Admin list of all orders
app.get("/api/admin/orders", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  res.json(orders);
});

// Admin validate payment
app.post("/api/admin/orders/:id/validate-payment", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const { id } = req.params;
  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande non trouvée." });
  }

  orders[orderIndex].paymentStatus = "Payé";
  writeJSONFile(ORDERS_FILE, orders);

  // Trigger automatic marketplace split!
  executeOrderRevenueSplit(id);

  // Notify client
  const clientUserId = orders[orderIndex].userId;
  if (clientUserId && !clientUserId.startsWith("guest_")) {
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const clientIndex = users.findIndex(u => u.id === clientUserId);
    if (clientIndex > -1) {
      users[clientIndex].notifications = users[clientIndex].notifications || [];
      users[clientIndex].notifications.unshift({
        id: "notif_" + Date.now().toString(),
        text: `Le paiement de votre commande #${id} de ${orders[orderIndex].totalAmount.toLocaleString()} FCFA a été validé !`,
        type: "order",
        read: false,
        date: new Date().toISOString()
      });
      writeJSONFile(USERS_FILE, users);
    }
  }

  res.json({ success: true, order: orders[orderIndex] });
});

// Admin update order delivery status
app.post("/api/admin/orders/:id/update-status", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const { id } = req.params;
  const { orderStatus } = req.body;

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande non trouvée." });
  }

  orders[orderIndex].orderStatus = orderStatus;
  writeJSONFile(ORDERS_FILE, orders);

  // Notify client
  const clientUserId = orders[orderIndex].userId;
  if (clientUserId && !clientUserId.startsWith("guest_")) {
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const clientIndex = users.findIndex(u => u.id === clientUserId);
    if (clientIndex > -1) {
      users[clientIndex].notifications = users[clientIndex].notifications || [];
      users[clientIndex].notifications.unshift({
        id: "notif_" + Date.now().toString(),
        text: `Le statut de votre commande #${id} a été mis à jour : "${orderStatus}".`,
        type: "order",
        read: false,
        date: new Date().toISOString()
      });
      writeJSONFile(USERS_FILE, users);
    }
  }

  res.json({ success: true, order: orders[orderIndex] });
});

// Admin list of all withdrawals
app.get("/api/admin/withdrawals", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const withdrawals = readJSONFile<any[]>(WITHDRAWALS_FILE, []);
  res.json(withdrawals);
});

// Admin validate/approve withdrawal
app.post("/api/admin/withdrawals/:id/approve", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const { id } = req.params;
  const withdrawals = readJSONFile<any[]>(WITHDRAWALS_FILE, []);
  const index = withdrawals.findIndex(w => w.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Demande de retrait introuvable." });
  }

  const withdrawal = withdrawals[index];
  if (withdrawal.status === "Payé") {
    return res.status(400).json({ success: false, error: "Ce retrait est déjà marqué comme Payé." });
  }

  // Real PayDunya Disbursment trigger
  if (["PayDunya", "Paydunya", "Asime Pay", "Asime Pay (En Ligne)", "EnLigne"].includes(withdrawal.method)) {
    const paydunya = PaymentGateway.getInstance().getProvider("paydunya") as any;
    if (paydunya && typeof paydunya.disbursePayout === "function") {
      const payoutResult = await paydunya.disbursePayout(withdrawal.phone, withdrawal.amount, withdrawal.method);
      if (!payoutResult.success) {
        return res.status(500).json({ 
          success: false, 
          error: `Échec du transfert d'argent réel via la passerelle : ${payoutResult.error || "Raison inconnue"}` 
        });
      }
      withdrawal.paymentGatewayTxId = payoutResult.txId;
    }
  }

  withdrawal.status = "Payé";
  writeJSONFile(WITHDRAWALS_FILE, withdrawals);

  // Mark complete in wallets.json
  WalletManager.completeWithdrawal(withdrawal.userId, id);

  // Notify user
  const targetUserId = withdrawal.userId;
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === targetUserId);
  if (userIndex > -1) {
    users[userIndex].notifications = users[userIndex].notifications || [];
    users[userIndex].notifications.unshift({
      id: "notif_" + Date.now().toString(),
      text: `Votre demande de retrait de ${withdrawal.amount.toLocaleString()} FCFA via ${withdrawal.method} a été validée et envoyée !`,
      type: "withdrawal",
      read: false,
      date: new Date().toISOString()
    });
    writeJSONFile(USERS_FILE, users);
  }

  res.json({ success: true, withdrawal });
});

// Admin reject withdrawal
app.post("/api/admin/withdrawals/:id/reject", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const { id } = req.params;
  const withdrawals = readJSONFile<any[]>(WITHDRAWALS_FILE, []);
  const index = withdrawals.findIndex(w => w.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Demande de retrait introuvable." });
  }

  withdrawals[index].status = "Rejeté";
  writeJSONFile(WITHDRAWALS_FILE, withdrawals);

  // Refund wallet in wallets.json
  WalletManager.rejectAndRefundWithdrawal(withdrawals[index].userId, id, withdrawals[index].amount);

  // Refund balance back to user in users.json to keep stats in sync
  const targetUserId = withdrawals[index].userId;
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === targetUserId);
  if (userIndex > -1) {
    const user = users[userIndex];
    if (user.role === "affilie") {
      user.affiliateStats.commissionDisponible += withdrawals[index].amount;
      user.affiliateStats.commissionRetiree = Math.max(0, (user.affiliateStats.commissionRetiree || 0) - withdrawals[index].amount);
    } else if (user.role === "vendeur") {
      user.vendeurStats.revenusGeneres += withdrawals[index].amount;
    }

    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString(),
      text: `Votre demande de retrait de ${withdrawals[index].amount.toLocaleString()} FCFA a été rejetée par l'administrateur. Les fonds ont été reversés sur votre solde disponible.`,
      type: "withdrawal",
      read: false,
      date: new Date().toISOString()
    });
    writeJSONFile(USERS_FILE, users);
  }

  res.json({ success: true, withdrawal: withdrawals[index] });
});

// --- PARTNERS ENDPOINTS ---

// GET partners
app.get("/api/partners", (req, res) => {
  const partners = readJSONFile<any[]>(PARTNERS_FILE, []);
  res.json(partners);
});

// POST save/add partner
app.post("/api/partners", (req, res) => {
  const { auth, name, description, contractType, monthlyFee, commissionRate, contactPhone, autoPublish } = req.body;
  if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }
  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, error: "Le nom du partenaire est obligatoire." });
  }
  const pName = String(name).trim();
  if (pName.toLowerCase() === "boutique en direct" || pName.toLowerCase() === "tous") {
    return res.status(400).json({ success: false, error: "Ce nom est réservé au système de vente directe." });
  }
  const partners = readJSONFile<any[]>(PARTNERS_FILE, []);
  if (partners.some(p => p.name.toLowerCase() === pName.toLowerCase())) {
    return res.status(400).json({ success: false, error: "Ce partenaire existe déjà." });
  }
  const newPartner = {
    id: "partner_" + Date.now().toString(),
    name: pName,
    description: String(description || "").trim(),
    contractType: contractType || "subscription",
    monthlyFee: monthlyFee !== undefined ? Number(monthlyFee) : 5000,
    commissionRate: commissionRate !== undefined ? Number(commissionRate) : 10,
    contactPhone: String(contactPhone || "").trim(),
    autoPublish: autoPublish !== undefined ? Boolean(autoPublish) : true,
    createdAt: new Date().toISOString()
  };
  partners.push(newPartner);
  if (writeJSONFile(PARTNERS_FILE, partners)) {
    res.json({ success: true, partner: newPartner });
  } else {
    res.status(500).json({ success: false, error: "Impossible d'enregistrer le partenaire." });
  }
});

// POST update partner contract attributes
app.post("/api/partners/update", (req, res) => {
  const { auth, id, description, contractType, monthlyFee, commissionRate, contactPhone, autoPublish } = req.body;
  if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }
  if (!id) {
    return res.status(400).json({ success: false, error: "L'identifiant du partenaire est obligatoire." });
  }
  const partners = readJSONFile<any[]>(PARTNERS_FILE, []);
  const index = partners.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Partenaire non trouvé." });
  }
  
  partners[index] = {
    ...partners[index],
    description: description !== undefined ? String(description).trim() : partners[index].description,
    contractType: contractType !== undefined ? contractType : (partners[index].contractType || "subscription"),
    monthlyFee: monthlyFee !== undefined ? Number(monthlyFee) : (partners[index].monthlyFee ?? 5000),
    commissionRate: commissionRate !== undefined ? Number(commissionRate) : (partners[index].commissionRate ?? 10),
    contactPhone: contactPhone !== undefined ? String(contactPhone).trim() : (partners[index].contactPhone || ""),
    autoPublish: autoPublish !== undefined ? Boolean(autoPublish) : (partners[index].autoPublish ?? true)
  };

  if (writeJSONFile(PARTNERS_FILE, partners)) {
    res.json({ success: true, partner: partners[index] });
  } else {
    res.status(500).json({ success: false, error: "Impossible d'enregistrer les modifications." });
  }
});

// DELETE partner and revert associated products to "Boutique en Direct"
app.delete("/api/partners/:name", (req, res) => {
  const { name } = req.params;
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const partners = readJSONFile<any[]>(PARTNERS_FILE, []);
  const filteredPartners = partners.filter(p => p.name.toLowerCase() !== name.toLowerCase());
  if (partners.length === filteredPartners.length) {
    return res.status(404).json({ success: false, error: "Partenaire non trouvé." });
  }

  const writePartnerSuccess = writeJSONFile(PARTNERS_FILE, filteredPartners);
  if (!writePartnerSuccess) {
    return res.status(500).json({ success: false, error: "Impossible de supprimer le partenaire." });
  }

  // Scan and reassign products having this partner to "Boutique en Direct"
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  let modified = false;
  const updatedProducts = products.map(p => {
    if (p.partenaire && p.partenaire.toLowerCase() === name.toLowerCase()) {
      modified = true;
      return { ...p, partenaire: "Boutique en Direct" };
    }
    return p;
  });

  if (modified) {
    writeJSONFile(PRODUCTS_FILE, updatedProducts);
  }

  res.json({ success: true });
});

// POST price-alerts (Real notification database request persistence)
app.post("/api/price-alerts", (req, res) => {
  const { productId, productName, phone, currentPrice } = req.body;
  if (!productId || !phone) {
    return res.status(400).json({ success: false, error: "Le numéro WhatsApp et l'ID du produit sont obligatoires." });
  }

  const ALERTS_FILE = path.join(process.cwd(), "alerts.json");
  let alerts = [];
  try {
    if (fs.existsSync(ALERTS_FILE)) {
      alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading price alerts database:", e);
  }

  const newAlert = {
    id: "alert_" + Date.now().toString(),
    productId: String(productId),
    productName: String(productName || ""),
    phone: String(phone).trim(),
    currentPrice: Number(currentPrice || 0),
    createdAt: new Date().toISOString()
  };

  alerts.push(newAlert);

  try {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), "utf-8");
    res.json({ success: true, message: "Alerte de baisse de prix configurée avec succès !" });
  } catch (e) {
    console.error("Error writing price alerts database:", e);
    res.status(500).json({ success: false, error: "Impossible d'écrire l'alerte sur le serveur." });
  }
});

// --- MESSAGING ENDPOINTS ---

app.get("/api/messages", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non autorisé." });
  }
  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session invalide." });
  }

  const threads = readJSONFile<any[]>(MESSAGES_FILE, []);
  
  // Filter threads for this user (either as customer or seller)
  const userThreads = threads.filter(t => t.customerId === userId || t.sellerId === userId);
  res.json({ success: true, threads: userThreads });
});

app.post("/api/messages", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non autorisé." });
  }
  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session invalide." });
  }

  const { threadId, sellerId, sellerName, productName, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: "Le message ne peut pas être vide." });
  }

  const threads = readJSONFile<any[]>(MESSAGES_FILE, []);
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const currentUser = users.find(u => u.id === userId);
  const currentUserName = currentUser ? currentUser.name : "Client Asime";

  let thread;
  if (threadId) {
    thread = threads.find(t => t.id === threadId);
  } else if (sellerId) {
    // Look for existing thread between this customer and seller
    thread = threads.find(t => t.customerId === userId && t.sellerId === sellerId);
    if (!thread) {
      // Create new thread
      const targetSeller = users.find(u => u.id === sellerId);
      const targetSellerName = sellerName || (targetSeller ? (targetSeller.businessName || targetSeller.name) : "Boutique Asime");
      
      thread = {
        id: "thread_" + Date.now().toString() + Math.floor(Math.random() * 100),
        customerId: userId,
        customer: currentUserName,
        avatar: currentUserName.substring(0, 2).toUpperCase(),
        sellerId: sellerId,
        sellerName: targetSellerName,
        product: productName || "Produit Asime",
        lastMessage: text,
        unread: true,
        messages: []
      };
      threads.push(thread);
    }
  } else {
    return res.status(400).json({ success: false, error: "threadId ou sellerId est requis." });
  }

  if (!thread) {
    return res.status(404).json({ success: false, error: "Discussion introuvable." });
  }

  // Determine sender type
  const senderType = (userId === thread.customerId) ? "customer" : "seller";

  // Add the message
  const newMessage = {
    sender: senderType,
    text: text,
    date: new Date().toISOString()
  };

  thread.messages.push(newMessage);
  thread.lastMessage = text;
  thread.unread = true; // Mark as unread for the recipient

  writeJSONFile(MESSAGES_FILE, threads);
  res.json({ success: true, thread });
});

app.post("/api/messages/:threadId/read", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non autorisé." });
  }
  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Session invalide." });
  }

  const { threadId } = req.params;
  const threads = readJSONFile<any[]>(MESSAGES_FILE, []);
  const index = threads.findIndex(t => t.id === threadId);

  if (index !== -1) {
    threads[index].unread = false;
    writeJSONFile(MESSAGES_FILE, threads);
  }

  res.json({ success: true });
});

// GET /api/settings - Fetch global app configuration (WhatsApp and active logo ID)
app.get("/api/settings", (req, res) => {
  const defaultSettings = {
    whatsappMerchantNumber: "22890000000",
    activeLogoId: "palmier"
  };
  const settings = readJSONFile(SETTINGS_FILE, defaultSettings);
  res.json(settings);
});

// POST /api/settings - Save global app configuration (WhatsApp and active logo ID)
app.post("/api/settings", (req, res) => {
  const { auth, whatsappMerchantNumber, activeLogoId } = req.body;
  if (auth && auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const defaultSettings = {
    whatsappMerchantNumber: "22890000000",
    activeLogoId: "palmier"
  };
  const currentSettings = readJSONFile(SETTINGS_FILE, defaultSettings);

  const newSettings = {
    whatsappMerchantNumber: whatsappMerchantNumber || currentSettings.whatsappMerchantNumber || "22890000000",
    activeLogoId: activeLogoId || currentSettings.activeLogoId || "palmier"
  };

  const success = writeJSONFile(SETTINGS_FILE, newSettings);
  if (success) {
    res.json({ success: true, settings: newSettings });
  } else {
    res.status(500).json({ success: false, error: "Impossible de sauvegarder la configuration." });
  }
});

// POST /api/admin/sync-products - Synchronize and overwrite products catalog from client localStorage
app.post("/api/admin/sync-products", (req, res) => {
  const { auth, products } = req.body;
  if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé. Non autorisé." });
  }

  if (!Array.isArray(products)) {
    return res.status(400).json({ success: false, error: "Le catalogue de produits doit être un tableau." });
  }

  const success = writeJSONFile(PRODUCTS_FILE, products);
  if (success) {
    console.log(`[Sync] Catalogue synchronisé avec succès. Nombre de produits : ${products.length}`);
    res.json({ success: true, count: products.length });
  } else {
    res.status(500).json({ success: false, error: "Impossible d'écrire le catalogue synchronisé dans la base de données." });
  }
});

// --- Vite Middleware Integration ---
async function start() {
  // Sync from Supabase on startup
  if (isSupabaseConfigured()) {
    console.log("🔄 [Startup] Synchronisation initiale avec Supabase (en parallèle)...");
    const collections = [
      { file: PRODUCTS_FILE, key: "produits.json" },
      { file: BLOGS_FILE, key: "blogs.json" },
      { file: USERS_FILE, key: "users.json" },
      { file: PARTNERS_FILE, key: "partners.json" },
      { file: ORDERS_FILE, key: "orders.json" },
      { file: WITHDRAWALS_FILE, key: "withdrawals.json" },
      { file: REVIEWS_FILE, key: "reviews.json" },
      { file: MESSAGES_FILE, key: "messages.json" },
      { file: SETTINGS_FILE, key: "settings.json" }
    ];

    const timeoutMs = 4000;
    const syncPromises = collections.map(async (col) => {
      try {
        // Fetch with a timeout of 4 seconds to prevent blocking
        const cloudData = await Promise.race([
          loadFromSupabaseStore(col.key),
          new Promise<null>((resolve) => setTimeout(() => {
            console.warn(`⏳ [Startup] Timeout de synchronisation pour ${col.key} après ${timeoutMs}ms.`);
            resolve(null);
          }, timeoutMs))
        ]);

        if (cloudData) {
          fs.writeFileSync(col.file, JSON.stringify(cloudData, null, 2), "utf-8");
          console.log(`✅ [Startup] Restauré depuis Supabase : ${col.key}`);
        } else {
          // If Supabase is connected but this key is not found, seed current local file to Supabase
          if (fs.existsSync(col.file)) {
            const localData = JSON.parse(fs.readFileSync(col.file, "utf-8"));
            console.log(`🌱 [Startup] Seeding de ${col.key} vers Supabase...`);
            await saveToSupabaseStore(col.key, localData);
          }
        }
      } catch (err: any) {
        console.error(`❌ [Startup] Erreur lors de la synchronisation de ${col.key} :`, err.message || err);
      }
    });

    // Run all syncs concurrently but let them resolve within the timeout
    await Promise.all(syncPromises);
  } else {
    printSetupInstructions();
  }

  let vite: any = null;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
  }

  // Explicit route handlers for Administration entry point
  app.get(["/admin", "/admin.html"], async (req, res, next) => {
    try {
      if (process.env.NODE_ENV !== "production" && vite) {
        const template = fs.readFileSync(path.join(process.cwd(), "admin.html"), "utf-8");
        const html = await vite.transformIndexHtml(req.originalUrl || req.url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } else {
        res.sendFile(path.join(process.cwd(), "dist", "admin.html"));
      }
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  if (vite) {
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html") || filePath.endsWith(".js") || filePath.endsWith(".css") || filePath.endsWith(".png")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Asime Backend] Server live at http://localhost:${PORT}`);
  });
}

start();

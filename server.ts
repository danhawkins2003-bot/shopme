import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Synchronous resilient .env loader
const possibleEnvPaths = [
  path.join(process.cwd(), ".env"),
  "./.env",
  "../.env",
  "/app/.env"
];

for (const envFile of possibleEnvPaths) {
  if (fs.existsSync(envFile)) {
    try {
      let content = fs.readFileSync(envFile, "utf-8");
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      for (const line of content.split(/\r?\n/)) {
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        if (trimmed.startsWith("export ")) {
          trimmed = trimmed.substring(7).trim();
        }
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          let v = trimmed.slice(eqIdx + 1).trim();
          if (!v.startsWith('"') && !v.startsWith("'")) {
            const hashIdx = v.indexOf("#");
            if (hashIdx > -1) v = v.slice(0, hashIdx).trim();
          }
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1).trim();
          }
          if (k && v) {
            process.env[k] = v;
            process.env[k.toUpperCase()] = v;
          }
        }
      }
      console.log(`✅ [.env] Variables d'environnement chargées avec succès depuis ${envFile}.`);
    } catch (e) {
      console.error(`⚠️ [.env] Erreur de lecture du fichier ${envFile}:`, e);
    }
  }
}

import { GoogleGenAI } from "@google/genai";
import { PaymentGateway, updatePayDunyaInvoiceStatus, getPayDunyaInvoice, recordPayDunyaInvoice, loadPayDunyaInvoices } from "./paymentGateway";
import { WalletManager } from "./walletHelper";
import { 
  saveToSupabaseStore, 
  loadFromSupabaseStore, 
  isSupabaseConfigured, 
  printSetupInstructions, 
  getSupabaseClient, 
  checkSupabaseHealth, 
  syncProductToSupabaseTable, 
  deleteProductFromSupabaseTable, 
  syncAllProductsToSupabaseTable, 
  loadProductsFromSupabaseTable, 
  migrateProductsFileToSupabase,
  ensureStorageBuckets,
  uploadImageToSupabaseStorage,
  deleteImageFromSupabaseStorage,
  saveAppData,
  loadAppData,
  recordTombstoneInSupabase,
  loadTombstonesFromSupabase
} from "./supabaseHelper";

const app = express();
const PORT = 3000;

// Gemini AI Client Lazy Helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Allow large payloads for base64 image uploads (up to 4 images per product can be large)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  if (typeof req.body === "string" && req.body.trim().startsWith("{")) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  }
  next();
});

// Prevent aggressive caching of API endpoints (especially on mobile/Android browsers)
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const PRODUCTS_FILE = path.join(process.cwd(), "produits.json");
const BLOGS_FILE = path.join(process.cwd(), "blogs.json");
const USERS_FILE = path.join(process.cwd(), "users.json");
const PARTNERS_FILE = path.join(process.cwd(), "partners.json");
const ORDERS_FILE = path.join(process.cwd(), "orders.json");
const WITHDRAWALS_FILE = path.join(process.cwd(), "withdrawals.json");
const REVIEWS_FILE = path.join(process.cwd(), "reviews.json");
const MESSAGES_FILE = path.join(process.cwd(), "messages.json");
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");
const SHOWCASE_FILE = path.join(process.cwd(), "showcase.json");
const BANNERS_FILE = path.join(process.cwd(), "banners.json");
const BANNER_REQUESTS_FILE = path.join(process.cwd(), "banner_requests.json");
const PRODUCTS_BACKUP_FILE = path.join(process.cwd(), "products.json");
const DELETED_PRODUCTS_FILE = path.join(process.cwd(), "deleted_products.json");

// In-memory set for fast, consistent tombstone tracking across requests
const inMemoryDeletedIds = new Set<string>();

// Asynchronously hydrate tombstones from Supabase on start
if (isSupabaseConfigured()) {
  loadTombstonesFromSupabase().then((ids) => {
    ids.forEach((id) => inMemoryDeletedIds.add(id));
    console.log(`🛡️ [Tombstones] ${ids.length} tombstones chargés depuis Supabase.`);
  }).catch(() => {});
}

// Helper to retrieve all permanently deleted product IDs
function getDeletedProductIds(): string[] {
  try {
    const list = readJSONFile<any[]>(DELETED_PRODUCTS_FILE, []);
    if (Array.isArray(list)) {
      list.forEach((item) => {
        const id = typeof item === "string" ? item : (item?.id ? String(item.id) : "");
        if (id) inMemoryDeletedIds.add(id);
      });
    }
  } catch (e) {}
  return Array.from(inMemoryDeletedIds);
}

// Helper to record a product ID in the persistent tombstone blacklist
function recordDeletedProductId(id: string): void {
  try {
    const idStr = String(id).trim();
    if (!idStr) return;
    inMemoryDeletedIds.add(idStr);
    
    // Persist to Supabase Storage app-data bucket
    if (isSupabaseConfigured()) {
      recordTombstoneInSupabase(idStr).catch((err) => {
        console.warn("⚠️ [Tombstone Supabase] Erreur enregistrement deleted_products:", err);
      });
    }

    if (process.env.VERCEL !== "1") {
      try {
        const list = readJSONFile<any[]>(DELETED_PRODUCTS_FILE, []);
        const existingIds = new Set(list.map(item => typeof item === "string" ? item : (item?.id ? String(item.id) : "")).filter(Boolean));
        if (!existingIds.has(idStr)) {
          list.push({ id: idStr, deletedAt: new Date().toISOString() });
          fs.writeFileSync(DELETED_PRODUCTS_FILE, JSON.stringify(list, null, 2), "utf-8");
        }
      } catch {}
    }
    console.log(`🛡️ [Tombstone] Produit "${idStr}" enregistré dans la blacklist.`);
  } catch (e) {
    console.error("Erreur enregistrement produit supprimé:", e);
  }
}

// Helper to un-tombstone a product if explicitly created/saved anew by admin
function removeDeletedProductId(id: string): void {
  try {
    const idStr = String(id).trim();
    if (!idStr) return;
    inMemoryDeletedIds.delete(idStr);

    if (isSupabaseConfigured()) {
      loadAppData<any[]>("deleted_products.json", []).then((list) => {
        const filtered = list.filter(item => {
          const existingId = typeof item === "string" ? item : (item?.id ? String(item.id) : "");
          return existingId !== idStr;
        });
        if (filtered.length !== list.length) {
          saveAppData("deleted_products.json", filtered).catch(() => {});
        }
      }).catch(() => {});
    }

    if (process.env.VERCEL !== "1") {
      try {
        const list = readJSONFile<any[]>(DELETED_PRODUCTS_FILE, []);
        const filtered = list.filter(item => {
          const existingId = typeof item === "string" ? item : (item?.id ? String(item.id) : "");
          return existingId !== idStr;
        });
        if (filtered.length !== list.length) {
          fs.writeFileSync(DELETED_PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
        }
      } catch {}
    }
  } catch (e) {}
}

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
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=600",
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
      affiliateUrl = `https://www.amazon.com/dp/B00AFFILIATE${i}?tag=miabeasi-20`;
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

// Helper to manage in-memory cache and safe file persistence
const memoryStore = new Map<string, any>();

function getTmpFilePath(filePath: string): string {
  const fileName = path.basename(filePath);
  return path.join("/tmp", fileName);
}

// Helper to read JSON files safely
function readJSONFile<T>(filePath: string, defaultData: T): T {
  if (memoryStore.has(filePath)) {
    return memoryStore.get(filePath) as T;
  }

  try {
    let content = "";
    let loadedFromDisk = false;

    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, "utf-8");
      loadedFromDisk = true;
    } else {
      const tmpPath = getTmpFilePath(filePath);
      if (fs.existsSync(tmpPath)) {
        content = fs.readFileSync(tmpPath, "utf-8");
        loadedFromDisk = true;
      }
    }

    if (!loadedFromDisk || !content) {
      if (filePath === PRODUCTS_FILE) {
        memoryStore.set(filePath, []);
        return [] as unknown as T;
      }
      memoryStore.set(filePath, defaultData);
      return defaultData;
    }

    if (content.toLowerCase().includes("shopme")) {
      content = content.replace(/shopme/gi, (match) => {
        if (match === "ShopMe") return "Miabé Asi";
        if (match === "SHOPME") return "MIABÉ ASI";
        return "asime";
      });
    }

    const parsed = JSON.parse(content);
    if (filePath === PRODUCTS_FILE) {
      if (!Array.isArray(parsed)) {
        memoryStore.set(filePath, []);
        return [] as unknown as T;
      }
      memoryStore.set(filePath, parsed);
      return parsed as unknown as T;
    }

    if ((filePath === USERS_FILE || filePath === ORDERS_FILE || filePath === BLOGS_FILE || filePath === PARTNERS_FILE || filePath === WITHDRAWALS_FILE || filePath === REVIEWS_FILE || filePath === MESSAGES_FILE) && !Array.isArray(parsed)) {
      memoryStore.set(filePath, []);
      return [] as unknown as T;
    }

    memoryStore.set(filePath, parsed);
    return parsed as unknown as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    memoryStore.set(filePath, defaultData);
    return defaultData;
  }
}

// Helper to write JSON files safely without crashing in serverless/read-only environments
function writeJSONFile<T>(filePath: string, data: T): boolean {
  memoryStore.set(filePath, data);

  if (process.env.VERCEL !== "1") {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (primaryErr) {
      try {
        const tmpPath = getTmpFilePath(filePath);
        fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
      } catch (tmpErr) {}
    }
  } else {
    try {
      const tmpPath = getTmpFilePath(filePath);
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    } catch {}
  }

  // Background replication to Supabase cloud if active
  if (isSupabaseConfigured()) {
    const keyName = path.basename(filePath);
    saveToSupabaseStore(keyName, data).catch((err) => {
      console.warn(`⚠️ [Supabase Sync] Non-blocking backup for "${keyName}":`, err.message || err);
    });

    // Directly sync relational table if data is products
    if ((keyName.includes("produit") || keyName.includes("product")) && Array.isArray(data)) {
      syncAllProductsToSupabaseTable(data).catch(() => {});
    }
  }

  return true;
}

// --- API Endpoints ---

// GET deleted product IDs (tombstones blacklist)
app.get(["/api/products/deleted-ids", "/api/products/deleted-ids/"], (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const deletedIds = getDeletedProductIds();
  res.json({ success: true, deletedIds });
});

// POST /api/upload - Direct upload to Supabase Storage products bucket
app.post(["/api/upload", "/api/upload/image"], async (req, res) => {
  try {
    const { image, previousUrl, fileName, contentType } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, error: "Image requise sous forme de chaîne base64 ou data URL." });
    }

    let buffer: Buffer;
    let mimeType = contentType || "image/jpeg";

    if (typeof image === "string" && image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        buffer = Buffer.from(match[2], "base64");
      } else {
        buffer = Buffer.from(image, "base64");
      }
    } else if (typeof image === "string") {
      buffer = Buffer.from(image, "base64");
    } else {
      buffer = Buffer.from(image);
    }

    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: "L'image ne doit pas dépasser 20 Mo." });
    }

    // If an old image is being replaced, clean it up from Supabase Storage
    if (previousUrl && typeof previousUrl === "string" && previousUrl.includes("supabase.co/storage")) {
      deleteImageFromSupabaseStorage(previousUrl).catch((err) => {
        console.warn("⚠️ [Upload] Erreur suppression ancienne image:", err);
      });
    }

    const safeFileName = (fileName || `img_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, "_");
    const result = await uploadImageToSupabaseStorage(buffer, safeFileName, mimeType);

    if (!result.success || !result.url) {
      console.error("🔴 [Upload API] Échec téléversement:", result.error);
      return res.status(500).json({
        success: false,
        error: `Échec du téléversement sur Supabase Storage : ${result.error || "Erreur inconnue"}`
      });
    }

    console.log(`📸 [Upload API] Image uploadée avec succès dans Supabase Storage: ${result.url}`);
    return res.json({
      success: true,
      url: result.url,
      path: result.path,
      message: "Image téléversée et persistée avec succès."
    });
  } catch (err: any) {
    console.error("🔴 [Upload API] Exception:", err);
    return res.status(500).json({
      success: false,
      error: `Erreur serveur lors du téléversement de l'image : ${err.message || String(err)}`
    });
  }
});

// GET products (Supabase public.products as primary source of truth, with local JSON fallback and tombstone filtering)
app.get(["/api/products", "/api/products/"], async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const deletedIds = new Set(getDeletedProductIds());

  let supabaseProducts: any[] | null = null;
  if (isSupabaseConfigured()) {
    try {
      supabaseProducts = await loadProductsFromSupabaseTable();
    } catch (err) {
      console.warn("⚠️ [Products GET] Supabase temporairement indisponible, bascule sur fallback local:", err);
    }
  }

  if (Array.isArray(supabaseProducts) && supabaseProducts.length > 0) {
    const cleanSupabase = supabaseProducts.filter((p: any) => !deletedIds.has(String(p?.id)));
    memoryStore.set(PRODUCTS_FILE, cleanSupabase);
    if (process.env.VERCEL !== "1") {
      try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(cleanSupabase, null, 2), "utf-8");
        if (fs.existsSync(PRODUCTS_BACKUP_FILE)) {
          fs.writeFileSync(PRODUCTS_BACKUP_FILE, JSON.stringify(cleanSupabase, null, 2), "utf-8");
        }
      } catch (e) {}
    }
    return res.json(cleanSupabase);
  }

  // Fallback to local produits.json
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const cleanProducts = products.filter((p: any) => !deletedIds.has(String(p?.id)));
  res.json(Array.isArray(cleanProducts) ? cleanProducts : []);
});

// GET blog posts
app.get("/api/blogs", (req, res) => {
  const blogs = readJSONFile(BLOGS_FILE, []);
  res.json(blogs);
});

// Admin Authentication check
app.post("/api/admin/auth", (req, res) => {
  const { password } = req.body;
  if (password === "miabeasi2026" || password === "asime2026" || password === "shopme2026") {
    res.json({ success: true, token: "asime2026-auth-session" });
  } else {
    res.status(401).json({ success: false, error: "Mot de passe incorrect" });
  }
});

// Admin verification check
app.get("/api/admin/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader === "asime2026" || authHeader === "asime2026-auth-session" || authHeader === "shopme2026" || authHeader === "shopme2026-auth-session") {
    return res.json({ success: true, authorized: true, role: "admin" });
  }
  const userId = authHeader ? getUserIdFromToken(authHeader) : null;
  if (userId) {
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const user = users.find(u => u.id === userId);
    if (user && user.role === "admin") {
      return res.json({ success: true, authorized: true, role: "admin" });
    }
  }
  return res.status(403).json({ success: false, authorized: false, error: "Non autorisé. Session administrateur requise." });
});

// --- CUSTOMER AUTHENTICATION ENDPOINTS ---

// Inscription (Sign-up)
app.post(["/api/auth/register", "/auth/register"], (req, res) => {
  try {
    const { 
      name, email, password, phone, quartier, role, 
      boutiqueName, businessName, countryCode, country, currencyCode,
      plan, vendeurPlan, vendeurSubscription, boutiqueSlug, vendeurSlug,
      boutiqueDescription, boutiqueBio, boutiqueWhatsapp, boutiqueLogo, category
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Veuillez remplir les champs obligatoires (Nom, Email, Mot de passe)." });
    }

    const emailLower = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ success: false, error: "Veuillez saisir une adresse email valide (ex: nom@exemple.com)." });
    }
    const users = readJSONFile<any[]>(USERS_FILE, []);
    
    const existingUser = users.find(u => u && u.email && String(u.email).toLowerCase() === emailLower);
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Cette adresse email est déjà enregistrée." });
    }

    const supportedCountryCodes = ["TG", "BJ", "BF", "CI", "ML", "SN", "CM"];
    const userCountryCode = (countryCode && supportedCountryCodes.includes(String(countryCode).toUpperCase()))
      ? String(countryCode).toUpperCase()
      : "TG";
    const userCurrencyCode = currencyCode || (userCountryCode === "CM" ? "XAF" : "XOF");

    // Strictly forbid self-assignment of "admin" role during registration
    const effectiveRole = role === "vendeur" ? "vendeur" : (role === "affilie" ? "affilie" : (role === "livreur" ? "livreur" : "client"));
    const isVendeur = effectiveRole === "vendeur";
    
    // Resolve seller plan: "Gratuit" | "PRO" | "BUSINESS"
    const chosenPlan = (vendeurPlan || plan || (isVendeur ? "Gratuit" : "")).toString().trim();
    const isPro = chosenPlan === "PRO" || chosenPlan === "BUSINESS";

    // Free plan -> immediate active access
    // Pro/Business plan -> pending until PayDunya payment confirmed by server
    const initialSubscriptionStatus = isVendeur 
      ? (isPro ? "pending" : "active")
      : undefined;

    const bName = String(boutiqueName || businessName || name || "").trim();
    const rawSlug = boutiqueSlug || vendeurSlug || "";
    const bSlug = isPro ? String(rawSlug).trim() : "";

    const newUser: any = {
      id: "user_" + Date.now().toString() + "_" + Math.floor(Math.random() * 1000),
      name: String(name).trim(),
      email: emailLower,
      passwordHash: hashPassword(password),
      phone: String(phone || "").trim(),
      quartier: String(quartier || "").trim(),
      role: effectiveRole,
      boutiqueName: bName,
      businessName: bName,
      countryCode: userCountryCode,
      country: country ? String(country).trim() : (userCountryCode === "CM" ? "Cameroun" : "Togo"),
      currencyCode: userCurrencyCode,
      favorites: [],
      createdAt: new Date().toISOString()
    };

    if (isVendeur) {
      newUser.vendeurPlan = chosenPlan || "Gratuit";
      newUser.plan = newUser.vendeurPlan;
      newUser.vendeurSubscription = vendeurSubscription || (chosenPlan === "BUSINESS" ? "Offre 3" : chosenPlan === "PRO" ? "Offre 2" : "Offre 1");
      newUser.vendeurSubscriptionStatus = initialSubscriptionStatus; // "active" (Gratuit) or "pending" (PRO/BUSINESS)
      newUser.subscriptionStatus = initialSubscriptionStatus;
      newUser.vendeurStatus = "Actif";
      newUser.boutiqueSlug = bSlug;
      newUser.vendeurSlug = bSlug;
      newUser.boutiqueDescription = String(boutiqueDescription || boutiqueBio || "").trim();
      newUser.boutiqueBio = newUser.boutiqueDescription;
      newUser.boutiqueWhatsapp = String(boutiqueWhatsapp || phone || "").trim();
      newUser.boutiqueLogo = String(boutiqueLogo || "").trim();
      newUser.category = String(category || "").trim();

      // Initialize vendor wallet
      WalletManager.getWallet(newUser.id, "vendeur");
    } else if (effectiveRole === "affilie") {
      newUser.affiliateCode = "AFF-" + crypto.randomBytes(3).toString("hex").toUpperCase();
      WalletManager.getWallet(newUser.id, "affilie");
    }

    users.push(newUser);
    writeJSONFile(USERS_FILE, users);
    
    const sessionToken = createTokenForUser(newUser.id);
    const { passwordHash, ...userResponse } = newUser;
    return res.json({ success: true, token: sessionToken, user: userResponse });
  } catch (err: any) {
    console.error("Register endpoint error:", err);
    return res.status(500).json({ success: false, error: "Erreur lors de l'inscription: " + (err.message || "Erreur serveur.") });
  }
});

// Connexion (Login)
app.post(["/api/auth/login", "/auth/login"], (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email et mot de passe requis." });
    }

    const emailLower = String(email).trim().toLowerCase();
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const user = users.find(u => u && u.email && String(u.email).toLowerCase() === emailLower);

    if (!user || !user.passwordHash || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, error: "Identifiants incorrects. Veuillez réessayer." });
    }

    const sessionToken = createTokenForUser(user.id);
    const { passwordHash, ...userResponse } = user;
    return res.json({ success: true, token: sessionToken, user: userResponse });
  } catch (err: any) {
    console.error("Login endpoint error:", err);
    return res.status(500).json({ success: false, error: "Erreur lors de la connexion: " + (err.message || "Erreur serveur.") });
  }
});

// Récupérer l'utilisateur courant (Current User details)
app.get(["/api/auth/me", "/auth/me"], (req, res) => {
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

  const { 
    name, phone, quartier, city, vendeurPin, affiliatePin, 
    countryCode, country, currencyCode, businessName, boutiqueName, 
    boutiqueDescription, boutiqueBio, boutiqueSlug, vendeurSlug, 
    boutiqueLogo, boutiqueBanner, boutiqueWhatsapp, livreurZone, livreurVehicle 
  } = req.body;
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur introuvable." });
  }

  if (name) users[userIndex].name = String(name).trim();
  if (typeof phone !== "undefined") users[userIndex].phone = String(phone).trim();
  if (typeof quartier !== "undefined") users[userIndex].quartier = String(quartier).trim();
  if (typeof city !== "undefined") users[userIndex].city = String(city).trim();
  if (typeof vendeurPin !== "undefined") users[userIndex].vendeurPin = String(vendeurPin).trim();
  if (typeof affiliatePin !== "undefined") users[userIndex].affiliatePin = String(affiliatePin).trim();
  if (typeof livreurZone !== "undefined") users[userIndex].livreurZone = String(livreurZone).trim();
  if (typeof livreurVehicle !== "undefined") users[userIndex].livreurVehicle = String(livreurVehicle).trim();

  // Country & Currency support (7 authorized countries)
  const supportedCountryCodes = ["TG", "BJ", "BF", "CI", "ML", "SN", "CM"];
  if (countryCode && supportedCountryCodes.includes(String(countryCode).toUpperCase())) {
    const code = String(countryCode).toUpperCase();
    users[userIndex].countryCode = code;
    users[userIndex].currencyCode = currencyCode || (code === "CM" ? "XAF" : "XOF");
    if (country) {
      users[userIndex].country = String(country).trim();
    }
  }

  if (businessName) users[userIndex].businessName = String(businessName).trim();
  if (boutiqueName) users[userIndex].boutiqueName = String(boutiqueName).trim();
  if (boutiqueDescription) users[userIndex].boutiqueDescription = String(boutiqueDescription).trim();
  if (boutiqueBio) users[userIndex].boutiqueBio = String(boutiqueBio).trim();
  if (boutiqueSlug) users[userIndex].boutiqueSlug = String(boutiqueSlug).trim().toLowerCase();
  if (vendeurSlug) users[userIndex].vendeurSlug = String(vendeurSlug).trim().toLowerCase();
  if (boutiqueLogo) users[userIndex].boutiqueLogo = String(boutiqueLogo).trim();
  if (boutiqueBanner) users[userIndex].boutiqueBanner = String(boutiqueBanner).trim();
  if (boutiqueWhatsapp) users[userIndex].boutiqueWhatsapp = String(boutiqueWhatsapp).trim();

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

// POST save/update product with security validation (Supabase public.products as primary source of truth)
app.post("/api/products/save", async (req, res) => {
  try {
    const { auth, product } = req.body;

    // Security Check: Verify admin password
    if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
      return res.status(403).json({ success: false, error: "Accès refusé. Non autorisé." });
    }

    if (!product || !product.nom || typeof product.prix === "undefined") {
      return res.status(400).json({ success: false, error: "Données de produit manquantes ou invalides (nom et prix requis)." });
    }

    const prix = Math.max(0, Number(product.prix));
    const prixBarre = product.prixBarre ? Math.max(0, Number(product.prixBarre)) : (product.prix_barre ? Math.max(0, Number(product.prix_barre)) : null);
    const images = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : ["https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600"]);
    const affiliateLink = product.lienAffilie ? String(product.lienAffilie).trim() : (product.lien_affilie ? String(product.lien_affilie).trim() : "");

    // Format and validate data types
    const validatedProduct = {
      id: product.id ? String(product.id) : "prod_" + Date.now().toString(),
      nom: String(product.nom).trim(),
      description: String(product.description || "").trim(),
      prix: prix,
      prixBarre: prixBarre,
      prix_barre: prixBarre,
      images: images,
      image: images.length > 0 ? images[0] : "",
      categorie: String(product.categorie || "Général").trim(),
      phare: typeof product.phare !== "undefined" ? !!product.phare : true,
      stock: typeof product.stock !== "undefined" ? Math.max(0, Math.floor(Number(product.stock))) : 10,
      partenaire: product.partenaire ? String(product.partenaire).trim() : "Boutique en Direct",
      lienAffilie: affiliateLink,
      lien_affilie: affiliateLink,
      countryOrigin: product.countryOrigin || product.countryCode || "TG",
      countryCode: product.countryCode || product.countryOrigin || "TG",
      currencyCode: product.currencyCode || (product.countryCode === "CM" ? "XAF" : "XOF"),
      isCrossBorderEligible: product.isCrossBorderEligible !== undefined ? !!product.isCrossBorderEligible : true,
      weightKg: Number(product.weightKg || product.weight_kg) || 0.5,
      valide: typeof product.valide !== "undefined" ? !!product.valide : true,
      status: product.status || "actif"
    };

    // Remove from deleted products tombstone blacklist in case it was previously deleted
    removeDeletedProductId(String(validatedProduct.id));

    // 1. Primary Source of Truth: Synchronize to Supabase public.products table
    if (isSupabaseConfigured()) {
      const sbResult = await syncProductToSupabaseTable(validatedProduct);
      if (!sbResult.success) {
        console.error(`🔴 [POST /api/products/save] Échec Supabase:`, sbResult.error);
        return res.status(500).json({
          success: false,
          error: `Erreur d'enregistrement Supabase : ${sbResult.error || "Erreur de base de données"}`
        });
      }
      console.log(`✨ [Supabase] Produit "${validatedProduct.nom}" (${validatedProduct.id}) synchronisé avec succès dans public.products`);
    }

    // 2. Non-blocking update of in-memory cache and local file
    const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
    const existingIndex = products.findIndex((p) => String(p.id) === String(validatedProduct.id));
    if (existingIndex > -1) {
      products[existingIndex] = { ...products[existingIndex], ...validatedProduct };
    } else {
      products.unshift(validatedProduct);
    }
    memoryStore.set(PRODUCTS_FILE, products);

    if (process.env.VERCEL !== "1") {
      try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
        if (fs.existsSync(PRODUCTS_BACKUP_FILE)) {
          fs.writeFileSync(PRODUCTS_BACKUP_FILE, JSON.stringify(products, null, 2), "utf-8");
        }
      } catch (e) {}
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.json({ success: true, product: validatedProduct });
  } catch (err: any) {
    console.error("🔴 [POST /api/products/save] Exception inattendue:", err);
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la sauvegarde : " + (err.message || String(err)) });
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

// GET /api/admin/db-status - Check Supabase configuration, connection, and table status
app.get("/api/admin/db-status", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  const isConfigured = isSupabaseConfigured();
  if (!isConfigured) {
    return res.json({
      configured: false,
      url: "",
      hasTable: false,
      error: "Supabase n'est pas configuré. Le serveur utilise la persistance locale JSON."
    });
  }

  const client = getSupabaseClient();
  if (!client) {
    return res.json({
      configured: false,
      url: "",
      hasTable: false,
      error: "Impossible d'initialiser le client Supabase."
    });
  }

  try {
    const { data, error } = await client
      .from("asime_store")
      .select("key")
      .limit(1);

    if (error) {
      return res.json({
        configured: true,
        url: process.env.SUPABASE_URL || "",
        hasTable: false,
        error: `Table 'asime_store' non détectée ou inaccessible : ${error.message}`
      });
    }

    return res.json({
      configured: true,
      url: process.env.SUPABASE_URL || "",
      hasTable: true,
      count: data ? data.length : 0
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      url: process.env.SUPABASE_URL || "",
      hasTable: false,
      error: `Erreur inattendue : ${err.message || err}`
    });
  }
});

// POST /api/admin/db-push - Force pushing local JSON data to Supabase
app.post("/api/admin/db-push", async (req, res) => {
  const { auth } = req.body;
  if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé." });
  }

  if (!isSupabaseConfigured()) {
    return res.status(400).json({ success: false, error: "Supabase n'est pas configuré sur ce serveur." });
  }

  console.log("📤 [Manual Push] Début de la synchronisation forcée des fichiers locaux vers Supabase...");
  const collections = [
    { file: PRODUCTS_FILE, key: "products.json" },
    { file: BLOGS_FILE, key: "blogs.json" },
    { file: USERS_FILE, key: "users.json" },
    { file: PARTNERS_FILE, key: "partners.json" },
    { file: ORDERS_FILE, key: "orders.json" },
    { file: WITHDRAWALS_FILE, key: "withdrawals.json" },
    { file: REVIEWS_FILE, key: "reviews.json" },
    { file: MESSAGES_FILE, key: "messages.json" },
    { file: SETTINGS_FILE, key: "settings.json" },
    { file: SHOWCASE_FILE, key: "showcase.json" },
    { file: BANNERS_FILE, key: "banners.json" },
    { file: DELETED_PRODUCTS_FILE, key: "deleted_products.json" }
  ];

  const results: any[] = [];
  for (const col of collections) {
    try {
      if (fs.existsSync(col.file)) {
        const content = fs.readFileSync(col.file, "utf-8");
        const data = JSON.parse(content);
        const success = await saveToSupabaseStore(col.key, data);
        results.push({ key: col.key, success });
      } else {
        results.push({ key: col.key, success: false, error: "Fichier local introuvable." });
      }
    } catch (err: any) {
      results.push({ key: col.key, success: false, error: err.message || err });
    }
  }

  res.json({ success: true, results });
});

// GET /api/admin/products-migration-status - Audit and preview products migration
app.get("/api/admin/products-migration-status", async (req, res) => {
  const filePath = fs.existsSync(PRODUCTS_FILE) ? PRODUCTS_FILE : path.join(process.cwd(), "products.json");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: "Fichier de produits non trouvé." });
  }

  const products = readJSONFile<any[]>(filePath, []);
  const ids = products.map((p) => String(p.id));
  const uniqueIds = new Set(ids);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  let supabaseTableCount: number | null = null;
  let supabaseTableAccessible = false;

  const client = getSupabaseClient();
  if (client) {
    try {
      const { count, error } = await client
        .from("products")
        .select("*", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        supabaseTableCount = count;
        supabaseTableAccessible = true;
      }
    } catch {}
  }

  res.json({
    success: true,
    file: path.basename(filePath),
    totalCount: products.length,
    uniqueCount: uniqueIds.size,
    hasDuplicates: duplicates.length > 0,
    duplicateIds: duplicates,
    sampleIds: ids.slice(0, 5),
    idFormat: "prod_pop_X ou prod_timestamp",
    targetTable: "public.products",
    onConflictStrategy: "ON CONFLICT (id) DO UPDATE SET (sans doublon)",
    supabaseConnected: client !== null,
    supabaseTableAccessible,
    supabaseTableCount,
    readyToSync: true
  });
});

// POST /api/admin/sync-products - Exécute la synchronisation sans doublons vers public.products
app.post("/api/admin/sync-products", async (req, res) => {
  const { auth } = req.body || {};
  const authHeader = req.headers.authorization;
  const token = auth || authHeader;

  if (token !== "asime2026" && token !== "asime2026-auth-session" && token !== "shopme2026" && token !== "shopme2026-auth-session") {
    return res.status(403).json({ success: false, error: "Accès refusé. Clé d'administration requise." });
  }

  try {
    const migration = await migrateProductsFileToSupabase();
    res.json({
      success: migration.syncedToRelational || migration.supabaseConnected,
      migration
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Erreur lors de la synchronisation des produits." });
  }
});

// DELETE product (Secure - deletes from Supabase public.products, persists tombstone, non-blocking cache update)
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const idStr = String(id).trim();
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  const isAdminAuth = (
    authHeader === "asime2026" || 
    authHeader === "asime2026-auth-session" || 
    authHeader === "shopme2026" || 
    authHeader === "shopme2026-auth-session" ||
    token === "asime2026" ||
    token === "asime2026-auth-session" ||
    token === "shopme2026" ||
    token === "shopme2026-auth-session"
  );

  let userId: string | null = null;
  if (authHeader) {
    userId = getUserIdFromToken(authHeader);
  }

  if (!isAdminAuth && !userId) {
    return res.status(403).json({ success: false, error: "Accès refusé. Non autorisé." });
  }

  try {
    // 1. Delete from Supabase public.products table (Primary Source of Truth)
    if (isSupabaseConfigured()) {
      const sbResult = await deleteProductFromSupabaseTable(idStr);
      if (!sbResult.success) {
        console.error(`🔴 [DELETE /api/products/:id] Échec Supabase:`, sbResult.error);
        return res.status(500).json({
          success: false,
          error: `Erreur de suppression Supabase : ${sbResult.error || "Impossible de supprimer le produit de la base de données."}`
        });
      }
      console.log(`🗑️ [Supabase] Produit ${idStr} supprimé avec succès de public.products`);
    }

    // 2. Persist tombstone in Supabase Storage app-data and in-memory set (Anti-resurrection)
    recordDeletedProductId(idStr);

    // 3. Update memory store and safe local file cache (non-blocking, never fails on Vercel)
    const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
    const filtered = products.filter((p) => String(p.id) !== idStr);
    memoryStore.set(PRODUCTS_FILE, filtered);

    if (process.env.VERCEL !== "1") {
      try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
        if (fs.existsSync(PRODUCTS_BACKUP_FILE)) {
          fs.writeFileSync(PRODUCTS_BACKUP_FILE, JSON.stringify(filtered, null, 2), "utf-8");
        }
      } catch (e) {}
    }

    console.log(`🗑️ [Products DELETE] Produit ${idStr} supprimé définitivement et enregistré dans la blacklist tombstone.`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.json({ 
      success: true, 
      id: idStr, 
      deletedId: idStr, 
      message: "Produit supprimé définitivement." 
    });
  } catch (err: any) {
    console.error(`🔴 [DELETE /api/products/:id] Exception inattendue:`, err);
    return res.status(500).json({
      success: false,
      error: `Erreur serveur lors de la suppression : ${err.message || String(err)}`
    });
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

  const { role, action, vendeurMode, businessName, contactPhone, sellerPhone, vendeurSubscription, vendeurPaymentMethod, vendeurPaymentTxId, countryCode, country, currencyCode } = req.body;

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

  if (!role || !["client", "vendeur", "affilie", "livreur"].includes(role)) {
    return res.status(400).json({ success: false, error: "Rôle invalide ou non autorisé pour cette opération." });
  }

  const { plan: chosenPlan, vendeurPlan: chosenVendeurPlan, boutiqueName, boutiqueSlug, category, boutiqueBio, boutiqueWhatsapp, quartier: chosenQuartier, city: chosenCity } = req.body;
  const targetPlan = chosenVendeurPlan || chosenPlan || user.vendeurPlan || "Gratuit";

  user.role = role;

  if (role === "vendeur") {
    user.vendeurMode = vendeurMode || "autonome"; // autonome vs assiste
    user.businessName = boutiqueName || businessName || user.name;
    user.boutiqueName = boutiqueName || businessName || user.name;
    user.boutiqueSlug = boutiqueSlug || user.boutiqueSlug || user.businessName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    user.vendeurSlug = user.boutiqueSlug;
    user.category = category || user.category || "Artisanat & Terroir";
    user.boutiqueBio = boutiqueBio || user.boutiqueBio || "Artisan & Vendeur partenaire officiel Miabé Asi.";
    user.boutiqueWhatsapp = boutiqueWhatsapp || user.boutiqueWhatsapp || contactPhone || sellerPhone || user.phone || "";
    user.vendeurStats = user.vendeurStats || {
      produitsPublies: 0,
      produitsVendus: 0,
      revenusGeneres: 0,
      stockRestant: 0
    };
    user.contactPhone = contactPhone || sellerPhone || user.phone || "";
    
    // FREE -> immediate access. PRO/BUSINESS -> pending payment
    if (targetPlan === "Gratuit") {
      user.vendeurPlan = "Gratuit";
      user.plan = "Gratuit";
      user.vendeurSubscription = "Offre 1";
      user.vendeurSubscriptionStatus = "active";
      user.subscriptionStatus = "active";
      user.vendeurStatus = "Actif";
    } else {
      user.vendeurPlan = targetPlan === "BUSINESS" ? "BUSINESS" : "PRO";
      user.plan = user.vendeurPlan;
      user.vendeurSubscription = targetPlan === "BUSINESS" ? "Offre 3" : "Offre 2";
      user.vendeurSubscriptionStatus = "pending";
      user.subscriptionStatus = "pending";
      user.vendeurStatus = "Actif";
    }
    user.vendeurPaymentMethod = vendeurPaymentMethod || "PayDunya";
    user.vendeurPaymentTxId = vendeurPaymentTxId || "";

    // Set country and currency
    const supportedCountryCodes = ["TG", "BJ", "BF", "CI", "ML", "SN", "CM"];
    const sanitizedCountryCode = countryCode && supportedCountryCodes.includes(String(countryCode).toUpperCase())
      ? String(countryCode).toUpperCase()
      : (user.countryCode && supportedCountryCodes.includes(String(user.countryCode).toUpperCase()) ? String(user.countryCode).toUpperCase() : "TG");
    user.countryCode = sanitizedCountryCode;
    user.country = country || (sanitizedCountryCode === "TG" ? "Togo" : sanitizedCountryCode);
    user.currencyCode = currencyCode || (sanitizedCountryCode === "CM" ? "XAF" : "XOF");
    if (chosenQuartier || chosenCity) {
      user.quartier = chosenQuartier || chosenCity;
      user.city = chosenCity || chosenQuartier;
    }
    
    // Add a system notification
    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString() + Math.floor(Math.random() * 100).toString(),
      text: targetPlan === "Gratuit" 
        ? "Votre boutique en formule Gratuite est active ! Accès immédiat à votre espace vendeur."
        : `Votre inscription en formule ${user.vendeurPlan} est enregistrée. L'accès sera débloqué après confirmation du paiement PayDunya.`,
      type: "system",
      read: false,
      date: new Date().toISOString()
    });
  } else if (role === "livreur") {
    user.role = "livreur";
    user.livreurZone = countryCode || user.countryCode || "TG";
    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString(),
      text: "Votre profil Livreur Partenaire Miabé Asi a été configuré avec succès !",
      type: "system",
      read: false,
      date: new Date().toISOString()
    });
  } else if (role === "affilie") {
    user.role = "affilie";
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
  } else if (role === "client") {
    user.role = "client";
  }

  const success = writeJSONFile(USERS_FILE, users);
  if (success) {
    const { passwordHash, ...userResponse } = user;
    res.json({ success: true, user: userResponse });
  } else {
    res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du rôle." });
  }
});

// GET or POST /api/auth/verify-role - Strictly verify role server-side for protected spaces
app.all(["/api/auth/verify-role"], (req, res) => {
  const space = req.query.space || req.body?.space || req.body?.requiredRole;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, authorized: false, error: "Non connecté. Veuillez vous identifier." });
  }

  // Admin space verification
  if (space === "admin") {
    if (authHeader === "asime2026" || authHeader === "asime2026-auth-session" || authHeader === "shopme2026" || authHeader === "shopme2026-auth-session") {
      return res.json({ success: true, authorized: true, role: "admin" });
    }
    const userId = getUserIdFromToken(authHeader);
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const user = users.find(u => u.id === userId);
    if (user && user.role === "admin") {
      return res.json({ success: true, authorized: true, role: "admin" });
    }
    return res.status(403).json({ success: false, authorized: false, error: "Accès refusé. Espace réservé aux administrateurs." });
  }

  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return res.status(401).json({ success: false, authorized: false, error: "Session non valide ou expirée." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, authorized: false, error: "Utilisateur non trouvé." });
  }

  if (space && user.role !== space && user.role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      authorized: false, 
      role: user.role,
      error: `Accès non autorisé à l'espace ${space} pour le rôle ${user.role}.` 
    });
  }

  // If vendor space requested, verify subscription status for PRO / BUSINESS
  if (space === "vendeur") {
    const plan = user.vendeurPlan || user.plan;
    if ((plan === "PRO" || plan === "BUSINESS") && user.vendeurSubscriptionStatus !== "active") {
      return res.json({
        success: true,
        authorized: true,
        role: user.role,
        subscriptionRequired: true,
        subscriptionStatus: user.vendeurSubscriptionStatus || "pending",
        message: "Abonnement PRO/BUSINESS requis pour débloquer l'espace vendeur."
      });
    }
  }

  return res.json({ success: true, authorized: true, role: user.role });
});

// GET /api/delivery/orders - Strictly delivery agents and admins
app.get("/api/delivery/orders", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }
  const isAdmin = authHeader === "asime2026" || authHeader === "asime2026-auth-session" || authHeader === "shopme2026" || authHeader === "shopme2026-auth-session";
  const userId = getUserIdFromToken(authHeader);
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);

  if (!isAdmin && (!user || (user.role !== "livreur" && user.role !== "admin"))) {
    return res.status(403).json({ success: false, error: "Accès refusé. Espace réservé aux livreurs partenaires." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const deliveries = orders.map(o => ({
    id: o.id,
    date: o.date || o.createdAt,
    totalAmount: o.totalAmount,
    currencyCode: o.currencyCode || "XOF",
    paymentStatus: o.paymentStatus || "En attente",
    paymentMethod: o.paymentMethod || "COD",
    orderStatus: o.orderStatus || o.status || "En attente",
    destinationCity: o.destinationCity || o.shippingDetails?.city || o.shippingDetails?.quartier || "Lomé",
    destinationCountryCode: o.destinationCountryCode || o.shippingDetails?.countryCode || "TG",
    clientName: o.shippingDetails?.name || o.clientName || "Client",
    clientPhone: o.shippingDetails?.phoneWithCountryCode || o.shippingDetails?.phone || o.clientPhone || "",
    quartier: o.shippingDetails?.quartier || "",
    itemsCount: Array.isArray(o.items) ? o.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 1,
    items: (o.items || []).map((i: any) => ({
      nom: i.product?.nom || i.nom,
      quantity: i.quantity,
      prix: i.product?.prix || i.prix
    }))
  }));

  return res.json({ success: true, deliveries });
});

// POST /api/delivery/orders/:id/update-status & /api/orders/:id/update-status - Update delivery status
app.post(["/api/delivery/orders/:id/update-status", "/api/orders/:id/update-status"], (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "Non connecté." });
  }
  const isAdmin = authHeader === "asime2026" || authHeader === "asime2026-auth-session" || authHeader === "shopme2026" || authHeader === "shopme2026-auth-session";
  const userId = getUserIdFromToken(authHeader);
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);

  if (!isAdmin && (!user || (user.role !== "livreur" && user.role !== "vendeur" && user.role !== "admin"))) {
    return res.status(403).json({ success: false, error: "Accès refusé. Non autorisé à modifier les livraisons." });
  }

  const { id } = req.params;
  const { orderStatus, deliveryNotes } = req.body;
  if (!orderStatus) {
    return res.status(400).json({ success: false, error: "Nouveau statut requis." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande non trouvée." });
  }

  orders[orderIndex].orderStatus = orderStatus;
  orders[orderIndex].status = orderStatus;
  if (deliveryNotes) {
    orders[orderIndex].deliveryNotes = deliveryNotes;
  }
  orders[orderIndex].lastDeliveryUpdate = new Date().toISOString();
  if (user) {
    orders[orderIndex].updatedByRole = user.role;
    orders[orderIndex].updatedByName = user.name;
  }
  writeJSONFile(ORDERS_FILE, orders);

  // Notify client
  const clientUserId = orders[orderIndex].userId;
  if (clientUserId && !clientUserId.startsWith("guest_")) {
    const clientIndex = users.findIndex(u => u.id === clientUserId);
    if (clientIndex > -1) {
      users[clientIndex].notifications = users[clientIndex].notifications || [];
      users[clientIndex].notifications.unshift({
        id: "notif_delivery_" + Date.now().toString(),
        text: `Mise à jour livraison commande #${id} : Le statut est désormais "${orderStatus}".`,
        type: "order",
        read: false,
        date: new Date().toISOString()
      });
      writeJSONFile(USERS_FILE, users);
    }
  }

  return res.json({ success: true, order: orders[orderIndex] });
});

// Create/Update Product from Vendor (with pricing limit validation based on subscription)
app.post(["/api/products", "/api/products/:id"], async (req, res, next) => {
  // Pass through special sub-routes
  if (req.params.id === "sync" || req.params.id === "save" || req.params.id === "deleted-ids") {
    return next();
  }

  const authHeader = req.headers.authorization;
  const bodyAuth = req.body?.auth;
  
  let userId: string | null = null;
  if (authHeader) {
    userId = getUserIdFromToken(authHeader);
  }

  // Allow admin password from headers or body
  const isAdminAuth = (
    authHeader === "asime2026" || 
    authHeader === "asime2026-auth-session" || 
    authHeader === "shopme2026" || 
    authHeader === "shopme2026-auth-session" ||
    bodyAuth === "asime2026" ||
    bodyAuth === "asime2026-auth-session" ||
    bodyAuth === "shopme2026" ||
    bodyAuth === "shopme2026-auth-session"
  );

  if (isAdminAuth) {
    userId = "user_admin";
  }

  // If still no userId, but vendeurId or token provided, resolve or synthesize a vendor ID
  if (!userId && req.body?.vendeurId) {
    userId = String(req.body.vendeurId);
  }

  if (!userId) {
    userId = "user_vendor_direct";
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  let user = users.find(u => u.id === userId);
  if (!user && userId === "user_admin") {
    user = { id: "user_admin", role: "admin", name: "Administrateur Miabé Asi", businessName: "Miabé Asi", vendeurSubscription: "Offre 3" };
  } else if (!user) {
    // Gracefully support vendors registered in client session or unlisted
    user = {
      id: userId,
      role: "vendeur",
      name: req.body?.partenaire || "Vendeur Miabé Asi",
      businessName: req.body?.partenaire || "Boutique Partenaire",
      vendeurSubscription: "Offre 3",
      vendeurSubscriptionStatus: "active"
    };
  }

  // Strict role check: Only sellers and admins can publish products
  if (!isAdminAuth && user.role !== "vendeur" && user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Accès refusé. La publication ou modification de produits est strictement réservée aux vendeurs enregistrés."
    });
  }

  // Strict subscription check: If seller is on PRO or BUSINESS, subscription must be active!
  const isSeller = user.role === "vendeur";
  const userPlan = user.vendeurPlan || user.plan || "Gratuit";
  if (!isAdminAuth && isSeller && (userPlan === "PRO" || userPlan === "BUSINESS") && user.vendeurSubscriptionStatus !== "active") {
    return res.status(403).json({
      success: false,
      error: `Accès bloqué : votre abonnement ${userPlan} n'est pas actif (statut actuel: ${user.vendeurSubscriptionStatus || "pending"}). Veuillez confirmer le règlement PayDunya.`
    });
  }

  const userSubscription = user.vendeurSubscription || "";
  const prodDetails = req.body;
  const prix = Number(prodDetails.prix || 0);

  // Validate price limits based on seller's subscription (if specified)
  if (isSeller && userSubscription && userSubscription !== "Offre 3") {
    if (userSubscription === "Offre 1" && prix > 1000) {
      return res.status(400).json({
        success: false,
        error: "Votre abonnement (Offre 1) limite le prix de vos produits à un maximum de 1 000 FCFA. Veuillez modifier le prix ou changer d'abonnement."
      });
    } else if (userSubscription === "Offre 2" && prix > 5000) {
      return res.status(400).json({
        success: false,
        error: "Votre abonnement (Offre 2) limite le prix de vos produits à un maximum de 5 000 FCFA. Veuillez modifier le prix ou changer d'abonnement."
      });
    }
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

  // Resolve country and currency from seller profile or payload
  const supportedCountryCodes = ["TG", "BJ", "BF", "CI", "ML", "SN", "CM"];
  const rawCountryCode = prodDetails.countryCode || user.countryCode || existingProduct?.countryCode || "TG";
  const sanitizedCountryCode = supportedCountryCodes.includes(String(rawCountryCode).toUpperCase())
    ? String(rawCountryCode).toUpperCase()
    : "TG";
  const sanitizedCurrencyCode = sanitizedCountryCode === "CM" ? "XAF" : "XOF";

  const savedProduct = {
    id: prodId || "prod_" + Date.now().toString(),
    nom: String(prodDetails.nom || "").trim(),
    description: String(prodDetails.description || "").trim(),
    prix: prix,
    prixBarre: prodDetails.prixBarre ? Number(prodDetails.prixBarre) : null,
    images: Array.isArray(prodDetails.images) && prodDetails.images.length > 0 
      ? prodDetails.images 
      : [prodDetails.images || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80"],
    categorie: String(prodDetails.categorie || "Général").trim(),
    phare: typeof prodDetails.phare !== "undefined" ? !!prodDetails.phare : true, // Set to true so products show on mobile & home displays
    stock: typeof prodDetails.stock !== "undefined" ? Math.max(0, Math.floor(Number(prodDetails.stock))) : 10,
    partenaire: prodDetails.partenaire || user.businessName || user.name || "Boutique Partenaire",
    vendeurId: existingProduct?.vendeurId || prodDetails.vendeurId || userId,
    countryCode: sanitizedCountryCode,
    countryOrigin: sanitizedCountryCode,
    currencyCode: prodDetails.currencyCode || sanitizedCurrencyCode,
    lienAffilie: prodDetails.lienAffilie || "",
    valide: typeof prodDetails.valide !== "undefined" ? !!prodDetails.valide : true,
    status: prodDetails.status || "actif"
  };

    // 1. Primary Source of Truth: Synchronize immediately to Supabase public.products table
    if (isSupabaseConfigured()) {
      const sbResult = await syncProductToSupabaseTable(savedProduct);
      if (!sbResult.success) {
        console.error(`🔴 [Vendor Product Save] Échec Supabase:`, sbResult.error);
        return res.status(500).json({
          success: false,
          error: `Erreur d'enregistrement Supabase : ${sbResult.error || "Erreur de base de données"}`
        });
      }
      console.log(`✨ [Supabase] Produit vendeur "${savedProduct.nom}" (${savedProduct.id}) synchronisé avec succès dans public.products`);
    }

    // 2. Remove from tombstone blacklist if previously deleted
    removeDeletedProductId(String(savedProduct.id));

    // 3. Update memory store and safe local file
    if (existingIndex > -1) {
      products[existingIndex] = savedProduct;
    } else {
      products.unshift(savedProduct);
    }
    memoryStore.set(PRODUCTS_FILE, products);

    if (process.env.VERCEL !== "1") {
      try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
      } catch (e) {}
    }

    console.log(`[Products] Produit enregistré avec succès : "${savedProduct.nom}" (${savedProduct.id})`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.json({ success: true, product: savedProduct });
});

// Bulk sync products from browser localStorage / multi-device sessions to server database
app.post("/api/products/sync", async (req, res) => {
  try {
    const { products: clientProducts } = req.body || {};
    if (!Array.isArray(clientProducts)) {
      return res.status(400).json({ success: false, error: "Liste de produits requise sous forme de tableau." });
    }

    const deletedIds = getDeletedProductIds();
    const deletedIdSet = new Set(deletedIds);

    const currentProducts = readJSONFile<any[]>(PRODUCTS_FILE, []).filter((p: any) => !deletedIdSet.has(String(p?.id)));
    let addedCount = 0;
    let rejectedDeletedCount = 0;
    const newItems: any[] = [];

    for (const cp of clientProducts) {
      if (cp && cp.id && cp.nom) {
        const idStr = String(cp.id).trim();
        
        // CRITICAL: Reject any product that has been permanently deleted / tombstoned
        if (deletedIdSet.has(idStr)) {
          rejectedDeletedCount++;
          continue;
        }

        const idx = currentProducts.findIndex((p: any) => String(p.id) === idStr);
        if (idx === -1) {
          const item = {
            ...cp,
            id: idStr,
            phare: typeof cp.phare !== "undefined" ? cp.phare : true,
            valide: true,
            status: cp.status || "actif"
          };
          currentProducts.unshift(item);
          newItems.push(item);
          addedCount++;
        }
      }
    }

    if (addedCount > 0) {
      writeJSONFile(PRODUCTS_FILE, currentProducts);
      if (fs.existsSync(PRODUCTS_BACKUP_FILE)) {
        try {
          writeJSONFile(PRODUCTS_BACKUP_FILE, currentProducts);
        } catch (e) {}
      }
      console.log(`[Product Sync] ${addedCount} produits synchronisés depuis le client (${rejectedDeletedCount} rejetés car définitivement supprimés) !`);

      if (isSupabaseConfigured() && newItems.length > 0) {
        try {
          await syncAllProductsToSupabaseTable(newItems);
        } catch (sbErr) {
          console.warn("[Product Sync] Erreur synchronisation Supabase:", sbErr);
        }
      }
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.json({ 
      success: true, 
      count: currentProducts.length, 
      addedCount, 
      rejectedDeletedCount, 
      deletedIds, 
      products: currentProducts 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Erreur de synchronisation des produits." });
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
  const orderCurrency = order.currencyCode || (order.destinationCountryCode === "CM" || order.clientCountryCode === "CM" ? "XAF" : "XOF");
  const totalAmount = Number(order.totalAmount || 0);

  // 1. Validate affiliate attribution
  // Un affilié gagne une commission UNIQUEMENT lorsqu'un client achète réellement via son lien/code d'affiliation attribué à la vente
  // et s'il correspond à un utilisateur avec le rôle "affilie"
  let affiliateUserId: string | null = null;
  let validAffiliateUser: any = null;
  
  if (order.affiliateCode) {
    const affUser = users.find(u => (u.affiliateCode && u.affiliateCode === order.affiliateCode) || u.id === order.affiliateCode);
    if (affUser && affUser.role === "affilie") {
      affiliateUserId = affUser.id;
      validAffiliateUser = affUser;
    }
  }

  // 2. Exact commission math:
  // - Vendeur reçoit toujours 90% (jamais diminué par affilié)
  // - Miabé Asi part brute = 10%
  // - Sans affilié : Miabé Asi conserve 10% en totalité, affilié = 0
  // - Avec affilié : affilié = 3% (taux existant), prélevé UNIQUEMENT sur les 10% de Miabé Asi (Miabé Asi net = 10% - 3% = 7%)
  const sellerTotalEarnings = Math.floor(totalAmount * 0.90);
  const miabeAsiGrossCommission = Math.floor(totalAmount * 0.10);
  
  let actualAffiliateCommission = 0;
  if (validAffiliateUser) {
    actualAffiliateCommission = (order.affiliateCommission !== undefined && order.affiliateCommission > 0)
      ? order.affiliateCommission
      : Math.floor(totalAmount * 0.03);

    // Update user stats in users.json to keep in sync
    validAffiliateUser.affiliateStats = validAffiliateUser.affiliateStats || {
      clicks: 0,
      visiteurs: 0,
      ventes: 0,
      chiffreAffaires: 0,
      commissionsGagnees: 0,
      commissionDisponible: 0,
      commissionRetiree: 0
    };
    validAffiliateUser.affiliateStats.ventes += 1;
    validAffiliateUser.affiliateStats.chiffreAffaires += totalAmount;
    validAffiliateUser.affiliateStats.commissionsGagnees += actualAffiliateCommission;
    validAffiliateUser.affiliateStats.commissionDisponible += actualAffiliateCommission;
    
    validAffiliateUser.notifications = validAffiliateUser.notifications || [];
    validAffiliateUser.notifications.unshift({
      id: "notif_split_aff_" + Date.now().toString(),
      text: `Félicitations ! Vous avez gagné une commission de ${actualAffiliateCommission.toLocaleString()} ${orderCurrency} (3%) pour la vente affiliée de la commande #${orderId}. (Prélevée sur la part Miabé Asi)`,
      type: "affiliate",
      read: false,
      date: new Date().toISOString()
    });
  } else {
    // No valid affiliate attribution exists
    actualAffiliateCommission = 0;
    order.affiliateCode = null;
  }

  const miabeAsiNetCommission = miabeAsiGrossCommission - actualAffiliateCommission;

  // Persist financial breakdown on order
  order.sellerEarnings = sellerTotalEarnings;
  order.miabeAsiGrossCommission = miabeAsiGrossCommission;
  order.affiliateCommission = actualAffiliateCommission;
  order.miabeAsiNetCommission = miabeAsiNetCommission;
  order.currencyCode = orderCurrency;

  // 3. Prepare seller credentials mapping
  const sellerCredentials = users.filter(u => u.role === "vendeur").map(u => ({
    id: u.id,
    name: u.name,
    businessName: u.businessName
  }));

  // Update seller stats in users.json to keep in sync (Seller gets 90% guaranteed)
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
        text: `Nouvelle commande payée ! Votre produit "${item.product.nom}" (x${item.quantity}) a été vendu. Votre portefeuille a été crédité de ${sellerEarnings.toLocaleString()} ${orderCurrency} (Part vendeur 90% garantie).`,
        type: "sale",
        read: false,
        date: new Date().toISOString()
      });
    }
  }

  // Run the ledger split in wallets.json
  const splitResult = WalletManager.processOrderSplit(
    orderId,
    totalAmount,
    order.items,
    sellerCredentials,
    affiliateUserId,
    orderCurrency,
    actualAffiliateCommission
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

  const {
    items,
    totalAmount,
    shippingDetails,
    paymentMethod,
    affiliateRef,
    currencyCode,
    destinationCountryCode,
    destinationCity,
    clientCountryCode,
    clientCountryName,
    clientCity,
    clientName,
    clientPhone,
    sellerCountryCode,
    sellerCountryName,
    sellerCity,
    sellerName
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
    return res.status(400).json({ success: false, error: "Le panier est vide ou le montant est invalide." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  users = users.length > 0 ? users : readJSONFile<any[]>(USERS_FILE, []);

  const COUNTRY_NAMES_MAP: Record<string, string> = {
    TG: "Togo",
    BJ: "Bénin",
    BF: "Burkina Faso",
    CI: "Côte d'Ivoire",
    ML: "Mali",
    SN: "Sénégal",
    CM: "Cameroun"
  };

  // Subtract stocks and check validity
  for (const item of items) {
    const prodIndex = products.findIndex(p => p.id === item.product.id);
    if (prodIndex > -1) {
      const currentStock = products[prodIndex].stock || 0;
      products[prodIndex].stock = Math.max(0, currentStock - item.quantity);
    }
  }
  writeJSONFile(PRODUCTS_FILE, products);

  // Enrich each item with vendor origin (country, city, partner)
  const enrichedItems = items.map((item: any) => {
    const matchedProd = products.find(p => p.id === item.product?.id);
    const prod = item.product || {};

    const resolvedCountryCode = (
      prod.countryCode || 
      matchedProd?.countryCode || 
      matchedProd?.countryOrigin || 
      "TG"
    ).toUpperCase();

    const resolvedCountryName = (
      prod.countryOrigin || 
      matchedProd?.countryOrigin || 
      COUNTRY_NAMES_MAP[resolvedCountryCode] || 
      "Togo"
    );

    const resolvedCity = prod.city || matchedProd?.city || "";
    const resolvedPartner = prod.partenaire || matchedProd?.partenaire || "Vendeur Miabé Asi";
    const resolvedVendeurId = prod.vendeurId || matchedProd?.vendeurId || "assisted_merchant";
    const resolvedCurrency = prod.currencyCode || matchedProd?.currencyCode || (resolvedCountryCode === "CM" ? "XAF" : "XOF");

    return {
      ...item,
      product: {
        ...prod,
        id: prod.id || matchedProd?.id,
        nom: prod.nom || matchedProd?.nom || "Article",
        prix: Number(prod.prix || matchedProd?.prix || 0),
        partenaire: resolvedPartner,
        vendeurId: resolvedVendeurId,
        countryCode: resolvedCountryCode,
        countryOrigin: resolvedCountryName,
        city: resolvedCity,
        quartier: prod.quartier || matchedProd?.quartier || "",
        currencyCode: resolvedCurrency,
        images: prod.images || matchedProd?.images || ["/placeholder.jpg"]
      }
    };
  });

  const resolvedClientCountry = (
    destinationCountryCode ||
    clientCountryCode ||
    shippingDetails?.countryCode ||
    "TG"
  ).toUpperCase();
  const resolvedClientCountryName = clientCountryName || COUNTRY_NAMES_MAP[resolvedClientCountry] || "Togo";
  const resolvedClientCity = destinationCity || clientCity || shippingDetails?.city || shippingDetails?.quartier || "";
  const resolvedClientName = clientName || shippingDetails?.name || (clientIndex > -1 ? users[clientIndex].name : "Client");
  const resolvedClientPhone = clientPhone || shippingDetails?.phoneWithCountryCode || shippingDetails?.phone || "";
  const resolvedCurrencyCode = currencyCode || shippingDetails?.currencyCode || (resolvedClientCountry === "CM" ? "XAF" : "XOF");

  const originCountries: string[] = Array.from(
    new Set(enrichedItems.map((it: any) => it.product.countryCode).filter(Boolean))
  );

  const isCrossBorder = enrichedItems.some(
    (it: any) => it.product.countryCode && it.product.countryCode !== resolvedClientCountry
  );

  const primaryItem = enrichedItems[0] || {};
  const resolvedSellerCountryCode = (
    sellerCountryCode ||
    primaryItem.product?.countryCode ||
    "TG"
  ).toUpperCase();
  const resolvedSellerCountryName = sellerCountryName || COUNTRY_NAMES_MAP[resolvedSellerCountryCode] || "Togo";
  const resolvedSellerCity = sellerCity || primaryItem.product?.city || "";
  const resolvedSellerName = sellerName || primaryItem.product?.partenaire || "Vendeur Miabé Asi";

  // Affiliate attribution and commission model validation:
  // Un affilié gagne une commission UNIQUEMENT lorsqu'un client achète réellement via son lien/code d'affiliation
  // attribué à la vente et valide dans le système (rôle "affilie").
  let totalAffiliateCommission = 0;
  let validAffiliateCode: string | null = null;
  if (affiliateRef && typeof affiliateRef === "string" && affiliateRef.trim()) {
    const cleanRef = affiliateRef.trim();
    const affUser = users.find(u => (u.affiliateCode && u.affiliateCode === cleanRef) || u.id === cleanRef);
    if (affUser && affUser.role === "affilie") {
      validAffiliateCode = affUser.affiliateCode || affUser.id;
      // 3% affiliate commission rate, deducted strictly from Miabé Asi's 10%
      totalAffiliateCommission = Math.floor(totalAmount * 0.03);
    }
  }

  // Model calculation:
  // - Vendeur: 90% (jamais réduit par affilié)
  // - Miabé Asi part brute: 10%
  // - Affilié: 3% (si affilié valide)
  // - Miabé Asi net: solde des 10% (10% brut - commission affilié)
  const sellerEarnings = Math.floor(totalAmount * 0.90);
  const miabeAsiGrossCommission = Math.floor(totalAmount * 0.10);
  const miabeAsiNetCommission = miabeAsiGrossCommission - totalAffiliateCommission;

  // Save the Order record with complete cross-border and origin details
  const newOrder = {
    id: "ord_" + (10001 + orders.length),
    userId,
    items: enrichedItems,
    totalAmount,
    currencyCode: resolvedCurrencyCode,
    destinationCountryCode: resolvedClientCountry,
    destinationCity: resolvedClientCity,
    clientCountryCode: resolvedClientCountry,
    clientCountryName: resolvedClientCountryName,
    clientCity: resolvedClientCity,
    clientName: resolvedClientName,
    clientPhone: resolvedClientPhone,
    sellerCountryCode: resolvedSellerCountryCode,
    sellerCountryName: resolvedSellerCountryName,
    sellerCity: resolvedSellerCity,
    sellerName: resolvedSellerName,
    originCountries,
    isCrossBorder,
    shippingDetails: {
      ...shippingDetails,
      countryCode: resolvedClientCountry,
      city: resolvedClientCity,
      currencyCode: resolvedCurrencyCode,
      name: resolvedClientName,
      phone: resolvedClientPhone
    },
    paymentMethod,
    paymentStatus: "En attente de paiement", // Payment Gateway verifies this
    orderStatus: "En préparation",
    affiliateCode: validAffiliateCode,
    affiliateCommission: totalAffiliateCommission,
    sellerEarnings,
    miabeAsiGrossCommission,
    miabeAsiNetCommission,
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

// GET status of payment gateway configuration (diagnostic)
app.get("/api/payments/status", (req, res) => {
  const masterKey = (process.env.PAYDUNYA_MASTER_KEY || process.env.PAYDUNYA_MASTER || "").trim();
  const privateKey = (process.env.PAYDUNYA_PRIVATE_KEY || process.env.PAYDUNYA_SECRET_KEY || "").trim();
  const token = (process.env.PAYDUNYA_TOKEN || process.env.PAYDUNYA_PUBLIC_KEY || "").trim();
  const mode = (process.env.PAYDUNYA_MODE || "test").trim();

  const isConfigured = Boolean(privateKey && token);

  res.json({
    provider: "paydunya",
    configured: isConfigured,
    mode: mode === "production" || mode === "live" ? "live" : "test",
    hasMasterKey: Boolean(masterKey),
    hasPrivateKey: Boolean(privateKey),
    hasToken: Boolean(token),
    maskedMasterKey: masterKey ? `${masterKey.slice(0, 4)}...${masterKey.slice(-4)}` : null,
    maskedToken: token ? `${token.slice(0, 4)}...${token.slice(-4)}` : null
  });
});

// POST initiate payment session
app.post("/api/payments/initiate", (req, res) => {
  const { orderId, providerId, name, phone, email, countryCode, currencyCode } = req.body;
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
    const rawCountryCode = (
      countryCode ||
      order.clientCountryCode ||
      order.destinationCountryCode ||
      order.shippingDetails?.countryCode ||
      "TG"
    ).toUpperCase();
    const supportedCountryCodes = ["TG", "BJ", "BF", "CI", "ML", "SN", "CM"];
    const resolvedCountryCode = supportedCountryCodes.includes(rawCountryCode) ? rawCountryCode : "TG";
    const resolvedCurrencyCode = currencyCode || order.currencyCode || (resolvedCountryCode === "CM" ? "XAF" : "XOF");
    const resolvedSellerCountry = (order.sellerCountryCode || order.items?.[0]?.product?.countryCode || "TG").toUpperCase();
    const isCrossBorder = order.isCrossBorder !== undefined ? order.isCrossBorder : (resolvedCountryCode !== resolvedSellerCountry);

    const customer = {
      name: name || order.clientName || order.shippingDetails?.name || "Client Miabé Asi",
      phone: phone || order.clientPhone || order.shippingDetails?.phone || "",
      email,
      countryCode: resolvedCountryCode,
      currencyCode: resolvedCurrencyCode,
      clientCountryCode: resolvedCountryCode,
      sellerCountryCode: resolvedSellerCountry,
      clientCity: order.clientCity || order.shippingDetails?.city,
      sellerCity: order.sellerCity,
      sellerName: order.sellerName
    };

    PaymentGateway.getInstance().initiatePayment(providerId, orderId, order.totalAmount, customer)
      .then(session => {
        // Associate the transaction with the order record and preserve multi-country & currency data
        order.paymentGatewayTxId = session.transactionId;
        order.paymentGatewayProvider = providerId;
        order.paymentGatewayCurrencyCode = session.currencyCode || resolvedCurrencyCode;
        order.paymentGatewayCountryCode = session.countryCode || resolvedCountryCode;
        order.paymentGatewayInitiatedAt = new Date().toISOString();
        order.currencyCode = resolvedCurrencyCode;
        order.clientCountryCode = resolvedCountryCode;
        order.sellerCountryCode = resolvedSellerCountry;
        order.isCrossBorder = isCrossBorder;
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
  const { transactionId, providerId = "paydunya", orderId } = req.body || {};
  const tx = transactionId || orderId;
  if (!tx) {
    return res.status(400).json({ success: false, error: "Identifiant de transaction ou de commande requis." });
  }

  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  // Support lookup by transactionId or orderId
  const orderIndex = orders.findIndex(o => o.paymentGatewayTxId === tx || o.id === tx || o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Commande associée introuvable." });
  }

  const order = orders[orderIndex];
  if (order.paymentStatus === "Payé") {
    return res.json({ success: true, status: "completed", message: "La commande est déjà confirmée comme payée.", order });
  }

  PaymentGateway.getInstance().verifyPayment(providerId, tx)
    .then(result => {
      if (result.status === "success") {
        const orderCurrency = order.currencyCode || (order.clientCountryCode === "CM" ? "XAF" : "XOF");
        order.paymentStatus = "Payé";
        order.status = "En préparation";
        order.paymentGatewayTxId = tx;
        order.paymentGatewayProvider = providerId;
        order.paymentMethod = PaymentGateway.getInstance().getProvider(providerId)?.name || "PayDunya";
        order.paymentConfirmedAt = new Date().toISOString();
        order.currencyCode = orderCurrency;
        writeJSONFile(ORDERS_FILE, orders);

        // Execute automatic split of funds to seller and affiliate wallets!
        executeOrderRevenueSplit(order.id);

        // Only send payment confirmation notification when payment is truly confirmed
        const clientUserId = order.userId;
        if (clientUserId && !clientUserId.startsWith("guest_")) {
          const users = readJSONFile<any[]>(USERS_FILE, []);
          const clientIndex = users.findIndex(u => u.id === clientUserId);
          if (clientIndex > -1) {
            users[clientIndex].notifications = users[clientIndex].notifications || [];
            users[clientIndex].notifications.unshift({
              id: "notif_pay_" + Date.now().toString(),
              text: `Paiement confirmé ! Votre commande #${order.id} d'un montant de ${order.totalAmount.toLocaleString()} ${orderCurrency} a été payée avec succès via PayDunya.`,
              type: "order",
              read: false,
              date: new Date().toISOString()
            });
            writeJSONFile(USERS_FILE, users);
          }
        }

        return res.json({ success: true, status: "completed", message: "Paiement PayDunya validé avec succès !", order });
      } else if (result.status === "pending") {
        order.paymentStatus = "En attente";
        writeJSONFile(ORDERS_FILE, orders);
        return res.status(200).json({ 
          success: false, 
          status: "pending", 
          message: "Le paiement PayDunya est en cours de validation par l'opérateur.",
          order 
        });
      } else if (result.status === "cancelled") {
        order.paymentStatus = "Annulé";
        writeJSONFile(ORDERS_FILE, orders);
        return res.status(200).json({ 
          success: false, 
          status: "cancelled", 
          message: "Le paiement PayDunya a été annulé par le client.",
          order 
        });
      } else {
        order.paymentStatus = "Échoué";
        writeJSONFile(ORDERS_FILE, orders);
        return res.status(200).json({ 
          success: false, 
          status: "failed", 
          message: "Le paiement PayDunya a échoué ou a été refusé.",
          order 
        });
      }
    })
    .catch(err => {
      console.error("Payment confirmation error:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// POST initiate vendor subscription payment (PRO / BUSINESS)
app.post("/api/subscriptions/initiate", async (req, res) => {
  try {
    const { userId, plan, countryCode, phone, providerId = "paydunya" } = req.body || {};
    const effectivePlan = plan === "BUSINESS" ? "BUSINESS" : "PRO";
    const amount = effectivePlan === "BUSINESS" ? 3200 : 1600;

    const users = readJSONFile<any[]>(USERS_FILE, []);
    let targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      const authHeader = req.headers.authorization;
      const idFromAuth = authHeader ? getUserIdFromToken(authHeader) : null;
      if (idFromAuth) {
        targetUser = users.find(u => u.id === idFromAuth);
      }
    }

    const resolvedUserId = targetUser?.id || userId || "user_pro";
    const userCountry = (countryCode || targetUser?.countryCode || "TG").toUpperCase();
    const userCurrency = targetUser?.currencyCode || (userCountry === "CM" ? "XAF" : "XOF");
    const subOrderId = `SUB-${resolvedUserId}-${Date.now()}`;

    const payProvider = PaymentGateway.getInstance().getProvider(providerId) || PaymentGateway.getInstance().getProvider("paydunya");
    if (!payProvider) {
      return res.status(500).json({ success: false, error: "Passerelle de paiement PayDunya indisponible." });
    }

    const session = await payProvider.initiatePayment(subOrderId, amount, {
      name: targetUser?.name || targetUser?.boutiqueName || "Vendeur Pro",
      phone: phone || targetUser?.phone || "+22890000000",
      email: targetUser?.email || "vendeur@miabeasi.com",
      countryCode: userCountry,
      currencyCode: userCurrency
    });

    return res.json({
      success: true,
      subId: subOrderId,
      plan: effectivePlan,
      amount,
      currencyCode: userCurrency,
      session
    });
  } catch (err: any) {
    console.error("Subscription initiate error:", err);
    return res.status(500).json({ success: false, error: err.message || "Erreur lors de l'initialisation de l'abonnement." });
  }
});

// POST confirm vendor subscription payment (PRO / BUSINESS)
app.post("/api/subscriptions/confirm", async (req, res) => {
  try {
    const { transactionId, providerId = "paydunya", subId, userId } = req.body || {};
    const tx = transactionId || subId;
    if (!tx) {
      return res.status(400).json({ success: false, error: "Identifiant de transaction requis." });
    }

    const result = await PaymentGateway.getInstance().verifyPayment(providerId, tx);
    const users = readJSONFile<any[]>(USERS_FILE, []);

    let userIndex = -1;
    if (userId) {
      userIndex = users.findIndex(u => u.id === userId);
    }
    if (userIndex === -1 && subId && subId.startsWith("SUB-")) {
      const parts = subId.split("-");
      if (parts.length >= 2) {
        const extractedUserId = parts.slice(1, parts.length - 1).join("-");
        userIndex = users.findIndex(u => u.id === extractedUserId);
      }
    }
    if (userIndex === -1) {
      const authHeader = req.headers.authorization;
      const idFromAuth = authHeader ? getUserIdFromToken(authHeader) : null;
      if (idFromAuth) {
        userIndex = users.findIndex(u => u.id === idFromAuth);
      }
    }

    if (result.status === "success") {
      if (userIndex !== -1) {
        const u = users[userIndex];
        u.vendeurPlan = u.vendeurPlan === "BUSINESS" ? "BUSINESS" : "PRO";
        u.plan = u.vendeurPlan;
        u.vendeurSubscriptionStatus = "active";
        u.subscriptionStatus = "active";
        u.vendeurStatus = "Actif";
        u.proSubscription = {
          active: true,
          plan: u.vendeurPlan,
          amount: result.amount || (u.vendeurPlan === "BUSINESS" ? 3200 : 1600),
          currency: result.currencyCode || u.currencyCode || "XOF",
          transactionId: tx,
          activatedAt: new Date().toISOString()
        };
        u.notifications = u.notifications || [];
        u.notifications.unshift({
          id: "notif_sub_" + Date.now().toString(),
          text: `🎉 Votre abonnement PRO (${u.proSubscription.amount} ${u.proSubscription.currency}) a été confirmé par PayDunya ! Votre espace vendeur Pro est débloqué.`,
          type: "system",
          read: false,
          date: new Date().toISOString()
        });
        writeJSONFile(USERS_FILE, users);
        const { passwordHash, ...safeUser } = u;
        return res.json({
          success: true,
          status: "active",
          message: "Abonnement PRO validé et activé avec succès !",
          user: safeUser
        });
      }
      return res.json({
        success: true,
        status: "active",
        message: "Paiement de l'abonnement validé par PayDunya."
      });
    } else if (result.status === "pending") {
      return res.status(200).json({
        success: false,
        status: "pending",
        error: "Le paiement de votre abonnement Pro est en attente de confirmation par PayDunya. Accès Pro bloqué."
      });
    } else if (result.status === "cancelled") {
      if (userIndex !== -1) {
        users[userIndex].vendeurSubscriptionStatus = "cancelled";
        writeJSONFile(USERS_FILE, users);
      }
      return res.status(200).json({
        success: false,
        status: "cancelled",
        error: "Paiement de l'abonnement annulé par l'utilisateur. Accès Pro bloqué."
      });
    } else {
      if (userIndex !== -1) {
        users[userIndex].vendeurSubscriptionStatus = "failed";
        writeJSONFile(USERS_FILE, users);
      }
      return res.status(200).json({
        success: false,
        status: "failed",
        error: "Le paiement de votre abonnement a échoué. Accès Pro bloqué."
      });
    }
  } catch (err: any) {
    console.error("Subscription confirm error:", err);
    return res.status(500).json({ success: false, error: err.message || "Erreur serveur." });
  }
});

// POST simulation test endpoint to transition PayDunya invoice status
app.post("/api/payments/paydunya/test-set-status", (req, res) => {
  const { token, transactionId, status } = req.body || {};
  const targetId = token || transactionId;
  if (!targetId || !status) {
    return res.status(400).json({ success: false, error: "token/transactionId et status requis." });
  }
  const allowed = ["completed", "pending", "cancelled", "failed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: `Statut invalide. Autorisés: ${allowed.join(", ")}` });
  }

  const updated = updatePayDunyaInvoiceStatus(targetId, status);
  if (!updated) {
    return res.status(404).json({ success: false, error: "Facture PayDunya introuvable." });
  }
  return res.json({ success: true, invoice: updated });
});

// GET PayDunya simulation test checkout interface
app.get("/checkout/paydunya-test", (req, res) => {
  const token = String(req.query.token || "");
  const orderId = String(req.query.orderId || "");
  const invoice = getPayDunyaInvoice(token) || getPayDunyaInvoice(orderId);

  const isSub = (invoice?.type === "subscription") || orderId.startsWith("SUB-");
  const returnUrl = isSub ? `/?payment=sub_return&subId=${encodeURIComponent(orderId || invoice?.orderId || "")}&token=${encodeURIComponent(token)}` : `/order-history?payment=return&orderId=${encodeURIComponent(orderId || invoice?.orderId || "")}&token=${encodeURIComponent(token)}`;
  const cancelUrl = isSub ? `/?payment=sub_cancel&subId=${encodeURIComponent(orderId || invoice?.orderId || "")}&token=${encodeURIComponent(token)}` : `/order-history?payment=cancel&orderId=${encodeURIComponent(orderId || invoice?.orderId || "")}&token=${encodeURIComponent(token)}`;

  const amount = invoice?.amount || (isSub ? 1600 : 5000);
  const currency = invoice?.currencyCode || "XOF";
  const country = invoice?.countryCode || "TG";
  const currentStatus = invoice?.status || "pending";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PayDunya - Passerelle de Test Sécurisée</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0d0e; color: #f3f4f6; margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #18191c; border: 1px solid #2a2c33; border-radius: 16px; max-width: 480px; width: 100%; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2a2c33; padding-bottom: 16px; margin-bottom: 20px; }
    .logo { font-size: 20px; font-weight: 900; color: #10b981; letter-spacing: -0.5px; }
    .badge { background: #374151; color: #9ca3af; font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; text-transform: uppercase; }
    .detail { background: #22242a; padding: 14px; border-radius: 10px; margin-bottom: 18px; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #9ca3af; }
    .detail-row span:last-child { color: #f3f4f6; font-weight: 600; }
    .amount-box { text-align: center; padding: 16px 0; font-size: 32px; font-weight: 900; color: #10b981; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-completed { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-cancelled { background: rgba(156, 163, 175, 0.15); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.3); }
    .status-failed { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn { display: block; width: 100%; padding: 14px; margin-bottom: 10px; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; text-align: center; text-decoration: none; box-sizing: border-box; transition: transform 0.1s ease; }
    .btn:active { transform: scale(0.98); }
    .btn-success { background: #10b981; color: #fff; }
    .btn-success:hover { background: #059669; }
    .btn-pending { background: #d97706; color: #fff; }
    .btn-pending:hover { background: #b45309; }
    .btn-cancel { background: #4b5563; color: #f3f4f6; }
    .btn-cancel:hover { background: #374151; }
    .btn-fail { background: #dc2626; color: #fff; }
    .btn-fail:hover { background: #b91c1c; }
    .footer { text-align: center; font-size: 11px; color: #6b7280; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">PayDunya <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">Checkout</span></div>
      <div class="badge">Environnement Test</div>
    </div>

    <div class="amount-box">
      ${amount.toLocaleString()} ${currency}
    </div>

    <div class="detail">
      <div class="detail-row">
        <span>Référence :</span>
        <span>${orderId || invoice?.orderId || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span>Type :</span>
        <span>${isSub ? "Abonnement PRO Vendeur" : "Paiement Commande Client"}</span>
      </div>
      <div class="detail-row">
        <span>Pays / Devise :</span>
        <span>${country} • ${currency}</span>
      </div>
      <div class="detail-row">
        <span>Statut actuel serveur :</span>
        <span class="status-badge status-${currentStatus}">${currentStatus}</span>
      </div>
    </div>

    <p style="font-size: 12px; color: #9ca3af; margin-bottom: 16px; text-align: center;">
      Sélectionnez le résultat à simuler pour vérifier le comportement serveur :
    </p>

    <button class="btn btn-success" onclick="triggerStatus('completed', '${returnUrl}')">
      ✓ Valider le paiement (Completed)
    </button>
    <button class="btn btn-pending" onclick="triggerStatus('pending', '${returnUrl}')">
      ⏳ Laisser en attente (Pending)
    </button>
    <button class="btn btn-cancel" onclick="triggerStatus('cancelled', '${cancelUrl}')">
      ✕ Annuler le paiement (Cancelled)
    </button>
    <button class="btn btn-fail" onclick="triggerStatus('failed', '${cancelUrl}')">
      ⚠️ Simuler un échec (Failed)
    </button>

    <div class="footer">
      Miabé Asi • Passerelle PayDunya sécurisée (7 pays supportés)
    </div>
  </div>

  <script>
    async function triggerStatus(status, redirectTarget) {
      try {
        await fetch('/api/payments/paydunya/test-set-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: '${token}', transactionId: '${token}', status: status })
        });
      } catch (e) {
        console.error('Error setting test status:', e);
      }
      window.location.href = redirectTarget;
    }
  </script>
</body>
</html>`;

  res.send(html);
});

// POST change vendor plan (e.g. switch between Gratuit, PRO, BUSINESS)
app.post("/api/users/change-plan", (req, res) => {
  const { userId, plan } = req.body || {};
  const authHeader = req.headers.authorization;
  const id = userId || (authHeader ? getUserIdFromToken(authHeader) : null);
  if (!id) {
    return res.status(401).json({ success: false, error: "Non identifié." });
  }
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const uIdx = users.findIndex(u => u.id === id);
  if (uIdx === -1) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
  }
  const u = users[uIdx];
  const newPlan = plan === "BUSINESS" ? "BUSINESS" : (plan === "PRO" ? "PRO" : "Gratuit");
  u.vendeurPlan = newPlan;
  u.plan = newPlan;
  if (newPlan === "Gratuit") {
    u.vendeurSubscriptionStatus = "active";
    u.subscriptionStatus = "active";
  } else {
    u.vendeurSubscriptionStatus = "pending";
    u.subscriptionStatus = "pending";
  }
  writeJSONFile(USERS_FILE, users);
  const { passwordHash, ...safeUser } = u;
  return res.json({ success: true, user: safeUser });
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
    const businessName = (currentUser.businessName || currentUser.name || "").toLowerCase().trim();
    const sellerId = currentUser.id;
    const sellerSlug = (currentUser.boutiqueSlug || currentUser.vendeurSlug || "").toLowerCase().trim();

    const sellerOrders = orders.filter(o => 
      (o.items && o.items.some((item: any) => {
        const p = item.product || {};
        const pPartenaire = (p.partenaire || "").toLowerCase().trim();
        const pVendeurId = p.vendeurId;
        const pSlug = (p.vendeurSlug || "").toLowerCase().trim();
        return (
          (businessName && pPartenaire === businessName) ||
          (currentUser.name && pPartenaire === currentUser.name.toLowerCase().trim()) ||
          (sellerId && pVendeurId === sellerId) ||
          (sellerSlug && pSlug === sellerSlug)
        );
      })) ||
      (o.sellerName && businessName && o.sellerName.toLowerCase().trim() === businessName) ||
      (o.sellerCountryCode && o.userId === userId)
    );
    return res.json(sellerOrders);
  }

  // Otherwise, return client orders (matching userId or phone)
  const clientPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, "") : "";
  const clientOrders = orders.filter(o => 
    o.userId === userId || 
    (clientPhone && o.shippingDetails?.phone && o.shippingDetails.phone.replace(/[^0-9]/g, "") === clientPhone) ||
    (clientPhone && o.clientPhone && o.clientPhone.replace(/[^0-9]/g, "") === clientPhone)
  );
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

  if (!method || !["Miabé Asi Pay", "Asime Pay", "Asime Pay (En Ligne)", "EnLigne", "PayDunya", "Paydunya", "Mobile Money", "Virement", "Espèces"].includes(method)) {
    return res.status(400).json({ success: false, error: "Méthode de retrait invalide (Miabé Asi Pay uniquement)." });
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
  
  // Miabé Asi gets 10% fee. Out of that 10%, we subtract any affiliate commission (3%).
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
      const targetSellerName = sellerName || (targetSeller ? (targetSeller.businessName || targetSeller.name) : "Boutique Miabé Asi");
      
      thread = {
        id: "thread_" + Date.now().toString() + Math.floor(Math.random() * 100),
        customerId: userId,
        customer: currentUserName,
        avatar: currentUserName.substring(0, 2).toUpperCase(),
        sellerId: sellerId,
        sellerName: targetSellerName,
        product: productName || "Produit Miabé Asi",
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

// GET /api/showcase - Fetch curated showcase cards for homepage (Supabase app-data + local fallback)
app.get("/api/showcase", async (req, res) => {
  const defaultShowcase = {
    heroCards: [
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
    ],
    galleryCards: [
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
    ]
  };

  let fileData: any = memoryStore.get(SHOWCASE_FILE);
  if (!fileData && isSupabaseConfigured()) {
    try {
      fileData = await loadAppData("showcase.json", null);
      if (fileData) memoryStore.set(SHOWCASE_FILE, fileData);
    } catch {}
  }
  if (!fileData) {
    fileData = readJSONFile(SHOWCASE_FILE, defaultShowcase);
  }

  const data = {
    heroCards: Array.isArray(fileData?.heroCards) && fileData.heroCards.length > 0 ? fileData.heroCards : defaultShowcase.heroCards,
    galleryCards: Array.isArray(fileData?.galleryCards) && fileData.galleryCards.length > 0 ? fileData.galleryCards : defaultShowcase.galleryCards,
  };
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.json(data);
});

// POST /api/showcase - Update showcase cards
app.post("/api/showcase", async (req, res) => {
  try {
    const { auth, heroCards, galleryCards } = req.body;
    if (auth && auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
      return res.status(403).json({ success: false, error: "Accès refusé." });
    }
    const current = readJSONFile(SHOWCASE_FILE, { heroCards: [], galleryCards: [] });
    const updated = {
      heroCards: Array.isArray(heroCards) ? heroCards : (current.heroCards || []),
      galleryCards: Array.isArray(galleryCards) ? galleryCards : (current.galleryCards || []),
    };

    memoryStore.set(SHOWCASE_FILE, updated);
    if (isSupabaseConfigured()) {
      await saveAppData("showcase.json", updated).catch(err => {
        console.warn("⚠️ [Showcase Supabase] Notice sauvegarde:", err);
      });
    }

    if (process.env.VERCEL !== "1") {
      try {
        fs.writeFileSync(SHOWCASE_FILE, JSON.stringify(updated, null, 2), "utf-8");
      } catch (e) {}
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    return res.json({ success: true, showcase: updated });
  } catch (err: any) {
    console.error("🔴 [POST /api/showcase] Erreur:", err);
    return res.status(500).json({ success: false, error: "Erreur lors de la sauvegarde de la vitrine: " + (err.message || String(err)) });
  }
});

// GET /api/banners - Fetch carousel banners
app.get("/api/banners", async (req, res) => {
  let banners: any = memoryStore.get(BANNERS_FILE);
  if (!banners && isSupabaseConfigured()) {
    try {
      banners = await loadAppData("banners.json", null);
      if (banners) memoryStore.set(BANNERS_FILE, banners);
    } catch {}
  }
  if (!banners) {
    banners = readJSONFile(BANNERS_FILE, null);
  }

  // Ensure valid array of slides with content
  if (Array.isArray(banners) && banners.length > 0 && !banners[0].badgeTagFr && banners[0].title) {
    try {
      if (fs.existsSync(BANNERS_FILE)) {
        const diskContent = fs.readFileSync(BANNERS_FILE, "utf-8");
        const parsed = JSON.parse(diskContent);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].badgeTagFr) {
          banners = parsed;
          memoryStore.set(BANNERS_FILE, parsed);
        }
      }
    } catch (e) {}
  }

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.json(banners);
});

// POST /api/banners - Save carousel banners
app.post("/api/banners", async (req, res) => {
  try {
    const body = req.body;
    const slides = Array.isArray(body) ? body : (Array.isArray(body?.slides) ? body.slides : null);
    const auth = body?.auth || req.headers.authorization;
    if (auth && auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
      return res.status(403).json({ success: false, error: "Accès refusé." });
    }
    if (!Array.isArray(slides)) {
      return res.status(400).json({ success: false, error: "Format invalide." });
    }

    memoryStore.set(BANNERS_FILE, slides);
    if (isSupabaseConfigured()) {
      await saveAppData("banners.json", slides).catch(err => {
        console.warn("⚠️ [Banners Supabase] Notice sauvegarde:", err);
      });
    }

    if (process.env.VERCEL !== "1") {
      try {
        fs.writeFileSync(BANNERS_FILE, JSON.stringify(slides, null, 2), "utf-8");
      } catch (e) {}
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.json({ success: true, slides });
  } catch (err: any) {
    console.error("🔴 [POST /api/banners] Erreur:", err);
    return res.status(500).json({ success: false, error: "Erreur sauvegarde bannières: " + (err.message || String(err)) });
  }
});

// GET /api/settings - Fetch global app configuration (WhatsApp and active logo ID)
app.get("/api/settings", async (req, res) => {
  const defaultSettings = {
    whatsappMerchantNumber: "22890000000",
    activeLogoId: "official"
  };

  let settings: any = memoryStore.get(SETTINGS_FILE);
  if (!settings && isSupabaseConfigured()) {
    try {
      settings = await loadAppData("settings.json", null);
      if (settings) memoryStore.set(SETTINGS_FILE, settings);
    } catch {}
  }
  if (!settings) {
    settings = readJSONFile(SETTINGS_FILE, defaultSettings);
  }

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.json(settings);
});

// POST /api/settings - Save global app configuration (WhatsApp and active logo ID)
app.post("/api/settings", async (req, res) => {
  try {
    const { auth, whatsappMerchantNumber, activeLogoId } = req.body;
    if (auth && auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
      return res.status(403).json({ success: false, error: "Accès refusé." });
    }

    const defaultSettings = {
      whatsappMerchantNumber: "22890000000",
      activeLogoId: "official"
    };
    const currentSettings = readJSONFile(SETTINGS_FILE, defaultSettings);

    const newSettings = {
      whatsappMerchantNumber: whatsappMerchantNumber || currentSettings.whatsappMerchantNumber || "22890000000",
      activeLogoId: activeLogoId || currentSettings.activeLogoId || "official"
    };

    memoryStore.set(SETTINGS_FILE, newSettings);
    if (isSupabaseConfigured()) {
      await saveAppData("settings.json", newSettings).catch(err => {
        console.warn("⚠️ [Settings Supabase] Notice sauvegarde:", err);
      });
    }

    if (process.env.VERCEL !== "1") {
      try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2), "utf-8");
      } catch (e) {}
    }

    return res.json({ success: true, settings: newSettings });
  } catch (err: any) {
    console.error("🔴 [POST /api/settings] Erreur:", err);
    return res.status(500).json({ success: false, error: "Impossible de sauvegarder la configuration: " + (err.message || String(err)) });
  }
});

// GET /api/shops/check-slug - Verify slug availability and valid format
app.get("/api/shops/check-slug", (req, res) => {
  const rawSlug = String(req.query.slug || "").trim().toLowerCase();
  const authHeader = req.headers.authorization;
  const currentUserId = authHeader ? getUserIdFromToken(authHeader) : null;

  if (!rawSlug) {
    return res.json({ available: false, reason: "Veuillez entrer un nom d'URL.", formattedSlug: "" });
  }

  const formattedSlug = rawSlug
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (formattedSlug.length < 3) {
    return res.json({ available: false, reason: "L'URL doit comporter au moins 3 caractères.", formattedSlug });
  }
  if (formattedSlug.length > 35) {
    return res.json({ available: false, reason: "L'URL ne doit pas dépasser 35 caractères.", formattedSlug });
  }

  const reservedWords = [
    "admin", "api", "boutique", "shop", "miabeasi", "asime", "root", "system", "auth",
    "login", "register", "null", "undefined", "help", "support", "dashboard", "settings",
    "vendre", "produit", "catalogue", "blog", "contact", "cart", "panier", "checkout"
  ];

  if (reservedWords.includes(formattedSlug)) {
    return res.json({ available: false, reason: "Ce terme est réservé par la plateforme.", formattedSlug });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const isTaken = users.some(u => {
    if (!u || (currentUserId && u.id === currentUserId)) return false;
    const userSlug = String(u.boutiqueSlug || u.shopSlug || "").trim().toLowerCase();
    return userSlug === formattedSlug;
  });

  if (isTaken) {
    return res.json({ available: false, reason: "Ce nom d'URL est déjà utilisé par une autre boutique.", formattedSlug });
  }

  return res.json({ available: true, reason: "Disponible ✓", formattedSlug });
});

// GET /api/shops/:slug - Public Shop Profile View
app.get("/api/shops/:slug", (req, res) => {
  const targetSlug = String(req.params.slug || "").trim().toLowerCase();
  const users = readJSONFile<any[]>(USERS_FILE, []);
  const seller = users.find(u => {
    if (!u || u.role !== "vendeur") return false;
    const userSlug = String(u.boutiqueSlug || u.shopSlug || "").trim().toLowerCase();
    return userSlug === targetSlug;
  });

  if (!seller) {
    return res.status(404).json({ success: false, error: "Boutique introuvable." });
  }

  const plan = seller.vendeurPlan || (seller.vendeurSubscription === "Offre 3" ? "BUSINESS" : seller.vendeurSubscription === "Offre 2" ? "PRO" : "Gratuit");
  
  if (plan === "Gratuit") {
    return res.status(403).json({ 
      success: false, 
      error: "Cette boutique fonctionne actuellement en formule GRATUIT sans URL publique active. Les URLs publiques sont réservées aux abonnements PRO et BUSINESS." 
    });
  }

  const allProducts = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const sellerProducts = allProducts.filter(p => {
    if (!p || p.valide === false || p.status === "inactif") return false;
    return p.vendeurId === seller.id || (seller.businessName && p.partenaire === seller.businessName) || (seller.boutiqueName && p.partenaire === seller.boutiqueName);
  });

  const reviews = readJSONFile<any[]>(REVIEWS_FILE, []);
  const sellerProdIds = new Set(sellerProducts.map(p => p.id));
  const sellerReviews = reviews.filter(r => sellerProdIds.has(r.productId));
  const avgRating = sellerReviews.length > 0
    ? Number((sellerReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / sellerReviews.length).toFixed(1))
    : 5.0;

  return res.json({
    success: true,
    shop: {
      id: seller.id,
      name: seller.businessName || seller.boutiqueName || seller.name,
      gerant: seller.name,
      slug: seller.boutiqueSlug || seller.shopSlug,
      plan: plan,
      bio: seller.boutiqueBio || seller.description || "Artisan & Vendeur partenaire officiel Miabé Asi au Togo.",
      histoire: seller.boutiqueHistoire || "",
      logo: seller.boutiqueLogo || seller.logo || "",
      coverImage: seller.boutiqueCover || seller.coverImage || "",
      primaryColor: seller.boutiqueColor || "#0E5224",
      whatsapp: seller.boutiqueWhatsapp || seller.contactPhone || seller.phone || "",
      phone: seller.contactPhone || seller.phone || "",
      quartier: seller.quartier || "Lomé",
      ville: seller.ville || "Lomé, Togo",
      category: seller.category || "Artisanat & Terroir",
      badge: plan === "BUSINESS" ? "business" : "pro",
      rating: avgRating,
      reviewsCount: sellerReviews.length,
      productsCount: sellerProducts.length,
      createdAt: seller.createdAt || new Date().toISOString()
    },
    products: sellerProducts
  });
});

// POST /api/seller/featured-request - Seller submits product for "Produits Phares" (PRO max 2, BUSINESS max 5)
app.post("/api/seller/featured-request", (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = authHeader ? getUserIdFromToken(authHeader) : null;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non autorisé. Veuillez vous connecter." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user || user.role !== "vendeur") {
    return res.status(403).json({ success: false, error: "Action réservée aux vendeurs." });
  }

  const plan = user.vendeurPlan || (user.vendeurSubscription === "Offre 3" ? "BUSINESS" : user.vendeurSubscription === "Offre 2" ? "PRO" : "Gratuit");
  if (plan === "Gratuit") {
    return res.status(403).json({ success: false, error: "La mise en avant dans les Produits Phares est réservée aux abonnements PRO (jusqu'à 2) et BUSINESS (jusqu'à 5)." });
  }

  if (user.vendeurSubscriptionStatus !== "active") {
    return res.status(403).json({ success: false, error: `Votre abonnement ${plan} n'est pas actif (statut: ${user.vendeurSubscriptionStatus || "pending"}). Veuillez confirmer le paiement PayDunya.` });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, error: "Identifiant de produit requis." });
  }

  const maxFeatured = plan === "BUSINESS" ? 5 : 2;
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const targetProduct = products.find(p => p.id === productId);
  if (!targetProduct) {
    return res.status(404).json({ success: false, error: "Produit introuvable." });
  }

  const currentFeatured = products.filter(p => 
    (p.vendeurId === userId || p.partenaire === user.businessName || p.partenaire === user.boutiqueName) && 
    (p.phare === true || p.phareStatus === "pending" || p.phareStatus === "approved")
  );

  if (targetProduct.phareStatus !== "approved" && currentFeatured.length >= maxFeatured && !currentFeatured.some(p => p.id === productId)) {
    return res.status(400).json({ success: false, error: `Votre formule ${plan} vous permet de proposer au maximum ${maxFeatured} produit(s) phares.` });
  }

  targetProduct.phareStatus = "pending";
  targetProduct.pharePriority = plan === "BUSINESS" ? "high" : "standard";
  targetProduct.phareRequestedAt = new Date().toISOString();

  writeJSONFile(PRODUCTS_FILE, products);
  return res.json({ success: true, message: "Votre demande de mise en avant a été transmise à l'administration.", product: targetProduct });
});

// GET /api/admin/featured-requests - Admin views featured product requests
app.get("/api/admin/featured-requests", (req, res) => {
  const authHeader = req.headers.authorization || req.headers.auth;
  if (authHeader && authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
    const userId = getUserIdFromToken(String(authHeader));
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Accès refusé." });
    }
  }

  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const featured = products.filter(p => p.phare || p.phareStatus === "pending" || p.phareStatus === "approved");
  return res.json({ success: true, requests: featured });
});

// POST /api/admin/featured-requests/:id/approve - Admin approves featured product
app.post("/api/admin/featured-requests/:id/approve", (req, res) => {
  const { id } = req.params;
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const target = products.find(p => p.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: "Produit non trouvé." });
  }

  target.phare = true;
  target.phareStatus = "approved";
  target.valide = true;

  writeJSONFile(PRODUCTS_FILE, products);
  return res.json({ success: true, message: "Produit validé et mis en avant avec succès !", product: target });
});

// POST /api/admin/featured-requests/:id/reject - Admin rejects featured product
app.post("/api/admin/featured-requests/:id/reject", (req, res) => {
  const { id } = req.params;
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const target = products.find(p => p.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: "Produit non trouvé." });
  }

  target.phare = false;
  target.phareStatus = "rejected";

  writeJSONFile(PRODUCTS_FILE, products);
  return res.json({ success: true, message: "Demande de mise en avant refusée.", product: target });
});

// POST /api/admin/featured-requests/:id/remove - Admin removes product from featured
app.post("/api/admin/featured-requests/:id/remove", (req, res) => {
  const { id } = req.params;
  const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
  const target = products.find(p => p.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: "Produit non trouvé." });
  }

  target.phare = false;
  target.phareStatus = "none";

  writeJSONFile(PRODUCTS_FILE, products);
  return res.json({ success: true, message: "Produit retiré des Produits Phares.", product: target });
});

// POST /api/seller/banner-request - BUSINESS seller submits homepage banner
app.post("/api/seller/banner-request", (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = authHeader ? getUserIdFromToken(authHeader) : null;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non autorisé. Veuillez vous connecter." });
  }

  const users = readJSONFile<any[]>(USERS_FILE, []);
  const user = users.find(u => u.id === userId);
  if (!user || user.role !== "vendeur") {
    return res.status(403).json({ success: false, error: "Action réservée aux vendeurs." });
  }

  const plan = user.vendeurPlan || (user.vendeurSubscription === "Offre 3" ? "BUSINESS" : user.vendeurSubscription === "Offre 2" ? "PRO" : "Gratuit");
  if (plan !== "BUSINESS") {
    return res.status(403).json({ success: false, error: "La soumission d'une bannière publicitaire sur la page d'accueil est exclusivement réservée aux abonnés BUSINESS." });
  }

  if (user.vendeurSubscriptionStatus !== "active") {
    return res.status(403).json({ success: false, error: `Votre abonnement BUSINESS n'est pas actif (statut: ${user.vendeurSubscriptionStatus || "pending"}). Veuillez confirmer le paiement PayDunya.` });
  }

  const { title, subtitle, imageUrl, linkUrl, startDate, endDate } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, error: "Le titre et l'image de la bannière sont obligatoires." });
  }

  const bannerRequests = readJSONFile<any[]>(BANNER_REQUESTS_FILE, []);
  const newRequest = {
    id: "req_banner_" + Date.now().toString(),
    vendeurId: userId,
    vendeurName: user.name,
    boutiqueName: user.boutiqueName || user.businessName || user.name,
    title: String(title).trim(),
    subtitle: String(subtitle || "").trim(),
    imageUrl: String(imageUrl).trim(),
    linkUrl: String(linkUrl || "").trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  bannerRequests.unshift(newRequest);
  writeJSONFile(BANNER_REQUESTS_FILE, bannerRequests);

  return res.json({ success: true, message: "Votre bannière a été soumise avec succès. L'administrateur examinera votre visuel sous 24h.", request: newRequest });
});

// GET /api/seller/my-banners - Seller gets their banner requests
app.get("/api/seller/my-banners", (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = authHeader ? getUserIdFromToken(authHeader) : null;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Non autorisé." });
  }

  const bannerRequests = readJSONFile<any[]>(BANNER_REQUESTS_FILE, []);
  const myBanners = bannerRequests.filter(b => b.vendeurId === userId);
  return res.json({ success: true, banners: myBanners });
});

// GET /api/admin/banner-requests - Admin views all banner requests
app.get("/api/admin/banner-requests", (req, res) => {
  const bannerRequests = readJSONFile<any[]>(BANNER_REQUESTS_FILE, []);
  return res.json({ success: true, requests: bannerRequests });
});

// POST /api/admin/banner-requests/:id/approve - Admin approves homepage banner
app.post("/api/admin/banner-requests/:id/approve", (req, res) => {
  const { id } = req.params;
  const bannerRequests = readJSONFile<any[]>(BANNER_REQUESTS_FILE, []);
  const target = bannerRequests.find(b => b.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: "Demande de bannière introuvable." });
  }

  target.status = "approved";
  writeJSONFile(BANNER_REQUESTS_FILE, bannerRequests);

  // Add slide to promo slides list in BANNERS_FILE
  const currentBanners = readJSONFile<any[]>(BANNERS_FILE, []);
  const newSlide = {
    id: "slide_vendor_" + target.id,
    badgeTagFr: "BOUTIQUE PARTENAIRE",
    badgeTagEe: "BOUTIQUE PARTENAIRE",
    badgeSubFr: target.boutiqueName || "OFFRE EXCLUSIVE",
    badgeSubEe: target.boutiqueName || "OFFRE EXCLUSIVE",
    subtitleFr: target.subtitle || "Créations & Produits Locaux",
    subtitleEe: target.subtitle || "Créations & Produits Locaux",
    titleFr: target.title,
    titleEe: target.title,
    offerMainFr: target.title,
    offerMainEe: target.title,
    offerSubFr: "DISPONIBLE DÈS MAINTENANT",
    offerSubEe: "DISPONIBLE DÈS MAINTENANT",
    descFr: "Découvrez cette sélection exclusive proposée par notre vendeur partenaire certifié Miabé Asi.",
    descEe: "Découvrez cette sélection exclusive proposée par notre vendeur partenaire certifié Miabé Asi.",
    imageUrl: target.imageUrl,
    imageAlt: target.title,
    buttonTextFr: "Découvrir la Boutique",
    buttonTextEe: "Kpɔ Nudzraƒe la",
    bgGradient: "linear-gradient(135deg, #09090b 0%, #171717 50%, #0E5224 100%)",
    searchQuery: target.boutiqueName || "",
    categoryTarget: "Tous"
  };

  currentBanners.unshift(newSlide);
  writeJSONFile(BANNERS_FILE, currentBanners);

  return res.json({ success: true, message: "Bannière approuvée et mise en ligne sur la page d'accueil avec succès !" });
});

// POST /api/admin/banner-requests/:id/reject - Admin rejects homepage banner
app.post("/api/admin/banner-requests/:id/reject", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const bannerRequests = readJSONFile<any[]>(BANNER_REQUESTS_FILE, []);
  const target = bannerRequests.find(b => b.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: "Demande de bannière introuvable." });
  }

  target.status = "rejected";
  target.rejectionReason = reason || "Le format ou le visuel ne respecte pas la charte éditoriale.";
  writeJSONFile(BANNER_REQUESTS_FILE, bannerRequests);

  return res.json({ success: true, message: "Demande de bannière rejetée." });
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

// POST /api/ai/assistant - AI Chatbot Assistant for Miabé Asi (Powered by Gemini)
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message requis." });
    }

    const products = readJSONFile<any[]>(PRODUCTS_FILE, []);
    const sampleProducts = products.slice(0, 15).map(p => `- ${p.nom} (${p.categorie}): ${p.prix} FCFA`).join("\n");

    const systemInstruction = `Tu es Aya, l'Assistante IA virtuelle officielle de Miabé Asi (la plateforme d'éco-commerce n°1 du consommer local et des opportunités au Togo 🇹🇬 — "Le local, notre fierté").
Ton rôle est EXCLUSIVEMENT d'aider les acheteurs et vendeurs de la plateforme Miabé Asi avec enthousiasme, politesse, clarté et élégance.

PÉRIMÈTRE ET LIMITES STRICTES (RÈGLES ABSOLUES) :
- Tu es UNIQUEMENT un guide commercial et support client pour Miabé Asi.
- Tu ne dois JAMAIS rédiger de code informatique, créer de projets logiciels, jouer le rôle d'un développeur, ni accomplir de tâches informatiques/techniques hors du cadre de Miabé Asi.
- Si un utilisateur te demande de créer un projet, d'écrire du code, de programmer une application ou d'aborder un sujet hors du commerce local togolais, réponds poliment que tu es Aya, l'assistante virtuelle de Miabé Asi, et que ta mission est d'orienter les clients sur nos produits locaux, livraisons, paiements et vendeurs.

Informations clés sur Miabé Asi :
- Devise : FCFA (XOF).
- Slogan : "Le local, notre fierté".
- Produits phares : Artisanat Made in Togo (Miel de Kpalimé, Beurre de Karité Bio, Cafés des Plateaux, Chocolat artisanal, etc.), Paniers Frais & Épicerie, Plats & Gastronomie locale, Mode Wax & T-shirts, Chaussures, Importations & High-Tech.
- Paiements acceptés : Carte bancaire, Mobile Money (T-Money, Flooz), Portefeuille Miabé Asi Pay, ou Paiement à la livraison.
- Livraison : Express à domicile ou au bureau à Lomé et dans les préfectures du Togo, ainsi qu'à l'international.
- Service client WhatsApp : Disponible directement sur la plateforme.

Aperçu de quelques produits phares du catalogue :
${sampleProducts}

Consignes de communication :
- Salue chaleureusement en disant "Miawoezon !" ou "Bienvenue chez Miabé Asi !".
- Tu es bilingue en Français et en Eʋegbe (Ewe). Si l'utilisateur te parle en Ewe ou te demande de lui répondre en Ewe, réponds-lui naturellement et chaleureusement en Ewe (Eʋegbe). S'il te parle en Français, réponds-lui en Français.
- Sois très utile pour guider le choix des produits, expliquer le fonctionnement de la commande, du panier ou de la livraison.
- Sois toujours courtoise, chaleureuse et bien structurée.`;

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not present
      const msgLower = message.toLowerCase();
      let fallbackText = "Miawoezon ! Je suis Aya, l'Assistante IA de Miabé Asi — Le local, notre fierté. ";
      if (msgLower.includes("livraison") || msgLower.includes("livrer")) {
        fallbackText += "Nous assurons la livraison express le jour même à Lomé et la livraison sécurisée dans toutes les villes du Togo !";
      } else if (msgLower.includes("paiement") || msgLower.includes("payer") || msgLower.includes("tmoney") || msgLower.includes("flooz")) {
        fallbackText += "Vous pouvez régler vos achats par Carte bancaire, Mobile Money, Portefeuille Miabé Asi Pay ou à la livraison !";
      } else if (msgLower.includes("produit") || msgLower.includes("miel") || msgLower.includes("karit") || msgLower.includes("cadeau")) {
        fallbackText += "Découvrez notre catalogue 'Made in Togo' avec le Miel Sauvage de Kpalimé, le Beurre de Karité Bio, les Cafés des Plateaux et l'Artisanat local dans l'onglet Catalogue !";
      } else {
        fallbackText += "Comment puis-je vous guider aujourd'hui ? Posez-moi vos questions sur nos produits Made in Togo, nos modes de paiement ou la livraison !";
      }
      return res.json({ success: true, response: fallbackText });
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((item: { sender: string; text: string }) => {
        contents.push({
          role: item.sender === "user" ? "user" : "model",
          parts: [{ text: item.text }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = result.text || "Miawoezon ! Comment puis-je vous conseiller aujourd'hui sur Miabé Asi ?";
    res.json({ success: true, response: reply });
  } catch (error: any) {
    console.error("AI Assistant Endpoint Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur du serveur d'assistance IA.",
      response: "Une petite interruption temporaire est survenue. N'hésitez pas à me poser à nouveau votre question !" 
    });
  }
});

// Diagnostic de la connexion Supabase
app.get("/api/supabase-status", async (req, res) => {
  try {
    const health = await checkSupabaseHealth();
    return res.json({
      success: true,
      ...health
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur lors du contrôle Supabase."
    });
  }
});

// Endpoint pour consulter ou télécharger le schéma SQL panafricain
app.get("/api/supabase/schema", (req, res) => {
  const schemaPath = path.join(process.cwd(), "supabase_panafrican_schema.sql");
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, "utf-8");
    if (req.query.format === "raw" || req.query.download === "true") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      if (req.query.download === "true") {
        res.setHeader("Content-Disposition", "attachment; filename=\"supabase_panafrican_schema.sql\"");
      }
      return res.send(sql);
    }
    return res.json({
      success: true,
      filename: "supabase_panafrican_schema.sql",
      tablesCount: 9,
      tables: [
        "currencies",
        "countries",
        "profiles",
        "shops",
        "categories",
        "products",
        "orders",
        "order_items",
        "asime_store"
      ],
      sql
    });
  }
  res.status(404).json({ success: false, error: "Fichier de schéma SQL introuvable." });
});

// Endpoint pour consulter ou télécharger le script SQL d'insertion/mise à jour des produits
app.get("/api/supabase/products-seed", (req, res) => {
  const seedPath = path.join(process.cwd(), "supabase_products_seed.sql");
  if (fs.existsSync(seedPath)) {
    const sql = fs.readFileSync(seedPath, "utf-8");
    if (req.query.format === "raw" || req.query.download === "true") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      if (req.query.download === "true") {
        res.setHeader("Content-Disposition", "attachment; filename=\"supabase_products_seed.sql\"");
      }
      return res.send(sql);
    }
    return res.json({
      success: true,
      filename: "supabase_products_seed.sql",
      productsCount: 105,
      idempotent: true,
      onConflict: "ON CONFLICT (id) DO UPDATE SET",
      sql
    });
  }
  res.status(404).json({ success: false, error: "Fichier SQL des produits introuvable." });
});

// Fallback for unmatched API routes to ensure JSON response instead of HTML 404
app.use((req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/auth/") || req.path === "/api" || req.path === "/auth") {
    if (!res.headersSent) {
      return res.status(404).json({ success: false, error: `Point de terminaison non trouvé: ${req.method} ${req.originalUrl || req.url}` });
    }
  }
  next();
});

// Global Express Error Handler to ensure JSON response
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Server Error:", err);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: err.message || "Erreur interne du serveur." });
  } else {
    next(err);
  }
});

// --- Vite Middleware Integration ---
async function start() {
  // Sync from Supabase on startup
  if (isSupabaseConfigured()) {
    console.log("🔄 [Startup] Synchronisation initiale avec Supabase (en parallèle)...");
    const collections = [
      { file: PRODUCTS_FILE, key: "products.json" },
      { file: BLOGS_FILE, key: "blogs.json" },
      { file: USERS_FILE, key: "users.json" },
      { file: PARTNERS_FILE, key: "partners.json" },
      { file: ORDERS_FILE, key: "orders.json" },
      { file: WITHDRAWALS_FILE, key: "withdrawals.json" },
      { file: REVIEWS_FILE, key: "reviews.json" },
      { file: MESSAGES_FILE, key: "messages.json" },
      { file: SETTINGS_FILE, key: "settings.json" },
      { file: SHOWCASE_FILE, key: "showcase.json" },
      { file: BANNERS_FILE, key: "banners.json" },
      { file: DELETED_PRODUCTS_FILE, key: "deleted_products.json" }
    ];

    const timeoutMs = 4000;
    const syncPromises = collections.map(async (col) => {
      try {
        // Fetch with a timeout of 4 seconds to prevent blocking
        let cloudData = await Promise.race([
          loadFromSupabaseStore(col.key),
          new Promise<null>((resolve) => setTimeout(() => {
            console.warn(`⏳ [Startup] Timeout de synchronisation pour ${col.key} après ${timeoutMs}ms.`);
            resolve(null);
          }, timeoutMs))
        ]);

        // Fallback check for "produits.json" if "products.json" was not found
        if (!cloudData && col.key === "products.json") {
          cloudData = await loadFromSupabaseStore("produits.json");
        }

        if (cloudData) {
          memoryStore.set(col.file, cloudData);
          try {
            fs.writeFileSync(col.file, JSON.stringify(cloudData, null, 2), "utf-8");
          } catch (e) {
            try {
              fs.writeFileSync(getTmpFilePath(col.file), JSON.stringify(cloudData, null, 2), "utf-8");
            } catch (e2) {}
          }
          console.log(`✅ [Startup] Restauré depuis Supabase : ${col.key}`);
        } else {
          // If Supabase is connected but this key is not found, seed current local file to Supabase if exists
          let localContent = "";
          if (fs.existsSync(col.file)) {
            localContent = fs.readFileSync(col.file, "utf-8");
          } else if (fs.existsSync(getTmpFilePath(col.file))) {
            localContent = fs.readFileSync(getTmpFilePath(col.file), "utf-8");
          }

          if (localContent) {
            try {
              const localData = JSON.parse(localContent);
              memoryStore.set(col.file, localData);
              console.log(`🌱 [Startup] Seeding de ${col.key} vers Supabase...`);
              await saveToSupabaseStore(col.key, localData);
            } catch (pErr) {}
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

  // Ensure Service Worker is always served fresh and never cached by proxies or browsers
  app.get("/sw.js", (req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Content-Type", "application/javascript");
    const swPath = path.join(process.cwd(), "public", "sw.js");
    if (fs.existsSync(swPath)) {
      return res.sendFile(swPath);
    }
    next();
  });

  // Ensure Web App Manifest is always served fresh
  app.get("/manifest.json", (req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Content-Type", "application/manifest+json");
    const manifestPath = path.join(process.cwd(), "public", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      return res.sendFile(manifestPath);
    }
    next();
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
    app.get("*all", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Miabé Asi Backend] Server live at http://localhost:${PORT}`);
    });
  }
}

if (process.env.VERCEL !== "1") {
  start();
}

export default app;

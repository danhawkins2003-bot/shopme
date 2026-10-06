import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

let supabaseInstance: SupabaseClient | null = null;
let currentSupabaseUrl = "";
let currentSupabaseKey = "";

/**
 * Resilient synchronous .env loader in case variables are defined in .env
 */
function loadEnv(): void {
  const envPaths = [
    path.join(process.cwd(), ".env"),
    "./.env",
    "../.env",
    "/app/.env"
  ];

  for (const envPath of envPaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
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
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1).trim();
            }
            if (k && v && !process.env[k]) {
              process.env[k] = v;
            }
          }
        }
      }
    } catch {
      // Continue if unreadable
    }
  }
}

/**
 * Lazy initialization of Supabase client to prevent startup crashes if keys are not configured.
 * Prioritizes SUPABASE_SERVICE_ROLE_KEY for server-side operations, with SUPABASE_ANON_KEY fallback.
 */
export function getSupabaseClient(forceRefresh = false): SupabaseClient | null {
  loadEnv();
  let url = (process.env.SUPABASE_URL || "").trim();
  if (url) {
    url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  }
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
  const key = serviceRoleKey || anonKey;

  if (!url || !key) {
    supabaseInstance = null;
    currentSupabaseUrl = "";
    currentSupabaseKey = "";
    return null;
  }

  if (supabaseInstance && !forceRefresh && currentSupabaseUrl === url && currentSupabaseKey === key) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    currentSupabaseUrl = url;
    currentSupabaseKey = key;
    console.log(`🟢 [Supabase] Client initialisé avec succès (${serviceRoleKey ? "Service Role Key" : "Anon Key"}).`);
    return supabaseInstance;
  } catch (err) {
    console.error("🔴 [Supabase] Échec de l'initialisation du client :", err);
    return null;
  }
}

/**
 * Returns true if Supabase integration is active.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

let detectedProductColumns: Set<string> | null = null;

export async function getProductTableColumns(client: SupabaseClient): Promise<Set<string>> {
  if (detectedProductColumns) return detectedProductColumns;
  try {
    const { data, error } = await client.from("products").select("*").limit(1);
    if (!error && data && data.length > 0) {
      detectedProductColumns = new Set(Object.keys(data[0]));
      return detectedProductColumns;
    }
  } catch {}

  // Standard base columns present in public.products
  return new Set([
    "id", "nom", "description", "prix", "prix_barre", "categorie",
    "stock", "phare", "images", "partenaire", "lien_affilie"
  ]);
}

/**
 * Convert application product object to relational Supabase columns
 */
export function mapProductToSupabaseRow(p: any, allowedCols?: Set<string>) {
  const row: Record<string, any> = {
    id: String(p.id || ("prod_" + Date.now())),
    nom: String(p.nom || "").trim(),
    description: String(p.description || "").trim(),
    prix: Number(p.prix) || 0,
    prix_barre: p.prixBarre ? Number(p.prixBarre) : (p.prix_barre ? Number(p.prix_barre) : null),
    categorie: String(p.categorie || "Général").trim(),
    stock: typeof p.stock !== "undefined" ? Number(p.stock) : 10,
    phare: Boolean(p.phare),
    images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
    partenaire: String(p.partenaire || "Boutique en Direct").trim(),
    lien_affilie: String(p.lienAffilie || p.lien_affilie || "").trim()
  };

  const extended: Record<string, any> = {
    category_id: p.categoryId || p.category_id || null,
    shop_id: p.shopId || p.shop_id || null,
    vendeur_id: p.vendeurId || p.vendeur_id || null,
    seller_type: p.sellerType || p.seller_type || (p.vendeurId ? "professionnel" : "professionnel"),
    condition: p.condition || "neuf",
    country_origin: String(p.countryOrigin || p.country_origin || "TG").trim().toUpperCase(),
    currency_code: String(p.currencyCode || p.currency_code || "XOF").trim().toUpperCase(),
    is_cross_border_eligible: typeof p.isCrossBorderEligible !== "undefined" ? Boolean(p.isCrossBorderEligible) : true,
    weight_kg: p.weightKg ? Number(p.weightKg) : (p.weight_kg ? Number(p.weight_kg) : 0.5),
    status: p.status || "actif"
  };

  if (allowedCols && allowedCols.size > 0) {
    for (const [k, v] of Object.entries(extended)) {
      if (allowedCols.has(k)) {
        row[k] = v;
      }
    }
    for (const k of Object.keys(row)) {
      if (!allowedCols.has(k)) {
        delete row[k];
      }
    }
  }

  return row;
}

/**
 * Convert relational Supabase row to application product object
 */
export function mapSupabaseRowToProduct(row: any) {
  const images = Array.isArray(row.images) ? row.images : (typeof row.images === "string" ? [row.images] : []);
  const mainImage = images.length > 0 ? images[0] : "";
  const prixBarre = row.prix_barre ? Number(row.prix_barre) : null;
  const affiliateLink = row.lien_affilie || row.lienAffilie || "";

  return {
    id: String(row.id),
    nom: row.nom || "",
    description: row.description || "",
    prix: Number(row.prix) || 0,
    prixBarre: prixBarre,
    prix_barre: prixBarre,
    categorie: row.categorie || "Général",
    categoryId: row.category_id || null,
    shopId: row.shop_id || null,
    vendeurId: row.vendeur_id || null,
    sellerType: row.seller_type || "professionnel",
    condition: row.condition || "neuf",
    stock: typeof row.stock !== "undefined" ? Number(row.stock) : 0,
    phare: Boolean(row.phare),
    images: images,
    image: mainImage,
    partenaire: row.partenaire || "Boutique en Direct",
    lienAffilie: affiliateLink,
    lien_affilie: affiliateLink,
    countryOrigin: row.country_origin || "TG",
    currencyCode: row.currency_code || "XOF",
    isCrossBorderEligible: typeof row.is_cross_border_eligible !== "undefined" ? Boolean(row.is_cross_border_eligible) : true,
    weightKg: row.weight_kg ? Number(row.weight_kg) : 0.5,
    status: row.status || "actif",
    valide: true,
    createdAt: row.created_at || undefined,
    created_at: row.created_at || undefined,
    updatedAt: row.updated_at || undefined
  };
}

/**
 * Convert application shop profile to relational Supabase columns
 */
export function mapShopToSupabaseRow(s: any) {
  return {
    id: String(s.id || ("shop_" + Date.now())),
    owner_id: String(s.vendeurId || s.owner_id || ""),
    name: String(s.nom || s.name || "").trim(),
    slug: s.slug || null,
    seller_type: s.sellerType || s.seller_type || "particulier",
    description: String(s.description || "").trim(),
    bio: s.bio || null,
    logo_url: s.logo || s.logo_url || null,
    cover_url: s.coverImage || s.cover_url || null,
    country_code: String(s.countryCode || s.country_code || "TG").trim().toUpperCase(),
    default_currency: String(s.currencyCode || s.default_currency || "XOF").trim().toUpperCase(),
    city: s.city || s.ville || null,
    quartier: s.quartier || null,
    address: s.address || null,
    whatsapp: s.whatsapp || null,
    phone: s.phone || null,
    subscription_plan: s.plan || s.subscription_plan || "Gratuit",
    is_verified: Boolean(s.isVerified || s.is_verified),
    rating: typeof s.noteMoyenne !== "undefined" ? Number(s.noteMoyenne) : (s.rating ? Number(s.rating) : 5.0),
    sales_count: typeof s.nombreVentes !== "undefined" ? Number(s.nombreVentes) : (s.sales_count ? Number(s.sales_count) : 0)
  };
}

/**
 * Convert relational Supabase row to shop profile
 */
export function mapSupabaseRowToShop(row: any) {
  return {
    id: String(row.id),
    vendeurId: String(row.owner_id),
    nom: row.name || "",
    slug: row.slug || undefined,
    sellerType: row.seller_type || "particulier",
    description: row.description || "",
    bio: row.bio || undefined,
    logo: row.logo_url || undefined,
    coverImage: row.cover_url || undefined,
    countryCode: row.country_code || "TG",
    currencyCode: row.default_currency || "XOF",
    city: row.city || undefined,
    quartier: row.quartier || undefined,
    address: row.address || undefined,
    whatsapp: row.whatsapp || undefined,
    phone: row.phone || undefined,
    plan: row.subscription_plan || "Gratuit",
    isVerified: Boolean(row.is_verified),
    noteMoyenne: row.rating ? Number(row.rating) : 5.0,
    nombreVentes: row.sales_count ? Number(row.sales_count) : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Convert user/client/seller to relational Supabase columns
 */
export function mapProfileToSupabaseRow(u: any) {
  return {
    id: String(u.id),
    email: u.email ? String(u.email).trim().toLowerCase() : null,
    phone: u.phone ? String(u.phone).trim() : null,
    full_name: String(u.name || u.full_name || "Utilisateur").trim(),
    role: u.role || "client",
    seller_type: u.sellerType || u.seller_type || (u.role === "vendeur" ? "professionnel" : null),
    country_code: u.countryCode || u.country_code || "TG",
    city: u.city || u.ville || null,
    quartier: u.quartier || null,
    address_line: u.addressLine || u.address_line || null,
    national_id_number: u.nationalIdNumber || u.national_id_number || null,
    tax_number: u.taxNumber || u.tax_number || null,
    business_registration_number: u.businessRegistrationNumber || u.business_registration_number || null,
    is_verified: Boolean(u.isVerified || u.is_verified),
    avatar_url: u.avatarUrl || u.avatar_url || null
  };
}

/**
 * Convert order object to relational Supabase columns
 */
export function mapOrderToSupabaseRow(o: any) {
  return {
    id: String(o.id),
    user_id: o.userId || o.user_id || null,
    shop_id: o.shopId || o.shop_id || null,
    total_amount: Number(o.totalAmount || o.total_amount) || 0,
    currency_code: String(o.currencyCode || o.currency_code || "XOF").trim().toUpperCase(),
    exchange_rate_to_xof: Number(o.exchangeRateToXof || o.exchange_rate_to_xof) || 1.0,
    payment_method: o.paymentMethod || o.payment_method || null,
    payment_status: o.paymentStatus || o.payment_status || "En attente",
    order_status: o.orderStatus || o.order_status || "En attente",
    destination_country_code: String(o.shippingDetails?.countryCode || o.destination_country_code || "TG").trim().toUpperCase(),
    destination_city: o.shippingDetails?.city || o.destination_city || null,
    destination_address: o.shippingDetails?.address || o.shippingDetails?.quartier || o.destination_address || null,
    recipient_name: o.shippingDetails?.name || o.recipient_name || null,
    recipient_phone: o.shippingDetails?.phone || o.recipient_phone || null,
    notes: o.shippingDetails?.notes || o.notes || null,
    shipping_fee: Number(o.shippingFee || o.shipping_fee) || 0,
    is_cross_border: Boolean(o.isCrossBorder || o.is_cross_border),
    split_processed: Boolean(o.splitProcessed || o.split_processed)
  };
}

/**
 * Sync single product to relational `public.products` table in Supabase
 */
export async function syncProductToSupabaseTable(product: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: "Client Supabase non initialisé." };

  const allowedCols = await getProductTableColumns(client);
  const row = mapProductToSupabaseRow(product, allowedCols);

  try {
    const { error } = await client
      .from("products")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.warn(`⚠️ [Supabase Relational] Erreur d'enregistrement produit "${row.nom}":`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`✨ [Supabase Relational] Produit synchronisé avec succès : ${row.nom} (ID: ${row.id})`);
    return { success: true };
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Relational] Exception lors de la sauvegarde produit:`, err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Delete product from relational `public.products` table in Supabase
 */
export async function deleteProductFromSupabaseTable(productId: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: "Client Supabase non initialisé." };

  try {
    const { error } = await client
      .from("products")
      .delete()
      .eq("id", String(productId));

    if (error) {
      console.warn(`⚠️ [Supabase Relational] Erreur de suppression produit ${productId}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`🗑️ [Supabase Relational] Produit supprimé avec succès : ${productId}`);
    return { success: true };
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Relational] Exception lors de la suppression produit:`, err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sync all products in batch to relational `public.products` table in Supabase
 * Processed in chunks of 50 to guarantee idempotency and avoid payload limits
 */
export async function syncAllProductsToSupabaseTable(products: any[]): Promise<{
  success: boolean;
  total: number;
  synced: number;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(products) || products.length === 0) {
    return { success: false, total: products ? products.length : 0, synced: 0, error: "Client Supabase non initialisé ou aucun produit fourni." };
  }

  const allowedCols = await getProductTableColumns(client);
  const rows = products.map((p) => mapProductToSupabaseRow(p, allowedCols));
  const CHUNK_SIZE = 50;
  let synced = 0;

  try {
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { error } = await client
        .from("products")
        .upsert(chunk, { onConflict: "id" });

      if (error) {
        console.warn(`⚠️ [Supabase Relational] Erreur synchronisation lot ${i / CHUNK_SIZE + 1}:`, error.message);
        return { success: false, total: rows.length, synced, error: error.message };
      }
      synced += chunk.length;
    }

    console.log(`✨ [Supabase Relational] ${synced}/${rows.length} produits synchronisés sans doublon dans 'public.products' !`);
    return { success: true, total: rows.length, synced };
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Relational] Exception lors de la synchronisation:`, err.message || err);
    return { success: false, total: rows.length, synced, error: err.message || String(err) };
  }
}

/**
 * Migration helper to sync products from local JSON file to Supabase public.products table
 */
export async function migrateProductsFileToSupabase(): Promise<{
  totalCount: number;
  uniqueCount: number;
  hasDuplicates: boolean;
  sampleIds: string[];
  supabaseConnected: boolean;
  syncedToRelational: boolean;
  syncedCount: number;
  error?: string;
}> {
  loadEnv();
  const filePath = fs.existsSync(path.join(process.cwd(), "produits.json"))
    ? path.join(process.cwd(), "produits.json")
    : path.join(process.cwd(), "products.json");

  if (!fs.existsSync(filePath)) {
    return {
      totalCount: 0,
      uniqueCount: 0,
      hasDuplicates: false,
      sampleIds: [],
      supabaseConnected: false,
      syncedToRelational: false,
      syncedCount: 0,
      error: "Fichier de produits local introuvable."
    };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const products: any[] = JSON.parse(content);
  const totalCount = products.length;
  const ids = products.map(p => String(p.id));
  const uniqueCount = new Set(ids).size;
  const sampleIds = ids.slice(0, 5);

  const client = getSupabaseClient();
  if (!client) {
    return {
      totalCount,
      uniqueCount,
      hasDuplicates: totalCount !== uniqueCount,
      sampleIds,
      supabaseConnected: false,
      syncedToRelational: false,
      syncedCount: 0,
      error: "Supabase n'est pas encore connecté. Configurez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY."
    };
  }

  const result = await syncAllProductsToSupabaseTable(products);
  return {
    totalCount,
    uniqueCount,
    hasDuplicates: totalCount !== uniqueCount,
    sampleIds,
    supabaseConnected: true,
    syncedToRelational: result.success,
    syncedCount: result.synced,
    error: result.error
  };
}

/**
 * Load products directly from relational `public.products` table in Supabase
 */
export async function loadProductsFromSupabaseTable(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn(`⚠️ [Supabase Relational] Table 'products' non accessible:`, error.message);
      return null;
    }

    if (Array.isArray(data)) {
      console.log(`📥 [Supabase Relational] ${data.length} produits chargés depuis la table 'products'`);
      return data.map(mapSupabaseRowToProduct);
    }

    return null;
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Relational] Exception lecture produits:`, err.message || err);
    return null;
  }
}

let storageBucketsEnsured = false;

/**
 * Ensures required storage buckets ('products' and 'app-data') exist in Supabase Storage.
 */
export async function ensureStorageBuckets(): Promise<void> {
  if (storageBucketsEnsured) return;
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { data: buckets } = await client.storage.listBuckets();
    const existing = new Set((buckets || []).map((b: any) => b.name));

    if (!existing.has("products")) {
      await client.storage.createBucket("products", {
        public: true,
        fileSizeLimit: 15728640, // 15MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]
      });
      console.log("📦 [Supabase Storage] Bucket 'products' créé avec succès.");
    }

    if (!existing.has("app-data")) {
      await client.storage.createBucket("app-data", {
        public: true
      });
      console.log("📦 [Supabase Storage] Bucket 'app-data' créé avec succès.");
    }

    storageBucketsEnsured = true;
  } catch (err) {
    console.warn("⚠️ [Supabase Storage] Vérification buckets:", err);
  }
}

/**
 * Upload an image buffer to the public 'products' Supabase Storage bucket.
 */
export async function uploadImageToSupabaseStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: "Client Supabase non initialisé." };
  }

  try {
    await ensureStorageBuckets();

    const safeExt = (contentType.split("/")[1] || "jpg").replace(/[^a-zA-Z0-9]/g, "");
    const safeBaseName = (fileName || "image")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeBaseName}.${safeExt}`;

    const { error } = await client.storage.from("products").upload(uniqueFileName, buffer, {
      contentType: contentType || "image/jpeg",
      upsert: true
    });

    if (error) {
      console.error("🔴 [Supabase Storage Upload] Erreur:", error.message);
      return { success: false, error: error.message };
    }

    const { data: pubData } = client.storage.from("products").getPublicUrl(uniqueFileName);
    const publicUrl = pubData.publicUrl;

    console.log(`📸 [Supabase Storage] Image téléversée avec succès: ${publicUrl}`);
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("🔴 [Supabase Storage Upload] Exception:", err);
    return { success: false, error: err.message || "Erreur de téléversement vers Supabase Storage." };
  }
}

/**
 * Delete an image from 'products' bucket if it resides on Supabase Storage.
 */
export async function deleteImageFromSupabaseStorage(imageUrl: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !imageUrl) return false;

  try {
    if (!imageUrl.includes("/products/")) {
      return false;
    }
    const parts = imageUrl.split("/products/");
    const filePath = parts[1]?.split("?")[0];
    if (!filePath) return false;

    const { error } = await client.storage.from("products").remove([filePath]);
    if (error) {
      console.warn("⚠️ [Supabase Storage Delete] Erreur:", error.message);
      return false;
    }
    console.log(`🗑️ [Supabase Storage] Ancienne image supprimée: ${filePath}`);
    return true;
  } catch (e) {
    console.warn("⚠️ [Supabase Storage Delete] Exception:", e);
    return false;
  }
}

/**
 * Persist app data document to Supabase Storage 'app-data' bucket (single source of truth on Vercel).
 */
export async function saveAppData(key: string, data: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const cleanKey = key.replace(/\\/g, "/").split("/").pop() || key;
  try {
    await ensureStorageBuckets();
    const jsonStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonStr, "utf-8");

    const { error } = await client.storage.from("app-data").upload(cleanKey, buffer, {
      contentType: "application/json",
      upsert: true
    });

    if (error) {
      console.warn(`⚠️ [Supabase app-data] Erreur sauvegarde "${cleanKey}":`, error.message);
      return false;
    }
    return true;
  } catch (e: any) {
    console.warn(`⚠️ [Supabase app-data] Exception sauvegarde "${cleanKey}":`, e.message || e);
    return false;
  }
}

/**
 * Load app data document from Supabase Storage 'app-data' bucket.
 */
export async function loadAppData<T>(key: string, fallback: T): Promise<T> {
  const client = getSupabaseClient();
  if (!client) return fallback;

  const cleanKey = key.replace(/\\/g, "/").split("/").pop() || key;
  try {
    const { data, error } = await client.storage.from("app-data").download(cleanKey);
    if (error || !data) {
      return fallback;
    }
    const text = await data.text();
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Record a deleted product ID into persistent tombstone blacklist in Supabase.
 */
export async function recordTombstoneInSupabase(productId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const idStr = String(productId).trim();
  if (!idStr) return;

  try {
    const list = await loadAppData<any[]>("deleted_products.json", []);
    const existing = new Set(list.map((item: any) => typeof item === "string" ? item : (item?.id ? String(item.id) : "")).filter(Boolean));
    if (!existing.has(idStr)) {
      list.push({ id: idStr, deletedAt: new Date().toISOString() });
      await saveAppData("deleted_products.json", list);
      console.log(`🛡️ [Tombstone Supabase] Produit "${idStr}" enregistré dans la blacklist persistante (total: ${list.length}).`);
    }
  } catch (e) {
    console.warn("⚠️ [Tombstone Supabase] Erreur:", e);
  }
}

/**
 * Load tombstone blacklist IDs from Supabase.
 */
export async function loadTombstonesFromSupabase(): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const list = await loadAppData<any[]>("deleted_products.json", []);
    return list.map((item: any) => typeof item === "string" ? item : (item?.id ? String(item.id) : "")).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Save a document key-value pair to Supabase (uses 'app-data' bucket & asime_store if present).
 */
export async function saveToSupabaseStore(key: string, value: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const cleanKey = key.replace(/\\/g, "/").split("/").pop() || key;

  // Persist to app-data bucket
  await saveAppData(cleanKey, value);

  // Also try relational / asime_store if table exists
  try {
    let { error } = await client
      .from("asime_store")
      .upsert(
        { key: cleanKey, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error && error.message?.includes("column \"value\"")) {
      await client
        .from("asime_store")
        .upsert(
          { key: cleanKey, data: value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Load a document from Supabase (checks app-data bucket first, then relational products, then asime_store).
 */
export async function loadFromSupabaseStore(key: string): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const cleanKey = key.replace(/\\/g, "/").split("/").pop() || key;

  // If loading products, try relational table first (ONLY for active catalog files, NEVER for deleted_products)
  if (cleanKey === "produits.json" || cleanKey === "products.json") {
    const relationalProducts = await loadProductsFromSupabaseTable();
    if (relationalProducts && relationalProducts.length > 0) {
      return relationalProducts;
    }
  }

  // Load from app-data bucket
  const appData = await loadAppData<any>(cleanKey, null);
  if (appData !== null) {
    return appData;
  }

  try {
    const { data, error } = await client
      .from("asime_store")
      .select("*")
      .eq("key", cleanKey)
      .maybeSingle();

    if (!error && data) {
      const storeVal = data.value !== undefined ? data.value : data.data;
      if (storeVal !== undefined && storeVal !== null) {
        return storeVal;
      }
    }
  } catch {}

  return null;
}

export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  urlConfigured: boolean;
  keyConfigured: boolean;
  usingServiceRole?: boolean;
  url?: string;
  tableExists?: boolean;
  tables?: { products: boolean; asime_store: boolean };
  panafricanTables?: Record<string, boolean>;
  allTablesReady?: boolean;
  error?: string;
  message?: string;
}> {
  loadEnv();
  let url = (process.env.SUPABASE_URL || "").trim();
  if (url) {
    url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  }
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
  const key = serviceRoleKey || anonKey;

  const urlConfigured = Boolean(url);
  const keyConfigured = Boolean(key);
  const usingServiceRole = Boolean(serviceRoleKey);

  if (!urlConfigured || !keyConfigured) {
    return {
      configured: false,
      connected: false,
      urlConfigured,
      keyConfigured,
      usingServiceRole,
      error: "Variables d'environnement requises : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY."
    };
  }

  const client = getSupabaseClient(true);
  if (!client) {
    return {
      configured: true,
      connected: false,
      urlConfigured,
      keyConfigured,
      usingServiceRole,
      error: "Impossible d'initialiser le client Supabase."
    };
  }

  try {
    const cleanUrl = url.replace(/\/+$/, "");

    // 1. Tester la connectivité et l'authentification réseau avec l'API Supabase
    try {
      const pingRes = await fetch(`${cleanUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      });

      if (!pingRes.ok) {
        if (pingRes.status === 401 || pingRes.status === 403) {
          return {
            configured: true,
            connected: false,
            urlConfigured: true,
            keyConfigured: true,
            usingServiceRole,
            url: cleanUrl,
            error: `Authentification Supabase rejetée (HTTP ${pingRes.status}). Vérifiez SUPABASE_SERVICE_ROLE_KEY.`
          };
        }
      }
    } catch (netErr: any) {
      return {
        configured: true,
        connected: false,
        urlConfigured: true,
        keyConfigured: true,
        usingServiceRole,
        url: cleanUrl,
        error: `Impossible de joindre le serveur Supabase (${cleanUrl}) : ${netErr.message || netErr}`
      };
    }

    // 2. Vérification informative de l'état des tables de la marketplace panafricaine
    const tableStatus: Record<string, boolean> = {
      countries: false,
      currencies: false,
      categories: false,
      profiles: false,
      shops: false,
      products: false,
      orders: false,
      order_items: false,
      asime_store: false
    };

    await Promise.all([
      client.from("countries").select("code").limit(1).then(({ error }) => { if (!error) tableStatus.countries = true; }),
      client.from("currencies").select("code").limit(1).then(({ error }) => { if (!error) tableStatus.currencies = true; }),
      client.from("categories").select("id").limit(1).then(({ error }) => { if (!error) tableStatus.categories = true; }),
      client.from("profiles").select("id").limit(1).then(({ error }) => { if (!error) tableStatus.profiles = true; }),
      client.from("shops").select("id").limit(1).then(({ error }) => { if (!error) tableStatus.shops = true; }),
      client.from("products").select("id").limit(1).then(({ error }) => { if (!error) tableStatus.products = true; }),
      client.from("orders").select("id").limit(1).then(({ error }) => { if (!error) tableStatus.orders = true; }),
      client.from("order_items").select("id").limit(1).then(({ error }) => { if (!error) tableStatus.order_items = true; }),
      client.from("asime_store").select("key").limit(1).then(({ error }) => { if (!error) tableStatus.asime_store = true; })
    ]).catch(() => {});

    const anyTableExists = Object.values(tableStatus).some(Boolean);
    const allTablesExist = Object.values(tableStatus).every(Boolean);

    return {
      configured: true,
      connected: true,
      urlConfigured: true,
      keyConfigured: true,
      usingServiceRole,
      url: cleanUrl,
      tableExists: anyTableExists,
      tables: {
        products: tableStatus.products,
        asime_store: tableStatus.asime_store
      },
      panafricanTables: tableStatus,
      allTablesReady: allTablesExist,
      message: allTablesExist
        ? "Connexion Supabase active et toutes les tables panafricaines sont prêtes !"
        : (anyTableExists
            ? "Connexion Supabase active. Certaines tables sont déjà initialisées."
            : "Connexion Supabase active avec succès (exécutez le script SQL fourni pour initialiser les tables).")
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      urlConfigured: true,
      keyConfigured: true,
      usingServiceRole,
      error: err.message || "Erreur lors du test de connexion Supabase."
    };
  }
}

let instructionsPrinted = false;
export function printSetupInstructions() {
  if (instructionsPrinted) return;
  instructionsPrinted = true;
  console.log("⚡ [Supabase] Architecture panafricaine prête. Fichier SQL disponible dans /supabase_panafrican_schema.sql");
}

let serviceRoleClientInstance: SupabaseClient | null = null;
let currentServiceUrl = "";
let currentServiceKey = "";

/**
 * Returns a Supabase client strictly initialized with server privileges (SUPABASE_SERVICE_ROLE_KEY)
 * required to execute SECURITY DEFINER RPC functions such as process_order_revenue_split.
 * Never falls back to SUPABASE_ANON_KEY.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  loadEnv();
  let url = (process.env.SUPABASE_URL || "").trim();
  if (url) {
    url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  }
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !serviceRoleKey) {
    return null;
  }

  if (
    serviceRoleClientInstance &&
    currentServiceUrl === url &&
    currentServiceKey === serviceRoleKey
  ) {
    return serviceRoleClientInstance;
  }

  try {
    serviceRoleClientInstance = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    currentServiceUrl = url;
    currentServiceKey = serviceRoleKey;
    return serviceRoleClientInstance;
  } catch (err) {
    console.error("🔴 [Supabase Service Role] Échec initialisation client serveur :", err);
    return null;
  }
}

/**
 * Retrieves the existing split_summary and financial columns for an order directly from Supabase.
 */
export async function getOrderSplitSummaryFromSupabase(
  client: SupabaseClient,
  orderId: string
): Promise<{
  split_processed: boolean;
  split_summary: any | null;
  seller_earnings?: number;
  platform_gross_commission?: number;
  affiliate_commission?: number;
  platform_net_commission?: number;
  currency_code?: string;
} | null> {
  const cleanId = String(orderId || "").trim();
  if (!cleanId) return null;

  const { data, error } = await client
    .from("orders")
    .select(
      "id, split_processed, split_summary, seller_earnings, platform_gross_commission, affiliate_commission, platform_net_commission, currency_code"
    )
    .eq("id", cleanId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur lecture split_summary Supabase (#${cleanId}): ${error.message}`);
  }

  if (!data) return null;

  return {
    split_processed: Boolean(data.split_processed),
    split_summary: data.split_summary && typeof data.split_summary === "object" ? data.split_summary : null,
    seller_earnings: data.seller_earnings !== null && data.seller_earnings !== undefined ? Number(data.seller_earnings) : undefined,
    platform_gross_commission:
      data.platform_gross_commission !== null && data.platform_gross_commission !== undefined
        ? Number(data.platform_gross_commission)
        : undefined,
    affiliate_commission:
      data.affiliate_commission !== null && data.affiliate_commission !== undefined
        ? Number(data.affiliate_commission)
        : undefined,
    platform_net_commission:
      data.platform_net_commission !== null && data.platform_net_commission !== undefined
        ? Number(data.platform_net_commission)
        : undefined,
    currency_code: data.currency_code || undefined
  };
}

/**
 * Ensures the paid order, its order_items, and related profiles exist in Supabase
 * so that `process_order_revenue_split(p_order_id)` can execute atomically as source of truth.
 * Multi-instance safe:
 * - Never resets split_processed to false on an existing row.
 * - Uses ON CONFLICT DO NOTHING (ignoreDuplicates: true) for order creation and order_items insertion.
 */
export async function ensureOrderReadyForSupabaseSplit(
  client: SupabaseClient,
  order: any,
  users: any[],
  affiliateUserId: string | null,
  validAffiliateCode: string | null
): Promise<{ ready: boolean; alreadyProcessed?: boolean; existingSummary?: any; error?: string }> {
  const orderId = String(order.id).trim();
  const orderCurrency = String(
    order.currencyCode ||
    (order.destinationCountryCode === "CM" || order.clientCountryCode === "CM" ? "XAF" : "XOF")
  ).trim().toUpperCase();
  const totalAmount = Number(order.totalAmount || 0);
  const countryCode = String(
    order.destinationCountryCode ||
    order.clientCountryCode ||
    order.shippingDetails?.countryCode ||
    "TG"
  ).trim().toUpperCase();

  try {
    // 1. Check if order already exists in public.orders
    const { data: existingOrder, error: existingOrderErr } = await client
      .from("orders")
      .select("id, payment_status, split_processed, split_summary")
      .eq("id", orderId)
      .maybeSingle();

    if (existingOrderErr) {
      return {
        ready: false,
        error: `Erreur vérification commande Supabase (#${orderId}): ${existingOrderErr.message}`
      };
    }

    if (existingOrder?.split_processed === true) {
      return {
        ready: true,
        alreadyProcessed: true,
        existingSummary:
          existingOrder.split_summary && typeof existingOrder.split_summary === "object"
            ? existingOrder.split_summary
            : undefined
      };
    }

    // 2. Resolve buyer, affiliate, and seller profiles so foreign keys and RPC validations succeed
    const buyerId = String(order.userId || ("buyer_" + orderId)).trim();
    const clientName = String(order.clientName || order.shippingDetails?.name || "Client Miabé Asi").trim();
    const clientPhone = String(order.clientPhone || order.shippingDetails?.phone || "+22890000000").trim();

    const profilesToEnsure: Record<string, any>[] = [
      {
        id: buyerId,
        full_name: clientName,
        role: "client",
        country_code: countryCode,
        is_verified: true
      }
    ];

    if (affiliateUserId) {
      const affUser = users.find(u => u.id === affiliateUserId);
      profilesToEnsure.push({
        id: affiliateUserId,
        full_name: String(affUser?.name || "Affilié Miabé Asi").trim(),
        role: "affilie",
        country_code: String(affUser?.countryCode || "TG").trim().toUpperCase(),
        affiliate_code: validAffiliateCode || affUser?.affiliateCode || null,
        is_verified: true
      });
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const resolvedItems: {
      id: string;
      order_id: string;
      product_id: string | null;
      product_name: string;
      vendeur_id: string;
      unit_price: number;
      quantity: number;
      subtotal: number;
      currency_code: string;
    }[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const prod = item.product || {};
      const partnerName = String(prod.partenaire || "Boutique en Direct").trim();
      const sellerUser = users.find(
        u =>
          u.role === "vendeur" &&
          (u.id === prod.vendeurId || u.businessName === partnerName || u.name === partnerName)
      );
      const sellerId = String(
        prod.vendeurId ||
        sellerUser?.id ||
        ("seller_" + partnerName.toLowerCase().replace(/[^a-z0-9]+/g, "_"))
      ).trim();

      if (!profilesToEnsure.some(p => p.id === sellerId)) {
        profilesToEnsure.push({
          id: sellerId,
          full_name: String(sellerUser?.businessName || sellerUser?.name || partnerName).trim(),
          role: "vendeur",
          country_code: String(sellerUser?.countryCode || prod.countryCode || "TG").trim().toUpperCase(),
          is_verified: true
        });
      }

      const qty = Math.max(1, Number(item.quantity || 1));
      const unitPrice = Number(prod.prix || 0);
      resolvedItems.push({
        id: `${orderId}_item_${idx + 1}`,
        order_id: orderId,
        product_id: prod.id ? String(prod.id) : null,
        product_name: String(prod.nom || `Article ${idx + 1}`).trim(),
        vendeur_id: sellerId,
        unit_price: unitPrice,
        quantity: qty,
        subtotal: unitPrice * qty,
        currency_code: orderCurrency
      });
    }

    for (const prof of profilesToEnsure) {
      const { error: profErr } = await client
        .from("profiles")
        .upsert(prof, { onConflict: "id", ignoreDuplicates: true });
      if (profErr) {
        return {
          ready: false,
          error: `Erreur synchronisation profil Supabase (${prof.id}): ${profErr.message}`
        };
      }
    }

    // 3. Create or update the order row in public.orders WITHOUT ever resetting split_processed to false
    if (!existingOrder) {
      const fullOrderRow: Record<string, any> = {
        id: orderId,
        numero_suivi: String(order.trackingNumber || order.numero_suivi || `TRK-${orderId}`),
        client_nom: clientName,
        client_telephone: clientPhone,
        user_id: buyerId,
        total_amount: totalAmount,
        currency_code: orderCurrency,
        payment_status: "paid",
        order_status: "completed",
        destination_country_code: countryCode,
        affiliate_id: affiliateUserId,
        affiliate_code: validAffiliateCode
      };

      const { error: insertOrderErr } = await client
        .from("orders")
        .upsert(fullOrderRow, { onConflict: "id", ignoreDuplicates: true });

      if (insertOrderErr) {
        // Fallback if legacy columns (numero_suivi, client_nom, client_telephone) are not present on target schema
        // Uses ignoreDuplicates: true (ON CONFLICT DO NOTHING) so it never overwrites split_processed
        const { error: fallbackOrderErr } = await client.from("orders").upsert(
          {
            id: orderId,
            user_id: buyerId,
            total_amount: totalAmount,
            currency_code: orderCurrency,
            payment_status: "paid",
            order_status: "completed",
            destination_country_code: countryCode,
            affiliate_id: affiliateUserId,
            affiliate_code: validAffiliateCode
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
        if (fallbackOrderErr) {
          return {
            ready: false,
            error: `Erreur insertion commande Supabase (#${orderId}): ${fallbackOrderErr.message}`
          };
        }
      }
    }

    // Transition payment_status to 'paid' ONLY if split_processed is still false
    const { error: updateOrderErr } = await client
      .from("orders")
      .update({
        payment_status: "paid",
        affiliate_id: affiliateUserId || null,
        affiliate_code: validAffiliateCode || null
      })
      .eq("id", orderId)
      .eq("split_processed", false);

    if (updateOrderErr) {
      return {
        ready: false,
        error: `Erreur mise à jour statut commande Supabase (#${orderId}): ${updateOrderErr.message}`
      };
    }

    // 4. Idempotent insertion of order_items using ON CONFLICT (id) DO NOTHING
    for (const itemRow of resolvedItems) {
      const { error: itemErr } = await client
        .from("order_items")
        .upsert(itemRow, { onConflict: "id", ignoreDuplicates: true });

      if (itemErr && itemRow.product_id) {
        // Retry with product_id = null if product_id is not yet synced in public.products
        const { error: retryItemErr } = await client
          .from("order_items")
          .upsert({ ...itemRow, product_id: null }, { onConflict: "id", ignoreDuplicates: true });

        if (retryItemErr) {
          return {
            ready: false,
            error: `Erreur insertion article commande Supabase (${itemRow.id}): ${retryItemErr.message}`
          };
        }
      } else if (itemErr) {
        return {
          ready: false,
          error: `Erreur insertion article commande Supabase (${itemRow.id}): ${itemErr.message}`
        };
      }
    }

    return { ready: true, alreadyProcessed: false };
  } catch (err: any) {
    console.error(`🔴 [Supabase Split Prep] Erreur préparation commande #${orderId}:`, err.message || err);
    return {
      ready: false,
      error: err.message || `Erreur préparation commande Supabase #${orderId}`
    };
  }
}

/**
 * Reads a user's wallet and ledger history directly from Supabase (`public.wallets` & `public.wallet_ledger`)
 * for a single requested currency, without ever mixing balances across multiple currencies.
 */
export async function getWalletFromSupabase(
  userId: string,
  role: "vendeur" | "affilie" = "vendeur",
  currencyCode: string = "XOF"
): Promise<any> {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("Service financier Supabase indisponible (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis).");
  }

  const targetCurrency = String(currencyCode || "XOF").trim().toUpperCase();

  const { data: walletRow, error: walletErr } = await client
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("wallet_type", role)
    .eq("currency_code", targetCurrency)
    .maybeSingle();

  if (walletErr) {
    throw new Error(`Erreur lecture portefeuille Supabase: ${walletErr.message}`);
  }

  const { data: ledgerRows, error: ledgerErr } = await client
    .from("wallet_ledger")
    .select("*")
    .eq("user_id", userId)
    .eq("wallet_type", role)
    .eq("currency_code", targetCurrency)
    .order("created_at", { ascending: false });

  if (ledgerErr) {
    throw new Error(`Erreur lecture journal financier Supabase: ${ledgerErr.message}`);
  }

  const history = (ledgerRows || []).map((entry: any) => ({
    id: String(entry.idempotency_key || entry.id),
    type:
      entry.operation_type === "CREDIT_COMMISSION_AFFILIE"
        ? "commission"
        : entry.operation_type === "DEBIT_RETRAIT"
        ? "retrait_demande"
        : entry.operation_type === "CREDIT_REMBOURSEMENT"
        ? "retrait_rembourse"
        : "vente",
    amount: Math.abs(Number(entry.amount || 0)),
    currencyCode: targetCurrency,
    orderId: entry.order_id || undefined,
    date: entry.created_at || new Date().toISOString(),
    description: entry.description || "",
    status: "completed"
  }));

  return {
    userId,
    balance: walletRow ? Number(walletRow.balance || 0) : 0,
    currencyCode: targetCurrency,
    type: role,
    history,
    ledger: history
  };
}

/**
 * Reads all wallets and their ledger histories from Supabase for admin inspection.
 * Never falls back to local files.
 */
export async function getAllWalletsFromSupabase(): Promise<Record<string, any>> {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("Service financier Supabase indisponible (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis).");
  }

  const { data: walletRows, error: walletErr } = await client
    .from("wallets")
    .select("*");

  if (walletErr) {
    throw new Error(`Erreur lecture portefeuilles Supabase: ${walletErr.message}`);
  }

  const { data: ledgerRows, error: ledgerErr } = await client
    .from("wallet_ledger")
    .select("*")
    .order("created_at", { ascending: false });

  if (ledgerErr) {
    throw new Error(`Erreur lecture journal financier Supabase: ${ledgerErr.message}`);
  }

  const result: Record<string, any> = {};
  for (const w of walletRows || []) {
    const curr = String(w.currency_code || "XOF").trim().toUpperCase();
    const key = w.user_id ? `${w.user_id}_${w.wallet_type}_${curr}` : `plateforme_${curr}`;
    const entries = (ledgerRows || []).filter(
      (l: any) => l.wallet_id === w.id && String(l.currency_code || "XOF").trim().toUpperCase() === curr
    );
    const mappedEntries = entries.map((entry: any) => ({
      id: String(entry.idempotency_key || entry.id),
      type:
        entry.operation_type === "CREDIT_COMMISSION_AFFILIE"
          ? "commission"
          : entry.operation_type === "DEBIT_RETRAIT"
          ? "retrait_demande"
          : entry.operation_type === "CREDIT_REMBOURSEMENT"
          ? "retrait_rembourse"
          : "vente",
      amount: Math.abs(Number(entry.amount || 0)),
      currencyCode: curr,
      orderId: entry.order_id || undefined,
      date: entry.created_at || new Date().toISOString(),
      description: entry.description || "",
      status: "completed"
    }));
    result[key] = {
      userId: w.user_id || `plateforme_${curr}`,
      balance: Number(w.balance || 0),
      currencyCode: curr,
      type: w.wallet_type,
      history: mappedEntries,
      ledger: mappedEntries
    };
  }

  return result;
}

/**
 * Reads the immutable financial ledger logs from Supabase (`public.wallet_ledger`).
 * Never falls back to local files.
 */
export async function getWalletLedgerLogsFromSupabase(): Promise<any[]> {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("Service financier Supabase indisponible (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis).");
  }

  const { data: ledgerRows, error } = await client
    .from("wallet_ledger")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erreur lecture journal financier Supabase: ${error.message}`);
  }

  return (ledgerRows || []).map((entry: any) => ({
    id: String(entry.id),
    timestamp: entry.created_at || new Date().toISOString(),
    userId: entry.user_id || "PLATEFORME_MIABE_ASI",
    action:
      entry.operation_type === "CREDIT_COMMISSION_AFFILIE"
        ? "CREDIT_COMMISSION"
        : entry.operation_type === "DEBIT_RETRAIT"
        ? "DEBIT_WITHDRAWAL"
        : entry.operation_type === "CREDIT_REMBOURSEMENT"
        ? "REFUND_WITHDRAWAL"
        : "CREDIT_SALE",
    amount: Number(entry.amount || 0),
    currencyCode: entry.currency_code || "XOF",
    orderId: entry.order_id || undefined,
    txId: String(entry.idempotency_key || entry.id),
    message: entry.description || ""
  }));
}



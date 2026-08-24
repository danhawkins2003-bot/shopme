import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let isInitialized = false;

/**
 * Lazy initialization of Supabase client to prevent startup crashes if keys are not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (isInitialized) {
    return supabaseInstance;
  }

  isInitialized = true;
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false
        }
      });
      console.log("🟢 [Supabase] Client initialisé avec succès.");
    } catch (err) {
      console.error("🔴 [Supabase] Échec de l'initialisation du client :", err);
    }
  } else {
    console.log("ℹ️ [Supabase] Non configuré ou clés manquantes. Mode persistance locale JSON actif.");
  }

  return supabaseInstance;
}

/**
 * Returns true if Supabase integration is active.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

/**
 * Convert application product object to relational Supabase columns
 */
export function mapProductToSupabaseRow(p: any) {
  return {
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
}

/**
 * Convert relational Supabase row to application product object
 */
export function mapSupabaseRowToProduct(row: any) {
  return {
    id: String(row.id),
    nom: row.nom || "",
    description: row.description || "",
    prix: Number(row.prix) || 0,
    prixBarre: row.prix_barre ? Number(row.prix_barre) : null,
    categorie: row.categorie || "Général",
    stock: typeof row.stock !== "undefined" ? Number(row.stock) : 0,
    phare: Boolean(row.phare),
    images: Array.isArray(row.images) ? row.images : (typeof row.images === "string" ? [row.images] : []),
    partenaire: row.partenaire || "Boutique en Direct",
    lienAffilie: row.lien_affilie || row.lienAffilie || ""
  };
}

/**
 * Sync single product to relational `public.products` table in Supabase
 */
export async function syncProductToSupabaseTable(product: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const row = mapProductToSupabaseRow(product);

  try {
    const { error } = await client
      .from("products")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.warn(`⚠️ [Supabase Relational] Erreur d'enregistrement produit "${row.nom}":`, error.message);
      return false;
    }

    console.log(`✨ [Supabase Relational] Produit synchronisé avec succès : ${row.nom} (ID: ${row.id})`);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Relational] Exception lors de la sauvegarde produit:`, err.message || err);
    return false;
  }
}

/**
 * Delete product from relational `public.products` table in Supabase
 */
export async function deleteProductFromSupabaseTable(productId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from("products")
      .delete()
      .eq("id", String(productId));

    if (error) {
      console.warn(`⚠️ [Supabase Relational] Erreur de suppression produit ${productId}:`, error.message);
      return false;
    }

    console.log(`🗑️ [Supabase Relational] Produit supprimé avec succès : ${productId}`);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Relational] Exception lors de la suppression produit:`, err.message || err);
    return false;
  }
}

/**
 * Sync all products in batch to relational `public.products` table in Supabase
 */
export async function syncAllProductsToSupabaseTable(products: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(products) || products.length === 0) return false;

  const rows = products.map(mapProductToSupabaseRow);

  try {
    const { error } = await client
      .from("products")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      console.warn(`⚠️ [Supabase Relational] Erreur synchronisation de masse des produits:`, error.message);
      return false;
    }

    console.log(`✨ [Supabase Relational] ${rows.length} produits synchronisés dans la table 'products' !`);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Relational] Exception lors de la synchronisation de masse:`, err.message || err);
    return false;
  }
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

/**
 * Save a document key-value pair to the `asime_store` table in Supabase (Backup storage).
 */
export async function saveToSupabaseStore(key: string, value: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const cleanKey = key.replace(/\\/g, "/").split("/").pop() || key;

  // Also sync relational products table if the key is products
  if (cleanKey.toLowerCase().includes("produit") || cleanKey.toLowerCase().includes("product")) {
    if (Array.isArray(value)) {
      syncAllProductsToSupabaseTable(value).catch(() => {});
    }
  }

  try {
    let { error } = await client
      .from("asime_store")
      .upsert(
        { key: cleanKey, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error && error.message?.includes("column \"value\"")) {
      const retryRes = await client
        .from("asime_store")
        .upsert(
          { key: cleanKey, data: value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      error = retryRes.error;
    }

    if (error) {
      console.warn(`⚠️ [Supabase Store] Info pour clé "${cleanKey}":`, error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn(`⚠️ [Supabase Store] Exception pour "${cleanKey}":`, err.message || err);
    return false;
  }
}

/**
 * Load a document from the `asime_store` table in Supabase.
 */
export async function loadFromSupabaseStore(key: string): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const cleanKey = key.replace(/\\/g, "/").split("/").pop() || key;

  // If loading products, try relational table first
  if (cleanKey.toLowerCase().includes("produit") || cleanKey.toLowerCase().includes("product")) {
    const relationalProducts = await loadProductsFromSupabaseTable();
    if (relationalProducts && relationalProducts.length > 0) {
      return relationalProducts;
    }
  }

  try {
    const { data, error } = await client
      .from("asime_store")
      .select("*")
      .eq("key", cleanKey)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (data) {
      const storeVal = data.value !== undefined ? data.value : data.data;
      if (storeVal !== undefined && storeVal !== null) {
        return storeVal;
      }
    }

    return null;
  } catch (err: any) {
    return null;
  }
}

export async function checkSupabaseHealth(): Promise<{ configured: boolean; connected: boolean; urlConfigured: boolean; keyConfigured: boolean; tableExists?: boolean; error?: string }> {
  const urlConfigured = Boolean(process.env.SUPABASE_URL);
  const keyConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
  const client = getSupabaseClient();

  if (!client) {
    return {
      configured: false,
      connected: false,
      urlConfigured,
      keyConfigured,
      error: "Variables d'environnement SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY non définies."
    };
  }

  try {
    const { error: relError } = await client
      .from("products")
      .select("id")
      .limit(1);

    if (!relError) {
      return {
        configured: true,
        connected: true,
        urlConfigured,
        keyConfigured,
        tableExists: true
      };
    }

    const { error: kvError } = await client
      .from("asime_store")
      .select("key")
      .limit(1);

    if (!kvError) {
      return {
        configured: true,
        connected: true,
        urlConfigured,
        keyConfigured,
        tableExists: true
      };
    }

    return {
      configured: true,
      connected: false,
      urlConfigured,
      keyConfigured,
      tableExists: false,
      error: "Tables 'products' et 'asime_store' non trouvées. Exécutez le script SQL dans Supabase."
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      urlConfigured,
      keyConfigured,
      error: err.message || "Erreur lors du test de connexion Supabase."
    };
  }
}

let instructionsPrinted = false;
export function printSetupInstructions() {
  if (instructionsPrinted) return;
  instructionsPrinted = true;
  console.log("⚡ [Supabase] Pour synchroniser votre base de données, exécutez le script SQL dans votre console Supabase.");
}


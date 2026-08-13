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
 * Save a document key-value pair to the `asime_store` table in Supabase.
 * Falls back silently on any error.
 */
export async function saveToSupabaseStore(key: string, value: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const cleanKey = key.replace(/\\/g, "/").split("/").pop() || key;

  try {
    const { error } = await client
      .from("asime_store")
      .upsert(
        { key: cleanKey, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) {
      // If table doesn't exist yet, guide the user on how to create it
      if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        printSetupInstructions();
      }
      console.error(`⚠️ [Supabase] Erreur d'enregistrement pour la clé "${cleanKey}":`, error.message);
      return false;
    }

    console.log(`✨ [Supabase] Synchronisation réussie pour : ${cleanKey}`);
    return true;
  } catch (err: any) {
    console.error(`⚠️ [Supabase] Exception lors de la sauvegarde de "${cleanKey}":`, err.message || err);
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

  try {
    const { data, error } = await client
      .from("asime_store")
      .select("value")
      .eq("key", cleanKey)
      .maybeSingle();

    if (error) {
      if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
        printSetupInstructions();
      }
      console.error(`⚠️ [Supabase] Erreur de lecture pour la clé "${cleanKey}":`, error.message);
      return null;
    }

    if (data && data.value) {
      console.log(`📥 [Supabase] Données restaurées depuis le Cloud pour : ${cleanKey}`);
      return data.value;
    }

    return null;
  } catch (err: any) {
    console.error(`⚠️ [Supabase] Exception lors du chargement de "${cleanKey}":`, err.message || err);
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
    const { data, error } = await client
      .from("asime_store")
      .select("key")
      .limit(1);

    if (error) {
      const tableMissing = error.message?.includes("relation") || error.message?.includes("does not exist") || error.code === "PGRST116";
      return {
        configured: true,
        connected: false,
        urlConfigured,
        keyConfigured,
        tableExists: !tableMissing,
        error: tableMissing
          ? "Table 'asime_store' non trouvée. Veuillez exécuter le script SQL de création dans Supabase."
          : error.message
      };
    }

    return {
      configured: true,
      connected: true,
      urlConfigured,
      keyConfigured,
      tableExists: true
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

/**
 * Print SQL schema instructions for the user to copy/paste into Supabase Dashboard SQL Editor
 */
export function printSetupInstructions() {
  if (instructionsPrinted) return;
  instructionsPrinted = true;

  console.log(`
======================================================================
⚡ [Supabase Setup] CONFIGURATION REQUISE POUR VOTRE BASE DE DONNÉES ⚡
======================================================================
Pour activer la persistance cloud Supabase, veuillez créer la table 
'asime_store' dans l'éditeur SQL de votre tableau de bord Supabase :

1. Allez sur https://supabase.com
2. Accédez à votre projet -> Éditeur SQL (SQL Editor)
3. Cliquez sur "New query" et exécutez le script SQL suivant :

------------------ COPIER LE CODE CI-DESSOUS ------------------

CREATE TABLE IF NOT EXISTS asime_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activez le contournement RLS ou désactivez-le pour cette table de stockage
ALTER TABLE asime_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all service/anon access to store" ON asime_store
  FOR ALL TO public USING (true) WITH CHECK (true);

------------------ FIN DU CODE ------------------

4. Définissez les variables d'environnement 'SUPABASE_URL' et 
   'SUPABASE_SERVICE_ROLE_KEY' (ou 'SUPABASE_ANON_KEY') dans vos paramètres d'application.
======================================================================
  `);
}

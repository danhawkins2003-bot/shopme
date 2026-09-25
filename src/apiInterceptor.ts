import { isSupportedCountry, getCountryByCode } from "./data/westAfricanCountries";

const defaultProducts: any[] = [];
const defaultBlogs: any[] = [];

const memoryStorage: Record<string, string> = {};
const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return memoryStorage[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  },
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      for (const k in memoryStorage) {
        delete memoryStorage[k];
      }
    }
  }
};
export {};
const localStorage = safeLocalStorage;

// Keep a reference to the native fetch, bound to window to prevent "Illegal invocation" errors in browsers
const originalFetch = typeof window !== "undefined" && window.fetch ? window.fetch.bind(window) : fetch;

// Custom emulator state
const isStaticHost = typeof window !== "undefined" && (
  window.location.hostname.includes("vercel.app") || 
  window.location.hostname.includes("github.io") || 
  window.location.hostname.includes("netlify.app") ||
  window.location.hostname.includes("shopme-eosin")
);
let useLocalEmulation: boolean | null = isStaticHost ? true : false;

// Helper to construct a standard mock JSON Response using standard browser Response
function makeResponse(data: any, status: number = 200, ok: boolean = true): Response {
  const jsonStr = JSON.stringify(data);
  return new Response(jsonStr, {
    status: status,
    statusText: ok ? "OK" : "Error",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// Helper to look up Auth header in any format (Headers, Array, or Record)
function getAuthHeader(init?: RequestInit): string | null {
  if (!init || !init.headers) return null;
  if (init.headers instanceof Headers) {
    return init.headers.get("Authorization") || init.headers.get("authorization");
  } else if (Array.isArray(init.headers)) {
    const pair = init.headers.find(p => p[0].toLowerCase() === "authorization");
    return pair ? pair[1] : null;
  } else {
    const record = init.headers as Record<string, string>;
    return record["Authorization"] || record["authorization"] || null;
  }
}

// Simple synchronous hash representation for local passwords
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return "hash_" + Math.abs(hash).toString(16);
}

// Initialize LocalStorage collections if they do not exist
function initLocalStorage() {
  const existingProds = localStorage.getItem("asime_emulated_products");
  if (!existingProds) {
    localStorage.setItem("asime_emulated_products", JSON.stringify(defaultProducts));
  }
  if (!localStorage.getItem("asime_emulated_blogs")) {
    localStorage.setItem("asime_emulated_blogs", JSON.stringify(defaultBlogs));
  }
  if (!localStorage.getItem("asime_emulated_users")) {
    localStorage.setItem("asime_emulated_users", JSON.stringify([]));
  }
  if (!localStorage.getItem("asime_emulated_price_alerts")) {
    localStorage.setItem("asime_emulated_price_alerts", JSON.stringify([]));
  }
  if (!localStorage.getItem("asime_emulated_orders")) {
    localStorage.setItem("asime_emulated_orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("asime_emulated_withdrawals")) {
    localStorage.setItem("asime_emulated_withdrawals", JSON.stringify([]));
  }
  if (!localStorage.getItem("asime_emulated_wallets")) {
    localStorage.setItem("asime_emulated_wallets", JSON.stringify({}));
  }
  if (!localStorage.getItem("asime_emulated_wallet_logs")) {
    localStorage.setItem("asime_emulated_wallet_logs", JSON.stringify([]));
  }
  if (!localStorage.getItem("asime_emulated_partners")) {
    const defaultPartners = [
      { id: "partner_1", name: "Jumia", description: "Boutique affiliée Jumia Togo", contractType: "commission", monthlyFee: 0, commissionRate: 8, contactPhone: "+22890000000", autoPublish: false, createdAt: new Date().toISOString() },
      { id: "partner_2", name: "CJ Affiliate", description: "Commission Junction international", contractType: "commission", monthlyFee: 0, commissionRate: 10, contactPhone: "+22891234567", autoPublish: false, createdAt: new Date().toISOString() },
      { id: "partner_3", name: "Amazon", description: "Programme Amazon Associates", contractType: "commission", monthlyFee: 0, commissionRate: 5, contactPhone: "+22892345678", autoPublish: false, createdAt: new Date().toISOString() },
      { id: "partner_4", name: "AliExpress", description: "Portail affiliés AliExpress", contractType: "commission", monthlyFee: 0, commissionRate: 7, contactPhone: "+22893456789", autoPublish: false, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem("asime_emulated_partners", JSON.stringify(defaultPartners));
  }
}

// High-fidelity client-side router for /api endpoints
async function handleEmulatedRequest(urlPath: string, init?: RequestInit): Promise<Response> {
  initLocalStorage();

  // Strip query parameters
  const [cleanRoute, queryStr] = urlPath.split("?");
  const method = (init?.method || "GET").toUpperCase();

  // Try to parse JSON body
  let bodyData: any = {};
  if (init && init.body && typeof init.body === "string") {
    try {
      bodyData = JSON.parse(init.body);
    } catch (e) {
      // Body not JSON
    }
  }

  // --- PRODUCTS PATHS ---
  if (cleanRoute === "/api/products/deleted-ids" && method === "GET") {
    try {
      const res = await originalFetch("/api/products/deleted-ids?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        return res;
      }
    } catch (e) {}
    let localDeleted: string[] = [];
    try {
      localDeleted = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
    } catch (e) {}
    return makeResponse({ success: true, deletedIds: localDeleted }, 200, true);
  }

  if (cleanRoute === "/api/products") {
    if (method === "GET") {
      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
      } catch (e) {}
      const deletedSet = new Set(deletedIds.map(String));

      let prods: any[] = [];
      let networkSuccess = false;
      // 1. Try network fetch to server first (server is the single source of truth)
      try {
        const netRes = await originalFetch("/api/products?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Accept": "application/json"
          }
        });
        const ct = (netRes.headers.get("content-type") || "").toLowerCase();
        if (netRes.ok && (ct.includes("application/json") || ct.includes("json"))) {
          const netText = await netRes.text();
          if (netText && netText.trim().startsWith("[")) {
            const parsed = JSON.parse(netText);
            if (Array.isArray(parsed)) {
              prods = parsed;
              networkSuccess = true;
            }
          }
        }
      } catch (e) {
        // Network error (offline)
      }

      // 2. Fallback to local cache ONLY if network request failed completely
      if (!networkSuccess) {
        // Fallback 1: Static /produits.json
        try {
          const staticRes = await originalFetch("/produits.json?t=" + Date.now(), { cache: "no-store" });
          const ct = (staticRes.headers.get("content-type") || "").toLowerCase();
          if (staticRes.ok && (ct.includes("application/json") || ct.includes("json"))) {
            const staticText = await staticRes.text();
            if (staticText && staticText.trim().startsWith("[")) {
              prods = JSON.parse(staticText);
            }
          }
        } catch (e) {}

        // Fallback 2: Cached localStorage
        if (prods.length === 0) {
          try {
            const cached = localStorage.getItem("asime_emulated_products");
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                prods = parsed;
              }
            }
          } catch (e) {}
        }
      }

      // STRICT FILTERING: Exclude any tombstoned deleted products
      const cleanProds = prods.filter((p: any) => !deletedSet.has(String(p?.id)));
      localStorage.setItem("asime_emulated_products", JSON.stringify(cleanProds));
      return makeResponse(cleanProds, 200, true);
    }
  }

  // Handle seller posting products and validating subscription pricing ranges
  if ((cleanRoute === "/api/products" || cleanRoute.startsWith("/api/products/")) && method === "POST" && cleanRoute !== "/api/products/save") {
    const authHeader = getAuthHeader(init);
    let userId = "";
    let userSubscription = "";
    let isSeller = false;

    if (authHeader) {
      try {
        if (authHeader.startsWith("user-token-")) {
          userId = atob(authHeader.replace("user-token-", ""));
        }
      } catch (e) {
        // Ignore
      }

      if (userId) {
        const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
        const foundUser = users.find((u: any) => u.id === userId);
        if (foundUser) {
          isSeller = foundUser.role === "vendeur";
          userSubscription = foundUser.vendeurSubscription || "";
        }
      }
    }

    const prodDetails = bodyData;
    const prix = Number(prodDetails.prix || 0);

    if (isSeller && userSubscription) {
      if (userSubscription === "Offre 1") {
        if (prix < 500 || prix > 1000) {
          return makeResponse({
            success: false,
            error: "Votre abonnement (Offre 1) limite le prix de vos produits entre 500 FCFA et 1 000 FCFA. Veuillez modifier le prix ou changer d'abonnement."
          }, 400, false);
        }
      } else if (userSubscription === "Offre 2") {
        if (prix < 1001 || prix > 5000) {
          return makeResponse({
            success: false,
            error: "Votre abonnement (Offre 2) limite le prix de vos produits entre 1 001 FCFA et 5 000 FCFA. Veuillez modifier le prix ou changer d'abonnement."
          }, 400, false);
        }
      } else if (userSubscription === "Offre 3") {
        if (prix < 5001) {
          return makeResponse({
            success: false,
            error: "Votre abonnement (Offre 3) exige que le prix de vos produits soit supérieur ou égal à 5 001 FCFA. Veuillez modifier le prix ou changer d'abonnement."
          }, 400, false);
        }
      }
    }

    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    let existingIndex = -1;
    let prodId = prodDetails.id;

    if (cleanRoute.startsWith("/api/products/") && cleanRoute !== "/api/products/save") {
      prodId = cleanRoute.substring("/api/products/".length);
    }

    if (prodId) {
      existingIndex = prods.findIndex((p: any) => p.id === prodId);
    }

    const savedProduct = {
      id: prodId || "prod_" + Date.now().toString(),
      nom: String(prodDetails.nom || "").trim(),
      description: String(prodDetails.description || "").trim(),
      prix: prix,
      prixBarre: prodDetails.prixBarre ? Number(prodDetails.prixBarre) : null,
      images: Array.isArray(prodDetails.images) ? prodDetails.images : [prodDetails.images || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80"],
      categorie: String(prodDetails.categorie || "Général").trim(),
      phare: typeof prodDetails.phare !== "undefined" ? !!prodDetails.phare : true,
      stock: typeof prodDetails.stock !== "undefined" ? Math.max(0, Math.floor(Number(prodDetails.stock))) : 10,
      partenaire: prodDetails.partenaire || "Boutique en Direct",
      vendeurId: prodDetails.vendeurId || userId,
      lienAffilie: prodDetails.lienAffilie || ""
    };

    if (existingIndex > -1) {
      prods[existingIndex] = savedProduct;
    } else {
      prods.unshift(savedProduct);
    }

    // 1. Send operation to backend server FIRST (server is source of truth)
    try {
      const serverRes = await originalFetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader || "asime2026"
        },
        body: JSON.stringify({ ...savedProduct, auth: "asime2026" })
      });

      if (serverRes.ok) {
        const text = await serverRes.text();
        const serverData = text ? JSON.parse(text) : { success: true, product: savedProduct };
        const confirmedProduct = serverData.product || savedProduct;

        // Server confirmed: update local cache
        if (existingIndex > -1) {
          prods[existingIndex] = confirmedProduct;
        } else {
          prods.unshift(confirmedProduct);
        }
        localStorage.setItem("asime_emulated_products", JSON.stringify(prods));

        return makeResponse(serverData, 200, true);
      } else {
        const errText = await serverRes.text();
        let errMsg = "Erreur serveur lors de la création du produit.";
        try { errMsg = JSON.parse(errText)?.error || errMsg; } catch (e) {}
        return makeResponse({ success: false, error: errMsg }, serverRes.status, false);
      }
    } catch (netErr) {
      // Offline fallback: save locally only if network is unavailable
      if (existingIndex > -1) {
        prods[existingIndex] = savedProduct;
      } else {
        prods.unshift(savedProduct);
      }
      localStorage.setItem("asime_emulated_products", JSON.stringify(prods));
      return makeResponse({ success: true, product: savedProduct, offline: true }, 200, true);
    }
  }

  if (cleanRoute === "/api/products/save" && method === "POST") {
    const { auth, product } = bodyData;
    if (auth !== "asime2026-auth-session" && auth !== "shopme2026-auth-session" && auth !== "asime2026" && auth !== "shopme2026") {
      return makeResponse({ success: false, error: "Accès refusé. Session d'administrateur invalide." }, 403, false);
    }

    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    let savedProduct = { ...product, phare: typeof product?.phare !== "undefined" ? product.phare : true };

    // 1. Send operation to backend server FIRST
    try {
      const serverRes = await originalFetch("/api/products/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "asime2026"
        },
        body: JSON.stringify({ auth: "asime2026", product: savedProduct })
      });

      if (serverRes.ok) {
        const text = await serverRes.text();
        const serverData = text ? JSON.parse(text) : { success: true, product: savedProduct };
        const confirmedProduct = serverData.product || savedProduct;

        // Server confirmed: update local cache
        if (confirmedProduct.id) {
          const index = prods.findIndex((p: any) => String(p.id) === String(confirmedProduct.id));
          if (index !== -1) {
            prods[index] = confirmedProduct;
          } else {
            prods.unshift(confirmedProduct);
          }
        } else {
          prods.unshift(confirmedProduct);
        }
        localStorage.setItem("asime_emulated_products", JSON.stringify(prods));

        // If this was previously tombstoned, remove from deleted list
        try {
          const delList = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
          const updatedDelList = delList.filter((dId: string) => String(dId) !== String(confirmedProduct.id));
          localStorage.setItem("asime_deleted_product_ids", JSON.stringify(updatedDelList));
        } catch (e) {}

        return makeResponse(serverData, 200, true);
      } else {
        const errText = await serverRes.text();
        let errMsg = "Erreur serveur lors de l'enregistrement.";
        try { errMsg = JSON.parse(errText)?.error || errMsg; } catch (e) {}
        return makeResponse({ success: false, error: errMsg }, serverRes.status, false);
      }
    } catch (netErr) {
      // Offline fallback
      if (!savedProduct.id) {
        savedProduct.id = "prod_" + Date.now();
      }
      const index = prods.findIndex((p: any) => String(p.id) === String(savedProduct.id));
      if (index !== -1) {
        prods[index] = savedProduct;
      } else {
        prods.unshift(savedProduct);
      }
      localStorage.setItem("asime_emulated_products", JSON.stringify(prods));
      return makeResponse({ success: true, product: savedProduct, offline: true }, 200, true);
    }
  }

  // Handle DELETE /api/products/:id
  if (cleanRoute.startsWith("/api/products/") && method === "DELETE") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    // Extract ID from product routing path
    const id = cleanRoute.substring("/api/products/".length);
    const idStr = String(id).trim();

    // 1. Send DELETE to backend server FIRST
    try {
      const serverRes = await originalFetch(urlPath, init);
      if (serverRes.ok) {
        const text = await serverRes.text();
        const serverData = text ? JSON.parse(text) : { success: true, id: idStr };

        // Server confirmed: update local cache
        const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
        const filtered = prods.filter((p: any) => String(p.id) !== idStr);
        localStorage.setItem("asime_emulated_products", JSON.stringify(filtered));

        // Register in tombstone blacklist
        try {
          const delList = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
          if (!delList.includes(idStr)) {
            delList.push(idStr);
            localStorage.setItem("asime_deleted_product_ids", JSON.stringify(delList));
          }
        } catch (e) {}

        return makeResponse(serverData, 200, true);
      } else {
        const errText = await serverRes.text();
        let errMsg = "Erreur serveur lors de la suppression du produit.";
        try { errMsg = JSON.parse(errText)?.error || errMsg; } catch (e) {}
        return makeResponse({ success: false, error: errMsg }, serverRes.status, false);
      }
    } catch (netErr) {
      // Offline fallback
      const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
      const filtered = prods.filter((p: any) => String(p.id) !== idStr);
      localStorage.setItem("asime_emulated_products", JSON.stringify(filtered));

      try {
        const delList = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
        if (!delList.includes(idStr)) {
          delList.push(idStr);
          localStorage.setItem("asime_deleted_product_ids", JSON.stringify(delList));
        }
      } catch (e) {}

      return makeResponse({ success: true, id: idStr, message: "Produit supprimé hors-ligne.", offline: true }, 200, true);
    }
  }

  // Handle POST /api/products/sync
  if (cleanRoute === "/api/products/sync" && method === "POST") {
    // Try forwarding to real server first!
    try {
      const serverRes = await originalFetch(urlPath, init);
      if (serverRes.ok) {
        return serverRes;
      }
    } catch (e) {}

    // Fallback if server offline: reject any deleted products
    let deletedIds: string[] = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem("asime_deleted_product_ids") || "[]");
    } catch (e) {}
    const delSet = new Set(deletedIds.map(String));

    const incoming: any[] = Array.isArray(bodyData?.products) ? bodyData.products : [];
    const currentProds = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]").filter((p: any) => !delSet.has(String(p?.id)));
    let addedCount = 0;
    let rejectedDeletedCount = 0;

    for (const cp of incoming) {
      if (cp && cp.id) {
        const idStr = String(cp.id).trim();
        if (delSet.has(idStr)) {
          rejectedDeletedCount++;
          continue;
        }
        if (!currentProds.some((p: any) => String(p.id) === idStr)) {
          currentProds.unshift(cp);
          addedCount++;
        }
      }
    }

    localStorage.setItem("asime_emulated_products", JSON.stringify(currentProds));
    return makeResponse({ 
      success: true, 
      count: currentProds.length, 
      addedCount, 
      rejectedDeletedCount, 
      deletedIds, 
      products: currentProds 
    }, 200, true);
  }

  // --- PRODUCT STATUS TOGGLE PATH (ACTIF / INACTIF / EN_RUPTURE) ---
  if (cleanRoute.startsWith("/api/products/") && cleanRoute.endsWith("/status") && method === "POST") {
    // Try server first
    try {
      const serverRes = await originalFetch(urlPath, init);
      if (serverRes.ok) {
        const text = await serverRes.text();
        const data = text ? JSON.parse(text) : { success: true };
        if (data.product) {
          const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
          const idx = prods.findIndex((p: any) => String(p.id) === String(data.product.id));
          if (idx > -1) {
            prods[idx] = { ...prods[idx], ...data.product };
            localStorage.setItem("asime_emulated_products", JSON.stringify(prods));
          }
        }
        return makeResponse(data, 200, true);
      }
    } catch (e) {}

    // Fallback: update in localStorage
    const prodId = cleanRoute.replace("/api/products/", "").replace("/status", "").trim();
    const { status, stock } = bodyData;
    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const idx = prods.findIndex((p: any) => String(p.id) === String(prodId));

    if (idx === -1) {
      return makeResponse({ success: false, error: "Produit non trouvé." }, 404, false);
    }

    prods[idx].status = status || "actif";
    if (typeof stock !== "undefined") {
      const parsedStock = Math.max(0, Math.floor(Number(stock)));
      prods[idx].stock = parsedStock;
      if (parsedStock === 0 && status === "actif") {
        prods[idx].status = "en_rupture";
      }
    }

    localStorage.setItem("asime_emulated_products", JSON.stringify(prods));
    return makeResponse({ success: true, product: prods[idx] }, 200, true);
  }

  // --- PRODUCT VIEW TRACKING PATH ---
  if (cleanRoute.startsWith("/api/products/") && cleanRoute.endsWith("/view") && method === "POST") {
    const prodId = cleanRoute.replace("/api/products/", "").replace("/view", "").trim();
    try {
      originalFetch(urlPath, init).catch(() => {});
    } catch (e) {}

    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const idx = prods.findIndex((p: any) => String(p.id) === String(prodId));
    let viewsCount = 1;
    if (idx > -1) {
      viewsCount = (Number(prods[idx].views) || 0) + 1;
      prods[idx].views = viewsCount;
      localStorage.setItem("asime_emulated_products", JSON.stringify(prods));
    }
    return makeResponse({ success: true, views: viewsCount }, 200, true);
  }

  // --- PRODUCTS ANALYTICS PATH ---
  if (cleanRoute === "/api/admin/products-analytics" && method === "GET") {
    try {
      const serverRes = await originalFetch("/api/admin/products-analytics?t=" + Date.now(), { cache: "no-store" });
      if (serverRes.ok) {
        return serverRes;
      }
    } catch (e) {}

    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");

    let totalViews = 0;
    let totalSales = 0;
    let totalRevenue = 0;

    const enriched = prods.map((p: any) => {
      const views = Number(p.views) || 0;
      const sales = Number(p.salesCount) || 0;
      const revenue = Number(p.revenueGenerated) || (sales * Number(p.prix || 0));
      const conversionRate = views > 0 ? Number(((sales / views) * 100).toFixed(1)) : 0;

      totalViews += views;
      totalSales += sales;
      totalRevenue += revenue;

      return {
        ...p,
        views,
        salesCount: sales,
        revenueGenerated: revenue,
        conversionRate,
        status: p.status || ((p.stock || 0) <= 0 ? "en_rupture" : "actif")
      };
    });

    return makeResponse({
      success: true,
      summary: {
        totalProducts: prods.length,
        activeProducts: prods.filter((p: any) => (p.status || "actif") === "actif" && (p.stock || 0) > 0).length,
        inactiveProducts: prods.filter((p: any) => p.status === "inactif").length,
        outOfStockProducts: prods.filter((p: any) => p.status === "en_rupture" || (p.stock || 0) <= 0).length,
        totalViews,
        totalSales,
        totalRevenue,
        overallConversionRate: totalViews > 0 ? Number(((totalSales / totalViews) * 100).toFixed(1)) : 0
      },
      products: enriched
    }, 200, true);
  }

  // --- AI ASSISTANT PATH ---
  if (cleanRoute === "/api/ai/assistant" && method === "POST") {
    try {
      const serverRes = await originalFetch(urlPath, init);
      if (serverRes.ok) {
        return serverRes;
      }
    } catch (e) {}

    const msg = String(bodyData?.message || "").toLowerCase().trim();
    let reply = "Miawoezon ! Je suis Aya, l'Assistante virtuelle de Miabé Asi — 'Le local, notre fierté' 🇹🇬. Comment puis-je vous accompagner aujourd'hui dans vos achats ou découvertes de produits Made in Togo ?";

    if (msg.includes("bonjour") || msg.includes("salut") || msg.includes("coucou") || msg.includes("bonsoir") || msg.includes("hello") || msg.includes("hi")) {
      reply = "Miawoezon ! Bienvenue chez Miabé Asi — Le local, notre fierté 🇹🇬. Je suis Aya, votre assistante et conseillère virtuelle. Comment puis-je vous accompagner aujourd'hui dans vos achats ou découvertes de produits Made in Togo ?";
    } else if (msg.includes("woézo") || msg.includes("woezo") || msg.includes("ndi") || msg.includes("fofo") || msg.includes("daavi") || msg.includes("elɔ̃")) {
      reply = "Woezɔ̃ lɔlɔ̃tɔ ! Miabé Asi nye Togo tɔwo ƒe asitsafe gã. Nye ŋkɔe nye Aya. Nu ka me mate ŋu akpe ɖe ŋuwò le egbe ? Miafe adzɔnuwo tso Togo nye nu nyuiwo (Miel, Karité, Dzogbenukuwo alo atsyɔ̃nuwo) !";
    } else if (msg.includes("produit") || msg.includes("miel") || msg.includes("karit") || msg.includes("café") || msg.includes("catalogue") || msg.includes("chocolat") || msg.includes("artisan") || msg.includes("made in togo")) {
      reply = "🌿 Miabé Asi met en avant le meilleur de l'artisanat et du terroir togolais :\n• 🍯 Miel Sauvage pur de Kpalimé (100% naturel)\n• 🥥 Beurre de Karité Bio pur & soins de Notsé\n• ☕ Cafés aromatiques d'altitude & Chocolat artisanal\n• 👗 Mode Wax & Vêtements traditionnels\n• 🥗 Paniers frais et fruits locaux\n\nVous pouvez utiliser notre barre de recherche ou nos filtres par catégorie pour explorer tout le catalogue !";
    } else if (msg.includes("livraison") || msg.includes("livrer") || msg.includes("délai") || msg.includes("frais") || msg.includes("lomé") || msg.includes("lome") || msg.includes("kara") || msg.includes("sokode")) {
      reply = "🚚 Options de livraison Miabé Asi :\n• Grand Lomé : Livraison express le jour même ou sous 24h à domicile ou en point relais.\n• Régions du Togo : Expéditions sécurisées vers Kpalimé, Kara, Sokodé, Atakpamé, Dapaong, etc.\n• Sous-région : Expéditions transfrontalières disponibles selon les vendeurs.\nLe tarif s'affiche automatiquement en fonction de votre ville et quartier dans le panier.";
    } else if (msg.includes("paiement") || msg.includes("payer") || msg.includes("tmoney") || msg.includes("flooz") || msg.includes("carte") || msg.includes("mobile money")) {
      reply = "💳 Moyens de règlement acceptés :\n• Mobile Money : T-Money (Mix by Togocom) & Flooz (Moov Africa)\n• Cartes bancaires (Visa, Mastercard)\n• Portefeuille électronique Miabé Asi Pay\n• Espèces à la livraison dans la zone de Lomé\nTous les règlements sont instantanés et sécurisés.";
    } else if (msg.includes("vendre") || msg.includes("vendeur") || msg.includes("boutique") || msg.includes("plan") || msg.includes("abonnement") || msg.includes("offre")) {
      reply = "🌟 Vous souhaitez vendre vos créations sur Miabé Asi ?\n1. Cliquez sur 'Devenir Vendeur' dans le menu principal.\n2. Choisissez parmi nos 3 formules adaptées :\n   • Formule Gratuite (0 FCFA) : Produits illimités, commission 10% sur les ventes.\n   • Formule PRO (1 600 FCFA/mois) : Visibilité renforcée, badge vérifié, analytics détaillés.\n   • Formule BUSINESS (3 200 FCFA/mois) : Bannières d'accueil, vitrine prioritaire, export comptable et support VIP.\n3. Encaissez vos gains directement sur votre Mobile Money !";
    }

    return makeResponse({ success: true, response: reply }, 200, true);
  }

  // --- BLOGS PATHS ---
  if (cleanRoute === "/api/blogs" && method === "GET") {
    const blogs = JSON.parse(localStorage.getItem("asime_emulated_blogs") || "[]");
    return makeResponse(blogs, 200, true);
  }

  // --- ADMIN AUTH PATH ---
  if (cleanRoute === "/api/admin/auth" && method === "POST") {
    const { password } = bodyData;
    if (password === "asime2026" || password === "shopme2026") {
      return makeResponse({ success: true, token: "asime2026-auth-session" }, 200, true);
    } else {
      return makeResponse({ success: false, error: "Mot de passe d'administration incorrect." }, 401, false);
    }
  }

  if (cleanRoute === "/api/admin/populate-products" && method === "POST") {
    const { auth } = bodyData;
    if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    // Repopulate from defaults
    localStorage.setItem("asime_emulated_products", JSON.stringify(defaultProducts));
    return makeResponse({ success: true, count: defaultProducts.length, message: "105 produits d'affiliation générés avec succès !" }, 200, true);
  }

// Normalizes and guarantees persistent, valid country/currency/city fields on user records
function normalizeStoredUser(user: any): any {
  if (!user) return user;
  const rawCountry = user.countryCode;
  const validCountryCode = (rawCountry && isSupportedCountry(rawCountry))
    ? rawCountry.toUpperCase()
    : "TG";
  const countryObj = getCountryByCode(validCountryCode);
  const currencyCode = user.currencyCode || countryObj.currencyCode || "XOF";
  const city = String(user.city !== undefined ? user.city : (user.quartier || "")).trim();
  const quartier = String(user.quartier !== undefined ? user.quartier : (user.city || "")).trim();

  return {
    ...user,
    countryCode: validCountryCode,
    currencyCode,
    city,
    quartier
  };
}

function sanitizeUserForResponse(user: any): any {
  const normalized = normalizeStoredUser(user);
  if (!normalized) return null;
  const { passwordHash: _, ...safeUser } = normalized;
  return safeUser;
}

  // --- CUSTOMER AUTHENTICATION ---
  if ((cleanRoute === "/api/auth/register" || cleanRoute === "/auth/register") && method === "POST") {
    const { name, email, password, phone, quartier, city, countryCode } = bodyData;
    if (!name || !email || !password) {
      return makeResponse({ success: false, error: "Veuillez remplir les champs obligatoires (Nom, Email, Mot de passe)." }, 400, false);
    }

    if (countryCode && !isSupportedCountry(countryCode)) {
      return makeResponse({ success: false, error: "Le pays sélectionné n'est pas autorisé." }, 400, false);
    }

    const emailLower = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return makeResponse({ success: false, error: "Veuillez saisir une adresse email valide (ex: nom@exemple.com)." }, 400, false);
    }
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");

    const existingUser = users.find((u: any) => u.email && u.email.toLowerCase() === emailLower);
    if (existingUser) {
      return makeResponse({ success: false, error: "Cette adresse email est déjà enregistrée." }, 400, false);
    }

    const validCountryCode = (countryCode && isSupportedCountry(countryCode)) ? countryCode.toUpperCase() : "TG";
    const countryObj = getCountryByCode(validCountryCode);
    const resolvedCurrencyCode = countryObj.currencyCode || "XOF";
    const resolvedCity = String(city || quartier || "").trim();

    const newUser = {
      id: "user_" + Date.now().toString(),
      name: String(name).trim(),
      email: emailLower,
      passwordHash: hashPassword(password),
      phone: String(phone || "").trim(),
      quartier: resolvedCity,
      city: resolvedCity,
      countryCode: validCountryCode,
      currencyCode: resolvedCurrencyCode,
      favorites: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("asime_emulated_users", JSON.stringify(users));

    const sessionToken = "user-token-" + btoa(newUser.id);
    return makeResponse({ success: true, token: sessionToken, user: sanitizeUserForResponse(newUser) }, 200, true);
  }

  if ((cleanRoute === "/api/auth/login" || cleanRoute === "/auth/login") && method === "POST") {
    const { email, password } = bodyData;
    if (!email || !password) {
      return makeResponse({ success: false, error: "Email et mot de passe requis." }, 400, false);
    }

    const emailLower = String(email).trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.email && u.email.toLowerCase() === emailLower);

    if (userIndex === -1 || users[userIndex].passwordHash !== hashPassword(password)) {
      return makeResponse({ success: false, error: "Identifiants de connexion incorrects." }, 401, false);
    }

    const user = users[userIndex];
    // Upgrade existing account if countryCode/currencyCode/city are missing, without breaking anything
    const normalized = normalizeStoredUser(user);
    if (!user.countryCode || !user.currencyCode || user.city === undefined) {
      users[userIndex] = { ...user, ...normalized, passwordHash: user.passwordHash };
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    }

    const sessionToken = "user-token-" + btoa(user.id);
    return makeResponse({ success: true, token: sessionToken, user: sanitizeUserForResponse(users[userIndex]) }, 200, true);
  }

  if ((cleanRoute === "/api/auth/me" || cleanRoute === "/auth/me") && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {
      // Invalid token
    }

    if (!userId) {
      return makeResponse({ success: false, error: "Session expirée ou invalide." }, 401, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    const user = users[userIndex];
    // Upgrade existing account if countryCode/currencyCode/city are missing, without breaking anything
    const normalized = normalizeStoredUser(user);
    if (!user.countryCode || !user.currencyCode || user.city === undefined) {
      users[userIndex] = { ...user, ...normalized, passwordHash: user.passwordHash };
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    }

    return makeResponse({ success: true, user: sanitizeUserForResponse(users[userIndex]) }, 200, true);
  }

  if (cleanRoute === "/api/auth/role-upgrade" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {
      // Invalid token
    }

    if (!userId) {
      return makeResponse({ success: false, error: "Session expirée ou invalide." }, 401, false);
    }

    const { role, action, vendeurMode, businessName, contactPhone, sellerPhone, vendeurSubscription, vendeurPaymentMethod, vendeurPaymentTxId } = bodyData;

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
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

      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      const { passwordHash: _, ...userResponse } = user;
      return makeResponse({ success: true, user: userResponse }, 200, true);
    }

    if (!role || !["client", "vendeur", "affilie", "admin"].includes(role)) {
      return makeResponse({ success: false, error: "Rôle invalide." }, 400, false);
    }

    user.role = role;

    if (role === "vendeur") {
      user.vendeurMode = vendeurMode || "autonome";
      user.businessName = businessName || user.name;
      user.vendeurStats = user.vendeurStats || {
        produitsPublies: 0,
        produitsVendus: 0,
        revenusGeneres: 0,
        stockRestant: 0
      };
      user.contactPhone = contactPhone || sellerPhone || user.phone || "";
      user.vendeurSubscription = vendeurSubscription || "Offre 1";
      user.vendeurPaymentMethod = vendeurPaymentMethod || "Mix by Yas";
      user.vendeurPaymentTxId = vendeurPaymentTxId || "";
      user.vendeurStatus = "En attente d'activation";
      
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

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));

    const { passwordHash: _, ...userResponse } = user;
    return makeResponse({ success: true, user: userResponse }, 200, true);
  }

  if (cleanRoute === "/api/auth/update-profile" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Accès non autorisé." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {
      // Code error
    }

    if (!userId) {
      return makeResponse({ success: false, error: "Identifiant invalide." }, 401, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    const { name, phone, quartier, city, countryCode, vendeurPin } = bodyData;
    users[userIndex].name = String(name || users[userIndex].name).trim();
    users[userIndex].phone = String(phone === undefined ? users[userIndex].phone : phone).trim();
    
    const resolvedCity = String(city !== undefined ? city : (quartier !== undefined ? quartier : (users[userIndex].city || users[userIndex].quartier || ""))).trim();
    users[userIndex].city = resolvedCity;
    users[userIndex].quartier = resolvedCity;

    if (countryCode && isSupportedCountry(countryCode)) {
      users[userIndex].countryCode = countryCode.toUpperCase();
      users[userIndex].currencyCode = getCountryByCode(countryCode).currencyCode;
    } else if (!users[userIndex].countryCode) {
      users[userIndex].countryCode = "TG";
      users[userIndex].currencyCode = "XOF";
    }

    if (vendeurPin !== undefined) {
      if (vendeurPin === "") {
        users[userIndex].vendeurPinHash = "";
        users[userIndex].vendeurPin = ""; // clear plain legacy if any
      } else {
        users[userIndex].vendeurPinHash = hashPassword(String(vendeurPin).trim());
        users[userIndex].vendeurPin = hashPassword(String(vendeurPin).trim()); // keep both to prevent breaking client fields but as a secure hash!
        
        // Add a security log
        users[userIndex].securityLog = users[userIndex].securityLog || [];
        users[userIndex].securityLog.unshift({
          id: "sec_" + Date.now(),
          event: "Modification du Code PIN de sécurité",
          date: new Date().toISOString(),
          status: "Succès"
        });
      }
    }

    // Ensure entire user is normalized
    users[userIndex] = { ...users[userIndex], ...normalizeStoredUser(users[userIndex]) };
    localStorage.setItem("asime_emulated_users", JSON.stringify(users));

    return makeResponse({ success: true, user: sanitizeUserForResponse(users[userIndex]) }, 200, true);
  }

  if (cleanRoute === "/api/auth/verify-pin" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non autorisée." }, 401, false);
    }

    const { pin } = bodyData;
    if (!pin) {
      return makeResponse({ success: false, error: "Code PIN requis." }, 400, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    const user = users[userIndex];

    // Check brute force lock
    if (user.pinLockUntil) {
      const lockTime = new Date(user.pinLockUntil).getTime();
      const now = Date.now();
      if (now < lockTime) {
        const remainingSec = Math.ceil((lockTime - now) / 1000);
        return makeResponse({ 
          success: false, 
          locked: true,
          remainingSeconds: remainingSec,
          error: `Espace temporairement verrouillé pour des raisons de sécurité. Veuillez réessayer dans ${remainingSec} secondes.` 
        }, 423, false);
      } else {
        // Lock expired
        user.pinLockUntil = null;
        user.failedPinAttempts = 0;
      }
    }

    const inputHash = hashPassword(String(pin).trim());
    const storedHash = user.vendeurPinHash || user.vendeurPin || "";

    user.securityLog = user.securityLog || [];

    if (storedHash === inputHash) {
      // Success
      user.failedPinAttempts = 0;
      user.pinLockUntil = null;
      user.securityLog.unshift({
        id: "sec_" + Date.now(),
        event: "Déverrouillage de l'Espace Vendeur",
        date: new Date().toISOString(),
        status: "Réussi"
      });
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      return makeResponse({ success: true }, 200, true);
    } else {
      // Failed attempt
      user.failedPinAttempts = (user.failedPinAttempts || 0) + 1;
      
      let locked = false;
      let remainingSec = 0;
      
      user.securityLog.unshift({
        id: "sec_" + Date.now(),
        event: "Tentative de déverrouillage échouée",
        date: new Date().toISOString(),
        status: `Échoué (Tentative ${user.failedPinAttempts}/5)`
      });

      if (user.failedPinAttempts >= 5) {
        locked = true;
        remainingSec = 300; // 5 minutes lock
        user.pinLockUntil = new Date(Date.now() + 300 * 1000).toISOString();
        
        // Add a system notification about unauthorized attempts
        user.notifications = user.notifications || [];
        user.notifications.unshift({
          id: "notif_" + Date.now().toString(),
          text: "⚠️ Alerte de Sécurité : Trop de tentatives de code PIN infructueuses détectées. Votre Espace Vendeur a été temporairement bloqué pendant 5 minutes.",
          type: "system",
          read: false,
          date: new Date().toISOString()
        });
      }

      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      return makeResponse({ 
        success: false, 
        locked, 
        remainingSeconds: remainingSec,
        failedAttempts: user.failedPinAttempts,
        error: locked 
          ? "Trop de tentatives échouées. Votre espace de vente est temporairement bloqué pour 5 minutes." 
          : `Code PIN incorrect. Tentative ${user.failedPinAttempts} de 5 avant verrouillage.`
      }, 401, false);
    }
  }

  if (cleanRoute === "/api/auth/favorites/toggle" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Session non autorisée." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {
      // Base64 decode error
    }

    if (!userId) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 401, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non authentifié." }, 404, false);
    }

    const { productId } = bodyData;
    if (!users[userIndex].favorites) {
      users[userIndex].favorites = [];
    }

    const favIndex = users[userIndex].favorites.indexOf(productId);
    if (favIndex !== -1) {
      users[userIndex].favorites.splice(favIndex, 1);
    } else {
      users[userIndex].favorites.push(productId);
    }

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    return makeResponse({ success: true, favorites: users[userIndex].favorites }, 200, true);
  }

  // --- PRICE ALERTS ---
  if (cleanRoute === "/api/price-alerts" && method === "POST") {
    const alerts = JSON.parse(localStorage.getItem("asime_emulated_price_alerts") || "[]");
    const { productId, productName, phone, currentPrice } = bodyData;

    alerts.push({
      id: "alert_" + Date.now(),
      productId,
      productName,
      phone,
      currentPrice,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem("asime_emulated_price_alerts", JSON.stringify(alerts));
    return makeResponse({ success: true }, 200, true);
  }

  // --- PARTNERS ENDPOINTS ---
  if (cleanRoute === "/api/partners") {
    if (method === "GET") {
      const partners = JSON.parse(localStorage.getItem("asime_emulated_partners") || "[]");
      return makeResponse(partners, 200, true);
    }
    if (method === "POST") {
      const { auth, name, description, contractType, monthlyFee, commissionRate, contactPhone, autoPublish } = bodyData;
      if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
        return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
      }
      if (!name || !String(name).trim()) {
        return makeResponse({ success: false, error: "Le nom du partenaire est obligatoire." }, 400, false);
      }
      const pName = String(name).trim();
      if (pName.toLowerCase() === "boutique en direct" || pName.toLowerCase() === "tous") {
        return makeResponse({ success: false, error: "Ce nom est réservé au système de vente directe." }, 400, false);
      }
      const partners = JSON.parse(localStorage.getItem("asime_emulated_partners") || "[]");
      if (partners.some((p: any) => p.name.toLowerCase() === pName.toLowerCase())) {
        return makeResponse({ success: false, error: "Ce partenaire existe déjà." }, 400, false);
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
      localStorage.setItem("asime_emulated_partners", JSON.stringify(partners));
      return makeResponse({ success: true, partner: newPartner }, 200, true);
    }
  }

  // POST update partner
  if (cleanRoute === "/api/partners/update" && method === "POST") {
    const { auth, id, description, contractType, monthlyFee, commissionRate, contactPhone, autoPublish } = bodyData;
    if (auth !== "asime2026" && auth !== "asime2026-auth-session" && auth !== "shopme2026" && auth !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    if (!id) {
      return makeResponse({ success: false, error: "L'identifiant du partenaire est obligatoire." }, 400, false);
    }
    const partners = JSON.parse(localStorage.getItem("asime_emulated_partners") || "[]");
    const index = partners.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return makeResponse({ success: false, error: "Partenaire non trouvé." }, 404, false);
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

    localStorage.setItem("asime_emulated_partners", JSON.stringify(partners));
    return makeResponse({ success: true, partner: partners[index] }, 200, true);
  }

  // DELETE partner and revert associated products to "Boutique en Direct"
  if (cleanRoute.startsWith("/api/partners/") && method === "DELETE") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const partnerName = decodeURIComponent(cleanRoute.substring("/api/partners/".length));
    const partners = JSON.parse(localStorage.getItem("asime_emulated_partners") || "[]");
    const filteredPartners = partners.filter((p: any) => p.name.toLowerCase() !== partnerName.toLowerCase());
    if (partners.length === filteredPartners.length) {
      return makeResponse({ success: false, error: "Partenaire non trouvé." }, 404, false);
    }

    localStorage.setItem("asime_emulated_partners", JSON.stringify(filteredPartners));

    // Reassign products having this partner to "Boutique en Direct"
    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    let modified = false;
    const updatedProducts = prods.map((p: any) => {
      if (p.partenaire && p.partenaire.toLowerCase() === partnerName.toLowerCase()) {
        modified = true;
        return { ...p, partenaire: "Boutique en Direct" };
      }
      return p;
    });

    if (modified) {
      localStorage.setItem("asime_emulated_products", JSON.stringify(updatedProducts));
    }

    return makeResponse({ success: true }, 200, true);
  }

  // --- EMULATED ORDERS: CREATE ---
  if (cleanRoute === "/api/orders/create" && method === "POST") {
    const authHeader = getAuthHeader(init);
    let userId = "guest_" + Date.now();
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    let clientIndex = -1;

    if (authHeader) {
      let parsedId = "";
      try {
        if (authHeader.startsWith("user-token-")) {
          parsedId = atob(authHeader.replace("user-token-", ""));
        }
      } catch (e) {}
      if (parsedId) {
        userId = parsedId;
        clientIndex = users.findIndex((u: any) => u.id === userId);
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
    } = bodyData;

    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return makeResponse({ success: false, error: "Le panier est vide ou le montant est invalide." }, 400, false);
    }

    // Subtract stock
    const products = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    for (const item of items) {
      const prodIndex = products.findIndex((p: any) => p.id === item.product.id);
      if (prodIndex > -1) {
        const currentStock = products[prodIndex].stock || 0;
        products[prodIndex].stock = Math.max(0, currentStock - item.quantity);
      }
    }
    localStorage.setItem("asime_emulated_products", JSON.stringify(products));

    const COUNTRY_NAMES_MAP: Record<string, string> = {
      TG: "Togo",
      BJ: "Bénin",
      BF: "Burkina Faso",
      CI: "Côte d'Ivoire",
      ML: "Mali",
      SN: "Sénégal",
      CM: "Cameroun"
    };

    // Enrich each item with vendor origin (country, city, partner)
    const enrichedItems = items.map((item: any) => {
      const matchedProd = products.find((p: any) => p.id === item.product?.id);
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
    const resolvedCurrency = currencyCode || shippingDetails?.currencyCode || (resolvedClientCountry === "CM" ? "XAF" : "XOF");

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
      const affUser = users.find((u: any) => (u.affiliateCode && u.affiliateCode === cleanRef) || u.id === cleanRef);
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

    const normalizedShippingDetails = {
      ...shippingDetails,
      countryCode: resolvedClientCountry,
      currencyCode: resolvedCurrency,
      city: resolvedClientCity,
      name: resolvedClientName,
      phone: resolvedClientPhone,
      phoneWithCountryCode: shippingDetails?.phoneWithCountryCode || resolvedClientPhone
    };

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const newOrder = {
      id: "ord_" + (10001 + orders.length),
      userId,
      items: enrichedItems,
      totalAmount,
      currencyCode: resolvedCurrency,
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
      shippingDetails: normalizedShippingDetails,
      paymentMethod,
      paymentStatus: "En attente de paiement",
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
    localStorage.setItem("asime_emulated_orders", JSON.stringify(orders));

    if (clientIndex > -1) {
      const clientUser = users[clientIndex];
      clientUser.notifications = clientUser.notifications || [];
      clientUser.notifications.unshift({
        id: "notif_" + Date.now().toString() + "_" + Math.floor(Math.random() * 100),
        text: `Votre commande #${newOrder.id} d'un montant de ${totalAmount.toLocaleString()} ${resolvedCurrency} a été enregistrée. Veuillez procéder au paiement sécurisé de la commande.`,
        type: "order",
        read: false,
        date: new Date().toISOString()
      });
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    }

    return makeResponse({ success: true, order: newOrder }, 200, true);
  }

  // --- PAYMENTS: ACTIVE PROVIDERS ---
  if (cleanRoute === "/api/payments/providers" && method === "GET") {
    const providers = [
      { id: "paydunya", name: "Paiement Sécurisé Mobile Money & Carte", type: "aggregator", active: true, country: "TG" }
    ];
    return makeResponse(providers, 200, true);
  }

  // --- PAYMENTS: INITIATE SESSION (Real backend PayDunya integration & Fallback emulation) ---
  if (cleanRoute === "/api/payments/initiate" && method === "POST") {
    const { orderId, providerId, name, phone, email, countryCode, currencyCode } = bodyData || {};
    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const order = orders.find((o: any) => o.id === orderId);

    if (order) {
      const rawCountryCode = (
        countryCode ||
        order.clientCountryCode ||
        order.destinationCountryCode ||
        order.shippingDetails?.countryCode ||
        "TG"
      ).toUpperCase();
      const supportedCodes = ["TG", "BJ", "BF", "CI", "ML", "SN", "CM"];
      const resolvedCountryCode = supportedCodes.includes(rawCountryCode) ? rawCountryCode : "TG";
      const resolvedCurrencyCode = currencyCode || order.currencyCode || (resolvedCountryCode === "CM" ? "XAF" : "XOF");
      const resolvedSellerCountry = (order.sellerCountryCode || order.items?.[0]?.product?.countryCode || "TG").toUpperCase();
      const isCrossBorder = order.isCrossBorder !== undefined ? order.isCrossBorder : (resolvedCountryCode !== resolvedSellerCountry);
      const token = "PD-TOK-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
      const redirectUrl = `/checkout/paydunya-test?token=${token}&orderId=${encodeURIComponent(orderId)}`;

      order.paymentGatewayTxId = token;
      order.paymentGatewayProvider = providerId || "paydunya";
      order.paymentGatewayCurrencyCode = resolvedCurrencyCode;
      order.paymentGatewayCountryCode = resolvedCountryCode;
      order.paymentGatewayInitiatedAt = new Date().toISOString();
      order.currencyCode = resolvedCurrencyCode;
      order.clientCountryCode = resolvedCountryCode;
      order.sellerCountryCode = resolvedSellerCountry;
      order.isCrossBorder = isCrossBorder;
      order.paymentStatus = "En attente de paiement";
      localStorage.setItem("asime_emulated_orders", JSON.stringify(orders));

      return makeResponse({
        success: true,
        session: {
          success: true,
          transactionId: token,
          providerId: providerId || "paydunya",
          amount: order.totalAmount,
          currencyCode: resolvedCurrencyCode,
          countryCode: resolvedCountryCode,
          clientCountryCode: resolvedCountryCode,
          sellerCountryCode: resolvedSellerCountry,
          isCrossBorder,
          status: "pending",
          redirectUrl,
          instructions: `Veuillez finaliser votre paiement sécurisé de ${order.totalAmount} ${resolvedCurrencyCode} via PayDunya.`
        }
      }, 200, true);
    }

    return makeResponse({
      success: false,
      error: "Serveur de paiement backend indisponible et commande locale introuvable."
    }, 404, false);
  }

  // --- EMULATED PAYMENTS: CONFIRM & SPLIT FUNDS ---
  if (cleanRoute === "/api/payments/confirm" && method === "POST") {
    const { transactionId, providerId, orderId } = bodyData;
    if (!transactionId || !providerId) {
      return makeResponse({ success: false, error: "ID de transaction et de prestataire requis." }, 400, false);
    }

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.paymentGatewayTxId === transactionId || o.id === orderId);

    if (orderIndex === -1) {
      return makeResponse({ success: false, error: "Commande associée introuvable." }, 404, false);
    }

    const order = orders[orderIndex];
    if (order.paymentStatus === "Payé") {
      return makeResponse({ success: true, message: "La commande est déjà confirmée comme payée.", order }, 200, true);
    }

    const orderCurrency = order.currencyCode || (order.clientCountryCode === "CM" ? "XAF" : "XOF");
    order.paymentStatus = "Payé";
    order.paymentGatewayTxId = transactionId;
    order.paymentGatewayProvider = providerId;
    order.paymentMethod = "PayDunya";
    order.currencyCode = orderCurrency;
    order.paymentConfirmedAt = new Date().toISOString();

    // Definitive Revenue Splitting Logic
    if (!order.splitProcessed) {
      const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
      const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
      const logs = JSON.parse(localStorage.getItem("asime_emulated_wallet_logs") || "[]");
      const totalAmount = Number(order.totalAmount || 0);

      // 1. Affiliate Validation:
      // Un affilié gagne une commission UNIQUEMENT lorsqu'un client achète réellement via son lien/code d'affiliation
      // attribué à la vente et s'il s'agit d'un utilisateur avec le rôle "affilie".
      let affiliateUserId = null;
      let validAffiliateUser = null;
      if (order.affiliateCode) {
        const affUser = users.find((u: any) => (u.affiliateCode && u.affiliateCode === order.affiliateCode) || u.id === order.affiliateCode);
        if (affUser && affUser.role === "affilie") {
          affiliateUserId = affUser.id;
          validAffiliateUser = affUser;
        }
      }

      // 2. Commission Breakdown:
      // - Vendeur: 90% garanti
      // - Miabé Asi part brute: 10%
      // - Affilié: 3% (taux existant) UNIQUEMENT si affilié valide, prélevé exclusivement sur les 10% de Miabé Asi
      // - Sans affilié: affilié = 0, Miabé Asi conserve 10% en totalité
      const sellerTotalEarnings = Math.floor(totalAmount * 0.90);
      const miabeAsiGrossCommission = Math.floor(totalAmount * 0.10);

      let actualAffiliateCommission = 0;
      if (validAffiliateUser) {
        actualAffiliateCommission = (order.affiliateCommission !== undefined && order.affiliateCommission > 0)
          ? order.affiliateCommission
          : Math.floor(totalAmount * 0.03);

        validAffiliateUser.affiliateStats = validAffiliateUser.affiliateStats || {
          clicks: 0, Visitors: 0, ventes: 0, chiffreAffaires: 0, commissionsGagnees: 0, commissionDisponible: 0, commissionRetiree: 0
        };
        validAffiliateUser.affiliateStats.ventes += 1;
        validAffiliateUser.affiliateStats.chiffreAffaires += totalAmount;
        validAffiliateUser.affiliateStats.commissionsGagnees += actualAffiliateCommission;
        validAffiliateUser.affiliateStats.commissionDisponible += actualAffiliateCommission;

        validAffiliateUser.notifications = validAffiliateUser.notifications || [];
        validAffiliateUser.notifications.unshift({
          id: "notif_split_aff_" + Date.now().toString(),
          text: `Félicitations ! Vous avez gagné une commission de ${actualAffiliateCommission.toLocaleString()} ${orderCurrency} (3%) pour la vente affiliée de la commande #${order.id}. (Prélevée sur la part Miabé Asi)`,
          type: "affiliate",
          read: false,
          date: new Date().toISOString()
        });

        // Ledger entry for affiliate
        if (!wallets[affiliateUserId]) {
          wallets[affiliateUserId] = { userId: affiliateUserId, balance: 0, currencyCode: orderCurrency, type: "affilie", history: [] };
        }
        wallets[affiliateUserId].balance += actualAffiliateCommission;
        wallets[affiliateUserId].currencyCode = orderCurrency;
        const affTxId = "TX-COMM-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
        wallets[affiliateUserId].history.unshift({
          id: affTxId,
          type: "commission",
          amount: actualAffiliateCommission,
          currencyCode: orderCurrency,
          orderId: order.id,
          date: new Date().toISOString(),
          description: `Commission d'affiliation de 3% (${actualAffiliateCommission} ${orderCurrency}) pour la commande #${order.id} (prélevée sur la part Miabé Asi)`,
          status: "completed"
        });

        logs.push({
          id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
          timestamp: new Date().toISOString(),
          userId: affiliateUserId,
          action: "CREDIT_COMMISSION",
          amount: actualAffiliateCommission,
          currencyCode: orderCurrency,
          orderId: order.id,
          txId: affTxId,
          message: `Crédit commission d'affilié de 3% (${actualAffiliateCommission} ${orderCurrency}) prélevée sur la part Miabé Asi pour la commande ${order.id}`
        });
      } else {
        actualAffiliateCommission = 0;
        order.affiliateCode = null;
      }

      const miabeAsiNetCommission = miabeAsiGrossCommission - actualAffiliateCommission;

      order.sellerEarnings = sellerTotalEarnings;
      order.miabeAsiGrossCommission = miabeAsiGrossCommission;
      order.affiliateCommission = actualAffiliateCommission;
      order.miabeAsiNetCommission = miabeAsiNetCommission;

      // 3. Sellers Earnings Split (90% per item, never reduced)
      for (const item of order.items) {
        const itemTotal = item.product.prix * item.quantity;
        const sellerEarnings = Math.floor(itemTotal * 0.90);
        const partnerName = item.product.partenaire || "Boutique en Direct";

        const sellerUser = users.find((u: any) => u.role === "vendeur" && (u.businessName === partnerName || u.name === partnerName));
        if (sellerUser) {
          const sellerId = sellerUser.id;
          sellerUser.vendeurStats = sellerUser.vendeurStats || {
            produitsPublies: 0, produitsVendus: 0, revenusGeneres: 0, stockRestant: 0
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

          if (!wallets[sellerId]) {
            wallets[sellerId] = { userId: sellerId, balance: 0, currencyCode: orderCurrency, type: "vendeur", history: [] };
          }
          wallets[sellerId].balance += sellerEarnings;
          wallets[sellerId].currencyCode = orderCurrency;
          const sellerTxId = "TX-SALE-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
          wallets[sellerId].history.unshift({
            id: sellerTxId,
            type: "vente",
            amount: sellerEarnings,
            currencyCode: orderCurrency,
            orderId: order.id,
            date: new Date().toISOString(),
            description: `Vente produit : "${item.product.nom}" (x${item.quantity}) - Part vendeur 90% intégrale`,
            status: "completed"
          });

          logs.push({
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            userId: sellerId,
            action: "CREDIT_SALE",
            amount: sellerEarnings,
            currencyCode: orderCurrency,
            orderId: order.id,
            txId: sellerTxId,
            message: `Crédit vente de ${sellerEarnings} ${orderCurrency} pour "${item.product.nom}" (x${item.quantity}) sur commande ${order.id} - Part vendeur 90% intégrale`
          });
        }
      }

      order.splitProcessed = true;
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      localStorage.setItem("asime_emulated_wallets", JSON.stringify(wallets));
      localStorage.setItem("asime_emulated_wallet_logs", JSON.stringify(logs));
    }

    // Notify buyer
    const clientUserId = order.userId;
    if (clientUserId && !clientUserId.startsWith("guest_")) {
      const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
      const clientIndex = users.findIndex((u: any) => u.id === clientUserId);
      if (clientIndex > -1) {
        users[clientIndex].notifications = users[clientIndex].notifications || [];
        users[clientIndex].notifications.unshift({
          id: "notif_pay_" + Date.now().toString(),
          text: `Paiement confirmé ! Votre commande #${order.id} d'un montant de ${order.totalAmount.toLocaleString()} ${orderCurrency} a été payée avec succès via ${order.paymentMethod}.`,
          type: "order",
          read: false,
          date: new Date().toISOString()
        });
        localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      }
    }

    localStorage.setItem("asime_emulated_orders", JSON.stringify(orders));
    return makeResponse({ success: true, message: "Paiement validé avec succès !", order }, 200, true);
  }

  // --- EMULATED ORDERS: FETCH MY ORDERS ---
  if (cleanRoute === "/api/orders/my-orders" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const currentUser = users.find((u: any) => u.id === userId);

    if (!currentUser) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    if (currentUser.role === "vendeur") {
      const businessName = (currentUser.businessName || currentUser.name || "").toLowerCase().trim();
      const sellerId = currentUser.id;
      const sellerSlug = (currentUser.boutiqueSlug || currentUser.vendeurSlug || "").toLowerCase().trim();

      const sellerOrders = orders.filter((o: any) =>
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
      return makeResponse(sellerOrders, 200, true);
    }

    const clientPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, "") : "";
    const clientOrders = orders.filter((o: any) => 
      o.userId === userId || 
      (clientPhone && o.shippingDetails?.phone && o.shippingDetails.phone.replace(/[^0-9]/g, "") === clientPhone) ||
      (clientPhone && o.clientPhone && o.clientPhone.replace(/[^0-9]/g, "") === clientPhone)
    );
    return makeResponse(clientOrders, 200, true);
  }

  // --- EMULATED ORDERS: TRACK ORDER PUBLICLY ---
  if (cleanRoute.startsWith("/api/orders/track/") && method === "GET") {
    const orderId = cleanRoute.replace("/api/orders/track/", "").trim();
    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const order = orders.find((o: any) => o.id.toLowerCase() === orderId.toLowerCase());
    if (!order) {
      return makeResponse({ success: false, error: "Commande non trouvée." }, 404, false);
    }
    return makeResponse({ success: true, order }, 200, true);
  }

  // --- EMULATED WALLET: MY WALLET ---
  if (cleanRoute === "/api/wallets/my-wallet" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const currentUser = users.find((u: any) => u.id === userId);
    if (!currentUser) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    if (currentUser.role !== "vendeur" && currentUser.role !== "affilie") {
      return makeResponse({ success: false, error: "L'accès au portefeuille exige un compte vendeur ou affilié." }, 403, false);
    }

    const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
    if (!wallets[userId]) {
      wallets[userId] = {
        userId,
        balance: 0,
        type: currentUser.role,
        history: []
      };
      localStorage.setItem("asime_emulated_wallets", JSON.stringify(wallets));
    }

    return makeResponse({ success: true, wallet: wallets[userId] }, 200, true);
  }

  // --- EMULATED WITHDRAWALS: CREATE ---
  if (cleanRoute === "/api/withdrawals/create" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const { amount, method: withMethod, phone } = bodyData;
    const numAmount = Number(amount);

    if (!numAmount || numAmount < 5000) {
      return makeResponse({ success: false, error: "Le montant minimum de retrait est de 5 000 FCFA." }, 400, false);
    }

    if (!withMethod || !["Flooz", "Mix by Yas", "PayDunya"].includes(withMethod)) {
      return makeResponse({ success: false, error: "Méthode de retrait invalide (Flooz, Mix by Yas ou PayDunya uniquement)." }, 400, false);
    }

    if (!phone) {
      return makeResponse({ success: false, error: "Le numéro de téléphone récepteur est requis." }, 400, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    const user = users[userIndex];
    const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
    if (!wallets[userId]) {
      wallets[userId] = { userId, balance: 0, type: user.role, history: [] };
    }

    const wallet = wallets[userId];
    if (wallet.balance < numAmount) {
      return makeResponse({ success: false, error: `Solde insuffisant dans votre portefeuille. Solde : ${wallet.balance} FCFA.` }, 400, false);
    }

    // Debit wallet balance
    wallet.balance -= numAmount;
    const withTxId = "TX-WITH-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
    const withdrawals = JSON.parse(localStorage.getItem("asime_emulated_withdrawals") || "[]");
    const withdrawalId = "with_" + (1001 + withdrawals.length);

    wallet.history.unshift({
      id: withTxId,
      type: "retrait",
      amount: numAmount,
      withdrawalId,
      date: new Date().toISOString(),
      description: `Demande de retrait de ${numAmount.toLocaleString()} FCFA par ${withMethod} (${phone})`,
      status: "pending"
    });

    const logs = JSON.parse(localStorage.getItem("asime_emulated_wallet_logs") || "[]");
    logs.push({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString(),
      userId,
      action: "DEBIT_WITHDRAWAL",
      amount: numAmount,
      txId: withTxId,
      message: `Débit demande de retrait de ${numAmount} FCFA via ${withMethod} pour l'utilisateur ${userId}`
    });

    // Sync metrics
    if (user.role === "affilie") {
      user.affiliateStats.commissionDisponible = Math.max(0, user.affiliateStats.commissionDisponible - numAmount);
      user.affiliateStats.commissionRetiree = (user.affiliateStats.commissionRetiree || 0) + numAmount;
    } else if (user.role === "vendeur") {
      user.vendeurStats.revenusGeneres = Math.max(0, user.vendeurStats.revenusGeneres - numAmount);
    }

    const newWithdrawal = {
      id: withdrawalId,
      userId,
      userName: user.name,
      userRole: user.role,
      amount: numAmount,
      method: withMethod,
      phone,
      status: "En attente",
      createdAt: new Date().toISOString()
    };

    withdrawals.unshift(newWithdrawal);

    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString() + "_" + Math.floor(Math.random() * 100),
      text: `Votre demande de retrait de ${numAmount.toLocaleString()} FCFA via ${withMethod} a été enregistrée et est en attente d'approbation administrative.`,
      type: "withdrawal",
      read: false,
      date: new Date().toISOString()
    });

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    localStorage.setItem("asime_emulated_wallets", JSON.stringify(wallets));
    localStorage.setItem("asime_emulated_wallet_logs", JSON.stringify(logs));
    localStorage.setItem("asime_emulated_withdrawals", JSON.stringify(withdrawals));

    return makeResponse({
      success: true,
      withdrawal: newWithdrawal,
      userBalance: user.role === "affilie" ? user.affiliateStats.commissionDisponible : user.vendeurStats.revenusGeneres
    }, 200, true);
  }

  // --- EMULATED WITHDRAWALS: HISTORIQUE ---
  if (cleanRoute === "/api/withdrawals/my-withdrawals" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const withdrawals = JSON.parse(localStorage.getItem("asime_emulated_withdrawals") || "[]");
    const userWithdrawals = withdrawals.filter((w: any) => w.userId === userId);
    return makeResponse(userWithdrawals, 200, true);
  }

  // --- EMULATED NOTIFICATIONS ---
  if (cleanRoute === "/api/auth/notifications" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const user = users.find((u: any) => u.id === userId);
    if (!user) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    return makeResponse(user.notifications || [], 200, true);
  }

  // --- EMULATED NOTIFICATIONS: MARK READ ---
  if (cleanRoute === "/api/auth/notifications/mark-read" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    const user = users[userIndex];
    if (user.notifications) {
      user.notifications = user.notifications.map((n: any) => ({ ...n, read: true }));
    }

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    return makeResponse({ success: true, notifications: user.notifications || [] }, 200, true);
  }

  // --- EMULATED NOTIFICATIONS: CLEAR ALL ---
  if (cleanRoute === "/api/auth/notifications/clear" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    users[userIndex].notifications = [];
    localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    return makeResponse({ success: true, notifications: [] }, 200, true);
  }

  // --- EMULATED NOTIFICATIONS: DELETE ONE ---
  if (cleanRoute.startsWith("/api/auth/notifications/") && cleanRoute.endsWith("/delete") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }

    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}

    if (!userId) {
      return makeResponse({ success: false, error: "Session non valide." }, 401, false);
    }

    const notifId = cleanRoute.split("/")[4];
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex > -1) {
      users[userIndex].notifications = (users[userIndex].notifications || []).filter((n: any) => n.id !== notifId);
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      return makeResponse({ success: true, notifications: users[userIndex].notifications }, 200, true);
    }
    return makeResponse({ success: false, error: "Non trouvé" }, 404, false);
  }

  // --- EMULATED MESSAGES ---
  if (cleanRoute === "/api/messages" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }
    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}
    if (!userId) {
      return makeResponse({ success: false, error: "Session expirée." }, 401, false);
    }

    let threads = JSON.parse(localStorage.getItem("asime_emulated_messages") || "[]");
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const currentUser = users.find((u: any) => u.id === userId);

    if (threads.length === 0) {
      threads = [
        {
          id: "thread-1",
          customerId: "client-adjoa",
          customer: "Adjoa S. (Lomé)",
          avatar: "AS",
          sellerId: userId,
          sellerName: currentUser?.businessName || "Ma Boutique",
          product: "Robe sur-mesure en Pagne Kente",
          lastMessage: "Bonjour, est-ce que vos pagnes sont 100% coton biologique ?",
          unread: true,
          messages: [
            { sender: "customer", text: "Bonjour ! J'adore vos créations de robes.", date: new Date(Date.now() - 7200000).toISOString() },
            { sender: "seller", text: "Bonjour Adjoa ! Merci beaucoup, toutes nos créations sont faites main dans notre atelier de Lomé.", date: new Date(Date.now() - 5400000).toISOString() },
            { sender: "customer", text: "Super ! Est-ce que vos pagnes sont 100% coton biologique ?", date: new Date(Date.now() - 3600000).toISOString() }
          ]
        },
        {
          id: "thread-2",
          customerId: "client-koffi",
          customer: "Koffi T. (Kpalimé)",
          avatar: "KT",
          sellerId: userId,
          sellerName: currentUser?.businessName || "Ma Boutique",
          product: "Miel Pur de Dapaong (Lot de 3)",
          lastMessage: "Pouvez-vous m'envoyer un colis par le réseau de bus ?",
          unread: false,
          messages: [
            { sender: "customer", text: "Salut, j'aimerais commander 3 pots de miel de Dapaong.", date: new Date(Date.now() - 86400000).toISOString() },
            { sender: "seller", text: "Bonjour Koffi, avec plaisir ! Nous pouvons expédier via le réseau de colis Miabé Asi.", date: new Date(Date.now() - 80000000).toISOString() },
            { sender: "customer", text: "Pouvez-vous m'envoyer un colis par le réseau de bus ?", date: new Date(Date.now() - 72000000).toISOString() }
          ]
        }
      ];
      localStorage.setItem("asime_emulated_messages", JSON.stringify(threads));
    }

    const userThreads = threads.filter((t: any) => t.customerId === userId || t.sellerId === userId);
    return makeResponse({ success: true, threads: userThreads }, 200, true);
  }

  if (cleanRoute === "/api/messages" && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }
    let userId = "";
    try {
      if (authHeader.startsWith("user-token-")) {
        userId = atob(authHeader.replace("user-token-", ""));
      }
    } catch (e) {}
    if (!userId) {
      return makeResponse({ success: false, error: "Session expirée." }, 401, false);
    }

    const { threadId, sellerId, sellerName, productName, text } = bodyData || {};
    if (!text || !text.trim()) {
      return makeResponse({ success: false, error: "Le message ne peut pas être vide." }, 400, false);
    }

    const threads = JSON.parse(localStorage.getItem("asime_emulated_messages") || "[]");
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const currentUser = users.find((u: any) => u.id === userId);
    const currentUserName = currentUser ? currentUser.name : "Client Miabé Asi";

    let thread: any;
    if (threadId) {
      thread = threads.find((t: any) => t.id === threadId);
    } else if (sellerId) {
      thread = threads.find((t: any) => t.customerId === userId && t.sellerId === sellerId);
      if (!thread) {
        const targetSeller = users.find((u: any) => u.id === sellerId);
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
      return makeResponse({ success: false, error: "threadId ou sellerId est requis." }, 400, false);
    }

    if (!thread) {
      return makeResponse({ success: false, error: "Discussion introuvable." }, 404, false);
    }

    const senderType = (userId === thread.customerId) ? "customer" : "seller";
    const newMessage = {
      sender: senderType,
      text: text,
      date: new Date().toISOString()
    };

    thread.messages.push(newMessage);
    thread.lastMessage = text;
    thread.unread = true;

    localStorage.setItem("asime_emulated_messages", JSON.stringify(threads));
    return makeResponse({ success: true, thread }, 200, true);
  }

  if (cleanRoute.startsWith("/api/messages/") && cleanRoute.endsWith("/read") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (!authHeader) {
      return makeResponse({ success: false, error: "Non connecté." }, 401, false);
    }
    const parts = cleanRoute.split("/");
    const threadId = parts[3];

    const threads = JSON.parse(localStorage.getItem("asime_emulated_messages") || "[]");
    const index = threads.findIndex((t: any) => t.id === threadId);
    if (index !== -1) {
      threads[index].unread = false;
      localStorage.setItem("asime_emulated_messages", JSON.stringify(threads));
    }
    return makeResponse({ success: true }, 200, true);
  }

  // --- EMULATED REVIEWS ---
  if (cleanRoute.startsWith("/api/products/") && cleanRoute.endsWith("/reviews")) {
    const idParts = cleanRoute.split("/");
    const productId = idParts[3]; // /api/products/:id/reviews

    if (method === "GET") {
      const reviews = JSON.parse(localStorage.getItem(`asime_emulated_reviews_${productId}`) || "[]");
      return makeResponse(reviews, 200, true);
    }

    if (method === "POST") {
      const { name, rating, comment } = bodyData;
      if (!rating || !comment) {
        return makeResponse({ success: false, error: "La note et le commentaire sont requis." }, 400, false);
      }

      const reviews = JSON.parse(localStorage.getItem(`asime_emulated_reviews_${productId}`) || "[]");
      const newReview = {
        id: "rev_" + Date.now(),
        name: String(name || "Anonyme").trim(),
        rating: Number(rating),
        comment: String(comment).trim(),
        createdAt: new Date().toISOString()
      };

      reviews.unshift(newReview);
      localStorage.setItem(`asime_emulated_reviews_${productId}`, JSON.stringify(reviews));

      return makeResponse({ success: true, review: newReview }, 200, true);
    }
  }

  // --- EMULATED ADMIN ENDPOINTS ---
  if (cleanRoute === "/api/admin/wallets" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
    return makeResponse(wallets, 200, true);
  }

  if (cleanRoute === "/api/admin/wallets/logs" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const logs = JSON.parse(localStorage.getItem("asime_emulated_wallet_logs") || "[]");
    return makeResponse(logs, 200, true);
  }

  if (cleanRoute === "/api/admin/users" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const sanitized = users.map((u: any) => {
      const { passwordHash: _, ...rest } = u;
      return rest;
    });
    return makeResponse(sanitized, 200, true);
  }

  if (cleanRoute.startsWith("/api/admin/users/") && cleanRoute.endsWith("/approve-seller") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const parts = cleanRoute.split("/");
    const id = parts[4];

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const index = users.findIndex((u: any) => String(u.id) === String(id));
    if (index === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
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

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    return makeResponse({ success: true, user }, 200, true);
  }

  if (cleanRoute.startsWith("/api/admin/users/") && cleanRoute.endsWith("/reject-seller") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const parts = cleanRoute.split("/");
    const id = parts[4];

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const index = users.findIndex((u: any) => String(u.id) === String(id));
    if (index === -1) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    const user = users[index];
    user.vendeurStatus = "Rejeté";
    user.role = "client";
    user.notifications = user.notifications || [];
    user.notifications.unshift({
      id: "notif_" + Date.now().toString() + Math.floor(Math.random() * 100).toString(),
      text: `Votre demande d'activation d'espace vendeur a été refusée après vérification du paiement. Veuillez contacter le support.`,
      type: "system",
      read: false,
      date: new Date().toISOString()
    });

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    return makeResponse({ success: true, user }, 200, true);
  }

  if (cleanRoute === "/api/admin/orders" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    return makeResponse(orders, 200, true);
  }

  if (cleanRoute.startsWith("/api/admin/orders/") && cleanRoute.endsWith("/validate-payment") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const parts = cleanRoute.split("/");
    const id = parts[4]; // /api/admin/orders/:id/validate-payment

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === id);
    if (orderIndex === -1) {
      return makeResponse({ success: false, error: "Commande non trouvée." }, 404, false);
    }

    const order = orders[orderIndex];
    if (order.paymentStatus === "Payé") {
      return makeResponse({ success: true, message: "La commande est déjà confirmée comme payée." }, 200, true);
    }

    order.paymentStatus = "Payé";
    order.paymentMethod = order.paymentMethod || "ADMIN_VALIDATION";

    // Definitive Revenue Splitting Logic
    if (!order.splitProcessed) {
      const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
      const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
      const logs = JSON.parse(localStorage.getItem("asime_emulated_wallet_logs") || "[]");
      const orderCurrency = order.currencyCode || (order.destinationCountryCode === "CM" || order.clientCountryCode === "CM" ? "XAF" : "XOF");
      const totalAmount = Number(order.totalAmount || 0);

      // 1. Affiliate Validation:
      // Un affilié gagne une commission UNIQUEMENT lorsqu'un client achète réellement via son lien/code d'affiliation
      // attribué à la vente et s'il s'agit d'un utilisateur avec le rôle "affilie".
      let affiliateUserId = null;
      let validAffiliateUser = null;
      if (order.affiliateCode) {
        const affUser = users.find((u: any) => (u.affiliateCode && u.affiliateCode === order.affiliateCode) || u.id === order.affiliateCode);
        if (affUser && affUser.role === "affilie") {
          affiliateUserId = affUser.id;
          validAffiliateUser = affUser;
        }
      }

      // 2. Commission Breakdown:
      // - Vendeur: 90% garanti
      // - Miabé Asi part brute: 10%
      // - Affilié: 3% (taux existant) UNIQUEMENT si affilié valide, prélevé exclusivement sur les 10% de Miabé Asi
      // - Sans affilié: affilié = 0, Miabé Asi conserve 10% en totalité
      const sellerTotalEarnings = Math.floor(totalAmount * 0.90);
      const miabeAsiGrossCommission = Math.floor(totalAmount * 0.10);

      let actualAffiliateCommission = 0;
      if (validAffiliateUser) {
        actualAffiliateCommission = (order.affiliateCommission !== undefined && order.affiliateCommission > 0)
          ? order.affiliateCommission
          : Math.floor(totalAmount * 0.03);

        validAffiliateUser.affiliateStats = validAffiliateUser.affiliateStats || {
          clicks: 0, Visitors: 0, ventes: 0, chiffreAffaires: 0, commissionsGagnees: 0, commissionDisponible: 0, commissionRetiree: 0
        };
        validAffiliateUser.affiliateStats.ventes += 1;
        validAffiliateUser.affiliateStats.chiffreAffaires += totalAmount;
        validAffiliateUser.affiliateStats.commissionsGagnees += actualAffiliateCommission;
        validAffiliateUser.affiliateStats.commissionDisponible += actualAffiliateCommission;

        validAffiliateUser.notifications = validAffiliateUser.notifications || [];
        validAffiliateUser.notifications.unshift({
          id: "notif_split_aff_" + Date.now().toString(),
          text: `Félicitations ! Vous avez gagné une commission de ${actualAffiliateCommission.toLocaleString()} ${orderCurrency} (3%) pour la vente affiliée de la commande #${order.id}. (Prélevée sur la part Miabé Asi)`,
          type: "affiliate",
          read: false,
          date: new Date().toISOString()
        });

        if (!wallets[affiliateUserId]) {
          wallets[affiliateUserId] = { userId: affiliateUserId, balance: 0, currencyCode: orderCurrency, type: "affilie", history: [] };
        }
        wallets[affiliateUserId].balance += actualAffiliateCommission;
        wallets[affiliateUserId].currencyCode = orderCurrency;
        const affTxId = "TX-COMM-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
        wallets[affiliateUserId].history.unshift({
          id: affTxId,
          type: "commission",
          amount: actualAffiliateCommission,
          currencyCode: orderCurrency,
          orderId: order.id,
          date: new Date().toISOString(),
          description: `Commission d'affiliation de 3% (${actualAffiliateCommission} ${orderCurrency}) pour la commande #${order.id} (prélevée sur la part Miabé Asi)`,
          status: "completed"
        });

        logs.push({
          id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
          timestamp: new Date().toISOString(),
          userId: affiliateUserId,
          action: "CREDIT_COMMISSION",
          amount: actualAffiliateCommission,
          currencyCode: orderCurrency,
          orderId: order.id,
          txId: affTxId,
          message: `Crédit commission d'affilié de 3% (${actualAffiliateCommission} ${orderCurrency}) prélevée sur la part Miabé Asi pour la commande ${order.id}`
        });
      } else {
        actualAffiliateCommission = 0;
        order.affiliateCode = null;
      }

      const miabeAsiNetCommission = miabeAsiGrossCommission - actualAffiliateCommission;

      order.sellerEarnings = sellerTotalEarnings;
      order.miabeAsiGrossCommission = miabeAsiGrossCommission;
      order.affiliateCommission = actualAffiliateCommission;
      order.miabeAsiNetCommission = miabeAsiNetCommission;
      order.currencyCode = orderCurrency;

      // 3. Sellers Earnings Split (90% per item, never reduced)
      for (const item of order.items) {
        const itemTotal = item.product.prix * item.quantity;
        const sellerEarnings = Math.floor(itemTotal * 0.90);
        const partnerName = item.product.partenaire || "Boutique en Direct";

        const sellerUser = users.find((u: any) => u.role === "vendeur" && (u.businessName === partnerName || u.name === partnerName));
        if (sellerUser) {
          const sellerId = sellerUser.id;
          sellerUser.vendeurStats = sellerUser.vendeurStats || {
            produitsPublies: 0, produitsVendus: 0, revenusGeneres: 0, stockRestant: 0
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

          if (!wallets[sellerId]) {
            wallets[sellerId] = { userId: sellerId, balance: 0, currencyCode: orderCurrency, type: "vendeur", history: [] };
          }
          wallets[sellerId].balance += sellerEarnings;
          wallets[sellerId].currencyCode = orderCurrency;
          const sellerTxId = "TX-SALE-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
          wallets[sellerId].history.unshift({
            id: sellerTxId,
            type: "vente",
            amount: sellerEarnings,
            currencyCode: orderCurrency,
            orderId: order.id,
            date: new Date().toISOString(),
            description: `Vente produit : "${item.product.nom}" (x${item.quantity}) - Part vendeur 90% intégrale`,
            status: "completed"
          });

          logs.push({
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            userId: sellerId,
            action: "CREDIT_SALE",
            amount: sellerEarnings,
            currencyCode: orderCurrency,
            orderId: order.id,
            txId: sellerTxId,
            message: `Crédit vente de ${sellerEarnings} ${orderCurrency} pour "${item.product.nom}" (x${item.quantity}) sur commande ${order.id} - Part vendeur 90% intégrale`
          });
        }
      }

      order.splitProcessed = true;
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      localStorage.setItem("asime_emulated_wallets", JSON.stringify(wallets));
      localStorage.setItem("asime_emulated_wallet_logs", JSON.stringify(logs));
    }

    localStorage.setItem("asime_emulated_orders", JSON.stringify(orders));
    return makeResponse({ success: true, message: "Paiement validé administrativement avec succès !", order }, 200, true);
  }

  if ((cleanRoute.startsWith("/api/admin/orders/") && cleanRoute.endsWith("/update-status")) || (cleanRoute.startsWith("/api/orders/") && cleanRoute.endsWith("/update-status")) && method === "POST") {
    const authHeader = getAuthHeader(init);
    const isAdminRoute = cleanRoute.startsWith("/api/admin/");
    if (isAdminRoute && authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const parts = cleanRoute.split("/");
    const id = parts[isAdminRoute ? 4 : 3]; // /api/admin/orders/:id/update-status or /api/orders/:id/update-status
    const { orderStatus, status } = bodyData;
    const newStatus = orderStatus || status;

    if (!newStatus) {
      return makeResponse({ success: false, error: "Le nouveau statut est requis." }, 400, false);
    }

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === id);
    if (orderIndex === -1) {
      return makeResponse({ success: false, error: "Commande non trouvée." }, 404, false);
    }

    const oldStatus = orders[orderIndex].orderStatus || orders[orderIndex].status || "En attente";
    orders[orderIndex].orderStatus = newStatus;
    orders[orderIndex].status = newStatus;
    orders[orderIndex].updatedAt = new Date().toISOString();
    localStorage.setItem("asime_emulated_orders", JSON.stringify(orders));

    // Push notification to user
    const buyerUserId = orders[orderIndex].userId;
    const notifText = `📦 Commande #${id} : Votre commande est passée au statut "${newStatus}".`;
    const notifObj = {
      id: "notif_order_" + Date.now().toString() + "_" + Math.floor(Math.random() * 1000).toString(),
      orderId: id,
      oldStatus,
      newStatus,
      title: `Statut Commande : ${newStatus}`,
      text: notifText,
      type: "order_status",
      read: false,
      date: new Date().toISOString(),
      clientName: orders[orderIndex].clientName || orders[orderIndex].name,
      clientPhone: orders[orderIndex].clientPhone || orders[orderIndex].phone,
      totalAmount: orders[orderIndex].totalAmount
    };

    // Save in user profile if logged in
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    if (buyerUserId && !buyerUserId.startsWith("guest_")) {
      const uIndex = users.findIndex((u: any) => u.id === buyerUserId);
      if (uIndex > -1) {
        users[uIndex].notifications = users[uIndex].notifications || [];
        users[uIndex].notifications.unshift(notifObj);
        localStorage.setItem("asime_emulated_users", JSON.stringify(users));
      }
    }

    // Save in global notifications store for guest / realtime listeners
    try {
      const globalNotifs = JSON.parse(localStorage.getItem("asime_global_notifications") || "[]");
      globalNotifs.unshift(notifObj);
      if (globalNotifs.length > 50) globalNotifs.pop();
      localStorage.setItem("asime_global_notifications", JSON.stringify(globalNotifs));
      
      // Dispatch custom browser event for instant live notification in all open tabs/views
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("asime:order-status-changed", { detail: notifObj }));
      }
    } catch (e) {}

    return makeResponse({ success: true, order: orders[orderIndex], notification: notifObj }, 200, true);
  }

  if (cleanRoute === "/api/admin/withdrawals" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const withdrawals = JSON.parse(localStorage.getItem("asime_emulated_withdrawals") || "[]");
    return makeResponse(withdrawals, 200, true);
  }

  if (cleanRoute.startsWith("/api/admin/withdrawals/") && cleanRoute.endsWith("/approve") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const parts = cleanRoute.split("/");
    const id = parts[4]; // /api/admin/withdrawals/:id/approve

    const withdrawals = JSON.parse(localStorage.getItem("asime_emulated_withdrawals") || "[]");
    const wIndex = withdrawals.findIndex((w: any) => w.id === id);
    if (wIndex === -1) {
      return makeResponse({ success: false, error: "Retrait non trouvé." }, 404, false);
    }

    const withdrawal = withdrawals[wIndex];
    if (withdrawal.status !== "En attente") {
      return makeResponse({ success: false, error: "Ce retrait a déjà été traité." }, 400, false);
    }

    withdrawal.status = "Payé";
    localStorage.setItem("asime_emulated_withdrawals", JSON.stringify(withdrawals));

    // Update wallet transaction status
    const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
    if (wallets[withdrawal.userId]) {
      const history = wallets[withdrawal.userId].history || [];
      const tx = history.find((t: any) => t.withdrawalId === id);
      if (tx) {
        tx.status = "completed";
      }
      localStorage.setItem("asime_emulated_wallets", JSON.stringify(wallets));
    }

    // Add notification to user
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const user = users.find((u: any) => u.id === withdrawal.userId);
    if (user) {
      user.notifications = user.notifications || [];
      user.notifications.unshift({
        id: "notif_with_app_" + Date.now(),
        text: `Félicitations ! Votre demande de retrait de ${withdrawal.amount.toLocaleString()} FCFA via ${withdrawal.method} a été approuvée et transférée avec succès.`,
        type: "withdrawal",
        read: false,
        date: new Date().toISOString()
      });
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    }

    return makeResponse({ success: true, withdrawal }, 200, true);
  }

  if (cleanRoute.startsWith("/api/admin/withdrawals/") && cleanRoute.endsWith("/reject") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const parts = cleanRoute.split("/");
    const id = parts[4]; // /api/admin/withdrawals/:id/reject
    const { reason } = bodyData;

    const withdrawals = JSON.parse(localStorage.getItem("asime_emulated_withdrawals") || "[]");
    const wIndex = withdrawals.findIndex((w: any) => w.id === id);
    if (wIndex === -1) {
      return makeResponse({ success: false, error: "Retrait non trouvé." }, 404, false);
    }

    const withdrawal = withdrawals[wIndex];
    if (withdrawal.status !== "En attente") {
      return makeResponse({ success: false, error: "Ce retrait a déjà été traité." }, 400, false);
    }

    withdrawal.status = "Rejeté";
    withdrawal.rejectionReason = reason || "Rejeté par l'administrateur.";
    localStorage.setItem("asime_emulated_withdrawals", JSON.stringify(withdrawals));

    // Refund wallet balance
    const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
    if (wallets[withdrawal.userId]) {
      wallets[withdrawal.userId].balance += withdrawal.amount;
      const history = wallets[withdrawal.userId].history || [];
      const tx = history.find((t: any) => t.withdrawalId === id);
      if (tx) {
        tx.status = "failed";
        tx.description += ` (REJETÉ : ${withdrawal.rejectionReason})`;
      }
      localStorage.setItem("asime_emulated_wallets", JSON.stringify(wallets));
    }

    // Refund stats in user profile
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === withdrawal.userId);
    if (userIndex > -1) {
      const user = users[userIndex];
      if (user.role === "affilie") {
        user.affiliateStats.commissionDisponible += withdrawal.amount;
        user.affiliateStats.commissionRetiree = Math.max(0, (user.affiliateStats.commissionRetiree || 0) - withdrawal.amount);
      } else if (user.role === "vendeur") {
        user.vendeurStats.revenusGeneres += withdrawal.amount;
      }

      user.notifications = user.notifications || [];
      user.notifications.unshift({
        id: "notif_with_rej_" + Date.now(),
        text: `⚠️ Votre demande de retrait de ${withdrawal.amount.toLocaleString()} FCFA via ${withdrawal.method} a été rejetée. Motif : ${withdrawal.rejectionReason}. Les fonds ont été restitués dans votre portefeuille.`,
        type: "withdrawal",
        read: false,
        date: new Date().toISOString()
      });

      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    }

    return makeResponse({ success: true, withdrawal }, 200, true);
  }

  if (cleanRoute === "/api/admin/dashboard-stats" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé. Administration uniquement." }, 403, false);
    }

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const products = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const withdrawals = JSON.parse(localStorage.getItem("asime_emulated_withdrawals") || "[]");

    const totalClients = users.filter((u: any) => !u.role || u.role === "client").length;
    const totalSellers = users.filter((u: any) => u.role === "vendeur").length;
    const totalAffiliates = users.filter((u: any) => u.role === "affilie").length;
    const totalProducts = products.length;
    const totalOrders = orders.length;

    const globalTurnover = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const affiliateCommissions = orders.reduce((sum: number, o: any) => sum + (o.affiliateCommission || 0), 0);

    // Miabé Asi retains 10% gross. Affiliate commission is deducted exclusively from this 10%.
    const rawPlatformFee = Math.floor(globalTurnover * 0.10);
    const asimeNetRevenue = rawPlatformFee - affiliateCommissions;
    const pendingWithdrawals = withdrawals.filter((w: any) => w.status === "En attente").length;

    return makeResponse({
      totalUsers: users.length,
      totalClients,
      totalSellers,
      totalAffiliates,
      totalProducts,
      totalOrders,
      globalTurnover,
      totalRevenue: globalTurnover,
      asimeRevenue: Math.max(0, asimeNetRevenue),
      affiliateCommissions,
      pendingWithdrawals
    }, 200, true);
  }

  if (cleanRoute === "/api/showcase") {
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

    if (method === "GET") {
      // 1. Fetch from server FIRST (strict source of truth, no-store)
      try {
        const netRes = await originalFetch("/api/showcase?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Accept": "application/json"
          }
        });
        if (netRes.ok) {
          const text = await netRes.text();
          if (text && (text.trim().startsWith("{") || text.trim().startsWith("["))) {
            const data = JSON.parse(text);
            if (data && (Array.isArray(data.heroCards) || Array.isArray(data.galleryCards))) {
              try {
                localStorage.setItem("asime_showcase_cards", JSON.stringify(data));
              } catch (e) {}
              return makeResponse(data, 200, true);
            }
          }
        }
      } catch (e) {
        // Network unavailable or server down
      }

      // 2. Fallback to local cache ONLY if network request failed completely
      try {
        const stored = localStorage.getItem("asime_showcase_cards");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (Array.isArray(parsed.heroCards) || Array.isArray(parsed.galleryCards))) {
            return makeResponse(parsed, 200, true);
          }
        }
      } catch (e) {}

      return makeResponse(defaultShowcase, 200, true);
    }

    if (method === "POST") {
      const payload = {
        auth: "asime2026-auth-session",
        heroCards: bodyData?.heroCards,
        galleryCards: bodyData?.galleryCards
      };

      // 1. Send to server FIRST and wait for confirmation of persistence
      try {
        const netRes = await originalFetch("/api/showcase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "asime2026-auth-session"
          },
          body: JSON.stringify(payload)
        });

        if (netRes.ok) {
          const text = await netRes.text();
          const data = text ? JSON.parse(text) : { success: true };
          const updated = data.showcase || { heroCards: payload.heroCards, galleryCards: payload.galleryCards };
          try {
            localStorage.setItem("asime_showcase_cards", JSON.stringify(updated));
          } catch (e) {}
          return makeResponse(data, 200, true);
        } else {
          const errText = await netRes.text();
          let errMsg = "Erreur serveur lors de la mise à jour de la vitrine.";
          try { errMsg = JSON.parse(errText)?.error || errMsg; } catch (e) {}
          return makeResponse({ success: false, error: errMsg }, netRes.status, false);
        }
      } catch (e) {
        // Server unreachable
        return makeResponse({ success: false, error: "Impossible de joindre le serveur pour enregistrer la vitrine." }, 503, false);
      }
    }
  }

  if (cleanRoute === "/api/banners") {
    if (method === "GET") {
      // 1. Fetch from server FIRST
      try {
        const netRes = await originalFetch("/api/banners?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Accept": "application/json"
          }
        });
        if (netRes.ok) {
          const text = await netRes.text();
          if (text) {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              localStorage.setItem("asime_promo_slides", JSON.stringify(data));
              return makeResponse(data, 200, true);
            }
          }
        }
      } catch (e) {
        // Network unavailable
      }

      // 2. Fallback to local cache only if network failed
      try {
        const stored = localStorage.getItem("asime_promo_slides");
        if (stored) {
          return makeResponse(JSON.parse(stored), 200, true);
        }
      } catch (e) {}
      return makeResponse(null, 200, true);
    }

    if (method === "POST") {
      const slides = Array.isArray(bodyData) ? bodyData : (Array.isArray(bodyData?.slides) ? bodyData.slides : null);
      if (!Array.isArray(slides)) {
        return makeResponse({ success: false, error: "Format invalide pour les bannières." }, 400, false);
      }

      const payload = {
        auth: "asime2026-auth-session",
        slides: slides
      };

      // 1. Send to server FIRST
      try {
        const netRes = await originalFetch("/api/banners", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "asime2026-auth-session"
          },
          body: JSON.stringify(payload)
        });

        if (netRes.ok) {
          const text = await netRes.text();
          const data = text ? JSON.parse(text) : { success: true, slides };
          localStorage.setItem("asime_promo_slides", JSON.stringify(slides));
          return makeResponse(data, 200, true);
        } else {
          const errText = await netRes.text();
          let errMsg = "Erreur serveur lors de la sauvegarde des bannières.";
          try { errMsg = JSON.parse(errText)?.error || errMsg; } catch (e) {}
          return makeResponse({ success: false, error: errMsg }, netRes.status, false);
        }
      } catch (e) {
        // Offline fallback
        localStorage.setItem("asime_promo_slides", JSON.stringify(slides));
        return makeResponse({ success: true, slides, offline: true }, 200, true);
      }
    }
  }

  if (cleanRoute === "/api/settings") {
    const defaultSettings = {
      whatsappMerchantNumber: "22890000000",
      activeLogoId: "official"
    };

    if (method === "GET") {
      // 1. Fetch from server FIRST
      try {
        const netRes = await originalFetch("/api/settings?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Accept": "application/json"
          }
        });
        if (netRes.ok) {
          const text = await netRes.text();
          if (text && text.trim().startsWith("{")) {
            const data = JSON.parse(text);
            if (data) {
              const merged = {
                whatsappMerchantNumber: data.whatsappMerchantNumber || defaultSettings.whatsappMerchantNumber,
                activeLogoId: data.activeLogoId || defaultSettings.activeLogoId
              };
              localStorage.setItem("asime_emulated_settings", JSON.stringify(merged));
              if (merged.activeLogoId) {
                localStorage.setItem("asime-active-logo-id", merged.activeLogoId);
              }
              if (merged.whatsappMerchantNumber) {
                localStorage.setItem("asime_whatsapp_merchant_number", merged.whatsappMerchantNumber);
              }
              return makeResponse(merged, 200, true);
            }
          }
        }
      } catch (e) {
        // Network unavailable
      }

      // 2. Fallback to local cache only if network is down
      try {
        const stored = localStorage.getItem("asime_emulated_settings");
        if (stored) {
          return makeResponse(JSON.parse(stored), 200, true);
        }
      } catch (e) {}
      return makeResponse(defaultSettings, 200, true);
    }

    if (method === "POST") {
      const payload = {
        auth: "asime2026-auth-session",
        whatsappMerchantNumber: bodyData?.whatsappMerchantNumber || "22890000000",
        activeLogoId: bodyData?.activeLogoId || "official"
      };

      // 1. Send to server FIRST
      try {
        const netRes = await originalFetch("/api/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "asime2026-auth-session"
          },
          body: JSON.stringify(payload)
        });

        if (netRes.ok) {
          const text = await netRes.text();
          const data = text ? JSON.parse(text) : { success: true, settings: payload };
          const newSettings = data.settings || payload;
          localStorage.setItem("asime_emulated_settings", JSON.stringify(newSettings));
          localStorage.setItem("asime-active-logo-id", newSettings.activeLogoId);
          localStorage.setItem("asime_whatsapp_merchant_number", newSettings.whatsappMerchantNumber);
          return makeResponse(data, 200, true);
        } else {
          const errText = await netRes.text();
          let errMsg = "Erreur serveur lors de la sauvegarde des paramètres.";
          try { errMsg = JSON.parse(errText)?.error || errMsg; } catch (e) {}
          return makeResponse({ success: false, error: errMsg }, netRes.status, false);
        }
      } catch (e) {
        // Offline fallback
        localStorage.setItem("asime_emulated_settings", JSON.stringify(payload));
        localStorage.setItem("asime-active-logo-id", payload.activeLogoId);
        localStorage.setItem("asime_whatsapp_merchant_number", payload.whatsappMerchantNumber);
        return makeResponse({ success: true, settings: payload, offline: true }, 200, true);
      }
    }
  }

  if (cleanRoute === "/api/shops/check-slug" && method === "GET") {
    const urlObj = new URL(urlPath, "http://localhost");
    const rawSlug = String(urlObj.searchParams.get("slug") || "").trim().toLowerCase();
    
    if (!rawSlug) {
      return makeResponse({ available: false, reason: "Veuillez entrer un nom d'URL.", formattedSlug: "" }, 200, true);
    }

    const formattedSlug = rawSlug
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (formattedSlug.length < 3) {
      return makeResponse({ available: false, reason: "L'URL doit comporter au moins 3 caractères.", formattedSlug }, 200, true);
    }
    if (formattedSlug.length > 35) {
      return makeResponse({ available: false, reason: "L'URL ne doit pas dépasser 35 caractères.", formattedSlug }, 200, true);
    }

    const reservedWords = [
      "admin", "api", "boutique", "shop", "miabeasi", "asime", "root", "system", "auth",
      "login", "register", "null", "undefined", "help", "support", "dashboard", "settings",
      "vendre", "produit", "catalogue", "blog", "contact", "cart", "panier", "checkout"
    ];

    if (reservedWords.includes(formattedSlug)) {
      return makeResponse({ available: false, reason: "Ce terme est réservé par la plateforme.", formattedSlug }, 200, true);
    }

    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const isTaken = users.some((u: any) => {
      const userSlug = String(u.boutiqueSlug || u.shopSlug || "").trim().toLowerCase();
      return userSlug === formattedSlug;
    });

    if (isTaken) {
      return makeResponse({ available: false, reason: "Ce nom d'URL est déjà utilisé par une autre boutique.", formattedSlug }, 200, true);
    }

    return makeResponse({ available: true, reason: "Disponible ✓", formattedSlug }, 200, true);
  }

  if (cleanRoute.startsWith("/api/shops/") && method === "GET") {
    const slug = cleanRoute.replace("/api/shops/", "").trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const seller = users.find((u: any) => {
      if (!u || u.role !== "vendeur") return false;
      const userSlug = String(u.boutiqueSlug || u.shopSlug || "").trim().toLowerCase();
      return userSlug === slug;
    });

    if (!seller) {
      return makeResponse({ success: false, error: "Boutique introuvable." }, 404, false);
    }

    const plan = seller.vendeurPlan || (seller.vendeurSubscription === "Offre 3" ? "BUSINESS" : seller.vendeurSubscription === "Offre 2" ? "PRO" : "Gratuit");
    if (plan === "Gratuit") {
      return makeResponse({ 
        success: false, 
        error: "Cette boutique fonctionne actuellement en formule GRATUIT sans URL publique active. Les URLs publiques sont réservées aux abonnements PRO et BUSINESS." 
      }, 403, false);
    }

    const products = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const sellerProducts = products.filter((p: any) => {
      return p.vendeurId === seller.id || (seller.businessName && p.partenaire === seller.businessName) || (seller.boutiqueName && p.partenaire === seller.boutiqueName);
    });

    return makeResponse({
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
        rating: 5.0,
        reviewsCount: 0,
        productsCount: sellerProducts.length,
        createdAt: seller.createdAt || new Date().toISOString()
      },
      products: sellerProducts
    }, 200, true);
  }

  if (cleanRoute === "/api/seller/featured-request" && method === "POST") {
    const { productId } = bodyData;
    const products = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const target = products.find((p: any) => p.id === productId);
    if (target) {
      target.phareStatus = "pending";
      localStorage.setItem("asime_emulated_products", JSON.stringify(products));
    }
    return makeResponse({ success: true, message: "Demande envoyée à l'administration.", product: target }, 200, true);
  }

  if (cleanRoute === "/api/seller/banner-request" && method === "POST") {
    const banners = JSON.parse(localStorage.getItem("asime_banner_requests") || "[]");
    const newReq = {
      id: "req_banner_" + Date.now().toString(),
      ...bodyData,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    banners.unshift(newReq);
    localStorage.setItem("asime_banner_requests", JSON.stringify(banners));
    return makeResponse({ success: true, message: "Bannière soumise avec succès.", request: newReq }, 200, true);
  }

  if (cleanRoute === "/api/seller/my-banners" && method === "GET") {
    const banners = JSON.parse(localStorage.getItem("asime_banner_requests") || "[]");
    return makeResponse({ success: true, banners }, 200, true);
  }

  if (cleanRoute === "/api/admin/banner-requests" && method === "GET") {
    const banners = JSON.parse(localStorage.getItem("asime_banner_requests") || "[]");
    return makeResponse({ success: true, requests: banners }, 200, true);
  }

  if (cleanRoute === "/api/admin/db-status" && method === "GET") {
    return makeResponse({
      configured: false,
      url: "",
      hasTable: false,
      error: "Mode Émulation Client Actif. Supabase n'est pas interrogé directement dans ce mode."
    }, 200, true);
  }

  if (cleanRoute === "/api/admin/db-push" && method === "POST") {
    return makeResponse({
      success: false,
      error: "La synchronisation forcée vers le cloud n'est pas disponible en mode d'émulation client hors-ligne."
    }, 400, false);
  }

  return makeResponse({ error: "Endpoint not matched on emulated client database" }, 404, false);
}

// Override the global Window fetch definition
const customFetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.href : (input as Request).url || "");

  try {
    const res = await originalFetch(input, init);
    const isApiRoute = urlStr.includes("/api/") || urlStr.includes("/auth/") || urlStr.endsWith("/api") || urlStr.endsWith("/auth");
    if (isApiRoute) {
      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      // If an API route returned HTML (doctype, Vite SPA fallback, or 502/503 HTML gateway error) or non-JSON when failed:
      const isHtmlResponse = contentType.includes("text/html");
      const isNonJsonFailure = !res.ok && !contentType.includes("application/json");

      if (isHtmlResponse || isNonJsonFailure) {
        console.warn(`[API Interceptor] Route ${urlStr} returned Non-JSON (status: ${res.status}, Content-Type: ${contentType}). Falling back to client emulation.`);
        return await handleEmulatedRequest(urlStr, init);
      }
    }
    return res;
  } catch (err) {
    console.warn(`[API Interceptor] Fetch to ${urlStr} failed. Falling back to client emulation.`, err);
    const isApiRoute = urlStr.includes("/api/") || urlStr.includes("/auth/") || urlStr.endsWith("/api") || urlStr.endsWith("/auth");
    if (isApiRoute) {
      return await handleEmulatedRequest(urlStr, init);
    }
    throw err;
  }
};

try {
  Object.defineProperty(window, "fetch", {
    value: customFetch,
    writable: true,
    configurable: true
  });
} catch (e) {
  try {
    (window as any).fetch = customFetch;
  } catch (err) {
    console.warn("Could not override window.fetch:", err);
  }
}

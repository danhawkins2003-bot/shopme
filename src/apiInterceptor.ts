import defaultProducts from "../produits.json";
import defaultBlogs from "../blogs.json";

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
  if (!localStorage.getItem("asime_emulated_products")) {
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
  if (cleanRoute === "/api/products") {
    if (method === "GET") {
      const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
      return makeResponse(prods, 200, true);
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
      phare: !!prodDetails.phare,
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

    localStorage.setItem("asime_emulated_products", JSON.stringify(prods));
    return makeResponse({ success: true, product: savedProduct }, 200, true);
  }

  if (cleanRoute === "/api/products/save" && method === "POST") {
    const { auth, product } = bodyData;
    if (auth !== "asime2026-auth-session" && auth !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé. Session d'administrateur invalide." }, 403, false);
    }

    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    let savedProduct = { ...product };

    if (savedProduct.id) {
      // Edit
      const index = prods.findIndex((p: any) => p.id === savedProduct.id);
      if (index !== -1) {
        prods[index] = savedProduct;
      } else {
        prods.unshift(savedProduct);
      }
    } else {
      // New
      savedProduct.id = "prod_emulated_" + Date.now();
      prods.unshift(savedProduct);
    }

    localStorage.setItem("asime_emulated_products", JSON.stringify(prods));
    return makeResponse({ success: true, product: savedProduct }, 200, true);
  }

  // Handle DELETE /api/products/:id
  if (cleanRoute.startsWith("/api/products/") && method === "DELETE") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026" && authHeader !== "asime2026-auth-session" && authHeader !== "shopme2026" && authHeader !== "shopme2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    // Extract ID from product routing path
    const id = cleanRoute.substring("/api/products/".length);
    const prods = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const filtered = prods.filter((p: any) => p.id !== id);

    if (prods.length === filtered.length) {
      return makeResponse({ success: false, error: "Produit non trouvé." }, 404, false);
    }

    localStorage.setItem("asime_emulated_products", JSON.stringify(filtered));
    return makeResponse({ success: true }, 200, true);
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

  // --- CUSTOMER AUTHENTICATION ---
  if (cleanRoute === "/api/auth/register" && method === "POST") {
    const { name, email, password, phone, quartier } = bodyData;
    if (!name || !email || !password) {
      return makeResponse({ success: false, error: "Veuillez remplir les champs obligatoires (Nom, Email, Mot de passe)." }, 400, false);
    }

    const emailLower = String(email).trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");

    const existingUser = users.find((u: any) => u.email.toLowerCase() === emailLower);
    if (existingUser) {
      return makeResponse({ success: false, error: "Cette adresse email est déjà enregistrée." }, 400, false);
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
    localStorage.setItem("asime_emulated_users", JSON.stringify(users));

    const sessionToken = "user-token-" + btoa(newUser.id);
    const { passwordHash: _, ...userResponse } = newUser;

    return makeResponse({ success: true, token: sessionToken, user: userResponse }, 200, true);
  }

  if (cleanRoute === "/api/auth/login" && method === "POST") {
    const { email, password } = bodyData;
    if (!email || !password) {
      return makeResponse({ success: false, error: "Email et mot de passe requis." }, 400, false);
    }

    const emailLower = String(email).trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const user = users.find((u: any) => u.email.toLowerCase() === emailLower);

    if (!user || user.passwordHash !== hashPassword(password)) {
      return makeResponse({ success: false, error: "Identifiants de connexion incorrects." }, 401, false);
    }

    const sessionToken = "user-token-" + btoa(user.id);
    const { passwordHash: _, ...userResponse } = user;

    return makeResponse({ success: true, token: sessionToken, user: userResponse }, 200, true);
  }

  if (cleanRoute === "/api/auth/me" && method === "GET") {
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
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return makeResponse({ success: false, error: "Utilisateur non trouvé." }, 404, false);
    }

    const { passwordHash: _, ...userResponse } = user;
    return makeResponse({ success: true, user: userResponse }, 200, true);
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

    const { name, phone, quartier, vendeurPin } = bodyData;
    users[userIndex].name = String(name || users[userIndex].name).trim();
    users[userIndex].phone = String(phone === undefined ? users[userIndex].phone : phone).trim();
    users[userIndex].quartier = String(quartier === undefined ? users[userIndex].quartier : quartier).trim();
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

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));

    const { passwordHash: _, ...userResponse } = users[userIndex];
    return makeResponse({ success: true, user: userResponse }, 200, true);
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

    const { items, totalAmount, shippingDetails, paymentMethod, affiliateRef } = bodyData;

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

    // Pre-calculate potential affiliate commission (3%)
    let totalAffiliateCommission = 0;
    if (affiliateRef) {
      const affIndex = users.findIndex((u: any) => u.affiliateCode === affiliateRef || u.id === affiliateRef);
      if (affIndex > -1) {
        totalAffiliateCommission = Math.floor(totalAmount * 0.03);
      }
    }

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const newOrder = {
      id: "ord_" + (10001 + orders.length),
      userId,
      items,
      totalAmount,
      shippingDetails,
      paymentMethod,
      paymentStatus: "En attente de paiement",
      orderStatus: "En préparation",
      affiliateCode: affiliateRef || null,
      affiliateCommission: totalAffiliateCommission,
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
        text: `Votre commande #${newOrder.id} d'un montant de ${totalAmount.toLocaleString()} FCFA a été enregistrée. Veuillez procéder au paiement sécurisé de la commande.`,
        type: "order",
        read: false,
        date: new Date().toISOString()
      });
      localStorage.setItem("asime_emulated_users", JSON.stringify(users));
    }

    return makeResponse({ success: true, order: newOrder }, 200, true);
  }

  // --- EMULATED PAYMENTS: ACTIVE PROVIDERS ---
  if (cleanRoute === "/api/payments/providers" && method === "GET") {
    const providers = [
      { id: "paydunya", name: "PayDunya Gateway", type: "aggregator", active: true, country: "SN/TG" },
      { id: "tmoney", name: "TMoney", type: "mobile_money", active: true, country: "TG" },
      { id: "flooz", name: "Flooz", type: "mobile_money", active: true, country: "TG" },
      { id: "mix_by_yas", name: "Mix by Yas", type: "mobile_money", active: true, country: "TG" }
    ];
    return makeResponse(providers, 200, true);
  }

  // --- EMULATED PAYMENTS: INITIATE SESSION ---
  if (cleanRoute === "/api/payments/initiate" && method === "POST") {
    const { orderId, providerId } = bodyData;
    if (!orderId || !providerId) {
      return makeResponse({ success: false, error: "Identifiant de commande et de prestataire requis." }, 400, false);
    }

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    if (orderIndex === -1) {
      return makeResponse({ success: false, error: "Commande non trouvée." }, 404, false);
    }

    const order = orders[orderIndex];
    if (order.paymentStatus === "Payé") {
      return makeResponse({ success: false, error: "Cette commande a déjà été payée." }, 400, false);
    }

    const transactionId = "tx_emulated_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    order.paymentGatewayTxId = transactionId;
    order.paymentGatewayProvider = providerId;
    localStorage.setItem("asime_emulated_orders", JSON.stringify(orders));

    const session = {
      transactionId,
      orderId,
      amount: order.totalAmount,
      providerId,
      status: "pending",
      redirectUrl: `/payment-gateway?tx=${transactionId}&provider=${providerId}`
    };

    return makeResponse({ success: true, session }, 200, true);
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

    order.paymentStatus = "Payé";
    order.paymentGatewayTxId = transactionId;
    order.paymentGatewayProvider = providerId;
    order.paymentMethod = providerId.toUpperCase();

    // Splitting Logic!
    if (!order.splitProcessed) {
      const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
      const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
      const logs = JSON.parse(localStorage.getItem("asime_emulated_wallet_logs") || "[]");

      let affiliateUserId = null;
      if (order.affiliateCode) {
        const affUser = users.find((u: any) => u.affiliateCode === order.affiliateCode || u.id === order.affiliateCode);
        if (affUser) {
          affiliateUserId = affUser.id;
          affUser.affiliateStats = affUser.affiliateStats || {
            clicks: 0, Visitors: 0, ventes: 0, chiffreAffaires: 0, commissionsGagnees: 0, commissionDisponible: 0, commissionRetiree: 0
          };
          affUser.affiliateStats.ventes += 1;
          affUser.affiliateStats.chiffreAffaires += order.totalAmount;
          affUser.affiliateStats.commissionsGagnees += order.affiliateCommission;
          affUser.affiliateStats.commissionDisponible += order.affiliateCommission;

          affUser.notifications = affUser.notifications || [];
          affUser.notifications.unshift({
            id: "notif_split_aff_" + Date.now().toString(),
            text: `Félicitations ! Vous avez gagné une commission de ${order.affiliateCommission.toLocaleString()} FCFA pour la vente affiliée de la commande #${order.id}.`,
            type: "affiliate",
            read: false,
            date: new Date().toISOString()
          });

          // Ledger entry
          if (!wallets[affiliateUserId]) {
            wallets[affiliateUserId] = { userId: affiliateUserId, balance: 0, type: "affilie", history: [] };
          }
          wallets[affiliateUserId].balance += order.affiliateCommission;
          const affTxId = "TX-COMM-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
          wallets[affiliateUserId].history.unshift({
            id: affTxId,
            type: "commission",
            amount: order.affiliateCommission,
            orderId: order.id,
            date: new Date().toISOString(),
            description: `Commission d'affiliation de 3% pour la commande #${order.id}`,
            status: "completed"
          });

          logs.push({
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            userId: affiliateUserId,
            action: "CREDIT_COMMISSION",
            amount: order.affiliateCommission,
            orderId: order.id,
            txId: affTxId,
            message: `Crédit commission d'affilié de ${order.affiliateCommission} FCFA pour la commande ${order.id}`
          });
        }
      }

      // Sellers Earnings Split
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
            text: `Nouvelle commande payée ! Votre produit "${item.product.nom}" (x${item.quantity}) a été vendu. Votre portefeuille a été crédité de ${sellerEarnings.toLocaleString()} FCFA (90%).`,
            type: "sale",
            read: false,
            date: new Date().toISOString()
          });

          if (!wallets[sellerId]) {
            wallets[sellerId] = { userId: sellerId, balance: 0, type: "vendeur", history: [] };
          }
          wallets[sellerId].balance += sellerEarnings;
          const sellerTxId = "TX-SALE-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
          wallets[sellerId].history.unshift({
            id: sellerTxId,
            type: "vente",
            amount: sellerEarnings,
            orderId: order.id,
            date: new Date().toISOString(),
            description: `Vente produit : "${item.product.nom}" (x${item.quantity}) - Part vendeur 90%`,
            status: "completed"
          });

          logs.push({
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            userId: sellerId,
            action: "CREDIT_SALE",
            amount: sellerEarnings,
            orderId: order.id,
            txId: sellerTxId,
            message: `Crédit vente de ${sellerEarnings} FCFA pour "${item.product.nom}" (x${item.quantity}) sur commande ${order.id}`
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
          text: `Paiement confirmé ! Votre commande #${order.id} d'un montant de ${order.totalAmount.toLocaleString()} FCFA a été payée avec succès via ${order.paymentMethod}.`,
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
      const businessName = currentUser.businessName || currentUser.name;
      const sellerOrders = orders.filter((o: any) =>
        o.items.some((item: any) => item.product.partenaire === businessName || item.product.partenaire === currentUser.name)
      );
      return makeResponse(sellerOrders, 200, true);
    }

    const clientOrders = orders.filter((o: any) => o.userId === userId);
    return makeResponse(clientOrders, 200, true);
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
    return makeResponse({ success: true }, 200, true);
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
            { sender: "seller", text: "Bonjour Koffi, avec plaisir ! Nous pouvons expédier via le réseau de colis Asime.", date: new Date(Date.now() - 80000000).toISOString() },
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
    const currentUserName = currentUser ? currentUser.name : "Client Asime";

    let thread: any;
    if (threadId) {
      thread = threads.find((t: any) => t.id === threadId);
    } else if (sellerId) {
      thread = threads.find((t: any) => t.customerId === userId && t.sellerId === sellerId);
      if (!thread) {
        const targetSeller = users.find((u: any) => u.id === sellerId);
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
    if (authHeader !== "asime2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
    return makeResponse(wallets, 200, true);
  }

  if (cleanRoute === "/api/admin/wallets/logs" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const logs = JSON.parse(localStorage.getItem("asime_emulated_wallet_logs") || "[]");
    return makeResponse(logs, 200, true);
  }

  if (cleanRoute === "/api/admin/users" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
    const sanitized = users.map((u: any) => {
      const { passwordHash: _, ...rest } = u;
      return rest;
    });
    return makeResponse(sanitized, 200, true);
  }

  if (cleanRoute === "/api/admin/orders" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    return makeResponse(orders, 200, true);
  }

  if (cleanRoute.startsWith("/api/admin/orders/") && cleanRoute.endsWith("/validate-payment") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026-auth-session") {
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

    // Revenue splitting logic
    if (!order.splitProcessed) {
      const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");
      const wallets = JSON.parse(localStorage.getItem("asime_emulated_wallets") || "{}");
      const logs = JSON.parse(localStorage.getItem("asime_emulated_wallet_logs") || "[]");

      let affiliateUserId = null;
      if (order.affiliateCode) {
        const affUser = users.find((u: any) => u.affiliateCode === order.affiliateCode || u.id === order.affiliateCode);
        if (affUser) {
          affiliateUserId = affUser.id;
          affUser.affiliateStats = affUser.affiliateStats || {
            clicks: 0, Visitors: 0, ventes: 0, chiffreAffaires: 0, commissionsGagnees: 0, commissionDisponible: 0, commissionRetiree: 0
          };
          affUser.affiliateStats.ventes += 1;
          affUser.affiliateStats.chiffreAffaires += order.totalAmount;
          affUser.affiliateStats.commissionsGagnees += order.affiliateCommission;
          affUser.affiliateStats.commissionDisponible += order.affiliateCommission;

          affUser.notifications = affUser.notifications || [];
          affUser.notifications.unshift({
            id: "notif_split_aff_" + Date.now().toString(),
            text: `Félicitations ! Vous avez gagné une commission de ${order.affiliateCommission.toLocaleString()} FCFA pour la vente affiliée de la commande #${order.id}.`,
            type: "affiliate",
            read: false,
            date: new Date().toISOString()
          });

          if (!wallets[affiliateUserId]) {
            wallets[affiliateUserId] = { userId: affiliateUserId, balance: 0, type: "affilie", history: [] };
          }
          wallets[affiliateUserId].balance += order.affiliateCommission;
          const affTxId = "TX-COMM-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
          wallets[affiliateUserId].history.unshift({
            id: affTxId,
            type: "commission",
            amount: order.affiliateCommission,
            orderId: order.id,
            date: new Date().toISOString(),
            description: `Commission d'affiliation de 3% pour la commande #${order.id}`,
            status: "completed"
          });

          logs.push({
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            userId: affiliateUserId,
            action: "CREDIT_COMMISSION",
            amount: order.affiliateCommission,
            orderId: order.id,
            txId: affTxId,
            message: `Crédit commission d'affilié de ${order.affiliateCommission} FCFA pour la commande ${order.id}`
          });
        }
      }

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
            text: `Nouvelle commande payée ! Votre produit "${item.product.nom}" (x${item.quantity}) a été vendu. Votre portefeuille a été crédité de ${sellerEarnings.toLocaleString()} FCFA (90%).`,
            type: "sale",
            read: false,
            date: new Date().toISOString()
          });

          if (!wallets[sellerId]) {
            wallets[sellerId] = { userId: sellerId, balance: 0, type: "vendeur", history: [] };
          }
          wallets[sellerId].balance += sellerEarnings;
          const sellerTxId = "TX-SALE-" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
          wallets[sellerId].history.unshift({
            id: sellerTxId,
            type: "vente",
            amount: sellerEarnings,
            orderId: order.id,
            date: new Date().toISOString(),
            description: `Vente produit : "${item.product.nom}" (x${item.quantity}) - Part vendeur 90%`,
            status: "completed"
          });

          logs.push({
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            userId: sellerId,
            action: "CREDIT_SALE",
            amount: sellerEarnings,
            orderId: order.id,
            txId: sellerTxId,
            message: `Crédit vente de ${sellerEarnings} FCFA pour "${item.product.nom}" (x${item.quantity}) sur commande ${order.id}`
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

  if (cleanRoute.startsWith("/api/admin/orders/") && cleanRoute.endsWith("/update-status") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const parts = cleanRoute.split("/");
    const id = parts[4]; // /api/admin/orders/:id/update-status
    const { orderStatus } = bodyData;

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === id);
    if (orderIndex === -1) {
      return makeResponse({ success: false, error: "Commande non trouvée." }, 404, false);
    }

    orders[orderIndex].orderStatus = orderStatus;
    localStorage.setItem("asime_emulated_orders", JSON.stringify(orders));

    return makeResponse({ success: true, order: orders[orderIndex] }, 200, true);
  }

  if (cleanRoute === "/api/admin/withdrawals" && method === "GET") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }
    const withdrawals = JSON.parse(localStorage.getItem("asime_emulated_withdrawals") || "[]");
    return makeResponse(withdrawals, 200, true);
  }

  if (cleanRoute.startsWith("/api/admin/withdrawals/") && cleanRoute.endsWith("/approve") && method === "POST") {
    const authHeader = getAuthHeader(init);
    if (authHeader !== "asime2026-auth-session") {
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
    if (authHeader !== "asime2026-auth-session") {
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
    if (authHeader !== "asime2026-auth-session") {
      return makeResponse({ success: false, error: "Accès refusé." }, 403, false);
    }

    const orders = JSON.parse(localStorage.getItem("asime_emulated_orders") || "[]");
    const products = JSON.parse(localStorage.getItem("asime_emulated_products") || "[]");
    const users = JSON.parse(localStorage.getItem("asime_emulated_users") || "[]");

    const paidOrders = orders.filter((o: any) => o.paymentStatus === "Payé");
    const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

    return makeResponse({
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalRevenue
    }, 200, true);
  }

  if (cleanRoute === "/api/settings") {
    if (method === "GET") {
      const defaultSettings = {
        whatsappMerchantNumber: "22890000000",
        activeLogoId: "monogramme_plume"
      };
      try {
        const stored = localStorage.getItem("asime_emulated_settings");
        if (stored) {
          return makeResponse(JSON.parse(stored), 200, true);
        }
      } catch (e) {}
      return makeResponse(defaultSettings, 200, true);
    }

    if (method === "POST") {
      try {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const defaultSettings = {
          whatsappMerchantNumber: "22890000000",
          activeLogoId: "monogramme_plume"
        };
        const currentStored = localStorage.getItem("asime_emulated_settings");
        const current = currentStored ? JSON.parse(currentStored) : defaultSettings;

        const newSettings = {
          whatsappMerchantNumber: body.whatsappMerchantNumber || current.whatsappMerchantNumber || "22890000000",
          activeLogoId: body.activeLogoId || current.activeLogoId || "monogramme_plume"
        };

        localStorage.setItem("asime_emulated_settings", JSON.stringify(newSettings));
        
        localStorage.setItem("asime-active-logo-id", newSettings.activeLogoId);
        localStorage.setItem("asime_whatsapp_merchant_number", newSettings.whatsappMerchantNumber);

        return makeResponse({ success: true, settings: newSettings }, 200, true);
      } catch (err: any) {
        return makeResponse({ success: false, error: err.message }, 500, false);
      }
    }
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
  // Client-side emulation is completely disabled to ensure all data is written to the real backend and Supabase
  return originalFetch(input, init);
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

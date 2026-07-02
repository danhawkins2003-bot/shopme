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

// Keep a reference to the native fetch
const originalFetch = window.fetch;

// Custom emulator state
const isStaticHost = typeof window !== "undefined" && (
  window.location.hostname.includes("vercel.app") || 
  window.location.hostname.includes("github.io") || 
  window.location.hostname.includes("netlify.app") ||
  window.location.hostname.includes("shopme-eosin")
);
let useLocalEmulation: boolean | null = isStaticHost ? true : null;

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
    let userSubscription = "";
    let isSeller = false;

    if (authHeader) {
      let userId = "";
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
      user.vendeurPaymentMethod = vendeurPaymentMethod || "TMoney";
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

    const { name, phone, quartier } = bodyData;
    users[userIndex].name = String(name || users[userIndex].name).trim();
    users[userIndex].phone = String(phone === undefined ? users[userIndex].phone : phone).trim();
    users[userIndex].quartier = String(quartier === undefined ? users[userIndex].quartier : quartier).trim();

    localStorage.setItem("asime_emulated_users", JSON.stringify(users));

    const { passwordHash: _, ...userResponse } = users[userIndex];
    return makeResponse({ success: true, user: userResponse }, 200, true);
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

  return makeResponse({ error: "Endpoint not matched on emulated client database" }, 404, false);
}

// Override the global Window fetch definition
window.fetch = async function(input, init) {
  let url = typeof input === "string" ? input : (input instanceof Request ? input.url : "");

  // If the request points to our mockable /api backend endpoints
  if (url.startsWith("/api") || url.startsWith("./api") || url.includes("/api/")) {
    
    // Normalize URL path to begin with "/api"
    let apiPath = url;
    if (url.includes("/api/")) {
      apiPath = "/api/" + url.split("/api/")[1];
    } else if (url.startsWith("api/")) {
      apiPath = "/" + url;
    } else if (url.startsWith("./api/")) {
      apiPath = url.substring(1);
    }

    // Try normal fetch first (if emulation is not explicitly forced yet)
    if (useLocalEmulation === null) {
      try {
        const res = await originalFetch(input, init);
        const contentType = res.headers?.get("content-type") || "";
        
        // Vercel routes index.html text/html for unhandled server paths or if it receives 404/405
        if (res.status === 404 || res.status === 405 || res.status >= 500 || contentType.includes("text/html")) {
          useLocalEmulation = true;
          console.log("[Asime Interceptor] Switched to client-side emulation database container.");
          return handleEmulatedRequest(apiPath, init);
        } else {
          // Keep using real server-side api
          useLocalEmulation = false;
          return res;
        }
      } catch (err) {
        useLocalEmulation = true;
        console.log("[Asime Interceptor] Server unreachable, fallbacked to client-side localStorage db.");
        return handleEmulatedRequest(apiPath, init);
      }
    }

    if (useLocalEmulation) {
      return handleEmulatedRequest(apiPath, init);
    } else {
      return originalFetch(input, init);
    }
  }

  // Fallback to normal fetch for assets (images, fonts, html pages)
  return originalFetch(input, init);
};

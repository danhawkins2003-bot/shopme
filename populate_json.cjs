const fs = require('fs');

const categories = [
  {
    name: "Made in Togo Premium",
    partners: ["Jumia", "CJ Affiliate", "Amazon", "Boutique en Direct"],
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1590156546746-c589fbfb31d6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["Miel Sauvage Élite", "Beurre de Karité Origin", "Huile de Coco Vierge", "Café Moulu Arabica", "Thé de Bissap Infusion", "Chocolat Noir Artisanal", "Savon Bio Goyave", "Coffre en Bois de Teck", "Statue Argile Sculptée", "Huile Essentielle Pure", "Chapeau de Paille Fine", "Écrin d'Ébène Travaillé", "Panier Raphia Tissé", "Liqueur de Mangue", "Farine de Manioc Élite"],
    adjectives: ["de Kpalimé", "de Notsé", "des Plateaux", "d'Atakpamé", "de Tandjouaré", "d'Aného", "des Monts Kabyè", "de Tsévié", "du Mono", "de Kovié", "du Bas-Mono", "de Danyi", "de Badou", "de Sotouboua", "de Kara"],
    basePrice: 2500, priceRange: 15000
  },
  {
    name: "Vêtements & Mode",
    partners: ["CJ Affiliate", "Jumia", "Amazon"],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["T-shirt Designer Lomé", "Boubou Brodé Impérial", "Chemise en Coton", "Veste Safari Stylée", "Robe Longue Fleurie", "Sweat-shirt Togo", "Polo Classique", "Pantalon Chino", "Blouson Léger", "Tunique Bohème", "Gilet Traditionnel Wax", "Robe de Prestige", "Costume Sur-Mesure", "Écharpe d'Art", "Short d'Été Coton"],
    adjectives: ["Lomvi", "Sénégalais", "Afropolitain", "Premium", "Confort", "Héritage", "Royale", "Sahara", "Moderne", "Signature", "Élite", "Vintage", "Nomade", "Horizon", "Urban"],
    basePrice: 6500, priceRange: 38000
  },
  {
    name: "Chaussures Premium",
    partners: ["Amazon", "AliExpress"],
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["Mocassins Cuir Noble", "Sneakers Sport", "Sandales de Cuir", "Bottines Designer", "Baskets Elite Run", "Derbies en Cuir", "Slippers Confort", "Espadrilles Riviera", "Babouches Apprêtées", "Tennis Légères"],
    adjectives: ["Koutammakou", "Prestige", "Confort Absolu", "Urbaines", "Course Pro", "Rhéa", "Impérial", "Sovereign", "Sahélienne", "Vibe"],
    basePrice: 15000, priceRange: 45000
  },
  {
    name: "Montres & Accessoires",
    partners: ["AliExpress", "ClickBank", "CJ Affiliate"],
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["Montre Chronographe", "Lunettes de Soleil", "Portefeuille Raffiné", "Ceinture Double Face", "Sac-à-main Élégant", "Bracelet de Perles", "Bague d'Argent Gravée", "Sac de Voyage Cuir", "Pendentif Totem", "Montre Automatique"],
    adjectives: ["Black Gold", "Quartz Pro", "Lomé Sunset", "Impériale", "Nomade", "Safari", "Astral", "Futura", "Milanaise", "Ébène"],
    basePrice: 5000, priceRange: 35000
  },
  {
    name: "Plats & Gastronomie",
    partners: ["Boutique en Direct", "ClickBank"],
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["Superbe Plateau Fufu", "Assiette d'Ayimolou", "Gboma Dessi Poulet", "Riz Jollof Festif", "Poisson Grillé Braisé", "Ragout d'Igname Douce", "Salade Composée Togo", "Soupe de Poisson Royale"],
    adjectives: ["Gourmet", "Maison", "Terroir Secrêt", "Traditionnel", "Sauce Arachide", "Royale", "Épicé au Gingembre", "Feu de Bois"],
    basePrice: 3500, priceRange: 12000
  },
  {
    name: "Importations Trends",
    partners: ["AliExpress", "Amazon", "Jumia"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["Écouteurs Pro Active", "Mini Projecteur Smart", "Chargeur Solaire Extérieur", "Anneau Lumineux LED", "Mini Console Vidéo", "Enceinte sans fil", "Smartband Sport", "Micro Cravate Studio"],
    adjectives: ["Noise Cancelling", "Cinema Pocket", "Hyper-Charge", "Halo Glow", "Portable Retro", "Aero Pro", "Waterproof Bass", "Vlogger Duo"],
    basePrice: 4000, priceRange: 50000
  },
  {
    name: "Paniers Frais & Épicerie",
    partners: ["Boutique en Direct", "Jumia"],
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["Panier Maraîcher Complet", "Avocats Bio Onctueux", "Mangues Mûres Juteuses", "Racines de Gingembre", "Sélection d'Épices", "Tomates Grappes Fermes", "Ananas Pain de Sucre", "Bananes Alloco Sucrées"],
    adjectives: ["de Kovié", "de la Ferme", "de Saison", "du Jardin Bio", "Volcaniques", "Fraîches", "Mûries au Soleil", "Coopérative Locale"],
    basePrice: 1500, priceRange: 10000
  },
  {
    name: "Print-on-Demand Localisé",
    partners: ["ClickBank", "CJ Affiliate"],
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe7cbb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
    ],
    nouns: ["Mug en Céramique Fine", "Coussin de Déco Salon", "Affiche Graphique Lomé", "Coque Rigide Mobile", "Carnet d'Inspirations", "Gourde Isolante Sport", "Tote Bag Écolo Toile", "Cadre Mural Décoratif"],
    adjectives: ["Miawoezon", "Skyline Lomé", "Togo Patriote", "Édition Limitée", "Sérigraphie Or", "Minimaliste", "E-Lomé Vibe", "Couleurs d'Afrique"],
    basePrice: 2000, priceRange: 15000
  }
];

const generatedProducts = [];
const targetCount = 105;

// Let's ensure "Made in Togo Premium" is heavily featured and listed FIRST in the catalogue ordering.
// We can do this by prioritizing category index 0 ("Made in Togo Premium") or sorting the final array as well.
for (let i = 0; i < targetCount; i++) {
  // Distribute across categories, but put Made in Togo in a pattern
  const catIndex = i % categories.length;
  const cat = categories[catIndex];

  const nounIndex = Math.floor(i / categories.length) % cat.nouns.length;
  const adjIndex = (Math.floor(i / categories.length) + i) % cat.adjectives.length;
  
  const noun = cat.nouns[nounIndex];
  const adj = cat.adjectives[adjIndex];
  const name = `${noun} ${adj}`;
  
  const partner = cat.partners[i % cat.partners.length];
  const imageMain = cat.images[i % cat.images.length];
  const imageAlt = cat.images[(i + 1) % cat.images.length];

  const prix = cat.basePrice + Math.floor(((i * 79) % 100) / 100 * cat.priceRange / 100) * 100;
  const isPromo = i % 3 === 0;
  const prixBarre = isPromo ? Math.floor(prix * 1.25 / 100) * 105 : null;

  const stock = 10 + (i * 15) % 150;

  // Set real simulated affiliate links configured for their benefit
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
    affiliateUrl = ""; // Direct purchase (WhatsApp fallback)
  }

  const isLocal = cat.name === "Made in Togo Premium" || cat.name === "Paniers Frais & Épicerie";

  const description = `Un article d'exception sélectionné méticuleusement par l'équipe d'experts de Asime Togo. De type "${noun}", cette référence est sublimée par son esthétique "${adj}". ${isLocal ? "Fier d'encourager la production nationale togolaise et le consommer local au quotidien." : "Un standard de qualité internationale au service exclusif de notre clientèle locale."} Fabrication/Emballage soigné, durabilité garantie et entière satisfaction client.`;

  generatedProducts.push({
    id: `prod_pop_${i + 1}`,
    nom: name,
    description: description,
    prix: prix,
    prixBarre: prixBarre,
    images: [imageMain, imageAlt],
    categorie: cat.name,
    phare: i < 15, // Let some of the first ones be featured (phare)
    stock: stock,
    partenaire: partner,
    lienAffilie: affiliateUrl
  });
}

// Sort the generated array so all "Made in Togo Premium" products appear at the absolute beginning!
// This guarantees that when the user visits the home page/catalogue, the first products/sections show local items!
generatedProducts.sort((a, b) => {
  const isAMadeInTogo = a.categorie === "Made in Togo Premium";
  const isBMadeInTogo = b.categorie === "Made in Togo Premium";
  if (isAMadeInTogo && !isBMadeInTogo) return -1;
  if (!isAMadeInTogo && isBMadeInTogo) return 1;
  return 0; // maintain order
});

fs.writeFileSync('./produits.json', JSON.stringify(generatedProducts, null, 2));
console.log("Successfully wrote 105 products with Made in Togo Premium at the top!");

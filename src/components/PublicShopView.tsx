import React, { useState, useEffect } from "react";
import { 
  Store, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  ShoppingBag, 
  Search, 
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Crown,
  Award,
  AlertCircle
} from "lucide-react";
import { Product, ShopProfile } from "../types";

interface PublicShopViewProps {
  slug: string;
  onBackToCatalog: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  formatFCFA: (amount: number) => string;
}

export const PublicShopView: React.FC<PublicShopViewProps> = ({
  slug,
  onBackToCatalog,
  onProductClick,
  onAddToCart,
  formatFCFA
}) => {
  const [shop, setShop] = useState<ShopProfile | any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/shops/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setShop(data.shop);
          setProducts(data.products || []);
        } else {
          setError(data.error || "Boutique introuvable.");
        }
      })
      .catch((err) => {
        setError("Erreur de chargement de la boutique.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const categories = ["Tous", ...Array.from(new Set(products.map((p) => p.categorie).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "Tous" || p.categorie === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-neutral-600">
        <div className="w-12 h-12 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-sm uppercase tracking-wider font-semibold text-neutral-500">Chargement de la vitrine artisanale...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-neutral-200 rounded-sm text-center shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-[#b8901c] rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-black uppercase text-neutral-900 mb-2">Boutique Non Accessible</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6 font-sans">
          {error || "Cette boutique n'existe pas ou n'a pas encore configuré d'adresse publique."}
        </p>
        <button
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue Miabé Asi</span>
        </button>
      </div>
    );
  }

  const isBusiness = shop.plan === "BUSINESS" || shop.badge === "business";
  const isPro = shop.plan === "PRO" || shop.badge === "pro";

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-16 animate-fade-in">
      
      {/* Top back navigation */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
            <span>Catalogue Miabé Asi</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Lien copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager la boutique</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cover Banner */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 bg-neutral-950 overflow-hidden border-b border-[#d4af37]/30">
        {shop.coverImage ? (
          <img
            src={shop.coverImage}
            alt={shop.name}
            className="w-full h-full object-cover opacity-85"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center opacity-90"
            style={{ 
              background: shop.primaryColor 
                ? `linear-gradient(135deg, #171717 0%, ${shop.primaryColor} 100%)` 
                : "linear-gradient(135deg, #09090b 0%, #1c1917 50%, #0E5224 100%)" 
            }}
          >
            <Store className="w-20 h-20 text-white/10" />
          </div>
        )}
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Profile Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
        <div className="bg-white border border-neutral-200/80 rounded-sm shadow-md p-5 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: Avatar & Info */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm border-2 border-white shadow-md bg-neutral-900 text-white flex items-center justify-center overflow-hidden">
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-10 h-10 text-[#d4af37]" />
                  )}
                </div>
                {isBusiness ? (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#d4af37] to-amber-600 text-stone-950 p-1 rounded-full shadow-xs" title="Vendeur Officiel BUSINESS">
                    <Crown className="w-4 h-4" />
                  </div>
                ) : isPro ? (
                  <div className="absolute -bottom-2 -right-2 bg-[#d4af37] text-stone-950 p-1 rounded-full shadow-xs" title="Vendeur Vérifié PRO">
                    <Award className="w-4 h-4" />
                  </div>
                ) : null}
              </div>

              <div className="space-y-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-black uppercase text-neutral-950 tracking-tight">
                    {shop.name}
                  </h1>
                  {isBusiness ? (
                    <span className="bg-gradient-to-r from-[#d4af37] to-amber-600 text-stone-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs">
                      Vendeur BUSINESS
                    </span>
                  ) : isPro ? (
                    <span className="bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#b8901c] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs">
                      Vendeur PRO
                    </span>
                  ) : (
                    <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                      Partenaire
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-500 font-sans">
                  Géré par <strong className="text-neutral-800">{shop.gerant}</strong> &bull; {shop.category || "Artisanat Togolais"}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{shop.quartier ? `${shop.quartier}, Lomé` : "Lomé, Togo"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{shop.rating ? shop.rating.toFixed(1) : "5.0"} (Artisan certifié)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Direct Contact */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              {shop.whatsapp && (
                <a
                  href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${shop.name}, je vous contacte depuis votre boutique Miabé Asi.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xs font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
              {shop.phone && (
                <a
                  href={`tel:${shop.phone.replace(/[^0-9+]/g, "")}`}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 px-4 py-2.5 rounded-xs font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Appeler</span>
                </a>
              )}
            </div>

          </div>

          {/* Bio & Story */}
          {shop.bio && (
            <div className="mt-6 pt-5 border-t border-neutral-100 text-left">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">À propos de notre atelier</h3>
              <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                {shop.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-neutral-950 tracking-tight text-left">
              Créations &amp; Articles de la Boutique ({filteredProducts.length})
            </h2>
            <p className="text-xs text-neutral-500 font-sans text-left">
              Articles confectionnés et expédiés directement par cet artisan partenaire.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* Category Chips */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-sm p-12 text-center my-6">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="font-display text-base font-bold uppercase text-neutral-800">Aucun produit trouvé</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Aucun article ne correspond à votre filtre de recherche pour cette boutique.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onProductClick(prod)}
                className="group bg-white border border-neutral-200 hover:border-[#d4af37]/80 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col text-left cursor-pointer"
              >
                {/* Image */}
                <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden">
                  <img
                    src={prod.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"}
                    alt={prod.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {prod.phare && (
                    <div className="absolute top-2 left-2 bg-[#d4af37] text-stone-950 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-xs shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Phare</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">
                      {prod.categorie}
                    </span>
                    <h4 className="font-display text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#b8901c] transition-colors line-clamp-2 leading-snug">
                      {prod.nom}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs sm:text-sm font-black text-neutral-950">
                        {formatFCFA(prod.prix)}
                      </span>
                      {prod.prixBarre && prod.prixBarre > prod.prix && (
                        <span className="font-mono text-[10px] text-neutral-400 line-through block leading-none">
                          {formatFCFA(prod.prixBarre)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(prod, e);
                      }}
                      className="bg-neutral-900 hover:bg-[#d4af37] text-white hover:text-stone-950 w-8 h-8 rounded-xs flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      title="Ajouter au panier"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

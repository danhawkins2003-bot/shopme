import React, { useState } from "react";
import { X, ImageIcon, Info, Plus, Trash2, Edit3, Check, RefreshCw } from "lucide-react";
import { PromoSlide, RECOMMENDED_BANNER_DIMENSIONS, INITIAL_PROMO_SLIDES } from "../data/promoBanners";

interface BannerDimensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoSlides: PromoSlide[];
  onUpdateSlides: (newSlides: PromoSlide[]) => void;
  language: "fr" | "ee";
}

export const BannerDimensionsModal: React.FC<BannerDimensionsModalProps> = ({
  isOpen,
  onClose,
  promoSlides,
  onUpdateSlides,
  language
}) => {
  const isFr = language === "fr";
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PromoSlide>>({});

  if (!isOpen) return null;

  const handleEdit = (slide: PromoSlide) => {
    setEditingSlideId(slide.id);
    setFormData({ ...slide });
  };

  const handleCreateNew = () => {
    const newSlide: PromoSlide = {
      id: `slide-${Date.now()}`,
      badgeTagFr: "NOUVELLE AFFICHE 🇹🇬",
      badgeTagEe: "AFFICHE YEYE 🇹🇬",
      badgeSubFr: "Événement Special",
      badgeSubEe: "Dɔwɔna Tɔxɛ",
      subtitleFr: "Découvrez notre sélection",
      subtitleEe: "Kpɔ míaƒe adzɔnuwo",
      titleFr: "Titre de l'Affiche Spéciale",
      titleEe: "Affichea ƒe Ŋkɔ",
      offerMainFr: "REMISE SPÉCIALE -20%",
      offerMainEe: "ASIƉEƉE -20%",
      offerSubFr: "Sur la boutique officielle",
      offerSubEe: "Le Fiase me",
      descFr: "Soutenez le consommer local au Togo avec nos produits authentiques.",
      descEe: "Kpe de Togo adzɔnuwo ŋu.",
      buttonTextFr: "Voir la Collection",
      buttonTextEe: "Kpɔ Adzɔnuwo",
      categoryTarget: "Tous",
      searchQuery: "",
      bgGradient: "linear-gradient(135deg, #180500 0%, #361002 50%, #521908 100%)",
      imageUrl: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=600",
      imageAlt: "Affiche Togo",
      overlayLabelFr: "Collection Spéciale",
      overlayLabelEe: "Adzɔnu Tɔxɛ"
    };
    setEditingSlideId(newSlide.id);
    setFormData(newSlide);
  };

  const handleSaveForm = () => {
    if (!formData.id) return;
    const exists = promoSlides.some(s => s.id === formData.id);
    let updated: PromoSlide[];
    if (exists) {
      updated = promoSlides.map(s => s.id === formData.id ? { ...s, ...formData } as PromoSlide : s);
    } else {
      updated = [...promoSlides, formData as PromoSlide];
    }
    onUpdateSlides(updated);
    setEditingSlideId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm(isFr ? "Supprimer cette affiche du carrousel ?" : "Ɖe affichea ɖa?")) {
      const updated = promoSlides.filter(s => s.id !== id);
      onUpdateSlides(updated);
    }
  };

  const handleResetDefaults = () => {
    if (confirm(isFr ? "Réinitialiser les affiches par défaut ?" : "Gbugbɔ trɔ affiches wo?")) {
      onUpdateSlides(INITIAL_PROMO_SLIDES);
      setEditingSlideId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C89D34]/20 border border-[#C89D34]/40 flex items-center justify-center text-[#C89D34]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                {isFr ? "Guide des Dimensions & Gestion des Affiches" : "Affiches ƒe Nɔnɔme kple Asixɔme"}
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                {isFr 
                  ? "Formats uniques recommandés pour changer vos affiches à volonté"
                  : "Affiches ƒe nɔnɔme sɔsɔe na trɔtrɔ gbeɖe gbeɖe"
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Standards / Dimensions Box */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wide">
                  {isFr ? "📐 Dimensions Unique des Images Recommandées :" : "📐 Dimensions Sɔsɔewo :"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Standard Side Visual */}
                  <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-stone-900 uppercase">
                        1. Visuel Produit / Modèle (Côté Droit)
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Ratio 1:1
                      </span>
                    </div>
                    <p className="text-xs font-mono text-emerald-700 font-bold">
                      Dimensions : {RECOMMENDED_BANNER_DIMENSIONS.sideImage.recommendedWidth} × {RECOMMENDED_BANNER_DIMENSIONS.sideImage.recommendedHeight}
                    </p>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {RECOMMENDED_BANNER_DIMENSIONS.sideImage.description}. (Formats acceptés : JPG, PNG, WebP).
                    </p>
                  </div>

                  {/* Full Banner Poster */}
                  <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-stone-900 uppercase">
                        2. Affiche Bannières Complète (Full Poster)
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Ratio 12:5 (16:9)
                      </span>
                    </div>
                    <p className="text-xs font-mono text-emerald-700 font-bold">
                      Dimensions : {RECOMMENDED_BANNER_DIMENSIONS.fullPoster.recommendedWidth} × {RECOMMENDED_BANNER_DIMENSIONS.fullPoster.recommendedHeight}
                    </p>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {RECOMMENDED_BANNER_DIMENSIONS.fullPoster.description}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Editor or List View */}
          {editingSlideId ? (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h4 className="font-bold text-stone-900 text-sm uppercase">
                  {isFr ? "Éditer l'Affiche Publicitaire" : "Trɔ Affichea"}
                </h4>
                <button 
                  onClick={() => setEditingSlideId(null)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  {isFr ? "Annuler" : "Gbée"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Badge Principal (FR)
                  </label>
                  <input 
                    type="text" 
                    value={formData.badgeTagFr || ""}
                    onChange={e => setFormData({ ...formData, badgeTagFr: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Sous-Badge (FR)
                  </label>
                  <input 
                    type="text" 
                    value={formData.badgeSubFr || ""}
                    onChange={e => setFormData({ ...formData, badgeSubFr: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Sur-Titre / Provenance (FR)
                  </label>
                  <input 
                    type="text" 
                    value={formData.subtitleFr || ""}
                    onChange={e => setFormData({ ...formData, subtitleFr: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Grand Titre de l'Affiche (FR)
                  </label>
                  <input 
                    type="text" 
                    value={formData.titleFr || ""}
                    onChange={e => setFormData({ ...formData, titleFr: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Texte Remise / Offre Clé (Ex: -30% DE REMISE)
                  </label>
                  <input 
                    type="text" 
                    value={formData.offerMainFr || ""}
                    onChange={e => setFormData({ ...formData, offerMainFr: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Détail Offre
                  </label>
                  <input 
                    type="text" 
                    value={formData.offerSubFr || ""}
                    onChange={e => setFormData({ ...formData, offerSubFr: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    URL de l'Image de l'Affiche (Format conseillé 500x500px ou Base64)
                  </label>
                  <input 
                    type="text" 
                    value={formData.imageUrl || ""}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Catégorie Cible au Clic
                  </label>
                  <select 
                    value={formData.categoryTarget || "Tous"}
                    onChange={e => setFormData({ ...formData, categoryTarget: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  >
                    <option value="Tous">Toutes les catégories</option>
                    <option value="Made in Togo Premium">Made in Togo Premium</option>
                    <option value="Épicerie & Fruits Séchés">Épicerie & Fruits Séchés</option>
                    <option value="Beauté & Santé Bio">Beauté & Santé Bio</option>
                    <option value="Artisanat & Déco">Artisanat & Déco</option>
                    <option value="Accessoires Mode & Cuir">Accessoires Mode & Cuir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Fond / Gradient CSS
                  </label>
                  <input 
                    type="text" 
                    value={formData.bgGradient || ""}
                    onChange={e => setFormData({ ...formData, bgGradient: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C89D34]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  onClick={() => setEditingSlideId(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  {isFr ? "Annuler" : "Gbée"}
                </button>
                <button 
                  onClick={handleSaveForm}
                  className="px-5 py-2 bg-[#C89D34] text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-500 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  {isFr ? "Enregistrer l'Affiche" : "Dzráe ɖo"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-stone-900 text-sm uppercase tracking-wide">
                  {isFr ? `Affiches Actives (${promoSlides.length})` : `Affiches (${promoSlides.length})`}
                </h4>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleResetDefaults}
                    className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-stone-100 cursor-pointer"
                    title="Réinitialiser"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {isFr ? "Réinitialiser" : "Gbugbɔe"}
                  </button>
                  <button 
                    onClick={handleCreateNew}
                    className="px-3.5 py-1.5 bg-[#0F5132] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {isFr ? "Ajouter une Affiche" : "Kpé Affiche"}
                  </button>
                </div>
              </div>

              {/* List of current slides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoSlides.map((slide, idx) => (
                  <div 
                    key={slide.id}
                    className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex gap-3 items-center justify-between shadow-xs hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-stone-300 bg-stone-200">
                        <img 
                          src={slide.imageUrl} 
                          alt={slide.imageAlt} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-amber-700 block truncate">
                          Slide #{idx + 1} • {slide.badgeSubFr}
                        </span>
                        <h5 className="font-bold text-stone-900 text-xs truncate">
                          {slide.titleFr}
                        </h5>
                        <p className="text-[11px] font-bold text-emerald-700 truncate">
                          {slide.offerMainFr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => handleEdit(slide)}
                        className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-amber-50 text-stone-700 hover:text-amber-700 transition-colors cursor-pointer"
                        title="Éditer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(slide.id)}
                        className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-red-50 text-stone-700 hover:text-red-600 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-sans">
          <span>
            {isFr 
              ? "Les modifications apportées au carrousel sont enregistrées immédiatement." 
              : "Trɔtrɔwo le zãzãm fifia."
            }
          </span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {isFr ? "Fermer le guide" : "Tutu"}
          </button>
        </div>

      </div>
    </div>
  );
};

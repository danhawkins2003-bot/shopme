import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Check } from "lucide-react";

interface CookieConsentBannerProps {
  onOpenLegal: (tab: "confidentialite" | "cgu" | "remboursement" | "cookies") => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenLegal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("asime_cookie_consent");
      if (!consent) {
        // Small delay to prevent jarring appearance on initial load
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setIsVisible(false);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("asime_cookie_consent", "all");
    } catch (e) {}
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem("asime_cookie_consent", "essential");
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[350] p-3 sm:p-4 bg-neutral-950/95 text-white border-t border-[#d4af37]/40 backdrop-blur-md shadow-2xl animate-fade-in">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#0f5132]/30 text-[#d4af37] rounded-sm shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="text-xs text-neutral-300 leading-relaxed">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px] mb-0.5">
              Respect de votre vie privée & Cookies
            </span>
            <p>
              Miabé Asi utilise des cookies et le stockage local strictement nécessaires pour sécuriser vos paiements PayDunya, mémoriser votre panier et vos devises régionales (XOF/XAF). Aucun cookie publicitaire invasif n'est utilisé.{" "}
              <button
                type="button"
                onClick={() => onOpenLegal("cookies")}
                className="text-[#d4af37] underline hover:text-amber-300 font-semibold cursor-pointer ml-1 inline"
              >
                En savoir plus & politique
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="px-3.5 py-2 text-[11px] font-bold text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-sm uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto text-center"
          >
            Essentiels uniquement
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-4 py-2 text-[11px] font-extrabold bg-[#0f5132] hover:bg-[#0c4027] text-white border border-emerald-500/40 rounded-sm uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <Check className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Accepter & Continuer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

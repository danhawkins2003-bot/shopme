import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCountry } from "../context/CountryContext";

interface CountrySelectorProps {
  id?: string;
  className?: string;
  compactOnMobile?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  id = "header-country-selector",
  className = "",
  compactOnMobile = false
}) => {
  const { country, currencyCode, setCountryCode, countries } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`} id={id}>
      {/* Trigger Button displaying Flag, Name, and Currency */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 bg-[#F0EAE0] border border-[#E1D6C5] hover:bg-[#EBE2D3] text-neutral-800 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-2xs transition-all cursor-pointer font-sans shrink-0 focus:outline-none focus:ring-1 focus:ring-[#C88A24]/50"
        title={`Pays actuel : ${country.name} (${currencyCode}) — Cliquer pour changer de pays`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-sm sm:text-base leading-none select-none" aria-hidden="true">
          {country.flagEmoji || "🇹🇬"}
        </span>

        <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-none truncate max-w-[55px] sm:max-w-none">
          {country.name}
        </span>

        <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase text-[#0E5224] bg-emerald-100/70 border border-emerald-300/50 px-1 py-0.5 rounded leading-none">
          {currencyCode}
        </span>

        <ChevronDown
          className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#0E5224]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu listing exclusively the 7 PayDunya countries */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Sélectionner un pays"
          className="absolute right-0 mt-2 w-60 sm:w-64 bg-white rounded-md shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 text-[9.5px] font-black uppercase tracking-wider text-[#C88A24] border-b border-stone-100 flex items-center justify-between">
            <span>Pays pris en charge</span>
            <span className="text-stone-400 font-medium">Zone PayDunya</span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {countries.map((c) => {
              const isSelected = c.code === country.code;
              return (
                <button
                  key={c.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => {
                    setCountryCode(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-amber-50/80 text-neutral-900 font-bold"
                      : "hover:bg-stone-50 text-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none select-none" aria-hidden="true">
                      {c.flagEmoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold leading-tight text-neutral-900">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-stone-500 font-sans">
                        {c.phoneCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        c.currencyCode === "XOF"
                          ? "bg-emerald-50 text-[#0E5224] border border-emerald-200/60"
                          : "bg-blue-50 text-blue-700 border border-blue-200/60"
                      }`}
                    >
                      {c.currencyCode}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0E5224] shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 bg-stone-50/80 border-t border-stone-100 text-[9px] text-stone-500 font-sans flex items-center justify-between">
            <span>Défaut : Togo (TG)</span>
            <span className="font-semibold text-[#0E5224]">7 pays actifs</span>
          </div>
        </div>
      )}
    </div>
  );
};

import { Country, Currency, SupportedCountryCode, SupportedCurrencyCode } from "../types";

/**
 * Devises prises en charge par PayDunya pour le périmètre Miabé Asi :
 * - XOF : Franc CFA (UEMOA / BCEAO)
 * - XAF : Franc CFA (CEMAC / BEAC)
 */
export const SUPPORTED_CURRENCIES: Record<SupportedCurrencyCode, Currency> = {
  XOF: {
    code: "XOF",
    name: "Franc CFA (BCEAO)",
    symbol: "FCFA",
    exchangeRateToXof: 1.0,
    decimalDigits: 0,
    isActive: true
  },
  XAF: {
    code: "XAF",
    name: "Franc CFA (BEAC)",
    symbol: "FCFA",
    exchangeRateToXof: 1.0,
    decimalDigits: 0,
    isActive: true
  }
};

/**
 * 7 pays pris en charge par PayDunya pour Miabé Asi :
 * TG (Togo), BJ (Bénin), BF (Burkina Faso), CI (Côte d'Ivoire),
 * ML (Mali), SN (Sénégal), CM (Cameroun).
 */
export const SUPPORTED_COUNTRIES: Country[] = [
  {
    code: "TG",
    name: "Togo",
    nativeName: "Togo",
    phoneCode: "+228",
    currencyCode: "XOF",
    flagEmoji: "🇹🇬",
    isActive: true,
    majorCities: ["Lomé", "Kpalimé", "Kara", "Sokodé", "Atakpamé", "Aného", "Dapaong"]
  },
  {
    code: "BJ",
    name: "Bénin",
    nativeName: "Bénin",
    phoneCode: "+229",
    currencyCode: "XOF",
    flagEmoji: "🇧🇯",
    isActive: true,
    majorCities: ["Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Ouidah"]
  },
  {
    code: "BF",
    name: "Burkina Faso",
    nativeName: "Burkina Faso",
    phoneCode: "+226",
    currencyCode: "XOF",
    flagEmoji: "🇧🇫",
    isActive: true,
    majorCities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya"]
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    nativeName: "Côte d'Ivoire",
    phoneCode: "+225",
    currencyCode: "XOF",
    flagEmoji: "🇨🇮",
    isActive: true,
    majorCities: ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "Korhogo"]
  },
  {
    code: "ML",
    name: "Mali",
    nativeName: "Mali",
    phoneCode: "+223",
    currencyCode: "XOF",
    flagEmoji: "🇲🇱",
    isActive: true,
    majorCities: ["Bamako", "Sikasso", "Mopti", "Ségou", "Kayes"]
  },
  {
    code: "SN",
    name: "Sénégal",
    nativeName: "Sénégal",
    phoneCode: "+221",
    currencyCode: "XOF",
    flagEmoji: "🇸🇳",
    isActive: true,
    majorCities: ["Dakar", "Thiès", "Saint-Louis", "Touba", "Ziguinchor"]
  },
  {
    code: "CM",
    name: "Cameroun",
    nativeName: "Cameroun",
    phoneCode: "+237",
    currencyCode: "XAF",
    flagEmoji: "🇨🇲",
    isActive: true,
    majorCities: ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda"]
  }
];

/**
 * Pays et devise par défaut de la plateforme
 */
export const DEFAULT_COUNTRY_CODE: SupportedCountryCode = "TG";
export const DEFAULT_CURRENCY_CODE: SupportedCurrencyCode = "XOF";

export const DEFAULT_COUNTRY: Country = SUPPORTED_COUNTRIES[0];
export const DEFAULT_CURRENCY: Currency = SUPPORTED_CURRENCIES[DEFAULT_CURRENCY_CODE];

/**
 * Helpers utilitaires
 */
export function getCountryByCode(code?: string): Country {
  if (!code) return DEFAULT_COUNTRY;
  const found = SUPPORTED_COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
  return found || DEFAULT_COUNTRY;
}

export function getCurrencyByCode(code?: string): Currency {
  if (!code) return DEFAULT_CURRENCY;
  const upper = code.toUpperCase() as SupportedCurrencyCode;
  return SUPPORTED_CURRENCIES[upper] || DEFAULT_CURRENCY;
}

export function getCurrencyForCountry(countryCode?: string): Currency {
  const country = getCountryByCode(countryCode);
  return getCurrencyByCode(country.currencyCode);
}

export function isSupportedCountry(code?: string): boolean {
  if (!code) return false;
  return SUPPORTED_COUNTRIES.some(c => c.code.toUpperCase() === code.toUpperCase());
}

/**
 * Formate un montant dans la devise correspondant au pays de l'utilisateur.
 * Sans taux de conversion (1:1 de référence).
 * Ex: formatPrice(15000, "XOF") -> "15 000 XOF"
 *     formatPrice(15000, "XAF") -> "15 000 XAF"
 *     formatPrice(15000, "CM")  -> "15 000 XAF"
 *     formatPrice(15000, "TG")  -> "15 000 XOF"
 */
export function formatPrice(
  amount: number | null | undefined,
  currencyOrCountryCode?: string
): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "";

  let resolvedCurrency = currencyOrCountryCode || DEFAULT_CURRENCY_CODE;
  const upper = resolvedCurrency.toUpperCase();
  if (upper === "TG" || upper === "BJ" || upper === "BF" || upper === "CI" || upper === "ML" || upper === "SN") {
    resolvedCurrency = "XOF";
  } else if (upper === "CM") {
    resolvedCurrency = "XAF";
  } else if (upper === "XOF" || upper === "XAF") {
    resolvedCurrency = upper;
  }

  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${resolvedCurrency}`;
}

/**
 * Récupère la liste des grandes villes pour un pays donné
 */
export function getCitiesForCountry(countryCode?: string): string[] {
  if (!countryCode) return [];
  const country = getCountryByCode(countryCode);
  return country?.majorCities || [];
}

/**
 * Récupère toutes les grandes villes des 7 pays pris en charge
 */
export function getAllSupportedCities(): string[] {
  const cities: string[] = [];
  SUPPORTED_COUNTRIES.forEach(c => {
    if (c.majorCities) {
      cities.push(...c.majorCities);
    }
  });
  return Array.from(new Set(cities));
}

/**
 * Détermine le pays d'un produit selon son countryCode ou countryOrigin, avec repli vers le Togo (TG)
 */
export function resolveProductCountry(prod?: { countryCode?: string; countryOrigin?: string }): Country {
  if (!prod) return DEFAULT_COUNTRY;
  if (prod.countryCode && isSupportedCountry(prod.countryCode)) {
    return getCountryByCode(prod.countryCode);
  }
  if (prod.countryOrigin) {
    if (isSupportedCountry(prod.countryOrigin)) {
      return getCountryByCode(prod.countryOrigin);
    }
    const byName = SUPPORTED_COUNTRIES.find(
      c => c.name.toLowerCase() === prod.countryOrigin?.toLowerCase() ||
           c.nativeName?.toLowerCase() === prod.countryOrigin?.toLowerCase()
    );
    if (byName) return byName;
  }
  return DEFAULT_COUNTRY;
}


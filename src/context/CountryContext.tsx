import React, { createContext, useContext, useState, useEffect } from "react";
import { Country, Currency, SupportedCountryCode, SupportedCurrencyCode } from "../types";
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_CURRENCIES,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  getCountryByCode,
  getCurrencyForCountry,
  isSupportedCountry,
  formatPrice as formatPriceUtil
} from "../data/westAfricanCountries";

export const LOCAL_STORAGE_COUNTRY_KEY = "asime_selected_country";

export interface CountryContextType {
  country: Country;
  countryCode: SupportedCountryCode;
  currencyCode: SupportedCurrencyCode;
  phoneCode: string;
  flag: string;
  currency: Currency;
  setCountryCode: (code: string) => void;
  countries: Country[];
  formatPrice: (amount: number | null | undefined, customCurrency?: string) => string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCode, setSelectedCode] = useState<SupportedCountryCode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COUNTRY_KEY);
      if (saved && isSupportedCountry(saved)) {
        return saved.toUpperCase() as SupportedCountryCode;
      }
    } catch (e) {
      console.error("Erreur lors de la lecture de asime_selected_country dans localStorage:", e);
    }
    return DEFAULT_COUNTRY_CODE;
  });

  const setCountryCode = (code: string) => {
    const upper = (code || "").toUpperCase();
    if (isSupportedCountry(upper)) {
      const validCode = upper as SupportedCountryCode;
      setSelectedCode(validCode);
      try {
        localStorage.setItem(LOCAL_STORAGE_COUNTRY_KEY, validCode);
      } catch (e) {
        console.error("Erreur lors de l'enregistrement de asime_selected_country dans localStorage:", e);
      }
    }
  };

  const currentCountry = getCountryByCode(selectedCode);
  const currentCurrency = getCurrencyForCountry(selectedCode);

  const formatPrice = (amount: number | null | undefined, customCurrency?: string) => {
    return formatPriceUtil(amount, customCurrency || currentCountry.currencyCode);
  };

  const value: CountryContextType = {
    country: currentCountry,
    countryCode: currentCountry.code as SupportedCountryCode,
    currencyCode: (currentCountry.currencyCode as SupportedCurrencyCode) || "XOF",
    phoneCode: currentCountry.phoneCode,
    flag: currentCountry.flagEmoji || "🇹🇬",
    currency: currentCurrency,
    setCountryCode,
    countries: SUPPORTED_COUNTRIES,
    formatPrice
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextType => {
  const context = useContext(CountryContext);
  if (!context) {
    const currentCountry = DEFAULT_COUNTRY;
    return {
      country: currentCountry,
      countryCode: DEFAULT_COUNTRY_CODE,
      currencyCode: DEFAULT_CURRENCY_CODE,
      phoneCode: currentCountry.phoneCode,
      flag: currentCountry.flagEmoji || "🇹🇬",
      currency: DEFAULT_CURRENCY,
      setCountryCode: () => {},
      countries: SUPPORTED_COUNTRIES,
      formatPrice: (amount: number | null | undefined, customCurrency?: string) => {
        return formatPriceUtil(amount, customCurrency || DEFAULT_CURRENCY_CODE);
      }
    };
  }
  return context;
};

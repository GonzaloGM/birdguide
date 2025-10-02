import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'es-AR' | 'en-US';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  changeLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>('es-AR');

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('i18nextLng') as Language;
    if (savedLanguage && (savedLanguage === 'es-AR' || savedLanguage === 'en-US')) {
      setLanguageState(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      // Default to es-AR
      setLanguageState('es-AR');
      i18n.changeLanguage('es-AR');
    }
  }, [i18n]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('i18nextLng', newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

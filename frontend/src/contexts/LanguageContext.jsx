import React, { createContext, useContext, useState, useEffect } from 'react';

import es from '../locales/es';
import en from '../locales/en';

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {

  // Español es el idioma principal de IntimaX.
  // Si el usuario ya seleccionó otro idioma anteriormente,
  // recuperamos esa preferencia.
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('intimax-language') || 'es';
  });

  // Seleccionamos el diccionario correspondiente.
  const translations = language === 'en' ? en : es;

  // Guardamos la elección cada vez que cambia el idioma.
  useEffect(() => {
    localStorage.setItem('intimax-language', language);

    // También actualizamos el idioma del documento HTML.
    document.documentElement.lang = language;
  }, [language]);

  // Cambiar directamente a un idioma.
  const changeLanguage = (newLanguage) => {
    if (newLanguage === 'es' || newLanguage === 'en') {
      setLanguage(newLanguage);
    }
  };

  // Alternar entre español e inglés.
  const toggleLanguage = () => {
    setLanguage((currentLanguage) =>
      currentLanguage === 'es' ? 'en' : 'es'
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        translations,
        changeLanguage,
        toggleLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
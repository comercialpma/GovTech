import { useEffect, useState } from 'react';

const STORAGE_KEY = 'govtech.logo';
const EVENT = 'govtech:logo-changed';

export function useLogo() {
  const [logo, setLogoState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handler = () => {
      try {
        setLogoState(localStorage.getItem(STORAGE_KEY));
      } catch {
        setLogoState(null);
      }
    };
    window.addEventListener(EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setLogo = (dataUrl) => {
    if (dataUrl) localStorage.setItem(STORAGE_KEY, dataUrl);
    else localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT));
  };

  return [logo, setLogo];
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard',
      turfs: 'Turfs',
      bookings: 'Bookings',
      staff: 'Staff',
      analytics: 'Analytics',
      settings: 'Settings',
      login: 'Login',
      logout: 'Logout',
      book_now: 'Book Now',
      available: 'Available',
      unavailable: 'Unavailable',
      total_revenue: 'Total Revenue',
      total_bookings: 'Total Bookings',
      active_turfs: 'Active Turfs'
    }
  },
  hi: {
    translation: {
      dashboard: 'डैशबोर्ड',
      turfs: 'टर्फ',
      bookings: 'बुकिंग',
      staff: 'स्टाफ',
      analytics: 'एनालिटिक्स',
      settings: 'सेटिंग्स',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      book_now: 'अभी बुक करें',
      available: 'उपलब्ध',
      unavailable: 'अनुपलब्ध',
      total_revenue: 'कुल आय',
      total_bookings: 'कुल बुकिंग',
      active_turfs: 'सक्रिय टर्फ'
    }
  },
  te: {
    translation: {
      dashboard: 'డాష్‌బోర్డ్',
      turfs: 'టర్ఫ్‌లు',
      bookings: 'బుకింగ్‌లు',
      staff: 'సిబ్బంది',
      analytics: 'అనలిటిక్స్',
      settings: 'సెట్టింగ్‌లు',
      login: 'లాగిన్',
      logout: 'లాగౌట్',
      book_now: 'ఇప్పుడే బుక్ చేయండి',
      available: 'అందుబాటులో',
      unavailable: 'అందుబాటులో లేదు',
      total_revenue: 'మొత్తం ఆదాయం',
      total_bookings: 'మొత్తం బుకింగ్‌లు',
      active_turfs: 'క్రియాశీల టర్ఫ్‌లు'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
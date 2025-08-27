// Simulated backend for Content & Settings module
import settingsData from "../mock/settings.json";

// Get all settings
export const getSettings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(settingsData), 300);
  });
};

// Save a single page content
export const savePage = async (page, content) => {
  settingsData.admin.pages[page] = content;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save templates (SMS, Email, PushNotifications)
export const saveTemplates = async (templates) => {
  settingsData.admin.templates = templates;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save payment credentials
export const savePayment = async (credentials) => {
  settingsData.admin.credentials = credentials;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save global settings
export const saveGlobal = async (globalSettings) => {
  settingsData.admin.global = globalSettings;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save announcements
export const saveAnnouncements = async (announcements) => {
  settingsData.admin.announcements = announcements;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save theme settings (logo, platformName, turf owner customization)
export const saveTheme = async (theme) => {
  settingsData.admin.theme = theme;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save SEO settings
export const saveSEO = async (seo) => {
  settingsData.admin.seo = seo;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save features toggles
export const saveFeatures = async (features) => {
  settingsData.admin.features = features;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

// Save role-based permissions
export const saveRolePermissions = async (role, permissions) => {
  if (settingsData.roles[role]) {
    settingsData.roles[role] = permissions;
  }
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
};

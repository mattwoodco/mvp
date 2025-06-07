// Extension configuration with environment variables
const CONFIG = {
  // Default target URL - can be overridden by environment variables
  TARGET_URL: "https://midjourney.com",

  // API endpoints for saving images (configurable via popup)
  API_BASE_URL: "https://api.yourservice.com", // Replace with your actual API

  // Extension settings
  AUTO_SAVE_ENABLED: true,
  CHECK_INTERVAL: 2000, // Check for new images every 2 seconds

  // Selectors for Midjourney interface (may need updates as UI changes)
  SELECTORS: {
    // Main image containers
    IMAGE_CONTAINER:
      '[data-testid="image-container"], .image-container, .generated-image',

    // Generated images
    GENERATED_IMAGE:
      'img[src*="cdn.midjourney.com"], img[src*="media.discordapp.net"]',

    // Login check selectors
    LOGIN_BUTTON: '[data-testid="login"], .login-button, a[href*="auth"]',
    USER_AVATAR: '[data-testid="user-avatar"], .user-avatar, .profile-image',

    // Image metadata
    PROMPT_TEXT: '[data-testid="prompt"], .prompt, .generation-prompt',
    IMAGE_ACTIONS: '[data-testid="image-actions"], .image-actions',
  },

  // Storage keys
  STORAGE_KEYS: {
    SAVED_IMAGES: "midjourney_saved_images",
    USER_SETTINGS: "midjourney_user_settings",
    API_KEY: "midjourney_api_key",
  },
};

// Function to load environment-specific configuration
async function loadEnvironmentConfig() {
  try {
    // Try to load from Chrome storage first
    const result = await chrome.storage.sync.get([
      "TARGET_URL",
      "API_BASE_URL",
      "API_KEY",
      "AUTO_SAVE_ENABLED",
    ]);

    // Override defaults with stored values
    if (result.TARGET_URL) CONFIG.TARGET_URL = result.TARGET_URL;
    if (result.API_BASE_URL) CONFIG.API_BASE_URL = result.API_BASE_URL;
    if (result.API_KEY) CONFIG.API_KEY = result.API_KEY;
    if (result.AUTO_SAVE_ENABLED !== undefined)
      CONFIG.AUTO_SAVE_ENABLED = result.AUTO_SAVE_ENABLED;
  } catch (error) {
    console.log("Using default configuration");
  }

  return CONFIG;
}

// Export for use in other scripts
if (typeof window !== "undefined") {
  window.MidjourneyScraperConfig = CONFIG;
  window.loadEnvironmentConfig = loadEnvironmentConfig;
}

// For node.js environments (if needed for testing)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG, loadEnvironmentConfig };
}

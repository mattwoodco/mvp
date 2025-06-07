// Midjourney Image Scraper Content Script
console.log("Midjourney Image Scraper: Content script loaded");

class MidjourneyImageScraper {
  constructor() {
    this.config = window.MidjourneyScraperConfig;
    this.savedImages = new Set();
    this.isLoggedIn = false;
    this.observer = null;
    this.checkInterval = null;

    this.init();
  }

  async init() {
    console.log("Initializing Midjourney Image Scraper...");

    // Load configuration
    await window.loadEnvironmentConfig();

    // Check if we're on the correct URL
    if (!this.isTargetURL()) {
      console.log("Not on target URL, extension inactive");
      return;
    }

    // Wait for page to load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.start());
    } else {
      this.start();
    }
  }

  isTargetURL() {
    const currentURL = window.location.href;
    return currentURL.includes("midjourney.com");
  }

  async start() {
    // Check login status
    await this.checkLoginStatus();

    if (!this.isLoggedIn) {
      this.showLoginWarning();
      return;
    }

    // Load previously saved images
    await this.loadSavedImages();

    // Start monitoring for new images
    this.startImageMonitoring();

    console.log("Midjourney Image Scraper: Started monitoring");
  }

  async checkLoginStatus() {
    // Check for login indicators
    const loginButton = document.querySelector(
      this.config.SELECTORS.LOGIN_BUTTON,
    );
    const userAvatar = document.querySelector(
      this.config.SELECTORS.USER_AVATAR,
    );

    // Also check for user-specific content
    const userIndicators = document.querySelectorAll(
      '[data-testid*="user"], .user-profile, .account-menu',
    );

    this.isLoggedIn = !loginButton && (userAvatar || userIndicators.length > 0);

    console.log(
      "Login status:",
      this.isLoggedIn ? "Logged in" : "Not logged in",
    );

    // Store login status
    await chrome.storage.local.set({ isLoggedIn: this.isLoggedIn });
  }

  showLoginWarning() {
    // Create and show login warning overlay
    const overlay = document.createElement("div");
    overlay.id = "midjourney-scraper-login-warning";
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;

    overlay.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Login Required</div>
      <div>Please log in to Midjourney to use the image scraper extension.</div>
      <button id="dismiss-warning" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        margin-top: 10px;
        cursor: pointer;
      ">Dismiss</button>
    `;

    document.body.appendChild(overlay);

    // Auto-remove after 10 seconds or on click
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
    }, 10000);

    document
      .getElementById("dismiss-warning")
      ?.addEventListener("click", () => {
        overlay.remove();
      });
  }

  async loadSavedImages() {
    try {
      const result = await chrome.storage.local.get([
        this.config.STORAGE_KEYS.SAVED_IMAGES,
      ]);
      const savedImageUrls =
        result[this.config.STORAGE_KEYS.SAVED_IMAGES] || [];
      this.savedImages = new Set(savedImageUrls);
      console.log(`Loaded ${this.savedImages.size} previously saved images`);
    } catch (error) {
      console.error("Error loading saved images:", error);
    }
  }

  startImageMonitoring() {
    // Use MutationObserver to watch for new images
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              // Element node
              this.checkForNewImages(node);
            }
          }
        }
      }
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check existing images
    this.checkForNewImages(document.body);

    // Set up periodic check as backup
    this.checkInterval = setInterval(() => {
      this.checkForNewImages(document.body);
    }, this.config.CHECK_INTERVAL);
  }

  checkForNewImages(container) {
    if (!this.config.AUTO_SAVE_ENABLED) return;

    const images = container.querySelectorAll(
      this.config.SELECTORS.GENERATED_IMAGE,
    );

    for (const img of images) {
      if (img.src && !this.savedImages.has(img.src)) {
        this.processNewImage(img);
      }
    }
  }

  async processNewImage(imgElement) {
    try {
      const imageData = this.extractImageData(imgElement);

      if (imageData && imageData.url) {
        console.log("New image detected:", imageData.url);

        // Save locally first
        this.savedImages.add(imageData.url);
        await this.saveToStorage(imageData);

        // Send to backend API
        await this.saveToAPI(imageData);

        // Show success notification
        this.showNotification("Image saved successfully!", "success");
      }
    } catch (error) {
      console.error("Error processing new image:", error);
      this.showNotification("Error saving image", "error");
    }
  }

  extractImageData(imgElement) {
    const container =
      imgElement.closest(this.config.SELECTORS.IMAGE_CONTAINER) ||
      imgElement.parentElement;

    // Extract prompt text
    const promptElement = container.querySelector(
      this.config.SELECTORS.PROMPT_TEXT,
    );
    const prompt = promptElement ? promptElement.textContent.trim() : "";

    // Extract image metadata
    const imageData = {
      url: imgElement.src,
      prompt: prompt,
      timestamp: new Date().toISOString(),
      alt: imgElement.alt || "",
      width: imgElement.naturalWidth || imgElement.width,
      height: imgElement.naturalHeight || imgElement.height,
      pageUrl: window.location.href,
    };

    return imageData;
  }

  async saveToStorage(imageData) {
    try {
      const result = await chrome.storage.local.get([
        this.config.STORAGE_KEYS.SAVED_IMAGES,
      ]);
      const savedImages = result[this.config.STORAGE_KEYS.SAVED_IMAGES] || [];

      savedImages.push(imageData);

      await chrome.storage.local.set({
        [this.config.STORAGE_KEYS.SAVED_IMAGES]: savedImages,
      });

      console.log("Image saved to local storage");
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  }

  async saveToAPI(imageData) {
    try {
      const result = await chrome.storage.sync.get(["API_KEY", "API_BASE_URL"]);

      if (!result.API_KEY || !result.API_BASE_URL) {
        console.log("API not configured, skipping upload");
        return;
      }

      const response = await fetch(`${result.API_BASE_URL}/api/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${result.API_KEY}`,
        },
        body: JSON.stringify(imageData),
      });

      if (response.ok) {
        console.log("Image saved to API successfully");
      } else {
        throw new Error(`API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving to API:", error);
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Initialize the scraper
let scraper;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    scraper = new MidjourneyImageScraper();
  });
} else {
  scraper = new MidjourneyImageScraper();
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleAutoSave") {
    if (scraper) {
      scraper.config.AUTO_SAVE_ENABLED = request.enabled;
      sendResponse({ success: true });
    }
  } else if (request.action === "getStats") {
    sendResponse({
      savedImages: scraper ? scraper.savedImages.size : 0,
      isLoggedIn: scraper ? scraper.isLoggedIn : false,
    });
  }
});

// Clean up on page unload
window.addEventListener("beforeunload", () => {
  if (scraper) {
    scraper.destroy();
  }
});

// Background service worker for Midjourney Image Scraper
console.log("Midjourney Image Scraper: Background script loaded");

// Extension installation and startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details.reason);

  if (details.reason === "install") {
    // Set default configuration on first install
    chrome.storage.sync.set({
      TARGET_URL: "https://midjourney.com",
      AUTO_SAVE_ENABLED: true,
      API_BASE_URL: "",
      API_KEY: "",
    });

    // Open welcome/setup page
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
    });
  }
});

// Handle extension icon click (open popup)
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked on tab:", tab.url);
});

// Listen for tab updates to check if we're on Midjourney
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    checkMidjourneyTab(tab);
  }
});

// Check if the current tab is Midjourney and update extension state
async function checkMidjourneyTab(tab) {
  const isMidjourneyTab = tab.url.includes("midjourney.com");

  if (isMidjourneyTab) {
    // Update badge to show extension is active
    chrome.action.setBadgeText({
      text: "●",
      tabId: tab.id,
    });

    chrome.action.setBadgeBackgroundColor({
      color: "#4CAF50",
      tabId: tab.id,
    });

    console.log("Midjourney tab detected:", tab.url);
  } else {
    // Clear badge for non-Midjourney tabs
    chrome.action.setBadgeText({
      text: "",
      tabId: tab.id,
    });
  }
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

  switch (request.action) {
    case "saveImage":
      handleImageSave(request.imageData, sender.tab);
      sendResponse({ success: true });
      break;

    case "getExtensionInfo":
      getExtensionInfo().then(sendResponse);
      return true; // Will respond asynchronously

    case "updateSettings":
      updateSettings(request.settings).then(sendResponse);
      return true; // Will respond asynchronously

    case "checkLoginStatus":
      // Forward to content script
      chrome.tabs.sendMessage(sender.tab.id, { action: "checkLogin" });
      break;

    default:
      console.log("Unknown action:", request.action);
  }
});

// Handle image saving
async function handleImageSave(imageData, tab) {
  try {
    console.log("Saving image from background:", imageData.url);

    // Update badge to show activity
    chrome.action.setBadgeText({
      text: "↓",
      tabId: tab.id,
    });

    chrome.action.setBadgeBackgroundColor({
      color: "#2196F3",
      tabId: tab.id,
    });

    // Reset badge after 2 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({
        text: "●",
        tabId: tab.id,
      });

      chrome.action.setBadgeBackgroundColor({
        color: "#4CAF50",
        tabId: tab.id,
      });
    }, 2000);

    // Store in local storage
    const result = await chrome.storage.local.get(["midjourney_saved_images"]);
    const savedImages = result.midjourney_saved_images || [];

    savedImages.push({
      ...imageData,
      savedAt: new Date().toISOString(),
      tabUrl: tab.url,
    });

    await chrome.storage.local.set({
      midjourney_saved_images: savedImages,
    });

    console.log("Image saved successfully");
  } catch (error) {
    console.error("Error saving image:", error);
  }
}

// Get extension information and stats
async function getExtensionInfo() {
  try {
    const [localStorage, syncStorage] = await Promise.all([
      chrome.storage.local.get(["midjourney_saved_images", "isLoggedIn"]),
      chrome.storage.sync.get([
        "TARGET_URL",
        "AUTO_SAVE_ENABLED",
        "API_BASE_URL",
        "API_KEY",
      ]),
    ]);

    const savedImages = localStorage.midjourney_saved_images || [];

    return {
      savedImagesCount: savedImages.length,
      isLoggedIn: localStorage.isLoggedIn || false,
      settings: {
        targetUrl: syncStorage.TARGET_URL || "https://midjourney.com",
        autoSaveEnabled: syncStorage.AUTO_SAVE_ENABLED !== false,
        apiConfigured: !!(syncStorage.API_BASE_URL && syncStorage.API_KEY),
      },
      recentImages: savedImages.slice(-5), // Last 5 images
    };
  } catch (error) {
    console.error("Error getting extension info:", error);
    return {
      savedImagesCount: 0,
      isLoggedIn: false,
      settings: {
        targetUrl: "https://midjourney.com",
        autoSaveEnabled: true,
        apiConfigured: false,
      },
      recentImages: [],
    };
  }
}

// Update extension settings
async function updateSettings(settings) {
  try {
    await chrome.storage.sync.set(settings);

    // Notify all Midjourney tabs about settings change
    const tabs = await chrome.tabs.query({
      url: ["https://midjourney.com/*", "https://www.midjourney.com/*"],
    });

    for (const tab of tabs) {
      chrome.tabs
        .sendMessage(tab.id, {
          action: "settingsUpdated",
          settings: settings,
        })
        .catch(() => {
          // Ignore errors if content script not loaded
        });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: error.message };
  }
}

// Periodic cleanup of old saved images (keep last 1000)
chrome.alarms.create("cleanup", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanup") {
    cleanupOldImages();
  }
});

async function cleanupOldImages() {
  try {
    const result = await chrome.storage.local.get(["midjourney_saved_images"]);
    const savedImages = result.midjourney_saved_images || [];

    if (savedImages.length > 1000) {
      // Keep only the most recent 1000 images
      const recentImages = savedImages.slice(-1000);
      await chrome.storage.local.set({
        midjourney_saved_images: recentImages,
      });

      console.log(
        `Cleaned up ${savedImages.length - recentImages.length} old images`,
      );
    }
  } catch (error) {
    console.error("Error cleaning up images:", error);
  }
}

// Handle extension uninstall/disable
chrome.runtime.onSuspend.addListener(() => {
  console.log("Extension suspended");
});

// Error handling
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
});

// Popup script for Midjourney Image Scraper
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Popup loaded");

  // Initialize the popup
  await initializePopup();

  // Set up event listeners
  setupEventListeners();
});

let extensionData = null;

async function initializePopup() {
  try {
    // Get extension data from background script
    extensionData = await sendMessageToBackground({
      action: "getExtensionInfo",
    });

    // Update UI with current data
    updateUI(extensionData);

    // Load saved settings
    await loadSettings();

    // Hide loading and show main content
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-content").style.display = "block";
  } catch (error) {
    console.error("Error initializing popup:", error);
    showMessage("Error loading extension data", "error");
  }
}

function updateUI(data) {
  // Update login status
  const loginIndicator = document.getElementById("login-indicator");
  const loginStatus = document.getElementById("login-status");

  if (data.isLoggedIn) {
    loginIndicator.className = "status-indicator online";
    loginStatus.textContent = "Logged in";
  } else {
    loginIndicator.className = "status-indicator offline";
    loginStatus.textContent = "Not logged in";
  }

  // Update images count
  document.getElementById("images-count").textContent =
    data.savedImagesCount || 0;

  // Update API status
  const apiStatus = document.getElementById("api-status");
  if (data.settings.apiConfigured) {
    apiStatus.textContent = "Configured";
  } else {
    apiStatus.textContent = "Not configured";
  }

  // Update auto-save toggle
  document.getElementById("auto-save-toggle").checked =
    data.settings.autoSaveEnabled;

  // Update recent images
  updateRecentImages(data.recentImages || []);
}

function updateRecentImages(images) {
  const container = document.getElementById("thumbnails-container");
  container.innerHTML = "";

  if (images.length === 0) {
    container.innerHTML =
      '<p style="color: #6c757d; font-size: 14px;">No recent images</p>';
    return;
  }

  for (const image of images) {
    const img = document.createElement("img");
    img.className = "image-thumbnail";
    img.src = image.url;
    img.alt = image.prompt || "Generated image";
    img.title = `${image.prompt || "Generated image"}\nSaved: ${new Date(image.timestamp).toLocaleString()}`;

    // Add click handler to open image in new tab
    img.addEventListener("click", () => {
      chrome.tabs.create({ url: image.url });
    });

    container.appendChild(img);
  }
}

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(["API_BASE_URL", "API_KEY"]);

    if (result.API_BASE_URL) {
      document.getElementById("api-url").value = result.API_BASE_URL;
    }

    if (result.API_KEY) {
      document.getElementById("api-key").value = result.API_KEY;
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

function setupEventListeners() {
  // Auto-save toggle
  document
    .getElementById("auto-save-toggle")
    .addEventListener("change", async (e) => {
      try {
        const enabled = e.target.checked;

        await sendMessageToBackground({
          action: "updateSettings",
          settings: { AUTO_SAVE_ENABLED: enabled },
        });

        // Also send to content script if on Midjourney
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const currentTab = tabs[0];

        if (currentTab?.url?.includes("midjourney.com")) {
          chrome.tabs
            .sendMessage(currentTab.id, {
              action: "toggleAutoSave",
              enabled: enabled,
            })
            .catch(() => {
              // Ignore errors if content script not loaded
            });
        }

        showMessage(`Auto-save ${enabled ? "enabled" : "disabled"}`, "success");
      } catch (error) {
        console.error("Error toggling auto-save:", error);
        showMessage("Error updating auto-save setting", "error");
      }
    });

  // Open Midjourney button
  document.getElementById("open-midjourney").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://midjourney.com" });
    window.close();
  });

  // Save settings button
  document
    .getElementById("save-settings")
    .addEventListener("click", async () => {
      try {
        const apiUrl = document.getElementById("api-url").value.trim();
        const apiKey = document.getElementById("api-key").value.trim();

        // Validate URL if provided
        if (apiUrl && !isValidUrl(apiUrl)) {
          showMessage("Please enter a valid URL", "error");
          return;
        }

        const settings = {};
        if (apiUrl) settings.API_BASE_URL = apiUrl;
        if (apiKey) settings.API_KEY = apiKey;

        await sendMessageToBackground({
          action: "updateSettings",
          settings: settings,
        });

        showMessage("Settings saved successfully!", "success");

        // Refresh extension data
        setTimeout(async () => {
          extensionData = await sendMessageToBackground({
            action: "getExtensionInfo",
          });
          updateUI(extensionData);
        }, 1000);
      } catch (error) {
        console.error("Error saving settings:", error);
        showMessage("Error saving settings", "error");
      }
    });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.close();
    }
  });
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function showMessage(text, type = "info") {
  const container = document.getElementById("message-container");

  // Remove existing message
  container.innerHTML = "";

  const message = document.createElement("div");
  message.className = type;
  message.textContent = text;

  container.appendChild(message);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (message.parentNode) {
      message.remove();
    }
  }, 3000);
}

function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// Refresh data periodically while popup is open
setInterval(async () => {
  try {
    const newData = await sendMessageToBackground({
      action: "getExtensionInfo",
    });

    // Only update if data has changed
    if (JSON.stringify(newData) !== JSON.stringify(extensionData)) {
      extensionData = newData;
      updateUI(extensionData);
    }
  } catch (error) {
    console.error("Error refreshing data:", error);
  }
}, 5000);

// Handle popup visibility
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Refresh data when popup becomes visible
    setTimeout(async () => {
      try {
        extensionData = await sendMessageToBackground({
          action: "getExtensionInfo",
        });
        updateUI(extensionData);
      } catch (error) {
        console.error("Error refreshing on visibility change:", error);
      }
    }, 100);
  }
});

// Content script that runs on Midjourney pages
console.log('Midjourney Scraper Extension loaded');

// Configuration
let config = {
  enabled: true,
  autoSave: true
};

// Load configuration from storage
chrome.storage.sync.get(['enabled', 'autoSave'], (result) => {
  if (result.enabled !== undefined) config.enabled = result.enabled;
  if (result.autoSave !== undefined) config.autoSave = result.autoSave;
  
  if (config.enabled) {
    initializeExtension();
  }
});

// Check if user is logged in
function checkLoginStatus() {
  // Look for common login indicators on Midjourney
  const userAvatar = document.querySelector('[class*="avatar"], [class*="user"], [class*="profile"]');
  const loginButton = document.querySelector('[href*="login"], [href*="signin"], button:has-text("Sign In")');
  
  if (!userAvatar && loginButton) {
    // User is not logged in
    console.log('User not logged in, redirecting to login...');
    chrome.runtime.sendMessage({
      action: 'userNotLoggedIn',
      url: window.location.href
    });
    return false;
  }
  return true;
}

// Initialize the extension
function initializeExtension() {
  console.log('Initializing Midjourney Scraper...');
  
  // Check login status
  if (!checkLoginStatus()) {
    return;
  }
  
  // Set up mutation observer to detect new images
  setupImageObserver();
  
  // Scan existing images
  scanForImages();
}

// Set up mutation observer to detect when new images are added to the page
function setupImageObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Check if the added node contains images
          const images = node.querySelectorAll('img[src*="cdn.midjourney.com"], img[src*="media.discordapp.net"]');
          images.forEach(processImage);
          
          // Also check if the node itself is an image
          if (node.tagName === 'IMG' && (node.src.includes('cdn.midjourney.com') || node.src.includes('media.discordapp.net'))) {
            processImage(node);
          }
        }
      });
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Scan for existing images on the page
function scanForImages() {
  const images = document.querySelectorAll('img[src*="cdn.midjourney.com"], img[src*="media.discordapp.net"]');
  console.log(`Found ${images.length} existing images`);
  images.forEach(processImage);
}

// Process individual image
function processImage(img) {
  // Skip if already processed
  if (img.dataset.midjourneyScraperProcessed) {
    return;
  }
  
  // Mark as processed
  img.dataset.midjourneyScraperProcessed = 'true';
  
  // Extract image data
  const imageData = {
    url: img.src,
    alt: img.alt || '',
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    // Try to find associated prompt text
    prompt: findAssociatedPrompt(img)
  };
  
  console.log('New image detected:', imageData.url);
  
  // Send to background script for saving
  if (config.autoSave) {
    chrome.runtime.sendMessage({
      action: 'saveImage',
      imageData: imageData
    });
  }
}

// Try to find the prompt associated with an image
function findAssociatedPrompt(img) {
  // Look for prompt text in parent elements
  let parent = img.parentElement;
  let maxDepth = 5;
  
  while (parent && maxDepth > 0) {
    // Look for text that might be a prompt
    const textElements = parent.querySelectorAll('[class*="prompt"], [class*="description"], [class*="text"]');
    for (let elem of textElements) {
      const text = elem.textContent.trim();
      if (text && text.length > 10 && text.length < 1000) {
        return text;
      }
    }
    parent = parent.parentElement;
    maxDepth--;
  }
  
  return '';
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleExtension') {
    config.enabled = request.enabled;
    if (config.enabled) {
      initializeExtension();
    }
  } else if (request.action === 'rescan') {
    scanForImages();
  }
  sendResponse({success: true});
});

// Re-check login status periodically
setInterval(() => {
  if (config.enabled) {
    checkLoginStatus();
  }
}, 30000); // Check every 30 seconds
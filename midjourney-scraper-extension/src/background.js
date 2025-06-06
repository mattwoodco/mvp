// Background service worker for Midjourney Scraper Extension

// Store for saved images
let savedImages = [];

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Midjourney Scraper Extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    autoSave: true,
    savedCount: 0
  });
  
  // Load saved images from storage
  chrome.storage.local.get(['savedImages'], (result) => {
    if (result.savedImages) {
      savedImages = result.savedImages;
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  switch (request.action) {
    case 'saveImage':
      handleSaveImage(request.imageData, sender.tab);
      break;
      
    case 'userNotLoggedIn':
      handleUserNotLoggedIn(sender.tab);
      break;
      
    case 'getSavedImages':
      sendResponse({images: savedImages});
      break;
      
    case 'clearSavedImages':
      savedImages = [];
      chrome.storage.local.set({savedImages: []});
      updateBadge(0);
      sendResponse({success: true});
      break;
  }
  
  return true; // Keep message channel open for async response
});

// Handle saving an image
async function handleSaveImage(imageData, tab) {
  try {
    // Check if image already saved
    const existingImage = savedImages.find(img => img.url === imageData.url);
    if (existingImage) {
      console.log('Image already saved:', imageData.url);
      return;
    }
    
    // Add tab information
    imageData.tabId = tab.id;
    imageData.tabTitle = tab.title;
    
    // Download the image
    const response = await fetch(imageData.url);
    const blob = await response.blob();
    
    // Create a local object URL for the blob
    const localUrl = URL.createObjectURL(blob);
    imageData.localUrl = localUrl;
    
    // Add to saved images
    savedImages.push(imageData);
    
    // Save to storage
    await chrome.storage.local.set({savedImages: savedImages});
    
    // Update badge
    updateBadge(savedImages.length);
    
    // Notify content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'imageSaved',
      imageUrl: imageData.url
    });
    
    console.log('Image saved successfully:', imageData.url);
    
  } catch (error) {
    console.error('Error saving image:', error);
  }
}

// Handle user not logged in
function handleUserNotLoggedIn(tab) {
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/icons/icon48.png',
    title: 'Midjourney Login Required',
    message: 'Please log in to Midjourney to use the image scraper.',
    priority: 2
  });
  
  // Optional: Open login page in new tab
  // chrome.tabs.create({url: 'https://midjourney.com/login'});
}

// Update extension badge with saved image count
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({text: count.toString()});
    chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
  } else {
    chrome.action.setBadgeText({text: ''});
  }
}

// Export saved images as JSON
async function exportImages() {
  const dataStr = JSON.stringify(savedImages, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  
  chrome.downloads.download({
    url: url,
    filename: `midjourney-images-${new Date().toISOString().split('T')[0]}.json`,
    saveAs: true
  });
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Toggle extension on/off for current tab
  chrome.storage.sync.get(['enabled'], (result) => {
    const newEnabled = !result.enabled;
    chrome.storage.sync.set({enabled: newEnabled});
    
    // Notify content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'toggleExtension',
      enabled: newEnabled
    });
  });
});

// Clean up old object URLs periodically
setInterval(() => {
  // Keep only the last 100 images to prevent memory issues
  if (savedImages.length > 100) {
    const removed = savedImages.splice(0, savedImages.length - 100);
    removed.forEach(img => {
      if (img.localUrl) {
        URL.revokeObjectURL(img.localUrl);
      }
    });
    chrome.storage.local.set({savedImages: savedImages});
  }
}, 60000); // Every minute
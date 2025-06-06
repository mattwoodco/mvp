// Popup script for Midjourney Scraper Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const enableToggle = document.getElementById('enableToggle');
  const autoSaveToggle = document.getElementById('autoSaveToggle');
  const imageCount = document.getElementById('imageCount');
  const viewImagesBtn = document.getElementById('viewImages');
  const exportImagesBtn = document.getElementById('exportImages');
  const clearImagesBtn = document.getElementById('clearImages');
  const imagePreview = document.getElementById('imagePreview');
  const imageGrid = document.getElementById('imageGrid');
  const statusElement = document.getElementById('status');
  
  // Load current settings
  const settings = await chrome.storage.sync.get(['enabled', 'autoSave']);
  enableToggle.checked = settings.enabled !== false;
  autoSaveToggle.checked = settings.autoSave !== false;
  updateStatus(settings.enabled !== false);
  
  // Load saved images count
  chrome.runtime.sendMessage({action: 'getSavedImages'}, (response) => {
    if (response && response.images) {
      imageCount.textContent = response.images.length;
      updateImagePreview(response.images.slice(-6)); // Show last 6 images
    }
  });
  
  // Toggle handlers
  enableToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.sync.set({enabled});
    updateStatus(enabled);
    
    // Notify all tabs
    const tabs = await chrome.tabs.query({url: 'https://midjourney.com/*'});
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleExtension',
        enabled
      });
    });
  });
  
  autoSaveToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({autoSave: e.target.checked});
  });
  
  // Button handlers
  viewImagesBtn.addEventListener('click', () => {
    imagePreview.style.display = imagePreview.style.display === 'none' ? 'block' : 'none';
  });
  
  exportImagesBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({action: 'getSavedImages'}, (response) => {
      if (response && response.images) {
        downloadImagesAsJson(response.images);
      }
    });
  });
  
  clearImagesBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all saved images?')) {
      chrome.runtime.sendMessage({action: 'clearSavedImages'}, () => {
        imageCount.textContent = '0';
        imageGrid.innerHTML = '';
        imagePreview.style.display = 'none';
      });
    }
  });
  
  // Update status indicator
  function updateStatus(enabled) {
    const indicator = statusElement.querySelector('.status-indicator');
    const text = statusElement.querySelector('.status-text');
    
    if (enabled) {
      indicator.style.backgroundColor = '#4CAF50';
      text.textContent = 'Active';
      statusElement.classList.remove('inactive');
    } else {
      indicator.style.backgroundColor = '#f44336';
      text.textContent = 'Inactive';
      statusElement.classList.add('inactive');
    }
  }
  
  // Update image preview grid
  function updateImagePreview(images) {
    imageGrid.innerHTML = '';
    
    images.forEach(img => {
      const div = document.createElement('div');
      div.className = 'image-item';
      div.innerHTML = `
        <img src="${img.url}" alt="${img.alt || 'Midjourney image'}" />
        <div class="image-info">
          <p class="image-prompt">${img.prompt ? img.prompt.substring(0, 50) + '...' : 'No prompt'}</p>
          <p class="image-date">${new Date(img.timestamp).toLocaleDateString()}</p>
        </div>
      `;
      imageGrid.appendChild(div);
    });
  }
  
  // Download images as JSON
  function downloadImagesAsJson(images) {
    const dataStr = JSON.stringify(images, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `midjourney-images-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});
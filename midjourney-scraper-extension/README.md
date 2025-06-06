# Midjourney Image Scraper Extension

A Chrome browser extension that automatically detects and saves images generated on Midjourney.com to your local storage.

## Features

- 🎨 **Automatic Image Detection**: Detects when new images are generated on Midjourney
- 💾 **Local Storage**: Saves images with metadata (prompts, timestamps) locally
- 🔐 **Login Detection**: Checks if user is logged in and prompts if not
- 📊 **Image Management**: View, export, and manage saved images
- 🎯 **Smart Scraping**: Attempts to capture associated prompts with images
- ⚡ **Real-time Updates**: Uses MutationObserver for instant detection
- 🎛️ **Toggle Controls**: Enable/disable extension and auto-save features

## Prerequisites

- Google Chrome browser (version 88 or higher)
- A Midjourney account (you must be logged in)
- Basic knowledge of Chrome developer mode

## Installation (Developer Mode)

### Step 1: Download the Extension

1. Download or clone this repository to your computer
2. Make sure you have all the files in the `midjourney-scraper-extension` folder

### Step 2: Prepare Icon Files

Since the extension includes placeholder icons, you'll need to generate proper PNG icons:

1. **Option A**: Use an online SVG to PNG converter:
   - Open `icons/icon.svg` in a text editor
   - Copy the SVG code
   - Go to a converter like [CloudConvert](https://cloudconvert.com/svg-to-png)
   - Create 16x16, 48x48, and 128x128 PNG versions
   - Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the icons folder

2. **Option B**: Use ImageMagick (if installed):
   ```bash
   cd midjourney-scraper-extension/icons
   convert icon.svg -resize 16x16 icon16.png
   convert icon.svg -resize 48x48 icon48.png
   convert icon.svg -resize 128x128 icon128.png
   ```

### Step 3: Load the Extension in Chrome

1. **Open Chrome Extensions Page**:
   - Click the three dots menu (⋮) in the top-right corner
   - Go to **More tools** → **Extensions**
   - OR type `chrome://extensions/` in the address bar

2. **Enable Developer Mode**:
   - Look for the "Developer mode" toggle in the top-right corner
   - Click to turn it ON (it should be blue)

3. **Load the Extension**:
   - Click the "Load unpacked" button that appears
   - Navigate to your `midjourney-scraper-extension` folder
   - Select the folder and click "Select Folder" (Windows) or "Open" (Mac)

4. **Verify Installation**:
   - You should see "Midjourney Image Scraper" in your extensions list
   - The extension icon should appear in your toolbar
   - If you see any errors, check the error message and troubleshooting section below

### Step 4: Pin the Extension (Optional but Recommended)

1. Click the puzzle piece icon (🧩) in the Chrome toolbar
2. Find "Midjourney Image Scraper"
3. Click the pin icon (📌) to keep it visible in your toolbar

## Usage

### Getting Started

1. **Navigate to Midjourney**:
   - Go to [https://midjourney.com](https://midjourney.com)
   - Make sure you're logged in (the extension will notify you if not)

2. **Check Extension Status**:
   - Click the extension icon in your toolbar
   - You should see "Active" status if everything is working

3. **Generate Images**:
   - Use Midjourney as normal
   - The extension will automatically detect and save new images

### Extension Controls

- **Enable Scraper**: Toggle the extension on/off
- **Auto-save Images**: Toggle automatic saving (when off, images are detected but not saved)
- **View Saved Images**: Preview your recently saved images
- **Export as JSON**: Download all saved images data as a JSON file
- **Clear All**: Remove all saved images from local storage

### Understanding the Save Data

Images are saved with the following information:
- **URL**: Direct link to the image
- **Prompt**: Associated prompt text (if detected)
- **Timestamp**: When the image was saved
- **Page URL**: The Midjourney page where it was found

## Configuration

The extension can be configured using environment variables. Copy `.env.example` to `.env` and modify as needed:

```env
EXTENSION_ENABLED=true
AUTO_SAVE_ENABLED=true
MIDJOURNEY_URL=https://midjourney.com/
MAX_STORED_IMAGES=100
EXPORT_FORMAT=json
```

**Note**: Environment variables require rebuilding the extension after changes.

## Troubleshooting

### Common Issues

1. **"Manifest file is missing or unreadable"**
   - Make sure you selected the `midjourney-scraper-extension` folder, not a parent folder
   - Check that `manifest.json` exists in the folder

2. **Extension doesn't detect images**
   - Ensure you're on https://midjourney.com
   - Check if you're logged in to Midjourney
   - Open Chrome DevTools (F12) and check the Console for errors
   - Try refreshing the page

3. **"User not logged in" notification**
   - Log in to your Midjourney account
   - Refresh the page after logging in

4. **Images not saving**
   - Check if "Auto-save Images" is enabled in the popup
   - Look for the image count badge on the extension icon
   - Check Chrome DevTools console for errors

5. **Missing icons error**
   - Follow Step 2 to create proper PNG icons
   - Reload the extension after adding icons

### Debugging

1. **View Console Logs**:
   - Right-click on the Midjourney page
   - Select "Inspect" 
   - Go to "Console" tab
   - Look for messages starting with "Midjourney Scraper"

2. **Check Background Script**:
   - Go to `chrome://extensions/`
   - Find the extension and click "background page" or "service worker"
   - Check the console for errors

3. **Storage Issues**:
   - The extension stores up to 100 images by default
   - Older images are automatically removed
   - You can export images before they're removed

## Privacy & Security

- All images are saved locally in your browser
- No data is sent to external servers
- The extension only works on midjourney.com
- Login status is checked locally

## Development

### File Structure

```
midjourney-scraper-extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── content.js        # Runs on Midjourney pages
│   ├── background.js     # Background service worker
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Popup functionality
│   └── popup.css         # Popup styles
├── icons/
│   ├── icon.svg          # Source icon
│   ├── icon16.png        # Toolbar icon
│   ├── icon48.png        # Medium icon
│   └── icon128.png       # Large icon
├── .env.example          # Configuration template
└── README.md            # This file
```

### Modifying the Extension

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon (🔄) on the extension card
4. Test your changes

### Key Technologies

- Chrome Extension Manifest V3
- MutationObserver API for DOM monitoring
- Chrome Storage API for data persistence
- Chrome Runtime API for messaging

## Limitations

- Only works on midjourney.com
- Requires Chrome browser
- Limited to 100 images in local storage (configurable)
- Prompt detection may not work for all image layouts
- PNG icon files need to be generated from the SVG

## Support

If you encounter issues not covered in the troubleshooting section:

1. Check the browser console for error messages
2. Ensure you have the latest version of Chrome
3. Try disabling other extensions that might conflict
4. Clear the extension's storage and try again

## License

This extension is provided as-is for educational and personal use. Please respect Midjourney's terms of service when using this extension.

---

**Note**: This extension is not affiliated with or endorsed by Midjourney. Use responsibly and in accordance with Midjourney's terms of service.
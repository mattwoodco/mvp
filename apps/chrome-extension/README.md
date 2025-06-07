# 🎨 Midjourney Image Scraper Chrome Extension

A powerful Chrome extension that automatically detects and saves generated images from Midjourney to your account. The extension monitors the page for new images and can save them both locally and to a configured API endpoint.

## ✨ Features

- 🔍 **Auto-detection**: Automatically detects new images generated on Midjourney
- 💾 **Local Storage**: Saves images and metadata to browser storage
- 🌐 **API Integration**: Optional integration with your own API for cloud storage
- 🔐 **Login Detection**: Checks if user is logged in and redirects if needed
- ⚙️ **Configurable**: Environment-based configuration through popup interface
- 📊 **Statistics**: Tracks saved images and provides usage statistics
- 🎨 **Modern UI**: Clean, modern popup interface with status indicators

## 🚀 Quick Start Guide for Beginners

### Prerequisites

- Google Chrome browser (version 88 or later)
- Basic computer skills (no coding required!)

### Step 1: Download the Extension

1. **Download this repository** as a ZIP file or clone it:
   ```bash
   git clone <repository-url>
   cd apps/chrome-extension
   ```

2. **Alternative**: If you received this as a folder, ensure you have all these files:
   - `manifest.json`
   - `background.js`
   - `content.js`
   - `config.js`
   - `popup.html`
   - `popup.js`
   - `icons/` folder with icon files

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**:
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar and press Enter
   - Or go to: Chrome Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**:
   - Look for "Developer mode" toggle in the top-right corner
   - Click the toggle to turn it ON (it should turn blue)

3. **Load the Extension**:
   - Click the "Load unpacked" button that appears
   - Navigate to and select the `chrome-extension` folder
   - Click "Select Folder" or "Open"

4. **Verify Installation**:
   - You should see "Midjourney Image Scraper" appear in your extensions list
   - The extension icon (🎨) should appear in your browser toolbar
   - If you don't see the icon, click the extensions puzzle piece icon and pin it

### Step 3: Configure the Extension

1. **Click the Extension Icon** in your browser toolbar
2. **Configure API Settings** (optional):
   - Enter your API Base URL if you have a backend service
   - Enter your API Key for authentication
   - Click "Save Settings"
3. **Test the Auto-save Toggle**: Make sure it's enabled (blue)

### Step 4: Start Using on Midjourney

1. **Open Midjourney**: Click "Open Midjourney" in the extension popup or go to https://midjourney.com
2. **Log In**: Make sure you're logged into your Midjourney account
3. **Generate Images**: Use Midjourney normally to generate images
4. **Monitor Extension**: The extension will automatically detect and save new images

## 🔧 Configuration Options

### Environment Variables

The extension can be configured through the popup interface or by setting these values:

| Setting | Description | Default |
|---------|-------------|---------|
| `TARGET_URL` | Midjourney URL to monitor | `https://midjourney.com` |
| `API_BASE_URL` | Your backend API endpoint | Not set |
| `API_KEY` | Authentication key for API | Not set |
| `AUTO_SAVE_ENABLED` | Enable automatic image saving | `true` |

### Popup Configuration

Access these settings by clicking the extension icon:

- **Auto-save Toggle**: Enable/disable automatic image detection
- **API Configuration**: Set up your backend service
- **Status Monitoring**: View login status and saved image count
- **Recent Images**: Preview recently saved images

## 🔍 How It Works

### Image Detection

The extension uses multiple detection methods:

1. **MutationObserver**: Watches for new DOM elements
2. **Periodic Scanning**: Checks for images every 2 seconds
3. **CSS Selectors**: Targets Midjourney-specific image containers

### Supported Image Sources

- `cdn.midjourney.com/*` - Official Midjourney CDN
- `media.discordapp.net/*` - Discord-hosted images
- Any images within Midjourney interface containers

### Data Storage

**Local Storage** (Chrome Storage API):
```json
{
  "url": "https://cdn.midjourney.com/image.png",
  "prompt": "A beautiful landscape...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "alt": "Generated image",
  "width": 1024,
  "height": 1024,
  "pageUrl": "https://midjourney.com/app"
}
```

## 🛠️ Development & Customization

### File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Page content script
├── config.js            # Configuration management
├── popup.html           # Extension popup interface
├── popup.js            # Popup functionality
├── package.json        # Package metadata
├── icons/             # Extension icons
└── README.md         # This file
```

### Customizing Selectors

If Midjourney changes their interface, update these selectors in `config.js`:

```javascript
SELECTORS: {
  IMAGE_CONTAINER: '[data-testid="image-container"]',
  GENERATED_IMAGE: 'img[src*="cdn.midjourney.com"]',
  LOGIN_BUTTON: '[data-testid="login"]',
  USER_AVATAR: '[data-testid="user-avatar"]',
  PROMPT_TEXT: '[data-testid="prompt"]'
}
```

### API Integration

To integrate with your own backend:

1. **Set API URL**: `https://your-api.com/api`
2. **Set API Key**: Your authentication token
3. **Endpoint Expected**: `POST /api/images`

**Request Format**:
```json
{
  "url": "image_url",
  "prompt": "image_prompt",
  "timestamp": "iso_date",
  "metadata": {...}
}
```

### Building for Production

1. **Create Distribution Package**:
   ```bash
   cd apps/chrome-extension
   npm run zip
   ```

2. **Upload to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - Upload the generated ZIP file
   - Follow the review process

## 🐛 Troubleshooting

### Extension Not Working

1. **Check Extension Status**:
   - Go to `chrome://extensions/`
   - Ensure "Midjourney Image Scraper" is enabled
   - Check for any error messages

2. **Reload Extension**:
   - Click the refresh icon on the extension card
   - Reload any open Midjourney tabs

3. **Check Permissions**:
   - Ensure the extension has permission for `midjourney.com`
   - Click the extension icon and check login status

### Images Not Being Detected

1. **Verify URL**: Make sure you're on `midjourney.com`
2. **Check Auto-save**: Ensure auto-save is enabled in the popup
3. **Login Status**: Verify you're logged into Midjourney
4. **Console Errors**: Open Developer Tools (F12) and check for errors

### API Not Working

1. **Check Settings**: Verify API URL and Key are correctly set
2. **Network Tab**: Open Developer Tools → Network to see API requests
3. **CORS Issues**: Ensure your API supports CORS for Chrome extensions

## 📱 Browser Compatibility

- ✅ **Chrome 88+**: Full support
- ✅ **Edge 88+**: Full support (Chromium-based)
- ❌ **Firefox**: Not supported (different extension format)
- ❌ **Safari**: Not supported (different extension format)

## 🔒 Privacy & Security

### Data Collection

This extension:
- ✅ Only operates on Midjourney websites
- ✅ Stores data locally in your browser
- ✅ Only sends data to APIs you configure
- ❌ Does not collect personal information
- ❌ Does not track your browsing

### Permissions Explained

- `storage`: Save extension settings and image metadata
- `activeTab`: Access the current Midjourney tab
- `tabs`: Detect when you're on Midjourney
- `downloads`: Future feature for direct downloads

## 🆘 Support & Contributing

### Getting Help

1. **Check Console**: Open Developer Tools (F12) and check for error messages
2. **Issue Tracker**: Report bugs in the project repository
3. **Documentation**: Re-read this README for configuration details

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd apps/chrome-extension

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select this directory

# Make changes and reload extension as needed
```

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- Chrome Extensions documentation
- Midjourney for creating an amazing AI art platform
- The open-source community for inspiration and guidance

---

**Happy Image Collecting! 🎨✨**

For the latest updates and support, visit the project repository.
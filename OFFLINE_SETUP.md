# Browser Shell Offline Setup Guide

## ✅ Module System Conversion Complete

All source files have been successfully converted from CommonJS (`require()`) to ES6 modules (`import`/`export`). This enables the application to run offline without a web server.

## 📦 Remaining Steps: Bundle External Libraries

The application depends on several external libraries that need to be bundled locally. Follow the steps below:

### 1. Copy xterm Library Files

xterm provides the terminal UI component and must be bundled locally.

```bash
# From your project root:
cp node_modules/xterm/dist/xterm.min.js src/
cp node_modules/xterm/dist/xterm.css src/
cp node_modules/xterm/lib/addons/fit/fit.min.js src/xterm-addon-fit.min.js
```

**Files needed in `src/`:**
- ✓ `xterm.min.js` - Terminal library (minified)
- ✓ `xterm.css` - Terminal styling
- ✓ `xterm-addon-fit.min.js` - Fit addon for terminal resizing

### 2. Copy Workbox Library

Workbox manages the Service Worker registration for offline caching.

```bash
cp node_modules/workbox-window/build/workbox-window.min.js src/
```

**File needed in `src/`:**
- ✓ `workbox-window.min.js` - Service Worker window interface

### 3. Bundle Filer Library

Filer is a complex dependency that requires special handling. You have two options:

#### Option A: Copy Pre-built Bundle (Recommended)
```bash
cp node_modules/filer/dist/filer.min.js src/
```

Then add this to `src/index.html` before the module script:
```html
<script src="./filer.min.js"></script>
```

Filer exposes itself globally as `window.Filer`, which the application accesses in `filesystem.js`.

#### Option B: Use a Bundler
If you prefer true ES6 modules throughout:
1. Install a bundler (esbuild, rollup, or webpack)
2. Configure it to bundle all dependencies including Filer
3. Use the bundled output

### 4. Bundle V86 Library

V86 is the x86 PC emulator. Similar to Filer, it's best handled as a global:

```bash
cp node_modules/v86/build/v86.min.js src/
cp node_modules/v86/bios/seabios.bin src/bin/
cp node_modules/v86/bios/vgabios.bin src/bin/
cp node_modules/v86/images/linux/v86-linux.iso src/bin/
```

Then add this to `src/index.html` before the module script:
```html
<script src="./v86.min.js"></script>
```

V86 exposes itself as `window.V86Starter`.

**Files needed in `src/`:**
- ✓ `v86.min.js` - V86 emulator (minified)

**Files needed in `src/bin/`:**
- ✓ `seabios.bin` - BIOS image
- ✓ `vgabios.bin` - VGA BIOS image
- ✓ `v86-linux.iso` - Linux boot image

### 5. Bundle drag-drop Library

The drag-drop library handles file drag-and-drop functionality:

```bash
cp node_modules/drag-drop/dist/drag-drop.min.js src/
```

Then add this to `src/index.html` before the module script:
```html
<script src="./drag-drop.min.js"></script>
```

Drag-drop exposes itself as `window.dragDrop`.

Update `src/filesystem.js` to use the global:
```javascript
const dragDrop = window.dragDrop;
```

**File needed in `src/`:**
- ✓ `drag-drop.min.js` - Drag-drop library (minified)

### 6. Update index.html with Script Tags

Add these script tags to `src/index.html` **before** the module script:

```html
<head>
    <!-- ... existing head content ... -->
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="xterm.css">
    <!-- ... -->
</head>
<body>
    <!-- ... -->
    
    <!-- Load global dependencies before ES6 modules -->
    <script src="./filer.min.js"></script>
    <script src="./v86.min.js"></script>
    <script src="./drag-drop.min.js"></script>
    
    <!-- Load ES6 modules after globals are available -->
    <script type="module" src="./index.js"></script>
</body>
```

## 🗂️ Final Directory Structure

After completing all steps, your `src/` directory should look like this:

```
src/
├── index.html              (updated with script tags)
├── index.js               (ES6 module)
├── server.js              (ES6 module)
├── terminal.js            (ES6 module)
├── browser.js             (ES6 module)
├── config.js              (ES6 module)
├── filesystem.js          (ES6 module)
├── vm.js                  (ES6 module)
├── cache.js               (ES6 module)
├── styles.css
├── xterm.css              ✓ NEW
├── xterm.min.js           ✓ NEW
├── xterm-addon-fit.min.js ✓ NEW
├── workbox-window.min.js  ✓ NEW
├── filer.min.js           ✓ NEW
├── v86.min.js             ✓ NEW
├── drag-drop.min.js       ✓ NEW
├── favicon.ico
├── nohost-sw.js           (downloaded from unpkg)
└── bin/
    ├── seabios.bin        ✓ NEW
    ├── vgabios.bin        ✓ NEW
    ├── v86-linux.iso      ✓ NEW
    └── vm-state.bin       (runtime cache)
```

## 🚀 Testing Offline

Once all files are in place:

1. **Serve locally (if needed for testing):**
   ```bash
   # Using Python 3
   python -m http.server 8000
   # or using Node.js
   npx http-server
   ```
   Then visit `http://localhost:8000/src/index.html`

2. **Or open directly (true offline mode):**
   - Open `file:///path/to/browser-shell/src/index.html` in your browser
   - The application should load and function completely offline

## ⚠️ Important Notes

### Browser Compatibility
- Service Workers require HTTPS (except for localhost/127.0.0.1)
- IndexedDB must be available
- Module scripts require modern browser support (ES6)

### File Size Considerations
The bundled application will be quite large due to:
- V86 emulator: ~2-3 MB
- V86 ISO image: ~50-100 MB
- Filer library: ~100-200 KB
- Other libraries: ~100-200 KB

### Cache Storage
- The VM state is cached in Cache Storage API (not IndexedDB)
- Filesystem data is stored in IndexedDB
- Both are browser-persistent and survive page reloads

### Limitations
- No network access inside the VM (by design, for true offline operation)
- Mouse/keyboard in VM console are disabled (only serial terminal works)
- All data is stored locally in the browser (no server backend)

## 🔧 Troubleshooting

**"Module not found" errors:**
- Ensure all `.js` files have `.js` extensions in import statements
- Check that all external libraries are in the correct locations

**"Filer is not defined" errors:**
- Ensure `filer.min.js` is loaded as a global script before modules

**"V86Starter is not defined" errors:**
- Ensure `v86.min.js` is loaded as a global script before modules

**"dragDrop is not defined" errors:**
- Ensure `drag-drop.min.js` is loaded as a global script before modules

**Service Worker errors:**
- Check browser console for Service Worker registration errors
- Service Worker requires HTTPS (or localhost)
- Clear browser cache if Service Worker seems stuck

## 📝 Additional Resources

- [Filer documentation](https://github.com/filerjs/filer)
- [V86 documentation](https://github.com/copy/v86)
- [xterm.js documentation](https://xtermjs.org/)
- [Workbox documentation](https://developers.google.com/web/tools/workbox)

## ✨ Next Steps

After completing this setup:

1. Test opening `src/index.html` directly in your browser
2. Verify the terminal boots successfully
3. Test creating files in the VM and viewing them in the web browser
4. Consider creating a build script to automate the file copying
5. Create a Release with prebuilt offline distribution

---

**Status:** Module conversion ✅ | Library bundling ⏳ | Testing 🔜

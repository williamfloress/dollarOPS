# Build Assets

Place your application icons in this directory.

## Windows Icon
- **File**: `icon.ico`
- **Format**: ICO file (Windows icon format)
- **Recommended sizes**: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16 (multi-resolution ICO)
- **Alternative**: You can also use `icon.png` (256x256 or 512x512) and electron-builder will convert it automatically

## macOS Icon
- **File**: `icon.icns`
- **Format**: ICNS file (macOS icon format)
- **Recommended**: 512x512 or 1024x1024 PNG converted to ICNS
- **Alternative**: You can also use `icon.png` and electron-builder will convert it automatically

## How to Create Icons

### Windows (.ico)
1. Create a PNG image (256x256 or 512x512 pixels)
2. Use an online converter like:
   - https://convertio.co/png-ico/
   - https://www.icoconverter.com/
3. Or use ImageMagick: `magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`

### macOS (.icns)
1. Create a PNG image (512x512 or 1024x1024 pixels)
2. On macOS, use: `iconutil -c icns icon.iconset` (requires creating an iconset folder)
3. Or use online converters like: https://cloudconvert.com/png-to-icns

## Notes
- If you only provide a PNG file, electron-builder will automatically convert it
- The icon will be used for the executable, installer, and taskbar/dock


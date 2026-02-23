# Fix App Icon for iOS TestFlight

## Problem
Your current icon file (`Deenify_Icon.png`) is **1248 x 832 pixels** (not square). iOS requires app icons to be:
- **Exactly 1024x1024 pixels**
- **Square format** (1:1 aspect ratio)
- **PNG format**
- **No transparency** (must have solid background)

## Solution

### Step 1: Create a 1024x1024 Square Icon

You have several options:

#### Option A: Use Online Tool (Easiest)
1. Go to [App Icon Generator](https://appicon.co/) or [Icon Kitchen](https://icon.kitchen/)
2. Upload your current `Deenify_Icon.png`
3. The tool will:
   - Crop/resize to 1024x1024
   - Add background if needed
   - Generate all required sizes
4. Download the 1024x1024 version
5. Replace `assets/images/Deenify_Icon.png` with the new file

#### Option B: Use Image Editor (Photoshop, GIMP, etc.)
1. Open `Deenify_Icon.png` in your image editor
2. Create a new canvas: **1024x1024 pixels**
3. Add a solid background color (match your app's theme - green #07C589 or similar)
4. Center your logo/icon on the canvas
5. Export as PNG (no transparency)
6. Save as `Deenify_Icon.png` in `assets/images/`

#### Option C: Use Command Line (if you have ImageMagick)
```bash
# Resize and add background (replace with your background color)
convert assets/images/Deenify_Icon.png -resize 1024x1024 -background "#07C589" -gravity center -extent 1024x1024 assets/images/Deenify_Icon.png
```

### Step 2: Verify the Icon
After creating the new icon, verify it's correct:
```bash
file assets/images/Deenify_Icon.png
```
Should show: `1024 x 1024` (not 1248 x 832)

### Step 3: Rebuild the App
After fixing the icon, you need to rebuild:

```bash
# Build a new iOS version
eas build -p ios --profile production

# After build completes, submit to TestFlight
eas submit -p ios
```

### Step 4: Wait for Processing
- Apple processes the new build (10-60 minutes)
- The icon should now appear correctly in TestFlight

## Quick Checklist
- [ ] Icon is exactly 1024x1024 pixels
- [ ] Icon is square (1:1 aspect ratio)
- [ ] Icon has solid background (no transparency)
- [ ] Icon file is saved as `assets/images/Deenify_Icon.png`
- [ ] Rebuilt the app with `eas build -p ios`
- [ ] Submitted to TestFlight with `eas submit -p ios`

## Notes
- The icon will appear on:
  - Home screen
  - App Store listing
  - TestFlight
  - Settings app
- If the icon still doesn't appear after rebuilding, check:
  - File is actually 1024x1024 (verify with `file` command)
  - No transparency in the PNG
  - File path in `app.json` is correct: `"./assets/images/Deenify_Icon.png"`

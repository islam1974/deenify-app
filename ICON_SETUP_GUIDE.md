# Icon Setup Guide for Deenify App

This guide will help you set up the Deenify logo as your app's favicon, icons, and splash screen.

## Required Icon Files

Based on your app.json configuration, you need to create the following icon files:

### 1. Main App Icon
- **File**: `assets/images/deenify-logo.png`
- **Size**: 1024x1024 pixels (recommended)
- **Format**: PNG with transparent background
- **Usage**: Main app icon for iOS and general splash screen

### 2. Favicon
- **File**: `assets/images/favicon.png`
- **Size**: 32x32 pixels (minimum), 64x64 recommended
- **Format**: PNG
- **Usage**: Web favicon

### 3. Android Adaptive Icons
- **Foreground**: `assets/images/android-icon-foreground.png`
  - Size: 1024x1024 pixels
  - Format: PNG with transparent background
  - Should contain only the logo/icon without background
- **Background**: `assets/images/android-icon-background.png`
  - Size: 1024x1024 pixels
  - Format: PNG
  - Solid color background (golden-yellow from your logo)
- **Monochrome**: `assets/images/android-icon-monochrome.png`
  - Size: 1024x1024 pixels
  - Format: PNG
  - Single color version for notifications

## How to Create These Files

### Option 1: Using Online Tools
1. Go to [App Icon Generator](https://appicon.co/) or [Icon Kitchen](https://icon.kitchen/)
2. Upload your Deenify logo image
3. Generate all required sizes
4. Download and place in the correct locations

### Option 2: Using Design Software
1. **Main Logo (deenify-logo.png)**:
   - Create 1024x1024 canvas
   - Place your logo centered
   - Export as PNG with transparent background

2. **Favicon (favicon.png)**:
   - Resize your logo to 64x64 pixels
   - Export as PNG

3. **Android Foreground (android-icon-foreground.png)**:
   - Create 1024x1024 canvas
   - Place only the circular logo part (without the rounded square background)
   - Export as PNG with transparent background

4. **Android Background (android-icon-background.png)**:
   - Create 1024x1024 canvas
   - Fill with golden-yellow color (#F4D03F or similar)
   - Export as PNG

5. **Android Monochrome (android-icon-monochrome.png)**:
   - Create 1024x1024 canvas
   - Place logo in single color (white or black)
   - Export as PNG

## Color References
Based on your logo description:
- **Golden Yellow**: #F4D03F (or similar warm golden tone)
- **Orange**: #FF8C00 (for Arabic text)
- **White/Cream**: #FFF8DC (for English text)

## File Placement
Once created, place all files in: `/Users/suhelislam/Desktop/My Apps/Deenify App/deenify-app/assets/images/`

## Verification
After placing the files, run:
```bash
npx expo prebuild --clean
```

This will regenerate the native project files with your new icons.

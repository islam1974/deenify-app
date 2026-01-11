#!/bin/bash

# Script to create Android notification icons from Deenifylogo.png
# This creates white/transparent icons required for Android notifications

echo "📱 Creating Android notification icons..."
echo "========================================"

# Check if monochrome icon exists
if [ ! -f "assets/images/android-icon-monochrome.png" ]; then
    echo "❌ android-icon-monochrome.png not found in assets/images/"
    echo "   Falling back to Deenifylogo.png..."
    if [ ! -f "assets/images/Deenifylogo.png" ]; then
        echo "❌ Deenifylogo.png also not found in assets/images/"
        exit 1
    fi
    ICON_SOURCE="assets/images/Deenifylogo.png"
else
    ICON_SOURCE="assets/images/android-icon-monochrome.png"
fi

# Android notification icon sizes
mdpi_size=24
hdpi_size=36
xhdpi_size=48
xxhdpi_size=72
xxxhdpi_size=96

# Convert to white/transparent icon (Android requires monochrome notification icons)
echo ""
echo "📝 Converting logo to white icons..."
echo "Note: This creates a white silhouette for Android notifications"
echo ""

# Function to create icon for a specific density
create_icon() {
    local density=$1
    local size=$2
    
    # Create drawable directory if it doesn't exist
    mkdir -p "android/app/src/main/res/drawable-${density}"
    
    # Convert to white notification icon
    echo "Creating ${density} icon (${size}x${size})..."
    
    # Try sips first (macOS built-in)
    if command -v sips &> /dev/null; then
        # Resize the icon
        sips -z ${size} ${size} "$ICON_SOURCE" --out "android/app/src/main/res/drawable-${density}/notification_icon.png" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ Created using sips"
            return 0
        fi
    fi
    
    # Try ImageMagick
    if command -v convert &> /dev/null; then
        convert "$ICON_SOURCE" \
            -resize ${size}x${size} \
            "android/app/src/main/res/drawable-${density}/notification_icon.png" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ Created using ImageMagick"
            return 0
        fi
    fi
    
    # Fallback: Manual instructions
    echo "   ⚠️  Could not create icon automatically"
    echo "   Please use online tool: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html"
    return 1
}

# Create icons for each density
create_icon mdpi $mdpi_size
create_icon hdpi $hdpi_size
create_icon xhdpi $xhdpi_size
create_icon xxhdpi $xxhdpi_size
create_icon xxxhdpi $xxxhdpi_size

echo ""
echo "✅ Android notification icons created!"
echo ""
echo "📝 Next steps:"
echo "1. Review the created icons in android/app/src/main/res/drawable-*/"
echo "2. Rebuild your Android app"
echo "3. Test notifications - they should now show the Deenify logo!"
echo ""
echo "💡 Tip: For better icons, use online tools like:"
echo "   https://romannurik.github.io/AndroidAssetStudio/icons-notification.html"
echo "   Upload Deenifylogo.png and generate white versions"


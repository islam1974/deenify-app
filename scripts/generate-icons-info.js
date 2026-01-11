#!/usr/bin/env node

/**
 * Icon Generation Script for Deenify App
 * 
 * This script helps you understand what icon files are needed
 * and provides guidance on creating them from your logo.
 */

const fs = require('fs');
const path = require('path');

const requiredIcons = [
  {
    name: 'deenify-logo.png',
    size: '1024x1024',
    description: 'Main app icon for iOS and splash screen',
    usage: 'Primary app icon'
  },
  {
    name: 'favicon.png',
    size: '64x64',
    description: 'Web favicon',
    usage: 'Browser tab icon'
  },
  {
    name: 'android-icon-foreground.png',
    size: '1024x1024',
    description: 'Android adaptive icon foreground',
    usage: 'Android app icon (foreground layer)'
  },
  {
    name: 'android-icon-background.png',
    size: '1024x1024',
    description: 'Android adaptive icon background',
    usage: 'Android app icon (background layer)'
  },
  {
    name: 'android-icon-monochrome.png',
    size: '1024x1024',
    description: 'Android monochrome icon',
    usage: 'Android notification icon'
  }
];

console.log('🎨 Deenify App Icon Requirements\n');
console.log('=' .repeat(50));

requiredIcons.forEach((icon, index) => {
  console.log(`\n${index + 1}. ${icon.name}`);
  console.log(`   Size: ${icon.size}`);
  console.log(`   Description: ${icon.description}`);
  console.log(`   Usage: ${icon.usage}`);
});

console.log('\n' + '=' .repeat(50));
console.log('\n📁 Target Directory:');
console.log('   assets/images/');
console.log('\n🔧 Next Steps:');
console.log('   1. Create the icon files using the guide in ICON_SETUP_GUIDE.md');
console.log('   2. Place all files in the assets/images/ directory');
console.log('   3. Run: npx expo prebuild --clean');
console.log('   4. Test your app to verify icons are working');

// Check if icons directory exists
const iconsDir = path.join(__dirname, 'assets', 'images');
if (fs.existsSync(iconsDir)) {
  console.log('\n📋 Current files in assets/images/:');
  const files = fs.readdirSync(iconsDir);
  files.forEach(file => {
    const isRequired = requiredIcons.some(icon => icon.name === file);
    console.log(`   ${isRequired ? '✅' : '📄'} ${file}`);
  });
} else {
  console.log('\n❌ assets/images/ directory not found');
}

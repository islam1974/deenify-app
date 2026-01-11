const fs = require('fs');
const path = require('path');

// Android notification icon requirements
const androidIconSizes = [
  { name: 'mdpi', size: 24 },
  { name: 'hdpi', size: 36 },
  { name: 'xhdpi', size: 48 },
  { name: 'xxhdpi', size: 72 },
  { name: 'xxxhdpi', size: 96 }
];

console.log('📱 Android Notification Icon Setup Guide');
console.log('=====================================\n');

console.log('To use Deenifylogo.png as your notification icon, you need to:');
console.log('\n1. Create notification icon files in the following sizes:');

androidIconSizes.forEach(icon => {
  console.log(`   - ${icon.name}: ${icon.size}x${icon.size}px`);
});

console.log('\n2. Place them in: android/app/src/main/res/drawable-[density]/');
console.log('   - drawable-mdpi/notification_icon.png (24x24)');
console.log('   - drawable-hdpi/notification_icon.png (36x36)');
console.log('   - drawable-xhdpi/notification_icon.png (48x48)');
console.log('   - drawable-xxhdpi/notification_icon.png (72x72)');
console.log('   - drawable-xxxhdpi/notification_icon.png (96x96)');

console.log('\n3. Update the icon reference in PrayerNotificationService.ts:');
console.log('   icon: "notification_icon"');

console.log('\n4. For iOS, the app icon will be used automatically.');

console.log('\n📝 Note: Android notification icons should be:');
console.log('   - White/transparent (monochrome)');
console.log('   - Simple design (no colors)');
console.log('   - PNG format');
console.log('   - Square aspect ratio');

console.log('\n🎨 You can use online tools like:');
console.log('   - https://romannurik.github.io/AndroidAssetStudio/icons-notification.html');
console.log('   - Upload your Deenifylogo.png and generate the required sizes');

console.log('\n✅ Once set up, your prayer notifications will show the Deenify logo!');

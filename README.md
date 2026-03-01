# Deenify - Your Islamic Companion 🕌

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-blue.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)](https://reactnative.dev)
[![Privacy First](https://img.shields.io/badge/Privacy-First-brightgreen.svg)](./PRIVACY_POLICY.md)

Deenify is a comprehensive Islamic companion app that helps Muslims practice their faith. Features include prayer times, Quran reader with audio, Qibla direction, duas, hadith, tasbih counter, mosque finder, Hijri calendar, and Ramadan tracker. The home dashboard shows a new Quran verse on each load.

## ✨ Features

### 🕌 Prayer Times
- Accurate prayer times based on your location
- Multiple calculation methods (MWL, ISNA, Egypt, Makkah, etc.)
- Madhab selection (Shafi, Hanafi)
- Prayer time notifications with adhan
- Auto-updates when you travel

### 📖 Quran Reader
- Complete Quran in Arabic with translations
- Multiple translations (Sahih International, Yusuf Ali, Pickthall, and more)
- Multiple Arabic fonts (Uthmani, Scheherazade, Amiri, etc.)
- Audio recitations (Alafasy, Husary, Abdul Basit, and more)
- Tajweed highlighting
- Reading progress & "Continue reading" / "Where I left off"
- Adjustable font size and text direction
- Search surahs on Quran landing
- Themed reading experience (Night Manuscript, Parchment Classic, Emerald Garden)

### 🧭 Qibla Direction
- Accurate Qibla compass
- Visual direction indicator
- Works with device sensors

### 📿 Digital Tasbih
- Digital counter for dhikr
- Haptic feedback
- Counter history
- Customizable counts

### 🕌 Mosque Finder
- Find nearby mosques
- Location-based search

### 📅 Hijri Calendar & Ramadan Tracker
- Hijri date display
- Ramadan countdown and tracker

### 📚 Duas & Hadith
- Daily duas by category (Daily, Travel, Health, Ramadan, etc.)
- Search duas by keyword
- Authentic hadith collections

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/islam1974/deenify-app.git
   cd deenify-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## 📱 Building for Production

### iOS Build
```bash
eas build --platform ios
```

### Android Build
```bash
eas build --platform android
```

## 🔒 Privacy & Data Protection

**Deenify is built with privacy as a priority:**

- ✅ **Local Storage Only** - All data stays on your device
- ✅ **No Third-Party Sharing** - We never share your data
- ✅ **Optional Location** - Use manual location if you prefer
- ✅ **No Tracking** - No analytics or tracking tools
- ✅ **Full Control** - Disable any feature anytime
- ✅ **GDPR & CCPA Compliant**

For complete privacy details, see:
- [Full Privacy Policy](./PRIVACY_POLICY.md)
- [App Store Submission Guide](./APP_STORE_PRIVACY_GUIDE.md)
- [Quick Privacy Reference](./PRIVACY_QUICK_REFERENCE.md)

## 📋 Permissions

The app requests the following optional permissions:

| Permission | Purpose | Required? |
|------------|---------|-----------|
| **Location** | Calculate accurate prayer times and Qibla direction | Optional - manual entry available |
| **Notifications** | Prayer time reminders | Optional |
| **Media/Audio** | Play Quran recitations and adhan | Optional |

## 🛠️ Tech Stack

- **Framework:** React Native with Expo SDK 54
- **Language:** TypeScript
- **Navigation:** Expo Router
- **State Management:** React Context API
- **Storage:** AsyncStorage
- **APIs & Data:**
  - Prayer times (location-based via Adhan library)
  - [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) (Quran text & translations)
  - EveryAyah.com (Quran audio recitations)

## 📁 Project Structure

```
deenify-app/
├── app/                      # App screens (Expo Router)
│   ├── (drawer)/            # Drawer navigation
│   │   ├── (stack)/         # Stack screens (Home, Quran landing, Quran reader)
│   │   │   ├── index.tsx    # Dashboard / Home
│   │   │   ├── quran-landing.tsx
│   │   │   └── quran.tsx
│   │   ├── ramadan-tracker.tsx
│   │   └── settings.tsx
│   ├── prayer-times.tsx, qibla.tsx, duas.tsx, hadith.tsx, tasbih.tsx
├── components/              # Reusable components
│   ├── QuranReader.tsx
│   ├── LocationPermissionModal.tsx
│   ├── PrivacyNoticeModal.tsx
│   └── ...
├── contexts/               # React Context providers
│   ├── LocationContext.tsx
│   ├── PrayerSettingsContext.tsx
│   ├── QuranSettingsContext.tsx
│   ├── PrivacyContext.tsx
│   └── ...
├── services/              # API and business logic
│   ├── PrayerTimesService.ts
│   ├── QuranService.ts
│   ├── AdhanSoundService.ts
│   └── ...
├── assets/               # Images, audio, fonts
├── constants/            # Theme and constants
└── data/                # Static data files
```

## 🧪 Testing

Run the app on both iOS and Android before submitting to app stores:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Privacy Testing Checklist
- [ ] First-launch privacy notice appears
- [ ] Location permission flow works
- [ ] Manual location entry works
- [ ] Privacy policy is accessible from Settings
- [ ] Location can be disabled in Settings
- [ ] Notifications can be disabled

## 📦 App Store Submission

Before submitting to Apple App Store or Google Play Store:

1. **Host Privacy Policy**
   - Upload `PRIVACY_POLICY.md` to a public URL
   - Recommended: Use GitHub Pages (see [guide](./APP_STORE_PRIVACY_GUIDE.md))

2. **Update Contact Information**
   - Update email in privacy policy files
   - Set support URL in app configs

3. **Complete Privacy Questionnaires**
   - Apple App Store: App Privacy section in App Store Connect
   - Google Play: Data Safety section in Play Console
   - See [App Store Privacy Guide](./APP_STORE_PRIVACY_GUIDE.md) for exact answers

4. **Test Thoroughly**
   - All features work on both platforms
   - Privacy features work as expected
   - Permissions are properly explained

See [APP_STORE_PRIVACY_GUIDE.md](./APP_STORE_PRIVACY_GUIDE.md) for detailed submission instructions.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Quran Text & Translations:** [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) (Unlicense)
- **Quran Audio:** EveryAyah.com
- **Prayer Times:** Adhan library
- **Icons:** SF Symbols (iOS) and Material Icons (Android)

## 📞 Contact & Support

- **Email:** suhel_islam@yahoo.co.uk
- **Privacy Questions:** privacy@deenify.app
- **Issues:** [GitHub Issues](https://github.com/islam1974/deenify-app/issues)

## 🗓️ Roadmap

- [ ] Quranic bookmarks sync (optional cloud backup)
- [ ] More reciter options
- [ ] Widget support for prayer times
- [ ] Apple Watch app
- [ ] Additional language support
- [ ] Tafsir (Quranic commentary)
- [ ] Community prayer times submissions

## 💝 Support the Project

If you find Deenify useful, please:
- ⭐ Star this repository
- 🔄 Share with friends and family
- 📝 Leave a review on the App Store / Play Store
- 🐛 Report bugs and suggest features

---

**Made with ❤️ for the Muslim community**

*"Verily, in the remembrance of Allah do hearts find rest." - Quran 13:28*

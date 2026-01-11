# 📋 App Store Submission Checklist

## Pre-Submission Requirements

### 🔴 CRITICAL - Must Complete Before Submission

- [ ] **Host Privacy Policy**
  - Upload `PRIVACY_POLICY.md` to public URL
  - Recommended: GitHub Pages (see guide)
  - Privacy URL: ______________________________

- [ ] **Update Contact Email**
  - [ ] Update in `PRIVACY_POLICY.md` (line ~166)
  - [ ] Update in `app/privacy-policy.tsx` (line ~157)
  - Your email: ______________________________

- [ ] **Test Privacy Features**
  - [ ] Uninstall and fresh install
  - [ ] Privacy notice appears on first launch
  - [ ] Privacy notice doesn't appear on second launch
  - [ ] Privacy Policy opens from Settings
  - [ ] Location permission flow works
  - [ ] Can disable location in Settings

---

## 🍎 Apple App Store

### App Store Connect Setup

- [ ] **Create App Listing**
  - [ ] App name: Deenify
  - [ ] Bundle ID matches your app
  - [ ] Screenshots uploaded
  - [ ] App description written

- [ ] **Privacy Policy URL**
  - [ ] Added to App Information
  - URL: ______________________________

- [ ] **App Privacy Questionnaire**
  - [ ] Do you collect data? → YES
  - [ ] Precise Location → YES
    - [ ] Purpose: App Functionality
    - [ ] Linked to user: NO
    - [ ] Used for tracking: NO
  - [ ] Product Interaction → YES
    - [ ] Purpose: App Functionality
    - [ ] Linked to user: NO
    - [ ] Used for tracking: NO

- [ ] **App Review Information**
  - [ ] Contact email provided
  - [ ] Phone number provided
  - [ ] Demo account (if needed): N/A

### iOS Build

- [ ] **Build & Upload**
  ```bash
  eas build --platform ios
  ```
  - [ ] Build successful
  - [ ] Uploaded to App Store Connect
  - [ ] Build processed

- [ ] **Test on TestFlight**
  - [ ] Privacy notice works
  - [ ] All features functional
  - [ ] No crashes

---

## 🤖 Google Play Store

### Play Console Setup

- [ ] **Create App Listing**
  - [ ] App name: Deenify
  - [ ] Package name matches
  - [ ] Screenshots uploaded (phone & tablet)
  - [ ] Feature graphic uploaded
  - [ ] App description written

- [ ] **Store Listing → App Content**
  - [ ] Privacy Policy URL added
  - URL: ______________________________

- [ ] **Data Safety Section**
  - [ ] Does your app collect data? → YES
  - [ ] Location data collected:
    - [ ] Approximate location
    - [ ] Precise location
    - [ ] Purpose: App functionality
    - [ ] Optional: YES
    - [ ] Shared: NO
    - [ ] Ephemeral: YES
  - [ ] App interactions:
    - [ ] App interactions (bookmarks)
    - [ ] Purpose: App functionality
    - [ ] Shared: NO

- [ ] **Content Rating**
  - [ ] Questionnaire completed
  - [ ] Rating received: _______

- [ ] **Target Audience**
  - [ ] Age groups selected
  - [ ] Appropriate for all ages

### Android Build

- [ ] **Build & Upload**
  ```bash
  eas build --platform android
  ```
  - [ ] Build successful
  - [ ] AAB/APK generated
  - [ ] Uploaded to Play Console

- [ ] **Test on Internal Track**
  - [ ] Privacy notice works
  - [ ] All features functional
  - [ ] No crashes

---

## 📱 Both Platforms

### App Description (Copy-Paste Ready)

**Short Description (80 chars max):**
```
Your Islamic companion - Prayer times, Quran, Qibla, and more
```

**Full Description:**
```
Deenify - Your Islamic Companion 🕌

Practice your faith with ease using Deenify, a comprehensive Islamic app designed for Muslims worldwide.

FEATURES:

🕌 Prayer Times
• Accurate prayer times for your location
• Multiple calculation methods
• Prayer notifications with beautiful adhan
• Auto-updates when traveling

📖 Quran Reader
• Complete Quran with translations
• Audio recitations from renowned reciters
• Tajweed highlighting
• Bookmarks and reading progress

🧭 Qibla Compass
• Find the direction to Mecca anywhere
• Accurate compass with visual indicators

📿 Digital Tasbih
• Keep track of your dhikr
• Counter history

🕌 Mosque Finder
• Locate nearby mosques easily

📅 Hijri Calendar
• Islamic calendar with important dates

📚 Duas & Hadith
• Daily supplications
• Authentic hadith collections

PRIVACY FIRST:
✓ Your data stays on your device
✓ No ads, no tracking
✓ Optional location services
✓ Full control over permissions

Download Deenify today and strengthen your connection with Islam.
```

### Keywords (Comma-separated)
```
islamic, muslim, prayer, quran, qibla, islam, mosque, ramadan, dua, hadith, tasbih, adhan
```

---

## 🧪 Final Testing

### Functional Testing

- [ ] **Prayer Times**
  - [ ] Displays correct times
  - [ ] Updates with location
  - [ ] Notifications work

- [ ] **Quran Reader**
  - [ ] Text displays correctly
  - [ ] Audio plays
  - [ ] Bookmarks save

- [ ] **Qibla**
  - [ ] Compass works
  - [ ] Direction accurate

- [ ] **Settings**
  - [ ] All settings save
  - [ ] Theme changes work
  - [ ] Privacy policy opens

### Privacy Testing

- [ ] **First Launch**
  - [ ] Privacy modal appears
  - [ ] "Got It" dismisses it
  - [ ] Doesn't show again

- [ ] **Permissions**
  - [ ] Location permission explained
  - [ ] Can deny and use manual entry
  - [ ] Can disable in Settings

- [ ] **Privacy Policy**
  - [ ] Accessible from Settings
  - [ ] All sections visible
  - [ ] Contact info correct

### Device Testing

- [ ] **iOS**
  - [ ] iPhone (various sizes)
  - [ ] iPad (if supported)
  - [ ] Dark mode
  - [ ] Light mode

- [ ] **Android**
  - [ ] Various screen sizes
  - [ ] Dark mode
  - [ ] Light mode
  - [ ] Different Android versions

---

## 📄 Required Documents

- [ ] Privacy Policy URL: ______________________________
- [ ] Support Email: ______________________________
- [ ] Support URL (optional): ______________________________
- [ ] App Icon (1024x1024): ✓
- [ ] Screenshots: ✓
- [ ] App Preview Video (optional): _______

---

## 🎯 App Store Review Tips

### Do's ✅
- ✅ Test thoroughly before submission
- ✅ Provide accurate privacy information
- ✅ Respond quickly to review questions
- ✅ Have demo account ready (if needed)

### Don'ts ❌
- ❌ Rush the submission
- ❌ Ignore permission explanations
- ❌ Forget to test on real devices
- ❌ Use fake or placeholder content

---

## 📞 Review Responses

If reviewers ask about:

**"Why do you need location?"**
```
Location is used exclusively to calculate accurate prayer times 
based on the user's geographic position. Users can optionally 
enter their location manually instead. Location data is processed 
locally and not shared with third parties.
```

**"What data do you collect?"**
```
We collect location coordinates (optional) for prayer time 
calculations. All data is stored locally on the device. We do not 
collect personal information, use analytics, or share data with 
third parties. Users have full control to disable location services.
```

**"Where is your privacy policy?"**
```
Our privacy policy is available at: [YOUR URL]
It is also accessible within the app at Settings → Privacy & Legal → Privacy Policy
```

---

## ✅ Final Checks

Before clicking "Submit for Review":

- [ ] All above items checked
- [ ] Privacy policy is live and accessible
- [ ] Tested on real devices (iOS and Android)
- [ ] No crashes or major bugs
- [ ] Screenshots are current and accurate
- [ ] App description is compelling
- [ ] Contact information is correct
- [ ] Ready to respond to review questions

---

## 🎉 Post-Submission

After submission:

- [ ] Monitor App Store Connect / Play Console
- [ ] Check email for review updates
- [ ] Be ready to respond within 24 hours
- [ ] Have TestFlight / Internal Testing active
- [ ] Monitor crash reports

---

## 📅 Timeline Estimates

| Platform | Review Time | Success Rate |
|----------|-------------|--------------|
| **Apple** | 1-3 days | ~90% first try |
| **Google** | 1-7 days | ~85% first try |

**Common rejection reasons:**
- Missing/invalid privacy policy URL
- Incomplete privacy questionnaire
- Permission not explained
- App crashes on launch

---

## 🚀 Launch Day

When approved:

- [ ] Share on social media
- [ ] Notify beta testers
- [ ] Ask for reviews
- [ ] Monitor feedback
- [ ] Celebrate! 🎉

---

**Good luck with your submission!** 🚀

*Need help? Check:*
- `APP_STORE_PRIVACY_GUIDE.md` - Detailed submission guide
- `PRIVACY_QUICK_REFERENCE.md` - Quick answers
- `PRIVACY_IMPLEMENTATION_SUMMARY.md` - What was implemented

**Last Updated:** October 21, 2025


# App Store Privacy & Compliance Guide for Deenify

## ✅ What Has Been Implemented

### 1. **In-App Privacy Features**
- ✅ Full Privacy Policy screen accessible from Settings
- ✅ First-launch privacy notice modal that users see on app's first open
- ✅ Clear location permission request modal with explanation
- ✅ Privacy & Legal section in Settings with:
  - Privacy Policy link
  - Data & Permissions information
- ✅ User controls to disable location services anytime
- ✅ Manual location entry as an alternative to GPS

### 2. **Privacy Context**
- ✅ `PrivacyContext` tracks if user has seen and accepted privacy notice
- ✅ Privacy notice shows automatically on first launch
- ✅ Acceptance is stored locally using AsyncStorage

### 3. **Documentation**
- ✅ `PRIVACY_POLICY.md` - Complete privacy policy in markdown format
- ✅ In-app privacy policy screen with user-friendly formatting
- ✅ Clear explanations of data collection and usage

### 4. **Permission Handling**
- ✅ iOS: Location usage descriptions in Info.plist
- ✅ Android: Location permissions in AndroidManifest.xml
- ✅ Both platforms: Clear explanations before requesting permissions

## 📱 Apple App Store Submission

### Privacy Policy URL
When submitting to the App Store, you'll need to provide a privacy policy URL. You have two options:

#### Option 1: Host PRIVACY_POLICY.md
1. Host the `PRIVACY_POLICY.md` file on:
   - Your website (e.g., `https://deenify.app/privacy-policy`)
   - GitHub Pages (free and easy)
   - Privacy policy generators (iubenda, termly, etc.)

#### Option 2: Use GitHub Pages (Free)
```bash
# Create a gh-pages branch
git checkout -b gh-pages
git add PRIVACY_POLICY.md
git commit -m "Add privacy policy"
git push origin gh-pages
```
Then enable GitHub Pages in your repository settings. Your privacy policy will be available at:
`https://yourusername.github.io/deenify-app/PRIVACY_POLICY.md`

### App Store Connect - Privacy Questions

When filling out the App Privacy section in App Store Connect, answer:

#### **Data Types Collected**

**Location - Precise Location**
- ☑️ Precise Location
- **Used for:** App Functionality (prayer times calculation)
- **Linked to User:** No
- **Used for Tracking:** No

**Usage Data**
- ☑️ Product Interaction (bookmarks, reading progress)
- **Linked to User:** No
- **Used for Tracking:** No

#### **Privacy Practices**

1. **Do you or your third-party partners collect data from this app?**
   - Answer: YES (location for prayer times)

2. **Is the data linked to the user's identity?**
   - Answer: NO (all data is anonymous and local)

3. **Do you or your third-party partners use data for tracking purposes?**
   - Answer: NO

4. **Privacy Policy URL:**
   - Enter your hosted privacy policy URL

## 🤖 Google Play Store Submission

### Privacy Policy
1. Go to Google Play Console → Your App → Store Presence → App Content
2. Under "Privacy Policy," paste your privacy policy URL
3. Same hosting options as Apple (GitHub Pages, your website, etc.)

### Data Safety Section

Answer the following in the Data Safety questionnaire:

#### **Does your app collect or share user data?**
- Answer: YES

#### **Location**
- ☑️ Approximate location
- ☑️ Precise location
- **Purpose:** App functionality (prayer times)
- **Data collection:** Optional (users can manually enter location)
- **Data sharing:** NO
- **Ephemeral:** YES (not stored on servers)

#### **App info and performance**
- ☑️ App interactions (bookmarks, preferences)
- **Purpose:** App functionality
- **Data sharing:** NO
- **Stored on device only:** YES

#### **Encryption**
- Data is encrypted in transit: YES (HTTPS for API calls)
- Users can request data deletion: YES (via app uninstall or clearing data)

### Permissions Declaration
Your AndroidManifest.xml already declares:
- `ACCESS_FINE_LOCATION` - For precise location
- `ACCESS_COARSE_LOCATION` - For approximate location
- `POST_NOTIFICATIONS` - For prayer time notifications

## 🔒 Privacy Policy Hosting Options

### Recommended: GitHub Pages (Free & Easy)

1. **Create a `docs` folder in your repo:**
```bash
mkdir docs
cp PRIVACY_POLICY.md docs/index.md
```

2. **Convert to HTML (optional but recommended):**
Create `docs/index.html` with a simple HTML version of the privacy policy.

3. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Settings → Pages
   - Source: Deploy from branch `main`, folder `/docs`
   - Your privacy policy will be at: `https://yourusername.github.io/deenify-app/`

### Alternative Options:

1. **Your Own Website**
   - Host at: `https://deenify.app/privacy-policy`
   - Most professional option

2. **Third-Party Services** (with free tiers):
   - [Termly](https://termly.io/) - Privacy policy generator & hosting
   - [iubenda](https://www.iubenda.com/) - Privacy policy generator
   - [FreePrivacyPolicy.com](https://www.freeprivacypolicy.com/)

## 📋 Checklist Before Submission

### Pre-Submission Checklist

- [ ] Privacy policy is hosted and publicly accessible
- [ ] Privacy policy URL is added to App Store Connect / Play Console
- [ ] Test the privacy notice modal on first launch
- [ ] Test location permission flow
- [ ] Test manual location entry
- [ ] Verify users can disable location services in Settings
- [ ] Test privacy policy screen navigation from Settings
- [ ] Verify all permission descriptions are clear and accurate
- [ ] Test on both iOS and Android
- [ ] Update contact email in privacy policy if needed

### iOS Specific
- [ ] Info.plist has location usage descriptions
- [ ] Privacy policy URL added to App Store Connect
- [ ] Data collection questionnaire completed in App Store Connect
- [ ] Screenshots show no location data before permission granted

### Android Specific
- [ ] AndroidManifest.xml declares all necessary permissions
- [ ] Data Safety section completed in Play Console
- [ ] Privacy policy URL added to Play Console
- [ ] Prominent disclosure in app listing (optional but recommended)

## 🛠️ Additional Recommendations

### 1. **Update Contact Email**
In both `PRIVACY_POLICY.md` and `app/privacy-policy.tsx`, update:
```
Email: privacy@deenify.app
```
to your actual contact email.

### 2. **Terms of Service (Optional)**
While not required for basic apps, consider adding Terms of Service if:
- You plan to add user accounts
- You want to limit liability
- You plan to monetize the app

### 3. **GDPR Compliance (EU Users)**
✅ Already compliant because:
- Users can disable location anytime
- Data is stored locally (user controls it)
- Clear consent is obtained
- No data is shared with third parties
- Users can delete data by uninstalling

### 4. **CCPA Compliance (California Users)**
✅ Already compliant because:
- You don't sell user data
- Data collection is disclosed
- Users can delete their data
- No discrimination for exercising rights

## 🚀 Testing Privacy Features

### Test First Launch Experience
1. Uninstall the app completely
2. Fresh install
3. Verify privacy notice modal appears
4. Accept and verify it doesn't show again
5. Test "View Full Privacy Policy" button

### Test Location Permissions
1. Enable location services
2. Verify clear explanation before system prompt
3. Deny permission
4. Verify app still works with manual location
5. Test re-requesting permission

### Test Privacy Settings
1. Navigate to Settings → Privacy & Legal
2. Tap Privacy Policy - verify it opens correctly
3. Tap Data & Permissions - verify helpful info shows
4. Test toggling location services on/off
5. Verify data persists/clears appropriately

## 📧 Support & Questions

If app stores request clarification or changes:

1. **Location Data:**
   - Emphasize it's optional
   - Explain it's for prayer times calculation
   - Clarify it's not stored on external servers

2. **Data Sharing:**
   - Coordinates are sent to prayer times APIs only
   - No personal data is collected or shared
   - All preferences stored locally

3. **User Control:**
   - Point to Settings → Location Services toggle
   - Mention manual location entry option
   - Explain uninstall deletes all data

## 🎯 Quick Links

- Privacy Policy (in-app): Settings → Privacy & Legal → Privacy Policy
- Privacy Notice: Shows automatically on first launch
- Location Settings: Settings → Prayer Settings → Location Services
- Permissions Info: Settings → Privacy & Legal → Data & Permissions

---

**Last Updated:** October 21, 2025

**Note:** Privacy requirements may change. Always check the latest App Store and Play Store guidelines before submission.


# 🚀 TestFlight Preparation Guide

This guide will walk you through preparing your Deenify app for TestFlight submission.

## ✅ Current Status

### Already Configured ✅
- ✅ **EAS Build Configuration**: `eas.json` created
- ✅ **Push Notifications**: Entitlements set to `production` 
- ✅ **App Version**: 1.0.0
- ✅ **Permissions**: All required permission descriptions are set
- ✅ **Bundle Identifier**: `com.suhelislam.deenifyapp`
- ✅ **Privacy Policy**: Document exists (`PRIVACY_POLICY.md`)
- ✅ **App Icon**: Configured

### Action Required ⚠️
- ⚠️ **Bundle Identifier**: Confirm `com.suhelislam.deenifyapp` is final and registered in App Store Connect
- ⚠️ **Privacy Policy URL**: Needs to be hosted publicly (GitHub Pages recommended)
- ⚠️ **App Store Connect**: Need to create app listing and register bundle ID

---

## 📋 Step-by-Step Preparation

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

If you don't have an Expo account, create one at [expo.dev](https://expo.dev).

### Step 3: Link Your Project to EAS

```bash
eas build:configure
```

This will:
- Verify your project is linked to Expo
- Update `eas.json` if needed
- Set up build profiles

### Step 4: Apple Developer Account Setup

**You need:**
1. **Apple Developer Program membership** ($99/year)
   - Sign up at [developer.apple.com](https://developer.apple.com)
2. **App Store Connect access**
   - Access at [appstoreconnect.apple.com](https://appstoreconnect.apple.com)

### Step 5: Register Bundle Identifier in App Store Connect

**Target bundle ID:** `com.suhelislam.deenifyapp`

**Register in App Store Connect:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Go to **Identifiers** → **App IDs**
4. Click **+** to create new
5. Select **App** and continue
6. Enter:
   - Description: Deenify
   - Bundle ID: `com.suhelislam.deenifyapp`
7. Enable capabilities: Push Notifications (if needed)
8. Register

### Step 6: Host Privacy Policy (REQUIRED)

Apple requires a publicly accessible privacy policy URL.

**Quick GitHub Pages Setup:**

```bash
# Create docs folder
mkdir -p docs

# Copy privacy policy
cp PRIVACY_POLICY.md docs/index.md

# If using git, commit and push:
# git add docs
# git commit -m "Add privacy policy for hosting"
# git push
```

**Enable GitHub Pages:**
1. Go to your repository on GitHub
2. Settings → Pages
3. Source: Deploy from branch `main` (or your default branch)
4. Folder: `/docs`
5. Save
6. Your URL will be: `https://yourusername.github.io/deenify-app/`

**Alternative:** Upload to your own website or hosting service.

### Step 7: Create App Listing in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Deenify
   - **Primary Language**: English (or your preference)
   - **Bundle ID**: Select the one you registered (`com.suhelislam.deenifyapp`)
   - **SKU**: Any unique identifier (e.g., `deenify-ios-001`)
   - **User Access**: Full Access (or Limited if working with a team)
4. Click **Create**

### Step 8: Complete App Information

In App Store Connect → Your App → App Information:

1. **Privacy Policy URL**: Add your hosted privacy policy URL
2. **Support URL**: Add support email/URL (e.g., `mailto:support@deenify.app`)
3. **Marketing URL**: (Optional) Your website
4. **Category**: 
   - Primary: Lifestyle or Reference
   - Secondary: (Optional)

### Step 9: Complete App Privacy Questionnaire

In App Store Connect → Your App → App Privacy:

**Do you collect data?** → **YES**

**Data Types Collected:**

1. **Precise Location** → **YES**
   - Purpose: **App Functionality**
   - Is this data linked to user identity? → **NO**
   - Used for tracking? → **NO**

2. **Product Interaction** (if you track app opens/features used) → **YES** (Optional)
   - Purpose: **App Functionality**
   - Linked to user? → **NO**
   - Used for tracking? → **NO**

**Note:** Based on your privacy policy, you don't track users, so answer accordingly.

### Step 10: Build Your App

**Option A: EAS Build (Recommended for Expo)**

```bash
# Build for production (TestFlight)
eas build --platform ios --profile production
```

This will:
1. Ask for Apple credentials (first time only)
2. Generate certificates and provisioning profiles automatically
3. Build your app in the cloud
4. Provide download link when complete (usually 15-30 minutes)

**Option B: Local Build with Xcode**

```bash
# Generate iOS native project
npx expo prebuild --platform ios

# Open in Xcode
open ios/Deenify.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device" or your connected device
# 2. Product → Archive
# 3. When archive completes, click "Distribute App"
# 4. Choose "App Store Connect"
# 5. Follow the distribution wizard
```

### Step 11: Submit Build to TestFlight

**If using EAS Build:**
After build completes, upload to App Store Connect:

```bash
# Submit the build you just created
eas submit --platform ios --latest
```

Or manually:
1. Download the `.ipa` file from EAS build page
2. Go to App Store Connect → Your App → TestFlight
3. Upload the `.ipa` file using Transporter app or Xcode Organizer

**If using Xcode Archive:**
The distribution wizard will upload directly to App Store Connect.

### Step 12: Wait for Processing

After upload:
1. Build appears in App Store Connect → TestFlight → Builds
2. Processing takes 10-30 minutes typically
3. You'll receive an email when processing is complete
4. Once processed, build becomes available for testing

### Step 12a: What TestFlight Shows

You’ll see one of these:

**A) “No Builds Available”**
- This is normal if you haven’t uploaded yet.
- Next action: upload your first build
```bash
eas build -p ios
```
When it finishes:
```bash
eas submit -p ios
```

**B) A build listed as “Processing”**
- Apple is processing it.
- Wait 10–60 minutes.
- No action needed.

**C) A build listed as “Ready to Test”**
- You’re ready to add testers.

### Step 13: Configure TestFlight

1. **Internal Testing**:
   - Add internal testers (up to 100)
   - Testers must be App Store Connect users
   - They can test immediately after processing

2. **External Testing** (Optional):
   - Submit for Beta App Review
   - Requires basic app information
   - Takes 24-48 hours for approval
   - Can have up to 10,000 external testers

3. **Test Information**:
   - Add "What to Test" notes
   - Add test instructions if needed

### Step 14: Invite Testers

1. Go to TestFlight → Testers
2. Add email addresses
3. Testers receive email invitation
4. They install TestFlight app from App Store
5. They install your app from TestFlight

### Step 14a: Internal Testing for Family & Friends

**Option A (Internal testers, no review delay):**
- Invite them to App Store Connect as users
- Assign a minimal role (e.g., Marketing or Developer)
- Add them to Internal Testers

**Option B (External testers, no App Store Connect access):**
- Create an External Testing group
- Submit the build for Beta App Review
- Add their emails as External Testers

---

## 🔍 Pre-Build Checklist

Before running the build command, verify:

- [ ] **Version Number**: `1.0.0` in `app.json` (looks good)
- [ ] **Bundle Identifier**: Set correctly in `app.json`
- [ ] **Build Number**: `1` in `app.json` (or auto-increment via EAS)
- [ ] **App Icon**: Present at `./assets/images/Deenify_Icon.png`
- [ ] **Entitlements**: Set to `production` ✅
- [ ] **Permissions**: All descriptions present ✅
- [ ] **EAS Config**: `eas.json` created ✅
- [ ] **Privacy Policy**: Ready to host
- [ ] **Apple Developer Account**: Active membership
- [ ] **App Store Connect**: App created, bundle ID registered

---

## 🚨 Common Issues & Solutions

### Issue: "Bundle identifier not found"
**Solution**: Register the bundle ID in App Store Connect first (Step 5)

### Issue: "Invalid provisioning profile"
**Solution**: EAS Build handles this automatically. If using Xcode, ensure your Apple Developer account is added in Xcode Preferences → Accounts.

### Issue: "Privacy policy URL not accessible"
**Solution**: Make sure the URL is publicly accessible. Test by opening in incognito/private browser.

### Issue: Build fails with certificate error
**Solution**: EAS Build manages certificates. If issues persist, try:
```bash
eas credentials
```
And check/refresh your credentials.

---

## 📝 Important Notes

1. **Bundle ID**: Once you submit to TestFlight/App Store, the bundle ID is locked and cannot be changed. Choose carefully.

2. **Version Numbers**: 
   - `version` in `app.json` = Marketing version (e.g., 1.0.0)
   - `buildNumber` = Build number (auto-incremented by EAS)

3. **TestFlight Builds**: Can submit multiple builds. Each needs a unique build number.

4. **Privacy Policy**: Must be hosted before submission. Cannot be a local file.

5. **Review Time**: 
   - TestFlight internal: Instant (after processing)
   - TestFlight external: 24-48 hours
   - App Store: 1-7 days

---

## 🎯 Quick Start Commands

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure project
eas build:configure

# 4. Build for TestFlight
eas build --platform ios --profile production

# 5. Submit to TestFlight (after build completes)
eas submit --platform ios --latest
```

---

## 📞 Next Steps After TestFlight

Once your app is tested on TestFlight:

1. **Fix any bugs** found during testing
2. **Gather feedback** from testers
3. **Prepare App Store listing**:
   - Screenshots (required for all device sizes)
   - App description
   - Keywords
   - Promotional text
4. **Submit for App Store Review**
5. **Wait for approval** (typically 1-7 days)

---

## ✅ Summary

Your app is **almost ready** for TestFlight! The main actions needed are:

1. ✅ **EAS Configuration**: Created (`eas.json`)
2. ⚠️ **Bundle ID Confirmation**: Register `com.suhelislam.deenifyapp` in App Store Connect
3. ⚠️ **Privacy Policy Hosting**: Host your privacy policy (GitHub Pages recommended)
4. ⚠️ **App Store Connect Setup**: Create app listing and register bundle ID
5. ⚠️ **Build & Submit**: Run build command and submit to TestFlight

**Estimated Time:** 2-4 hours (including App Store Connect setup and first build)

Good luck! 🚀


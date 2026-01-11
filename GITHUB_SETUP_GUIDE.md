# 📚 GitHub Setup Guide for Deenify

This guide will help you create a GitHub repository and push your Deenify app code.

## ✅ Current Status

- ✅ **Git Repository**: Already initialized (you're on `main` branch)
- ✅ **.gitignore**: Already configured properly
- ⚠️ **GitHub Repository**: Not yet created

---

## 📋 Step-by-Step Setup

### Step 1: Create GitHub Account (If Needed)

If you don't have a GitHub account yet:

1. Go to [https://github.com/join](https://github.com/join)
2. Choose a username
3. Enter your email address (you can use `suhel_islam@yahoo.co.uk`)
4. Choose a password
5. Verify your email address
6. Complete the signup process

**Already have an account?** Skip to Step 2.

---

### Step 2: Create a New Repository on GitHub

1. **Log in to GitHub**
   - Go to [https://github.com](https://github.com)
   - Log in with your account

2. **Create New Repository**
   - Click the **"+" icon** in the top-right corner
   - Select **"New repository"**

3. **Repository Settings**
   - **Repository name**: `deenify-app` (or your preferred name)
   - **Description**: "Deenify - Your Islamic Companion App" (optional)
   - **Visibility**: 
     - **Public** (recommended for open-source or portfolio)
     - **Private** (if you want to keep it private)
   - **Initialize repository**: 
     - ❌ **DO NOT** check "Add a README file"
     - ❌ **DO NOT** check "Add .gitignore" (you already have one)
     - ❌ **DO NOT** check "Choose a license" (unless you want to add one)
   - Click **"Create repository"**

4. **Copy Repository URL**
   - After creating, GitHub will show setup instructions
   - Copy the **HTTPS URL** (e.g., `https://github.com/yourusername/deenify-app.git`)
   - Or copy the **SSH URL** if you have SSH keys set up (e.g., `git@github.com:yourusername/deenify-app.git`)

---

### Step 3: Connect Your Local Repository to GitHub

**Option A: Using HTTPS (Recommended for beginners)**

```bash
# Navigate to your project directory (if not already there)
cd "/Users/suhelislam/Desktop/My Apps/Deenify App/deenify-app"

# Add the GitHub repository as a remote (replace URL with yours)
git remote add origin https://github.com/yourusername/deenify-app.git

# Verify the remote was added
git remote -v
```

**Option B: Using SSH (If you have SSH keys set up)**

```bash
git remote add origin git@github.com:yourusername/deenify-app.git
git remote -v
```

---

### Step 4: Stage and Commit Your Changes

Before pushing, you should commit your current changes:

```bash
# Check what files have changed
git status

# Stage all changes (including new files)
git add .

# Commit with a descriptive message
git commit -m "Prepare for TestFlight: Update bundle ID, privacy policy, and EAS config"

# If you want to see what will be committed first:
git status
```

**Note:** You have many modified and untracked files. Make sure to review what you're committing. The `.gitignore` file should already exclude sensitive files like:
- `node_modules/`
- `.env` files
- Build artifacts
- iOS/Android build directories

---

### Step 5: Push to GitHub

**First time pushing:**

```bash
# Push to GitHub (this will upload all your code)
git push -u origin main
```

If you're prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate a new token with `repo` scope
  - Use this token as your password

**Future pushes:**

```bash
# Just use this for future updates
git push
```

---

## 🔐 Personal Access Token Setup (If Needed)

If GitHub asks for authentication when pushing:

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name: "Deenify App Development"
4. Select scopes:
   - ✅ **repo** (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## 📝 Quick Commands Reference

```bash
# Check repository status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your commit message here"

# Push to GitHub
git push

# View remote repositories
git remote -v

# Update remote URL (if needed)
git remote set-url origin https://github.com/yourusername/deenify-app.git
```

---

## ✅ After Pushing to GitHub

Once your code is on GitHub, you can:

1. **View your code online** at `https://github.com/yourusername/deenify-app`
2. **Share your repository** with others
3. **Set up GitHub Pages** for privacy policy hosting (see next section)
4. **Track issues and changes** over time
5. **Build confidence with Apple reviewers** (having source code on GitHub looks professional)

---

## 🌐 Next: Set Up GitHub Pages for Privacy Policy

After your code is on GitHub, you can host your privacy policy using GitHub Pages:

1. Create a `docs` folder in your repository
2. Copy `PRIVACY_POLICY.md` to `docs/index.md`
3. Push to GitHub
4. Enable GitHub Pages in repository settings
5. Your privacy policy will be live at: `https://yourusername.github.io/deenify-app/`

See `TESTFLIGHT_PREPARATION_GUIDE.md` for detailed GitHub Pages setup.

---

## 🚨 Important Notes

1. **Never commit sensitive files:**
   - API keys or secrets
   - `.env` files (already in `.gitignore`)
   - Signing certificates
   - Private keys

2. **Your `.gitignore` is already configured** to exclude:
   - `node_modules/`
   - Build artifacts
   - iOS/Android build directories
   - Environment files

3. **Review before committing:**
   - Check `git status` to see what will be committed
   - Make sure no sensitive data is included

---

## 📞 Need Help?

- **GitHub Help**: [https://docs.github.com](https://docs.github.com)
- **Git Basics**: [https://git-scm.com/book](https://git-scm.com/book)

---

**Ready to push?** Follow Steps 3-5 above, and you'll have your code on GitHub in minutes! 🚀


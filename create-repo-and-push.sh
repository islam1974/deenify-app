#!/bin/bash

# Script to create GitHub repository and push code
# Make sure you're authenticated with GitHub first

echo "🚀 Deenify - GitHub Repository Setup"
echo "====================================="
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found. Creating repository..."
    gh repo create deenify-app --public --source=. --remote=origin --push
    echo ""
    echo "✅ Repository created and pushed!"
    echo "🌐 View at: https://github.com/islam1974/deenify-app"
else
    echo "❌ GitHub CLI not installed."
    echo ""
    echo "📋 Manual steps:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: deenify-app"
    echo "3. Choose Public or Private"
    echo "4. DO NOT check any boxes (no README, .gitignore, or license)"
    echo "5. Click 'Create repository'"
    echo ""
    echo "Then run: git push --set-upstream origin main"
    echo ""
    echo "💡 Tip: Install GitHub CLI for easier setup:"
    echo "   brew install gh"
    echo "   gh auth login"
fi


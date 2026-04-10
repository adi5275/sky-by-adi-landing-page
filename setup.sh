#!/usr/bin/env bash
# ══════════════════════════════════════════════════════
# Sky by Adi Aharoni — One-command full setup
# Run this AFTER GitHub auth is complete
# ══════════════════════════════════════════════════════
set -e

GH=~/bin/gh.exe
REPO_NAME="sky-by-adi-landing-page"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   SKY BY ADI — FULL SETUP            ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Create GitHub repo
echo "📦 יוצר GitHub repo..."
$GH repo create "$REPO_NAME" \
  --public \
  --description "פרוטוקול האיפוס — Sky by Adi Aharoni Landing Page" \
  --push \
  --source . 2>/dev/null || echo "repo כבר קיים, מבצע push..."

git remote set-url origin "git@github.com:$(gh api user -q .login)/$REPO_NAME.git" 2>/dev/null || true
git push origin main 2>/dev/null || true

echo "✅ GitHub: https://github.com/$(${GH} api user -q .login)/$REPO_NAME"
echo ""

# 2. Deploy to Vercel
echo "🌐 מעלה ל-Vercel..."
vercel deploy --prod --yes --name "$REPO_NAME" 2>/dev/null | tail -3

echo ""
echo "════════════════════════════════════════"
echo "✅ הכל עלה! עכשיו:"
echo "   1. חברי את הדומיין ב-vercel.com/dashboard"
echo "   2. הוסיפי CNAME אצל ספקית הדומיין:"
echo "      Host: @ | Value: cname.vercel-dns.com"
echo "════════════════════════════════════════"

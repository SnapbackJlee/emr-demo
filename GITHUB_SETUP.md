# GitHub Setup Guide for emr-mvp2

## Prerequisites
1. **Install Git**: If not already installed, download from https://git-scm.com/download/win
2. **GitHub Account**: Make sure you have a GitHub account at https://github.com

## Step-by-Step Instructions

### Step 1: Configure Git (First Time Setup)
After installing Git, open PowerShell or Command Prompt and run:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Initialize Git Repository
Navigate to your project directory and run:
```bash
cd C:\Users\justi\emr-mvp2
git init
```

### Step 3: Add Files to Git
```bash
git add .
git commit -m "Initial commit"
```

### Step 4: Create GitHub Repository
1. Go to https://github.com/new
2. Name your repository (e.g., `emr-mvp2`)
3. **Don't** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### Step 5: Connect Local Repository to GitHub

#### Option A: Using HTTPS (Easier for beginners)
```bash
git remote add origin https://github.com/YOUR_USERNAME/emr-mvp2.git
git branch -M main
git push -u origin main
```
You'll be prompted for your GitHub username and a Personal Access Token (not password).

#### Option B: Using SSH (More secure, requires setup)
1. Generate SSH key:
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```
2. Add SSH key to GitHub:
   - Copy the public key from: `C:\Users\justi\.ssh\id_ed25519.pub`
   - Go to GitHub Settings > SSH and GPG keys > New SSH key
3. Add remote and push:
```bash
git remote add origin git@github.com:YOUR_USERNAME/emr-mvp2.git
git branch -M main
git push -u origin main
```

## Creating a GitHub Personal Access Token (for HTTPS)
If using HTTPS, you'll need a token:
1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token and use it as your password when pushing

## Troubleshooting
- If Git command not found: Make sure Git is installed and terminal is restarted
- If authentication fails: Check your username/token or SSH key setup
- If push fails: Make sure the GitHub repository exists and the remote URL is correct



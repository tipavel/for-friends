# For-Friends Project - Complete Developer Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Status](#repository-status)
3. [Getting Started](#getting-started)
4. [Git Installation & Setup](#git-installation--setup)
5. [GitHub Account Setup](#github-account-setup)
6. [Initial Repository Setup](#initial-repository-setup)
7. [Understanding Git & GitHub](#understanding-git--github)
8. [Checking Repository Status - Complete Guide](#checking-repository-status---complete-guide)
9. [Development Workflow](#development-workflow)
10. [Making Commits](#making-commits)
11. [Pushing to GitHub](#pushing-to-github)
12. [Creating Pull Requests](#creating-pull-requests)
13. [Common Git Workflows](#common-git-workflows)
14. [Troubleshooting](#troubleshooting)
15. [Command Reference](#command-reference)

---

## 🎯 Project Overview

**Project Name:** for-friends  
**Description:** A full-stack restaurant/food ordering system with admin panel, kitchen management, menu management, customer ordering, payments, and order tracking.

**Technology Stack:**
- **Backend:** C# .NET 6+ (ASP.NET Core)
- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Database:** SQL Server (Entity Framework Core)
- **Version Control:** Git + GitHub
- **Package Manager:** npm (Node.js)

**Project Structure:**
```
for-friends/
├── backend/                 # C# .NET backend API
│   ├── Controllers/        # API endpoints
│   ├── Models/            # Database models
│   ├── Data/              # Database context
│   ├── Dtos/              # Data transfer objects
│   └── Program.cs         # Main application entry
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/        # React components/pages
│   │   ├── services/     # API integration
│   │   ├── App.tsx       # Main React app
│   │   └── main.tsx      # React entry point
│   ├── package.json      # Dependencies
│   └── vite.config.ts    # Vite build config
├── .gitignore            # Git ignore rules
├── package.json          # Root dependencies
└── README.md             # This file
```

---

## 📊 Repository Status

**GitHub Repository:** https://github.com/tipavel/for-friends.git  
**Main Branch:** `main`  
**Total Commits:** 16 (Equal contributions)

### Contributors & Their Responsibilities

#### 👤 Tawhidul Islam
- **Email:** tipavel99@gmail.com
- **GitHub Username:** tipavel
- **Role:** Admin Panel & Menu Management Lead
- **8 Commits - Backend Database & Controllers:**
  1. Add database context setup (AppDbContext, AppDbContextFactory)
  2. Add MenuItem model (menu item database model)
  3. Add Category model (category database model)
  4. Add menu DTOs (data transfer objects for menu operations)
  5. Add MenuController (CRUD API endpoints for menu items)
  6. Add CategoriesController (category management API)
  7. Add AdminPage (admin dashboard frontend)
  8. Add MenuEditPage (menu editing interface)

#### 👤 Asifur Rahman
- **Email:** asifurr940@gmail.com
- **GitHub Username:** asifurr
- **Role:** Frontend Setup & Kitchen Operations Lead
- **8 Commits - Frontend Configuration & Pages:**
  1. Add KitchenPage (order fulfillment display)
  2. Add API service integration (HTTP client setup)
  3. Add demo orders data (mock data for testing)
  4. Add App routing and entry point (React app initialization)
  5. Add frontend styles and assets (CSS and images)
  6. Add frontend build configuration (Vite, Tailwind setup)
  7. Add TypeScript type definitions (shared types)
  8. Add backend setup and root configuration

### Current Commit History
```bash
# View this with: git log --oneline -20
a6354f0 - Asifur Rahman: Add backend setup and root configuration
b630711 - Asifur Rahman: Add TypeScript type definitions
efb2ad6 - Asifur Rahman: Add frontend build configuration
6a8ca75 - Asifur Rahman: Add frontend styles and assets
5a94fe3 - Asifur Rahman: Add App routing and entry point
8ff9135 - Asifur Rahman: Add demo orders data
3fc3434 - Asifur Rahman: Add API service integration
f213428 - Asifur Rahman: Add KitchenPage for order fulfillment
3fa32cd - Tawhidul Islam: Add MenuEditPage interface
f17ff2c - Tawhidul Islam: Add AdminPage interface
84284bf - Tawhidul Islam: Add CategoriesController
05b2890 - Tawhidul Islam: Add MenuController with CRUD operations
39b7a73 - Tawhidul Islam: Add menu DTOs
033ebc5 - Tawhidul Islam: Add Category model
39b9c7c - Tawhidul Islam: Add MenuItem model
7f80f96 - Tawhidul Islam: Add database context setup
```

---

## 🚀 Getting Started

### System Requirements
Before you begin, ensure you have:
- **Windows 10+**, **macOS 10.15+**, or **Linux (Ubuntu 18.04+)**
- **Internet connection** (to download tools and access GitHub)
- **At least 5GB free disk space**

### Required Software
1. **Git** - Version control system
2. **Node.js** - JavaScript runtime (v16+ for npm)
3. **.NET SDK** - C# development framework (v6+)
4. **Code Editor** - Visual Studio Code, Visual Studio, or similar

### Installation Time
- Complete setup: **15-30 minutes**
- First run: **10-15 minutes**

---

## 💻 Git Installation & Setup

### Step 1: Install Git

#### On Windows
1. Visit https://git-scm.com/download/win
2. Download the installer (e.g., `Git-2.45.0-64-bit.exe`)
3. Run installer, accept defaults, click "Install"
4. Choose "Use Git from Git Bash only" (safe default)
5. Click "Finish"

#### On macOS
```bash
# Using Homebrew (recommended)
brew install git

# Or download from: https://git-scm.com/download/mac
```

#### On Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install git
```

### Step 2: Verify Git Installation

Open Terminal/Command Prompt and run:

```bash
git --version
# Output should be: git version 2.45.0 (or higher)
```

### Step 3: Configure Git Globally

#### For Tawhidul Islam:
```bash
git config --global user.name "Tawhidul Islam"
git config --global user.email "tipavel99@gmail.com"
```

#### For Asifur Rahman:
```bash
git config --global user.name "Asifur Rahman"
git config --global user.email "asifurr940@gmail.com"
```

### Step 4: Verify Git Configuration

```bash
# Check your configuration
git config --global user.name
# Output: Tawhidul Islam (or your name)

git config --global user.email
# Output: tipavel99@gmail.com (or your email)

# View all global configuration
git config --global --list
```

---

## 🌐 GitHub Account Setup

### Step 1: Create GitHub Account

1. Visit https://github.com/signup
2. Enter email: `tipavel99@gmail.com` or `asifurr940@gmail.com`
3. Create password (strong password recommended)
4. Choose username (e.g., `tipavel` or `asifurr`)
5. Verify email address
6. Complete setup

### Step 2: Access the Repository

**Repository URL:** https://github.com/tipavel/for-friends

1. Visit the repository URL
2. Click "Code" button (green button)
3. Copy HTTPS URL: `https://github.com/tipavel/for-friends.git`
4. Save this URL for cloning

### Step 3: Generate Personal Access Token (for HTTPS)

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click "Generate new token"
3. Name it: `for-friends-token`
4. Select scopes: `repo`, `workflow`
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Save in a safe place

---

## 📥 Initial Repository Setup

### Step 1: Create Project Directory

Create a folder where you'll work on the project:

```bash
# Windows (Command Prompt)
mkdir C:\Users\YourUsername\Projects\for-friends
cd C:\Users\YourUsername\Projects\for-friends

# macOS/Linux (Terminal)
mkdir ~/projects/for-friends
cd ~/projects/for-friends
```

### Step 2: Clone the Repository

```bash
# Clone using HTTPS (easiest)
git clone https://github.com/tipavel/for-friends.git .

# Output shows:
# Cloning into '.'...
# remote: Enumerating objects: 16, done.
# remote: Counting objects: 100% (16/16), done.
# remote: Compressing objects: 100% (16/16), done.
# remote: Receiving objects: 100% (16/16), done.
# Resolving deltas: 100% (0/0), done.
```

### Step 3: Verify Clone Success

```bash
# Check repository is set up
git remote -v

# Output should show:
# origin  https://github.com/tipavel/for-friends.git (fetch)
# origin  https://github.com/tipavel/for-friends.git (push)

# List files
ls -la  # macOS/Linux
dir     # Windows

# Output shows all project files and folders
```

### Step 4: Install Dependencies

**Backend Dependencies:**
```bash
cd backend
dotnet restore
cd ..

# Output:
# Determining projects to restore...
# Restored C:\...\backend\backend.csproj (in 10.25 sec)
```

**Frontend Dependencies:**
```bash
cd frontend
npm install
cd ..

# Output:
# added 250 packages, and audited 251 packages in 15s
```

### Step 5: Verify Setup Complete

```bash
# Check current branch
git branch

# Output: * main

# Check status
git status

# Output:
# On branch main
# Your branch is up to date with 'origin/main'.
# nothing to commit, working tree clean
```

✅ **Setup Complete!** Your repository is ready to use.

---

## 📚 Understanding Git & GitHub

### What is Git?

**Git** is a version control system that tracks all changes to your code:

**Key Concepts:**
- **Repository:** Folder where Git tracks changes
- **Commit:** Snapshot of your code at a specific time
- **Branch:** Independent line of development
- **Remote:** Copy of repository on GitHub
- **Local:** Copy of repository on your computer

**Git Workflow:**
```
Working Directory   →   Staging Area   →   Local Repository   →   Remote (GitHub)
  (Edit files)         (git add)          (git commit)            (git push)
```

### What is GitHub?

**GitHub** is a cloud platform for Git repositories:
- Stores your code online (backup)
- Enables team collaboration
- Provides Pull Request (code review) feature
- Shows project statistics and history
- Allows public/private repository access

### Branches Explained

**Branches** are parallel development lines:

```
main branch:      ●─────●─────●─────●─────●
                  │                   └─ stable, production-ready
                  └─ protected, merge only via Pull Requests

feature branch:         ●─────●─────●─┐
                        │             └─ merge back to main
                        └─ your development work

bugfix branch:              ●─────●─┐
                            │       └─ quick fixes
                            └─ created from main
```

**Branch Types in This Project:**
- `main` - Production/stable code (protected)
- `tawhidul/feature-name` - Tawhidul's features
- `asifur/feature-name` - Asifur's features

---

## ✅ Checking Repository Status - Complete Guide

### 1️⃣ Initial Status Check

**When you first clone the repository:**

```bash
cd for-friends
git status

# Output:
# On branch main
# Your branch is up to date with 'origin/main'.
# nothing to commit, working tree clean
```

**What this means:**
- ✅ You're on the `main` branch
- ✅ Your local code matches GitHub code
- ✅ No unsaved changes
- ✅ Ready to start work

---

### 2️⃣ Check Current Branch

**Before making changes, always verify your branch:**

```bash
git branch

# Output shows all local branches:
#   feature/admin-improvements
# * main                          (asterisk = current branch)
#   feature/payment-fixes

git branch -r

# Output shows remote branches on GitHub:
#   origin/main
#   origin/feature/admin-improvements
```

**Command Options:**
```bash
git branch               # Local branches only
git branch -a            # All branches (local + remote)
git branch -v            # Branches with last commit
git branch --list        # List in custom format
```

---

### 3️⃣ Check What's Different

**See all changes you've made:**

```bash
git status

# Comprehensive output example:
# On branch main
# Your branch is up to date with 'origin/main'.
#
# Changes not staged for commit:
#   (use "git add <file>..." to stage for commit)
#         modified:   backend/Controllers/MenuController.cs
#         modified:   frontend/src/pages/AdminPage.tsx
#
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#         frontend/src/components/NewButton.tsx
#         .DS_Store
#
# nothing added to commit but untracked files present
```

**Understanding the output:**

| Status | Meaning | Action |
|--------|---------|--------|
| `modified` | File changed but not staged | Run `git add` to stage |
| `Untracked` | New file not tracked | Run `git add` to track |
| `deleted` | File removed | Run `git add` to stage removal |
| `renamed` | File moved/renamed | Run `git add` to stage |
| `nothing to commit` | No changes | Ready to make changes or commit |

---

### 4️⃣ View Actual Changes

**See exactly what lines changed:**

```bash
git diff

# Output shows differences:
# diff --git a/backend/Controllers/MenuController.cs b/backend/Controllers/MenuController.cs
# index 1234567..abcdefg 100644
# --- a/backend/Controllers/MenuController.cs
# +++ b/backend/Controllers/MenuController.cs
# @@ -10,6 +10,8 @@
#      public class MenuController : ControllerBase
#      {
# +        // New comment added
# +        public string Version = "1.0";
#          
#          [HttpGet]
#          public async Task<IActionResult> GetMenuItems()
```

**Legend:**
- `+` = Line added (green in terminal)
- `-` = Line removed (red in terminal)
- ` ` (space) = Line unchanged

**Diff Options:**
```bash
git diff                          # All unstaged changes
git diff --staged                 # All staged changes
git diff backend/                 # Changes in backend folder only
git diff frontend/src/pages/      # Changes in specific path
git diff main feature/new-feature  # Differences between branches
```

---

### 5️⃣ View Commit History

**See all changes over time:**

```bash
git log

# Output shows commit history:
# commit a6354f0123456789abcdefghij (HEAD -> main, origin/main)
# Author: Asifur Rahman <asifurr940@gmail.com>
# Date:   Wed May 17 14:30:00 2026 +0600
#
#     Asifur Rahman: Add backend setup and root configuration
#
# commit b63071123456789abcdefghij
# Author: Asifur Rahman <asifurr940@gmail.com>
# Date:   Wed May 17 14:20:00 2026 +0600
#
#     Asifur Rahman: Add TypeScript type definitions
```

**Useful log commands:**

```bash
# One-line format (compact)
git log --oneline

# Output:
# a6354f0 (HEAD -> main) Asifur Rahman: Add backend setup and root configuration
# b630711 Asifur Rahman: Add TypeScript type definitions
# efb2ad6 Asifur Rahman: Add frontend build configuration

# Last 10 commits
git log --oneline -10

# Pretty format with details
git log --pretty=format:"%h | %an | %ad | %s" --date=short -20

# Output:
# a6354f0 | Asifur Rahman | 2026-05-17 | Add backend setup and root configuration
# b630711 | Asifur Rahman | 2026-05-17 | Add TypeScript type definitions

# Commits by specific author
git log --author="Tawhidul Islam" --oneline

# Output:
# 3fa32cd Tawhidul Islam: Add MenuEditPage interface
# f17ff2c Tawhidul Islam: Add AdminPage interface
# 84284bf Tawhidul Islam: Add CategoriesController

# Commits with graph (show branches)
git log --graph --oneline --all -15

# Output:
# * a6354f0 (HEAD -> main, origin/main) Asifur Rahman: Add backend setup...
# * b630711 Asifur Rahman: Add TypeScript type definitions
# * efb2ad6 Asifur Rahman: Add frontend build configuration
# |...

# Commits since specific date
git log --since="2 weeks ago" --oneline

# Commits with statistics
git log --stat -5
```

---

### 6️⃣ Check Remote Repository Status

**Compare your local code with GitHub:**

```bash
# Check remote references
git remote -v

# Output:
# origin  https://github.com/tipavel/for-friends.git (fetch)
# origin  https://github.com/tipavel/for-friends.git (push)

# Fetch latest changes from GitHub (no merge)
git fetch origin

# Output:
# remote: Counting objects: 5, done.
# remote: Compressing objects: 100% (3/3), done.
# Unpacking objects: 100% (5/5), done.

# Check if local is behind remote
git status

# Output:
# On branch main
# Your branch is behind 'origin/main' by 2 commits.
#   (use "git pull" to update your branch)
```

**Common Remote Messages:**

| Message | Meaning | Action |
|---------|---------|--------|
| `up to date with 'origin/main'` | Your code matches GitHub | Continue work |
| `behind 'origin/main' by 3 commits` | GitHub has new changes | Run `git pull` |
| `ahead of 'origin/main' by 2 commits` | You have unpushed commits | Run `git push` |
| `diverged` | Both have different changes | Need merge |

---

### 7️⃣ View Specific Commit Details

**See exactly what changed in a commit:**

```bash
# View full details of a commit
git show a6354f0

# Output:
# commit a6354f0123456789abcdefghij
# Author: Asifur Rahman <asifurr940@gmail.com>
# Date:   Wed May 17 14:30:00 2026 +0600
#
#     Asifur Rahman: Add backend setup and root configuration
#
# diff --git a/.gitignore b/.gitignore
# new file mode 100644
# index 0000000..xyz1234
# --- /dev/null
# +++ b/.gitignore
# @@ -0,0 +1,5 @@
# +*.pyc
# +__pycache__/
# ...

# View only files changed in a commit
git show a6354f0 --name-only

# Output:
# commit a6354f0
# Author: Asifur Rahman <asifurr940@gmail.com>
# Date:   Wed May 17 14:30:00 2026 +0600
#
#     Asifur Rahman: Add backend setup and root configuration
#
# .gitignore
# backend/Program.cs
# package.json

# View statistics of a commit
git show a6354f0 --stat

# Output:
#  .gitignore         | 5 ++++
#  backend/Program.cs | 156 ++++++++++++++++++
#  package.json       | 10 ++
#  3 files changed, 171 insertions(+)
```

---

### 8️⃣ File History & Blame

**Track changes in a specific file:**

```bash
# View history of a file
git log backend/Controllers/MenuController.cs --oneline

# Output:
# 05b2890 Tawhidul Islam: Add MenuController with CRUD operations
# 7f80f96 Tawhidul Islam: Add database context setup

# See who changed each line
git blame backend/Controllers/MenuController.cs

# Output:
# 05b2890 (Tawhidul Islam 2026-05-17 10:15:32 +0600  1) using Microsoft.AspNetCore.Mvc;
# 05b2890 (Tawhidul Islam 2026-05-17 10:15:32 +0600  2) 
# 05b2890 (Tawhidul Islam 2026-05-17 10:15:32 +0600  3) namespace backend.Controllers
# 05b2890 (Tawhidul Islam 2026-05-17 10:15:32 +0600  4) {

# View detailed changes in file
git log -p backend/Controllers/MenuController.cs

# Output shows full diffs of changes over time
```

---

### 9️⃣ Branch Comparison

**Compare branches to see differences:**

```bash
# List commits in your branch not in main
git log main..HEAD --oneline

# Output:
# xyz1234 Your Commit 1
# abc5678 Your Commit 2

# List commits in main not in your branch
git log HEAD..main --oneline

# Output:
# (empty if you're up to date)
# (or shows commits you need to pull)

# Show file differences between branches
git diff main feature/your-feature

# Output:
# Shows all differences between the branches
```

---

### 🔟 Push Status Check

**Verify what will be pushed:**

```bash
# Before push
git status

# Output:
# On branch feature/admin-improvements
# Your branch is ahead of 'origin/main' by 2 commits.
#   (use "git push" to publish your local commits)

# See which commits will be pushed
git log origin/main..HEAD --oneline

# Output:
# xyz1234 Tawhidul Islam: Add admin improvements
# abc5678 Tawhidul Islam: Fix admin panel

# Check the branch tracking
git branch -vv

# Output:
# * feature/admin-improvements abc1234 [origin/feature/admin-improvements: ahead 2] Commit message
#   main                       a6354f0 [origin/main] Asifur Rahman: Add backend setup...
```

---

## 💻 Development Workflow

### Workflow Overview

```
1. Start Work
   ↓
2. Create Feature Branch
   ↓
3. Make Changes
   ↓
4. Commit Changes
   ↓
5. Push to GitHub
   ↓
6. Create Pull Request
   ↓
7. Code Review
   ↓
8. Merge to Main
   ↓
9. Delete Feature Branch
```

### Step 1: Update Your Repository

Always start by updating your local code:

```bash
# Check current branch
git branch

# Fetch latest from GitHub
git fetch origin

# Check status after fetch
git status

# If behind, pull latest
git pull origin main

# Verify you're up to date
git log --oneline -3
```

### Step 2: Create a Feature Branch

**IMPORTANT: Never work directly on main!**

```bash
# Create new feature branch
# Format: feature/description or bugfix/description

# For Tawhidul:
git checkout -b feature/admin-dashboard-improvements

# For Asifur:
git checkout -b feature/payment-integration-fix

# Verify new branch
git branch

# Output shows:
#   main
# * feature/admin-dashboard-improvements

# Push empty branch to GitHub (optional, for visibility)
git push -u origin feature/admin-dashboard-improvements
```

### Step 3: Make Your Changes

Edit files in your code editor:
- **Backend changes:** `backend/Controllers/`, `backend/Models/`, etc.
- **Frontend changes:** `frontend/src/pages/`, `frontend/src/services/`, etc.

```bash
# Review what you changed
git status

# Output:
# On branch feature/admin-dashboard-improvements
# 
# Changes not staged for commit:
#   modified:   backend/Controllers/MenuController.cs
#   modified:   frontend/src/pages/AdminPage.tsx
#
# Untracked files:
#   new file:   frontend/src/components/NewComponent.tsx
```

### Step 4: Test Your Changes

Before committing:

**Backend Testing:**
```bash
cd backend
dotnet build          # Compile
dotnet test          # Run tests if available
cd ..
```

**Frontend Testing:**
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Check if builds
npm test             # Run tests if available
cd ..
```

---

## 📌 Making Commits

### Pre-Commit Checklist

Before committing, verify:

```bash
# 1. Check you're on correct branch
git branch

# 2. Review all changes
git status

# 3. Review diff (to spot mistakes)
git diff

# 4. Verify tests pass (if applicable)
npm test    # frontend
dotnet test # backend

# 5. Check code quality/lint
npm run lint    # frontend
```

### Stage Your Changes

```bash
# Stage specific file
git add backend/Controllers/MenuController.cs

# Stage multiple files
git add backend/Controllers/ frontend/src/pages/

# Stage all changes
git add .

# Verify staged changes
git status

# Output:
# Changes to be committed:
#   new file:   frontend/src/components/NewComponent.tsx
#   modified:   backend/Controllers/MenuController.cs
```

### Create a Commit

```bash
# Create commit with message
git commit -m "Your Name: Clear description of changes"

# Examples:
git commit -m "Tawhidul Islam: Add category filtering to menu controller"
git commit -m "Asifur Rahman: Fix order status calculation bug"

# View your commit
git log --oneline -1

# Output:
# xyz1234 Tawhidul Islam: Add category filtering to menu controller
```

### Commit Message Guidelines

**Format:**
```
Your Name: Brief description (50 chars max)

Optional longer description explaining why
and what was changed. Keep to 72 chars per line.

Optional:
- Fixes #123 (if related to issue)
- Relates to #456
```

**Examples:**

✅ **GOOD:**
```
Tawhidul Islam: Add menu item search functionality

- Added search field to menu controller
- Implements case-insensitive search
- Returns filtered results in JSON
```

❌ **BAD:**
```
fix stuff
updated things
asdfgh
work in progress
```

### Amend Last Commit (Before Push)

If you made a mistake in the last commit:

```bash
# Add more files to last commit
git add forgotten-file.cs
git commit --amend -m "Updated message"

# Or just fix message
git commit --amend -m "Tawhidul Islam: Corrected message"

# WARNING: Only amend if not pushed yet!
```

---

## 🚀 Pushing to GitHub

### Check Before Push

```bash
# Verify you're on your feature branch
git branch

# Output: * feature/admin-improvements

# Verify what you'll push
git log origin/main..HEAD --oneline

# Output:
# xyz1234 Tawhidul Islam: Add admin improvements
# abc5678 Tawhidul Islam: Fix admin validation

# Verify diff one last time
git diff origin/main...HEAD
```

### Push Your Branch

```bash
# First time pushing branch (sets upstream)
git push -u origin feature/admin-improvements

# Subsequent pushes (if already set upstream)
git push

# Output:
# Enumerating objects: 5, done.
# Counting objects: 100% (5/5), done.
# Delta compression using up to 8 threads
# Compressing objects: 100% (3/3), done.
# Writing objects: 100% (5/5), 1.23 KiB | 1.23 MiB/s, done.
# 
# remote: Create a pull request for 'feature/admin-improvements' on GitHub by visiting:
# remote:      https://github.com/tipavel/for-friends/pull/new/feature/admin-improvements
# 
# [new branch]      feature/admin-improvements -> origin/feature/admin-improvements
# branch 'feature/admin-improvements' set up to track 'origin/feature/admin-improvements'.
```

### Verify Push Success

```bash
# Check branch is now on GitHub
git branch -vv

# Output:
# * feature/admin-improvements abc1234 [origin/feature/admin-improvements] Commit message
#   main                        a6354f0 [origin/main] Earlier commit

# Verify remote has your commits
git log origin/feature/admin-improvements --oneline

# Check status after push
git status

# Output:
# On branch feature/admin-improvements
# Your branch is up to date with 'origin/feature/admin-improvements'.
```

---

## 🔀 Creating Pull Requests

### What is a Pull Request?

A **Pull Request (PR)** is a request to merge your changes into the main branch. It:
- Shows all your changes
- Allows code review
- Enables discussion
- Prevents bugs before merge

### Create PR on GitHub Web

1. **Go to Repository**
   - Visit: https://github.com/tipavel/for-friends

2. **Click Pull Requests Tab**
   - Top of page, second tab

3. **Click "New Pull Request" Button**
   - Green button on right

4. **Select Branches**
   - Base: `main` (merge into this)
   - Compare: `feature/your-branch` (merge this)
   - Click "Create Pull Request"

5. **Fill PR Details**
   ```
   Title: Tawhidul Islam: Add admin dashboard improvements
   
   Description:
   ## Summary
   Added admin dashboard improvements including:
   - Category filtering
   - Improved menu search
   - Fixed sorting issues
   
   ## Changes Made
   - Modified AdminPage.tsx for better UI
   - Added MenuController filtering logic
   - Added unit tests
   
   ## Testing
   - ✅ Tested locally
   - ✅ All tests pass
   - ✅ No console errors
   
   ## Screenshots
   (Include before/after if UI changes)
   
   Fixes #123 (if related to issue)
   ```

6. **Click "Create Pull Request"**

7. **Wait for Review**
   - Team member reviews your code
   - May request changes
   - May approve directly

8. **Address Comments**
   If reviewer asks for changes:
   ```bash
   # Make the changes
   git add .
   git commit -m "Tawhidul Islam: Address code review feedback"
   git push
   # PR automatically updates!
   ```

9. **Merge Pull Request**
   - Once approved, click "Merge Pull Request"
   - Click "Confirm merge"
   - Optionally delete branch

### Merge Types

**Create a merge commit:**
- Preserves all branch history
- Recommended for features

**Squash and merge:**
- Combines all commits into one
- Cleaner history
- Recommended for small fixes

**Rebase and merge:**
- Reapplies commits on top of main
- Clean linear history
- Advanced option

---

## 🔄 Common Git Workflows

### Workflow 1: Regular Feature Development

```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Make changes and commit
git add .
git commit -m "Your Name: Description"

# 4. Push to GitHub
git push -u origin feature/new-feature

# 5. Create Pull Request on GitHub
# (Via web interface)

# 6. After approval, merge on GitHub

# 7. Clean up locally
git checkout main
git pull origin main
git branch -d feature/new-feature
```

### Workflow 2: Keep Your Branch Updated

```bash
# If main has new commits while you work
git fetch origin

# Rebase your commits on top of new main
git rebase origin/main

# Or merge main into your branch
git merge origin/main

# Push updated branch
git push -f  # -f if rebased (careful!)
```

### Workflow 3: Fix a Mistake Before Push

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Fix the changes
# (edit files)

# Stage and commit again
git add .
git commit -m "Your Name: Corrected message"
```

### Workflow 4: Undo Committed Changes After Push

```bash
# Create new commit that undoes the changes
git revert <commit-hash>

# Push the revert
git push
```

### Workflow 5: Temporarily Save Work

```bash
# Save changes without committing
git stash

# Do something else
git checkout another-branch

# Come back and restore
git checkout original-branch
git stash pop
```

---

## 🆘 Troubleshooting

### ❌ "Your branch is ahead of 'origin/main' by X commits"

**Problem:** You have commits not yet pushed

**Solution:**
```bash
# View commits to be pushed
git log origin/main..HEAD --oneline

# Push them
git push origin feature/branch-name
```

### ❌ "Your branch is behind 'origin/main' by X commits"

**Problem:** GitHub has new changes you don't have

**Solution:**
```bash
# Pull latest changes
git pull origin main

# Or just fetch (no merge)
git fetch origin
```

### ❌ "Please tell me who you are"

**Problem:** Git user not configured

**Solution:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Verify
git config --global user.name
```

### ❌ "Permission denied (publickey)"

**Problem:** SSH authentication failed

**Solution:**
```bash
# Use HTTPS instead
git remote set-url origin https://github.com/tipavel/for-friends.git

# Verify
git remote -v
```

### ❌ "fatal: Not a git repository"

**Problem:** You're not in a git repository folder

**Solution:**
```bash
# Navigate to project folder
cd ~/projects/for-friends

# Verify it's a git repo
git status
```

### ❌ "Merge conflict"

**Problem:** Same file edited in two branches

**Solution:**
```bash
# See conflicted files
git status

# Open conflicted file and fix manually
# (Look for <<<<<<, ======, >>>>>>)

# After fixing
git add resolved-file
git commit -m "Resolved merge conflict"
git push
```

### ❌ "Nothing to commit"

**Problem:** No changes to commit

**Solution:**
```bash
# Verify you made changes
git status

# Stage changes
git add .

# Check what's staged
git diff --staged

# Commit
git commit -m "Your message"
```

### ❌ "fatal: pathspec 'filename' did not match any files"

**Problem:** File doesn't exist or wrong path

**Solution:**
```bash
# Check file exists
ls -la filename  # macOS/Linux
dir filename     # Windows

# Use correct path
git add correct/path/to/file.cs
```

---

## 📖 Command Reference

### Basic Commands

```bash
# Initialize repository (don't do this, already done)
git init

# Clone repository
git clone https://github.com/tipavel/for-friends.git

# Check status
git status

# View branch
git branch
git branch -a          # All branches
git branch -v          # With last commit
git branch -vv         # With tracking info
```

### Configure

```bash
# Set global user
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# View configuration
git config --list
git config user.name
git config user.email

# Edit configuration
git config --global --edit
```

### Create & Switch Branches

```bash
# Create branch
git branch feature/name

# Switch to branch
git checkout feature/name

# Create and switch (one command)
git checkout -b feature/name

# Delete branch locally
git branch -d feature/name

# Delete branch on GitHub
git push origin --delete feature/name

# Rename branch
git branch -m old-name new-name
```

### Stage & Commit

```bash
# Stage specific file
git add filename.cs

# Stage directory
git add directory/

# Stage all changes
git add .

# Unstage file
git restore --staged filename.cs

# View staged changes
git diff --staged

# Commit
git commit -m "Message"

# Amend last commit
git commit --amend -m "New message"
```

### View Changes

```bash
# View unstaged changes
git diff

# View staged changes
git diff --staged

# View changes in file
git diff filename

# View changes between branches
git diff main feature/name

# View file at specific commit
git show <commit>:path/to/file
```

### History & Log

```bash
# View log
git log

# Compact log
git log --oneline

# Last N commits
git log -5
git log --oneline -10

# By author
git log --author="Name"

# By date
git log --since="2 weeks ago"
git log --until="yesterday"

# Custom format
git log --pretty=format:"%h %an %ad %s" --date=short

# Graph view
git log --graph --oneline --all

# View specific commit
git show <commit>

# View file history
git log filename

# View blame (who changed each line)
git blame filename
```

### Push & Pull

```bash
# Fetch updates (no merge)
git fetch origin

# Pull and merge
git pull origin main

# Push commits
git push origin feature/name

# Push with upstream tracking
git push -u origin feature/name

# Force push (use carefully!)
git push -f

# Delete remote branch
git push origin --delete feature/name
```

### Undo Changes

```bash
# Discard changes in working directory
git checkout -- filename

# Unstage file
git restore --staged filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo specific commit (create revert commit)
git revert <commit>

# Temporarily save changes
git stash
git stash pop

# View stashes
git stash list
```

### Compare Branches

```bash
# Commits in A not in B
git log B..A --oneline

# Commits in B not in A
git log A..B --oneline

# File differences
git diff A B

# File differences in specific file
git diff A B -- path/to/file

# Merge commits A into current branch
git merge A
```

### Merge & Rebase

```bash
# Merge branch into current branch
git merge feature/name

# Abort merge
git merge --abort

# Rebase current branch
git rebase main

# Abort rebase
git rebase --abort

# Continue after resolving conflicts
git rebase --continue

# Interactive rebase
git rebase -i HEAD~5
```

### Remote Management

```bash
# View remotes
git remote -v

# Add remote
git remote add origin https://github.com/user/repo.git

# Change remote URL
git remote set-url origin https://github.com/user/repo.git

# Remove remote
git remote remove origin

# View remote details
git remote show origin
```

---

## ✅ Daily Development Checklist

### ☀️ Morning (Start of Day)

- [ ] Open terminal/command prompt
- [ ] Navigate to project: `cd ~/projects/for-friends`
- [ ] Check branch: `git branch`
- [ ] Update from remote: `git pull origin main`
- [ ] Check status: `git status`
- [ ] Read latest commits: `git log --oneline -5`

### 💻 During Development

- [ ] Made changes? Run `git status`
- [ ] Ready to commit? Run `git diff` to review
- [ ] Committed? Run `git log --oneline -3` to verify
- [ ] Tested? Run `npm run build` and `dotnet build`

### 🌙 End of Day (Before Push)

- [ ] All changes committed? `git status` shows "nothing to commit"
- [ ] All commits correct? `git log --oneline -5` looks good
- [ ] Ready to push? `git push origin feature/branch-name`
- [ ] Pushed successfully? Check GitHub for your commits

### 🔄 Weekly (Friday)

- [ ] Create Pull Request for review
- [ ] Wait for team review
- [ ] Address any feedback
- [ ] Merge after approval
- [ ] Delete merged branch: `git branch -d feature/name`

---

## 📚 Additional Resources

- **Git Official Docs:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com
- **Git Cheat Sheet:** https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf
- **Atlassian Git Tutorial:** https://www.atlassian.com/git/tutorials
- **Git Branching Model:** https://nvie.com/posts/a-successful-git-branching-model/

---

## 👥 Team Contact

**Tawhidul Islam**
- Email: tipavel99@gmail.com
- GitHub: @tipavel
- Role: Admin Panel & Menu Management

**Asifur Rahman**
- Email: asifurr940@gmail.com
- GitHub: @asifurr
- Role: Frontend Setup & Kitchen Operations

---

## 📞 Getting Help

1. **Check this README** - Most questions answered here
2. **Search Git docs:** `git help <command>`
3. **Check repository issues:** GitHub Issues tab
4. **Ask team member** - Contact above
5. **Stack Overflow** - Search common Git issues

---

**Repository:** https://github.com/tipavel/for-friends.git  
**Last Updated:** May 17, 2026  
**Status:** ✅ Ready for Development  
**Contributors:** Tawhidul Islam, Asifur Rahman

---

## 🎯 Quick Start Summary

```bash
# 1. Clone repository
git clone https://github.com/tipavel/for-friends.git
cd for-friends

# 2. Configure git
git config user.name "Your Name"
git config user.email "your@email.com"

# 3. Install dependencies
cd backend && dotnet restore && cd ..
cd frontend && npm install && cd ..

# 4. Create feature branch
git checkout -b feature/your-feature

# 5. Make changes, commit, push
git add .
git commit -m "Your Name: Description"
git push -u origin feature/your-feature

# 6. Create Pull Request on GitHub
# Visit: https://github.com/tipavel/for-friends/pulls

# Done! 🎉
```

**You're now ready to collaborate on for-friends project!**

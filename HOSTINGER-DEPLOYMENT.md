# H&R Energy CRM - Hostinger Deployment Guide

## 📋 Prerequisites

- Hostinger Business or higher plan with Node.js support
- cPanel access
- FTP/SFTP credentials (if available)
- Subdomain or domain for the CRM (e.g., portal.evereco.co.uk)

---

## 🚀 Deployment Steps

### Step 1: Check Node.js Support in Hostinger

1. Log in to **Hostinger cPanel**
2. Look for **"Node.js Manager"** or **"Application Manager"**
3. If available, Node.js is enabled ✅
4. If not available, you need to add Node.js support (paid add-on, ~$3-5/month)

---

### Step 2: Prepare the CRM for Production

1. In PowerShell (on your local machine), navigate to HNR-CRM-setup:
   ```powershell
   cd C:\Users\Mesun Raza\Downloads\HNR-CRM-complete\HNR-CRM-setup
   ```

2. Build the frontend for production:
   ```powershell
   npm run build
   ```
   This creates an optimized `frontend/build/` folder (~30-50 seconds)

3. Create a **Procfile** in the root (no extension):
   ```
   web: node backend/server.js
   ```

4. Verify these files exist:
   - `backend/server.js`
   - `package.json`
   - `Procfile`
   - `frontend/build/` folder

---

### Step 3: Upload to Hostinger

#### **Option A: Via cPanel File Manager (Recommended)**

1. Log in to **Hostinger cPanel**
2. Click **"File Manager"**
3. Navigate to your subdomain folder (e.g., `portal.evereco.co.uk`)
4. **Delete all existing files** in that folder (the old portal)
5. Upload the following from your local machine:
   - `backend/` folder (entire folder with all files)
   - `frontend/build/` folder (entire folder)
   - `package.json`
   - `Procfile`
   - `package-lock.json`

#### **Option B: Via FTP (If you have FTP credentials)**

1. Download **FileZilla** (free FTP client from filezilla-project.org)
2. Connect using Hostinger FTP credentials:
   - Host: Your Hostinger FTP address
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
3. Navigate to your subdomain folder on the server
4. Delete all existing files
5. Upload all CRM files

---

### Step 4: Install Dependencies on Hostinger

1. In **Hostinger cPanel**, go to **"Terminal"** (or SSH if available)
2. Navigate to your subdomain:
   ```bash
   cd /home/username/public_html/portal.evereco.co.uk
   ```
   (Replace `username` with your Hostinger username)

3. Install dependencies:
   ```bash
   npm install
   ```
   This downloads all required packages (~2-3 minutes)

4. Verify packages installed:
   ```bash
   ls node_modules
   ```

---

### Step 5: Start the Application

In the same terminal, start the app using one of these methods:

**Method A: Terminal Command (Simple)**
```bash
npm start
```

**Method B: Node.js Manager (Recommended for Hostinger)**

1. Go back to cPanel
2. Click **"Node.js Manager"**
3. Click **"Create Application"**
4. Fill in:
   - **Application name:** "H&R-CRM"
   - **Node.js version:** 18.x or higher
   - **Application root:** `/portal.evereco.co.uk`
   - **Entry point file:** `backend/server.js`
   - **Application URL:** `portal.evereco.co.uk`
5. Click **"Create Application"**
6. Note the port assigned (usually 3000 or custom)
7. Click **"Start Application"**

---

### Step 6: Configure Proxy (If needed)

If your domain doesn't automatically route to the app:

1. In **cPanel** → **"Addon Domains"** or **"Subdomains"**
2. Make sure `portal.evereco.co.uk` is configured
3. It should point to the application root

---

### Step 7: Access Your CRM

Your H&R CRM is now live at:

```
https://portal.evereco.co.uk
```

Share this link with your office staff!

---

## 👤 Login Credentials

| Email | Password | Role |
|-------|----------|------|
| riaz@hnrenergy.co.uk | admin123 | Administrator |
| mudassir@hnrenergy.co.uk | user123 | Sales Staff |
| hassan@hnrenergy.co.uk | user123 | Sales Staff |

---

## 🔧 Important Configuration

### Change Admin Password (First Login)

1. Log in with riaz@hnrenergy.co.uk / admin123
2. Go to **"Manage Users"**
3. Click **"Edit"** next to Riaz
4. Change password to something strong
5. Save

### Database

The CRM uses **SQLite** (file-based database), which:
- ✅ Requires no setup
- ✅ Auto-creates on first run
- ✅ Data persists in `backend/crm.db`
- ✅ Automatic backups recommended

For production, consider upgrading to **MySQL** (available in Hostinger):
- Scroll to Step 9 below

---

## 📊 Using HES Eligibility Assessment

1. **Open a lead** from the Leads page
2. Click **"HES Eligibility"** tab
3. Answer the questionnaire (Yes/No/Not Sure options)
4. System automatically calculates eligibility
5. Click **"Save HES Eligibility Assessment"**
6. Results saved permanently against that lead

---

## 🔄 Updating the CRM

When I provide updates:

1. Download the new ZIP file
2. Extract to a new folder on your local machine
3. Follow **Steps 2-4** above (build → upload → install)
4. Keep your subdomain pointed to the new files
5. Existing leads and data remain unchanged

---

## ⚠️ Troubleshooting

### "Application not starting"
- Check cPanel terminal for errors
- Verify all files uploaded correctly
- Ensure `package.json` and `backend/server.js` exist
- Try restarting the application in Node.js Manager

### "Port already in use"
- Go to Node.js Manager
- Stop any running applications
- Wait 30 seconds
- Start again

### "Database locked"
- Delete `backend/crm.db`
- Application will recreate it on next start
- **You will lose existing data** - avoid if possible

### "Module not found"
- Verify `npm install` ran successfully
- Check for errors in terminal
- Delete `node_modules/` folder and run `npm install` again

---

## 📞 Support

For issues:
1. Check Hostinger cPanel logs
2. Check application terminal output
3. Verify all files uploaded
4. Contact Hostinger support for hosting-specific issues

---

## 🎯 Summary

Your H&R Energy CRM is now:
- ✅ **Live on your domain** (portal.evereco.co.uk)
- ✅ **Accessible 24/7** (no need to keep computer on)
- ✅ **Professional setup** (proper business deployment)
- ✅ **Ready for your team** (Riaz, Mudassir, Hassan can log in)
- ✅ **HES Eligibility ready** (comprehensive assessment tool)

**Enjoy your new CRM! 🚀**

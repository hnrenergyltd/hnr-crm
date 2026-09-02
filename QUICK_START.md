# ⚡ Quick Start — HNR CRM

## What You Need

- **Node.js** (version 16 or higher)
  - Download from: https://nodejs.org/
  - Check if installed: `node --version`

## Setup (One Time Only)

### Step 1: Prepare Your Computer

1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Navigate to where you want to install the CRM
3. Run these commands:

```bash
git clone https://github.com/ecommercewithhassan123-rgb/HNR-CRM-.git
cd HNR-CRM
npm run install-all
```

**This may take 3-5 minutes to download dependencies.**

## Running the CRM

Every time you want to use the CRM:

### From Terminal/Command Prompt:

```bash
cd HNR-CRM
npm start
```

Wait for the message:
```
✓ Compiled successfully!
```

Then it will automatically open in your browser at:
```
http://localhost:3000
```

## Login Credentials

**Admin Account (Full Access):**
- Email: `admin@hnrenergy.co.uk`
- Password: `admin123`

**Sales Staff Account:**
- Email: `sarah@hnrenergy.co.uk`
- Password: `user123`

## Demo Data Included

The system comes with sample leads so you can see it in action immediately. All demo data is pre-populated.

## Stopping the CRM

Press `Ctrl+C` in the terminal to stop the CRM.

## Need Help?

**Port Error (address already in use)?**
- Close other applications using ports 3000 or 5000
- Or restart your computer

**Dependencies won't install?**
```bash
npm cache clean --force
npm run install-all
```

**Want to reset to demo data?**
- Delete the file `backend/crm.db`
- Restart the CRM

## Next Time

Just run:
```bash
cd HNR-CRM
npm start
```

That's it! ✨

# HNR Energy Solutions CRM

A complete Customer Relationship Management system for managing Home Energy Scotland leads through the sales and installation process.

## Features

- ✅ **Lead Management** - Track leads from first contact through completion
- ✅ **HES Pre-Screening** - Quick eligibility assessment for Home Energy Scotland funding
- ✅ **Today's Tasks** - Daily task management and follow-up reminders
- ✅ **Handover Pack** - Document management for customer handover
- ✅ **User Management** - Admin controls for team management
- ✅ **Demo Data** - Pre-loaded sample data to explore the system

## Tech Stack

- **Frontend**: React 18
- **Backend**: Express.js (Node.js)
- **Database**: SQLite (local file-based)
- **Authentication**: JWT

## Quick Start

### Step 1: Install Dependencies

Run this command in the project root folder:

```bash
npm run install-all
```

This will install all required packages for both the frontend and backend.

### Step 2: Start the CRM

Run this command in the project root folder:

```bash
npm start
```

This will start both the backend server (port 5000) and frontend app (port 3000) simultaneously.

### Step 3: Open in Browser

Wait for the browser to open automatically, or navigate to:

```
http://localhost:3000
```

## Demo Credentials

The system comes with demo data pre-loaded. Login with:

**Administrator:**
- Email: `admin@hnrenergy.co.uk`
- Password: `admin123`

**Sales Staff:**
- Email: `sarah@hnrenergy.co.uk`
- Password: `user123`

**Additional Staff:**
- Email: `mike@hnrenergy.co.uk`
- Password: `user123`

## Project Structure

```
HNR-CRM/
├── frontend/              # React frontend app
│   ├── public/           # Static files
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   └── package.json
│
├── backend/              # Express backend server
│   ├── server.js        # Main server file
│   ├── crm.db          # SQLite database (created on first run)
│   └── package.json
│
├── package.json         # Root package.json
└── README.md           # This file
```

## How to Use

### Login
- Use the demo credentials above to log in
- Each user can see leads assigned to them

### View Dashboard
- See key statistics (new leads, hot leads, HES status)
- Quick access to leads, tasks, and admin panels

### Add a Lead
- Click "Add New Lead" on the dashboard or leads page
- Enter customer contact information
- Lead source is recorded automatically

### Manage Leads
- Click any lead to see full details
- Edit lead information
- Check HES pre-screening status
- View/manage handover pack documents

### Today's Tasks
- View all tasks due today
- Separate sections for overdue, today, and upcoming tasks
- Click any task to open the lead

### Admin Users
- Manage team members (admin only)
- Add or remove users
- Assign roles (Sales Staff or Administrator)

## Database

The database file (`crm.db`) is stored in the `backend` folder and is created automatically on first run. It includes:

- **Users**: Team members and their roles
- **Leads**: Customer information and status
- **HES Screening**: Eligibility assessment data
- **Next Actions**: Task/reminder management
- **Handover Packs**: Document tracking
- **Audit Log**: System activity tracking

## Troubleshooting

**Port already in use?**
- Backend uses port 5000
- Frontend uses port 3000
- If ports are in use, stop other applications

**Dependencies won't install?**
- Make sure you have Node.js 16+ installed
- Delete node_modules folders and try again
- Run `npm cache clean --force`

**Database issues?**
- The database file is in `backend/crm.db`
- Delete it to reset to demo data
- It will be recreated on next run

## Next Steps

1. Explore the demo data to understand the workflow
2. Test logging in as different user types
3. Add your own leads and manage them
4. Check out the HES screening section
5. Try the Today's Tasks feature

## Support

For issues or questions, check the backend logs in the terminal where you ran `npm start`.

---

Built with ❤️ for HNR Energy Solutions

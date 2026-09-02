const fs = require('fs');
const path = require('path');

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'your_secret_key_change_in_production';

// Setup file upload
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Serve React Frontend
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Serving React frontend from:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
}

// SQLite Database
const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Database
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Users table error:', err);
      else console.log('✅ Users table ready');
    });

    // Leads table
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      postcode TEXT,
      lead_source TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'new',
      potential_level TEXT DEFAULT 'none',
      interested_measures TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Leads table error:', err);
      else console.log('✅ Leads table ready');
    });

    // HES Screening table
    db.run(`CREATE TABLE IF NOT EXISTS hes_screening (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      scotland INTEGER,
      homeowner INTEGER,
      main_residence INTEGER,
      interested_measures TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    )`, (err) => {
      if (err) console.error('HES Screening table error:', err);
      else console.log('✅ HES Screening table ready');
    });

    // Handover Documents table
    db.run(`CREATE TABLE IF NOT EXISTS handover_documents (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      document_type TEXT,
      file_name TEXT,
      file_path TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      uploaded_by TEXT,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    )`, (err) => {
      if (err) console.error('Handover Documents table error:', err);
      else console.log('✅ Handover Documents table ready');
    });

    // Activity Timeline table
    db.run(`CREATE TABLE IF NOT EXISTS activity_timeline (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      user_email TEXT,
      action TEXT,
      old_value TEXT,
      new_value TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    )`, (err) => {
      if (err) console.error('Activity Timeline table error:', err);
      else console.log('✅ Activity Timeline table ready');
    });

    // Next Actions table
    db.run(`CREATE TABLE IF NOT EXISTS next_actions (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      action TEXT NOT NULL,
      due_date DATETIME,
      assigned_to TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    )`, (err) => {
      if (err) console.error('Next Actions table error:', err);
      else console.log('✅ Next Actions table ready');
    });

    // HES Eligibility table
    db.run(`CREATE TABLE IF NOT EXISTS hes_eligibility (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      answers TEXT,
      eligibility TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id)
    )`, (err) => {
      if (err) console.error('HES Eligibility table error:', err);
      else console.log('✅ HES Eligibility table ready');
    });

    // Seed demo data only if empty
    //setTimeout(() => seedDemoData(), 500);
  });
}

// Seed Demo Data
function seedDemoData() {
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }
    
    if (row && row.count === 0) {
      console.log('🌱 Seeding demo data...');
      
      const adminPass = bcrypt.hashSync('admin123', 10);
      const userPass = bcrypt.hashSync('user123', 10);
      
      const users = [
        { id: uuidv4(), name: 'Riaz', email: 'riaz@hnrenergy.co.uk', password: adminPass, role: 'admin' },
        { id: uuidv4(), name: 'Mudassir', email: 'mudassir@hnrenergy.co.uk', password: userPass, role: 'user' },
        { id: uuidv4(), name: 'Hassan', email: 'hassan@hnrenergy.co.uk', password: userPass, role: 'user' }
      ];

      users.forEach(user => {
        db.run(
          `INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [user.id, user.name, user.email, user.password, user.role]
        );
      });

      const leads = [
        { name: 'Jane Smith', phone: '0141 123 4567', email: 'jane@example.com', postcode: 'G5 2LF', status: 'new', potential: 'high_potential', measures: 'Air Source Heat Pump,Loft Insulation' },
        { name: 'Mike Brown', phone: '0141 234 5678', email: 'mike@example.com', postcode: 'G3 8QQ', status: 'callback', potential: 'potential', measures: 'Solar Panels' },
        { name: 'Emma Davis', phone: '0141 345 6789', email: 'emma@example.com', postcode: 'G2 1RP', status: 'survey_booked', potential: 'very_high_potential', measures: 'Heat Pump,Insulation' },
        { name: 'John Wilson', phone: '0131 123 4567', email: 'john@example.com', postcode: 'EH8 8DX', status: 'survey_complete', potential: 'high_potential', measures: 'Boiler Replacement' },
        { name: 'Sarah Thompson', phone: '0131 234 5678', email: 'sarah@example.com', postcode: 'EH7 5AA', status: 'quote_sent', potential: 'potential', measures: 'Loft Insulation' },
        { name: 'David Miller', phone: '0141 456 7890', email: 'david@example.com', postcode: 'G61 2QQ', status: 'awaiting_hes', potential: 'none', measures: 'Air Source Heat Pump' },
        { name: 'Lisa Anderson', phone: '0141 567 8901', email: 'lisa@example.com', postcode: 'G12 0XQ', status: 'hes_approved', potential: 'high_potential', measures: 'Heat Pump,Solar' },
        { name: 'Robert Taylor', phone: '0131 345 6789', email: 'robert@example.com', postcode: 'EH5 2AB', status: 'installation_booked', potential: 'potential', measures: 'Cavity Wall Insulation' },
        { name: 'Caroline White', phone: '0141 678 9012', email: 'caroline@example.com', postcode: 'G45 9AQ', status: 'installed', potential: 'high_potential', measures: 'Air Source Heat Pump' },
        { name: 'Thomas Clark', phone: '0131 456 7890', email: 'thomas@example.com', postcode: 'EH3 6TG', status: 'handover', potential: 'very_high_potential', measures: 'Heat Pump,Loft Insulation' },
        { name: 'Victoria Martin', phone: '0141 789 0123', email: 'victoria@example.com', postcode: 'G4 0DH', status: 'completed', potential: 'none', measures: 'Solar Panels' },
        { name: 'James Lewis', phone: '0131 567 8901', email: 'james@example.com', postcode: 'EH9 2TR', status: 'dead_lost', potential: 'none', measures: 'Heat Pump' }
      ];

      leads.forEach(lead => {
        const leadId = uuidv4();
        const now = new Date().toISOString();
        db.run(
          `INSERT INTO leads (id, name, phone, email, address, postcode, lead_source, priority, status, potential_level, interested_measures, notes, created_at, created_by, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [leadId, lead.name, lead.phone, lead.email, '', lead.postcode, 'Direct', 'Medium Priority', lead.status, lead.potential, lead.measures, '', now, 'system', now]
        );
      });

      console.log('✅ Demo data seeded successfully');
    }
  });
}

// Authenticate Token Middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ============ AUTH ENDPOINTS ============

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// ============ LEADS ENDPOINTS ============

app.get('/api/leads', authenticateToken, (req, res) => {
  db.all('SELECT * FROM leads ORDER BY created_at DESC', (err, leads) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(leads || []);
  });
});

app.get('/api/leads/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM leads WHERE id = ?', [req.params.id], (err, lead) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  });
});

app.post('/api/leads', authenticateToken, (req, res) => {
  const { name, phone, email, address, postcode, lead_source, priority, status, potential_level, interested_measures, notes } = req.body;
  const leadId = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO leads (id, name, phone, email, address, postcode, lead_source, priority, status, potential_level, interested_measures, notes, created_at, created_by, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [leadId, name, phone, email, address, postcode, lead_source, priority, status, potential_level, interested_measures, notes, now, req.user.email, now],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: leadId, message: 'Lead created successfully' });
    }
  );
});

app.put('/api/leads/:id', authenticateToken, (req, res) => {
  const { name, phone, email, address, postcode, lead_source, priority, status, potential_level, interested_measures, notes } = req.body;
  const now = new Date().toISOString();

  db.run(
    `UPDATE leads SET name=?, phone=?, email=?, address=?, postcode=?, lead_source=?, priority=?, status=?, potential_level=?, interested_measures=?, notes=?, updated_at=? WHERE id=?`,
    [name, phone, email, address, postcode, lead_source, priority, status, potential_level, interested_measures, notes, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Lead updated successfully' });
    }
  );
});

app.delete('/api/leads/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM leads WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Lead deleted successfully' });
  });
});

// ============ HES SCREENING ENDPOINTS ============

app.post('/api/leads/:id/hes-screening', authenticateToken, (req, res) => {
  const { scotland, homeowner, main_residence, interested_measures } = req.body;
  const screeningId = uuidv4();

  db.run(
    `INSERT INTO hes_screening (id, lead_id, scotland, homeowner, main_residence, interested_measures) VALUES (?, ?, ?, ?, ?, ?)`,
    [screeningId, req.params.id, scotland ? 1 : 0, homeowner ? 1 : 0, main_residence ? 1 : 0, interested_measures],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: screeningId, message: 'HES screening saved' });
    }
  );
});

app.get('/api/leads/:id/hes-screening', authenticateToken, (req, res) => {
  db.get('SELECT * FROM hes_screening WHERE lead_id = ?', [req.params.id], (err, screening) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(screening || {});
  });
});

// ============ HANDOVER PACK ENDPOINTS ============

app.post('/api/leads/:id/handover/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const docId = uuidv4();
  const document_type = req.body.document_type || 'Other';

  db.run(
    `INSERT INTO handover_documents (id, lead_id, document_type, file_name, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`,
    [docId, req.params.id, document_type, req.file.originalname, `/uploads/${req.file.filename}`, req.user.email],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Document uploaded successfully', file_path: `/uploads/${req.file.filename}` });
    }
  );
});

app.get('/api/leads/:id/handover/documents', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM handover_documents WHERE lead_id = ? ORDER BY uploaded_at DESC', [id], (err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs || []);
  });
});

app.delete('/api/leads/:leadId/handover/documents/:docId', authenticateToken, (req, res) => {
  const { docId } = req.params;
  
  db.get('SELECT file_path FROM handover_documents WHERE id = ?', [docId], (err, doc) => {
    if (err || !doc) return res.status(404).json({ error: 'Document not found' });

    db.run('DELETE FROM handover_documents WHERE id = ?', [docId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Document deleted successfully' });
    });
  });
});

// ============ DASHBOARD STATS ============

app.get('/api/dashboard-stats', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM leads WHERE status = 'new') as new_leads,
      (SELECT COUNT(*) FROM leads WHERE potential_level IN ('high_potential', 'very_high_potential')) as high_potential_leads,
      (SELECT COUNT(*) FROM leads WHERE status = 'survey_complete') as surveys_completed,
      (SELECT COUNT(*) FROM leads WHERE status = 'awaiting_hes') as awaiting_hes,
      (SELECT COUNT(*) FROM leads WHERE status = 'hes_approved') as hes_approved,
      (SELECT COUNT(*) FROM leads WHERE status = 'survey_booked') as survey_booked,
      (SELECT COUNT(*) FROM leads WHERE status = 'quote_sent') as quotes_awaiting
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows[0] || {});
  });
});

// ============ USERS ENDPOINTS ============

app.get('/api/users', authenticateToken, (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users || []);
  });
});

// ============ PIPELINE COUNTS ============

app.get('/api/pipeline-counts', authenticateToken, (req, res) => {
  db.all(`
    SELECT
      (SELECT COUNT(*) FROM leads) as all_leads,
      (SELECT COUNT(*) FROM leads WHERE status = 'new') as new_leads,
      (SELECT COUNT(*) FROM leads WHERE status = 'callback') as callback,
      (SELECT COUNT(*) FROM leads WHERE status = 'survey_booked') as survey_booked,
      (SELECT COUNT(*) FROM leads WHERE status = 'survey_complete') as survey_complete,
      (SELECT COUNT(*) FROM leads WHERE status = 'quote_sent') as quote_sent,
      (SELECT COUNT(*) FROM leads WHERE status = 'awaiting_hes') as awaiting_hes,
      (SELECT COUNT(*) FROM leads WHERE status = 'hes_approved') as hes_approved,
      (SELECT COUNT(*) FROM leads WHERE status = 'installed') as installed,
      (SELECT COUNT(*) FROM leads WHERE status = 'handover') as handover,
      (SELECT COUNT(*) FROM leads WHERE status = 'completed') as completed,
      (SELECT COUNT(*) FROM leads WHERE status = 'dead_lost') as dead_lost,
      (SELECT COUNT(*) FROM leads WHERE potential_level IN ('high_potential', 'very_high_potential')) as high_potential
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows[0] || {});
  });
});

// React Frontend Fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ CRM Backend running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err);
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Next Actions Endpoint
app.get('/api/next-actions/today', authenticateToken, (req, res) => {
  db.all(
    `SELECT 
      id,
      lead_id,
      action,
      due_date,
      assigned_to,
      status,
      notes
    FROM next_actions
    ORDER BY due_date ASC
    LIMIT 20`,
    (err, tasks) => {
      if (err) return res.json({ tasks: [], overdue_tasks: 0, due_today: 0, upcoming: 0 });
      res.json({
        tasks: tasks || [],
        overdue_tasks: 0,
        due_today: 0,
        upcoming: 0
      });
    }
  );
});

// ============ HES ELIGIBILITY ENDPOINTS ============

app.post('/api/leads/:id/hes-eligibility', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { answers, eligibility } = req.body;

  db.get('SELECT id FROM hes_eligibility WHERE lead_id = ?', [id], (err, existingRecord) => {
    if (existingRecord) {
      db.run(
        `UPDATE hes_eligibility SET answers = ?, eligibility = ?, updated_at = CURRENT_TIMESTAMP WHERE lead_id = ?`,
        [JSON.stringify(answers), JSON.stringify(eligibility), id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'HES Eligibility assessment updated successfully' });
        }
      );
    } else {
      db.run(
        `INSERT INTO hes_eligibility (id, lead_id, answers, eligibility, created_at, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [uuidv4(), id, JSON.stringify(answers), JSON.stringify(eligibility)],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'HES Eligibility assessment saved successfully' });
        }
      );
    }
  });
});

app.get('/api/leads/:id/hes-eligibility', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT answers, eligibility FROM hes_eligibility WHERE lead_id = ?', [id], (err, record) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!record) return res.json({});
    
    res.json({
      answers: record.answers ? JSON.parse(record.answers) : {},
      eligibility: record.eligibility ? JSON.parse(record.eligibility) : null
    });
  });
});
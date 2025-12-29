const express = require('express');
const path = require('path');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 8080;
const DB_PATH = path.join(__dirname, 'hostmaster.db');

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// --- 1. MIME Type Fix Middleware ---
// Ensures browsers interpret .tsx files as JavaScript modules
app.use((req, res, next) => {
    const ext = path.extname(req.url);
    if (ext === '.tsx' || ext === '.ts') {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    }
    next();
});

// --- 2. Static File Serving ---
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath);
        // Double-check headers for static files
        if (ext === '.tsx' || ext === '.ts') {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        }
    },
    index: 'index.html'
}));

// --- 3. Robust Database Connection ---
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ SQLite Database connected at:', DB_PATH);
        // Enable WAL mode for better concurrency (prevents "database locked" errors)
        db.run('PRAGMA journal_mode = WAL;', (err) => {
            if (err) console.warn('⚠️ Could not set WAL mode:', err.message);
        });
    }
});

// Initialize Schema from file if needed, or inline
const initDb = () => {
    // Try to read schema.sql if it exists, otherwise use inline defaults
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) console.error('Error executing schema.sql:', err.message);
            else console.log('✅ Schema loaded from schema.sql');
        });
    } else {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS records (
                id TEXT PRIMARY KEY,
                serialNumber INTEGER,
                clientName TEXT,
                website TEXT,
                email TEXT,
                phone TEXT,
                storageGB INTEGER,
                setupDate TEXT,
                validationDate TEXT,
                amount REAL,
                status TEXT,
                invoiceNumber TEXT,
                invoiceDate TEXT,
                paymentStatus TEXT,
                invoiceStatus TEXT,
                paymentMethod TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT)`);
        });
    }
};

initDb();

// --- 4. API Routes ---

app.get('/api/records', (req, res) => {
    db.all("SELECT * FROM records ORDER BY serialNumber DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.post('/api/records', (req, res) => {
    const r = req.body;
    const stmt = db.prepare(`INSERT INTO records (id, serialNumber, clientName, website, email, phone, storageGB, setupDate, validationDate, amount, status, invoiceNumber, invoiceDate, paymentStatus, invoiceStatus, paymentMethod) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    stmt.run(r.id, r.serialNumber, r.clientName, r.website, r.email, r.phone, r.storageGB, r.setupDate, r.validationDate, r.amount, r.status, r.invoiceNumber, r.invoiceDate, r.paymentStatus, r.invoiceStatus, r.paymentMethod, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
    stmt.finalize();
});

app.put('/api/records/:id', (req, res) => {
    const r = req.body;
    db.run(`UPDATE records SET clientName=?, website=?, email=?, phone=?, storageGB=?, setupDate=?, validationDate=?, amount=?, status=?, invoiceNumber=?, invoiceDate=?, paymentStatus=?, invoiceStatus=?, paymentMethod=? WHERE id=?`, 
        [r.clientName, r.website, r.email, r.phone, r.storageGB, r.setupDate, r.validationDate, r.amount, r.status, r.invoiceNumber, r.invoiceDate, r.paymentStatus, r.invoiceStatus, r.paymentMethod, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete('/api/records/:id', (req, res) => {
    db.run("DELETE FROM records WHERE id=?", req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/settings', (req, res) => {
    db.get("SELECT data FROM settings WHERE id=1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row ? JSON.parse(row.data) : null);
    });
});

app.post('/api/settings', (req, res) => {
    const data = JSON.stringify(req.body);
    db.run("INSERT OR REPLACE INTO settings (id, data) VALUES (1, ?)", [data], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/send-email', async (req, res) => {
    const { to, subject, body, config } = req.body;
    try {
        let transporter = nodemailer.createTransport({
            host: config.smtpHost, 
            port: config.smtpPort, 
            secure: config.smtpEncryption === 'SSL/TLS',
            auth: { user: config.smtpUser, pass: config.smtpPass },
            tls: { rejectUnauthorized: false }
        });
        await transporter.sendMail({ from: `"${config.senderName}" <${config.senderEmail}>`, to, subject, text: body });
        res.json({ success: true });
    } catch (error) { 
        console.error("SMTP Error:", error);
        res.status(500).json({ error: error.message }); 
    }
});

// --- 5. Catch-All for SPA ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HostMaster Server active on port ${PORT}`);
});
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'error-log.json');

/* ===========================
   PASTIKAN FOLDER ADA
=========================== */
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

/* ===========================
   PASTIKAN FILE ADA
=========================== */
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, JSON.stringify([], null, 2));
}

/* ===========================
   SIMPAN ERROR
=========================== */
function saveError(errorData) {

    let logs = [];

    try {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (err) {
        logs = [];
    }

    logs.push({
        time: new Date().toISOString(),
        file: errorData.file || 'unknown',
        message: errorData.message || 'unknown error',
        stack: errorData.stack || null
    });

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

module.exports = {
    saveError
};
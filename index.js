const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const os = require('os');

// Create an instance of Express
const app = express();
const port = 5000;

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store uploaded files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep the original file name
    }
});

const upload = multer({ storage: storage });

// Create the uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Route for uploading and extracting ZIP file
app.post('/upload', upload.single('zipFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const zipFilePath = path.join(__dirname, 'uploads', req.file.filename);
    const downloadFolder = path.join(os.homedir(), 'Downloads');
    const outputFolder = path.join(downloadFolder, 'extracted');

    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    // Extract the ZIP file
    try {
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(outputFolder, true);
        console.log(`Extracted files to: ${outputFolder}`);
        res.send('File extracted successfully!');
    } catch (error) {
        console.error('Error extracting ZIP file:', error);
        res.status(500).send('Error extracting ZIP file.');
    }
});

// Render the HTML page on server start
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

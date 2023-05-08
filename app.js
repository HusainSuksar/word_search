const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/upload', upload.array('files'), (req, res) => {
  const files = req.files;
  
  if (!files) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }
  
  const fileNames = files.map((file) => file.filename);
  
  res.json({
    message: 'Files uploaded successfully',
    fileNames: fileNames
  });
});

app.get('/search', (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    const error = new Error('Please provide a search query');
    error.httpStatusCode = 400;
    return next(error);
  }
  
  const results = [];
  
  fs.readdirSync('uploads/').forEach((fileName) => {
    if (path.extname(fileName) === '.docx') {
      const filePath = path.join('uploads/', fileName);
      
      mammoth.extractRawText({ path: filePath })
        .then((result) => {
          const content = result.value;
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (line.includes(query)) {
              results.push({
                name: fileName,
                content: line.trim(),
                lineNumber: index + 1
              });
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
  
  setTimeout(() => {
    res.json(results);
  }, 5000);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

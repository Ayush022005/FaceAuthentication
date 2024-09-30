// app.js (Backend)
const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const port = 3000;

// Middleware for serving static files (HTML/JS)
app.use(express.static('public'));

// Encryption key and algorithm (for simplicity)
const encryptionKey = 'mySecretKey123456'; // Must be 16/24/32 chars
const algorithm = 'aes-256-cbc';

// Encryption function
function encryptModel(modelPath) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  const input = fs.createReadStream(modelPath);
  const output = fs.createWriteStream(modelPath + ".enc");

  input.pipe(cipher).pipe(output);
  return { iv: iv.toString('hex') };
}

// Endpoint to get the encrypted model
app.get("/getModel", (req, res) => {
  const modelPath = "./models/blazeface.json";
  const { iv } = encryptModel(modelPath); // Encrypt the model
  res.json({ iv, model: modelPath + ".enc" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

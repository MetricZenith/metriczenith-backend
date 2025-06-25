
// A simple Node.js backend using Express for handling CSV uploads and sending data to OpenAI

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const OpenAI = require("openai");
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    // ✅ Validate that a file was uploaded
    if (!req.file) {
      console.error('No file received in the request.');
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    fs.unlinkSync(filePath); // Delete the file after reading

    const prompt = `Analyze the following CSV marketing data and summarize key performance insights including top ads, CTR, CPA, ROAS, and any anomalies. Format it in clear, plain English:\n\n${fileContent}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a marketing analytics assistant.' },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ insights: completion.choices[0].message.content });
  } catch (err) {
    console.error('Server error during file analysis:', err);
    res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

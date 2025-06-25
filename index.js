
// A simple Node.js backend using Express for handling CSV uploads and sending data to OpenAI

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    fs.unlinkSync(filePath); // Delete the file after reading

    const prompt = `Analyze the following CSV marketing data and summarize key performance insights including top ads, CTR, CPA, ROAS, and any anomalies. Format it in clear, plain English:\n\n${fileContent}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a marketing analytics assistant.' },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ insights: completion.data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));

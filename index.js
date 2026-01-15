const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// SAP Proxy endpoint
app.post('/', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);

    // SAP API Configuration
    const username = 's23hana7';
    const password = 'Sh@rv!123$5';
    const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    const options = {
      hostname: '49.207.9.62',
      port: 44325,
      path: '/vendor/bp/create?sap-client=100',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'Accept': 'application/json'
      },
      // This ignores the SSL error for self-signed certificate
      rejectUnauthorized: false
    };

    console.log('🚀 Sending request to SAP...');

    // Make HTTPS request
    const sapRequest = https.request(options, (sapResponse) => {
      let data = '';

      sapResponse.on('data', (chunk) => {
        data += chunk;
      });

      sapResponse.on('end', () => {
        console.log('✅ SAP Response received');
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (e) {
          res.json({ error: 'Invalid JSON response', response: data });
        }
      });
    });

    sapRequest.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      res.status(500).json({ error: error.message, success: false });
    });

    sapRequest.write(payload);
    sapRequest.end();

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SAP Proxy is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SAP Proxy server running on port ${PORT}`);
});

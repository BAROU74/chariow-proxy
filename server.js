const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const CHARIOW_BASE = 'https://api.chariow.com/v1';

app.use(cors());
app.use(express.json());

app.all('/chariow/*', async (req, res) => {
  try {
    const chariowPath = req.params[0];
    const queryString = req.url.split('?')[1];
    const targetUrl = `${CHARIOW_BASE}/${chariowPath}${queryString ? '?' + queryString : ''}`;

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header manquant', data: null, errors: ['missing_auth'] });
    }

    const chariowRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    });

    const data = await chariowRes.json();
    res.status(chariowRes.status).json(data);
  } catch (err) {
    console.error('Erreur proxy Chariow:', err.message);
    res.status(502).json({
      message: 'Erreur du proxy en contactant Chariow',
      data: null,
      errors: [err.message]
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy Chariow actif. Utilise /chariow/<endpoint>' });
});

app.listen(PORT, () => {
  console.log(`Proxy Chariow démarré sur le port ${PORT}`);
});

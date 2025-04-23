require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ==================== 1INCH (ETH & BNB) ==================== //
const CHAIN_IDS = {
  ETH: 1,          // Ethereum
  BNB: 56          // BNB Chain
};

// Endpoint generico per 1inch (ETH/BNB)
app.get('/api/swap/defi', async (req, res) => {
  const { chain, from, to, amount } = req.query;
  
  if (!chain || !from || !to || !amount) {
    return res.status(400).json({ error: 'Mancano parametri: chain, from, to, amount' });
  }

  try {
    const response = await axios.get(
      `https://api.1inch.io/v5.0/${CHAIN_IDS[chain.toUpperCase()]}/quote`, 
      {
        params: { fromTokenAddress: from, toTokenAddress: to, amount },
        headers: { 'Authorization': `Bearer ${process.env['Inch_API_KEY']}` }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore 1inch',
      details: error.response?.data || error.message 
    });
  }
});

// ==================== JUPITER (SOLANA) ==================== //
// Endpoint per Solana (Lite API - NO KEY)
app.get('/api/swap/solana', async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Mancano parametri: from, to, amount' });
  }

  try {
    const response = await axios.get(
      'https://lite-api.jup.ag/v1/quote',
      { params: { inputMint: from, outputMint: to, amount } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore Jupiter API',
      details: error.response?.data || error.message 
    });
  }
});

// ==================== COINGECKO (PREZZI) ==================== //
// (Il tuo endpoint originale, migliorato)
app.get('/price', async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Mancano parametri: from, to' });
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price', 
      { params: { ids: from, vs_currencies: to } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore CoinGecko',
      details: error.response?.data || error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

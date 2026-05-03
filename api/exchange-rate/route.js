export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, to, date } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Missing required parameters: from, to' });
  }

  try {
    // Read rates from local static file (no external API calls)
    const ratesPath = new URL('../../public/rates.json', import.meta.url).pathname;
    const ratesData = JSON.parse(require('fs').readFileSync(ratesPath, 'utf8'));

    const cleanFrom = from.toUpperCase();
    const cleanTo = to.toUpperCase();

    // If same currency
    if (cleanFrom === cleanTo) {
      return res.status(200).json({ rate: 1 });
    }

    // Get rates relative to USD
    // rates.json stores: 1 unit of X = Y USD (e.g., 1 BRL = 0.18 USD)
    const fromRate = ratesData.rates[cleanFrom];
    const toRate = ratesData.rates[cleanTo];

    if (!fromRate || !toRate) {
      return res.status(400).json({
        error: `Rate ${cleanFrom}→${cleanTo} not available in rates table`,
        available: Object.keys(ratesData.rates)
      });
    }

    // Calculate cross rate: from → to = (from → USD) / (to → USD)
    // Example: BRL → ARS = (BRL→USD) / (ARS→USD) = 0.18 / 0.0012 = 150
    const rate = fromRate / toRate;
    const roundedRate = Math.round(rate * 10000) / 10000;

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json({ rate: roundedRate });
  } catch (error) {
    console.error('Exchange rate error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
  } catch (error) {
    console.error('Exchange rate proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

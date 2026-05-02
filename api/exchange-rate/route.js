export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { date, from } = req.query;

  if (!from) {
    return res.status(400).json({ error: 'Missing "from" currency' });
  }

  try {
    const apiUrl = date
      ? `https://api.exchangerate-api.com/v4/${date}/${from}`
      : `https://api.exchangerate-api.com/v4/latest/${from}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch rates' });
    }

    const data = await response.json();

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Exchange rate proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

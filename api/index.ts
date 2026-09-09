export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      success: true,
      service: 'PrimeSoul Growth Engine & AI Operating System',
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    })
  );
}

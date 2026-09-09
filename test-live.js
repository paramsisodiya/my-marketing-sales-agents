import https from 'https';

function checkEndpoint(path) {
  return new Promise((resolve) => {
    https.get(`https://my-marketing-sales-agents.vercel.app${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({ path, status: res.statusCode, body: body.substring(0, 200) });
      });
    }).on('error', (err) => {
      resolve({ path, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('Checking live deployment on Vercel...');
  const results = await Promise.all([
    checkEndpoint('/api/config'),
    checkEndpoint('/api/index'),
    checkEndpoint('/api/menus'),
    checkEndpoint('/api/referrals'),
    checkEndpoint('/'),
  ]);

  console.log(JSON.stringify(results, null, 2));
}

run();

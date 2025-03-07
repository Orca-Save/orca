import https from 'https';
import { URL } from 'url';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.PLAID_SECRET || '';
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const NEW_WEBHOOK_URL = 'https://orca-back-api.azurewebsites.net/api/plaid/webhook';
if (!PLAID_CLIENT_ID || !PLAID_SECRET || !NEW_WEBHOOK_URL) {
  console.error('Missing required environment variables: PLAID_CLIENT_ID, PLAID_SECRET, or NEW_WEBHOOK_URL');
  process.exit(1);
}

const PLAID_API_ENDPOINT = `https://${PLAID_ENV}.plaid.com/item/webhook/update`;
const endpointUrl = new URL(PLAID_API_ENDPOINT);

const accessTokens = [
];

async function updateWebhooks() {
  for (const accessToken of accessTokens) {
    const payloadData = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
      webhook: NEW_WEBHOOK_URL
    };
    const postData = JSON.stringify(payloadData);

    const options = {
      hostname: endpointUrl.hostname,
      path: endpointUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Updated item ${accessToken}:`, data);
      });
    });

    req.on('error', (error) => {
      console.error(`Error updating item ${accessToken}:`, error.message);
    });

    req.write(postData);
    req.end();
  }
}

updateWebhooks();

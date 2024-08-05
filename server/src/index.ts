import express from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

import {
  componentRoutes,
  goalRoutes,
  pageRoutes,
  plaidRoutes,
  stripeRoutes,
  transactionRoutes,
  userRoutes,
} from './routes';

const cors = require('cors');

const client = jwksClient({
  jwksUri:
    'https://orcanext.b2clogin.com/orcanext.onmicrosoft.com/B2C_1_orca_signin/discovery/v2.0/keys',
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key: any) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());
app.use((req: any, res, next) => {
  if (req.url.startsWith('/api/plaid/webhook')) {
    return next();
  }
  if (!req.headers.authorization) return res.status(401).send('Unauthorized');

  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, getKey, {}, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    req.user = decoded;
    next();
  });
});

app.use('/api/pages', pageRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stripe', stripeRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

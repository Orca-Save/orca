import express from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import path from 'path';
import {
  appleRoutes,
  componentRoutes,
  goalRoutes,
  googleRoutes,
  notificationRoutes,
  pageRoutes,
  plaidRoutes,
  stripeRoutes,
  supportRoutes,
  transactionRoutes,
  userRoutes,
} from './routes';
import './utils/appInsights';

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
const port = process.env.PORT || 5000;
app.use(
  '/.well-known',
  express.static(path.join(__dirname, 'public/.well-known'))
);

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');
const corsOptions = {
  origin: function (origin: string, callback: Function) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins?.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
const webhooks = [
  '/api/plaid/webhook',
  '/api/stripe/webhook',
  '/api/google/webhook',
  '/api/support/submitTicket',
  '/.well-known/apple-developer-merchantid-domain-association.txt',
];
app.use((req: any, res, next) => {
  if (webhooks.includes(req.url)) {
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
app.use('/api/support', supportRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/apple', appleRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

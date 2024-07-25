import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

import pagesRoutes from './routes/pageRoutes';

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

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});
app.use('/api/pages', pagesRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

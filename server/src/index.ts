import express, { Request, Response } from 'express';
import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';
import userRoutes from './routes/userRoutes';
const bearerStrategy = new BearerStrategy(
  {
    identityMetadata: `https://${process.env.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/v2.0/.well-known/openid-configuration`,
    clientID: '04111cce-6b01-4f79-9767-5769e6a02356',
    validateIssuer: false, //remove this line in production
    loggingLevel: 'info',
  },
  (token, done) => {
    return done(null, token, null);
  }
);
const app = express();
const port = 3001;

app.use(passport.initialize());
passport.use(bearerStrategy);

//remove in production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

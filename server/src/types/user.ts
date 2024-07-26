export type User = {
  aud: string;
  iss: string;
  exp: number;
  nbf: number;
  idp_access_token: string;
  given_name: string;
  family_name: string;
  name: string;
  idp: string;
  oid: string;
  sub: string;
  emails: string[];
  tfp: string;
  nonce: string;
  scp: string;
  azp: string;
  ver: string;
  iat: number;
};
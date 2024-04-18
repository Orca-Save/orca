import NextAuth, { Account, AuthOptions, Profile, User } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import { log } from "console";
import { redirect } from "next/dist/server/api-utils";
import { JWT, decode } from "next-auth/jwt";
import { ExtendedJWT, ExtendedSession } from "@/lib/session";
export const authOptions = {
  providers: [
    AzureADB2CProvider({
      idToken: true,
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_B2C_TENANT_NAME!,
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: "offline_access openid" } },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      profile,
      account,
      isNewUser,
    }: {
      token: JWT;
      user?: User;
      account?: Account;
      profile?: Profile;
      isNewUser?: boolean;
    }): Promise<ExtendedJWT> {
      if (user) {
        token.id = user.id;
      }
      let additions: {
        user?: User;
        account?: Account;
        profile?: Profile;
        isNewUser?: boolean;
      } = {};
      if (user !== undefined) {
        additions.user = user;
      }
      if (account !== undefined) {
        additions.account = account;
      }
      if (profile !== undefined) {
        additions.profile = profile;
      }
      if (isNewUser !== undefined) {
        additions.isNewUser = isNewUser;
      }

      Object.assign(token, additions);
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: ExtendedJWT;
    }): Promise<ExtendedSession> {
      if (token.user?.id) session.user.id = token.user.id;
      session.user.emails = token.profile?.emails;
      session.user.givenName = token.profile?.given_name;
      session.user.familyName = token.profile?.family_name;
      session.user.extended = true;
      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXT_AUTH_SECRET,
  },
  theme: {
    logo: "/orca.webp",
  },
} as unknown as AuthOptions;
export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

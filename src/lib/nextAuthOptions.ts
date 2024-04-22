import {
  Account,
  AuthOptions,
  Awaitable,
  Profile,
  Session,
  User,
} from "next-auth";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import { JWT } from "next-auth/jwt";
import { ExtendedJWT, ExtendedSession } from "@/lib/session";
import { AdapterUser } from "next-auth/adapters";

const authOptions: AuthOptions = {
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
      isNewUser,
    }: {
      token: JWT;
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile | undefined;
      trigger?: "signIn" | "signUp" | "update" | undefined;
      isNewUser?: boolean | undefined;
      session?: any;
    }) {
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
      if (profile !== undefined) {
        additions.profile = profile;
      }
      if (isNewUser !== undefined) {
        additions.isNewUser = isNewUser;
      }

      Object.assign(token, additions);
      return { token };
    },
    async session({
      session,
      token,
    }: { session: Session; token: JWT; user: AdapterUser } & {
      newSession: any;
      trigger: "update";
    }) {
      if (session.user === undefined) session.user = {};
      //@ts-ignore
      if (token.user?.id) session.user.id = token.user.id;
      // //@ts-ignore
      // session.user.emails = token.profile?.emails;
      // //@ts-ignore
      // session.user.givenName = token.profile?.given_name;
      // //@ts-ignore
      // session.user.familyName = token.profile?.family_name;
      // //@ts-ignore
      // session.user.extended = true;
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
};
export default authOptions;

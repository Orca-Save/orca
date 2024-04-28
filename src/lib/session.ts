import { Account, Profile, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the User type to include the groups property
export interface ExtendedUser extends User {
  groups?: string[];
  givenName?: string;
  familyName?: string;
  emails?: string[];
  extended: boolean;
}

// Extend the Session type to use the new ExtendedUser type
export interface ExtendedSession extends Session {
  user: ExtendedUser;
  account?: Account;
  profile?: Profile;
  isNewUser?: boolean;
}
export function isExtendedSession(
  session: Session | ExtendedSession
): session is ExtendedSession {
  return (
    "user" in session &&
    typeof session.user === "object" &&
    "extended" in session.user
  );
}

export interface ExtendedJWT extends JWT {
  user?: User;
  account?: Account;
  profile?: ExtendedProfile;
  isNewUser?: boolean;
}

export interface ExtendedProfile extends Profile {
  emails?: string[];
  given_name?: string;
  family_name?: string;
}

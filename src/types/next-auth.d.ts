import { DefaultSession, DefaultUser } from "next-auth";

// Extend the default User type
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
  }
}

// Extend the default JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

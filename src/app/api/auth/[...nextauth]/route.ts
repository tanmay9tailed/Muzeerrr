import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDB from "@/lib/db";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Sign-in Callback - Save user to DB
    async signIn({ user }) {
      try {
        // Connect to MongoDB
        await connectToDB();

        // Check if the user already exists
        let existingUser = await User.findOne({ email: user.email });

        // If not, create a new user
        if (!existingUser) {
          existingUser = await User.create({ email: user.email });
        }

        // Attach user ID to the session
        user.id = existingUser._id.toString();
        return true;
      } catch (error) {
        console.error("Error saving user to DB:", error);
        return false;
      }
    },

    // JWT Callback - Add user ID to token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Store userId in the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id; 
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

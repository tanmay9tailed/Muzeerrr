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
          existingUser = await User.create({
            email: user.email,
            name: user.name,
          });
        }

        // Ensure _id exists before assigning
        if (existingUser && existingUser._id) {
          user.id = existingUser._id.toString();
        } else {
          console.error("User not found or ID is undefined.");
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error saving user to DB:", error);
        return false;
      }
    },

    // JWT Callback - Add user ID to token
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id; // Store userId in the JWT token
      }
      return token;
    },

    // Session Callback - Add user ID to session
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

// Export as GET and POST to handle requests
export { handler as GET, handler as POST };

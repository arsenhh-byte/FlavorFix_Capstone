// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "../../../backend/config/db"; // Adjust path if needed
import User from "../../../backend/models/User";// Adjust path if needed

export const authOptions = {
// (Optional) If you want to use a MongoDB adapter for sessions:
// adapter: MongoDBAdapter(clientPromise),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Connect to the database
        await dbConnect();

        // 2. Find user by email
        const existingUser = await User.findOne({ email: credentials.email });
        console.log("authorize - existingUser:", existingUser);

        if (!existingUser) {
          console.log("User not found, returning null");
          return null;
        }

        // 3. Compare hashed password in DB with plaintext password from the form
        const validPassword = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );
        console.log("authorize - validPassword:", validPassword);

        if (!validPassword) {
          console.log("Wrong password, returning null");
          return null;
        }

        // 4. Return a user object for NextAuth to store in the token
        // Make sure to include isChef if you want to differentiate chefs
        console.log("authorize - returning user object");
        return {
          id: existingUser._id.toString(),
          name: existingUser.username,
          email: existingUser.email,
          isChef: existingUser.isChef || false, // include the isChef field
        };
      },
    }),
  ],

  // Use JWT for session
  session: {
    strategy: "jwt",
  },

  // Set up callbacks to attach user data (including isChef) to the JWT and session
  callbacks: {
    async jwt({ token, user }) {
      // user is populated the first time authorize() succeeds
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isChef = user.isChef; // store isChef on the token
      }
      return token;
    },
    async session({ session, token }) {
      // Expose token fields to the client session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.isChef = token.isChef; // attach isChef to session
      }
      return session;
    },
  },

  // Provide a secret for signing tokens
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
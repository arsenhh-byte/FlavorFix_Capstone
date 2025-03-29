import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "../../../backend/config/db";
import User from "../../../backend/models/User";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[nextauth] authorize start");
        await dbConnect();
        const existingUser = await User.findOne({ email: credentials.email });
        if (!existingUser) {
          console.log("[nextauth] user not found");
          return null;
        }
        const validPassword = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );
        if (!validPassword) {
          console.log("[nextauth] invalid password");
          return null;
        }
        console.log(
          "[nextauth] found user:",
          existingUser.email,
          "isChef:",
          existingUser.isChef
        );
        return {
          id: existingUser._id.toString(),
          name: existingUser.username,
          email: existingUser.email,
          isChef: existingUser.isChef || false,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isChef = user.isChef;
      }
      // Ensure isChef is always defined
      if (typeof token.isChef === "undefined") {
        token.isChef = false;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.isChef = token.isChef;
      return session;
    },
    async redirect({ baseUrl, session }) {
      if (session?.user?.isChef) {
        return baseUrl + "/chef/dashboard";
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});
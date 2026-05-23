import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        try {
          await connectDB();

          // Find existing user by googleId or email
          const existingUser = await User.findOne({
            $or: [{ googleId: profile.sub }, { email: profile.email }],
          });

          if (!existingUser) {
            // Create new user from Google profile (Google email is inherently verified)
            await User.create({
              name: profile.name || profile.given_name || profile.email.split("@")[0],
              email: profile.email,
              googleId: profile.sub,
              provider: "google",
              role: "customer",
              status: "active",
              isEmailVerified: true,
            });
          } else {
            // Block access for blocked accounts
            if (existingUser.status === "blocked") {
              return false;
            }
            // Link Google account to existing email user
            if (!existingUser.googleId) {
              await User.updateOne({ _id: existingUser._id }, { $set: { googleId: profile.sub } });
            }
          }

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return "/sign-in?error=OAuthCallback";
        }
      }
      return true;
    },

    async jwt({ token, account, profile }) {
      // Only run on initial Google sign-in (account is only available then)
      if (account?.provider === "google" && profile) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: profile.email });

          if (dbUser) {
            // Generate our custom JWT (30d to match NextAuth session)
            const customToken = jwt.sign(
              { id: dbUser._id, email: dbUser.email, role: dbUser.role },
              process.env.JWT_SECRET,
              { expiresIn: "30d" }
            );
            token.customToken = customToken;
            token.customUser = {
              id: dbUser._id.toString(),
              name: dbUser.name,
              email: dbUser.email,
              phone: dbUser.phone ?? null,
              whatsapp: dbUser.whatsapp ?? null,
              role: dbUser.role,
              isEmailVerified: dbUser.isEmailVerified ?? true,
            };
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Expose our custom data to the client session
      if (token.customToken) {
        session.customToken = token.customToken;
        session.customUser = token.customUser;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

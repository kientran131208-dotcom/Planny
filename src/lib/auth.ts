import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./database";
import bcrypt from "bcryptjs";

// Type augmentation for NextAuth to handle user IDs correctly in TypeScript
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      school?: string;
      bio?: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role?: string;
    school?: string;
    bio?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    school?: string;
    bio?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Planny Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập Email và Mật khẩu");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Không tìm thấy tài khoản với email này");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Mật khẩu không chính xác");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Return the user object with ID
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          image: user.image || user.avatarUrl,
          role: user.role || "Student",
          school: user.school || "",
          bio: user.bio || ""
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On the first call (sign in), 'user' is available.
      // We persist the user ID and others in the token for subsequent requests.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
        token.school = user.school;
        token.bio = user.bio;
      }

      // If the session is updated (via updateSession() on client)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.image = session.image;
        if (session.school !== undefined) token.school = session.school;
        if (session.bio !== undefined) token.bio = session.bio;
      }

      return token;
    },
    async session({ session, token }) {
      // The session callback maps the token data to the session object
      // so it's accessible on the client side (useSession) and server side (getServerSession).
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.school = token.school as string;
        session.user.bio = token.bio as string;
      }
      return session;
    }
  },
  session: { 
    strategy: "jwt", // Using JWT strategy with Prisma adapter for App Router compatibility
  },
  secret: process.env.NEXTAUTH_SECRET || "planny-super-secret-key-development",
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

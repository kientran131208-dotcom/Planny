import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Type augmentation for NextAuth
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

// Logic to build providers conditionally to prevent initialization errors
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Planny Account",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Vui lòng nhập Email và Mật khẩu");
      }

      try {
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

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          image: user.image || user.avatarUrl,
          role: user.role || "Student",
          school: user.school || "",
          bio: user.bio || ""
        };
      } catch (err) {
        console.error("[AUTH_AUTHORIZE_ERROR]", err);
        throw new Error("Lỗi kết nối Server: " + (err instanceof Error ? err.message : "Hãy kiểm tra DATABASE_URL"));
      }
    }
  })
);

export const authOptions: NextAuthOptions = {
  // Use any cast if there is a version mismatch in Prisma types
  adapter: PrismaAdapter(prisma as any),
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
        token.school = user.school;
        token.bio = user.bio;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.image = session.image;
        if (session.school !== undefined) token.school = session.school;
        if (session.bio !== undefined) token.bio = session.bio;
      }

      return token;
    },
    async session({ session, token }) {
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
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "planny-super-secret-key-development-2024",
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on error
  },
  debug: process.env.NODE_ENV === "development",
};

import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export type User = {
    id: string;
    email: string;
    name: string;
    role: "admin" | "customer";
    createdAt: string;
    googleId?: string;
    password?: string;
};

const providers = [] as any[];

// Google sağlayıcısını yalnızca gerekli env değerleri varsa ekle
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

providers.push(
    CredentialsProvider({
        name: "credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null;
            }

            const dbUser = await prisma.user.findUnique({ where: { email: credentials.email } });
            if (!dbUser) return null;
            if (dbUser.googleId) return null; // Google ile kayıtlı kullanıcı şifreyle giriş yapamaz
            if (!dbUser.password) return null;
            const isValid = await bcrypt.compare(String(credentials.password), String(dbUser.password));
            if (!isValid) return null;
            return { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role } as any;
        },
    })
);

export const authOptions: NextAuthConfig = {
    providers,
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === "google") {
                const existing = await prisma.user.findUnique({ where: { email: user.email! } });
                if (!existing) {
                    await prisma.user.create({
                        data: {
                            email: user.email!,
                            name: user.name || user.email!,
                            role: "customer",
                            googleId: account.providerAccountId,
                        },
                    });
                } else if (!existing.googleId) {
                    await prisma.user.update({ where: { id: existing.id }, data: { googleId: account.providerAccountId } });
                }
            }
            return true;
        },
        async jwt({ token, user, account }: any) {
            if (user) token.role = (user as any).role;
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.sub!;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

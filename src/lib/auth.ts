import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { readJson, writeJson, generateId } from "./store";

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

            const users = readJson<User[]>("users.json", []);
            const user = users.find((u) => u.email === credentials.email);

            if (!user) {
                return null;
            }

            // Google kullanıcıları için şifre kontrolü yapma
            if (user.googleId) {
                return null;
            }

            // Şifre kontrolü
            if (!user.password || typeof user.password !== 'string') {
                return null;
            }
            const isValid = await bcrypt.compare(String(credentials.password), String(user.password));

            if (!isValid) {
                return null;
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            };
        },
    })
);

export const authOptions: NextAuthConfig = {
    providers,
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === "google") {
                const users = readJson<User[]>("users.json", []);
                let existingUser = users.find((u) => u.email === user.email);

                if (!existingUser) {
                    // Yeni Google kullanıcısı oluştur
                    const newUser: User = {
                        id: generateId("user"),
                        email: user.email!,
                        name: user.name!,
                        role: "customer",
                        createdAt: new Date().toISOString(),
                        googleId: account.providerAccountId,
                        password: "",
                    };
                    users.push(newUser);
                    writeJson("users.json", users);
                } else if (!existingUser.googleId) {
                    // Mevcut kullanıcıya Google ID ekle
                    existingUser.googleId = account.providerAccountId;
                    writeJson("users.json", users);
                }
            }
            return true;
        },
        async jwt({ token, user, account }: any) {
            if (user) {
                token.role = user.role;
            }
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

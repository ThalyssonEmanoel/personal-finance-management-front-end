import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { fetchApiLogin } from "./utils/fetchApiLogin.js";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let route = process.env.NEXT_PUBLIC_API_URL;
        let data = await fetchApiLogin(route + "login", "POST", {
          email: credentials.email,
          password: credentials.password,
        });

        if (!data.error && data.data && data.data.usuario) {
          const { access_token, usuario } = data.data;
          return {
            id: usuario.id.toString(),
            name: usuario.name,
            email: usuario.email,
            avatar: usuario.avatar,
            isAdmin: usuario.isAdmin,
            access_token, 
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.user.id,
        avatar: token.user.avatar,
        isAdmin: token.user.isAdmin,
        access_token: token.user.access_token,
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
  pages: {
    signIn: '/introduction',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  trustHost: true,
});

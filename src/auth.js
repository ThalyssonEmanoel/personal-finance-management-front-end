import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginUser, refreshUserToken } from "./utils/apiService.js";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      authorize: async (credentials) => {
        let data = await loginUser(credentials.email, credentials.password);
        if (!data.error && data.data && data.data.usuario) {
          const { accessToken, refreshToken, usuario } = data.data;
          return {
            id: usuario.id.toString(),
            name: usuario.name,
            email: usuario.email,
            avatar: usuario.avatar,
            isAdmin: usuario.isAdmin,
            accessToken,
            refreshToken,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Quando o usuário faz login (user existe)
      if (user) {
        token.user = user;
      }

      // Quando chamamos update() no frontend
      if (trigger === "update" && session?.user) {
        token.user = {
          ...token.user,
          ...session.user, // aplica as alterações do update()
        };
      }

      // Renovação de token (sua lógica atual)
      if (token.user?.accessToken && token.user?.refreshToken) {
        const payload = JSON.parse(atob(token.user.accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = payload.exp - currentTime;

        if (timeUntilExpiration < 300) {
          const response = await refreshUserToken(token.user.refreshToken);
          if (response.data?.accessToken) {
            token.user.accessToken = response.data.accessToken;
            token.user.refreshToken =
              response.data.refreshToken || token.user.refreshToken;
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user, // agora sempre pega os dados mais recentes
        };
      }
      return session;
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

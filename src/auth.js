import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { fetchApiLogin } from "./utils/fetchApiLogin.js";
import { refreshUserToken } from "./utils/apiClient.js";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let route = process.env.NEXT_PUBLIC_API_URL;
        let data = await fetchApiLogin(route + "/login", "POST", {
          email: credentials.email,
          password: credentials.password,
        });

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
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.user.id,
        avatar: token.user.avatar,
        isAdmin: token.user.isAdmin,
        accessToken: token.user.accessToken,
        refreshToken: token.user.refreshToken,
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      // Verifica se o token está próximo do vencimento e tenta renovar
      if (token.user?.accessToken && token.user?.refreshToken) {
        const payload = JSON.parse(atob(token.user.accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = payload.exp - currentTime;
        // Se o token expira em menos de 5 minutos, tenta renovar
        if (timeUntilExpiration < 300) {
          const response = await refreshUserToken(token.user.refreshToken);
          if (response.data?.accessToken) {
            token.user.accessToken = response.data.accessToken;
            token.user.refreshToken = response.data.refreshToken || token.user.refreshToken;
          }
        }
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

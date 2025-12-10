'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { refreshUserToken, logoutUser } from "@/utils/apiService"

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const getAccessToken = () => {
    return session?.user?.accessToken;
  };

  const getRefreshToken = () => {
    return session?.user?.refreshToken;
  };

  const isAuthenticated = () => {
    return status === "authenticated" && !!session?.user;
  };

  const isLoading = () => {
    return status === "loading";
  };

  const getUserInfo = () => {
    return session?.user;
  };

  const updateUserInfo = async (newUserInfo) => {
    try {
      await update({
        user: {
          ...session?.user,
          ...newUserInfo,
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar informações do usuário:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await refreshUserToken(refreshToken);

      // Se resposta indicar erro, faz logout imediato
      if (response && (response.error === true || response.code === 401 || (response.data && (response.data.error === true || response.data.code === 401)))) {
        console.warn('Refresh token inválido ou expirado, deslogando usuário. Resposta:', response);
        await logout();
        throw new Error(response.message || (response.data && response.data.message) || 'Refresh token inválido ou expirado.');
      }

      // Garante que só renova se realmente vier um accessToken válido
      if (response && response.data && typeof response.data.accessToken === 'string' && response.data.accessToken.length > 0) {
        await update({
          ...session,
          user: {
            ...session.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken || refreshToken,
          }
        });
        return response.data.accessToken;
      } else {
        // Se não veio accessToken válido, faz logout
        console.warn('Refresh token inválido ou resposta inesperada, deslogando usuário. Resposta:', response);
        await logout();
        throw new Error('Erro na resposta do refresh token');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      const userId = getUserInfo()?.id;
      if (userId) {
        await logoutUser(userId);
        console.log('RefreshToken removido do banco de dados');
      }
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
    } finally {
      router.push('/introduction');
    }
  };

  const authenticatedFetch = async (url, options = {}) => {
    let token = getAccessToken();

    if (!token) {
      throw new Error('Token de acesso não encontrado');
    }

    const makeRequest = async (authToken) => {
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      };

      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };

    try {
      let response = await makeRequest(token);

      if (response.status === 401) {
        console.log('Token expirado, tentando renovar...');
        token = await refreshAccessToken();
        response = await makeRequest(token);
      }

      return response;
    } catch (error) {
      console.error('Erro na requisição autenticada:', error);
      throw error;
    }
  };

  return {
    session,
    status,
    getAccessToken,
    getRefreshToken,
    isAuthenticated,
    isLoading,
    getUserInfo,
    updateUserInfo,
    authenticatedFetch,
    refreshAccessToken,
    logout,
  };
}

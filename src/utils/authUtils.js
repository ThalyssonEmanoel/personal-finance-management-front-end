import { refreshUserToken } from './apiClient';
/**
 * Esse arquivo funciona da seguinte forma:
 * 1. Verifica se o token de acesso está expirado
 * 2. Se estiver expirado, tenta renovar o token usando o refresh token
 * 3. Se a renovação for bem-sucedida, faz a requisição autenticada
 * 4. Se a renovação falhar, retorna um erro
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const makeAuthenticatedRequest = async (url, options = {}, session, updateSession) => {
  let accessToken = session?.user?.accessToken;
  const refreshToken = session?.user?.refreshToken;

  if (!accessToken || isTokenExpired(accessToken)) {
    if (!refreshToken) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    try {
      const response = await refreshUserToken(refreshToken);
      
      if (response.data?.accessToken) {
        accessToken = response.data.accessToken;
        
        await updateSession({
          ...session,
          user: {
            ...session.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken || refreshToken,
          }
        });
      } else {
        throw new Error('Erro ao renovar token');
      }
    } catch (error) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

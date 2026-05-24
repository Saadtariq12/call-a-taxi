const ACCESS_KEY = "cat_access_token";
const REFRESH_KEY = "cat_refresh_token";

export const authStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

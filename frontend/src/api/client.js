import { authStorage } from "../utils/authStorage";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data?.message || data?.errors?.[0] || "Something went wrong";
    throw new Error(message);
  }
  return data;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = authStorage.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export const authApi = {
  register(body) {
    return apiRequest("/api/v1/users/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  login(body) {
    return apiRequest("/api/v1/users/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  setRole(role) {
    return apiRequest("/api/v1/users/role", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },
};

export const passengerApi = {
  requestRide(body) {
    return apiRequest("/api/v1/passenger/select-location", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  acceptRide(body) {
    return apiRequest("/api/v1/passenger/accept-ride", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  rejectOffer(body) {
    return apiRequest("/api/v1/passenger/reject-offer", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
};

export const driverApi = {
  proposeFare(body) {
    return apiRequest("/api/v1/driver/propose-fare", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

export { API_BASE };

import type { ApiResponse } from "@/types";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const API_PREFIX = "/api/v1";
const fullBaseUrl = `${BASE_URL}${API_PREFIX}`;

export const testApi = async () => {
  try {
    const res = await fetch(`${BASE_URL}/test`, {
      method: 'GET',
      credentials: 'include',
    });

    console.log("testApi response:", await res.json());
  } catch (error) {
    console.error("Error in testApi:", error);
  }
}

export const me = async ()  => {
  const res = await fetch(`${fullBaseUrl}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  return res;
}

export const signupUser = async (email: string, password: string): Promise<ApiResponse<null>> => {
  const res = await fetch(`${fullBaseUrl}/auth/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  // console.log("signupUser response:", body);
  return body as Promise<ApiResponse<null>>;
  // return res.json() as Promise<ApiResponse<null>>;
};

export const loginUser = async (email: string, password: string): Promise<ApiResponse<null>> => {
  const res = await fetch(`${fullBaseUrl}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json() as Promise<ApiResponse<null>>;
};

export const logoutUser = async (): Promise<Response> => {
  const res = await fetch(`${fullBaseUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return res;
};



// export async function apiFetch(path: string, options: RequestInit = {}) {
//   const token = await auth.currentUser?.getIdToken();
//   return fetch(`${import.meta.env.VITE_API_URL}${path}`, {
//     ...options,
//     headers: {
//       ...options.headers,
//       Authorization: token ? `Bearer ${token}` : "",
//       "Content-Type": "application/json",
//     },
//   });
// }
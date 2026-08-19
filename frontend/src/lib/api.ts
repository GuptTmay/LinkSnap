import type { ApiResponse } from "@/types/api";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const API_PREFIX = "/api/v1";
const fullBaseUrl = `${BASE_URL}${API_PREFIX}`;

// export const createLink = async (longUrl: string) => {
//   try {
//     const token = localStorage.getItem("token");

//     const res = await fetch(`${fullBaseUrl}/link`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         longUrl,
//       }),
//     });

//     return res;
//   } catch (error) {
//     console.error("Error in createLink:", error);
//   }
// };



export const testApi = async () => {
  try {
    const res = await fetch(`${BASE_URL}/test`, {
      method: 'GET',
      credentials: 'include',
    });
    return res;
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

export const signup = async (email: string, password: string) => {
  return fetch(`${fullBaseUrl}/auth/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  // const body = await res.json();
  // console.log("signupUser response:", body);
  // return body as Promise<ApiResponse<null>>;
};

export const signin = async (email: string, password: string): Promise<ApiResponse<null>> => {
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

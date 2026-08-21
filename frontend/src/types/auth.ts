export interface User {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

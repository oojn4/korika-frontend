import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../@types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null | any;
  access_token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  access_token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ email: string, password: string }>) {
      state.isAuthenticated = true;
      state.user = { email: action.payload.email, roles: 'admin' };
    },
    setUser(state, action: PayloadAction<any>) {
      state.isAuthenticated = true;
      state.user = action.payload.user
      state.access_token = action.payload.access_token
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.access_token = null;
    },
  },
});

export const { login, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

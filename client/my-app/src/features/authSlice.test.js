import authReducer, { logout, clearMessages } from './authSlice';

const baseState = {
  user: { id: '1', name: 'Alex', email: 'a@test.com', role: 'Editor' },
  token: 'test-token',
  isLoading: false,
  isError: true,
  errorMessage: 'Bad login',
  successMessage: 'Done',
};

test('logout clears auth state and localStorage', () => {
  const state = authReducer(baseState, logout());

  expect(state.user).toBeNull();
  expect(state.token).toBeNull();
  expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  expect(localStorage.removeItem).toHaveBeenCalledWith('user');
});

test('clearMessages resets error and success flags', () => {
  const state = authReducer(baseState, clearMessages());

  expect(state.isError).toBe(false);
  expect(state.errorMessage).toBe('');
  expect(state.successMessage).toBe('');
});

test('registerUser.fulfilled sets success message', () => {
  const state = authReducer(baseState, {
    type: 'auth/register/fulfilled',
    payload: { message: 'User Registered Successfully.' },
  });

  expect(state.isLoading).toBe(false);
  expect(state.isError).toBe(false);
  expect(state.successMessage).toMatch(/registered successfully/i);
});

test('loginUser.fulfilled stores user and token', () => {
  const state = authReducer(baseState, {
    type: 'auth/login/fulfilled',
    payload: {
      token: 'jwt-123',
      user: { id: '2', name: 'Sam', email: 's@test.com', role: 'Admin' },
    },
  });

  expect(state.token).toBe('jwt-123');
  expect(state.user.role).toBe('Admin');
  expect(localStorage.setItem).toHaveBeenCalledWith('token', 'jwt-123');
});

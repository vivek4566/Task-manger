import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { createTestStore } from './testUtils';

test('shows login when not authenticated', () => {
  const store = createTestStore({
    auth: {
      user: null,
      token: null,
      isLoading: false,
      isError: false,
      errorMessage: '',
      successMessage: '',
    },
  });

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('shows dashboard when authenticated', () => {
  const store = createTestStore({
    auth: {
      user: { id: '1', name: 'Test', email: 't@test.com', role: 'Viewer' },
      token: 'fake-token',
      isLoading: false,
      isError: false,
      errorMessage: '',
      successMessage: '',
    },
  });

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/collaborative task board/i)).toBeInTheDocument();
});

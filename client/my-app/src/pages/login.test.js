import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import Login from './login';
import { createTestStore } from '../testUtils';

test('renders login form by default', () => {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <Login />
    </Provider>
  );

  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

test('switches to register mode', async () => {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <Login />
    </Provider>
  );

  await userEvent.click(screen.getByRole('button', { name: /create one/i }));

  expect(screen.getByText(/create an account/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  expect(screen.getByRole('group', { name: /your role/i })).toBeInTheDocument();
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Login from '../pages/Login';

const loginMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}));

describe('Login component', () => {
  it('renders the login form', () => {
    render(<Login />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('developer@hustlehub.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('accepts credentials and submits them', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({});

    render(<Login />);

    const email = screen.getByPlaceholderText('developer@hustlehub.com');
    const password = screen.getByPlaceholderText('••••••••');

    await user.type(email, 'client@hustlehub.test');
    await user.type(password, 'TestPass123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith('client@hustlehub.test', 'TestPass123');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Register from '../pages/Register';

const registerMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ register: registerMock }),
}));

describe('Register component', () => {
  it('renders registration controls', () => {
    render(<Register />);

    expect(screen.getByRole('heading', { name: /join hustlehub\+/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Samson George')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('samson@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /offer gigs/i })).toBeInTheDocument();
  });

  it('allows the user to choose freelancer and submit registration data', async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValueOnce({});

    render(<Register />);

    await user.type(screen.getByPlaceholderText('Samson George'), 'Test Freelancer');
    await user.type(screen.getByPlaceholderText('samson@example.com'), 'freelancer@hustlehub.test');
    await user.type(screen.getByPlaceholderText('••••••••'), 'TestPass123');
    await user.click(screen.getByRole('button', { name: /offer gigs/i }));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(registerMock).toHaveBeenCalledWith({
      name: 'Test Freelancer',
      email: 'freelancer@hustlehub.test',
      password: 'TestPass123',
      role: 'freelancer',
    });
  });
});

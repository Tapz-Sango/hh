import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GigCard from '../components/GigCard';

vi.mock('../api/axios', () => ({
  default: {
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('GigCard component', () => {
  const gig = {
    _id: 'service-123',
    title: 'Premium Web Development',
    description: 'Full stack website development for small businesses.',
    category: 'Development',
    price: 250,
    freelancerId: { _id: 'freelancer-1', name: 'Alex Developer' },
  };

  it('renders gig information', () => {
    render(<GigCard gig={gig} user={{ id: 'client-1', role: 'client' }} />);

    expect(screen.getByRole('heading', { name: 'Premium Web Development' })).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText(/\$250/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('opens the booking modal when Book Now is clicked', async () => {
    const user = userEvent.setup();

    render(<GigCard gig={gig} user={{ id: 'client-1', role: 'client' }} />);
    await user.click(screen.getByRole('button', { name: /book now/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /premium web development/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/book this gig/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './register-form';
import React from 'react';

const mockMutate = vi.fn();

vi.mock('@/api/hooks/use-register', () => ({
  useRegister: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders email, name, password, confirm password and submit button', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm.*password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^name$/i), 'Test User');
    await user.type(
      screen.getByLabelText(/^password$/i),
      'Password1!',
    );
    await user.type(
      screen.getByLabelText(/confirm.*password/i),
      'OtherPass1!',
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls mutate with email, name, password on valid submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^name$/i), 'Test User');
    await user.type(
      screen.getByLabelText(/^password$/i),
      'Password1!',
    );
    await user.type(
      screen.getByLabelText(/confirm.*password/i),
      'Password1!',
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: 'Test User',
        password: 'Password1!',
      });
    });
  });
});

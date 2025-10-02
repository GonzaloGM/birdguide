import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../../app/contexts/auth-context';
import { sessionService } from '../../app/services/session.service';

// Mock session service
vi.mock('../../app/services/session.service', () => ({
  sessionService: {
    getSession: vi.fn(),
    saveSession: vi.fn(),
    clearSession: vi.fn(),
    isLoggedIn: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, isLoggedIn, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="is-logged-in">{isLoggedIn ? 'true' : 'false'}</div>
      <div data-testid="user-username">{user?.username || 'no-user'}</div>
      <button onClick={() => login({} as any, 'token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state when no session exists', () => {
    vi.mocked(sessionService.getSession).mockReturnValue(null);
    vi.mocked(sessionService.isLoggedIn).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-logged-in')).toHaveTextContent('false');
    expect(screen.getByTestId('user-username')).toHaveTextContent('no-user');
  });

  it('should provide user data when session exists', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      preferredLocale: 'es-AR',
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(sessionService.getSession).mockReturnValue({
      user: mockUser,
      token: 'mock-token',
    });
    vi.mocked(sessionService.isLoggedIn).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');
    expect(screen.getByTestId('user-username')).toHaveTextContent('testuser');
  });

  it('should call login and save session when login is called', () => {
    vi.mocked(sessionService.getSession).mockReturnValue(null);
    vi.mocked(sessionService.isLoggedIn).mockReturnValue(false);

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      preferredLocale: 'es-AR',
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const TestComponentWithUser = () => {
      const { user, isLoggedIn, login, logout } = useAuth();

      return (
        <div>
          <div data-testid="is-logged-in">{isLoggedIn ? 'true' : 'false'}</div>
          <div data-testid="user-username">{user?.username || 'no-user'}</div>
          <button onClick={() => login(mockUser, 'token')}>Login</button>
          <button onClick={logout}>Logout</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponentWithUser />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Login').click();
    });

    expect(sessionService.saveSession).toHaveBeenCalledWith(mockUser, 'token');
  });

  it('should call logout and clear session when logout is called', () => {
    vi.mocked(sessionService.getSession).mockReturnValue(null);
    vi.mocked(sessionService.isLoggedIn).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(sessionService.clearSession).toHaveBeenCalled();
  });
});

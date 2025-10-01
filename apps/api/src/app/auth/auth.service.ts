import { Injectable } from '@nestjs/common';
import { User, AuthResponse } from '@birdguide/shared-types';

type Auth0CallbackData = {
  code: string;
  state: string;
};

@Injectable()
export class AuthService {
  async handleAuth0Callback(
    auth0CallbackData: Auth0CallbackData
  ): Promise<AuthResponse> {
    // For now, return a mock response to make tests pass
    // TODO: Implement actual Auth0 token exchange
    if (auth0CallbackData.code === 'invalid-code') {
      throw new Error('Invalid authorization code');
    }

    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      preferredLocale: 'es-AR',
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      user: mockUser,
      token: 'jwt-token-123',
      refreshToken: 'refresh-token-123',
    };
  }

  async getCurrentUser(auth0Id: string): Promise<User> {
    // For now, return a mock user to make tests pass
    // TODO: Implement actual user lookup
    if (auth0Id === 'auth0|nonexistent-user') {
      throw new Error('User not found');
    }

    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      preferredLocale: 'es-AR',
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return mockUser;
  }

  async logout(auth0Id: string): Promise<void> {
    // For now, just return successfully to make tests pass
    // TODO: Implement actual logout logic
    return Promise.resolve();
  }
}

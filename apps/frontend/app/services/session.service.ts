import { User } from '@birdguide/shared-types';

export type Session = {
  user: User;
  token: string;
};

export const sessionService = {
  saveSession(user: User, token: string): void {
    localStorage.setItem('birdguide_user', JSON.stringify(user));
    localStorage.setItem('birdguide_token', token);
  },

  getSession(): Session | null {
    try {
      const userData = localStorage.getItem('birdguide_user');
      const token = localStorage.getItem('birdguide_token');

      if (!userData || !token) {
        return null;
      }

      const user = JSON.parse(userData) as User;

      // Convert date strings back to Date objects
      if (user.createdAt) {
        user.createdAt = new Date(user.createdAt);
      }
      if (user.updatedAt) {
        user.updatedAt = new Date(user.updatedAt);
      }
      if (user.lastActiveAt) {
        user.lastActiveAt = new Date(user.lastActiveAt);
      }
      if (user.deletedAt) {
        user.deletedAt = new Date(user.deletedAt);
      }

      return { user, token };
    } catch (error) {
      // If JSON parsing fails, clear the corrupted data
      this.clearSession();
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem('birdguide_user');
    localStorage.removeItem('birdguide_token');
  },

  isLoggedIn(): boolean {
    const session = this.getSession();
    return session !== null;
  },
};

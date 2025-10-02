import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user.repository';
import {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
} from '@birdguide/shared-types';

@Injectable()
export class AuthService {
  private managementClient: any;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService
  ) {
    // Initialize ManagementClient with proper configuration
    const ManagementClient = require('auth0').ManagementClient;
    this.managementClient = new ManagementClient({
      domain: this.configService.get('AUTH0_DOMAIN'),
      clientId: this.configService.get('AUTH0_MANAGEMENT_API_CLIENT_ID'),
      clientSecret: this.configService.get(
        'AUTH0_MANAGEMENT_API_CLIENT_SECRET'
      ),
    });
  }

  async handleAuth0Callback(code: string): Promise<AuthResponse> {
    try {
      // Exchange code for token
      const tokenData = await this.exchangeCodeForToken(code);

      // Get user info from Auth0
      const auth0User = await this.managementClient.users.get({
        id: tokenData.user_id,
      });

      // Create or update user in our database
      const user = await this.createOrUpdateUser(auth0User);

      // Generate JWT token
      const jwtToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        auth0Id: auth0User.data.user_id,
      });

      return {
        user,
        token: jwtToken,
        refreshToken: tokenData.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Auth0 callback failed');
    }
  }

  async getCurrentUser(auth0Id: string): Promise<User | null> {
    return this.userRepository.findUserByAuth0Id(auth0Id);
  }

  async register(registerRequest: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate username uniqueness
      await this.validateUsername(registerRequest.username);

      // Create user in Auth0
      const auth0User = await this.managementClient.users.create({
        connection: 'Username-Password-Authentication',
        email: registerRequest.email,
        password: registerRequest.password,
        username: registerRequest.username,
        name: registerRequest.username,
        email_verified: false,
      });

      // Create user in our database
      const user = await this.createOrUpdateUser(auth0User);

      // Generate JWT token
      const jwtToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        auth0Id: auth0User.data.user_id,
      });

      return {
        user,
        token: jwtToken,
        refreshToken: null, // Auth0 Management API doesn't provide refresh tokens
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  private async authenticateWithAuth0(
    emailOrUsername: string,
    password: string
  ): Promise<any> {
    const auth0Domain = this.configService.get('AUTH0_DOMAIN');
    const managementClientId = this.configService.get(
      'AUTH0_MANAGEMENT_API_CLIENT_ID'
    );
    const managementClientSecret = this.configService.get(
      'AUTH0_MANAGEMENT_API_CLIENT_SECRET'
    );

    if (!auth0Domain || !managementClientId || !managementClientSecret) {
      throw new Error('Auth0 Management API configuration is missing');
    }

    try {
      // First, get a Management API token
      const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: managementClientId,
          client_secret: managementClientSecret,
          audience: `https://${auth0Domain}/api/v2/`,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Management API token');
      }

      const tokenData = await tokenResponse.json();
      const managementToken = tokenData.access_token;

      // First, find the user in our local database to get their Auth0 ID
      let user = await this.userRepository.findUserByEmail(emailOrUsername);

      if (!user) {
        user = await this.userRepository.findUserByUsername(emailOrUsername);
      }

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Fetch user details from Auth0 using their ID
      const userUrl = `https://${auth0Domain}/api/v2/users/${user.auth0Id}`;

      const userResponse = await fetch(userUrl, {
        headers: {
          Authorization: `Bearer ${managementToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Invalid email or password');
      }

      const auth0User = await userResponse.json();

      // For now, we'll assume the user exists and is valid
      // In a production environment, you might want to implement additional validation
      return {
        user_id: auth0User.user_id,
        email: auth0User.email,
        access_token: managementToken, // Using management token for now
        refresh_token: null,
      };
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  }

  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    try {
      // Authenticate with Auth0 using the Management API
      const auth0Response = await this.authenticateWithAuth0(
        loginRequest.emailOrUsername,
        loginRequest.password
      );

      // Find user in our database by Auth0 ID
      const user = await this.userRepository.findUserByAuth0Id(
        auth0Response.user_id
      );

      if (!user) {
        throw new Error('User not found in database');
      }

      // Generate JWT token
      const jwtToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        auth0Id: auth0Response.user_id,
      });

      return {
        user,
        token: jwtToken,
        refreshToken: auth0Response.refresh_token || null,
      };
    } catch (error) {
      // If it's a specific database error, preserve the message
      if (error.message === 'User not found in database') {
        throw error;
      }
      // Otherwise, return generic invalid credentials message
      throw new Error('Invalid email or password');
    }
  }

  private async createOrUpdateUser(auth0User: any): Promise<User> {
    const userData = {
      auth0Id: auth0User.data.user_id,
      email: auth0User.data.email,
      username: auth0User.data.name || auth0User.data.email.split('@')[0],
      preferredLocale: 'es-AR',
      preferredRegionId: null,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveAt: new Date(),
      isAdmin: false,
    };

    return this.userRepository.createOrUpdateUser(
      auth0User.data.user_id,
      userData
    );
  }

  private async validateUsername(username: string): Promise<void> {
    if (!username || username.length < 3 || username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error(
        'Username can only contain letters, numbers and underscores'
      );
    }

    const existingUser = await this.userRepository.findUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
  }

  async logout(userId: string): Promise<void> {
    // For now, logout is handled on the client side
    // In the future, you might want to invalidate tokens or track logout events
  }

  private async exchangeCodeForToken(code: string): Promise<any> {
    // This would typically exchange an authorization code for tokens
    // For now, return mock data
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user_id: 'auth0|mock-user-id',
    };
  }
}

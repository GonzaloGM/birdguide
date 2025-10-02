import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { User } from '@birdguide/shared-types';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async findByAuth0Id(auth0Id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { auth0Id },
    });
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(
    auth0Id: string,
    userData: Partial<UserEntity>
  ): Promise<UserEntity | null> {
    await this.userRepository.update({ auth0Id }, userData);
    return this.findByAuth0Id(auth0Id);
  }

  async createOrUpdate(
    auth0Id: string,
    userData: Partial<UserEntity>
  ): Promise<UserEntity> {
    const existingUser = await this.findByAuth0Id(auth0Id);

    if (existingUser) {
      return this.update(auth0Id, userData) as Promise<UserEntity>;
    } else {
      return this.create({ ...userData, auth0Id });
    }
  }

  private mapEntityToUser(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      username: entity.username,
      preferredLocale: entity.preferredLocale,
      preferredRegionId: entity.preferredRegionId,
      xp: entity.xp,
      currentStreak: entity.currentStreak,
      longestStreak: entity.longestStreak,
      lastActiveAt: entity.lastActiveAt,
      isAdmin: entity.isAdmin,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      auth0Id: entity.auth0Id,
    };
  }

  async findUserByAuth0Id(auth0Id: string): Promise<User | null> {
    const entity = await this.findByAuth0Id(auth0Id);
    return entity ? this.mapEntityToUser(entity) : null;
  }

  async createOrUpdateUser(
    auth0Id: string,
    userData: Partial<UserEntity>
  ): Promise<User> {
    const entity = await this.createOrUpdate(auth0Id, userData);
    return this.mapEntityToUser(entity);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({
      where: { email },
    });
    return entity ? this.mapEntityToUser(entity) : null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({
      where: { username },
    });
    return entity ? this.mapEntityToUser(entity) : null;
  }
}

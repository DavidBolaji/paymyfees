/**
 * User Repository
 * Database layer for User entity operations
 * Implements repository pattern with Prisma
 */

import { prisma } from '@/src/database/prisma';
import { User } from '@prisma/client';

import { UserDTO } from '@/src/types';

/**
 * User Repository Interface
 */
export interface IUserRepository {
  getUserById(id: string): Promise<UserDTO | null>;
  updateUser(id: string, data: Partial<User>): Promise<UserDTO>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<UserDTO>;
  delete(id: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  getNotificationSettings(userId: string): Promise<any | null>;
  updateNotificationSettings(userId: string, data: any): Promise<any>;
}

/**
 * User Repository Implementation
 */
export class UserRepository implements IUserRepository {
  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? this.toDTO(user) : null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<UserDTO> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return this.toDTO(user);
  }
  /**
   * Create a new user
  
  async create(input: CreateUserInput): Promise<UserDTO> {
    // Check for existing email
    const existingEmail = await this.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check for existing phone
    const existingPhone = await this.findByPhone(input.phone);
    if (existingPhone) {
      throw new ConflictError('Phone number already registered');
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        // phone: input.phone,
        password: input.password,
        role: input.role,
        fullName: input.fullName,
        profileImage: input.profileImage,
      },
    });

    return this.toDTO(user);
  }
 */
  /**
   * Find user by ID (returns full User entity with all fields including password)
   * Used for authentication and internal operations
   */
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  /**
   * Find user by email (includes password for authentication)
   * Email is normalized to lowercase for case-insensitive lookup
   */
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<User>): Promise<UserDTO> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return this.toDTO(user);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Get notification settings for a user
   */
  async getNotificationSettings(userId: string): Promise<any | null> {
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    return settings;
  }

  /**
   * Update or create notification settings for a user
   */
  async updateNotificationSettings(userId: string, data: any): Promise<any> {
    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    return settings;
  }

  /**
   * Convert User entity to DTO (excludes password and sensitive fields)
   */
  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      profileImage: user.profileImage,
      emailVerified: user.emailVerified,
      residencyStatus: user.residencyStatus,
      phoneVerified: user.phoneVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
    };
  }
}

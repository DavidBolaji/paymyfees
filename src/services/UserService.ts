import { UserRepository, IUserRepository } from '@/src/repositories/UserRepository';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { logger } from '@/src/utils/logger';

/**
 * User Service
 * Business logic for user operations
 */
export interface IUserService {
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, data: any): Promise<any>;
}

/**
 * User Service Implementation
 */
export class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  /**
   * Get user profile for a user
   */
  async getUserProfile(userId: string): Promise<any> {
    logger.info({ msg: 'Getting user profile', userId });

    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: any): Promise<any> {
    logger.info({ msg: 'Updating user profile', userId });

    // Validate required fields
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    // Update user profile
    const updatedUser = await this.userRepository.updateUser(userId, data);
    return updatedUser;
  }
}
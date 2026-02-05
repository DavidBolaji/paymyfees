/**
 * Dependency Injection Configuration
 * Registers all services, repositories, and controllers in the container
 */

import { container } from './container';
import { UserRepository, IUserRepository } from '@/src/repositories/UserRepository';
import { AuthService, IAuthService } from '@/src/services/AuthService';
import { AuthController } from '@/src/controllers/AuthController';

/**
 * Service identifiers (tokens)
 */
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  
  // Services
  AuthService: Symbol.for('AuthService'),
  
  // Controllers
  AuthController: Symbol.for('AuthController'),
};

/**
 * Configure dependency injection container
 * Registers all application services with appropriate lifecycles
 */
export function configureDI(): void {
  // Register Repositories (Singleton)
  container.registerSingleton(
    TYPES.UserRepository,
    () => new UserRepository()
  );

  // Register Services (Singleton)
  container.registerSingleton(
    TYPES.AuthService,
    () => {
      const userRepository = container.resolve<IUserRepository>(TYPES.UserRepository);
      return new AuthService(userRepository);
    }
  );

  // Register Controllers (Transient - new instance per request)
  container.registerTransient(
    TYPES.AuthController,
    () => {
      const authService = container.resolve<IAuthService>(TYPES.AuthService);
      return new AuthController(authService);
    }
  );
}

/**
 * Initialize DI container
 * Call this once at application startup
 */
export function initializeDI(): void {
  configureDI();
}

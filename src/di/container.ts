/**
 * Dependency Injection Container
 * Implements IoC (Inversion of Control) pattern with constructor injection
 * Following SOLID principles with interface-based dependencies
 */

import { NotFoundError } from '@/src/types/errors';

/**
 * Service lifecycle types
 */
export enum ServiceLifecycle {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  SCOPED = 'scoped',
}

/**
 * Service registration interface
 */
interface ServiceRegistration<T = unknown> {
  factory: () => T;
  lifecycle: ServiceLifecycle;
  instance?: T;
}

/**
 * Service identifier type
 */
export type ServiceIdentifier<T = unknown> = string | symbol | { new (...args: unknown[]): T };

/**
 * Dependency Injection Container
 * Manages service registration, resolution, and lifecycle
 */
export class Container {
  private services: Map<ServiceIdentifier, ServiceRegistration> = new Map();
  private scopedInstances: Map<ServiceIdentifier, unknown> = new Map();

  /**
   * Register a singleton service
   * Single instance shared across the application
   */
  public registerSingleton<T>(
    identifier: ServiceIdentifier<T>,
    factory: () => T
  ): void {
    this.services.set(identifier, {
      factory,
      lifecycle: ServiceLifecycle.SINGLETON,
    });
  }

  /**
   * Register a transient service
   * New instance created on each resolution
   */
  public registerTransient<T>(
    identifier: ServiceIdentifier<T>,
    factory: () => T
  ): void {
    this.services.set(identifier, {
      factory,
      lifecycle: ServiceLifecycle.TRANSIENT,
    });
  }

  /**
   * Register a scoped service
   * Single instance per scope (e.g., per request)
   */
  public registerScoped<T>(
    identifier: ServiceIdentifier<T>,
    factory: () => T
  ): void {
    this.services.set(identifier, {
      factory,
      lifecycle: ServiceLifecycle.SCOPED,
    });
  }

  /**
   * Register an existing instance
   */
  public registerInstance<T>(
    identifier: ServiceIdentifier<T>,
    instance: T
  ): void {
    this.services.set(identifier, {
      factory: () => instance,
      lifecycle: ServiceLifecycle.SINGLETON,
      instance,
    });
  }

  /**
   * Resolve a service by identifier
   */
  public resolve<T>(identifier: ServiceIdentifier<T>): T {
    const registration = this.services.get(identifier) as ServiceRegistration<T> | undefined;

    if (!registration) {
      throw new NotFoundError(
        `Service not registered: ${this.getIdentifierName(identifier)}`
      );
    }

    switch (registration.lifecycle) {
      case ServiceLifecycle.SINGLETON:
        return this.resolveSingleton<T>(registration);
      
      case ServiceLifecycle.TRANSIENT:
        return this.resolveTransient<T>(registration);
      
      case ServiceLifecycle.SCOPED:
        return this.resolveScoped<T>(identifier, registration);
      
      default:
        throw new Error(`Unknown lifecycle: ${registration.lifecycle}`);
    }
  }

  /**
   * Resolve singleton instance
   */
  private resolveSingleton<T>(registration: ServiceRegistration<T>): T {
    if (!registration.instance) {
      registration.instance = registration.factory();
    }
    return registration.instance as T;
  }

  /**
   * Resolve transient instance
   */
  private resolveTransient<T>(registration: ServiceRegistration<T>): T {
    return registration.factory() as T;
  }

  /**
   * Resolve scoped instance
   */
  private resolveScoped<T>(
    identifier: ServiceIdentifier<T>,
    registration: ServiceRegistration<T>
  ): T {
    if (!this.scopedInstances.has(identifier)) {
      this.scopedInstances.set(identifier, registration.factory());
    }
    return this.scopedInstances.get(identifier) as T;
  }

  /**
   * Clear scoped instances
   * Should be called at the end of each scope (e.g., request)
   */
  public clearScope(): void {
    this.scopedInstances.clear();
  }

  /**
   * Check if service is registered
   */
  public has(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier);
  }

  /**
   * Remove service registration
   */
  public unregister(identifier: ServiceIdentifier): void {
    this.services.delete(identifier);
    this.scopedInstances.delete(identifier);
  }

  /**
   * Clear all registrations
   */
  public clear(): void {
    this.services.clear();
    this.scopedInstances.clear();
  }

  /**
   * Get identifier name for error messages
   */
  private getIdentifierName(identifier: ServiceIdentifier): string {
    if (typeof identifier === 'string') {
      return identifier;
    }
    if (typeof identifier === 'symbol') {
      return identifier.toString();
    }
    if (typeof identifier === 'function') {
      return identifier.name;
    }
    return 'Unknown';
  }

  /**
   * Create a child container
   * Useful for creating request-scoped containers
   */
  public createChild(): Container {
    const child = new Container();
    // Copy singleton registrations to child
    this.services.forEach((registration, identifier) => {
      if (registration.lifecycle === ServiceLifecycle.SINGLETON) {
        child.services.set(identifier, registration);
      }
    });
    return child;
  }
}

/**
 * Global container instance
 */
export const container = new Container();

/**
 * Service decorator for automatic registration
 */
export function Injectable(lifecycle: ServiceLifecycle = ServiceLifecycle.SINGLETON) {
  return function <T extends { new (...args: unknown[]): object }>(constructor: T): T {
    // Register the class in the container
    const factory = () => new constructor();
    
    switch (lifecycle) {
      case ServiceLifecycle.SINGLETON:
        container.registerSingleton(constructor, factory);
        break;
      case ServiceLifecycle.TRANSIENT:
        container.registerTransient(constructor, factory);
        break;
      case ServiceLifecycle.SCOPED:
        container.registerScoped(constructor, factory);
        break;
    }
    
    return constructor;
  };
}

/**
 * Inject decorator for property injection
 */
export function Inject(identifier: ServiceIdentifier) {
  return function (target: object, propertyKey: string): void {
    Object.defineProperty(target, propertyKey, {
      get: () => container.resolve(identifier),
      enumerable: true,
      configurable: true,
    });
  };
}

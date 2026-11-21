import { validateEnvironment, EnvironmentVariables } from '../../apps/api/src/config/env.validation';

describe('Environment Variable Validation', () => {
  it('should pass with valid default configurations', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '4000',
      DATABASE_URL: 'postgresql://postgres:postgres_local_password@localhost:5432/solaros_dev?schema=public',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      STORAGE_ENDPOINT: 'localhost',
      STORAGE_PORT: '9000',
      STORAGE_ACCESS_KEY: 'minioadmin',
      STORAGE_SECRET_KEY: 'minioadmin',
      JWT_SECRET: 'super_secret_jwt_key_must_be_changed_in_production_min_32_characters',
    };

    const validated = validateEnvironment(config);
    expect(validated).toBeInstanceOf(EnvironmentVariables);
    expect(validated.PORT).toBe(4000);
  });

  it('should fail when an invalid environment is supplied', () => {
    const config = {
      NODE_ENV: 'non_existent_env',
    };

    expect(() => validateEnvironment(config as any)).toThrow();
  });
});

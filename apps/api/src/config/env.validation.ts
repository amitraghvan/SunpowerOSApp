import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  DATABASE_URL: string = 'postgresql://postgres:postgres_local_password@localhost:5432/solaros_dev?schema=public';

  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  STORAGE_ENDPOINT: string = 'localhost';

  @IsNumber()
  @IsOptional()
  STORAGE_PORT: number = 9000;

  @IsString()
  @IsOptional()
  STORAGE_ACCESS_KEY: string = 'minioadmin';

  @IsString()
  @IsOptional()
  STORAGE_SECRET_KEY: string = 'minioadmin';

  @IsString()
  @IsOptional()
  JWT_SECRET: string = 'super_secret_jwt_key_must_be_changed_in_production_min_32_characters';
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}

import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  /**
   * Hashes a raw password using Argon2id with production security parameters.
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MiB
      timeCost: 2,       // 2 iterations
      parallelism: 1,
    });
  }

  /**
   * Verifies a raw candidate password against a stored Argon2id hash.
   */
  async verifyPassword(hash: string, candidate: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, candidate);
    } catch (err: any) {
      this.logger.error(`Error verifying password hash: ${err.message}`);
      return false;
    }
  }
}

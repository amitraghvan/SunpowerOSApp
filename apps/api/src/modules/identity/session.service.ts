import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { ActiveSession } from '@solaros/types';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  // Standard session duration: 24 hours; remember-me session: 30 days
  private readonly STANDARD_DURATION_MS = 24 * 60 * 60 * 1000;
  private readonly REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Hashes a raw token with SHA-256 for secure constant-time database indexing.
   */
  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generates a new cryptographically random 32-byte session and persists it.
   */
  async createSession(params: {
    userId: string;
    organizationId: string;
    ipAddress?: string;
    userAgent?: string;
    rememberMe?: boolean;
  }): Promise<{ rawToken: string; sessionId: string; expiresAt: Date }> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const duration = params.rememberMe ? this.REMEMBER_DURATION_MS : this.STANDARD_DURATION_MS;
    const expiresAt = new Date(Date.now() + duration);

    const session = await this.prisma.session.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        tokenHash,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        expiresAt,
      },
    });

    return {
      rawToken,
      sessionId: session.id,
      expiresAt,
    };
  }

  /**
   * Validates a raw token against the database.
   * Returns active session record with user and organization if valid and not expired/revoked.
   */
  async validateSession(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);

    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: true,
        organization: true,
      },
    });

    if (!session) {
      return null;
    }

    if (session.revokedAt) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    return session;
  }

  /**
   * Revoke a specific session by token hash
   */
  async revokeSessionByToken(rawToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(rawToken);
    const result = await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count > 0;
  }

  /**
   * Revoke a specific session by ID for a user
   */
  async revokeSessionById(sessionId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count > 0;
  }

  /**
   * Revoke all user sessions except currently active session
   */
  async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  /**
   * List all active sessions for a user
   */
  async listUserSessions(userId: string, currentSessionId?: string): Promise<ActiveSession[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      organizationId: s.organizationId,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
      isCurrent: s.id === currentSessionId,
    }));
  }
}

import { describe, it, expect } from 'vitest';
import { db } from '../../db';
import { users } from '../../db/schema';
import { createTestUser } from '../../test/utils';
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  createVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  resetPasswordWithToken,
} from './password.service';
import { eq } from 'drizzle-orm';

describe('password.service', () => {
  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('Password123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject password shorter than minimum length', () => {
      const result = validatePasswordStrength('Pass1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('password123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('Password!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const result = await verifyPassword(hash, password);

      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const result = await verifyPassword(hash, 'WrongPassword123!');

      expect(result).toBe(false);
    });

    it('should handle invalid hash', async () => {
      const result = await verifyPassword('invalid-hash', 'password');

      expect(result).toBe(false);
    });
  });

  describe('email verification tokens', () => {
    it('should create verification token', async () => {
      const { user } = await createTestUser();
      const token = await createVerificationToken(user.id);

      expect(token).toBeDefined();
      expect(token.length).toBe(64);

      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      expect(updatedUser?.emailVerificationToken).toBe(token);
      expect(updatedUser?.emailVerificationExpiresAt).toBeDefined();
    });

    it('should verify valid token', async () => {
      const { user } = await createTestUser({ password: undefined });

      const token = await createVerificationToken(user.id);
      const result = await verifyEmailToken(token);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(user.id);

      const verifiedUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      if (!verifiedUser) {
        throw new Error('User not found');
      }

      expect(verifiedUser.emailVerified).toBe(true);
      expect(verifiedUser.emailVerificationToken).toBeNull();
    });

    it('should reject expired token', async () => {
      const { user } = await createTestUser({ password: undefined });

      await db
        .update(users)
        .set({
          emailVerificationToken: 'expired-token',
          emailVerificationExpiresAt: new Date(Date.now() - 1000),
        })
        .where(eq(users.id, user.id));

      const result = await verifyEmailToken('expired-token');

      expect(result.success).toBe(false);
      expect(result.userId).toBeUndefined();
    });

    it('should reject invalid token', async () => {
      const result = await verifyEmailToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.userId).toBeUndefined();
    });
  });

  describe('password reset tokens', () => {
    it('should create reset token for existing user', async () => {
      const { user } = await createTestUser();
      const token = await createPasswordResetToken(user.email);

      expect(token).toBeDefined();
      expect(token!.length).toBe(64);

      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      expect(updatedUser?.passwordResetToken).toBe(token);
      expect(updatedUser?.passwordResetExpiresAt).toBeDefined();
    });

    it('should return null for non-existing user', async () => {
      const token = await createPasswordResetToken('nonexistent@example.com');

      expect(token).toBeNull();
    });

    it('should reset password with valid token', async () => {
      const { user, plainPassword } = await createTestUser();
      const token = await createPasswordResetToken(user.email);
      const newPassword = 'NewPassword456!';

      if (!token) {
        throw new Error('Token should not be null');
      }

      const success = await resetPasswordWithToken(token, newPassword);

      expect(success).toBe(true);

      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      expect(updatedUser?.passwordResetToken).toBeNull();
      expect(updatedUser?.passwordResetExpiresAt).toBeNull();

      const verifyResult = await verifyPassword(updatedUser!.passwordHash!, newPassword);
      expect(verifyResult).toBe(true);

      const verifyOldPassword = await verifyPassword(updatedUser!.passwordHash!, plainPassword!);
      expect(verifyOldPassword).toBe(false);
    });

    it('should reject expired reset token', async () => {
      const { user } = await createTestUser();

      await db
        .update(users)
        .set({
          passwordResetToken: 'expired-token',
          passwordResetExpiresAt: new Date(Date.now() - 1000),
        })
        .where(eq(users.id, user.id));

      const success = await resetPasswordWithToken('expired-token', 'NewPassword456!');

      expect(success).toBe(false);
    });

    it('should reject invalid reset token', async () => {
      const success = await resetPasswordWithToken('invalid-token', 'NewPassword456!');

      expect(success).toBe(false);
    });
  });
});

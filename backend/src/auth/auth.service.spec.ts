import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Test data — hashes are generated once in beforeAll using real bcrypt so the
// actual bcrypt.compare() call inside AuthService runs against a valid hash.
// ---------------------------------------------------------------------------
const ADMIN_PASSWORD = 'TestAdmin@123';
const MEMBER_PASSWORD = 'TestMember@123';

let adminPasswordHash: string;
let memberPasswordHash: string;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { admin: { findUnique: jest.Mock }; member: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeAll(async () => {
    // Arrange — generate real bcrypt hashes once so every test can reuse them
    adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    memberPasswordHash = await bcrypt.hash(MEMBER_PASSWORD, 10);
  });

  beforeEach(async () => {
    // Arrange — build fresh mock objects before each test so spy call counts
    // never bleed between tests
    prisma = {
      admin: { findUnique: jest.fn() },
      member: { findUnique: jest.fn() },
    };

    jwtService = { sign: jest.fn().mockReturnValue('mock-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // -------------------------------------------------------------------------
  // ADMIN PATH
  // -------------------------------------------------------------------------
  describe('Admin login path', () => {
    it('returns access_token and Administrator user when correct admin credentials supplied', async () => {
      // Arrange
      const adminRecord = {
        id: 'admin-1',
        name: 'CWA Treasurer',
        email: 'admin@stgabriel.org',
        passwordHash: adminPasswordHash,
      };
      prisma.admin.findUnique.mockResolvedValue(adminRecord);

      // Act
      const result = await service.login({
        email: 'admin@stgabriel.org',
        password: ADMIN_PASSWORD,
      });

      // Assert
      expect(result).toEqual({
        access_token: 'mock-token',
        user: {
          id: 'admin-1',
          email: 'admin@stgabriel.org',
          role: 'Administrator',
          name: 'CWA Treasurer',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'admin-1',
        email: 'admin@stgabriel.org',
        role: 'Administrator',
        name: 'CWA Treasurer',
      });
    });

    it('throws UnauthorizedException when admin email supplied but no password', async () => {
      // Arrange
      prisma.admin.findUnique.mockResolvedValue({
        id: 'admin-1',
        name: 'CWA Treasurer',
        email: 'admin@stgabriel.org',
        passwordHash: adminPasswordHash,
      });

      // Act & Assert
      await expect(
        service.login({ email: 'admin@stgabriel.org' }),
      ).rejects.toThrow(new UnauthorizedException('Password is required for admin login'));
    });

    it('throws UnauthorizedException when admin email supplied with wrong password', async () => {
      // Arrange
      prisma.admin.findUnique.mockResolvedValue({
        id: 'admin-1',
        name: 'CWA Treasurer',
        email: 'admin@stgabriel.org',
        passwordHash: adminPasswordHash,
      });

      // Act & Assert
      await expect(
        service.login({ email: 'admin@stgabriel.org', password: 'WrongPassword!' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });

  // -------------------------------------------------------------------------
  // MEMBER PATH
  // -------------------------------------------------------------------------
  describe('Member login path', () => {
    it('returns access_token and Member user when correct member credentials supplied', async () => {
      // Arrange
      const memberRecord = {
        id: 'member-1',
        name: 'Monicah Wambui',
        email: 'monicah@test.com',
        approvalStatus: 'APPROVED',
        passwordHash: memberPasswordHash,
      };
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.member.findUnique.mockResolvedValue(memberRecord);

      // Act
      const result = await service.login({
        email: 'monicah@test.com',
        password: MEMBER_PASSWORD,
      });

      // Assert
      expect(result).toEqual({
        access_token: 'mock-token',
        user: {
          id: 'member-1',
          email: 'monicah@test.com',
          role: 'Member',
          name: 'Monicah Wambui',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'member-1',
        email: 'monicah@test.com',
        role: 'Member',
        name: 'Monicah Wambui',
      });
    });

    it('throws UnauthorizedException when email is not found in either table', async () => {
      // Arrange
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({ email: 'nobody@nowhere.com', password: 'anypassword' }),
      ).rejects.toThrow(new UnauthorizedException('No account found with this email'));
    });

    it('throws UnauthorizedException when member exists but approvalStatus is PENDING', async () => {
      // Arrange
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.member.findUnique.mockResolvedValue({
        id: 'member-2',
        name: 'Jane Pending',
        email: 'jane@test.com',
        approvalStatus: 'PENDING',
        passwordHash: memberPasswordHash,
      });

      // Act & Assert
      await expect(
        service.login({ email: 'jane@test.com', password: MEMBER_PASSWORD }),
      ).rejects.toThrow(new UnauthorizedException('Your account is pending approval'));
    });

    it('throws UnauthorizedException when member exists but approvalStatus is REJECTED', async () => {
      // Arrange
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.member.findUnique.mockResolvedValue({
        id: 'member-3',
        name: 'Jane Rejected',
        email: 'jane.rejected@test.com',
        approvalStatus: 'REJECTED',
        passwordHash: memberPasswordHash,
      });

      // Act & Assert
      await expect(
        service.login({ email: 'jane.rejected@test.com', password: MEMBER_PASSWORD }),
      ).rejects.toThrow(new UnauthorizedException('Your account is pending approval'));
    });

    it('throws UnauthorizedException when approved member supplies no password', async () => {
      // Arrange
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        name: 'Monicah Wambui',
        email: 'monicah@test.com',
        approvalStatus: 'APPROVED',
        passwordHash: memberPasswordHash,
      });

      // Act & Assert
      await expect(
        service.login({ email: 'monicah@test.com' }),
      ).rejects.toThrow(new UnauthorizedException('Password is required'));
    });

    it('throws UnauthorizedException when approved member supplies wrong password', async () => {
      // Arrange
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        name: 'Monicah Wambui',
        email: 'monicah@test.com',
        approvalStatus: 'APPROVED',
        passwordHash: memberPasswordHash,
      });

      // Act & Assert
      await expect(
        service.login({ email: 'monicah@test.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });
});

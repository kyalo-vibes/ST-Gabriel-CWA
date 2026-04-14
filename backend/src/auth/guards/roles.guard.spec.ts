import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

// ---------------------------------------------------------------------------
// Helper — builds a mock ExecutionContext with a configurable request user.
// Keeping this as a function means each test gets a fresh object and there is
// no shared-state risk between tests.
// ---------------------------------------------------------------------------
function buildMockContext(user: { role: string } | undefined): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    // Arrange — fresh Reflector mock before each test
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('returns true when no roles metadata is set (unprotected route)', () => {
    // Arrange — Reflector returns undefined, meaning no @Roles() decorator applied
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = buildMockContext({ role: 'Member' });

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });

  it('returns true when user role is Administrator and @Roles("Administrator") is set', () => {
    // Arrange
    reflector.getAllAndOverride.mockReturnValue(['Administrator']);
    const context = buildMockContext({ role: 'Administrator' });

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });

  it('returns false when user role is Member and @Roles("Administrator") is set', () => {
    // Arrange
    reflector.getAllAndOverride.mockReturnValue(['Administrator']);
    const context = buildMockContext({ role: 'Member' });

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(false);
  });

  it('returns true when @Roles("Administrator", "Member") is set and user is Member', () => {
    // Arrange
    reflector.getAllAndOverride.mockReturnValue(['Administrator', 'Member']);
    const context = buildMockContext({ role: 'Member' });

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });

  it('returns false when req.user is undefined', () => {
    // Arrange — simulates a request that somehow bypassed JwtAuthGuard
    reflector.getAllAndOverride.mockReturnValue(['Administrator']);
    const context = buildMockContext(undefined);

    // Act
    const result = guard.canActivate(context);

    // Assert — user?.role is undefined, not in ['Administrator']
    expect(result).toBe(false);
  });

  it('passes the correct metadata keys to Reflector.getAllAndOverride', () => {
    // Arrange
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = buildMockContext({ role: 'Administrator' });

    // Act
    guard.canActivate(context);

    // Assert — verify the guard reads from the correct metadata key
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});

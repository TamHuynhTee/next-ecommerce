import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

// @nestjs/passport is ESM-only; stand in for the base guard's default behaviour.
jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class {
      handleRequest(_err: unknown, user: unknown) {
        if (!user)
          throw new (jest.requireActual(
            '@nestjs/common',
          ).UnauthorizedException)();
        return user;
      }
    },
}));

describe('JwtAuthGuard.handleRequest', () => {
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;

  const guardFor = (isPublic: boolean) => {
    const reflector = {
      getAllAndOverride: () => isPublic,
    } as unknown as Reflector;
    return new JwtAuthGuard(reflector);
  };

  it('keeps the user on a public route when a valid token was sent', () => {
    const user = { userId: '1' };
    expect(guardFor(true).handleRequest(null, user, undefined, context)).toBe(
      user,
    );
  });

  it('lets anonymous callers through on a public route', () => {
    expect(
      guardFor(true).handleRequest(null, false, 'No auth token', context),
    ).toBeUndefined();
  });

  it('ignores an invalid token on a public route', () => {
    expect(
      guardFor(true).handleRequest(
        new Error('jwt expired'),
        false,
        null,
        context,
      ),
    ).toBeUndefined();
  });

  it('still rejects anonymous callers on a protected route', () => {
    expect(() =>
      guardFor(false).handleRequest(null, false, 'No auth token', context),
    ).toThrow(UnauthorizedException);
  });
});

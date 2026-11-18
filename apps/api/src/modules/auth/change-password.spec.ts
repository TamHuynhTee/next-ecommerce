import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';

// @nestjs/typeorm, config and jwt are ESM-only; only the symbols the service imports are stubbed.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
jest.mock('@nestjs/jwt', () => ({ JwtService: class {} }));

const hash = (t: string) => createHash('sha256').update(t).digest('hex');

function setup(opts: { passwordOk: boolean; ownFamily?: string }) {
  const userService = {
    findById: jest.fn(async () => ({ id: 'u1', hashedPassword: 'old-hash' })),
    setPassword: jest.fn(async () => undefined),
  };
  const credentialService = {
    verify: jest.fn(async () => opts.passwordOk),
    hash: jest.fn(async () => 'new-hash'),
  };
  const refreshRepo = {
    findOneBy: jest.fn(async ({ tokenHash }) =>
      opts.ownFamily && tokenHash === hash('mine')
        ? { familyId: opts.ownFamily }
        : null,
    ),
    update: jest.fn(async () => undefined),
  };
  const service = new AuthService(
    userService as never,
    credentialService as never,
    {} as never,
    {} as never,
    refreshRepo as never,
  );
  return { service, userService, refreshRepo };
}

const DTO = { currentPassword: 'Old-pass-1!', newPassword: 'New-pass-1!' };

describe('AuthService.changePassword', () => {
  it('rejects a wrong current password and changes nothing', async () => {
    const { service, userService, refreshRepo } = setup({ passwordOk: false });
    await expect(service.changePassword('u1', DTO)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(userService.setPassword).not.toHaveBeenCalled();
    expect(refreshRepo.update).not.toHaveBeenCalled();
  });

  it('stores the new hash and revokes every session except the caller’s own', async () => {
    const { service, userService, refreshRepo } = setup({
      passwordOk: true,
      ownFamily: 'fam-1',
    });
    await service.changePassword('u1', { ...DTO, refreshToken: 'mine' });
    expect(userService.setPassword).toHaveBeenCalledWith('u1', 'new-hash');
    const [where] = refreshRepo.update.mock.calls[0] as unknown as [
      Record<string, unknown>,
    ];
    expect(where.userId).toBe('u1');
    expect(where.familyId).toBeDefined();
  });

  it('revokes every session when no refresh token is given', async () => {
    const { service, refreshRepo } = setup({ passwordOk: true });
    await service.changePassword('u1', DTO);
    const [where] = refreshRepo.update.mock.calls[0] as unknown as [
      Record<string, unknown>,
    ];
    expect(where.familyId).toBeUndefined();
  });
});

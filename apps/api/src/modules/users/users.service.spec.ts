import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

// @nestjs/typeorm is ESM-only; only its injection decorator is needed here.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

describe('UserService.listCustomers', () => {
  const setup = () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: 'u1',
          first_name: 'An',
          last_name: 'Nguyen',
          username: 'an',
          email: 'an@example.com',
          created_at: new Date('2026-11-01'),
          order_count: 2,
          total_spent: '450000',
          hashed_password: 'must-not-leak',
        },
      ])
      .mockResolvedValueOnce([{ count: '1' }]);
    const service = new UserService(
      { query } as unknown as Repository<User>,
      {} as never,
    );
    return { service, query };
  };

  it('maps rows to a safe shape with numeric totals', async () => {
    const { service } = setup();
    const result = await service.listCustomers({ page: 1, limit: 10 });
    expect(result.total).toBe(1);
    expect(result.items[0]).toEqual({
      id: 'u1',
      firstName: 'An',
      lastName: 'Nguyen',
      username: 'an',
      email: 'an@example.com',
      createdAt: new Date('2026-11-01'),
      orderCount: 2,
      totalSpent: 450000,
    });
    expect(JSON.stringify(result)).not.toContain('must-not-leak');
  });

  it('never selects the password hash and escapes LIKE wildcards', async () => {
    const { service, query } = setup();
    await service.listCustomers({ page: 2, limit: 5, q: '50%_off' });
    const [sql, params] = query.mock.calls[0];
    expect(sql).not.toContain('hashed_password');
    expect(params).toEqual(['%50\\%\\_off%', 5, 5]);
  });
});

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AddressService, MAX_ADDRESSES } from './address.service';
import { Address } from './entities/address.entity';

// @nestjs/typeorm is ESM-only; only its injection decorator is needed here.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

const DTO = {
  title: 'Home',
  addressLine1: '1 Le Loi',
  city: 'Ho Chi Minh',
  postalCode: '70000',
  phoneNumber: '0901234567',
};

function setup(rows: Address[] = []) {
  const repo = {
    countBy: jest.fn(
      async ({ userId }) => rows.filter((r) => r.userId === userId).length,
    ),
    findOneBy: jest.fn(
      async ({ id, userId }) =>
        rows.find((r) => r.id === id && r.userId === userId) ?? null,
    ),
    save: jest.fn(async (a: Address) => {
      if (!rows.includes(a)) rows.push(a);
      return a;
    }),
    remove: jest.fn(async (a: Address) => {
      rows.splice(rows.indexOf(a), 1);
    }),
    find: jest.fn(),
  };
  return {
    service: new AddressService(repo as unknown as Repository<Address>),
    rows,
    repo,
  };
}

describe('AddressService', () => {
  it('creates an address for the user with Vietnam as the default country', async () => {
    const { service } = setup();
    const created = await service.create('u1', DTO);
    expect(created).toMatchObject({
      userId: 'u1',
      country: 'VN',
      addressLine2: null,
    });
  });

  it('stops at the address limit', async () => {
    const rows = Array.from(
      { length: MAX_ADDRESSES },
      (_, i) => new Address({ id: `a${i}`, userId: 'u1' }),
    );
    const { service } = setup(rows);
    await expect(service.create('u1', DTO)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('updates only fields that were sent and can clear the second line', async () => {
    const existing = new Address({
      id: 'a1',
      userId: 'u1',
      ...DTO,
      country: 'VN',
      addressLine2: 'Floor 2',
    });
    const { service } = setup([existing]);
    const updated = await service.update('u1', 'a1', {
      city: 'Hanoi',
      addressLine2: '',
    });
    expect(updated).toMatchObject({
      city: 'Hanoi',
      title: 'Home',
      addressLine2: null,
    });
  });

  it("treats another user's address as missing", async () => {
    const { service } = setup([
      new Address({ id: 'a1', userId: 'u2', ...DTO }),
    ]);
    await expect(
      service.update('u1', 'a1', { city: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove('u1', 'a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes the caller’s own address', async () => {
    const { service, rows } = setup([
      new Address({ id: 'a1', userId: 'u1', ...DTO }),
    ]);
    await service.remove('u1', 'a1');
    expect(rows).toHaveLength(0);
  });
});

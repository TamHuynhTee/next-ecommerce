import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListProductsDto, MAX_PAGE } from './list-products.dto';

const errorsFor = async (plain: Record<string, string>) =>
  (await validate(plainToInstance(ListProductsDto, plain))).map(
    (e) => e.property,
  );

describe('ListProductsDto', () => {
  it('accepts normal values', async () => {
    expect(
      await errorsFor({
        page: '3',
        limit: '12',
        minPrice: '0',
        maxPrice: '900000',
      }),
    ).toEqual([]);
  });

  it('accepts the highest allowed page', async () => {
    expect(await errorsFor({ page: String(MAX_PAGE) })).toEqual([]);
  });

  it('rejects a page that would overflow the offset', async () => {
    expect(await errorsFor({ page: '99999999999999999999' })).toEqual(['page']);
  });

  it('rejects prices beyond the database integer range', async () => {
    expect(
      await errorsFor({ minPrice: '1e30', maxPrice: '99999999999999999999' }),
    ).toEqual(['minPrice', 'maxPrice']);
  });
});

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { Repository } from 'typeorm';
import { CreateAddressDto, UpdateAddressDto } from './dto/account.dto';
import { Address } from './entities/address.entity';

export const MAX_ADDRESSES = 10;
const DEFAULT_COUNTRY = 'VN';

/** A user's saved delivery addresses. Every method is scoped to that user. */
@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address) private readonly repo: Repository<Address>,
  ) {}

  /** Most recently used first, so the checkout can preselect the first one. */
  list(userId: string) {
    return this.repo.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async create(userId: string, dto: CreateAddressDto) {
    if ((await this.repo.countBy({ userId })) >= MAX_ADDRESSES) {
      throw new BadRequestException(ERROR_CODE.ADDRESS_LIMIT_REACHED);
    }
    return this.repo.save(
      new Address({
        userId,
        title: dto.title,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country ?? DEFAULT_COUNTRY,
        phoneNumber: dto.phoneNumber,
      }),
    );
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.find(userId, id);
    Object.assign(address, {
      ...dto,
      ...(dto.addressLine2 !== undefined
        ? { addressLine2: dto.addressLine2 || null }
        : {}),
    });
    return this.repo.save(address);
  }

  async remove(userId: string, id: string) {
    const address = await this.find(userId, id);
    await this.repo.remove(address);
  }

  /** Someone else's address gets the same 404 as a missing one. */
  private async find(userId: string, id: string) {
    const address = await this.repo.findOneBy({ id, userId });
    if (!address) throw new NotFoundException(ERROR_CODE.ADDRESS_NOT_FOUND);
    return address;
  }
}

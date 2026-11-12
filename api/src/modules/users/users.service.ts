import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ERROR_CODE,
  POSTGRES_ERROR_CODE,
} from 'src/common/constants/error-code';
import { QueryFailedError, Repository } from 'typeorm';
import { CredentialService } from '../auth/credential.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UNIQUE_EMAIL_CONSTRAINT,
  UNIQUE_USERNAME_CONSTRAINT,
  User,
} from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly credentialService: CredentialService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await this.credentialService.hash(data.password);
      const user = this.userRepo.create({
        ...data,
        hashedPassword,
      });

      return new User(await this.userRepo.save(user));
    } catch (error) {
      // Handle concurrent create request error
      if (
        error instanceof QueryFailedError &&
        error?.driverError?.code === POSTGRES_ERROR_CODE.UNIQUE_VIOLATION
      ) {
        const constraint = error.driverError?.constraint;

        if (constraint === UNIQUE_USERNAME_CONSTRAINT)
          throw new ConflictException(ERROR_CODE.USERNAME_EXISTED);

        if (constraint === UNIQUE_EMAIL_CONSTRAINT)
          throw new ConflictException(ERROR_CODE.EMAIL_EXISTED);

        throw new ConflictException(ERROR_CODE.EMAIL_OR_USERNAME_EXIST);
      }

      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    return this.userRepo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepo.findOneBy({ email });
  }
}

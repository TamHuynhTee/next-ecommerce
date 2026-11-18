import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ERROR_CODE,
  POSTGRES_ERROR_CODE,
} from 'src/common/constants/error-code';
import { QueryFailedError, Repository } from 'typeorm';
import { CredentialService } from '../auth/credential.service';
import { ListCustomersDto } from './dto/list-customers.dto';
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

  /**
   * Back-office customer list with order totals. Only safe columns are
   * selected, so password hashes never leave the database.
   */
  async listCustomers({ page = 1, limit = 10, q }: ListCustomersDto) {
    const term = q?.trim();
    const pattern = term
      ? `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
      : null;
    const where = `u.role = 'user' AND ($1::text IS NULL
      OR u.email ILIKE $1 OR u.username ILIKE $1
      OR CONCAT(u.first_name, ' ', u.last_name) ILIKE $1)`;

    const rows: Array<{
      id: string;
      first_name: string;
      last_name: string;
      username: string;
      email: string;
      created_at: Date;
      order_count: number;
      total_spent: string;
    }> = await this.userRepo.query(
      `SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.created_at,
              COUNT(o.id) FILTER (WHERE o.status <> 'cancelled')::int AS order_count,
              COALESCE(SUM(o.total_amount) FILTER (WHERE o.status <> 'cancelled'), 0) AS total_spent
         FROM users u
         LEFT JOIN order_details o ON o.user_id = u.id
        WHERE ${where}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT $2 OFFSET $3`,
      [pattern, limit, (page - 1) * limit],
    );
    const [{ count }] = await this.userRepo.query(
      `SELECT COUNT(*) AS count FROM users u WHERE ${where}`,
      [pattern],
    );

    return {
      items: rows.map((r) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        username: r.username,
        email: r.email,
        createdAt: r.created_at,
        orderCount: r.order_count,
        totalSpent: Number(r.total_spent),
      })),
      total: Number(count),
      page,
      limit,
    };
  }
}

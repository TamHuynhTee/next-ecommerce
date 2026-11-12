import { User } from 'src/modules/users/entities/user.entity';

export type JwtPayload = {
  sub: string;
  user: Partial<User>;
};

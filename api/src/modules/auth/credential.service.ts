import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CredentialService {
  async hash(password: string): Promise<string> {
    const saltedRound = 10;
    return await bcrypt.hash(password, saltedRound);
  }

  async verify(password: string, dbPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, dbPassword);
  }
}

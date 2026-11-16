import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Role } from '../src/common/enums/role.enum';
import { CredentialService } from '../src/modules/auth/credential.service';
import { User } from '../src/modules/users/entities/user.entity';

// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm nx run api:seed:admin
// Creates an admin user, or promotes the existing user with that email.
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const repo = app.get(DataSource).getRepository(User);
    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      await repo.update({ id: existing.id }, { role: Role.Admin });
      console.log(`Promoted ${email} to admin`);
      return;
    }
    const hashedPassword = await app.get(CredentialService).hash(password);
    await repo.save(
      repo.create({
        email,
        hashedPassword,
        username: email.split('@')[0].slice(0, 24),
        firstName: 'Admin',
        lastName: 'User',
        role: Role.Admin,
      }),
    );
    console.log(`Created admin ${email}`);
  } finally {
    await app.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

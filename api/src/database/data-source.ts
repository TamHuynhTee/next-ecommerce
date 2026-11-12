import 'reflect-metadata';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabaseOptions } from './database.config';

export default (async () => {
  await ConfigModule.forRoot({
    envFilePath: process.env.ENV_FILE ?? '.env',
  });

  return new DataSource(
    createDatabaseOptions(new ConfigService()) as DataSourceOptions,
  );
})();

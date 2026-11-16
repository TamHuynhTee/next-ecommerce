import 'reflect-metadata';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { configuration } from '../config/configuration';
import { createDatabaseOptions } from './database.config';

export default (async () => {
  await ConfigModule.forRoot({
    envFilePath: process.env.ENV_FILE ?? '.env.local',
  });

  return new DataSource(
    // Pass the mapped config explicitly; a bare ConfigService cannot resolve keys like `database.password`.
    createDatabaseOptions(
      new ConfigService(configuration()),
    ) as DataSourceOptions,
  );
})();

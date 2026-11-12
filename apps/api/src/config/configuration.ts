export default () => ({
  is_dev: process.env.NODE_ENV === 'development',
  app_port: parseInt(process.env.APP_PORT ?? '', 10) || 8100,
  database: {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
    name: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret_key: process.env.JWT_SECRET || '',
    expire_in: process.env.JWT_EXPIRE_IN || '5M',
  },
});

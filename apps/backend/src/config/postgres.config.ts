import { registerAs } from '@nestjs/config';
import { PostgresConfig } from './types/postgres';

export default registerAs(
	'postgresConfig',
	(): PostgresConfig =>
		({
			host: process.env.PGSQL_HOST ?? 'postgres',
			port: process.env.PGSQL_PORT
				? parseInt(process.env.PGSQL_PORT)
				: 5432,
			database: process.env.PGSQL_DB ?? 'snowledge',
			username: process.env.PGSQL_NAME ?? 'postgres',
			password: process.env.PGSQL_PWD ?? 'postgres',
			ssl: process.env.PGSQL_HOST !== 'postgres' ? true : false,
			extra: {
				ssl: {
					rejectUnauthorized: false,
				},
			},
		}) as any,
);

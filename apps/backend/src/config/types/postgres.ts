export interface PostgresConfig {
	host: string;
	port: number;
	database: string;
	username?: string;
	password?: string;
	ssl?: boolean | { rejectUnauthorized: boolean };
}

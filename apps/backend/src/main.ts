import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	console.log(
		'process.env.NODE_EXTRA_CA_CERTS',
		process.env.NODE_EXTRA_CA_CERTS,
	);
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector)),
	);

	// Middleware de logging pour le debug
	app.use((req, res, next) => {
		const logger = new Logger('HTTP');
		if (req.path.includes('/auth/refresh-token')) {
			logger.debug(`Refresh token request: ${req.method} ${req.path}`);
		}
		next();
	});

	// Définir un préfixe api
	app.setGlobalPrefix('api');
	const configService = app.get(ConfigService);
	app.enableCors(configService.get('serverConfig.cors'));
	app.use(cookieParser());
	const swagger = process.env.SWAGGER ? JSON.parse(process.env.SWAGGER) : '';
	console.log('swagger', swagger);
	if (swagger) {
		const config = new DocumentBuilder()
			.addBearerAuth(
				{
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					name: 'JWT',
					in: 'header',
				},
				'access_token',
			)
			.setBasePath('api')
			.setTitle('Snowlegde')
			.setDescription('The Snowledge API description')
			.setVersion('1.0')
			.addSecurityRequirements('access_token')
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('swagger', app, document);
	}

	await app.listen(configService.get('serverConfig.port'));

	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://51.75.68.69:3006',
    ],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,              // only if you use cookies/Authorization header
    exposedHeaders: ['Content-Disposition'], // e.g., for file downloads
    maxAge: 600,                    // cache preflight (seconds)
  });
  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();

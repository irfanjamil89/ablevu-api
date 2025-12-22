import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { WinstonModule } from 'nest-winston';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

  const app = await NestFactory.create(AppModule,{
    logger: WinstonModule.createLogger({
      transports: [
        // Console logging
        new winston.transports.Console({
          format: winston.format.simple(),
        }),

        // File logging with rotation
        new (winston.transports.DailyRotateFile)({
          dirname: 'logs',                 // log folder
          filename: 'app-%DATE%.log',      // log file name pattern
          datePattern: 'YYYY-MM-DD',       // daily rotation
          zippedArchive: true,             // compress rotated logs
          maxSize: '20m',                  // max file size
          maxFiles: '14d',                 // keep logs for 14 days
          level: 'info',
        }),
      ],
    }),
  });
    app.enableCors({
    // origin: [
    //   'http://localhost:3000',
    //   'http://127.0.0.1:3000',
    //   'http://51.75.68.69:3006',
    //   'https://ablevu-webapp.vercel.app'
    // ],
    origin: '*',
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,              // only if you use cookies/Authorization header
    exposedHeaders: ['Content-Disposition'], // e.g., for file downloads
    maxAge: 600,                    // cache preflight (seconds)
  });

  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(bodyParser.json({ limit: '5mb' }));
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();

// src/data-source.ts
import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false, // or { rejectUnauthorized: false } for hosted DBs like Neon/Supabase
  synchronize: false,
  logging: true,
//  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
});

export default AppDataSource;

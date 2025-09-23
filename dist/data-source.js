"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set — falling back to SQLite dev database at ./dev.sqlite');
}
const isPostgres = !!process.env.DATABASE_URL;
// Determinar se estamos em ambiente de desenvolvimento ou produção
const isDevelopment = process.env.NODE_ENV !== 'production';
const entityExtension = isDevelopment ? 'ts' : 'js';
exports.AppDataSource = new typeorm_1.DataSource(isPostgres
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: true,
        logging: false,
        entities: [path_1.default.join(__dirname, 'entities', `*.${entityExtension}`)],
        migrations: [
            path_1.default.join(__dirname, 'migrations', `*.${entityExtension}`),
            path_1.default.join(process.cwd(), 'migrations', `*.${entityExtension}`),
        ]
    }
    : {
        type: 'sqlite',
        database: path_1.default.join(process.cwd(), 'dev.sqlite'),
        synchronize: true,
        logging: false,
        entities: [path_1.default.join(__dirname, 'entities', `*.${entityExtension}`)]
    });

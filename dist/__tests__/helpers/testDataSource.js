"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
// Importar entidades diretamente evita problemas com glob e extensões (.ts/.js)
const User_1 = require("../../entities/User");
const UserSession_1 = require("../../entities/UserSession");
const Member_1 = require("../../entities/Member");
const Congregacao_1 = require("../../entities/Congregacao");
const Family_1 = require("../../entities/Family");
const Role_1 = require("../../entities/Role");
const AuditLog_1 = require("../../entities/AuditLog");
// Criar lista de entidades fixa para evitar problemas com globs em testes
const entities = [User_1.User, UserSession_1.UserSession, Member_1.Member, Congregacao_1.Congregacao, Family_1.Family, Role_1.Role, AuditLog_1.AuditLog];
// Declarar a variável e atribuir condicionalmente
let _testDataSource;
if (process.env.DATABASE_URL) {
    // Usar Postgres com synchronize habilitado para testes (mais simples e confiável)
    _testDataSource = new typeorm_1.DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: true, // Habilitado para testes para maior simplicidade
        logging: false,
        entities,
        migrations: [
            path_1.default.join(process.cwd(), 'migrations', '*.ts'),
            path_1.default.join(__dirname, '../../migrations', '*.ts')
        ]
    });
}
else {
    // DataSource específico para testes com banco em memória (SQLite pode usar synchronize)
    _testDataSource = new typeorm_1.DataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities
    });
}
exports.TestDataSource = _testDataSource;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
// Importar entidades diretamente evita problemas com glob e extensões (.ts/.js)
const User_1 = require("../../entities/User");
const UserSession_1 = require("../../entities/UserSession");
const Member_1 = require("../../entities/Member");
const Congregacao_1 = require("../../entities/Congregacao");
const Family_1 = require("../../entities/Family");
const Role_1 = require("../../entities/Role");
const AuditLog_1 = require("../../entities/AuditLog");
// DataSource específico para testes com banco em memória
exports.TestDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [User_1.User, UserSession_1.UserSession, Member_1.Member, Congregacao_1.Congregacao, Family_1.Family, Role_1.Role, AuditLog_1.AuditLog]
});

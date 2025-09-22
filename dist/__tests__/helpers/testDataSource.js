"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
// Importar entidades diretamente evita problemas com glob e extensões (.ts/.js)
const User_1 = require("../../entities/User");
const UserSession_1 = require("../../entities/UserSession");
const Member_1 = require("../../entities/Member");
// DataSource específico para testes com banco em memória
exports.TestDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [User_1.User, UserSession_1.UserSession, Member_1.Member]
});

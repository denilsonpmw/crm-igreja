"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Member = void 0;
const typeorm_1 = require("typeorm");
const Congregacao_1 = require("./Congregacao");
const Family_1 = require("./Family");
let Member = class Member {
};
exports.Member = Member;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Member.prototype, "membro_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "congregacao_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "familia_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Member.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 14, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "cpf", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Member.prototype, "data_nascimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "sexo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "estado_civil", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "profissao", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "telefone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "endereco", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "cep", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "cidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Member.prototype, "data_conversao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Member.prototype, "data_batismo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'ativo' }),
    __metadata("design:type", String)
], Member.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "ministerios", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "foto_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Member.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Member.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Congregacao_1.Congregacao, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'congregacao_id' }),
    __metadata("design:type", Congregacao_1.Congregacao)
], Member.prototype, "congregacao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Family_1.Family, familia => familia.membros, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'familia_id' }),
    __metadata("design:type", Family_1.Family)
], Member.prototype, "familia", void 0);
exports.Member = Member = __decorate([
    (0, typeorm_1.Entity)('membros')
], Member);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Member_1 = require("../entities/Member");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const items = await repo.find();
    res.json(items);
});
router.post('/', async (req, res) => {
    const { nome, cpf, telefone } = req.body;
    if (!nome)
        return res.status(400).json({ message: 'Missing nome' });
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const m = repo.create({ nome, cpf, telefone });
    await repo.save(m);
    res.status(201).json(m);
});
exports.default = router;

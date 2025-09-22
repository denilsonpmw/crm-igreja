"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const auth_1 = __importDefault(require("./routes/auth"));
const members_1 = __importDefault(require("./routes/members"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/members', members_1.default);
const PORT = Number(process.env.PORT) || 3001;
async function startServer(port = PORT) {
    try {
        await data_source_1.AppDataSource.initialize();
        return new Promise((resolve) => {
            app.listen(port, () => {
                console.log(`Server running on port ${port}`);
                resolve();
            });
        });
    }
    catch (err) {
        console.error('Error during Data Source initialization', err);
        throw err;
    }
}
// Iniciar automaticamente exceto em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
    startServer().catch(() => process.exit(1));
}
exports.default = app;

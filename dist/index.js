"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const auth_1 = __importDefault(require("./routes/auth"));
const members_1 = __importDefault(require("./routes/members"));
const congregations_1 = __importDefault(require("./routes/congregations"));
const families_1 = __importDefault(require("./routes/families"));
const tenant_1 = require("./middlewares/tenant");
const roles_1 = __importDefault(require("./routes/roles"));
const audit_1 = __importDefault(require("./routes/audit"));
const imports_1 = __importDefault(require("./routes/imports"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configurar CORS para desenvolvimento
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-congregacao-id']
}));
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
app.use('/auth', auth_1.default);
app.use('/members', members_1.default);
app.use('/roles', roles_1.default);
app.use('/audit', audit_1.default);
app.use('/import', imports_1.default);
// middleware de tenant (simples) e rota de congregações e famílias
app.use(tenant_1.tenantMiddleware);
app.use('/congregations', congregations_1.default);
app.use('/families', families_1.default);
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

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth';
import membersRouter from './routes/members';
import congregationsRouter from './routes/congregations';
import familiesRouter from './routes/families';
import { tenantMiddleware } from './middlewares/tenant';
import rolesRouter from './routes/roles';
import auditRouter from './routes/audit';
import importRouter from './routes/imports';

dotenv.config();

const app = express();

// Configurar CORS para desenvolvimento
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-congregacao-id']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/auth', authRouter);
app.use('/members', membersRouter);
app.use('/roles', rolesRouter);
app.use('/audit', auditRouter);
app.use('/import', importRouter);
// middleware de tenant (simples) e rota de congregações e famílias
app.use(tenantMiddleware);
app.use('/congregations', congregationsRouter);
app.use('/families', familiesRouter);

const PORT = Number(process.env.PORT) || 3001;

export async function startServer(port: number = PORT) {
  try {
    await AppDataSource.initialize();
    
    // Se usando Postgres, executar migrations
    if (process.env.DATABASE_URL) {
      await AppDataSource.runMigrations();
      console.log('Database migrations executed successfully');
    }
    
    return new Promise<void>((resolve) => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        resolve();
      });
    });
  } catch (err) {
    console.error('Error during Data Source initialization', err);
    throw err;
  }
}

// Iniciar automaticamente exceto em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(() => process.exit(1));
}

export default app;

import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    congregacao_id?: string | null;
    user_id?: string | null;
  }
}

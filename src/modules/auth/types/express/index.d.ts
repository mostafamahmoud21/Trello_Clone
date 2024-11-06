// @types/express/index.d.ts
import express from 'express';
export interface User {
    id: string; 
    email: string;
    // Add any other user properties you need
  }
declare global {
  namespace Express {

    interface Request {
      user?: User; // This makes req.user optional
    }
  }
}

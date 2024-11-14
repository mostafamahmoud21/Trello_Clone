// @types/express/index.d.ts
import express from 'express';
import { Roles } from '../../enums/role.enum';
export interface User {
    id: string; 
    email: string;
    role:Roles
    // Add any other user properties you need
  }
declare global {
  namespace Express {

    interface Request {
      user?: User; // This makes req.user optional
    }
  }
}

import AppError from "../../shared/utils/appError.js";
import type { Request } from 'express';
import type { CorsOptions } from 'cors';

// הגדרת טיפוס למילון הלקוחות
const clients: Record<string, string> = process.env.CORS_CLIENTS 
  ? JSON.parse(process.env.CORS_CLIENTS) 
  : {};

/**
 * כדי שהלוגיקה הדינמית שלך תעבוד, אנחנו חייבים להגדיר את כל האובייקט 
 * כפונקציה אחת (Delegate) שמקבלת את ה-Request.
 */
const corsOptionsDelegate = (req: Request, callback: (err: Error | null, options?: CorsOptions) => void) => {
  const origin = req.header('Origin') || '';
  const clientType = clients[origin];

  // לוגיקה לבדיקת ה-Origin
  if (origin && !clientType) {
    return callback(new AppError('Not allowed by CORS', 403));
  }

  // לוגיקה דינמית למתודות
  let allowedMethods = ['GET', 'POST'];
  if (clientType === 'storefront' || clientType === 'crm') {
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (clientType === 'crm') allowedMethods.push('PATCH');
  }

  // לוגיקה דינמית ל-Credentials
  const isAllowedCredentials = clientType === 'storefront' || clientType === 'crm';

  // בניית אובייקט ההגדרות הסופי עבור הבקשה הספציפית הזו
  const options: CorsOptions = {
    origin: true, 
    methods: allowedMethods,
    credentials: isAllowedCredentials,
    optionsSuccessStatus: 200
  };

  callback(null, options);
};

export default corsOptionsDelegate;
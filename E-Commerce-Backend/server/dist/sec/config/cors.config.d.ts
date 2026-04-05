import type { Request } from 'express';
import type { CorsOptions } from 'cors';
/**
 * כדי שהלוגיקה הדינמית שלך תעבוד, אנחנו חייבים להגדיר את כל האובייקט
 * כפונקציה אחת (Delegate) שמקבלת את ה-Request.
 */
declare const corsOptionsDelegate: (req: Request, callback: (err: Error | null, options?: CorsOptions) => void) => void;
export default corsOptionsDelegate;
//# sourceMappingURL=cors.config.d.ts.map
import AppError from "../../shared/utils/appError.js";


const clients = process.env.CORS_CLIENTS ? JSON.parse(process.env.CORS_CLIENTS) : {};

const corsOptions = {
  origin: (origin, callback) => {
    // מאפשר ל-Postman לעבוד (כשאין origin)
    if (!origin) return callback(null, true);

    // בודק אם ה-Origin קיים ברשימת הלקוחות שלנו
    if (clients[origin]) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS'));
    }
  },
  
  // הגדרה דינמית של מתודות ו-Credentials לפי סוג הלקוח
  methods: (req, callback) => {
    const origin = req.header('Origin');
    const clientType = clients[origin];
    
    let allowedMethods = ['GET', 'POST']; // ברירת מחדל (כמו ב-Mobile)

    if (clientType === 'storefront' || clientType === 'crm') {
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
      
      if (clientType === 'crm') allowedMethods.push('PATCH');
    }

    callback(null, allowedMethods.join(','));
  },

  credentials: (req, callback) => {
    const origin = req.header('Origin');
    const clientType = clients[origin];
    
    // storefront ו-crm מקבלים true, השאר (כולל mobile) מקבלים false
    const isAllowed = clientType === 'storefront' || clientType === 'crm';
    callback(null, isAllowed);
  },

  optionsSuccessStatus: 200
};

export default corsOptions;
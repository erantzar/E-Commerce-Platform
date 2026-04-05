declare class AppError extends Error {
    statusCode: number;
    status: "fail" | "error";
    constructor(message: string, statusCode: number);
}
export default AppError;
//# sourceMappingURL=appError.d.ts.map
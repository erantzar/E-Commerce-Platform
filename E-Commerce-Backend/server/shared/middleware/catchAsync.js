export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // .catch(next) sends the error to global handler
    };
};
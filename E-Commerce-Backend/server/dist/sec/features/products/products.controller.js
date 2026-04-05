import Product from "./products.model.js";
import { catchAsync } from "../../../shared/middleware/catchAsync.js";
import AppError from "../../../shared/utils/appError.js";
/**
 * @desc    Create a new product
 * @route   POST /products
 * @access  Admin
 */
export const createProduct = catchAsync(async (req, res, next) => {
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        req.body.images = req.files.map((file) => file.path);
    }
    const newProduct = await Product.create(req.body);
    res.status(201).json({
        status: "success",
        data: newProduct,
    });
});
/**
 * @desc    Get all products with pagination, filtering and sorting
 * @route   GET /products
 * @access  Public
 */
export const getAllProducts = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, sort, category, minPrice, maxPrice, search, isActive, } = req.query;
    // ── 1. BUILD FILTER OBJECT ──────────────────────────────────────
    const filter = {};
    if (category) {
        filter.category = category;
    }
    if (minPrice || maxPrice) {
        const priceFilter = {};
        if (minPrice)
            priceFilter.$gte = Number(minPrice);
        if (maxPrice)
            priceFilter.$lte = Number(maxPrice);
        filter.price = priceFilter;
    }
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }
    else {
        filter.isActive = true;
    }
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    // ── 2. BUILD SORT OBJECT ────────────────────────────────────────
    //let sortBy: any = { createdAt: -1 };
    let sortBy = { createdAt: -1 };
    if (sort) {
        sortBy = sort.split(",").join(" ");
    }
    // ── 3. PAGINATION ───────────────────────────────────────────────
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    // ── 4. EXECUTE QUERY ────────────────────────────────────────────
    const [products, totalProducts] = await Promise.all([
        Product.find(filter).sort(sortBy).skip(skip).limit(limitNum).select("-ratings").lean(),
        Product.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalProducts / limitNum);
    // ── 5. SEND RESPONSE ────────────────────────────────────────────
    res.status(200).json({
        status: "success",
        results: products.length,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalProducts,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
        },
        data: { products },
    });
});
/**
 * @desc    Get a single product by ID
 * @route   GET /products/:id
 * @access  Public
 */
export const getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).lean();
    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: product,
    });
});
/**
 * @desc    Get all products by category
 * @route   GET /products/:cat/category
 * @access  Public
 */
export const getProductByCategory = catchAsync(async (req, res, next) => {
    const { cat } = req.params;
    if (!cat || cat === "") {
        return next(new AppError("Category is required", 404));
    }
    const products = await Product.find({ category: cat }).lean();
    if (products.length === 0) {
        return next(new AppError(`No items found in category: ${cat}`, 404));
    }
    res.status(200).json({
        status: "success",
        data: products,
    });
});
/**
 * @desc    Add a rating to a product
 * @route   POST /products/:id/rating
 * @access  Confirmed User
 */
export const addProductRating = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }
    const newRating = {
        rating: Number(rating),
        comment,
        user: req.user.id,
    };
    product.ratings.push(newRating);
    const totalRatings = product.ratings.length;
    const sumRatings = product.ratings.reduce((acc, item) => acc + item.rating, 0);
    product.averageRating = sumRatings / totalRatings;
    await product.save();
    res.status(201).json({
        status: "success",
        data: {
            averageRating: product.averageRating,
            ratings: product.ratings,
        },
    });
});
/**
 * @desc    Update a product
 * @route   PUT /products/:id
 * @access  Admin
 */
export const updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const forbiddenFields = ["sold", "ratings", "averageRating"];
    forbiddenFields.forEach((field) => delete req.body[field]);
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        req.body.images = req.files.map((file) => file.path);
    }
    const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: { product },
    });
});
/**
 * @desc    Soft delete a product (sets isActive to false)
 * @route   DELETE /products/:id
 * @access  Admin
 */
export const deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        message: "Product deactivated successfully",
        data: { product },
    });
});
//# sourceMappingURL=products.controller.js.map
import Product from './products.model.js';
import { catchAsync } from '../../../shared/middleware/catchAsync.js';
import AppError from '../../../shared/utils/appError.js';

/**
 * @desc    Create a new product
 * @route   POST http://localhost:3000/products
 * @access  Admin
 */

export const createProduct = catchAsync(async (req, res, next) => {

    const newProduct = await Product.create(req.body);


    res.status(201).json({
        status: 'success',
        data: newProduct
    });
});

/**
 * @desc    Get all products with pagination, filtering and sorting
 * @route   GET http://localhost:3000/products
 * @access  Public
 */

export const getAllProducts = catchAsync(async (req, res, next) => {
    
        const {
            page = 1,
            limit = 10,
            sort,
            category,
            minPrice,
            maxPrice,
            search,
            isActive
        } = req.query;

        // ── 1. BUILD FILTER OBJECT ──────────────────────────────────────
        const filter = {};

        // Filter by category
        if (category) {
            filter.category = category;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Filter by active status (default: show only active products)
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        } else {
            filter.isActive = true;
        }

        // Search by name or description
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // ── 2. BUILD SORT OBJECT ────────────────────────────────────────
        // Default: newest first
        // Examples: sort=price (asc), sort=-price (desc), sort=-createdAt
        let sortBy = { createdAt: -1 };

        if (sort) {
            const sortFields = sort.split(',').join(' '); // support: sort=price,name
            sortBy = sortFields;
        }

        // ── 3. PAGINATION ───────────────────────────────────────────────
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit))); // max 50 per page
        const skip = (pageNum - 1) * limitNum;

        // ── 4. EXECUTE QUERY ────────────────────────────────────────────
        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .sort(sortBy)
                .skip(skip)
                .limit(limitNum)
                .select('-ratings'), // exclude the full ratings array for performance
            Product.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalProducts / limitNum);

        // ── 5. SEND RESPONSE ────────────────────────────────────────────
        res.status(200).json({
            status: 'success',
            results: products.length,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalProducts,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            data: {
                products
            }
        });
    
});

/**
 * @desc    Get a single product by ID
 * @route   GET http://localhost:3000/products/:id
 * @access  Public
 */

export const getProductById = catchAsync(async(req,res,next) => {
    const {id} = req.params
    
    const product = await Product.findById(id);
    if (!product){
        return next(new AppError('No product found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: product
    })
})

/**
 * @desc    Get all products by category
 * @route   GET http://localhost:3000/products/category/:category
 * @access  Public 
 */

export const getProductByCategory = catchAsync(async(req,res,next) => {
    const {category} = req.params
    
    if(!category || category == ""){
        console.log('here');
        
        return next(new AppError('category is requierd', 404))
    }
    const products = await Product.find({category})

    if (products.length === 0) { 
        return next(new AppError(`No items found in category: ${category}`, 404));
      }

    res.status(200).json({
        status: 'success',
        data: products
    })
})

/**
 * @desc    Create new rating for product by id
 * @route   GET http://localhost:3000/products/category/:category
 * @access  Confrimed User
 */

export const addProductRating = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    //Add the rating object (In a real app, 'user' would come from req.user.id)
    const newRating = {
        rating: Number(rating),
        comment,
        user: req.body.user // Temporarily taking user from body until Auth is ready
    };

    product.ratings.push(newRating);

    //Simple math to update averageRating
    const totalRatings = product.ratings.length;
    const sumRatings = product.ratings.reduce((acc, item) => item.rating + acc, 0);
    product.averageRating = sumRatings / totalRatings;

    await product.save();

    res.status(201).json({
        status: 'success',
        data: {
            averageRating: product.averageRating,
            ratings: product.ratings
        }
    });
});

/**
 * @desc    Update a product
 * @route   PUT http://localhost:3000/products/:id
 * @access  Admin
 */

export const updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    // Fields that should never be updated directly
    const forbiddenFields = ['sold', 'ratings', 'averageRating'];
    forbiddenFields.forEach(field => delete req.body[field]);
  
    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,           // return the updated document, not the old one
        runValidators: true  // run schema validators on the new values
      }
    );
  
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  });

  /**
 * @desc    Soft delete a product (sets isActive to false)
 * @route   DELETE http://localhost:3000/products/:id
 * @access  Admin
 */

  export const deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      message: 'Product deactivated successfully',
      data: { product }
    });
  });

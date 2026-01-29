const Product = require("../models/productModel");
const createHttpError = require("http-errors");

const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isAvailable: true });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { name, category_id, price, image_url, specifications, isHotDeal } = req.body;

        if (!name || (!category_id && !isHotDeal) || !price) {
            throw createHttpError(400, "Name, Price and (Category ID or Hot Deal flag) are required");
        }

        const newProduct = new Product({
            name,
            category_id,
            price,
            image_url,
            specifications,
            isHotDeal: isHotDeal || false
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: isHotDeal ? "Hot Deal created successfully" : "Product created successfully", data: newProduct });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            throw createHttpError(404, "Product not found");
        }
        res.status(200).json({ success: true, message: "Product updated", data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            throw createHttpError(404, "Product not found");
        }
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };

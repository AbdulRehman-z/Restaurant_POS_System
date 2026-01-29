const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, icon } = req.body;
        if (!name) {
            throw createHttpError(400, "Category name is required");
        }
        const newCategory = new Category({ name, icon });
        await newCategory.save();
        res.status(201).json({ success: true, message: "Category created", data: newCategory });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCategories, createCategory };

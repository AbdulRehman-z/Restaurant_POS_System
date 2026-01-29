const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const { default: mongoose } = require("mongoose");

const addOrder = async (req, res, next) => {
  try {
    const { customerDetails, items, bills, items: rawItems, table, paymentMethod } = req.body; // Adapt to whatever frontend sends, or standardise.

    // Generate Order ID: ORD-TIMESTAMP-RANDOM
    const order_id = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

    // Map items to schema if needed, or assume frontend sends correct structure.
    // Ideally frontend should send items with product_id, name, qty, price.

    const newOrder = new Order({
      order_id,
      items,
      total_amount: bills.total, // Schema calls it total_amount
      status: 'completed',
      customerDetails,
      table,
      paymentMethod
    });

    await newOrder.save();
    res
      .status(201)
      .json({ success: true, message: "Order created!", data: newOrder });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query filter
    let query = {};

    // Search by order_id or customer name
    if (search) {
      query.$or = [
        { order_id: { $regex: search, $options: "i" } },
        { "customerDetails.name": { $regex: search, $options: "i" } }
      ];
    }

    // Date Range Filter
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate).setHours(23, 59, 59, 999)
      };
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder };

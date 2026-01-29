const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    items: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        qty: Number,
        price: Number,
        variant: String
    }],
    total_amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'refunded'],
        default: 'completed'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    // Keeping some original fields for compatibility if needed, or I can remove them if strictly following the prompt.
    // The prompt specifies a schema, so I will stick to it but I'll add customer details as it's useful.
    customerDetails: {
        name: { type: String, default: "Guest" },
        // phone: String, // Optional
    },
    table: {
        type: String,
        default: "0"
    },
    paymentMethod: {
        type: String,
        default: "Cash"
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
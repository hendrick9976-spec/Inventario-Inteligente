const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    salePrice: {
      type: Number,
      required: true,
    },

    costPrice: {
      type: Number,
      required: true,
    },

    totalIncome: {
      type: Number,
      required: true,
    },

    totalCost: {
      type: Number,
      required: true,
    },

    profit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sale", saleSchema);
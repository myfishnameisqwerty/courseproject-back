const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const OrderSchema = new mongoose.Schema({
  id: String,
  orderDate: {
    type: String,
    required: true,
  },
  customer: {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    spam: {
      type: Boolean,
      required: true,
    },
    tel: {
      type: String,
      validate: {
        validator: function (v) {
          return /(?=^0)(?=^\d{10}$)/.test(v);
        },
        message: (props) => {
          return `${props.value} is not a valid phone number!`;
        },
      },
    },
  },
  address: {
    city: String,
    street: String,
    appartment: String,
  },
  paymentComfirmation: mongoose.Schema.Types.Mixed,
  orderInfo: {
    additives: [String],
    notations: String,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
    quantity: {
      type: Number,
      min: [1, "quantity value error"],
      validate: {
        validator: Number.isInteger,
        message: (props) => {
          return `${props.value} is not an integer value`;
        },
      },
    },
    variation: String,
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order_statuses",
  },
  totalSum: {
    type: Number,
    min: [0, "totalSum value error"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});
OrderSchema.plugin(aggregatePaginate);
const orderModel = mongoose.model("orders", OrderSchema);
module.exports = orderModel;

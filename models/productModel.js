const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  desc: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    min: [0, "price must be positive"],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
    require: true,
  },
  createdAt: { type: Date, default: Date.now },
  available: Boolean,
  min: {
    type: Number,
    min: [0, "min must be positive"],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
  max: {
    type: Number,
    min: [0, "max price must be positive"],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
  stars: Number,
  hash: String,
  pictures: [{ type: String }],
  tags: [{ type: String }],
  alegens: [{ type: String }],
  additives: [
    {
      additive: { type: String },
      price: {
        type: Number,
        min: [0, "price must be positive"],
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
      },
    },
  ],
  variations: [
    {
      variation: { type: String },
      price: {
        type: Number,
        min: [0, "price must be positive"],
        validate: {
          validator: Number.isInteger,
          message: "{VALUE} is not an integer value",
        },
      },
    },
  ],
});
ProductSchema.plugin(aggregatePaginate);

const ProductModel = mongoose.model("products", ProductSchema);

module.exports = ProductModel;

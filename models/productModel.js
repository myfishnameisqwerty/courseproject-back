const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const ProductSchema = new mongoose.Schema({
    id: String,
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: [0, "price must be positive"],
    required: true,
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
  star: Number,
  hash: String,
  pictures: [{ type: String }],
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "tags"
    }],
  alegens: [{ type: String }],
  additives: [
    {
      additive: { type: String },
      price: {
        type: Number,
        min: [0, "price must be positive"]
      },
    },
  ],
  variations: [
    {
      constiation: { type: String },
      price: {
        type: Number,
        min: [0, "price must be positive"]
      },
    },
  ],
});
ProductSchema.plugin(aggregatePaginate);

const ProductModel = mongoose.model("products", ProductSchema);

module.exports = ProductModel;

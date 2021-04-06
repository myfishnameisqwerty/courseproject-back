const mongoose = require("mongoose");
const newProductSchema = new mongoose.Schema({
   _id: {
      type: String
   },
   createdAt: {
      type: Date,
      required: true
   }
})
const NewProductModel = mongoose.model("New_Products", newProductSchema)
module.exports = NewProductModel
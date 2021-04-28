const Products = require("../models/productModel");
const NewProducts = require("../models/newProductModel");
const calcHash = require("object-hash");
const fs = require("fs");
const minimumNewItems = 5;
const path = require('path')

const addPictures = (images, pictures) => {

  for (let picture of pictures) {

      images[images.length] = picture.title.split(" ").join("")

      const image = picture.src
      
      const match = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      const buffer = Buffer.from(match[2], 'base64')
      fs.writeFile(path.join(__dirname, '..', 'uploads', 'images', 'products', picture.title.split(" ").join("")), buffer , { flag: 'wx' }, (err) => {
          if(err)
              console.log(err)
      })
  }
  console.log(images);
  return images
}
exports.create = async (req, res) => {
  try {
    const images = []
    
    let {pictures, ...newProduct} = req.body;
    console.log('========================================');
    newProduct.pictures = addPictures(images, pictures)
    console.log(newProduct);
    newProduct = { ...newProduct, hash: calcHash(newProduct) };
    Products.findOne({ hash: newProduct.hash }, (err, result) => {
      if (!result)
        Products.create(newProduct, (err, obj) => {
          if (err) return res.json({ errorStatus: true, error: err });
          else {
            Products.findByIdAndUpdate(
              obj._id,
              { id: obj._id },
              { new: true },
              (err, result) => {
                if (err) return res.json({ errorStatus: true, error: err });
                if (!addNewProduct(obj, res, 7)){
                  res.setHeader("Content-Range", `${result.length}`);
                  return res.json({ result });
                } 
                return res.json({
                  errorStatus: true,
                  error: "Cannot add product. Contact the support.",
                });
              }
            );
          }
        });
      else
        return res.json({
          errorStatus: true,
          message: "This product is allready exists",
        });
    });
  } catch (err) {
    res.status(500).json({ errorStatus: true, error: err });
  }
};
exports.getImage = async (req, res) =>{
  console.log("req is !!!!", req.params.id);
  var imageName = req.params.id
  return res.sendFile(path.join(__dirname, '..', 'uploads', 'images', 'products', imageName))
}
// exports.getProduct = async (req, res) => {

//     Products.findById(req.params.id, (err, result) => {
//         if (err)
//             return (res.json({errorStatus: true, error: err}))
//         else{
//             if (result){
//                 return (res.json(result))
//                 }
//             return (res.json({errorStatus: true, error: "product not found"}))
//         }
//     })
// }
exports.getProduct = async (req, res) => {
  Products.findById(req.params.id)
    .populate("tags")
    .exec((err, product) => {
      if (err) console.log(err);
      else {
        // let { tags } = product;

        // tags.forEach((tag, i) => {
        //   tags[i] = tag.name;
        // });
        // product.tags = tags;
        res.setHeader("Content-Range", `${product.length}`);
        return res.json(product);
      }
    });
};

exports.update = async (req, res) => {
  // Products.findById(req.params.id, (err, foundResult) => {
  //     if (err)    return (res.json({errorStatus: true, error: "id not found"}))
  //     let {hash, createdAt, __v, _id, ...modifiedResult} = foundResult._doc
  //     let updatedProduct = {...modifiedResult, ...req.body}
  //     console.log(updatedProduct);
  //     hash = calcHash(updatedProduct);
  //     Products.findByIdAndUpdate(req.params.id, {...req.body, hash}, {new: true}, (err, result) => {
  //         if (err)     return (res.json({errorStatus: true, error: err}))
  //         return (res.json({errorStatus: false, data: result}))
  //     })
  // })
  Products.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true },
    (err, result) => {
      if (err) return res.json({ errorStatus: true, error: err });
      res.setHeader("Content-Range", `${result.length}`);
      return res.json(result);
    }
  );
};
exports.delete = (req, res) => {
  Products.findByIdAndDelete(req.params.id, (error, obj) => {
    if (error) return res.json({ errorStatus: true, error });
    if (!obj) return res.json({ errorStatus: true, error: "wrong id" });
    NewProducts.findByIdAndDelete(req.params.id, (err) => {
      logError("cannot find new_product", err);
    });
    res.setHeader("Content-Range", `${obj.length}`);
    return res.json(obj);
  });
};

exports.index = async (req, res) => {
  const limit_ = 10;
  let aggregate_options = [];

  //PAGINATION
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || limit_;

  //set the options for pagination
  let options = {
    page,
    limit,
    collation: { locale: "en" },
    populate: ["tags"],
    customLabels: {
      totalDocs: "totalResults",
      docs: "products",
    },
  };

  let match = {};
  if (req.query.range) {
    let [from, to] = JSON.parse(req.query.range);
    options.limit = to + 1 - from;
    options.page = (to + 1) / options.limit;
  }

  if (req.query.filter && Object.keys(JSON.parse(req.query.filter)).length) {
    let search = JSON.parse(req.query.filter);
    let query = "";
    if (Array.isArray(search[Object.keys(search)[0]])) {
      search[Object.keys(search)[0]].forEach((element) => {
        if (query) query += `|${element}`;
        else query = element;
      });
    } else {
      query = search[Object.keys(search)[0]];
    }
    match[Object.keys(search)[0]] = { $regex: query, $options: "i" };
    aggregate_options.push({ $match: match });
  }

  if (req.query.sort) {
    let [sortBy, sortOrder] = JSON.parse(req.query.sort);
    sortOrder = sortOrder.toLowerCase() === "desc" ? -1 : 1;
    aggregate_options.push({ $sort: { [sortBy]: sortOrder } });
  }

  const myAggregate = Products.aggregate(aggregate_options);
  const result = await Products.aggregatePaginate(myAggregate, options);

  res.setHeader("Content-Range", `${result.products.length}`);
  res.status(200).json(result.products);
};

function addNewProduct(obj, res, keepLastDays) {
  let errorStatus = false;
  NewProducts.create(
    { _id: obj._id, createdAt: obj.createdAt },
    (err, resp) => {
      if (err) {
        errorStatus = true;
        logError("cannot create new_product", err);
      }
    }
  );

  Products.find({}, (error, result) => {
    if (error) {
      errorStatus = true;
      logError("cannot find new_product", error);
    }

    let oldest = result[0];
    result.forEach((product) => {
      if (oldest.createdAt < product.createdAt) oldest = product;
    });

    if (
      1000 * 60 * 60 * 24 * keepLastDays - (new Date() - oldest.createdAt) <
        0 &&
      result.length > minimumNewItems
    )
      // oldest then X days
      NewProducts.findByIdAndDelete(oldest._id, (err) => {
        if (err) {
          errorStatus = true;
          logError("cannot find new_product", err);
        }
      });
  });
  return errorStatus;
}
function logError(msg, err) {
  fs.appendFile(
    "error_log.txt",
    `\n${new Date()} \nError message: ${msg}. ${err}`,
    function (badfileread) {
      if (badfileread) throw badfileread;
    }
  );
}

exports.findAll = async (req, res) => {
  Products.find({})
    .populate("tags")
    .exec((err, response) => {
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        let range = [0, 10];
        let result = [];
        response.forEach((item) => {
          let { tags, ...rest } = item._doc;
          let newTags = [];
          tags.forEach((tag) => newTags.push(tag.name));
          result.push({ ...rest, tags: newTags });
        });
        try {
          if (
            req.query.filter &&
            Object.keys(JSON.parse(req.query.filter)).length
          ) {
            let filter = JSON.parse(req.query.filter)
                result = result.filter((item) => {
                  let arr = item[Object.keys(filter)[0]]
                  console.log("The arr is", arr);
                  if (!Array.isArray(arr)) arr = [arr]
                  if (!Array.isArray(filter[Object.keys(filter)[0]])) filter[Object.keys(filter)[0]]=[filter[Object.keys(filter)[0]]].map(v => v.toLowerCase())
                  
                  return arr.some(
                    (v) => 
                        filter[Object.keys(filter)[0]].indexOf(v.toLowerCase()) >= 0
                  );
                });
          }
          if (req.query.sort) {
            const sort = JSON.parse(req.query.sort);
            sort[1] = sort[1].toLowerCase() === "asc" ? 1 : -1;
            result.sort((a, b) =>
              a[sort[0]] > b[sort[0]] ? 1 * sort[1] : -1 * sort[1]
            );
          }

          if (req.query.range) {
            range = JSON.parse(req.query.range);
          }
          res.setHeader("Content-Range", `${result.length}`);
          result = result.slice(range[0], range[1] + 1);

          return res.send(result);
        } catch (e) {
          return res.send(e);
        }
      }
    });
};

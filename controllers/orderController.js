const Orders = require("../models/orderModel");
exports.create = async (req, res) => {
  Orders.create(req.body, (err, obj) => {
    if (err) return res.json({ errorStatus: true, error: err });
    try{
      Orders.findByIdAndUpdate(
        obj._id,
        { id: obj._id },
        { new: true },
        (err, result) => {
          if (err) return res.json({ errorStatus: true, error: err });
          return res.json(result);
        }
      );
    }
    catch(e){
      console.log(e);
    }
  });
};

exports.findOne = async (req, res) => {
  Orders.findById(req.params.id)
    .populate("status")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        let { status, ...rest } = user._doc;
        rest.status = status.name;
        return res.json(rest);
      }
    });
};

exports.update = async (req, res) => {
  Orders.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true },
    (err, result) => {
      if (err) return res.json({ errorStatus: true, error: err });
      return res.json(result);
    }
  );
};

exports.index = async (req, res) => {
  const limit_ = 10;
  let aggregate_options = [];

  //PAGINATION
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || limit_;

  //set the options for pagination
  let options = {
    populate: "status",
    page,
    limit,
    collation: { locale: "en" },
    customLabels: {
      totalDocs: "totalResults",
      docs: "orders",
    },
  };

  let match = {};
  if (req.query.range) {
    let [from, to] = JSON.parse(req.query.range);
    options.limit = to + 1 - from;
    options.page = (to + 1) / options.limit;
  }

  if (req.query.filter && req.query.filter.length > 2) {
    let { filter } = req.query;
    let [id, ...rest] = filter.substring(1, filter.length - 1).split(",");
    rest = JSON.parse(rest.join());
    id = JSON.parse(id);
    let search = { [id]: rest };
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
  const myAggregate = Orders.aggregate(aggregate_options);
  let result = await Orders.aggregatePaginate(myAggregate, options);
  result.orders.forEach((order, i) => {
    Orders.findOne({ status: order.status })
      .populate("status")
      .exec((err, response) => {
        result.orders[i].status = response.status.name;
      });
  });
  setTimeout(() => {
    res.setHeader("Content-Range", `${result.orders.length}`);
    res.status(200).json(result.orders);
  }, 1000);
};

exports.findAll = async (req, res) => {
  Orders.find({})
    .populate("status")
    .exec((err, response) => {
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        let range = [0, 10];
        let result = [];
        response.forEach((item) => {
          let { status, ...rest } = item._doc;
          result.push({ ...rest, status: status.name });
        });
        
        try {
            
            if (req.query.filter && Object.keys(JSON.parse(req.query.filter)).length) {
                let filter = JSON.parse(req.query.filter)
                
                result = result.filter((item) => {
                  let arr = item[Object.keys(filter)[0]]
                  
                  if (!Array.isArray(arr)) arr = [arr]
                  if (!Array.isArray(filter[Object.keys(filter)[0]])) filter[Object.keys(filter)[0]]=[filter[Object.keys(filter)[0]]]
                  filter[Object.keys(filter)[0]]=filter[Object.keys(filter)[0]].map(v => v.toLowerCase())
                  
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

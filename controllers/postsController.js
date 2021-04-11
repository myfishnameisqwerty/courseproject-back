const Posts = require("../models/postsModel");
exports.create = async (req, res) => {
  Posts.create(req.body, (err, obj) => {
    if (err) return res.json({ errorStatus: true, error: err });
    Posts.findByIdAndUpdate(
      obj._id,
      { id: obj._id },
      { new: true },
      (err, result) => {
        if (err) return res.json({ errorStatus: true, error: err });
        return res.json(result);
      }
    );
  });
};


exports.findOne = async (req, res) => {
  Posts.findById(req.params.id, (err, result) => {
    if (err) return res.json({ errorStatus: true, error: err });
    else {
      if (result) {
        return res.json(result);
      }
      return res.json({ errorStatus: true, error: "post not found" });
    }
  });
};

exports.delete = async (req, res) => {
  Posts.findByIdAndDelete(req.params.id, (err, result) => {
    if (err) return res.json({ errorStatus: true, error: err });
    return res.json(result);
  });
};
exports.update = async (req, res) => {
  Posts.findByIdAndUpdate(
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
    page,
    limit,
    collation: { locale: "en" },
    customLabels: {
      totalDocs: "totalResults",
      docs: "posts",
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

  const myAggregate = Posts.aggregate(aggregate_options);
  const result = await Posts.aggregatePaginate(myAggregate, options);
  res.setHeader("Content-Range", `${result.posts.length}`);
  res.status(200).json(result.posts);
};

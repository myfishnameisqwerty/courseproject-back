const Users = require("../models/userModel");
let bcrypt = require("bcrypt");
const fs = require("fs");
const saltRounds = 10;

exports.Login = async (req, res) => {
  console.log("Login");
  const { email, password } = req.body;

  if (req.body.password) {
    Users.find({ email }, (err, result) => {
      if (result.length) {
        bcrypt.compare(password, result[0].password, (err, hash) => {
          if (err) console.log(err);

          if (hash) {
            const { password, ...rest } = result[0]._doc;

            const token = Users.generateAccessToken(rest);

            return res.json({ token });
          } else {
            return res.json({ message: "password does not match" });
          }
        });
      } else return res.json({ message: "User does not exists" });
    });
  }
};

exports.userExists = async (req, res) => {
  return res.json(await checkUserExistsBy(req.body));
};
exports.create = async (req, res) => {
  try {
    if (!(await checkUserExistsBy({ email: req.body.email }))) {
      const { password, ...rest } = req.body;
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) console.log("fist error~", err);

        hashed_password = hash;

        const user = {
          ...rest,
          password: hashed_password,
        };

        Users.create(user, function (err, obj) {
          if (err) {
            return res.json({ errorStatus: true, ...err });
          } else {
            Users.findByIdAndUpdate(
              obj._id,
              { id: obj._id },
              { new: true },
              (err, result) => {
                if (err) return res.json({ errorStatus: true, error: err });
                if (result) {
                  const token = Users.generateAccessToken(rest);
                  return res.json({
                    token,
                  });
                }
                return res.json({
                  errorStatus: true,
                  error: "Cannot add user. Contact the support.",
                });
              }
            );
          }
        });
      });
    } else
      return res.json({
        errorStatus: true,
        message: "Email is allready taken",
      });
  } catch (e) {
    logError("error on user creation", e);
  }
};

exports.findOne = async (req, res) => {
  Users.findById(req.params.id)
    .populate("role")
    .exec((err, user) => {
      if (err)
        return res.json({
          errorStatus: true,
          error: err,
        });
      else {
        if (user) {
          let { role, password, ...rest } = user._doc;
          rest.role = role.name;
          res.setHeader("Content-Range", `${rest.length}`);
          return res.status(200).json(rest);
        } else {
          return res.json({
            errorStatus: true,
            error: "User is not exists",
          });
        }
      }
    });
};

exports.update = async (req, res) => {
  Users.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true },
    (err, result) => {
      if (err) return res.json({ errorStatus: true, error: err });
      return res.json(result);
    }
  );
};

exports.delete = (req, res) => {
  Users.findByIdAndDelete(req.params.id, (error, obj) => {
    if (error) return res.json({ errorStatus: true, error });
    if (!obj) return res.json({ errorStatus: true, error: "wrong id" });
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
    populate: "role",
    collation: { locale: "en" },
    customLabels: {
      totalDocs: "totalResults",
      docs: "users",
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
    console.log(sortBy, sortOrder);
    sortOrder = sortOrder.toLowerCase() === "desc" ? -1 : 1;
    aggregate_options.push({ $sort: { [sortBy]: sortOrder } });
  }

  const myAggregate = Users.aggregate(aggregate_options);
  let result = await Users.aggregatePaginate(myAggregate, options);

  result.users.forEach((user, i) => {
    Users.findOne({ role: user.role })
      .populate("role")
      .exec((err, response) => {
        result.users[i].role = response.role.name;
      });
  });
  setTimeout(() => {
    res.setHeader("Content-Range", `${result.users.length}`);
    // res.status(200).json(result.users);
    res.status(200).json(result.users);
  }, 1000);
};

async function checkUserExistsBy(field) {
  let returnStatement = false;
  const key = Object.keys(field)[0];
  await Users.findOne({ [key]: field[key] }, (err, result) => {
    if (result) returnStatement = true;
  });
  return returnStatement;
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
  Users.find({})
    .populate("role")
    .exec((err, response) => {
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        let range = [0, 10];
        let result = [];
        response.forEach((item) => {
          let { role, password, ...rest } = item._doc;
          result.push({ ...rest, role: role.name });
        });
        try {
          if (
            req.query.filter &&
            Object.keys(JSON.parse(req.query.filter)).length
          ) {
            let filter = JSON.parse(req.query.filter)
                
                result = result.filter((item) => {
                  let arr = item[Object.keys(filter)[0]]
                  
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

const Roles = require("../models/userRolesModel");

exports.create = async (req, res) => {
  Roles.findOne({ name: req.body.name }, (error, response) => {
    if (!response)
      Roles.create({ ...req.body }, (err, obj) => {
        if (err) return res.json({ errorStatus: true, error: err });
        Roles.findByIdAndUpdate(
          obj._id,
          { id: obj._id },
          { new: true },
          (err, result) => {
            if (err) return res.json({ errorStatus: true, error: err });

            res.setHeader("Content-Range", `${result.length}`);
            return res.json(result);
          }
        );
      });
    else    return res.json({ errorStatus: true, error: "Role exists" });
  });
};
exports.findOne = async (req, res) => {
  Roles.findById(req.params.id, (err, result) => {
    if (err) return res.json({ errorStatus: true, error: err });
    else {
      if (result) {
        res.setHeader("Content-Range", `${result.length}`);
        return res.json(result);
      }
      return res.json({ errorStatus: true, error: "Role not found" });
    }
  });
};
exports.findAll = async (req, res) => {
  Roles.find({}, (err, result) => {
    if (err) return res.json({ errorStatus: true, error: err });
    res.setHeader("Content-Range", `${result.length}`);
    return res.json(result);
  });
};
exports.delete = async (req, res) => {
  try{
    Roles.findByIdAndDelete(req.params.id, (err, result) => {
        if (err) return res.json({ errorStatus: true, error: err });
        res.setHeader("Content-Range", `${result.length}`);
        return res.json(result);
      });
  }
  catch(e){
      console.log(e);
  }
  
};
exports.update = async (req, res) => {
  Roles.findByIdAndUpdate(
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

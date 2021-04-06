const Users = require("../models/userModel");
let bcrypt = require("bcrypt");
const fs = require('fs')
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
            console.log("token", token);

            return res.json(
              {token},
            );
          } else {
            return res.json({ message: "password does not match" });
          }
        });
      }
      else  
        return res.json({ message: "User does not exists" });
    });
  }
};

exports.Register = (req, res) => {
  console.log("Register");
  const { password, ...rest } = req.body;
  
  if (password) {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) console.log("fist error~", err);

      hashed_password = hash;

      const user = {
        ...rest,
        password: hashed_password,
      };
      

      Users.create(user, function (err, result) {
        if (err) {
            return res.json(
                {errorStatus: true, ...err}
              );
        } else {
          

          const token = Users.generateAccessToken(rest);

          return res.json({
            token,
          });
        }
      });
    });
  }
};
exports.userExists = async (req, res) => {
  return  res.json(await checkUserExistsBy(req.body))
}
exports.create = async (req, res) => {

    try{
      if (!await checkUserExistsBy(req.body.username)){
        if(!await checkUserExistsBy(req.body.email)){
          Users.create(newProduct , (err, obj) => {
            if (err) return (res.json({errorStatus: true, error: err}))
            else {
                Users.findByIdAndUpdate(obj._id, {id:obj._id}, {new: true}, (err, result) => {
                    if (err)     return (res.json({errorStatus: true, error: err}))
                    if (!addNewProduct(obj, res, 7))
                        return (res.json({result}))
                    return (res.json({errorStatus: true, error: "Cannot add user. Contact the support."})) 
                })
                
            }
        })
        
        }
        else  return (res.json({errorStatus: true, message: "Email is allready taken"}))
      }
      else    return (res.json({errorStatus: true, message: "Username is taken"}))
    }
    catch(e){
      logError("error on user creation", e)
    }
    

}

exports.findOne = async (req, res) => {
  Users.findById(req.params.id, (err, result) => {
      if (err)
          return (res.json({errorStatus: true, error: err}))
      else{
          if (result){
              return (res.json(result))
              }
          return (res.json({errorStatus: true, error: "tag not found"}))
      }
  })
}

exports.update = async (req, res) => {
  Users.findByIdAndUpdate(req.params.id, {...req.body}, {new: true}, (err, result) => {
      if (err)     return (res.json({errorStatus: true, error: err}))
      return (res.json(result))
  })
}

exports.delete = (req, res) => {
  Users.findByIdAndDelete(req.params.id, (error, obj) => {
      if (error)    return (res.json({errorStatus: true, error}))
      if (!obj)     return (res.json({errorStatus: true, error: "wrong id"}))
      return (res.json(obj))
  })
}

exports.index = async (req, res) => {
  
  const limit_ = 10;
  let aggregate_options = [];

  //PAGINATION
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || limit_;

  //set the options for pagination
  let options = {
      page, limit,
      collation: {locale: 'en'},
      customLabels: {
          totalDocs: 'totalResults',
          docs: 'users'
      }   
  }
  
  let match = {};
  if (req.query.range){
      let [from, to] = JSON.parse(req.query.range)
      options.limit = to+1-from
      options.page=(to+1)/options.limit
  }
  
  
  if (req.query.filter && Object.keys(JSON.parse(req.query.filter)).length){
      let search = JSON.parse(req.query.filter)
      let query = ""
      if (Array.isArray(search[Object.keys(search)[0]])){
          search[Object.keys(search)[0]].forEach(element => {
              if (query)
                  query += `|${element}`
              else
                  query = element
          })
          
      }
      else{
          query = search[Object.keys(search)[0]]
      }
      match[Object.keys(search)[0]] = {$regex: query, $options: 'i'};    
      aggregate_options.push({$match: match});
  } 

  
  if (req.query.sort){
      let [sortBy, sortOrder] = JSON.parse(req.query.sort)
      sortOrder = sortOrder.toLowerCase()==='desc'? -1 :1
      aggregate_options.push({$sort: {[sortBy]: sortOrder}});
  }
  
  const myAggregate = Users.aggregate(aggregate_options);
  const result = await Users.aggregatePaginate(myAggregate, options);
  
  res.setHeader('Content-Range', `${result.users.length}`)
  res.status(200).json(result.users);

}

async function checkUserExistsBy(field) {
  let returnStatement = false;
  const key = Object.keys(field)[0]
  await Users.findOne({ [key]:field[key] }, (err, result) => {
    if (result)
      returnStatement = true;
  });
  return returnStatement;
}
function logError(msg, err) {
  fs.appendFile('error_log.txt', `\n${new Date()} \nError message: ${msg}. ${err}`, function (badfileread) {
      if (badfileread)
          throw badfileread;
  });
}


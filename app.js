const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const cors = require("cors");
const passport = require("passport")
const app = express();
const {readdir} = require("fs/promises")
const connectMongo=require("./config/mongo.config")

app.use(cors());
// app.use(passport.initialize());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range')
    next()
  })
  
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


loadFileNames('./routes').then(fileNames => {
    fileNames.map(name => {
        let route = '/'
        if (name !== 'index'){
            route += name
            app.use(route, require('./routes'+route))
        }
        else    app.use(route, require('./routes/index'))
        
    })
})

function loadFileNames(path){
    let promise = new Promise( async(resolve, reject) =>{
        let fileNames =[]
        try {
            const files = await readdir(path);
            for await (const file of files)
              fileNames.push(file.split('.')[0])
          } catch (err) {
            console.error(err);
          }
        resolve(fileNames)
    })
    return promise   
}
module.exports = app;

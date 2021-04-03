const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const cors = require("cors");
const passport = require("passport")
const app = express();
// const {readdir} = require("fs/promises")
const connectMongo=require("./config/mongo.config")
const indexRouter=require("./routes/index")
const usersRouter=require("./routes/users")
const productsRouter=require("./routes/products")
app.use(cors());
// app.use(passport.initialize());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter)
module.exports = app;

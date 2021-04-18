let mongoose = require("mongoose")


mongoose.set('returnOriginal', false)

mongoose.connect(process.env.DB_SERVER, {useNewUrlParser:true, useUnifiedTopology: true,
    useCreateIndex: true
})
mongoose.set('returnOriginal', false)
mongoose.connection.on("connected",()=>console.log("Mongo database connected"))
mongoose.connection.on("error",(err)=>console.log(err))
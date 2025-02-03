const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = () => {
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log("Database connected"))
    .catch( (error)=>{
        console.log("DB connection failed");
        console.error(error);
        process.exit(1);
    });
}
const mongoose = require('mongoose');
 const productSchema= new mongoose.Schema({
    name: String,
    price: String,
    // category:String,
   //  userId:String,
   //  company:String,
   //  date:String,
 });
 module.exports= mongoose.model("contacts",productSchema)
const mongoose=required("mongoose")
const {Schema} = mongoose

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    createdOn:{
        type:Date,
        default:Date.now,
        required:true
    },
    expireOn:{
        type:Date,
        required:true
    },
    offerPrice:{
        tye:Number,
        required:true
    },
    minimumPrice:{
        type:Number,
        required:true
    },
    isList:{
        type:Boolean,
        default:true
    },
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
})

const Coupon = mongoose.model("Coupon",couponSchema)
module.exports = Coupon
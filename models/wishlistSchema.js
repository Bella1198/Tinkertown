const mongoose=require("mongoose")
const{Schema}=mongoose

const wishlistSchema=new Schema({

    userId:{
        typr:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[{
        productId:{
            typr:Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        addedOn:{
            type:Date,
            default:Date.now
        }
    }]
})

const Wishlist = mongoose.model("Wishlist",wishlistSchema)
module.exports=Wishlist
var mongoose=require('mongoose');
//const validator=require('validator');
//const jwt=require('jsonwebtoken');
const _=require('lodash');
//const bcrypt=require('bcryptjs');


var userSchema = new mongoose.Schema({

    name:{
        type:String,

    },
    mobile_Number:{
        type:Number
    },

    loc: {
        type: { type: String },
        coordinates: [Number],
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    blood_grp:{
        type:String,
        required:true
    },
    credits:{
        type:Number,
        default:0
    },
    gender:{
        type:String
    },
    user_id:{
        type:Number
    },
    verified:{
        type:Boolean,
        default:false
    },
    online:{
        type:Boolean,
        default:false
    }
});
// defining the location as 2d sphere space to have two points in the coordinates.
userSchema.index({ "loc": "2dsphere" });
//sending the JSON specified parameters as required
userSchema.methods.toJSON=function(){
    var user=this;
    var userObject=user.toObject();
    return _.pick(userObject,['gender']);
}
//creating a final model out of schema
var User = mongoose.model( "User", userSchema );

module.exports={User};

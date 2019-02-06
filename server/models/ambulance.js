var mongoose=require('mongoose');
//const validator=require('validator');
//const jwt=require('jsonwebtoken');
const _=require('lodash');
//const bcrypt=require('bcryptjs');


var ambulanceSchema = new mongoose.Schema({

    name:{
        type:String,

    },
    mobile_Number:{
        type:Number
    },

    loc: {
        type: { type: String },
        coordinates: [Number],
}
    ,

    vehicle_id:{
        type:Number
    },

    online:{
        type:Boolean,
        default:false
    },
    t:{
        type:Number,
        default:1
    }
});
// defining the location as 2d sphere space to have two points in the coordinates.
ambulanceSchema.index({ "loc": "2dsphere" });
//sending the JSON specified parameters as required
// ambulanceSchema.methods.toJSON=function(){
//     var user=this;
//     var userObject=user.toObject();
//     return _.pick(userObject,['gender']);
// }
//creating a final model out of schema
var ambulance = mongoose.model( "ambulance", ambulanceSchema );

module.exports={ambulance};

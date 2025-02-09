const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdOn: {type: Date, default: new Date().getTime()},
    verified: {type: Boolean, default: false},
    isAdmin: {type: Boolean, default: false}    
});

module.exports = mongoose.model("User", userSchema); 
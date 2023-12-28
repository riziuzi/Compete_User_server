const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    profile: {
        type: Object,
        default: {}
    },
    createdDate: {
        type: Number,
        default: Date.now
    },
    lastUpdatedDate: {
        type: Number,
        default: Date.now
    },
    publicPostIds: {
        type: [String],
    },
    privatePostIds: {
        type: [String],
    }
});

UserSchema.pre('save', function (next) {
    this.lastUpdatedDate = Date.now();
    next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

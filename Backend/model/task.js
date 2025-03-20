const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type:String, required:true},
    description: {type:String, required:true},
    credits:{type:Number, required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    claimedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    // status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);

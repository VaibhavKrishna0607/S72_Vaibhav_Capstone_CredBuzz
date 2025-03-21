const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type:String, required:true},
    description: {type:String, required:true},
    credits:{type:Number, required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    claimedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    
},{
    timestamps: true
}
);

module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');
const { STATUSES } = require('../../constants/taskStatus');
const { PRIORITIES } = require('../../constants/priority');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: STATUSES, default: 'pending' },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ assigneeId: 1, status: 1, dueDate: 1 });
taskSchema.index({ clientId: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);

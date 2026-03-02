const mongoose = require('mongoose');
const { STATUSES } = require('../../constants/clientStatus');

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true },
    phone: { type: String },
    company: { type: String },
    status: { type: String, enum: STATUSES, default: 'lead' },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

clientSchema.index({ managerId: 1, status: 1 });
clientSchema.index({ name: 'text', email: 'text', phone: 'text', company: 'text' });

module.exports = mongoose.model('Client', clientSchema);

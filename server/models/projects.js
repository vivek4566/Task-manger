
import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
  name: String,
  description: String
}, { timestamps: true });

export default model('Project', projectSchema);
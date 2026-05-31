import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  assignedTo: String,
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }
});

export default model('Task', taskSchema);
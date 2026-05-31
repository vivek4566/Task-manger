import Task from '../models/task.js';
import { getIO } from '../socket.js';

// CREATE
export const createTask = async (req, res) => {
  const task = await Task.create(req.body);

  const io = getIO();
  io.to(task.projectId.toString()).emit("taskCreated", task);

  res.json(task);
};

// GET
export async function getTasksByProject(req, res) {
  const tasks = await Task.find({ projectId: req.params.id });
  res.json(tasks);
}

// UPDATE
export async function updateTask(req, res) {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  const io = getIO();
  io.to(task.projectId.toString()).emit("taskUpdated", task);

  res.json(task);
}

// DELETE
export async function deleteTask(req, res) {
  const task = await Task.findByIdAndDelete(req.params.id);

  const io = getIO();
  io.to(task.projectId.toString()).emit("taskDeleted", task._id);

  res.json({ message: 'Task deleted' });
}
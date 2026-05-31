// routes/taskRoutes.js
import { Router } from 'express';
const taskRoutes = Router();

import { createTask, getTasksByProject, updateTask, deleteTask } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';
import rbac from '../middleware/rbac.js';

taskRoutes.post('/', auth, rbac('Admin', 'Editor'), createTask);
taskRoutes.get('/project/:id', auth, getTasksByProject);
taskRoutes.put('/:id', auth, rbac('Admin', 'Editor'), updateTask);
taskRoutes.delete('/:id', auth, rbac('Admin'), deleteTask);

export default taskRoutes;
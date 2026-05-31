
import { Router } from 'express';
const projectRoutes = Router();

import { createProject, getProjects } from '../controllers/projectController.js';
import auth from '../middleware/auth.js';
import rbac from '../middleware/rbac.js';

projectRoutes.get('/', auth, getProjects);
projectRoutes.post('/', auth, rbac('Admin', 'Editor'), createProject);

export default projectRoutes;
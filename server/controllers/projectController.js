import Project from '../models/projects.js';

// Create Project
export async function createProject(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project.' });
  }
}

// List Projects
export async function getProjects(req, res) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load projects.' });
  }
}
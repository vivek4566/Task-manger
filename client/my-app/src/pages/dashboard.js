import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import {
  createTask,
  deleteTask,
  fetchTasksByProject,
  moveTaskStatusLocally,
  removeTaskFromSocket,
  setActiveProjectId,
  updateTask,
  upsertTaskFromSocket,
} from '../features/taskSlice'
import { logout } from '../features/authSlice'
import { createProject, fetchProjects } from '../features/projectSlice'
import { config } from '../config'

const SOCKET_URL = config.socketUrl
const STATUSES = ['todo', 'in-progress', 'done']
const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items, activeProjectId, isLoading, isError, errorMessage } = useSelector(
    (state) => state.tasks
  )
  const { items: projects, isLoading: isProjectsLoading } = useSelector(
    (state) => state.projects
  )

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const canManageProjects = user?.role === 'Admin' || user?.role === 'Editor'
  const canManageTasks = user?.role === 'Admin' || user?.role === 'Editor'
  const canDeleteTasks = user?.role === 'Admin'

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  useEffect(() => {
    const socket = io(SOCKET_URL)

    if (activeProjectId) {
      socket.emit('joinProject', activeProjectId)
    }

    socket.on('taskCreated', (task) => {
      dispatch(upsertTaskFromSocket(task))
    })

    socket.on('taskUpdated', (task) => {
      dispatch(upsertTaskFromSocket(task))
    })

    socket.on('taskDeleted', (taskId) => {
      dispatch(removeTaskFromSocket(taskId))
    })

    return () => {
      socket.disconnect()
    }
  }, [activeProjectId, dispatch])

  useEffect(() => {
    setSelectedProjectId(activeProjectId)
  }, [activeProjectId])

  const groupedTasks = useMemo(() => {
    return items.reduce(
      (acc, task) => {
        const key = STATUSES.includes(task.status) ? task.status : 'todo'
        acc[key].push(task)
        return acc
      },
      { todo: [], 'in-progress': [], done: [] }
    )
  }, [items])

  const handleLoadProject = (e) => {
    e.preventDefault()
    if (!selectedProjectId) return
    dispatch(setActiveProjectId(selectedProjectId))
    dispatch(fetchTasksByProject(selectedProjectId))
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!canManageProjects) return
    if (!projectName.trim()) return

    const action = await dispatch(
      createProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
      })
    )

    if (createProject.fulfilled.match(action)) {
      const nextId = action.payload._id
      setSelectedProjectId(nextId)
      dispatch(setActiveProjectId(nextId))
      dispatch(fetchTasksByProject(nextId))
      setProjectName('')
      setProjectDescription('')
    }
  }

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!canManageTasks) return
    if (!activeProjectId || !title.trim()) return

    dispatch(
      createTask({
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo.trim(),
        status: 'todo',
        projectId: activeProjectId,
      })
    )

    setTitle('')
    setDescription('')
    setAssignedTo('')
  }

  const handleStatusChange = (taskId, nextStatus) => {
    if (!canManageTasks) return
    dispatch(updateTask({ taskId, updates: { status: nextStatus } }))
  }

  const handleDeleteTask = (taskId) => {
    if (!canDeleteTasks) return
    dispatch(deleteTask(taskId))
  }

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!canManageTasks) return
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    dispatch(moveTaskStatusLocally({ taskId: draggableId, status: destination.droppableId }))
    dispatch(updateTask({ taskId: draggableId, updates: { status: destination.droppableId } }))
  }

  return (
    <div className="page">
      <header className="topbar">
        <h2>Collaborative Task Board</h2>
        <div className="topbar-actions">
          <span>{user?.name ? `Welcome, ${user.name} (${user.role})` : 'Logged in'}</span>
          <button onClick={() => dispatch(logout())}>Logout</button>
        </div>
      </header>

      <section className="panel">
        <h3>Create Project</h3>
        <form onSubmit={handleCreateProject} className="task-form">
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Project description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <button type="submit" disabled={!canManageProjects}>Create Project</button>
        </form>
      </section>

      <section className="panel">
        <h3>Select Project</h3>
        <form onSubmit={handleLoadProject} className="inline-form">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={isProjectsLoading}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option value={project._id} key={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <button type="submit">Load Project Tasks</button>
        </form>
      </section>

      <section className="panel">
        <h3>Create Task</h3>
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Assigned to"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
          <button type="submit" disabled={!activeProjectId || !canManageTasks}>
            Add Task
          </button>
        </form>
      </section>

      {isError && <p className="error-text">{errorMessage}</p>}
      {isLoading && <p className="info-text">Syncing tasks...</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        <section className="kanban-grid">
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{STATUS_LABELS[status]}</h3>
                  {groupedTasks[status].map((task, index) => (
                    <Draggable
                      draggableId={task._id}
                      index={index}
                      key={task._id}
                      isDragDisabled={!canManageTasks}
                    >
                      {(draggableProvided) => (
                        <article
                          className="task-card"
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          <h4>{task.title}</h4>
                          <p>{task.description || 'No description'}</p>
                          <small>Assigned: {task.assignedTo || 'Unassigned'}</small>
                          <div className="card-actions">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              disabled={!canManageTasks}
                            >
                              {STATUSES.map((option) => (
                                <option value={option} key={option}>
                                  {STATUS_LABELS[option]}
                                </option>
                              ))}
                            </select>
                            <button onClick={() => handleDeleteTask(task._id)} disabled={!canDeleteTasks}>
                              Delete
                            </button>
                          </div>
                        </article>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </section>
      </DragDropContext>
    </div>
  )
}

export default Dashboard

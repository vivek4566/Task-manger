import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { config } from '../config'

const API_URL = config.taskApi

const getAuthConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.token
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

const initialState = {
  items: [],
  activeProjectId: '',
  isLoading: false,
  isError: false,
  errorMessage: '',
}

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${API_URL}/project/${projectId}`,
        getAuthConfig(thunkAPI)
      )
      return { projectId, tasks: response.data }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/create',
  async (payload, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, payload, getAuthConfig(thunkAPI))
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, updates }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/${taskId}`,
        updates,
        getAuthConfig(thunkAPI)
      )
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${taskId}`, getAuthConfig(thunkAPI))
      return taskId
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

const setPending = (state) => {
  state.isLoading = true
  state.isError = false
  state.errorMessage = ''
}

const setRejected = (state, action) => {
  state.isLoading = false
  state.isError = true
  state.errorMessage = action.payload?.message || 'Request failed'
}

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setActiveProjectId: (state, action) => {
      state.activeProjectId = action.payload
    },
    upsertTaskFromSocket: (state, action) => {
      const incomingTask = action.payload
      const index = state.items.findIndex((task) => task._id === incomingTask._id)
      if (index === -1) {
        state.items.push(incomingTask)
      } else {
        state.items[index] = incomingTask
      }
    },
    removeTaskFromSocket: (state, action) => {
      state.items = state.items.filter((task) => task._id !== action.payload)
    },
    moveTaskStatusLocally: (state, action) => {
      const { taskId, status } = action.payload
      const index = state.items.findIndex((task) => task._id === taskId)
      if (index !== -1) {
        state.items[index].status = status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByProject.pending, setPending)
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.activeProjectId = action.payload.projectId
        state.items = action.payload.tasks
      })
      .addCase(fetchTasksByProject.rejected, setRejected)
      .addCase(createTask.pending, setPending)
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false
        const exists = state.items.some((task) => task._id === action.payload._id)
        if (!exists) {
          state.items.push(action.payload)
        }
      })
      .addCase(createTask.rejected, setRejected)
      .addCase(updateTask.pending, setPending)
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((task) => task._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateTask.rejected, setRejected)
      .addCase(deleteTask.pending, setPending)
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((task) => task._id !== action.payload)
      })
      .addCase(deleteTask.rejected, setRejected)
  },
})

export const {
  setActiveProjectId,
  upsertTaskFromSocket,
  removeTaskFromSocket,
  moveTaskStatusLocally,
} =
  taskSlice.actions

export default taskSlice.reducer
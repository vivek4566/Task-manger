import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { config } from '../config'

const API_URL = config.projectApi

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
  isLoading: false,
  isError: false,
  errorMessage: '',
}

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL, getAuthConfig(thunkAPI))
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/create',
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

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.errorMessage = ''
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.errorMessage = action.payload?.message || 'Failed to fetch projects'
      })
      .addCase(createProject.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.errorMessage = ''
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = [action.payload, ...state.items]
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.errorMessage = action.payload?.message || 'Failed to create project'
      })
  },
})

export default projectSlice.reducer

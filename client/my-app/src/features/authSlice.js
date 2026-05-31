import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { config } from '../config'

const API_URL = config.authApi

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isError: false,
  errorMessage: '',
  successMessage: '',
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      )
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/login`, userData)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
  error.response?.data || { message: error.message }
)
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
    state.user = null
    state.token = null
    state.successMessage = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  clearMessages: (state) => {
    state.isError = false
    state.errorMessage = ''
    state.successMessage = ''
  },
},
  extraReducers: (builder) => {
  builder
    .addCase(registerUser.pending, (state) => {
      state.isLoading = true
      state.isError = false
      state.errorMessage = ''
      state.successMessage = ''
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.isError = false
      state.errorMessage = ''
      state.successMessage = action.payload?.message || 'Registration successful. Please login.'
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.successMessage = ''
      state.errorMessage = action.payload?.message || 'Registration failed'
    })
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true
       state.isError = false
      state.errorMessage = ''
      state.successMessage = ''
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.isError = false
      state.errorMessage = ''
      state.user = action.payload.user
      state.token = action.payload.token

      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.successMessage = ''
      state.errorMessage = action.payload?.message || "Something went wrong"
    })
}
})

// Action creators are generated for each case reducer function
export const {logout, clearMessages}  = authSlice.actions

export default authSlice.reducer
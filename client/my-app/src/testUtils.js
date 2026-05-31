import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import taskReducer from './features/taskSlice';
import projectReducer from './features/projectSlice';

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      tasks: taskReducer,
      projects: projectReducer,
    },
    preloadedState,
  });
}

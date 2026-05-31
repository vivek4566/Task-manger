import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearMessages, loginUser, registerUser } from '../features/authSlice'
import './login.css'

const ROLES = [
  { value: 'Viewer', hint: 'View boards' },
  { value: 'Editor', hint: 'Create & edit' },
  { value: 'Admin', hint: 'Full control' },
]

function Login() {
  const dispatch = useDispatch()
  const { isLoading, isError, errorMessage, successMessage } = useSelector(state => state.auth)

  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Viewer')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'register') {
      dispatch(registerUser({ name, email, password, role }))
      return
    }
    dispatch(loginUser({ email, password }))
  }

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    dispatch(clearMessages())
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" role="main">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            TM
          </div>
          <div className="auth-brand-text">
            <h1>Team Tasks</h1>
            <p>Real-time boards for teams & classes</p>
          </div>
        </div>

        <div className="auth-title-block">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
          <p>
            {mode === 'login'
              ? 'Sign in to open your projects and Kanban boards.'
              : 'Choose your role and join collaborators in seconds.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === 'register'}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="auth-role-group">
              <span className="auth-role-label" id="auth-role-heading">
                Your role
              </span>
              <div className="auth-role-options" role="group" aria-labelledby="auth-role-heading">
                {ROLES.map(({ value, hint }) => (
                  <label key={value} className="auth-role-option">
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={() => setRole(value)}
                    />
                    <span className="auth-role-pill">
                      <span className="auth-role-name">{value}</span>
                      <span className="auth-role-desc">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="auth-field-hint">Admins can delete tasks; editors can edit; viewers see only.</p>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {isError && (
          <div className="auth-alert auth-alert--error" role="alert">
            {typeof errorMessage === 'string'
              ? errorMessage
              : errorMessage?.message || 'Something went wrong.'}
          </div>
        )}
        {!isError && successMessage && (
          <div className="auth-alert auth-alert--success" role="status">
            {successMessage}
          </div>
        )}

        <footer className="auth-footer">
          <button type="button" className="auth-toggle" onClick={toggleMode}>
            {mode === 'login'
              ? 'Need an account? Create one'
              : 'Already have an account? Sign in'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default Login
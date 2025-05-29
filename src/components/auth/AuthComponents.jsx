import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


// Utility functions for local storage
const getStoredUsers = () => {
  const users = localStorage.getItem('eventra_users')
  return users ? JSON.parse(users) : []
}

const storeUser = (userData) => {
  const users = getStoredUsers()
  users.push(userData)
  localStorage.setItem('eventra_users', JSON.stringify(users))
}

const findUser = (email, password) => {
  const users = getStoredUsers()
  return users.find(user => user.email === email && user.password === password)
}

// Login Page Component
export function LoginPage({ onLoginSuccess }) {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    // Check if user exists in local storage
    const user = findUser(email, password)
    
    if (!user) {
      setError('Invalid email or password. Please sign up first if you don\'t have an account.')
      return
    }
    
    // Check if the selected role matches the user's registered role
    if (user.role !== role) {
      setError(`This account is registered as ${user.role}, not ${role}. Please select the correct role.`)
      return
    }
    
    console.log("Login successful for:", user.name, "Role:", user.role)
    
    // Create a clean user object to pass to the login handler
    const userForSession = {
      email: user.email,
      name: user.name,
      role: user.role
    }
    
    // Call the onLoginSuccess prop to update the App state
    onLoginSuccess(userForSession, user.role)
    
    // Navigate based on role
    if (role === 'student') {
      navigate('/student-homepage')
    } else if (role === 'president') {
      navigate('/president-homepage')
    } else if (role === 'management') {
      navigate('/management-homepage')
    }
  }

  return (
    <div className="form-container">
      <h1 className="title">Eventra</h1>
      <h2 className="subtitle">Login</h2>

      <form className="form" onSubmit={handleLogin}>
        {error && <p className="error-message">{error}</p>}
        <input 
          className="input" 
          type="email" 
          placeholder="Email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          className="input" 
          type="password" 
          placeholder="Password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          className="input"
        >
          <option value="student">Student</option>
          <option value="president">President</option>
          <option value="management">Management</option>
        </select>
        <button type="submit" className="button">Login</button>
        <p className="switch-to-signup">
          Don't have an account? <Link to="/signup" className="link">Sign up</Link>
        </p>
      </form>
    </div>
  )
}

// Signup Page Component
export function SignupPage() {
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSignup = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all fields')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    // Check if user already exists
    const existingUsers = getStoredUsers()
    const userExists = existingUsers.find(user => user.email === email)
    
    if (userExists) {
      setError('An account with this email already exists')
      return
    }
    
    // Create new user object
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In a real app, you'd hash this
      role: role,
      createdAt: new Date().toISOString()
    }
    
    try {
      // Store user in local storage
      storeUser(newUser)
      
      console.log("Signup successful:", newUser.name, "Role:", newUser.role)
      setSuccess('Account created successfully! Redirecting to login...')
      
      // Clear form
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (error) {
      setError('Failed to create account. Please try again.')
      console.error('Signup error:', error)
    }
  }

  return (
    <div className="form-container">
      <h1 className="title">Eventra</h1>
      <h2 className="subtitle">Sign Up</h2>

      <form className="form" onSubmit={handleSignup}>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <input 
          className="input" 
          type="text" 
          placeholder="Full Name" 
          required 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          className="input" 
          type="email" 
          placeholder="Email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          className="input" 
          type="password" 
          placeholder="Password (min 6 characters)" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input 
          className="input" 
          type="password" 
          placeholder="Confirm Password" 
          required 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          className="input"
        >
          <option value="student">Student</option>
          <option value="president">President</option>
          <option value="management">Management</option>
        </select>
        <button type="submit" className="button">Sign Up</button>
        <p className="switch-to-login">
          Already have an account? <Link to="/" className="link">Login</Link>
        </p>
      </form>
    </div>
  )
}
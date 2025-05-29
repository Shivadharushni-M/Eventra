import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/main.css'
import { API_BASE_URL, fetchWithAuth } from './api/config';

// Import components from their respective files
import { LoginPage, SignupPage } from './components/auth/AuthComponents'
import { 
  StudentHomepage, 
  DiscoverEvents, 
  EventDetails, 
  RegisterEvent, 
  MyRegistrations,
  SubmitFeedback 
} from './components/student/StudentComponents'
import { PresidentHomepage } from './components/president/PresidentComponents'
import { ManagementHomepage } from './components/management/ManagementComponents'

// Main App Component with Routes
function App() {
  // Using state to track if user is logged in and their role
  const [loggedIn, setLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  // Added user state to store user information
  const [currentUser, setCurrentUser] = useState({
    id: '',
    name: '',
    email: '',
    registrations: []
  })
  
  // Store all events in the app state
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: "Tech Workshop", 
      date: "May 25, 2025", 
      time: "2:00 PM - 4:00 PM",
      location: "Engineering Building, Room 101",
      organizer: "CS Club",
      description: "Learn about the latest technologies and tools in web development.",
      attendees: []
    },
    { 
      id: 2, 
      title: "Music Festival", 
      date: "June 2, 2025", 
      time: "5:00 PM - 10:00 PM",
      location: "Campus Amphitheater",
      organizer: "Music Society",
      description: "A night of live performances featuring talented student musicians.",
      attendees: []
    },
    { 
      id: 3, 
      title: "Career Fair", 
      date: "June 10, 2025", 
      time: "10:00 AM - 4:00 PM",
      location: "Student Union Building",
      organizer: "Career Services",
      description: "Connect with potential employers and explore career opportunities.",
      attendees: []
    }
  ])

  // Login handler function - to be passed to LoginPage
  const handleSuccessfulLogin = (user, role) => {
    setLoggedIn(true)
    setUserRole(role)
    setCurrentUser({
      id: Date.now().toString(), // Simple ID generation for demo
      name: user.name || 'User',
      email: user.email,
      registrations: []
    })
  }

  // Logout handler function
  const handleLogout = () => {
    setLoggedIn(false)
    setUserRole('')
    setCurrentUser({
      id: '',
      name: '',
      email: '',
      registrations: []
    })
  }

  // Registration handler function
  const handleEventRegistration = (eventId, registrationData) => {
    // Add the registration to user's list
    const updatedUser = {
      ...currentUser,
      registrations: [
        ...currentUser.registrations,
        { 
          eventId,
          ...registrationData,
          registrationDate: new Date().toISOString()
        }
      ]
    }
    setCurrentUser(updatedUser)
    
    // Add user to event's attendees list
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          attendees: [
            ...event.attendees || [],
            {
              userId: currentUser.id,
              name: currentUser.name,
              ...registrationData
            }
          ]
        }
      }
      return event
    })
    setEvents(updatedEvents)
    
    return updatedUser.registrations.find(reg => reg.eventId === eventId)
  }

  // Handle event feedback submission
  const handleFeedbackSubmission = (eventId, feedbackData) => {
    // In a real app, you would send this to the backend
    console.log("Feedback submitted for event", eventId, feedbackData)
    
    // Update the user's registration to include feedback
    const updatedRegistrations = currentUser.registrations.map(reg => {
      if (reg.eventId === eventId) {
        return {
          ...reg,
          feedback: feedbackData
        }
      }
      return reg
    })
    
    setCurrentUser({
      ...currentUser,
      registrations: updatedRegistrations
    })
  }

  // Handle event cancellation
  const handleCancelRegistration = (eventId) => {
    // Remove registration from user
    const updatedRegistrations = currentUser.registrations.filter(
      reg => reg.eventId !== eventId
    )
    
    setCurrentUser({
      ...currentUser,
      registrations: updatedRegistrations
    })
    
    // Remove user from event attendees
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          attendees: event.attendees.filter(
            attendee => attendee.userId !== currentUser.id
          )
        }
      }
      return event
    })
    
    setEvents(updatedEvents)
  }

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={ 
            <LoginPage onLoginSuccess={handleSuccessfulLogin} /> 
          } />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/student-homepage" element={
            loggedIn && userRole === 'student' ? 
              <StudentHomepage 
                currentUser={currentUser} 
                events={events.filter(event => 
                  currentUser.registrations.some(reg => reg.eventId === event.id)
                )} 
                onLogout={handleLogout}
              /> : 
              <Navigate to="/" replace />
          } />
          <Route path="/president-homepage" element={
            loggedIn && userRole === 'president' ? 
              <PresidentHomepage onLogout={handleLogout} /> : 
              <Navigate to="/" replace />
          } />
          <Route path="/management-homepage" element={
            loggedIn && userRole === 'management' ? 
              <ManagementHomepage onLogout={handleLogout} /> : 
              <Navigate to="/" replace />
          } />
          <Route path="/discover-events" element={
            loggedIn ? 
              <DiscoverEvents 
                events={events} 
                userRegistrations={currentUser.registrations} 
                onLogout={handleLogout}
              /> : 
              <Navigate to="/" replace />
          } />
          <Route path="/event-details/:eventId" element={
            loggedIn ? 
              <EventDetails 
                events={events} 
                currentUser={currentUser}
                onRegister={handleEventRegistration} 
                onCancelRegistration={handleCancelRegistration}
              /> : 
              <Navigate to="/" replace />
          } />
          <Route path="/register-event/:eventId" element={
            loggedIn ? 
              <RegisterEvent 
                events={events} 
                currentUser={currentUser}
                onRegister={handleEventRegistration} 
              /> : 
              <Navigate to="/" replace />
          } />
          <Route path="/my-registrations" element={
            loggedIn ? 
              <MyRegistrations 
                registrations={currentUser.registrations} 
                events={events} 
                onCancelRegistration={handleCancelRegistration}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/" replace />
          } />
          <Route path="/feedback/:eventId" element={
            loggedIn ? 
              <SubmitFeedback 
                events={events}
                currentUser={currentUser}
                registrations={currentUser.registrations}
                onSubmitFeedback={handleFeedbackSubmission}
              /> : 
              <Navigate to="/" replace />
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App;


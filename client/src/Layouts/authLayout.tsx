
import { Routes, Route } from 'react-router-dom'
import Login from '../Auth/Login'
import SessionExpiredPage from '../Pages/SessionExpired'

const AuthLayout = () => {
  return (
    <div>

        <Routes>
            {/* Define auth-related routes here */}
            <Route path="/" element={<Login />} />
            <Route path="/session-expired" element={<SessionExpiredPage/>} />
            
            {/* Add more auth routes as needed */}
        </Routes>
      
    </div>
  )
}

export default AuthLayout

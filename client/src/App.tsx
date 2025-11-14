
import './App.css'
import Layout from './Layouts/pageslayout'
import { Route, Routes } from 'react-router-dom'
import AuthLayout from './Layouts/authLayout'

function App() {
  

  return (
   <>
   <Routes>
    <Route path="/*" element={ <AuthLayout />} />
    <Route path="/u/*" element={ <Layout />} />
    
    </Routes>
     
    </>
  )
}

export default App

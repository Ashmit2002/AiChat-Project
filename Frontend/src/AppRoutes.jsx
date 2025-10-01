import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'

const AppRoutes = () => {
    return (

        <BrowserRouter>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route path='/login' element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
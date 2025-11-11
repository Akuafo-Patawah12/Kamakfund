import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../Auth/Login';


// Example pages/components

const Layout: React.FC = () => {
    return (
        <div>
            {/* Common layout elements like header, sidebar, etc. can go here */}
            <Routes>
                <Route path="/" element={<Login />} />
                
                {/* Add more routes as needed */}
            </Routes>
        </div>
    );
};

export default Layout;
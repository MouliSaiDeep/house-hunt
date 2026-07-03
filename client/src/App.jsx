import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Components
import AdminHome from './modules/admin/AdminHome';
import AdminAllBookings from './modules/admin/AllBookings';
import AdminAllProperty from './modules/admin/AllProperty';
import AdminAllUsers from './modules/admin/AllUsers';

// Common Components
import Home from './modules/common/Home';
import Login from './modules/common/Login';
import Register from './modules/common/Register';
import ForgotPassword from './modules/common/ForgotPassword';

// Owner Components
import OwnerHome from './modules/user/owner/OwnerHome';
import OwnerAddProperty from './modules/user/owner/AddProperty';
import OwnerAllBookings from './modules/user/owner/AllBookings';
import OwnerAllProperties from './modules/user/owner/AllProperties';

// Renter Components
import RenterHome from './modules/user/renter/RenterHome';
import RenterAllProperties from './modules/user/renter/AllProperties';

// Toast Context
import { ToastProvider } from './modules/common/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
        {/* Common / Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Renter Routes */}
        <Route path="/renter" element={<RenterHome />} />
        <Route path="/renter/properties" element={<RenterAllProperties />} />

        {/* Owner Routes */}
        <Route path="/owner" element={<OwnerHome />} />
        <Route path="/owner/add-property" element={<OwnerAddProperty />} />
        <Route path="/owner/bookings" element={<OwnerAllBookings />} />
        <Route path="/owner/properties" element={<OwnerAllProperties />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/users" element={<AdminAllUsers />} />
        <Route path="/admin/properties" element={<AdminAllProperty />} />
        <Route path="/admin/bookings" element={<AdminAllBookings />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;

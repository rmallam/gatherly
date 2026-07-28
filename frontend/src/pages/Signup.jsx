import React from 'react';
import { Navigate } from 'react-router-dom';

// Signup is now handled by the unified passwordless screen at /login:
// entering a new email or phone there automatically creates the account.
const Signup = () => <Navigate to="/login" replace />;

export default Signup;

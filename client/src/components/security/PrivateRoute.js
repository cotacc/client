// PrivateRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../security/AuthProvider'; // Adjust the import path

const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { userRole, tokenChecked } = useAuth();
  const token = localStorage.getItem('token');

  if (!tokenChecked) {
    return null; // Render nothing while checking token
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!token) {
          return <Redirect to="/login" />;
        }

        if (allowedRoles.includes(userRole)) {
          return <Component {...props} />;
        }

        switch (userRole) {
          case 0:
            return <Redirect to="/unregisteruser/dashboard" />;
          case 1:
            return <Redirect to="/admin/dashboard" />;
          case 2:
            return <Redirect to="/secretary/dashboard" />;
          case 3:
            return <Redirect to="/user/dashboard" />;
          default:
            return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default PrivateRoute;

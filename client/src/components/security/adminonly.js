import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';

const PrivateRouteAdmin = ({ component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState(null); // Initialize with null
  const [tokenChecked, setTokenChecked] = useState(false); // State to track if token has been checked
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            filename: "adminsecurity",
          },
        });
        
        const userRole = response.data.user.role;
        setUserRole(userRole);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setTokenChecked(true); // Set to true once the fetch is complete
      }
    };

    if (token && !tokenChecked) {
      fetchData();
    } else {
      setTokenChecked(true); // If no token, set to true immediately
    }
  }, [token, tokenChecked]);

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

        switch (userRole) { // Use userRole state
          case 0:
            return <Redirect to="/unregisteruser/dashboard" />;
          case 1:
            return <Component {...props} />;
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

export default PrivateRouteAdmin;

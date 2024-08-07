import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';

const PrivateRouteSecretary = ({ component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState(null); // Initialize with null
  const [tokenChecked, setTokenChecked] = useState(false); // Initialize as false
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            filename: "secretarysecurity",
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

  if (!token) {
    return <Redirect to="/login" />;
  }

  if (!tokenChecked) {
    return null; // Render nothing while checking token
  }

  // Memoized switch for role-based routing
  const renderComponentByRole = () => {
    switch (userRole) {
      case 0:
        return <Redirect to="/unregisteruser/dashboard" />;
      case 1:
        return <Redirect to="/admin/dashboard" />;
      case 2:
        return <Component {...rest} />;
      case 3:
        return <Redirect to="/user/dashboard" />;
      default:
        return <Redirect to="/login" />;
    }
  };

  return <Route {...rest} render={renderComponentByRole} />;
};

export default PrivateRouteSecretary;

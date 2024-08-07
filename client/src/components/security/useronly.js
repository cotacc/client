import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';

const PrivateRouteUser = ({ component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState(null);
  const [tokenChecked, setTokenChecked] = useState(false); // State to track if token has been checked
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setTokenChecked(true);
          return;
        }

        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            filename: "usersecurity",
          },
        });

        const fetchedUserRole = response.data.user.role;
        setUserRole(fetchedUserRole);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setTokenChecked(true); // Set to true once the fetch is complete
      }
    };
    fetchData();
  }, [token]);

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

        switch (userRole) {
          case 1:
            return <Redirect to="/admin/dashboard" />;
          case 2:
            return <Redirect to="/secretary/dashboard" />;
          case 3:
            return <Component {...props} />;
          case 0:
            return <Redirect to="/unregisteruser/dashboard" />;
          default:
            return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default PrivateRouteUser;

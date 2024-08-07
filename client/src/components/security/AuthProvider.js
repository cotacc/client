// AuthProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!token) {
          setTokenChecked(true);
          return;
        }

        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedUserRole = response.data.user.role;
        setUserRole(fetchedUserRole);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setTokenChecked(true);
      }
    };

    fetchUserRole();
  }, [token]);

  return (
    <AuthContext.Provider value={{ userRole, tokenChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

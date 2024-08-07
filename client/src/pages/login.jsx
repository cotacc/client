/* global google */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/headers&footer/header';
import Footer from '../components/headers&footer/footer';

const Login = ({ history }) => {

  const handleCallbackResponse = useCallback(async (response) => {
    try {
      const token = response.credential;
    
      const { data } = await axios.post('https://client-server-f5nt.onrender.com/api/login', {
        token: token,
      });

      if (data.success) {
        
        localStorage.setItem('token', data.token);
        toast.success(data.message);
         window.location.href = data.redirectUrl;
      } else {
        toast.error('Login failed. Please try again!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred.');
    }
  }, [history]);

  useEffect(() => {
    google.accounts.id.initialize({
      client_id:'1049853865764-too6l8v01j1ublfbc88sn3ujdassd2kq.apps.googleusercontent.com',
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById('signin'),
      { theme: 'outline', size: 'large' }
    );
  }, [handleCallbackResponse]);

  return (
 <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
  <Header />
  <div className="container_login">
    <div className="register">
      <h2>Login</h2>
      <div id="signin">Sign In with Google</div>
    </div>
  </div>
  <Footer />
  <ToastContainer />
</div>

  );
};

export default Login;

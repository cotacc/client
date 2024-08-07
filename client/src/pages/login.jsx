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
    
      const { data } = await axios.post('https://server-gzmw.onrender.com/api/login', {
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
      client_id:'969033254125-qgp5cd4mafo9vpckd4ftuc8srmransi8.apps.googleusercontent.com',
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

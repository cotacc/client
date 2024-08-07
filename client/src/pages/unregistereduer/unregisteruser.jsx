import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import axios from 'axios';
import { toast } from 'react-toastify';

const Unregisteruserdashboard = () => {
  const [profile, setProfile] = useState({});
  const [verificationCode, setVerificationCode] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');
  const { name, email, picture, createdAt, role } = profile || {};
  const token = localStorage.getItem('token');
  const history = useHistory();

 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response && response.data && response.data.user) {
          setProfile(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token]);



  const getRoleText = (role) => {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'Secretary';
      case 3:
        return 'Instructor';
      default:
        return 'Unregistered user';
    }
  };


  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!department) {
      toast.error('Please select a department.');
      return;
    }
    try {
      const updateRoleResponse = await axios.post('https://server-gzmw.onrender.com/api/updaterole', {
        code: verificationCode,
        department,
        token,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (updateRoleResponse && updateRoleResponse.data && updateRoleResponse.data.success) {
        const { redirectUrl } = updateRoleResponse.data;

        setVerificationCode('');
        setMessage('Verification successful.');
        toast.success(updateRoleResponse.data.message);
        window.location.href = redirectUrl;

       
      } else {
        setMessage('Verification failed. Please try again.');
        toast.error('Verification failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred during form submission. Please try again.');
      toast.error('Invalid code');
    }
  };

  

  return (
    <>
      <HeaderDashboard />
      <div className='dashboard'>
        <div className='wrapper'>
          <h2>Registration</h2>
          <form onSubmit={handleFormSubmit}>
            <div className='input-box'>
              <label htmlFor="user-name">Name: </label>
              <input
                type='text'
                value={name || ''}
                id="user-name"
                readOnly
              />
            </div>

            <div className='input-box'>
              <label htmlFor="user-email">Email: </label>
              <input
                type='text'
                id="user-email"
                value={email || ''}
                readOnly
              />
            </div>
            <div className='input-box'>
              <label htmlFor="user-role">Role:</label>
              <input
                type='text'
                value={getRoleText(role)}
                readOnly
              />
            </div>
            <div className='input-box'>
              <label htmlFor="user-code">Code:</label>
              <input
                type='text'
                placeholder='Verification Code'
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <div className='input-box'>
              <label htmlFor="user-department">Department:</label>
              <select
                id="user-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="" disabled>Select Department</option>
                <option value="Bachelor of Science and Information Technology">BSIT</option>
                <option value="Bachelor of Science in Food Technology">BSFT</option>
                <option value="Bachelor of Science in Automotive Technology">BSAT</option>
                <option value="Bachelor of Science in Electrical Technology">BSET</option>
              </select>
            </div>
            <div className='input-box button'>
              <input type='submit' value='Register Now' />
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Unregisteruserdashboard;

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import COTLOGO from '../../image/COT.png';
import '../../App.css';

const Header = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [isEditingDepartment, setIsEditingDepartment] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    createdAt: '',
    role: '',
    picture: '',
    department: '',
  });
  const [selectedDepartment, setSelectedDepartment] = useState(profile.department);

  const token = localStorage.getItem('token');
  const history = useHistory();

  // Mapping between full department names and abbreviations
  const departmentMapping = {
    'Bachelor of Science and Information Technology': 'BSIT',
    'Bachelor of Science in Food Technology': 'BSFT',
    'Bachelor of Science in Automotive Technology': 'BSAT',
    'Bachelor of Science in Electrical Technology': 'BSET',
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const result = await res.json();
          setProfile(result.user);
          setSelectedDepartment(result.user.department);
        } else {
          console.error('Error fetching profile:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isNotificationModalOpen) return;

      try {
        const notificationsRes = await axios.post(
          'https://server-gzmw.onrender.com/api/getMynotifications',
          { token },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const combinedNotifications = [
          ...notificationsRes.data.ackNotifications,
          ...notificationsRes.data.receivedMemos,
        ];

        const sortedNotifications = combinedNotifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [isNotificationModalOpen, token]);

  const Logout = async () => {
    try {
      const response = await axios.post('https://server-gzmw.onrender.com/api/logout', {}, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.status === 200) {
        toast.success('Logged out successfully.');
        localStorage.removeItem('token');
        history.push('/login');
      }
    } catch (error) {
      toast.error('An error occurred during logout.');
      console.log(error);
    }
  };

  const handleNotificationClick = async (notification) => {
    setIsNotificationModalOpen(false);

    const memoId = notification.memoId;
    let destinationPath = '';
    if (notification.type === 'Acknowledge') {
      if (profile.role === 1) {
        destinationPath = `/admin/memo_Icreate/${memoId}`;
      } else if (profile.role === 2) {
        destinationPath = `/secretary/memo_Icreate/${memoId}`;
      }
    } else if (notification.type === 'New Memo') {
      await axios.post('https://server-gzmw.onrender.com/api/memo/read', { token, memoId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (profile.role === 1) {
        destinationPath = `/admin/receive_memo/${memoId}`;
      } else if (profile.role === 2) {
        destinationPath = `/secretary/receive_memo/${memoId}`;
      } else if (profile.role === 3) {
        destinationPath = `/user/memo/${memoId}`;
      }
    }

    if (destinationPath) {
      history.push(destinationPath);
    }
  };

  const handleAccountButtonClick = () => {
    setIsUserDetailsModalOpen(!isUserDetailsModalOpen);
    setIsNotificationModalOpen(false);
  };

  const handleNotificationButtonClick = () => {
    setIsNotificationModalOpen(!isNotificationModalOpen);
    setIsUserDetailsModalOpen(false);
  };

  const handleCloseUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false);
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleUpdateDepartment = async () => {
    try {
      const response = await axios.post('https://server-gzmw.onrender.com/api/updateDepartment', 
        { department: selectedDepartment, token }, 
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success('Department updated successfully.');
        setProfile((prevProfile) => ({ ...prevProfile, department: selectedDepartment }));
        setIsEditingDepartment(false);
      }
    } catch (error) {
      toast.error('An error occurred while updating department.');
      console.log(error);
    }
  };

  // Function to get department abbreviation
  const getDepartmentAbbreviation = (fullName) => {
    return departmentMapping[fullName] || fullName;
  };

  return (
    <div>
      <div className='head'>
        <div className='header-content'>
          <img src={COTLOGO} alt="COT-LOGO" className='logo' />
          <div className='title'>
            <h5>BUKIDNON STATE UNIVERSITY</h5>
            <h4>COLLEGE OF TECHNOLOGIES</h4>
          </div>
          <ul className='nav-item-headerdashboard'>
            <div className='account-container'>
              <button
                type="button"
                className='account-button'
                onClick={handleAccountButtonClick}
              >
                Account
              </button>
              {isUserDetailsModalOpen && (
                <div className="modal-userprofile">
                  <div className="user-profile-details">
                    <div className='user-info'>
                      <center>
                        <h2>User Profile</h2>
                        <img className='user-picture' src={profile.picture} alt="User" />
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Department: </strong> 
                          {isEditingDepartment ? (
                            <select
                              value={selectedDepartment}
                              onChange={handleDepartmentChange}
                            >
                              {Object.entries(departmentMapping).map(([fullName, shortName]) => (
                                <option key={shortName} value={fullName}>
                                  {shortName}
                                </option>
                              ))}
                            </select>
                          ) : (
                            getDepartmentAbbreviation(profile.department)
                          )}
                        </p>
                        <p><strong>Join Date:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                        <p><strong>Role:</strong> {profile.role === 1 ? 'Admin' : profile.role === 2 ? 'Secretary' : profile.role === 3 ? 'Instructor' : 'Unregistered user'}</p>
                      </center>
                      {isEditingDepartment ? (
                        <>
                          <div className="button-container">
                            <button onClick={() => setIsEditingDepartment(false)}>Cancel</button>
                            <button onClick={handleUpdateDepartment}>Update</button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => setIsEditingDepartment(true)}>Edit Department</button>
                      )}
                    </div>
                  </div>
                  <button onClick={handleCloseUserDetailsModal}>Close</button>
                </div>
              )}
            </div>

            <div className="notification-container">
              <button
                type="button"
                className="notification-button"
                onClick={handleNotificationButtonClick}
              >
                Notification
              </button>
              {isNotificationModalOpen && (
                <div className="modal-notification">
                  <h2>Notifications</h2>
                  <div className="notifications-scroll-container">
                    {notifications.map(notification => (
                      <p
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className="clickable-notification"
                      >
                        <div>From: {notification.senderName}</div>
                        <div><strong>Type: {notification.type}</strong></div>
                      </p>
                    ))}
                  </div>
                  <button onClick={handleCloseNotificationModal}>Close</button>
                </div>
              )}
            </div>
            <button className='button-logout' type="submit" onClick={Logout}>
              Log out
            </button>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;

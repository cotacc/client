import React, { useState, useEffect } from 'react';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import '../../App.css';
import SidebarSecretary from '../../components/sidebar/SidebarSecretary';

const SecretaryCreateMemo = () => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSelectrecipientOpen, setisSelectrecipientOpen] = useState(false);
  const [userProfile, usersetProfile] = useState([]);
  const [file, setFile] = useState(null);
  const token = localStorage.getItem('token');

  const handleConfirmation = () => {
    setisSelectrecipientOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {

    setIsConfirmationOpen(false);
  };

  const handleselectrecipient = () => {
    setisSelectrecipientOpen(true);
  };

  const handlecloserecipient = () => {
    setisSelectrecipientOpen(false);
  };

  const handleConfirmSend = (e) => {
    e.preventDefault();
    handleSubmit(e);
    handleConfirmationClose();
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedUsers(selectAll ? [] : userProfile);
  };

  const handleCheckboxChange = (user) => {
    setSelectedUsers((prevSelectedUsers) => {
      const isUserSelected = prevSelectedUsers.some((selectedUser) => selectedUser.email === user.email);
      return isUserSelected
        ? prevSelectedUsers.filter((selectedUser) => selectedUser.email !== user.email)
        : [...prevSelectedUsers, user];
    });
  };

  const handleSubmit = async (e) => {
    console.log(title);
    console.log(startDate);
    console.log(endDate);
    e.preventDefault();
    handleConfirmation();

    if (!title || !endDate || !startDate) {
      toast.error('Memo is not complete. Please fill in all required fields.');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient.');
      return;
    }

    if (!token) {
      toast.error('Authentication token is missing.');
      return;
    }

    try {
      const recipientsArray = selectedUsers.map((user) => ({
        useremail: user.email,
        username: user.name,
        read: false,
      }));

      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('recipients', JSON.stringify(recipientsArray));
      formData.append('token', token);

      const { data } = await axios.post('https://server-gzmw.onrender.com/api/memo/sendmemo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success('Memo Successfully Sent');
        handleConfirmationClose();
        setTitle('');
        setFile(null);
        setStartDate('');
        setEndDate('');
        setContent('');
        setSelectedUsers([]);
        document.getElementById('fileInput').value = '';
      } else {
        toast.error('Failed to send memo. Please try again.');
      }
    } catch (error) {
      console.error('Error sending memo:', error);
      if (error.response) {
        toast.error(`Error: ${error.response.data.error || 'Memo not sent. Please try again.'}`);
      } else if (error.request) {
        toast.error('No response from server. Please try again.');
      } else {
        toast.error('Unexpected error. Please try again.');
      }
    }
  };

  const handleItemClick = (value) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: { token },
    };

    let endpoint = '';
    switch (value) {
      case 'BSIT':
        endpoint = 'https://server-gzmw.onrender.com/api/getbsit';
        break;
      case 'BSAT':
        endpoint = 'https://server-gzmw.onrender.com/api/getbsat';
        break;
      case 'BSFT':
        endpoint = 'https://server-gzmw.onrender.com/api/getbsft';
        break;
      case 'BSET':
        endpoint = 'https://server-gzmw.onrender.com/api/getbset';
        break;
      case 'ALL':
        endpoint = 'https://server-gzmw.onrender.com/api/getuserhaverole';
        break;
      case 'SECRETARY':
        endpoint = 'https://server-gzmw.onrender.com/api/getsecretary';
        break;
      case 'ADMIN':
        endpoint = 'https://server-gzmw.onrender.com/api/getadmin';
        break;
      case 'USERS':
        endpoint = 'https://server-gzmw.onrender.com/api/getallregularuser';
        break;
      default:
        return;
    }

    axios
      .get(endpoint, config)
      .then((response) => {
        const allUsers = response.data.users || response.data.bsituser || response.data.bsatuser || response.data.bsftuser || response.data.bsetuser;
        usersetProfile(allUsers);
        toast.success(response.data.message);
        setLoading(false);
      })
      .catch((error) => {
        toast.error(`Error fetching ${value} users`);
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('https://server-gzmw.onrender.com/api/getuserhaverole', {
          params: { token },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allUsers = usersResponse.data.users;
        usersetProfile(allUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <HeaderDashboard />
      <div className="dashboard">
        <SidebarSecretary />
        <div className="content">
          <div className="Creatememo">
            <Link to={'/secretary/memo_manager'} className="link-to-send" id="createMemoback">Back</Link>
            <form className="form" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="title-memo">
                <label htmlFor="title">Title:</label>
                <input type="text" value={title} name="title" onChange={(e) => setTitle(e.target.value)} placeholder="Enter Memo title" className="form-control" />
                <label htmlFor="startDate">Start Date:</label>
                <input type="datetime-local" value={startDate} id="startDate" name="startDate" onChange={(e) => setStartDate(e.target.value)} required />
                <label htmlFor="endDate">End Date:</label>
                <input type="datetime-local" id="endDate" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>

              <div className="fileinput-container">
              <input
                  type="file"
                  id="fileInput"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <button type="button" className="selectrecipient" onClick={handleselectrecipient}>
                  Select Recipients
                </button>
              </div>

              {file ? (
                <div className="memo-pdf-container">
                  <iframe title="PDF Viewer" src={URL.createObjectURL(file)} width="100%" height="700px" />
                </div>
              ) : (
                <div className="memo-pdf-container">
                  No file selected
                </div>
              )}

              {isSelectrecipientOpen && (
                <div className="recipient-modal">
                  <div className="modal-content-send">
                    <div className="top-buttons">
                      <div className="dropdown">
                        <button type="button" className="dropbtws">Filter</button>
                        <div className="dropdown-content-faculty">
                          {['ALL', 'ADMIN', 'SECRETARY', 'USERS', 'BSIT', 'BSAT', 'BSET', 'BSFT'].map((role) => (
                            <div key={role} onClick={() => handleItemClick(role)}>{role}</div>
                          ))}
                        </div>
                      </div>
                      <button type="button" onClick={handleSelectAll} className="selectAllrecipient">
                        {selectAll ? 'Unselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="user-list-container">
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        userProfile.filter(user => user.role !== 0).length === 0 ? (
                          <p>No recipient</p>
                        ) : (
                          userProfile
                            .filter(user => user.role !== 0)
                            .map((user, index) => (
                              <div key={index} className="user-details-send">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.some((selectedUser) => selectedUser.email === user.email)}
                                  onChange={() => handleCheckboxChange(user)}
                                />
                                <div className='details-list'>Name: {user.name}</div>
                              </div>
                            ))
                        )
                      )}
                    </div>
                    <div className="bottom-buttons">
                      <button onClick={handlecloserecipient} className="cancel-button">Cancel</button>
                      <button type="button" className="memoSend" onClick={handleConfirmation}>Send</button>
                    </div>
                  </div>
                </div>
              )}

          {isConfirmationOpen && (
                <div className='editbuttodelete'>
                  <div className="confirmation-modal">
                    <div className="modal-content">
                      <p>Are you sure you want to update the role of this user?</p>
                      <div className="button-container">
                        <button onClick={handleConfirmationClose} className="btn-no">No</button>
                        <button onClick={handleConfirmSend} className="btn-yes">Yes</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SecretaryCreateMemo;

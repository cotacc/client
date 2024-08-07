import React, { useState, useEffect } from 'react';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import SidebarAdmin from '../../components/sidebar/SidebarAdmin';
import '../../App.css';

const Adminfacultymanager = ({ history }) => {
  const [userprofile, usersetProfile] = useState([]);
  const [showEditButton, setShowEditButton] = useState(true); 
  const [editMode, setEditMode] = useState(false);
  const [updatedrole, setUpdatedrole] = useState();
  const [editedUser, setEditedUser] = useState(null);
  const [isconfirmationopen, setConfirmationopen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
  };

  const filteredUsers = userprofile.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (email) => {
    const userToDelete = userprofile.find((user) => user.email === email);
    if (userToDelete) {
      setEditedUser(userToDelete);
      setDeleteConfirmationOpen(true);
    } else {
      toast.error('Error deleting user');
    }
  };

  const handleConfirmDelete = () => {
    handleConfirmDeleteuser();
  };

  const handleConfirmationClosedelete = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleConfirmation = () => {
    setConfirmationopen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationopen(false);
  };

  const handleConfirmSend = (e) => {
    e.preventDefault();
    handleUpdaterole();
    handleConfirmationClose();
  };

  const handleItemClick = (value) => {
    console.log(value);
  
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    const params = {
      token,
    };
  
    setLoading(true);
  
    let url = '';
    let toastMessage = '';
  
    switch (value) {
      case 'BSIT':
        url = 'https://server-gzmw.onrender.com/api/getallbsit';
        toastMessage = 'Successfully Retrieved!';
        break;
      case 'BSAT':
        url = 'https://server-gzmw.onrender.com/api/getallbsat';
        toastMessage = 'Successfully Retrieved!';
        break;
      case 'BSFT':
        url = 'https://server-gzmw.onrender.com/api/getallbsft';
        toastMessage = 'Successfully Retrieved!';
        break;
      case 'BSET':
        url = 'https://server-gzmw.onrender.com/api/getallbset';
        toastMessage = 'Successfully Retrieved!';
        break;
      case 'ALL':
        url = 'https://server-gzmw.onrender.com/api/getallusers';
        toastMessage = 'Successfully Retrieved!';
        break;
      case 'SECRETARY':
        url = 'https://server-gzmw.onrender.com/api/getallsecretary';
        toastMessage = 'Successfully Retrieved!';
        break;
      case 'ADMIN':
        url = 'https://server-gzmw.onrender.com/api/getalladmin';
        toastMessage = 'Successfully Retrieved!';
        break;
      case 'INSTRUCTORS':
        url = 'https://server-gzmw.onrender.com/api/getallinstructors';
        toastMessage = 'Successfully Retrieved!';
        break;
      default:
        console.error('Invalid value:', value);
        setLoading(false);
        toast.error('Invalid value');
        return;
    }
  
    axios
      .get(url, { headers, params })
      .then((response) => {
        switch (value) {
          case 'BSIT':
            usersetProfile(response.data.bsituser);
            break;
          case 'BSAT':
            usersetProfile(response.data.bsatuser);
            break;
          case 'BSFT':
            usersetProfile(response.data.bsftuser);
            break;
          case 'BSET':
            usersetProfile(response.data.bsetuser);
            break;
          case 'ALL':
            usersetProfile(response.data.users);
            break;
          case 'SECRETARY':
            usersetProfile(response.data.users);
            break;
          case 'ADMIN':
            usersetProfile(response.data.users);
            break;
          case 'INSTRUCTORS':
            usersetProfile(response.data.users);
            break;
          default:
            break;
        }
        setLoading(false);
        toast.success(toastMessage);
      })
      .catch((error) => {
        console.error(`Error fetching ${value} members:`, error);
        setLoading(false);
        toast.error(`Error fetching ${value} members`);
      });
  };
  

  useEffect(() => {
    axios
      .get('https://server-gzmw.onrender.com/api/getallusers', {
        params: { token },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        usersetProfile(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setLoading(false);
        toast.error('Error fetching users');
      });
  }, []);

  const handleConfirmDeleteuser = async (userrole) => {
    try {
      const result = await axios.post(
        'https://server-gzmw.onrender.com/api/deletethisuser',
        { email: editedUser.email, token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (result.data.logout) {
        const url = result.data.redirectURL;
        history.push(url);
        toast.success('Logout Successfully!');
      }

      usersetProfile((prevProfiles) =>
        prevProfiles.filter((user) => user.email !== editedUser.email)
      );

      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user: ' + editedUser.email);
    } finally {
      setDeleteConfirmationOpen(false);
    }
  };

  const handleUpdaterole = async () => {
    try {
      await axios.post(
        'https://server-gzmw.onrender.com/api/updateuserrole',
        {
          email: editedUser.email,
          role: updatedrole,
          token,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const response = await axios.get('https://server-gzmw.onrender.com/api/getallusers', {
        params: { token },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = response.data.users.find(user => user.email === editedUser.email);

      usersetProfile(response.data.users);

      let updatedRoleName;
      if (updatedUser.role === 1) {
        updatedRoleName = 'Admin';
      } else if (updatedUser.role === 2) {
        updatedRoleName = 'Secretary';
      } else if (updatedUser.role === 3) {
        updatedRoleName = 'Instructor';
      }
      if (updatedUser.role === 0) {
        updatedRoleName = 'User';
      }


      setEditMode(false);
      setShowEditButton(true); 
      setUpdatedrole(updatedRoleName);
      toast.success("Role updated successfully");
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role: ' + updatedrole);
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'Secretary';
      case 3:
        return 'Instructor';
      case 0:
        return 'User';
      default:
        return '';
    }
  };
 
  const handleEditUser = (user) => {
    setEditMode(true);
    setShowEditButton(false);

    setEditedUser(user);
    setUpdatedrole(user.role);
  };
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedUser(null);
    setUpdatedrole(null);
    setShowEditButton(true); 
  };


  return (
    <>
      <HeaderDashboard />
      <div className="content-header">
        <div className="spacer"></div>
        
        <div className="dropdownfaculty">
          <button className="dropbtnfacultymanager">Filter</button>
          <div className="dropdown-content">
            <div onClick={() => handleItemClick('ALL')}>ALL</div>
            <div onClick={() => handleItemClick('ADMIN')}>ADMIN</div>
            <div onClick={() => handleItemClick('SECRETARY')}>SECRETARY</div>
            <div onClick={() => handleItemClick('INSTRUCTORS')}>INSTRUCTORS</div>
            <div onClick={() => handleItemClick('BSIT')}>BSIT</div>
            <div onClick={() => handleItemClick('BSAT')}>BSAT</div>
            <div onClick={() => handleItemClick('BSET')}>BSET</div>
            <div onClick={() => handleItemClick('BSFT')}>BSFT</div>
          </div>
        </div>
  
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearch}
          className="searchfaculty"
        />
      </div>
  
      <div className="dashboard">
        <SidebarAdmin />
        <div className="content">
          <div className='faculty-content'>
            <div className='list-user'>
            {loading ? (
  <p>Loading...</p>
) : filteredUsers.length === 0 ? (
  <p>No Instructors found</p>
) : (
  filteredUsers.map((user, index) => (
    <div className="User-content" key={index}>
      <br />
      <div className='user-profile'>
        <img className='user-picture-faculty' src={user.picture} alt="User" />

        <div className='user-details'>
          <div className='details-list'>
            <ul className='detail-list'>
              <li className='detail-item'>
                Name: {user.name}
              </li>
              <li className='detail-item'>
                Email: {user.email}
              </li>
              <li className='detail-item'>
                Department: {user.department}
              </li>
              <li className='detail-item'>
                Role: {getRoleName(user.role)}
                {showEditButton && (
                  <button id="editbotton" className='editbutton' onClick={() => handleEditUser(user)}>Edit Role</button>
                )}
              </li>
            </ul>
          </div>
          <div className="details-list-update">
            {editMode && editedUser?.email === user.email ? (
              <>
                <div className="dropdownfacultymana">
                  Role:
                  <button className="dropbtnfaculty">
                    {getRoleName(updatedrole)}
                  </button>
                  <div className="dropdown-content">
                    <div onClick={() => setUpdatedrole(1)}>Admin</div>
                    <div onClick={() => setUpdatedrole(2)}>Secretary</div>
                    <div onClick={() => setUpdatedrole(3)}>Instructor</div>
                    <div onClick={() => setUpdatedrole(0)}>User</div>
                  </div>
                </div>
                <button className='editbutton' onClick={handleConfirmation}>Save</button>
                <button className='deletebutton' onClick={() => handleDeleteUser(user.email)}>Delete</button>
                <button className='editbutton' onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ))
)}

  
              {isconfirmationopen && (
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
  
              {isDeleteConfirmationOpen && (
                <div className="confirmation-modal">
                  <div className="modal-content">
                    <p>Are you sure you want to delete this user?</p>
                    <div className="button-container">
                      <button onClick={handleConfirmationClosedelete} className="btn-no">No</button>
                      <button onClick={handleConfirmDelete} className="btn-yes">Yes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
  
};

export default Adminfacultymanager;

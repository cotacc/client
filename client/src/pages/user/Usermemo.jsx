import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import SidebarUser from '../../components/sidebar/SidebarUser';

const UserMemoManager = () => {
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQueryReceivedMemos, setSearchQueryReceivedMemos] = useState('');
  const [memos, setMemos] = useState([]);
  const history = useHistory();
  const token = localStorage.getItem('token');
  
  const handleSearchReceivedMemos = (event) => {
    const { value } = event.target;
    setSearchQueryReceivedMemos(value);
  };

  const filteredReceivedMemos = memos.filter((memo) =>
    memo.title.toLowerCase().includes(searchQueryReceivedMemos.toLowerCase())
  );



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data.user);

        const receivedMemoResponse = await axios.get('https://server-gzmw.onrender.com/api/showmemo', {
          params: { token },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMemos(receivedMemoResponse.data.showmemo);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleRead = async (e, memoId) => {
    

    try {
      await axios.post('https://server-gzmw.onrender.com/api/memo/read', { token, memoId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      history.push(`/user/memo/${memoId}`);
    } catch (error) {
      console.error('Error acknowledging memo:', error);
    }
  };

  return (
    <>
      <HeaderDashboard />
      <div className="dashboard">
        <SidebarUser />
        <div className="content">
          <div className="cv">
            <div className="content-memo-manager">
              <div className="receive-memo-details">
                <div className="receive-memo-header">
                  <div className="received-memo">Received Memo</div>
                  <input
                    className="search-right"
                    type="text"
                    placeholder="Search Received Memos"
                    value={searchQueryReceivedMemos}
                    onChange={handleSearchReceivedMemos}
                  />
                </div>
                <div className="receive-memo-list">
                  {filteredReceivedMemos && filteredReceivedMemos.length > 0 ? (
                    <ul className="receivedMemoList">
                      {filteredReceivedMemos.slice().reverse().map((memo) => (
                        <li key={memo._id} className="receivedMemoItem">
                          <div
                            onClick={(e) => handleRead(e, memo._id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="memo-details-received">
                              <div className="memo-title">Title: {memo.title}</div>
                              <div className="memo-sender">
                                <p>From: {memo.sender}</p>
                              </div>
                              <div className="memo-date">
                              {new Date(memo.createdAt).toLocaleDateString([], {
                    day: '2-digit',
                    month: 'short', // Short month name
                    year: 'numeric', // Full year
                  })} - {new Date(memo.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
  
                              </div>
                              <div className="memo-content-details">
                                {memo.recipients && Array.isArray(memo.recipients) && (
                                  <>
                                    <p>
                                      {memo.recipients.some(
                                        (recipient) =>
                                          recipient.useremail === profile.email && !recipient.read
                                      )
                                        ? 'Unread'
                                        : 'Read'}
                                    </p>
                                    <p>
                                      Acknowledge:
                                      {memo.recipients.some(
                                        (recipient) =>
                                          recipient.useremail === profile.email && !recipient.acknowledge
                                      )
                                        ? 'No'
                                        : 'Yes'}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No received memos available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserMemoManager;

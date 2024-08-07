import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import { Link, useHistory } from 'react-router-dom';
import SidebarAdmin from '../../components/sidebar/SidebarAdmin';

const AdminMemoManager = () => {
  const [profile, setProfile] = useState(null);
  const [Icreatememos, setIcreateMemos] = useState([]);
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQueryMemoList, setSearchQueryMemoList] = useState('');
  const [searchQueryReceivedMemos, setSearchQueryReceivedMemos] = useState('');
  const [token] = useState(localStorage.getItem('token'));
  const history = useHistory();

  const handleSearchMemoList = (event) => {
    setSearchQueryMemoList(event.target.value);
  };

  const handleSearchReceivedMemos = (event) => {
    setSearchQueryReceivedMemos(event.target.value);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setProfile(response.data.user);
  
        const [memoResponse, receivedMemoResponse] = await Promise.all([
          axios.get('https://server-gzmw.onrender.com/api/memoIcreate', {
            params: { token },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get('https://server-gzmw.onrender.com/api/showmemo', {
            params: { token },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
  
        setIcreateMemos(memoResponse.data.showmemo);
        setMemos(receivedMemoResponse.data.showmemo);
      } catch (error) {
        setError('Error fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    if (token) {
      fetchData();
    }
  
  }, []); 
  

  const handleRead = async (e, memoId) => {
    e.preventDefault();
    try {
      await axios.post('https://server-gzmw.onrender.com/api/memo/read', { token, memoId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      history.push(`/admin/receive_memo/${memoId}`);
    } catch (error) {
      console.error('Error acknowledging memo:', error);
    }
  };

  const filteredMemoList = Icreatememos.filter((memo) =>
    memo.title && memo.title.toLowerCase().includes(searchQueryMemoList.toLowerCase())
  );

  const filteredReceivedMemos = memos.filter((memo) =>
    memo.title && memo.title.toLowerCase().includes(searchQueryReceivedMemos.toLowerCase())
  );

  return (
    <>
      <HeaderDashboard />
      
      <div className="dashboard">
     
        <SidebarAdmin />
        <div className="content">
           <div className="cv">
            <div className="content-memo-manager">
              <div className="send-memo-details">
                <div className="memo-list-header">
                  <a href="/admin/memo_create" className="create-memo">
                    Create Memo <span className="arrow">→</span>
                  </a>
                  <input
                    className="search-left"
                    type="text"
                    placeholder="Search Memo List"
                    value={searchQueryMemoList}
                    onChange={handleSearchMemoList}
                  />
                </div>
                <div className="memo-list-container">
                  {filteredMemoList && filteredMemoList.length > 0 ? (
                    <ul className=" ">
                      {filteredMemoList.slice().reverse().map((memo) => (
                        <li key={memo._id}>
                          <Link to={`/admin/memo_Icreate/${memo._id}`}>
                            <div className="memo-details-sent">
                              <div className="memo-title">Title: {memo.title}</div>
                              <div className="memo-date-sent">
                              {new Date(memo.createdAt).toLocaleDateString([], {
                    day: '2-digit',
                    month: 'short', // Short month name
                    year: 'numeric', // Full year
                  })} - {new Date(memo.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No memos available.</p>
                  )}
                </div>
              </div>
            </div>
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
                          <a
                            href={`/admin/receive_memo/${memo._id}`}
                            onClick={(e) => handleRead(e, memo._id)}
                          >

   <div className="memo-details-received">
  <div className="memo-row">
    <div className="memo-title">Title: {memo.title}</div>
    <div className="memo-sender">From: {memo.sender}</div>
  </div>
  <div className="memo-row">
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
  </div>
  {memo.recipients && Array.isArray(memo.recipients) && (
    <div className="memo-row">
      <div className="memo-read">
      
          {memo.recipients.some(
            (recipient) =>
              recipient.useremail === profile.email && !recipient.read
          )
            ? 'Unread'
            : 'Read'}
       
      </div>
      <div className="memo-acknowledge">
        
          Acknowledge: 
          {memo.recipients.some(
            (recipient) =>
              recipient.useremail === profile.email && !recipient.acknowledge
          )
            ? 'No'
            : 'Yes'}
       
      </div>
    </div>
  )}
</div>


                          </a>
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

export default AdminMemoManager;

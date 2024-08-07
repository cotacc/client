import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import '../../App.css';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import SidebarSecretary from '../../components/sidebar/SidebarSecretary';

const SecretaryMemoDetails = () => {
  const [memoDetails, setMemoDetails] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const history = useHistory();
  const { memoId } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch memo details first
        const memoDetailsResponse = await axios.get(`https://server-gzmw.onrender.com/api/memo/created_details/${memoId}`, {
          params: {
            token
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const details = memoDetailsResponse.data.memo;
        setMemoDetails(details);

        // Fetch PDF URL
        const pdfResponse = await axios.get(`https://server-gzmw.onrender.com/api/memo/created/${memoId}`, {
          params: {
            token
          },
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob' 
        });
        
        const pdfBlob = pdfResponse.data;
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);

        // Set recipients and filtered recipients
        setFilteredRecipients(details.recipients || []);
      } catch (error) {
        console.error("Error fetching memo details:", error);
        history.goBack(); 
      }
    };

    fetchData();
  }, [memoId, token, history]);

  if (!memoDetails) {
    return <p>Loading...</p>;
  }

  const handleBackClick = () => {
    history.push('/secretary/memo_manager');
  };

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    filterRecipients(searchTerm);
  };

  const filterRecipients = (searchTerm) => {
    if (!searchTerm) {
      setFilteredRecipients(memoDetails.recipients || []);
      return;
    }

    const filtered = memoDetails.recipients.filter(recipient =>
      recipient.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipients(filtered);
  };

  const getMonthName = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
  };

  return (
    <>
      <HeaderDashboard />
      <div className="dashboard">
        <SidebarSecretary />
        <div className="content">
          <div className="memo-details-body">
            <>
              <Link to="/secretary/memo_manager" className="link-to-memo-manager" onClick={handleBackClick}>Back</Link>
              <p className="memo-title-sent">Title: {memoDetails.title}</p>
              <p className="memo-timestamp-detau">Sent At: {`${getMonthName(new Date(memoDetails.createdAt))} ${new Date(memoDetails.createdAt).getDate()}, ${new Date(memoDetails.createdAt).getFullYear()} ${new Date(memoDetails.createdAt).toLocaleTimeString()}`}</p>
              <p className="memo-timestamp-detau">Start At: {`${getMonthName(new Date(memoDetails.startAt))} ${new Date(memoDetails.startAt).getDate()}, ${new Date(memoDetails.startAt).getFullYear()} ${new Date(memoDetails.startAt).toLocaleTimeString()}`}</p>
              <p className="memo-timestamp-detau">End At: {`${getMonthName(new Date(memoDetails.endAt))} ${new Date(memoDetails.endAt).getDate()}, ${new Date(memoDetails.endAt).getFullYear()} ${new Date(memoDetails.createdAt).toLocaleTimeString()}`}</p>
              <div className="memo-pdf-container">
                {pdfUrl ? (
                  <iframe title="PDF Viewer" src={pdfUrl} width="100%" height="700px" />
                ) : (
                  <p>Loading PDF...</p>
                )}
              </div>
              <div className="memo-recipients-details">
                <div className="recipient-search">
                  <div className="recipient-header">
                    <h2>List of Recipients</h2>
                  </div>
                  <div className="recipient-search-input">
                    <input
                      type="text"
                      placeholder="Search recipients by name..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div >
                <ul className='recipient-list'>
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((recipient, index) => (
                      <li key={index} className="recipient">
                        <p><strong>Email:</strong> {recipient.useremail}</p>
                        <p><strong>Name:</strong> {recipient.username}</p>
                        <p><strong>Read:</strong> {recipient.read ? 'Yes' : 'No'}</p>
                        <p><strong>Acknowledge:</strong> {recipient.acknowledge ? 'Yes' : 'No'}</p>
                      </li>
                    ))
                  ) : (
                    <li className="no-results">No recipients found.</li>
                  )}
                </ul>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SecretaryMemoDetails;

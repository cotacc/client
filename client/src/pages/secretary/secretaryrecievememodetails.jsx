/*global google*/
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import '../../App';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import SidebarSecretary from '../../components/sidebar/SidebarSecretary';
import { toast } from 'react-toastify';

const SecretaryRecieveMemoDetails = ({ match }) => {
  const [memoDetails, setMemoDetails] = useState(null);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isGoogleCalendarSaved, setIsGoogleCalendarSaved] = useState(false);
  const history = useHistory();
  const { memoId } = useParams();
  const [acknowledgeStatus, setAcknowledgeStatus] = useState(false);
  const token = localStorage.getItem('token');
  const [pdfUrl, setPdfUrl] = useState('');
  const [tokenClient, setTokenClient] = useState(null);
  const [startDateTime, setstartDateTime] = useState('');
  const [endDateTime, setendDateTime] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');


  useEffect(() => {
    const fetchMemoDetails = async () => {
      try {
        const getme = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const response = await axios.get(`https://server-gzmw.onrender.com/api/memo/details/${memoId}`, {
          params: {
            token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMemoDetails(response.data.memo);

        const res = await axios.get(`https://server-gzmw.onrender.com/api/memo/pdfdetails/${memoId}`, {
          params: {
            token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        });

        const pdfUrl = URL.createObjectURL(res.data);
        setPdfUrl(pdfUrl);

        const acknowledgmentResponse = await axios.post(
          `https://server-gzmw.onrender.com/api/Iacknowledge/${memoId}`,
          { token },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const googleCalendarResponse = await axios.get('https://server-gzmw.onrender.com/api/isgooglecalendarsave', {
          params: {
            token,
            memoId
          },
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (googleCalendarResponse.status === 200 && googleCalendarResponse.data) {
          setIsGoogleCalendarSaved(googleCalendarResponse.data.isGoogleCalendarSaved);
        } else {
          setIsGoogleCalendarSaved(false);
        }

        setIsAcknowledged(acknowledgmentResponse.data.acknowledgeStatus);
        setAcknowledgeStatus(acknowledgmentResponse.data.acknowledgeStatus);
      } catch (error) {
        if (error.response && error.response.status === 304) {
          // Handle the 304 Not Modified status if necessary
        } else {
          history.goBack();
        }
      }
    };

    fetchMemoDetails();
  }, [memoId, token, history]);

  const handleAcknowledge = async () => {
    try {
      const acknowledge = await axios.post(
        `https://server-gzmw.onrender.com/api/memo/acknowledge/${memoId}`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (acknowledge.status === 200) {
        setIsAcknowledged(true);
        toast.success('Memo acknowledged successfully.');
      } else {
        toast.error(`Error acknowledging memo: ${acknowledge.statusText}`);
      }
    } catch (error) {
      console.error('Error acknowledging memo:', error);
      toast.error('Error acknowledging memo. Please try again.');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleGoogleSignIn();
  };

  const handleGoogleSignIn = async () => {
    if (tokenClient) {
      await tokenClient.requestAccessToken();
      console.log(tokenClient.requestAccessToken());
    } else {
      console.error('Token client is not initialized.');
    }
  };

  useEffect(() => {
    const handleGoogleSignInCallback = async (tokenResponse) => {
      try {
        if (memoDetails) { // Check if memoDetails is defined
          console.log(tokenResponse);
          if (tokenResponse && tokenResponse.access_token) {
            const event = {
              'summary': `${memoDetails.title} Sent by: ${memoDetails.sender}`,
              'description': `Memo from ${memoDetails.sender} (${memoDetails.senderEmail}) titled "${memoDetails.title}". Created at: ${new Date(memoDetails.createdAt).toLocaleString()}. Starts at: ${new Date(memoDetails.startAt).toLocaleString()}. Ends at: ${new Date(memoDetails.endAt).toLocaleString()}.`,
              'start': { 'dateTime': new Date(memoDetails.startAt).toISOString(), 'timeZone': 'Asia/Manila' },
              'end': { 'dateTime': new Date(memoDetails.endAt).toISOString(), 'timeZone': 'Asia/Manila' }
            };

            await axios.post('https://server-gzmw.onrender.com/api/googlecalendersave', {
              token,
              memoId
            }, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            setIsGoogleCalendarSaved(true);
            const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
              method: "POST",
              headers: {
                'Authorization': 'Bearer ' + tokenResponse.access_token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(event)
            });

            setSummary('');
            setDescription('');
            setstartDateTime('');
            setendDateTime('');
            toast.success("Successfully created an event on the calendar");

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Google Calendar API Error:', errorData);
            }
          }
        } else {
          console.error('Memo details are not loaded yet.');
          toast.error('Memo details are not loaded yet. Please try again later.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    const initializeGoogleSignIn = async () => {
      try {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.onload = resolve;
          document.head.appendChild(script);
        });

        google.accounts.id.initialize({
          client_id: '373547344231-ft1oo9dvva0qkbvu4aqhv8f4f82dunbu.apps.googleusercontent.com',
        });

        google.accounts.id.renderButton(
          document.getElementById('createevent'),
          { theme: 'outline', size: 'large', onClick: handleGoogleSignIn }
        );

        setTokenClient(
          google.accounts.oauth2.initTokenClient({
            client_id: '373547344231-ft1oo9dvva0qkbvu4aqhv8f4f82dunbu.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/calendar',
            callback: handleGoogleSignInCallback,
          })
        );
      } catch (error) {
        console.error('Error loading Google Sign-In API:', error);
      }
    };

    initializeGoogleSignIn();
  }, [summary, description, startDateTime, endDateTime, memoDetails]); // Add memoDetails to the dependency array

  if (!memoDetails) {
    return <p>Loading...</p>;
  }

    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };

  return (
    <>
      <HeaderDashboard />

      <div className="dashboard">
        <SidebarSecretary />

        <div className="content">
        <div className="memo-details-body">
    <Link to={'/secretary/memo_manager'} className="link-to-send">Back</Link>

    <div className="memo-details-content">
        <div className="memo-details-text">
            <p className="memo-title">Title: {memoDetails.title}</p>
            <p className="memo-sender-details">From: {memoDetails.sender}</p>
            <p className="memo-timestamp-details">Received At: {formatDate(memoDetails.createdAt)}</p>
            <p className="memo-title-startAt">Start At: {formatDate(memoDetails.startAt)}</p>
            <p className="memo-sender-endAt">End At: {formatDate(memoDetails.endAt)}</p>
           
        </div>

        <div className="memo-details-actions">
        <div className="memo-details-actions">
    {!isGoogleCalendarSaved ? (
        <button
            className="savegooglecalendar"
            id="savegooglecalendar"
            onClick={handleFormSubmit}
        >
            Google Calendar
        </button>
    ) : (
        <p className="saved-message">
            <span role="img" aria-label="Acknowledged">&#x2705;</span> {/* Checkmark icon */}
            <span className="acknowledge-text">Google Calendar</span>
        </p>
    )}

    {isAcknowledged ? (
        <div className="acknowledge-indicator">
            <span role="img" aria-label="Acknowledged">&#x2705;</span> {/* Checkmark icon */}
            <span className="acknowledge-text">Acknowledged</span>
        </div>
    ) : (
        <div className="acknowledge-container">
      
            <button
                className="acknowledge-button"
                id="acknowledge"
                onClick={handleAcknowledge}
            >
                Acknowledge Memo
            </button>
        </div>
    )}
</div>



        </div>
    </div>

    <div className="memo-pdf-container">
        {pdfUrl ? (
            <iframe
                title="PDF Viewer"
                src={pdfUrl}
                width="100%"
                height="700px"
            />
        ) : (
            <p>Loading PDF...</p>
        )}
    </div>
</div>



        
         
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SecretaryRecieveMemoDetails;

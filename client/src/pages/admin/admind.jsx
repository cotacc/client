import React, { useState, useEffect } from 'react';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import '../../App.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import SidebarAdmin from '../../components/sidebar/SidebarAdmin';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

const Admindashboard = ({ history }) => {
  const [profile, setProfile] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const memoEventsParam = queryParams.get('memoEvents');
  const initialMemoEvents = memoEventsParam
    ? JSON.parse(decodeURIComponent(memoEventsParam))
    : [];
  const [memoEvents, setMemoEvents] = useState(initialMemoEvents);
  const token = localStorage.getItem('token');
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [latestReceivedMemos, setLatestReceivedMemos] = useState([]);

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  function openModal(eventType) {
    setSelectedEventType(eventType);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  useEffect(() => {
    const fetchLatestReceivedMemos = async () => {
      try {
        const response = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const email = response.data.user.email;
        const formattedDate = getCurrentFormattedDate();

        const memoResponse = await axios.get('https://server-gzmw.onrender.com/api/getmemoofthismonth', {
          params: {
            date: formattedDate,
            token: token
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        

        const receivedMemos = memoResponse.data.memo.filter(
          (memo) => memo.senderEmail !== email
        );
        const sortedMemos = receivedMemos.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const latestReceivedMemos = sortedMemos; 

        setLatestReceivedMemos(latestReceivedMemos);
      } catch (error) {
        toast.error('Error fetching latest received memos:', error);
      }
    };

    fetchLatestReceivedMemos();
  }, [token]);

  useEffect(() => {
    fetchMemoOverview();
  }, []);

  
  const fetchMemoOverview = async () => {
    try {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();

      const allReportResponse = await axios.post(
        'https://server-gzmw.onrender.com/api/allreport',
        {
          token,
          month,
          year,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (allReportResponse.data === false) {
        setMonthlyData([]);
        return;
      }
     
      const ReceiveMemoReport = allReportResponse.data.receivememo || [];
      const SendMemoReport = allReportResponse.data.sentmemo || [];

      setMonthlyData(generateMonthlyData(ReceiveMemoReport, SendMemoReport));
    } catch (error) {
      console.log(error);
    }
  };

  const generateMonthlyData = (receiveMemos, sendMemos) => {
    const daysInMonth = 31;
    const monthlyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const sentOnDay = sendMemos.filter(
        (memo) => getDayFromDate(memo.createdAt) === day
      );
      const receivedOnDay = receiveMemos.filter(
        (memo) => getDayFromDate(memo.createdAt) === day
      );

      monthlyData.push({
        name: `Day ${day}`,
        Sent: sentOnDay.length,
        Received: receivedOnDay.length,
        sentMemos: sentOnDay,
        receivedMemos: receivedOnDay,
      });
    }

    return monthlyData;
  };


  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };
  const getDayFromDate = (date) => {
    return new Date(date).getDate();
  };
  
 

  const getCurrentFormattedDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const handleDateClick = async (value) => {
    setSelectedDate(value);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    try {
      const response = await fetch('https://server-gzmw.onrender.com/api/getme', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      const myemail = result.user.email;

      const [memoResponse, eventResponse] = await Promise.all([
        axios.post(
          'https://server-gzmw.onrender.com/api/memo/send-and-recieve',
          {
            date: formattedDate,
            token,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        axios.post(
          'https://server-gzmw.onrender.com/api/getevent',
          {
            token,
            date: formattedDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      const memoData = memoResponse.data.memo || [];
      const eventData = eventResponse.data.showmyEvents || [];

      if (memoData.length > 0 || eventData.length > 0) {
        const memoEvents = memoData.map((memo) => ({
          memoid: memo._id,
          time: new Date(memo.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          event:
            memo.senderEmail === myemail
              ? `Sent Memo: ${memo.title}`
              : `Received Memo: ${memo.title}`,
          type: memo.senderEmail === myemail ? 'sent' : 'received',
          description: memo.description,
        }));

        const myEvents = eventData.map((event) => ({
          eventid: event._id,
          time: new Date(event.createdAt).toLocaleTimeString([], {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          startDateTime: new Date(event.startDateTime).toLocaleTimeString([], {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          event: event.title,
          type: 'event',
          description: event.description,
          endDateTime: new Date(event.endDateTime).toLocaleTimeString([], {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));

        const collabEvents = [...memoEvents, ...myEvents];
        setEvents(collabEvents);
      } else {
        setEvents([
          { time: 'No Event', event: '' },
        ]);
      }
    } catch (error) {
      setEvents([
        { time: 'No Event', event: '' },
      ]);
    }
  };

 
  const handleEventClick = async (event, memoId) => {
    if (!event) {
      console.error('Event is undefined or null.');
      return;
    }
  
    if (event.type === 'sent') {
      window.location.href = `/admin/memo_Icreate/${memoId}`;
    } else if (event.type === 'received') {
      await axios.post(
        'https://server-gzmw.onrender.com/api/memo/read',
        {
          token,
          memoId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    
      window.location.href = `/admin/receive_memo/${memoId}`;
    } else {
      openModal(event);
    }
  };

  const handleOutsideClick = (e) => {
    if (isModalOpen && e.target.closest('.modal') === null) {
      closeModal();
    }
  };

  useEffect(() => {
    fetch('https://server-gzmw.onrender.com/api/getme', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setProfile(result.user);
      })
      .catch((error) => {
        console.log(error);
      });

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen]);

  const handleLatestReceivedMemoClick = async (memoId) => {
    try {
      await axios.post(
        'https://server-gzmw.onrender.com/api/memo/read',
        {
          token,
          memoId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error marking memo as read:', error);
    }
  };

  const getCurrentMonthName = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();

    return months[currentMonthIndex];
  };

  return (
    <><div className='whole'>
      <HeaderDashboard />
      
      <div className="dashboard">
        <SidebarAdmin />
        <div className="content">
          <div className="Graph-dashboard">
            <h2 className="h1">{getCurrentMonthName()} Memo Overview</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                width={730}
                height={250}
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                style={{ background: 'white' }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(tick) => Math.round(tick)} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Sent" stroke="red" />
                <Line type="monotone" dataKey="Received" stroke="blue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="memolatest" style={{ background: 'white' }}>
            <h2>Memo of this Month:</h2>
            <div className="memo-list-container">
            {latestReceivedMemos.length > 0 ? (
                <ul className="memo-list">
                  {latestReceivedMemos.map((memo) => (
                    <li key={memo._id} className="memo-item">
                      <Link
                        to={`/admin/receive_memo/${memo._id}`}
                        onClick={() => handleLatestReceivedMemoClick(memo._id)}
                        
                      >
                        <div className="memo-meta">
                          <div className="memo-date-time">
                            Sender: {memo.sender}
                          </div>
                          <div className="memo-date-time">
                            {new Date(memo.createdAt).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
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
                <p className="no-memos-message">No latest received memos found.</p>
              )}
    </div>

          </div>
          <div className="calendar-dashboard">
  <Calendar
    className="calendar"
    calendarType="gregory"
    nextLabel="Next"
    prevLabel="Prev"
    onClickDay={handleDateClick}
    value={selectedDate}
    tileContent={({ date, view }) =>
      view === 'month' &&
      Array.isArray(memoEvents) &&
      memoEvents.some(
        (event) =>
          new Date(event.time).toLocaleDateString() ===
          date.toLocaleDateString()
      ) && <div className="event-indicator"></div>
    }
  />
  <div className="eventdate">
    {selectedDate && (
      <div className="event-list">
        {events.length > 0 ? (
          <div>
            <h2>Events for {selectedDate.toDateString()}:</h2>
            <ul>
              {events.map((event, index) => (
                <li
                  key={index}
                  onClick={() => handleEventClick(event, event.memoid)}
                  className="event-item"
                >
                  <span className="event-time">{event.time}</span>  {event.event}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="no-events">No events for the selected date.</p>
        )}
      </div>
    )}
  </div>
</div>

          
        </div>
      </div>
      {isModalOpen && selectedEventType && (
        <div className="modal">
          <h2>Event Details</h2>
          <p>
            Title:{' '}
            {selectedEventType.event} <br /> Created At:{' '}
            {selectedEventType.time} <br /> Start At:{' '}
            {selectedEventType.startDateTime} <br /> End At:
            {selectedEventType.endDateTime} <br />Description:{' '}
            {selectedEventType.description}
          </p>
          <button onClick={closeModal}>Close</button>
        </div>
      )}
      <Footer />
      </div>
    </>
  );
};

export default Admindashboard;

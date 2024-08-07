import React, { useState, useEffect } from 'react';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import '../../App.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useLocation, useHistory } from 'react-router-dom';
import SidebarUser from '../../components/sidebar/SidebarUser';

const Usercalendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const memoEventsParam = queryParams.get('memoEvents');
  const initialMemoEvents = memoEventsParam ? JSON.parse(decodeURIComponent(memoEventsParam)) : [];
  const [memoEvents, setMemoEvents] = useState(initialMemoEvents);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      try {
        const response = await axios.get('https://server-gzmw.onrender.com/api/memoreceivesendthismonth', {
          params: { token },
          headers: { Authorization: `Bearer ${token}` }
        });

        const memoData = response.data.memo || [];

        const filteredMemoEvents = memoData.filter(memo => memo.type === 'Received').map((memo) => ({
          title: memo.title,
          memoid: memo._id,
          time: new Date(memo.createdAt), // Ensure memo.createdAt is in a format that can be parsed into a Date object
          event: `Received Memo: ${memo.title}`,
          type: 'Received',
        }));

        setEvents(filteredMemoEvents);
      } catch (error) {
        console.error('Error fetching user data or events:', error);
      }
    };

    fetchUserAndEvents();
  }, [token]);

  const handleDateClick = async (value) => {
    setSelectedDate(value);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    try {
      const response = await axios.post("https://server-gzmw.onrender.com/api/memo/send-and-recieve", {
        date: formattedDate,
        token
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const memoData = response.data.memo || [];

      const filteredEvents = memoData.filter(memo => memo.type === 'Received').map((memo) => ({
        title: memo.title,
        memoid: memo._id,
        time: new Date(memo.createdAt),
        event: `Received Memo: ${memo.title}`,
        type: 'Received',
      }));

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching send and receive memos:', error);
      setEvents([]);
    }
  };

  const handleEventClick = (event) => {
    if (event.type === 'Received') {
      axios.post(
        'https://server-gzmw.onrender.com/api/memo/read',
        {
          token,
          memoId:event.memoid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      history.push(`/user/memo/${event.memoid}`);
    }
  };

  return (
    <>
      <HeaderDashboard />
      <div className="dashboard">
        <SidebarUser />
        <div className="content">
          <div className="calendar-content">
            <div className="calendar-sidebar-calendar">
              <Calendar
                calendarType="gregory"
                nextLabel="Next"
                prevLabel="Prev"
                onClickDay={handleDateClick}
                value={selectedDate}
                tileContent={({ date, view }) =>
                  view === 'month' && (
                    <div className="event-indicator">
                      {Array.isArray(memoEvents) &&
                        memoEvents.some(
                          (event) => new Date(event.time).toLocaleDateString() === date.toLocaleDateString()
                        ) && <div className="event-indicator"></div>}
                    </div>
                  )
                }
              />
            </div>
            <div className="events-container">
              <div>
                <h2>Events for {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long' })}:</h2>
                {events.length > 0 ? (
                  <ul>
                    {events.map((event, index) => (
                      <li
                        key={index}
                        onClick={() => handleEventClick(event)}
                        className="event-item"
                      >
                        {selectedDate
                          ? (
                            <>
                              <strong>Time:</strong> {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  
                              <strong>Type:</strong> {event.type} 
                              <strong>Title:</strong> {event.title}
                            </>
                          ) : (
                            <>
                              <strong>Date:</strong> {event.time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} 
                              <strong>Type:</strong> {event.type}  
                              <strong>Title:</strong> {event.title}
                            </>
                          )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No events for {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'the current month'}.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Usercalendar;

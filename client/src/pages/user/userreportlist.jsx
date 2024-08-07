import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import { Link } from 'react-router-dom';
import SidebarUser from '../../components/sidebar/SidebarUser';
import '../../App.css';

const UserReport = () => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const startYear = 2000;
  const endYear = new Date().getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index).filter(year => year <= endYear);
  const token = localStorage.getItem('token');

  // Function to handle month change
  const handleMonthChange = (event) => {
    const selectedMonthValue = event.target.value;
    setSelectedMonth(selectedMonthValue);
    handleDate(selectedMonthValue, selectedYear);
  };

  // Function to handle year change
  const handleYearChange = (event) => {
    const selectedYearValue = event.target.value;
    setSelectedYear(selectedYearValue);
    handleDate(selectedMonth, selectedYearValue);
  };

  // Function to fetch data based on selected month and year
  const handleDate = async (month, year) => {
    try {
      const response = await axios.post('https://server-gzmw.onrender.com/api/allreport', {
        token,
        month,
        year,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        setMonthlyData([]);
        return;
      }

      const { receivememo } = response.data;
      setMonthlyData(generateMonthlyData(receivememo));
    } catch (error) {
      console.error(error);
      setMonthlyData([]);
    }
  };

  // Function to generate monthly data structure
  const generateMonthlyData = (receiveMemos) => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthlyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const receivedOnDay = receiveMemos.filter(memo => new Date(memo.createdAt).getDate() === day);

      monthlyData.push({
        name: `Day ${day}`,
        Received: receivedOnDay.length,
        receivedMemos: sortMemosByTitle(receivedOnDay),
      });
    }

    return monthlyData;
  };

  // Function to sort memos by title
  const sortMemosByTitle = (memos) => {
    return memos.sort((a, b) => a.title.localeCompare(b.title));
  };

  useEffect(() => {
    handleDate(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  return (
    <>
      <HeaderDashboard />
      <div className="dashboard-dashboard">
        <SidebarUser/>
        <div className="content">
          <div className="report-list">
            <label htmlFor="monthSelect">Select Month: </label>
            <select id="monthSelect" onChange={handleMonthChange} value={selectedMonth}>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <div className="filter-item">
              <label htmlFor="yearSelect">Select Year: </label>
              <select id="yearSelect" onChange={handleYearChange} value={selectedYear}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="graph-report-list">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  style={{ background: 'white' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(tick) => Math.round(tick)} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Received" stroke="blue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="report-list-memo-details">
              <h3>Details</h3>
              <div className="memo-details-on-that-day">
                {monthlyData.filter(dayData => dayData.Received > 0).length > 0 ? (
                  monthlyData.filter(dayData => dayData.Received > 0).map((dayData, index) => (
                    <div key={index} className="day-data-container">
                      <h3 className="day-title">{dayData.name}</h3>
                      <div className="memo-details-list">
                        {dayData.receivedMemos.length > 0 && (
                          <div className="memo-section">
                            <h4 className="section-title">Received Memos</h4>
                            <ul>
                              {dayData.receivedMemos.map((receivedMemo, receivedIndex) => (
                                <li key={`received-${receivedIndex}`} className="memo-item">
                                  <b>Sender:</b> {receivedMemo.sender}{' '}
                                  <b>Title:</b> {receivedMemo.title}{' '}
                                  <Link to={`/user/memo/${receivedMemo._id}`} className="view-details">
                                    View Details
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No memo found for the selected month and year.</p>
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

export default UserReport;

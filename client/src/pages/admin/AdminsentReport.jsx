import React, { useState, useEffect } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/headers&footer/headerdashboard';
import Footer from '../../components/headers&footer/footer';
import { PieChart, Pie, ResponsiveContainer, Cell, Text } from 'recharts';
import SidebarAdmin from '../../components/sidebar/SidebarAdmin';


const AdminsentReport = () => {
  const [memoDetails, setMemoDetails] = useState(null);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const history = useHistory();
  const { memoId } = useParams();
  const token = localStorage.getItem('token');
  const [pdfUrl, setPdfUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipients, setFilteredRecipients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getMeResponse = await axios.get('https://server-gzmw.onrender.com/api/getme', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await axios.get(`https://server-gzmw.onrender.com/api/memo/created/${memoId}`, {
          params: { token },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        });

        const pdfUrl = URL.createObjectURL(response.data);
        setPdfUrl(pdfUrl);

        const memodetails = await axios.get(`https://server-gzmw.onrender.com/api/memo/created_details/${memoId}`, {
          params: { token },
          headers: { Authorization: `Bearer ${token}` },
        });

        const details = memodetails.data.memo;
        const acknowledge = memodetails.data.memo.isAcknowledged;
        setIsAcknowledged(acknowledge);
        setMemoDetails(details);
        setFilteredRecipients(details.recipients);
      } catch (error) {
        console.error(error);
        history.goBack(); // Redirect or handle error accordingly
      }
    };

    fetchData();
  }, [memoId, token, history]);

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

    const filtered = memoDetails.recipients.filter((recipient) =>
      recipient.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipients(filtered);
  };

  if (!memoDetails) {
    return <p>Loading...</p>;
  }

  const acknowledgedCount = memoDetails.recipients.filter((recipient) => recipient.acknowledge).length;
  const readCount = memoDetails.recipients.filter((recipient) => recipient.read).length;
  const notReadPercentage = (((memoDetails.recipients.length - readCount) / memoDetails.recipients.length) * 100).toFixed(2);
  const notAcknowledgePercentage = (((memoDetails.recipients.length - acknowledgedCount) / memoDetails.recipients.length) * 100).toFixed(2);

  const PieChartWithCustomizedLabel = ({ data, dataKey, nameKey, position, labelTop, labelBottom }) => {
    const cxPosition = position === 'left' ? '50%' : '50%';

    return (
      <ResponsiveContainer width="50%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx={cxPosition}
            cy="50%"
            innerRadius={0}
            outerRadius={80}
            fill="black"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          {data.map((entry, index) => (
            <g key={`legend-${index}`} transform={`translate(${position === 'left' ? 10 : 10},${90 + index * 20})`}>
              <rect width="15" height="15" fill={entry.color} />
              <text x="20" y="12" textAnchor="start" fill="black" fontSize="12">
                {entry.name}
              </text>
            </g>
          ))}

          <text x="50%" y="10" textAnchor="middle" fill="black" fontSize="16" fontWeight="bold">
            {labelTop}
          </text>

          <text x="50%" y="90%" textAnchor="middle" fill="black" fontSize="12">
            {labelBottom}
          </text>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const data01 = [
    { name: 'Acknowledged', value: acknowledgedCount, color: 'green' },
    { name: 'Not Acknowledged', value: memoDetails.recipients.length - acknowledgedCount, color: 'red' },
  ];

  const data02 = [
    { name: 'Read', value: readCount, color: '#3498db' },
    { name: 'Not Read', value: memoDetails.recipients.length - readCount, color: '#f39c12' },
  ];

  const getMonthName = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
  };

  return (
    <>
      <HeaderDashboard />
      <div className="dashboard">
        <SidebarAdmin />
        <div className="content">
          <div className="memo-details-report">
            <Link to="/admin/report_list" className="link-to-report-list">Back</Link>
            <p className="memo-title-sent">Title: {memoDetails.title}</p>
            <p className="memo-timestamp-detau">Sent At: {`${getMonthName(new Date(memoDetails.createdAt))} ${new Date(memoDetails.createdAt).getDate()}, ${new Date(memoDetails.createdAt).getFullYear()} ${new Date(memoDetails.createdAt).toLocaleTimeString()}`}</p>
            <p className="memo-timestamp-detau">Start At: {`${getMonthName(new Date(memoDetails.startAt))} ${new Date(memoDetails.startAt).getDate()}, ${new Date(memoDetails.startAt).getFullYear()} ${new Date(memoDetails.startAt).toLocaleTimeString()}`}</p>
            <p className="memo-timestamp-detau">End At: {`${getMonthName(new Date(memoDetails.endAt))} ${new Date(memoDetails.endAt).getDate()}, ${new Date(memoDetails.endAt).getFullYear()} ${new Date(memoDetails.endAt).toLocaleTimeString()}`}</p>
            <div className="report-graph" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <PieChartWithCustomizedLabel
                data={data02}
                dataKey="value"
                nameKey="name"
                position="left"
                labelTop="Read Status"
                labelBottom={`Read: ${readCount} (${((readCount / memoDetails.recipients.length) * 100).toFixed(2)}%) Not Read: ${memoDetails.recipients.length - readCount} (${notReadPercentage}%)`}
              />
              <PieChartWithCustomizedLabel
                data={data01}
                dataKey="value"
                nameKey="name"
                position="right"
                labelTop="Acknowledge Status"
                labelBottom={`Acknowledged: ${acknowledgedCount} (${((acknowledgedCount / memoDetails.recipients.length) * 100).toFixed(2)}%) Not Acknowledged: ${memoDetails.recipients.length - acknowledgedCount} (${notAcknowledgePercentage}%)`}
              />
            </div>
            <div className="memo-pdf-container">
              {pdfUrl ? (
                <iframe title="PDF Viewer" src={pdfUrl} width="100%" height="500px" />
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
              <div>
                <ul className="recipient-list">
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminsentReport;

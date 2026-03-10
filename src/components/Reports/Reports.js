import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load reports');
    }
  };

  const handleSubmitReport = async () => {
    try {
      await api.submitReport({ content: newReport });
      setNewReport('');
      loadReports(); // Refresh reports
    } catch (err) {
      setError('Failed to submit report');
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <textarea
        value={newReport}
        onChange={(e) => setNewReport(e.target.value)}
        placeholder="Write your report here..."
      />
      <button onClick={handleSubmitReport}>Submit Report</button>
      <ul>
        {reports.map(report => (
          <li key={report.id}>
            {report.content} - {report.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;

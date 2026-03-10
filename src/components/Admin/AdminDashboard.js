import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const verifications = await api.getPendingVerifications();
      const reportsData = await api.getReports();
      setPendingVerifications(verifications);
      setReports(reportsData);
    } catch (err) {
      setError('Failed to load admin data');
    }
  };

  const handleVerificationReview = async (verificationId, status) => {
    try {
      await api.updateVerificationStatus(verificationId, status);
      loadAdminData(); // Refresh data
    } catch (err) {
      setError('Failed to update verification status');
    }
  };

  const handleReportStatusUpdate = async (reportId, status) => {
    try {
      await api.updateReportStatus(reportId, status);
      loadAdminData(); // Refresh data
    } catch (err) {
      setError('Failed to update report status');
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <h2>Pending Verifications</h2>
      <ul>
        {pendingVerifications.map(verification => (
          <li key={verification.id}>
            {verification.details}
            <button onClick={() => handleVerificationReview(verification.id, 'approved')}>Approve</button>
            <button onClick={() => handleVerificationReview(verification.id, 'rejected')}>Reject</button>
          </li>
        ))}
      </ul>

      <h2>Reports</h2>
      <ul>
        {reports.map(report => (
          <li key={report.id}>
            {report.content} - {report.status}
            <button onClick={() => handleReportStatusUpdate(report.id, 'resolved')}>Resolve</button>
            <button onClick={() => handleReportStatusUpdate(report.id, 'unresolved')}>Unresolve</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;

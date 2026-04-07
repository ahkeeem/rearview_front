import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './SecuritySettings.css';

const SecuritySettings = () => {
    const [loading, setLoading] = useState(false);
    const [nin, setNin] = useState('');
    const [bvn, setBvn] = useState('');
    const [status, setStatus] = useState({ nin: false, bvn: false });
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const profile = await api.users.getProfile(user.id);
            setStatus({
                nin: !!profile.nin_verified,
                bvn: !!profile.bvn_verified
            });
        } catch (err) {
            console.error('Failed to fetch security status');
        }
    };

    const handleVerifyNIN = async () => {
        if (nin.length !== 11) return alert('NIN must be 11 digits');
        setLoading(true);
        try {
            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/verifications/nin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nin })
            });
            alert('NIN Verified Successfully!');
            fetchStatus();
        } catch (err) {
            alert('Verification failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-settings">
            <header className="section-header">
                <h2>Account Security & Identity</h2>
                <p>Manage your verifiable identifiers and account safety settings.</p>
            </header>

            <div className="security-grid">
                {/* Government Identity Section */}
                <section className="security-card identity-card">
                    <div className="card-icon"><i className="fas fa-id-badge"></i></div>
                    <h3>Government ID Verification</h3>
                    <p>Link your official Nigerian identifiers to reach the 'Advanced' trust tier.</p>
                    
                    <div className="verification-fields">
                        <div className="verify-item">
                            <label>National Identification Number (NIN)</label>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    placeholder="11-digit NIN" 
                                    value={nin} 
                                    onChange={(e) => setNin(e.target.value)}
                                    disabled={status.nin || loading}
                                />
                                <button 
                                    onClick={handleVerifyNIN} 
                                    disabled={status.nin || loading || nin.length !== 11}
                                    className={status.nin ? 'verified' : ''}
                                >
                                    {status.nin ? 'Verified' : 'Verify'}
                                </button>
                            </div>
                        </div>

                        <div className="verify-item">
                            <label>Bank Verification Number (BVN)</label>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    placeholder="11-digit BVN" 
                                    value={bvn} 
                                    onChange={(e) => setBvn(e.target.value)}
                                    disabled={status.bvn || loading}
                                />
                                <button 
                                    disabled={status.bvn || loading || bvn.length !== 11}
                                    className={status.bvn ? 'verified' : ''}
                                >
                                    {status.bvn ? 'Verified' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Safety Section */}
                <section className="security-card safety-card">
                    <div className="card-icon"><i className="fas fa-shield-alt"></i></div>
                    <h3>Account Safety</h3>
                    <div className="safety-toggle">
                        <div className="toggle-info">
                            <strong>Two-Factor Authentication</strong>
                            <p>Required for all logins on this infrastructure.</p>
                        </div>
                        <div className="status-badge active">Always On</div>
                    </div>

                    <div className="safety-info">
                        <i className="fas fa-info-circle"></i>
                        <span>Auto-logout is active. You will be logged out after 30 minutes of inactivity.</span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SecuritySettings;

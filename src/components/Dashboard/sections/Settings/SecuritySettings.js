import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './SecuritySettings.css';

const SecuritySettings = () => {
    const [loading, setLoading] = useState(false);
    const [nin, setNin] = useState('');
    const [bvn, setBvn] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [status, setStatus] = useState({
        nin: false,
        bvn: false,
        email_verified: false,
        phone_verified: false,
        phone: '',
        verification_level: 'none',
        two_factor_enabled: true
    });
    const [pendingEmailOtp, setPendingEmailOtp] = useState(false);
    const [pendingPhoneOtp, setPendingPhoneOtp] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const profile = await api.users.getProfile(user.id);
            setStatus({
                nin: !!profile.nin_verified,
                bvn: !!profile.bvn_verified,
                email_verified: !!profile.email_verified,
                phone_verified: !!profile.phone_verified,
                phone: profile.phone || '',
                verification_level: profile.verification_level || 'none',
                two_factor_enabled: profile.two_factor_enabled !== 0
            });
            if (profile.phone) setPhoneInput(profile.phone);
        } catch (err) {
            console.error('Failed to fetch security status');
        }
    };

    const handleVerifyNIN = async () => {
        if (nin.length !== 11) return;
        setLoading(true);
        try {
            await api.users.verifyNIN(nin);
            alert('NIN Verified Successfully!');
            fetchStatus();
        } catch (err) {
            alert('NIN Verification failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyBVN = async () => {
        if (bvn.length !== 11) return;
        setLoading(true);
        try {
            await api.users.verifyBVN(bvn);
            alert('BVN Verified Successfully!');
            fetchStatus();
        } catch (err) {
            alert('BVN Verification failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailOTP = async () => {
        setLoading(true);
        try {
            await api.users.verifyEmail();
            setPendingEmailOtp(true);
            alert('Verification code sent to your email! Check server console for code.');
        } catch (err) {
            alert('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmEmailOTP = async () => {
        setLoading(true);
        try {
            await api.users.confirmEmailOTP(emailOtp);
            alert('Email verified!');
            setPendingEmailOtp(false);
            fetchStatus();
        } catch (err) {
            alert('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendPhoneOTP = async () => {
        if (!phoneInput) return alert('Enter a phone number first');
        setLoading(true);
        try {
            await api.users.verifyPhone(phoneInput);
            setPendingPhoneOtp(true);
            alert('Verification code sent! Check server console for code.');
        } catch (err) {
            alert('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPhoneOTP = async () => {
        setLoading(true);
        try {
            await api.users.confirmPhoneOTP(phoneOtp);
            alert('Phone verified!');
            setPendingPhoneOtp(false);
            fetchStatus();
        } catch (err) {
            alert('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle2FA = async () => {
        const newValue = !status.two_factor_enabled;
        setLoading(true);
        try {
            await api.users.toggle2FA(newValue);
            setStatus(prev => ({ ...prev, two_factor_enabled: newValue }));
        } catch (err) {
            alert('Failed to update 2FA: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-settings">
            <header className="section-header">
                <h2>Account Security & Identity</h2>
                <p>Verify your identity to unlock full platform access and boost your trust score.</p>
            </header>

            {status.verification_level === 'none' && (
                <div className="verification-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Your account is unverified. Verify your email or phone to interact with others on RearView.</span>
                </div>
            )}

            <div className="security-grid">
                {/* Email & Phone Verification */}
                <section className="security-card identity-card">
                    <div className="card-icon"><i className="fas fa-envelope"></i></div>
                    <h3>Contact Verification</h3>
                    <p>Verify your email and phone to unlock reviews, connections, and messaging.</p>

                    <div className="verification-fields">
                        {/* Email */}
                        <div className="verify-item">
                            <label>Email Address</label>
                            <div className="input-group">
                                <input type="email" value={status.email_verified ? '✓ Verified' : 'Not verified'} disabled />
                                {!status.email_verified && !pendingEmailOtp && (
                                    <button onClick={handleSendEmailOTP} disabled={loading}>
                                        Send Code
                                    </button>
                                )}
                                {status.email_verified && (
                                    <button className="verified" disabled>Verified</button>
                                )}
                            </div>
                            {pendingEmailOtp && (
                                <div className="otp-inline">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="Enter code"
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <button onClick={handleConfirmEmailOTP} disabled={loading || emailOtp.length < 6}>
                                        Confirm
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="verify-item">
                            <label>Phone Number</label>
                            <div className="input-group">
                                <input
                                    type="tel"
                                    placeholder="+234 ..."
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    disabled={status.phone_verified || loading}
                                />
                                {!status.phone_verified && !pendingPhoneOtp && (
                                    <button onClick={handleSendPhoneOTP} disabled={loading || !phoneInput}>
                                        Send Code
                                    </button>
                                )}
                                {status.phone_verified && (
                                    <button className="verified" disabled>Verified</button>
                                )}
                            </div>
                            {pendingPhoneOtp && (
                                <div className="otp-inline">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="Enter code"
                                        value={phoneOtp}
                                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <button onClick={handleConfirmPhoneOTP} disabled={loading || phoneOtp.length < 6}>
                                        Confirm
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

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
                                    onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                                    maxLength="11"
                                    disabled={status.nin || loading}
                                />
                                <button 
                                    onClick={handleVerifyNIN} 
                                    disabled={status.nin || loading || nin.length !== 11}
                                    className={status.nin ? 'verified' : ''}
                                >
                                    {status.nin ? '✓ Verified' : 'Verify'}
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
                                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                                    maxLength="11"
                                    disabled={status.bvn || loading}
                                />
                                <button 
                                    onClick={handleVerifyBVN}
                                    disabled={status.bvn || loading || bvn.length !== 11}
                                    className={status.bvn ? 'verified' : ''}
                                >
                                    {status.bvn ? '✓ Verified' : 'Verify'}
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
                            <p>Recommended for all logins on this infrastructure.</p>
                        </div>
                        <label className="settings-toggle">
                            <input 
                                type="checkbox" 
                                checked={status.two_factor_enabled}
                                onChange={handleToggle2FA}
                                disabled={loading}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="safety-toggle">
                        <div className="toggle-info">
                            <strong>Verification Level</strong>
                            <p>Current trust tier based on your verified identifiers.</p>
                        </div>
                        <div className={`status-badge ${status.verification_level === 'none' ? 'inactive' : status.verification_level === 'phone' ? 'pending' : 'active'}`}>
                            {status.verification_level === 'none' ? 'Unverified' : status.verification_level === 'phone' ? 'Basic' : 'Advanced'}
                        </div>
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

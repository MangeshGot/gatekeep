import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Key, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, token, logout, dbConnected } = useAuth();

  const getMaskedToken = () => {
    if (!token) return 'No token stored';
    return `${token.substring(0, 16)}...${token.substring(token.length - 12)}`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-logo">
          <Shield className="shield-icon" size={24} />
          <h1>Gatekeep Portal</h1>
        </div>
        <button className="btn-secondary" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-banner">
          <h2>Welcome back, {user?.username || 'User'}!</h2>
          <p>Your connection is secured with JSON Web Tokens (JWT) and MySQL query parameters.</p>
        </section>

        <div className="dashboard-grid">
          {/* Card 1: Profile Details */}
          <div className="dashboard-card">
            <div className="card-header">
              <User size={20} className="card-icon" />
              <h3>Identity Profile</h3>
            </div>
            <div className="card-body">
              <div className="detail-item">
                <span className="detail-label">User ID</span>
                <span className="detail-value font-mono">#{user?.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Username</span>
                <span className="detail-value">{user?.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              {user?.created_at && (
                <div className="detail-item">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Security & Session Status */}
          <div className="dashboard-card">
            <div className="card-header">
              <Key size={20} className="card-icon" />
              <h3>Security & Session</h3>
            </div>
            <div className="card-body">
              <div className="detail-item">
                <span className="detail-label">Auth Provider</span>
                <span className="detail-value badge-success">JWT Bearer</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Auth Token</span>
                <span className="detail-value font-mono token-value" title={token || ''}>
                  {getMaskedToken()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Algorithm</span>
                <span className="detail-value">HMAC SHA256</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Session Status</span>
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  <span className="detail-value">Active</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Database Connection</span>
                <div className="status-indicator">
                  <span className={`db-status-dot ${dbConnected ? 'connected' : dbConnected === false ? 'disconnected' : 'checking'}`}></span>
                  <span className="detail-value">
                    {dbConnected === null ? 'Checking...' : dbConnected ? 'Connected (AWS RDS)' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: System Audits / Logs */}
          <div className="dashboard-card full-width">
            <div className="card-header">
              <Activity size={20} className="card-icon" />
              <h3>System Access Verification</h3>
            </div>
            <div className="card-body">
              <p className="logs-summary">
                The JWT is verified dynamically on each request by server-side middleware. 
                Passwords are never stored in plain text; they are hashed on registration with a work factor of 10 using `bcryptjs`.
              </p>
              <div className="steps-flow">
                <div className="step">
                  <div className="step-num">1</div>
                  <div className="step-text">
                    <strong>Client-side Login:</strong> Credentials (email/password) sent over POST.
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">2</div>
                  <div className="step-text">
                    <strong>Password Compare:</strong> Server matches plain password with stored bcrypt hash.
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">3</div>
                  <div className="step-text">
                    <strong>JWT Generation:</strong> Server signs a JWT with user details and sends to client.
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">4</div>
                  <div className="step-text">
                    <strong>Protected Queries:</strong> Client sends JWT in <code>Authorization: Bearer &lt;token&gt;</code> header.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

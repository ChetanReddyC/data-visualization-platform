import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  // State variables for email, password, submission status, and local error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Access authentication functions and error from context
  const { login, loginWithGoogle, error } = useAuth();
  const navigate = useNavigate();

  // Handle login with email and password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      // Attempt to log in and navigate to dashboard on success
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // If there's an error not captured by the context, display it
      if (!error) {
        setLocalError(err.displayMessage || err.message || "Authentication error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle login with Google
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      // Attempt to log in with Google and navigate to dashboard on success
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      // If there's an error not captured by the context, display it
      if (!error) {
        setLocalError(err.displayMessage || err.message || "Authentication error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format error messages with line breaks
  const formatErrorMessage = (message: string) => {
    if (message.includes('\n')) {
      return message.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < message.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
    return message;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            {/* Logo for the application */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" stroke="#C8E972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 6L12 10L20 6" stroke="#C8E972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V10" stroke="#C8E972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="14" r="2" fill="#C8E972" />
            </svg>
          </div>
          <div className="auth-title">
            <h1>Data Viz Platform</h1>
            <p>Insights through visualization</p>
          </div>
        </div>
        
        <h2>Log In</h2>
        <p className="auth-subtitle">Welcome back to your dashboard</p>
        
        {/* Display error messages if any */}
        {error && <div className="auth-error">{formatErrorMessage(error)}</div>}
        {localError && <div className="auth-error">{formatErrorMessage(localError)}</div>}
        
        <form onSubmit={handleEmailLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin} 
          className="btn btn-google btn-block"
          disabled={isSubmitting}
        >
          {/* Google login button with icon */}
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 
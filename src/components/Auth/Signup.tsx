import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { signup, loginWithGoogle, error } = useAuth();
  const navigate = useNavigate();

  const validatePassword = () => {
    setPasswordError(null);
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      await signup(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Handle any additional errors not captured by the context
      if (!error) {
        // Use custom display message if available, otherwise use regular message
        setLocalError(err.displayMessage || err.message || "Authentication error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      // Handle any additional errors not captured by the context
      if (!error) {
        // Use custom display message if available, otherwise use regular message
        setLocalError(err.displayMessage || err.message || "Authentication error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format multi-line error messages with line breaks
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
        
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Start your data visualization journey</p>
        
        {error && <div className="auth-error">{formatErrorMessage(error)}</div>}
        {passwordError && <div className="auth-error">{formatErrorMessage(passwordError)}</div>}
        {localError && <div className="auth-error">{formatErrorMessage(localError)}</div>}
        
        <form onSubmit={handleSignup} className="signup-form">
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
              placeholder="At least 6 characters"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Re-enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleGoogleSignup} 
          className="btn btn-google btn-block"
          disabled={isSubmitting}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </button>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 
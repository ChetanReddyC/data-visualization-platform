import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  // Access current user and logout function from authentication context
  const { currentUser, logout } = useAuth();
  // State to manage logout process
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Function to handle user logout
  const handleLogout = async () => {
    setIsLoggingOut(true); // Indicate that logout is in progress
    try {
      await logout(); // Attempt to log the user out
      navigate('/login'); // Redirect to login page after successful logout
    } catch (error) {
      console.error('Logout error:', error); // Log any errors during logout
    } finally {
      setIsLoggingOut(false); // Reset logout state
    }
  };

  // If no user is logged in, display a message
  if (!currentUser) {
    return <div>No user logged in</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div>
            <h2>Your Profile</h2>
            <p className="profile-subtitle">Manage your account information</p>
          </div>
          <div className="profile-avatar">
            {currentUser.photoURL ? (
              // Display user's profile picture if available
              <img src={currentUser.photoURL} alt="Profile" />
            ) : (
              // Placeholder with the first letter of the user's email if no picture
              <div className="avatar-placeholder">
                {currentUser.email?.[0].toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-info">
            <span className="label">Email</span>
            <span className="value">{currentUser.email}</span>
          </div>
          
          {currentUser.displayName && (
            <div className="profile-info">
              <span className="label">Name</span>
              <span className="value">{currentUser.displayName}</span>
            </div>
          )}
          
          <div className="profile-info">
            <span className="label">User ID</span>
            <span className="value user-id">{currentUser.uid}</span>
          </div>
          
          <div className="profile-info">
            <span className="label">Email Verified</span>
            <span className="value verification-status">
              {currentUser.emailVerified ? (
                <span className="verified">Verified</span>
              ) : (
                <span className="not-verified">Not Verified</span>
              )}
            </span>
          </div>

          <div className="profile-info">
            <span className="label">Account Created</span>
            <span className="value">
              {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>
        
        <div className="profile-actions">
          <button 
            onClick={handleLogout} 
            className="btn btn-primary"
            disabled={isLoggingOut} // Disable button while logging out
          >
            {isLoggingOut ? 'Logging Out...' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
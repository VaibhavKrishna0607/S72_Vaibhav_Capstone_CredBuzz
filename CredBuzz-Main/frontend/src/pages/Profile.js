import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Pages.css';

const Profile = () => {
  const { user: authUser, token, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        setError('No authentication token found.');
        return;
      }
      try {
        const response = await axios.get('/auth/me');
        setProfileUser(response.data.user);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
    setUploadMessage(null);
    setUploadError(null);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    if (!token) {
      setUploadError('You must be logged in to upload an avatar.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await axios.post('/users/upload-avatar', formData, config);

      if (response.data.success) {
        const updatedUser = {
          ...response.data.user,
          _id: response.data.user.id
        };
        setProfileUser(updatedUser);
        setUser(updatedUser);
        setUploadMessage('Avatar uploaded successfully!');
        setAvatarFile(null);
      } else {
        setUploadError(response.data.message || 'Failed to upload avatar.');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err.response?.data?.message || err.message);
      setUploadError(err.response?.data?.message || 'Failed to upload avatar.');
    }
  };

  if (loading) {
    return <div className="page-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="page-container error-message">Error: {error}</div>;
  }

  if (!profileUser) {
    return <div className="page-container">Please log in to view your profile.</div>;
  }

  return (
    <div className="page-container profile-page">
      <header className="profile-header">
        <img 
          src={profileUser.avatar || 'https://via.placeholder.com/120/000000/FFFFFF?text=GR'} 
          alt="User Avatar" 
          className="profile-avatar"
        />
        <h1>{profileUser.name}</h1>
        <p>{profileUser.bio || 'No bio available.'}</p>

        <div className="avatar-upload-section">
          <h3>Change Profile Picture</h3>
          {uploadMessage && <div className="success-message">{uploadMessage}</div>}
          {uploadError && <div className="error-message">{uploadError}</div>}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange} 
            className="file-input"
          />
          <button 
            onClick={handleAvatarUpload} 
            className="btn btn-primary"
            disabled={!avatarFile}
          >
            Upload Avatar
          </button>
        </div>

      </header>

      <div className="profile-details">
        <section className="profile-section">
          <h2>Contact Information</h2>
          <div className="profile-info">
            <p><strong>Email:</strong> {profileUser.email}</p>
            <p><strong>Joined:</strong> {new Date(profileUser.joinedDate).toLocaleDateString()}</p>
            <p><strong>Credits:</strong> {profileUser.credits} ₵</p>
            <p><strong>Rating:</strong> {profileUser.rating} / 5</p>
          </div>
        </section>

        <section className="profile-section">
          <h2>Skills</h2>
          <div className="profile-skills">
            {profileUser.skills.length > 0 ? (
              profileUser.skills.map(skill => (
                <span key={skill}>{skill}</span>
              ))
            ) : (
              <p>No skills listed.</p>
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2>Task Summary</h2>
          <div className="profile-info">
            <p><strong>Tasks Completed:</strong> {profileUser.tasksCompleted}</p>
            <p><strong>Tasks Created:</strong> {profileUser.tasksCreated}</p>
          </div>
        </section>
      </div>

      {/* Removed dummy createdTasks and claimedTasks lists as per user request to remove dummy data. 
          Backend doesn't currently expose full task lists via /auth/me, only counts. */}
      
    </div>
  );
};

export default Profile; 
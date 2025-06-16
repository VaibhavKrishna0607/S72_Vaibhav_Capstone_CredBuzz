import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Pages.css';

const SingleTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`/tasks/${id}`);
        setTask(response.data.task);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task.');
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleSubmission = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitError(null);

    if (!user || !token) {
      setSubmitError('You must be logged in to submit a task.');
      return;
    }

    if (task.claimant?._id !== user._id) {
      setSubmitError('You can only submit tasks you have claimed.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', submissionContent || ''); // Ensure content is never undefined
      
      // Append each file to the FormData
      if (submissionFiles.length > 0) {
        submissionFiles.forEach(file => {
          formData.append('files', file);
        });
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.put(`/tasks/${id}/submit`, formData, config);
      
      if (response.data.success) {
        setSubmitMessage('Task submitted successfully!');
        // Update the task data with the response
        setTask(response.data.task);
        // Clear the form
        setSubmissionContent('');
        setSubmissionFiles([]);
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/tasks');
        }, 2000);
      } else {
        setSubmitError('Failed to submit task. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting task:', err.response?.data?.message || err.message);
      setSubmitError(err.response?.data?.message || 'Failed to submit task.');
    }
  };

  // Function to handle file download
  const handleFileDownload = async (fileUrl) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Check if the file is an image
      const contentType = response.headers['content-type'];
      const isImage = contentType.startsWith('image/');
      
      if (isImage) {
        // For images, create a new window/tab to view the image
        const url = window.URL.createObjectURL(new Blob([response.data]));
        window.open(url, '_blank');
      } else {
        // For other files, download them
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileUrl.split('/').pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  // Function to check if a file is an image
  const isImageFile = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png'].includes(ext);
  };

  // Function to get image preview URL
  const getImagePreviewUrl = (filename) => {
    return `/api/tasks/${id}/files/${filename}`;
  };

  const handleClaimTask = async () => {
    if (!user || !token) {
      alert('You must be logged in to claim a task.');
      return;
    }
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.put(`/tasks/${id}/claim`, {}, config);
      alert('Task claimed successfully!');
      // Refresh task data
      const response = await axios.get(`/tasks/${id}`);
      setTask(response.data.task);
    } catch (err) {
      console.error('Error claiming task:', err.response?.data?.message || err.message);
      alert(`Failed to claim task: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleApproveTask = async () => {
    if (!user || !token) {
      alert('You must be logged in to approve a task.');
      return;
    }
    if (task.creator?._id !== user._id) {
      alert('You are not authorized to approve this task.');
      return;
    }
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.put(`/tasks/${id}/approve`, {}, config);
      alert('Task approved successfully!');
      navigate('/tasks'); // Redirect after approval/deletion
    } catch (err) {
      console.error('Error approving task:', err.response?.data?.message || err.message);
      alert(`Failed to approve task: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleRejectTask = async () => {
    const reason = prompt("Please provide a reason for rejecting the task:");
    if (!reason) {
      alert("Rejection reason is required.");
      return;
    }

    if (!user || !token) {
      alert('You must be logged in to reject a task.');
      return;
    }
    if (task.creator?._id !== user._id) {
      alert('You are not authorized to reject this task.');
      return;
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.put(`/tasks/${id}/reject`, { reason }, config);
      alert('Task rejected successfully!');
      navigate('/tasks'); // Redirect after rejection
    } catch (err) {
      console.error('Error rejecting task:', err.response?.data?.message || err.message);
      alert(`Failed to reject task: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    if (!user || !token) {
      alert('You must be logged in to delete a task.');
      return;
    }
    if (task.creator?._id !== user._id) {
      alert('You are not authorized to delete this task.');
      return;
    }
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.delete(`/tasks/${id}`, config);
      alert('Task deleted successfully!');
      navigate('/mytasks'); // Redirect after deletion
    } catch (err) {
      console.error('Error deleting task:', err.response?.data?.message || err.message);
      alert(`Failed to delete task: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return <div className="page-container">Loading task details...</div>;
  }

  if (error) {
    return <div className="page-container error-message">Error: {error}</div>;
  }

  if (!task) {
    return <div className="page-container">Task not found.</div>;
  }

  // Determine if the current user is the creator
  const isCreator = user && task.creator?._id === user._id;

  // Determine if the delete button should be shown
  const showDeleteButton = isCreator && task.status !== 'completed' && task.status !== 'approved' && !task.claimant;

  return (
    <div className="page-container single-task-page">
      <h1>{task.title}</h1>
      <p className="credits">Credits: {task.credits} ₵</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Creator:</strong> {task.creator?.name || 'N/A'}</p>
      {task.claimant && <p><strong>Claimant:</strong> {task.claimant?.name || 'N/A'}</p>}
      <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
      <p><strong>Estimated Hours:</strong> {task.estimatedHours} hours</p>
      <p><strong>Category:</strong> {task.category}</p>

      {/* Debug Information */}
      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f5f5f5' }}>
        <h3>Debug Information:</h3>
        <p>User ID: {user?._id || 'Not logged in'}</p>
        <p>Token exists: {token ? 'Yes' : 'No'}</p>
        <p>LocalStorage token: {localStorage.getItem('token') ? 'Exists' : 'Not found'}</p>
        <p>Task Status: {task.status}</p>
        <p>Task Claimant ID: {task.claimant?._id || 'No claimant'}</p>
        <p>Should Show Form: {user && task.status === 'in-progress' && task.claimant?._id === user._id ? 'Yes' : 'No'}</p>
        <p>Is Creator: {isCreator ? 'Yes' : 'No'}</p>
        <p>Show Delete Button: {showDeleteButton ? 'Yes' : 'No'}</p>
      </div>

      <h3>Description:</h3>
      <p>{task.description}</p>

      {showDeleteButton && (
        <button className="btn btn-delete" onClick={handleDeleteTask}>
          Delete Task
        </button>
      )}

      <div className="task-skills">
        <strong>Skills:</strong>
        {task.skills.map(skill => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      {/* Claim button for available tasks */}
      {user && task.status === 'open' && !task.claimant && (
        <button className="btn-claim" onClick={handleClaimTask}>
          Claim Task
        </button>
      )}

      {/* Submission form for claimant */}
      {user && task.status === 'in-progress' && task.claimant?._id === user._id && (
        <section className="submission-section">
          <h2>Submit Your Work</h2>
          {submitMessage && <div className="success-message">{submitMessage}</div>}
          {submitError && <div className="error-message">{submitError}</div>}
          <form onSubmit={handleSubmission}>
            <div className="form-group">
              <label htmlFor="submissionContent">Submission Text</label>
              <textarea
                id="submissionContent"
                name="submissionContent"
                rows="8"
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="submissionFiles">Upload Images (PNG, JPG)</label>
              <input
                type="file"
                id="submissionFiles"
                name="submissionFiles"
                multiple
                accept=".png,.jpg,.jpeg"
                onChange={(e) => setSubmissionFiles(Array.from(e.target.files))}
              />
              <small>Supported formats: PNG, JPG (max 5MB per file)</small>
            </div>
            <button type="submit" className="btn-submit">Submit Task</button>
          </form>
        </section>
      )}

      {/* Show submission files */}
      {task.submission?.files && task.submission.files.length > 0 && (
        <div className="submission-files">
          <h3>Submitted Files:</h3>
          <div className="files-grid">
            {task.submission.files.map((file, index) => (
              <div key={index} className="file-item">
                {isImageFile(file) ? (
                  <div className="image-preview">
                    <img 
                      src={getImagePreviewUrl(file)} 
                      alt={`Submission ${index + 1}`}
                      className="preview-image"
                    />
                    <div className="image-actions">
                      <button 
                        className="btn-view"
                        onClick={() => handleFileDownload(`/api/tasks/${task._id}/files/${file}`)}
                      >
                        View Full Size
                      </button>
                      <button 
                        className="btn-download"
                        onClick={() => handleFileDownload(`/api/tasks/${task._id}/files/${file}`)}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="file-info">
                    <span>{file}</span>
                    <button 
                      className="btn-download"
                      onClick={() => handleFileDownload(`/api/tasks/${task._id}/files/${file}`)}
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creator actions (Approve, Reject, Cancel) */}
      {user && task.creator?._id === user._id && task.status === 'submitted' && (
        <section className="creator-actions">
          <h2>Task Submission</h2>
          <div className="submission-details">
            <h3>Submission Content:</h3>
            <div className="submission-content">
              {task.submission?.content ? (
                <p>{task.submission.content}</p>
              ) : (
                <p className="no-content">No submission content provided.</p>
              )}
            </div>
            
            {task.submission?.submittedAt && (
              <p className="submission-date">
                Submitted on: {new Date(task.submission.submittedAt).toLocaleString()}
              </p>
            )}
            
            {task.submission?.files && task.submission.files.length > 0 && (
              <div className="submission-files">
                <h3>Submitted Files:</h3>
                <ul>
                  {task.submission.files.map((file, index) => (
                    <li key={index}>
                      <span>{file}</span>
                      <button 
                        className="btn-download"
                        onClick={() => handleFileDownload(`/api/tasks/${task._id}/files/${file}`)}
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn-approve" onClick={handleApproveTask}>Approve Task</button>
              <button className="btn-reject" onClick={handleRejectTask}>Reject Task</button>
            </div>
          </div>
        </section>
      )}

      {/* Show completion status for completed tasks */}
      {task.status === 'completed' && (
        <section className="task-status-section">
          <h2>Task Status</h2>
          <div className="status-details">
            <p className="status-completed">✓ Task Completed</p>
            {task.submission?.submittedAt && (
              <p className="completion-date">
                Completed on: {new Date(task.submission.submittedAt).toLocaleString()}
              </p>
            )}
            <div className="completion-details">
              <h3>Final Submission</h3>
              <div className="submission-content">
                {task.submission?.content ? (
                  <p>{task.submission.content}</p>
                ) : (
                  <p className="no-content">No submission content provided.</p>
                )}
              </div>
              
              {task.submission?.files && task.submission.files.length > 0 && (
                <div className="submission-files">
                  <h3>Submitted Files:</h3>
                  <ul>
                    {task.submission.files.map((file, index) => (
                      <li key={index}>
                        <span>{file}</span>
                        <button 
                          className="btn-download"
                          onClick={() => handleFileDownload(`/api/tasks/${task._id}/files/${file}`)}
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SingleTask; 
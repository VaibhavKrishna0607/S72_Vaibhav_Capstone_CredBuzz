import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Pages.css';

const CreateTask = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    credits: 0, // Default credits to 0 for slider
    deadline: '',
    estimatedHours: '',
    category: '',
  });
  const [skillsInput, setSkillsInput] = useState(''); // For individual skill input
  const [skills, setSkills] = useState([]); // Array to store added skills
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [userCredits, setUserCredits] = useState(0); // State for user's credit balance

  // Fetch user credits on component mount
  React.useEffect(() => {
    const fetchUserCredits = async () => {
      if (user && token) {
        try {
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          };
          const response = await axios.get(`/users/${user._id}/credits`, config);
          setUserCredits(response.data.credits);
        } catch (err) {
          console.error('Error fetching user credits:', err);
          // Optionally set an error state for credits
        }
      }
    };
    fetchUserCredits();
  }, [user, token]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const handleSkillInputChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const handleAddSkill = () => {
    if (skillsInput.trim() !== '' && !skills.includes(skillsInput.trim())) {
      setSkills([...skills, skillsInput.trim()]);
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError('You must be logged in to create a task.');
      return;
    }

    // Validate credits offered vs user balance
    if (formData.credits > userCredits) {
      setError('Credits offered cannot exceed your available balance.');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      const taskData = {
        ...formData,
        skills: skills, // Use the skills array
      };

      const res = await axios.post('/tasks', taskData, config);
      setMessage('Task created successfully!');
      setFormData({
        title: '',
        description: '',
        credits: 0,
        deadline: '',
        estimatedHours: '',
        category: '',
      });
      setSkills([]); // Clear skills after submission
      setSkillsInput('');
      // Refresh user credits after task creation
      // This might require a refresh of the user object in AuthContext or a separate fetch
      // For now, let's re-fetch from the API directly after successful task creation
      if (user && token) {
        const creditsResponse = await axios.get(`/users/${user._id}/credits`, config);
        setUserCredits(creditsResponse.data.credits);
      }
      console.log(res.data);
    } catch (err) {
      console.error('Error creating task:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  return (
    <div className="page-container create-task-page">
      <div className="create-task-grid">
        <div className="create-task-main-form">
          <h1>Create a New Task</h1>
          <p className="page-description">Describe what you need help with and how many credits you're offering.</p>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Task Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Website Design for Small Business" required />
            </div>

            <div className="form-group">
              <label htmlFor="description">Task Description</label>
              <textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange} placeholder="Provide a detailed description of what you need..." required></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Writing">Writing</option>
                <option value="Marketing">Marketing</option>
                <option value="Data">Data</option>
                <option value="Testing">Testing</option>
                <option value="Education">Education</option>
                <option value="Administration">Administration</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="credits">Credits Offered</label>
              <div className="credits-slider-group">
                <input 
                  type="range" 
                  id="credits" 
                  name="credits" 
                  value={formData.credits} 
                  onChange={handleChange} 
                  min="0" 
                  max="10000" 
                  step="1" 
                  className="slider"
                />
                <span className="credits-value">{formData.credits} ₵</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="skillsInput">Required Skills</label>
              <div className="skills-input-group">
                <input 
                  type="text" 
                  id="skillsInput" 
                  name="skillsInput" 
                  value={skillsInput} 
                  onChange={handleSkillInputChange} 
                  placeholder="e.g., JavaScript, Figma"
                />
                <button type="button" className="btn-add-skill" onClick={handleAddSkill}>Add</button>
              </div>
              <div className="skills-display">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill} 
                    <button type="button" className="btn-remove-skill" onClick={() => handleRemoveSkill(skill)}>x</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedHours">Estimated Time to Complete</label>
              <select id="estimatedHours" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange} required>
                <option value="">Select time estimate</option>
                <option value="1-3">1-3 hours</option>
                <option value="3-5">3-5 hours</option>
                <option value="5-10">5-10 hours</option>
                <option value="10-20">10-20 hours</option>
                <option value="20+">20+ hours</option>
              </select>
            </div>

            {/* Deadline field from original form, not in image but keeping for functionality unless specified */}
            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-submit">Create Task</button>
          </form>
        </div>

        <div className="create-task-sidebar">
          <div className="info-card">
            <div className="info-card-header">
              <h2>Your Credit Balance</h2>
            </div>
            <div className="info-card-content">
              <p className="credits-balance"><strong>{userCredits}</strong> credits available</p>
              <p>You're offering <span className="offered-credits">{formData.credits}</span> credits for this task.</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <h2>Tips for a Great Task</h2>
            </div>
            <div className="info-card-content tips-list">
              <p className="tip-item"><span className="check-icon">✔</span> Be specific about what you need and what the final deliverable should look like.</p>
              <p className="tip-item"><span className="check-icon">✔</span> Set a realistic credit amount based on the complexity and time required.</p>
              <p className="tip-item"><span className="check-icon">✔</span> List all the skills required for someone to successfully complete the task.</p>
              <p className="tip-item"><span className="check-icon">✔</span> Be responsive to questions from potential task claimers.</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <h2>Need Help?</h2>
            </div>
            <div className="info-card-content">
              <p>If you have questions about creating tasks or how the platform works, check out our help center or contact support.</p>
              <a href="#" className="btn btn-secondary help-link">Go to Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask; 
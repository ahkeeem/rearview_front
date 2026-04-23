import React from 'react';
import './ProfileCompletion.css';

const ProfileCompletion = ({ progress = 0, tasks = [] }) => {
  const defaultTasks = [
    { id: 1, label: 'Add profile picture', completed: false },
    { id: 2, label: 'Verify email address', completed: true },
    { id: 3, label: 'Complete work history', completed: false },
    { id: 4, label: 'Add skills', completed: false },
    { id: 5, label: 'Get first review', completed: false }
  ];

  const activeTasks = tasks.length > 0 ? tasks : defaultTasks;

  return (
    <div className="profile-completion-card">
      <h3>Complete Your Profile</h3>
      
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">{progress}% Complete</span>
      </div>

      <div className="tasks-list">
        {activeTasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <i className={`fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}`}></i>
            <span>{task.label}</span>
          </div>
        ))}
      </div>

      <button className="complete-profile-btn">
        Complete Profile
        <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
};

export default ProfileCompletion;

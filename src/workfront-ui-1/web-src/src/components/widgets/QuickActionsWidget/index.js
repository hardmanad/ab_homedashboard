import React from 'react';

const QuickActionsWidget = () => {
  const quickActions = [
    { label: 'Create Project', variant: 'primary', icon: '📋' },
    { label: 'Add Task', variant: 'secondary', icon: '✅' },
    { label: 'Schedule Meeting', variant: 'secondary', icon: '📅' },
    { label: 'Assign Resources', variant: 'secondary', icon: '👥' },
    { label: 'Generate Report', variant: 'secondary', icon: '📊' },
    { label: 'Upload Files', variant: 'secondary', icon: '📁' },
    { label: 'Set Milestone', variant: 'secondary', icon: '🎯' },
    { label: 'Review Approval', variant: 'secondary', icon: '👁️' },
    { label: 'Time Tracking', variant: 'secondary', icon: '⏱️' },
    { label: 'Team Chat', variant: 'secondary', icon: '💬' }
  ];

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Quick Actions</h3>
        <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>
          View All
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '0.75rem' 
      }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            className={`btn ${action.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              height: '60px', 
              flexDirection: 'column',
              fontSize: '0.75rem',
              padding: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsWidget; 
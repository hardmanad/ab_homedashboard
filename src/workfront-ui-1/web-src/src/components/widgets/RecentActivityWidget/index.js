import React from 'react';

const RecentActivityWidget = () => {
  const activities = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'completed milestone',
      target: 'Q4 Marketing Campaign',
      time: '2 hours ago',
      type: 'milestone'
    },
    {
      id: 2,
      user: 'Mike Chen',
      action: 'uploaded project files',
      target: 'Website Redesign Project',
      time: '4 hours ago',
      type: 'upload'
    },
    {
      id: 3,
      user: 'Lisa Rodriguez',
      action: 'assigned task to',
      target: 'David Kim',
      time: '6 hours ago',
      type: 'assignment'
    },
    {
      id: 4,
      user: 'David Kim',
      action: 'approved project budget',
      target: 'Mobile App Development',
      time: '1 day ago',
      type: 'approval'
    },
    {
      id: 5,
      user: 'Emma Wilson',
      action: 'reported time spent',
      target: 'UI/UX Design Tasks',
      time: '1 day ago',
      type: 'time'
    },
    {
      id: 6,
      user: 'Alex Thompson',
      action: 'joined project team',
      target: 'E-commerce Platform',
      time: '2 days ago',
      type: 'join'
    }
  ];

  const getActivityColor = (type) => {
    switch (type) {
      case 'milestone': return 'positive';
      case 'upload': return 'informative';
      case 'assignment': return 'notice';
      case 'approval': return 'positive';
      case 'time': return 'informative';
      case 'join': return 'informative';
      default: return 'text-700';
    }
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Recent Activity</h3>
        <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>
          View All
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activities.map((activity, index) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-avatar">
              {activity.user.charAt(0)}
            </div>
            
            <div className="activity-content">
              <div className="activity-text">
                <strong>{activity.user}</strong> {activity.action}{' '}
                <span style={{ color: getActivityColor(activity.type) }}>
                  {activity.target}
                </span>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        backgroundColor: '#fef3c7', 
        padding: '0.75rem', 
        borderRadius: '8px',
        marginTop: '1rem',
        border: '1px solid #fde68a'
      }}>
        <p style={{ 
          fontSize: '0.75rem', 
          color: '#92400e',
          margin: 0,
          fontWeight: '500'
        }}>
          💡 <strong>Tip:</strong> Use @mentions to notify team members about updates.
        </p>
      </div>
    </div>
  );
};

export default RecentActivityWidget; 
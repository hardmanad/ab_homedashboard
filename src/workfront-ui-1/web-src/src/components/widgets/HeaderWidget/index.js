import React from 'react';

const HeaderWidget = () => {
  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <h2 className="widget-title">Project Overview</h2>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Track your project progress and team performance
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary">
            + New Project
          </button>
          <button className="btn btn-secondary">
            Export Report
          </button>
        </div>
      </div>
      
      <div className="metric-grid">
        <div className="metric-card">
          <div className="progress-circle positive">85%</div>
          <div className="metric-value">85%</div>
          <div className="metric-label">On-Time Delivery</div>
          <div className="metric-change positive">+5% vs last month</div>
        </div>
        
        <div className="metric-card">
          <div className="progress-circle informative">12</div>
          <div className="metric-value">12</div>
          <div className="metric-label">Active Projects</div>
          <div className="metric-change positive">+2 new this week</div>
        </div>
        
        <div className="metric-card">
          <div className="progress-circle notice">92%</div>
          <div className="metric-value">92%</div>
          <div className="metric-label">Resource Utilization</div>
          <div className="metric-change positive">+3% vs target</div>
        </div>
        
        <div className="metric-card">
          <div className="progress-circle negative">5</div>
          <div className="metric-value">5</div>
          <div className="metric-label">Overdue Tasks</div>
          <div className="metric-change negative">+2 from yesterday</div>
        </div>
      </div>
    </div>
  );
};

export default HeaderWidget; 
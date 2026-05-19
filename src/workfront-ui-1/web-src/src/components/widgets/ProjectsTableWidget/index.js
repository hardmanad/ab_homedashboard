import React, { useState, useEffect } from 'react';
import { ProgressCircle, Provider, defaultTheme } from '@adobe/react-spectrum';
import actionWebInvoke, { getActionUrl } from '../../utils/utils';
import { getPriorityName, getPriorityValue, getPriorityColor, getStatusName, getStatusColor } from '../../../constants';

const PROJECTS_ACTION_PATH = '/api/v1/web/home-dashboard/projectsTableWidget';
const WFAPI_ACTION_PATH = '/api/v1/web/home-dashboard/wfapi';

const ProjectsTableWidget = ({ accessToken, hostname }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingProject, setUpdatingProject] = useState(null); // Track which project is being updated

  useEffect(() => {
    if (!accessToken || !hostname) return; // Only run if accessToken and hostname is set and changed
    
    const fetchData = async () => {
      try {
        const actionUrl = getActionUrl(PROJECTS_ACTION_PATH);
        const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
        const actionParams = { 'hostname': hostname };
        const projectsReq = await actionWebInvoke(actionUrl, actionHeaders, actionParams);
        const fetchedProjects = await projectsReq.json();
        
        console.log('Fetched Projects:', fetchedProjects);
        setProjects(fetchedProjects);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [accessToken, hostname]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatHours = (hours) => {
    return `${hours}h`;
  };

  const handleProjectClick = (projectId) => {
    if (hostname) {
      window.top.location.href = `https://${hostname}/project/${projectId}`;
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    console.log(`Updating project ${projectId} status to ${newStatus}`);
    setUpdatingProject(projectId);
    
    try {
      const actionUrl = getActionUrl(WFAPI_ACTION_PATH);
      const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
      const actionParams = {
        'requestObj': {
          'hostname': hostname,
          'method': 'put',
          'objCode': 'PROJ',
          'ID': projectId,
          'parameters': {
            'status': newStatus
          }
        }
      };
      
      const response = await actionWebInvoke(actionUrl, actionHeaders, actionParams);
      
      if (response.status === 200) {
        console.log(`Successfully updated project ${projectId} status`);
        // Update local state
        setProjects(prevProjects => 
          prevProjects.map(proj => 
            proj.id === projectId 
              ? { ...proj, status: newStatus }
              : proj
          )
        );
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handlePriorityChange = async (projectId, newPriority) => {
    console.log(`Updating project ${projectId} priority to ${newPriority}`);
    setUpdatingProject(projectId);
    
    try {
      const actionUrl = getActionUrl(WFAPI_ACTION_PATH);
      const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
      const actionParams = {
        'requestObj': {
          'hostname': hostname,
          'method': 'put',
          'objCode': 'PROJ',
          'ID': projectId,
          'parameters': {
            'priority': newPriority
          }
        }
      };
      
      const response = await actionWebInvoke(actionUrl, actionHeaders, actionParams);
      
      if (response.status === 200) {
        console.log(`Successfully updated project ${projectId} priority`);
        // Update local state
        setProjects(prevProjects => 
          prevProjects.map(proj => 
            proj.id === projectId 
              ? { ...proj, priority: newPriority }
              : proj
          )
        );
      }
    } catch (error) {
      console.error('Error updating project priority:', error);
      alert('Failed to update project priority');
    } finally {
      setUpdatingProject(null);
    }
  };


  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Projects - Work Effort Overview</h3>
          <p className="widget-subtitle">{projects.length} Projects</p>
        </div>
      </div>

      {isLoading ? (
        <Provider theme={defaultTheme}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <ProgressCircle aria-label="Loading projects..." isIndeterminate />
          </div>
        </Provider>
      ) : projects.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
          <h4>No Projects Found</h4>
          <p style={{ color: '#64748b' }}>There are no current or planning projects to display.</p>
        </div>
      ) : (
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Project Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Priority</th>
                <th className="text-right">Planned Hours</th>
                <th className="text-right">Actual Hours</th>
                <th className="text-right">Remaining Hours</th>
                <th className="text-right">% Complete</th>
                <th className="text-right">Planned Cost</th>
                <th className="text-right">Actual Cost</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="reference-number">{project.referenceNumber}</td>
                  <td>
                    <span 
                      className="project-name-link" 
                      onClick={() => handleProjectClick(project.id)}
                    >
                      {project.name}
                    </span>
                  </td>
                  <td>{project.owner}</td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      disabled={updatingProject === project.id}
                      style={{
                        backgroundColor: `${getStatusColor(project.status)}15`,
                        color: getStatusColor(project.status),
                        border: `1px solid ${getStatusColor(project.status)}40`,
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: updatingProject === project.id ? 'wait' : 'pointer',
                        opacity: updatingProject === project.id ? 0.6 : 1
                      }}
                    >
                      <option value="CUR">Current</option>
                      <option value="REQ">Requested</option>
                      <option value="ONH">On Hold</option>
                      <option value="PLN">Planning</option>
                      <option value="CPL">Complete</option>
                      <option value="DED">Dead</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="priority-dropdown"
                      value={project.priority}
                      onChange={(e) => handlePriorityChange(project.id, parseInt(e.target.value))}
                      disabled={updatingProject === project.id}
                      style={{
                        backgroundColor: `${getPriorityColor(project.priority)}15`,
                        color: getPriorityColor(project.priority),
                        border: `1px solid ${getPriorityColor(project.priority)}40`,
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: updatingProject === project.id ? 'wait' : 'pointer',
                        opacity: updatingProject === project.id ? 0.6 : 1
                      }}
                    >
                      <option value="0">None</option>
                      <option value="1">Low</option>
                      <option value="2">Normal</option>
                      <option value="3">High</option>
                      <option value="4">Urgent</option>
                    </select>
                  </td>
                  <td className="text-right">{formatHours(project.plannedHours)}</td>
                  <td className="text-right">{formatHours(project.actualHours)}</td>
                  <td className="text-right">
                    <span style={{ 
                      color: project.remainingHours < project.plannedHours * 0.2 ? '#ef4444' : '#64748b',
                      fontWeight: project.remainingHours < project.plannedHours * 0.2 ? '600' : '400'
                    }}>
                      {formatHours(project.remainingHours)}
                    </span>
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <span>{project.percentComplete}%</span>
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-bar-mini-fill" 
                          style={{ 
                            width: `${project.percentComplete}%`,
                            backgroundColor: project.percentComplete >= 75 ? '#10b981' : project.percentComplete >= 40 ? '#3b82f6' : '#f59e0b'
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">{formatCurrency(project.plannedCost)}</td>
                  <td className="text-right">
                    <span style={{ 
                      color: project.actualCost > project.plannedCost ? '#ef4444' : '#64748b',
                      fontWeight: project.actualCost > project.plannedCost ? '600' : '400'
                    }}>
                      {formatCurrency(project.actualCost)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              <span>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
              <span>Requested</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <span>On Hold</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTableWidget;

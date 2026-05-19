import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Flex, View, Heading, Text, ActionButton, ProgressCircle, Provider, defaultTheme } from '@adobe/react-spectrum';
import authTokenManager from '../../utils/authTokenManager';
import actionWebInvoke, { getActionUrl } from '../../utils/utils';
import { getPriorityName } from '../../../constants';

const APPROVALS_ACTION_PATH = '/api/v1/web/home-dashboard/pendingApprovalsWidget';
const WFAPI_ACTION_PATH = '/api/v1/web/home-dashboard/wfapi';
import { attach } from "@adobe/uix-guest";



const PendingApprovalsWidget = ({ accessToken, hostname }) => {
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonApproving, setIsButtonApproving] = useState(false);
  const [isButtonRejecting, setIsButtonRejecting] = useState(false);

  useEffect(() => {
    if (!accessToken || !hostname) return; // Only run if accessToken and hostname is set and changed
    // You can now use accessToken here
    const fetchData = async () => {
      const actionUrl = getActionUrl(APPROVALS_ACTION_PATH);
      const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
      const actionParams = { 'hostname': hostname };
      const approvalsReq = await actionWebInvoke(actionUrl, actionHeaders, actionParams);
      const myApprovals = await approvalsReq.json();

      const processedApprovals = await Promise.all(
        myApprovals.slice(0, 3).map(async (item) => {
          if (actionUrl.includes('fusion')) {
            item = JSON.parse(item);
          }
          const wfDate = item.date;
          const fixedDate = wfDate.replace(/:(?!.*:)/, '.');
          const date = new Date(fixedDate);
          const formattedDate = date.toISOString().slice(0, 10);

          return {
            id: item.id,
            objCode: item.objCode,
            title: item.title,
            priority: getPriorityName(item.priority),
            date: formattedDate,
            approvalStepName: item.approvalStepName,
            approvalSubmittedBy: item.approvalSubmittedBy
          };
        })
      );
      setApprovals(processedApprovals);
      setIsLoading(false);
    };
    fetchData();
  }, [accessToken, hostname]);

  const handleDecision = async (objID, objCode, decision) => {
    decision === 'approve' ? setIsButtonApproving(true) : setIsButtonRejecting(true);
    console.log(`Decision ${decision} on approval with ID: ${objID}`);
    const actionUrl = getActionUrl(WFAPI_ACTION_PATH);
    const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
    const actionParams = {
      'requestObj': {
        'hostname': hostname,
        'method': 'put',
        'objCode': objCode,
        'ID': objID,
        'parameters': {
          'action': `${decision}Approval`
        }
      }
    }
    const res = await actionWebInvoke(actionUrl, actionHeaders, actionParams);

    if (res.status === 200) {
      console.log(`Successfully decisioned approval with ID: ${objID}`);
      // Optionally, you can refresh the approvals list after a decision
      setApprovals(prev => prev.filter(approval => approval.id !== objID));
      decision === 'approve' ? setIsButtonApproving(false) : setIsButtonRejecting(false);
    }
  }

  let objType;
  const objLink = async (objID, objCode) => {
    switch (objCode) {
      case 'PROJ':
        objType = 'project';
        break;
      case 'TASK':
        objType = 'task';
        break;
      case 'OPTASK':
        objType = 'issue';
        break;
    }
    window.top.location.href = `https://${hostname}/${objType}/${objID}`;
    //window.open(`https://${hostname}/${objType}/${objID}`, "_blank")
  }

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Pending Approvals</h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {approvals.length}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (

        <Provider theme={defaultTheme}> 
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Flex justifyContent="center" alignItems="center" height="size-600">
              <ProgressCircle aria-label="Loading campaigns..." isIndeterminate />
            </Flex>
          </div>
        </Provider>
      ) : (
        <>
          
            {approvals.length == 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                <h4>No Approvals Assigned</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {approvals.map((approval) => (
                  <div key={approval.id} className="approval-card">
                    <div className="approval-header">
                      <div>
                        <h4 className="approval-title" style={{ cursor: 'pointer' }} onClick={() => objLink(approval.id, approval.objCode)}>{approval.title}</h4>
                        <p className="approval-type">Approval Step: {approval.approvalStepName}</p>
                      </div>
                      <span className={`approval-priority ${approval.priority}`}>
                        {approval.priority}
                      </span>
                    </div>

                    <div className="approval-meta">
                      <span>Requested by {approval.approvalSubmittedBy}</span>
                      <span>{approval.date}</span>
                    </div>

                    <div className="approval-actions">
                      
                        {isButtonApproving ? (
                          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', cursor: 'default' }}>
                            Approving...
                          </button>
                        ) : (
                          <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={() => handleDecision(approval.id, approval.objCode, 'approve')}>
                            Approve
                          </button>
                        )}
                      
                      
                        {isButtonRejecting ? (
                          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', cursor: 'default' }}>
                            Rejecting...
                          </button>
                        ) : (
                          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={() => handleDecision(approval.id, approval.objCode, 'reject')}>
                            Reject
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          
          
        </>
      )}



    </div>
  );

};

export default PendingApprovalsWidget; 
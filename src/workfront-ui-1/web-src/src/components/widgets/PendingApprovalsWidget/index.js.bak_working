import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Flex, View, Heading, Text, ActionButton, ProgressCircle, Provider, defaultTheme } from '@adobe/react-spectrum';
import authTokenManager from '../../utils/authTokenManager';
import actionWebInvoke from '../../utils/utils';
import { attach } from "@adobe/uix-guest";
import allActions from '../../../config.json'

const fetch = require('node-fetch');


const PendingApprovalsWidget = () => {
  const [accessToken, setAccessToken] = useState('');
  const [hostname, sethostname] = useState('');
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const doAttach = async () => {
      try {
        const conn = await attach({ id: "my-work-view" }); // replace with your actual extensionId
        const auth = conn?.sharedContext?.get("auth");
        const imsToken = auth?.imsToken;
        if (imsToken) {
          authTokenManager.initialize(imsToken);
          setAccessToken(imsToken);
        }
        const hostname = conn?.sharedContext?.get("hostname");
        if (hostname) {
          sethostname(hostname);
        }

      } catch (e) {
        console.error("Failed to attach and get auth token", e);
      }
    };
    doAttach();
  }, []);

  useEffect(() => {
    if (!accessToken || !hostname) return; // Only run if accessToken and hostname is set and changed
    // You can now use accessToken here
    const fetchData = async () => {
      const actionUrl = allActions['wep/pendingApprovalsWidget'];
      //const actionUrl = 'https://hook.fusion.adobe.com/yjhutjmxck6vlxq6nrp3dm0y5nr9gryi';
      const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
      const actionParams = { 'hostname': hostname };
      const approvalsReq = await actionWebInvoke(actionUrl, actionHeaders, actionParams);
      const myApprovals = await approvalsReq.json();

      const priorityMap = {
        '0': 'None',
        '1': 'Low',
        '2': 'Normal',
        '3': 'High',
        '4': 'Urgent'
      };
      const processedApprovals = await Promise.all(
        myApprovals.slice(0, 3).map(async (item) => {
          if (actionUrl.includes('fusion')) {
            item = JSON.parse(item);
          }
          const wfDate = item.date;
          const fixedDate = wfDate.replace(/:(\d{3})-/, '.$1-');
          const date = new Date(fixedDate);
          const formattedDate = date.toISOString().slice(0, 10); // "2025-08-07"

          return {
            id: item.id,
            objCode: item.objCode,
            title: item.title,
            priority: priorityMap[item.priority],
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
  //console.log(`My IMS Token: ${accessToken}`);

  const handleDecision = async (objID, objCode, decision) => {
    console.log(`Decision ${decision} on approval with ID: ${objID}`);
    const actionUrl = allActions['wep/wfapi'];
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
    //window.top.location.href = `https://experience.adobe.com/#/@bilbroug/so:bilbroug-Production/workfront/${objType}/${objID}`;
    window.open(`https://${hostname}/${objType}/${objID}`, "_blank")
  }

  /*
  const approvals = [
    {
      id: 1,
      title: 'Q2 Marketing Campaign',
      type: 'Budget Approval',
      priority: 'high',
      requester: 'John Smith',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Brand Guidelines Update',
      type: 'Creative Review',
      priority: 'medium',
      requester: 'Maria Garcia',
      date: '2024-01-14'
    },
    {
      id: 3,
      title: 'Website Redesign',
      type: 'Stakeholder Sign-off',
      priority: 'high',
      requester: 'David Lee',
      date: '2024-01-13'
    },
    {
      id: 4,
      title: 'Product Launch',
      type: 'Legal Review',
      priority: 'medium',
      requester: 'Mike Wilson',
      date: '2024-01-11'
    }
  ];
  */

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
                      <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={() => handleDecision(approval.id, approval.objCode, 'approve')}>
                        Approve
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={() => handleDecision(approval.id, approval.objCode, 'reject')}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          
          {approvals.length == 0 ? (
            null
          ) : (
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center'
            }}>
              <a href="#" style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                View All Approvals
              </a>
            </div>
          )}
          
          
        </>
      )}



    </div>
  );

};

export default PendingApprovalsWidget; 
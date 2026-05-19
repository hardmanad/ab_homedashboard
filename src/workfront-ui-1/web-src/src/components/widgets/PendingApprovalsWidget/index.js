import React, { useState, useEffect } from 'react';
import { Flex, ProgressCircle, Provider, defaultTheme } from '@adobe/react-spectrum';
import actionWebInvoke, { getActionUrl } from '../../utils/utils';
import { getPriorityName } from '../../../constants';

const APPROVALS_ACTION_PATH = '/api/v1/web/home-dashboard/pendingApprovalsWidget';
const WFAPI_ACTION_PATH = '/api/v1/web/home-dashboard/wfapi';

const PendingApprovalsWidget = ({ accessToken, hostname }) => {
  const [objectApprovals, setObjectApprovals] = useState([]);
  const [documentApprovals, setDocumentApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track in-flight decisions per approval ID: { [id]: 'approve' | 'reject' }
  const [processingApprovals, setProcessingApprovals] = useState({});

  useEffect(() => {
    if (!accessToken || !hostname) return;
    const fetchData = async () => {
      const actionUrl = getActionUrl(APPROVALS_ACTION_PATH);
      const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
      const actionParams = { hostname };
      const approvalsReq = await actionWebInvoke(actionUrl, actionHeaders, actionParams);
      const data = await approvalsReq.json();

      if (Array.isArray(data)) {
        setObjectApprovals(data.slice(0, 3).map(processObjectApproval));
        setDocumentApprovals([]);
      } else {
        setObjectApprovals((data.objectApprovals || []).slice(0, 3).map(processObjectApproval));
        setDocumentApprovals((data.documentApprovals || []).slice(0, 3));
      }
      setIsLoading(false);
    };
    fetchData();
  }, [accessToken, hostname]);

  function processObjectApproval(item) {
    return {
      id: item.id,
      objCode: item.objCode,
      title: item.title,
      priority: getPriorityName(item.priority),
      date: item.date,
      approvalStepName: item.approvalStepName,
      approvalSubmittedBy: item.approvalSubmittedBy
    };
  }

  const handleDecision = async (approval, decision) => {
    const approvalId = approval.id;
    setProcessingApprovals(prev => ({ ...prev, [approvalId]: decision }));

    const actionUrl = getActionUrl(WFAPI_ACTION_PATH);
    const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };

    let actionParams;
    if (approval.objCode === 'DOCV') {
      actionParams = {
        requestObj: {
          type: 'uas-decision',
          hostname,
          documentVersionId: approval.documentVersionId,
          decision: decision === 'approve' ? 'approved' : 'needs work'
        }
      };
    } else {
      actionParams = {
        requestObj: {
          hostname,
          method: 'put',
          objCode: approval.objCode,
          ID: approval.id,
          parameters: {
            action: `${decision}Approval`
          }
        }
      };
    }

    const res = await actionWebInvoke(actionUrl, actionHeaders, actionParams);

    if (res.status === 200) {
      if (approval.objCode === 'DOCV') {
        setDocumentApprovals(prev => prev.filter(a => a.id !== approvalId));
      } else {
        setObjectApprovals(prev => prev.filter(a => a.id !== approvalId));
      }
    }

    setProcessingApprovals(prev => {
      const next = { ...prev };
      delete next[approvalId];
      return next;
    });
  };

  const objLink = (approval) => {
    if (approval.objCode === 'DOCV') {
      return `https://${hostname}/document/${approval.documentId}`;
    }
    const types = { PROJ: 'project', TASK: 'task', OPTASK: 'issue' };
    return `https://${hostname}/${types[approval.objCode] || 'object'}/${approval.id}`;
  };

  const renderApprovalCard = (approval) => {
    const isDoc = approval.objCode === 'DOCV';
    const isApproving = processingApprovals[approval.id] === 'approve';
    const isRejecting = processingApprovals[approval.id] === 'reject';

    return (
      <div key={approval.id} className="approval-card">
        <div className="approval-header">
          <div>
            <h4 className="approval-title">
              <a href={objLink(approval)} target="_blank" rel="noopener noreferrer" className="widget-link">
                <span title={isDoc && approval.title?.length > 25 ? approval.title : undefined}>
                  {isDoc && approval.title?.length > 25 ? approval.title.slice(0, 25) + '...' : approval.title}
                </span>
              </a>
            </h4>
            <p className="approval-type">{approval.approvalStepName}</p>
          </div>
          {!isDoc && (
            <span className={`approval-priority ${approval.priority}`}>
              {approval.priority}
            </span>
          )}
        </div>

        <div className="approval-meta">
          <span>Requested by {approval.approvalSubmittedBy}</span>
          <span>{approval.date}</span>
        </div>

        <div className="approval-actions">
          {isApproving ? (
            <button className="btn btn-secondary btn-sm btn-processing">
              Approving...
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleDecision(approval, 'approve')}
              disabled={!!processingApprovals[approval.id]}
            >
              Approve
            </button>
          )}
          {isRejecting ? (
            <button className="btn btn-secondary btn-sm btn-processing">
              Rejecting...
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleDecision(approval, 'reject')}
              disabled={!!processingApprovals[approval.id]}
            >
              Reject
            </button>
          )}
        </div>
      </div>
    );
  };

  const totalCount = objectApprovals.length + documentApprovals.length;
  const showSectionLabels = objectApprovals.length > 0 && documentApprovals.length > 0;

  return (
    <div className="widget-card approvals-widget">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Pending Approvals</h3>
          <p className="widget-subtitle">{totalCount} Pending Approvals</p>
        </div>
      </div>

      {isLoading ? (
        <Provider theme={defaultTheme}>
          <div className="approvals-loading">
            <Flex justifyContent="center" alignItems="center" height="size-600">
              <ProgressCircle aria-label="Loading approvals..." isIndeterminate />
            </Flex>
          </div>
        </Provider>
      ) : totalCount === 0 ? (
        <div className="approvals-empty">
          <h4>No Approvals Assigned</h4>
        </div>
      ) : (
        <div className="approvals-list">
          {objectApprovals.length > 0 && (
            <>
              {showSectionLabels && (
                <p className="approvals-section-label">Work Items</p>
              )}
              {objectApprovals.map(renderApprovalCard)}
            </>
          )}
          {documentApprovals.length > 0 && (
            <>
              {showSectionLabels && (
                <p className="approvals-section-label approvals-section-label--documents">Documents</p>
              )}
              {documentApprovals.map(renderApprovalCard)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsWidget;

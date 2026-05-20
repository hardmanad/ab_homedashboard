/*
* Fetches all pending approvals for the current user via the Workfront "unsupported"
* AWAPVL/myAwaitingApprovals endpoint — one call returns both object approvals
* (projects, tasks, issues) and document (UAS) approvals.
*
* Discriminator: records with a documentVersionID are document approvals; records with
* projectID / taskID / opTaskID are object approvals.
*/

const { Core } = require('@adobe/aio-sdk');
const { randomUUID } = require('crypto');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');

const UAS_BASE = 'https://workfront.adobe.io/unified-approvals/public/api/v1/approvals';
const HOSTNAME_RE = /^([a-z0-9-]+\.)+workfront\.(adobe\.)?com$/;

function formatWfDate(rawDate) {
  if (!rawDate) return '';
  try {
    const fixed = rawDate.replace(/:(?!.*:)/, '.');
    const date = new Date(fixed);
    return isNaN(date.getTime()) ? rawDate : date.toISOString().slice(0, 10);
  } catch (e) {
    return rawDate;
  }
}

async function main(params) {
  const logger = Core.Logger('pendingApprovalsWidget', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling pendingApprovalsWidget action');
    logger.debug('Params: ', stringParameters(params));

    const requiredParams = ['hostname'];
    const requiredHeaders = ['Authorization'];
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);
    if (errorMessage) return errorResponse(400, errorMessage, logger);

    if (!HOSTNAME_RE.test(params.hostname)) {
      return errorResponse(400, 'invalid hostname', logger);
    }

    const token = getBearerToken(params);

    const url = new URL(`https://${params.hostname}/attask/api/unsupported/AWAPVL/myAwaitingApprovals`);
    url.searchParams.set('fields', [
      '*',
      'submittedBy:name',
      'document:name',
      'document:ID',
      'documentVersion:document:name',
      'documentVersion:document:ID',
      'project:name',
      'project:priority',
      'project:currentApprovalStep:name',
      'task:name',
      'task:priority',
      'task:currentApprovalStep:name',
      'opTask:name',
      'opTask:priority',
      'opTask:currentApprovalStep:name'
    ].join(','));

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(`AWAPVL fetch failed: ${res.status}: ${body}`);
      return errorResponse(res.status, 'Failed to fetch pending approvals', logger);
    }

    const body = await res.json();
    const allApprovals = body.data || [];

    const objectApprovals = [];
    const documentApprovals = [];

    for (const item of allApprovals) {
      if (item.documentVersionID) {
        documentApprovals.push({
          id: item.documentVersionID,
          documentVersionId: item.documentVersionID,
          documentId: item.documentID || item.documentVersion?.document?.ID,
          title: item.document?.name || item.documentVersion?.document?.name || 'Document',
          priority: 'document',
          date: formatWfDate(item.entryDate),
          approvalStepName: null,
          approvalSubmittedBy: item.submittedBy?.name || 'Unknown',
          objCode: 'DOCV'
        });
      } else {
        let title, objCode, priority, stepName;

        if (item.projectID) {
          objCode = 'PROJ';
          title = item.project?.name || item.projectID;
          priority = item.project?.priority;
          stepName = item.project?.currentApprovalStep?.name;
        } else if (item.taskID) {
          objCode = 'TASK';
          title = item.task?.name || item.taskID;
          priority = item.task?.priority;
          stepName = item.task?.currentApprovalStep?.name;
        } else if (item.opTaskID) {
          objCode = 'OPTASK';
          title = item.opTask?.name || item.opTaskID;
          priority = item.opTask?.priority;
          stepName = item.opTask?.currentApprovalStep?.name;
        } else {
          logger.warn('Unrecognised AWAPVL record, skipping:', item.ID);
          continue;
        }

        objectApprovals.push({
          id: item.approvableID,
          objCode,
          title,
          priority,
          date: formatWfDate(item.entryDate),
          approvalStepName: stepName || 'Approval',
          approvalSubmittedBy: item.submittedBy?.name || 'Unknown'
        });
      }
    }

    // Enrich document approvals with stage name from UAS
    const subdomain = params.hostname.split('.')[0];
    const apiKey = params.SERVICE_API_KEY || '';

    await Promise.all(documentApprovals.map(async (approval) => {
      try {
        const uasRes = await fetch(`${UAS_BASE}/DOCV/${approval.documentVersionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-gw-subdomain': subdomain,
            'x-api-key': apiKey,
            'x-request-id': randomUUID(),
            'Content-Type': 'application/json'
          }
        });
        const uasData = await uasRes.json();
        approval.approvalStepName = uasData?.stages?.[0]?.name || 'Document Approval';
      } catch (e) {
        logger.warn('UAS stage fetch error for', approval.documentVersionId, ':', e.message);
        approval.approvalStepName = 'Document Approval';
      }
    }));

    return {
      statusCode: 200,
      body: { objectApprovals, documentApprovals }
    };
  } catch (error) {
    logger.error(error);
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;

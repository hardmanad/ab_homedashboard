/*
* Submits an approve/reject decision for a pending approval.
* Handles two paths based on what is passed:
*   - documentVersionId present → UAS document approval (DOCV)
*   - approvalId + objCode present → WF object approval (PROJ, TASK, OPTASK)
*/

const { Core } = require('@adobe/aio-sdk');
const { randomUUID } = require('crypto');
const { errorResponse, getBearerToken, checkMissingRequestInputs } = require('../utils/utils');

const UAS_BASE = 'https://workfront.adobe.io/unified-approvals/public/api/v1/approvals';
const ALLOWED_DECISIONS = new Set(['approve', 'reject']);
const ALLOWED_OBJ_CODES = new Set(['PROJ', 'TASK', 'OPTASK']);
const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const HOSTNAME_RE = /^([a-z0-9-]+\.)+workfront\.(adobe\.)?com$/;

async function main(params) {
  const logger = Core.Logger('submitApprovalDecision', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling submitApprovalDecision action');

    const requiredParams = ['hostname', 'decision'];
    const requiredHeaders = ['Authorization'];
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);
    if (errorMessage) return errorResponse(400, errorMessage, logger);

    if (!HOSTNAME_RE.test(params.hostname)) {
      return errorResponse(400, 'invalid hostname', logger);
    }

    if (!ALLOWED_DECISIONS.has(params.decision)) {
      return errorResponse(400, `invalid decision: ${params.decision}`, logger);
    }

    const token = getBearerToken(params);

    // --- UAS document approval path ---
    if (params.documentVersionId) {
      if (!UUID_RE.test(params.documentVersionId)) {
        return errorResponse(400, 'invalid documentVersionId', logger);
      }

      const subdomain = params.hostname.split('.')[0];
      const apiKey = params.SERVICE_API_KEY || '';
      const uasDecision = params.decision === 'approve' ? 'approved' : 'needs work';

      logger.info(`UAS decision '${uasDecision}' on DOCV ${params.documentVersionId}`);

      const res = await fetch(`${UAS_BASE}/DOCV/${params.documentVersionId}/decisions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-gw-subdomain': subdomain,
          'x-api-key': apiKey,
          'x-request-id': randomUUID(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ decision: uasDecision })
      });

      if (!res.ok) {
        const body = await res.text();
        logger.error(`UAS error ${res.status}: ${body}`);
        return errorResponse(res.status, 'UAS request failed', logger);
      }

      let body;
      try { body = await res.json(); } catch { body = {}; }
      logger.info(`UAS decision submitted for DOCV ${params.documentVersionId}`);
      return { statusCode: 200, body };
    }

    // --- WF object approval path ---
    if (!params.approvalId || !params.objCode) {
      return errorResponse(400, 'missing parameter(s): approvalId, objCode (or documentVersionId for document approvals)', logger);
    }

    if (!ALLOWED_OBJ_CODES.has(params.objCode)) {
      return errorResponse(400, `invalid objCode: ${params.objCode}`, logger);
    }

    if (!UUID_RE.test(params.approvalId)) {
      return errorResponse(400, 'invalid approvalId', logger);
    }

    const wfAction = params.decision === 'approve' ? 'approveApproval' : 'rejectApproval';
    const url = new URL(`https://${params.hostname}/attask/api/v21.0/${params.objCode}/${params.approvalId}`);
    url.searchParams.set('action', wfAction);

    logger.info(`${params.objCode}/${params.approvalId} → ${wfAction}`);

    const res = await fetch(url.toString(), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(`Workfront error ${res.status}: ${body}`);
      return errorResponse(res.status, 'Workfront request failed', logger);
    }

    const data = await res.json();
    logger.info(`${wfAction} successful for ${params.objCode}/${params.approvalId}`);
    return { statusCode: 200, body: data.data };

  } catch (error) {
    logger.error(error);
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;

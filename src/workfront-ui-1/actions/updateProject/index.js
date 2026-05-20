/*
* Updates a Workfront project's status and/or priority.
* Accepts only the two fields this app needs to write — nothing else.
*/

const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, checkMissingRequestInputs } = require('../utils/utils');

const ALLOWED_STATUSES = new Set(['CUR', 'PLN', 'CPL', 'DED', 'REQ', 'ONH']);
const ALLOWED_PRIORITIES = new Set([0, 1, 2, 3, 4]);
const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const HOSTNAME_RE = /^([a-z0-9-]+\.)+workfront\.(adobe\.)?com$/;

async function main(params) {
  const logger = Core.Logger('updateProject', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling updateProject action');

    const requiredParams = ['hostname', 'projectId'];
    const requiredHeaders = ['Authorization'];
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);
    if (errorMessage) return errorResponse(400, errorMessage, logger);

    if (!HOSTNAME_RE.test(params.hostname)) {
      return errorResponse(400, 'invalid hostname', logger);
    }

    if (!UUID_RE.test(params.projectId)) {
      return errorResponse(400, 'invalid projectId', logger);
    }

    if (params.status === undefined && params.priority === undefined) {
      return errorResponse(400, 'at least one of status or priority is required', logger);
    }

    const updates = {};

    if (params.status !== undefined) {
      if (!ALLOWED_STATUSES.has(params.status)) {
        return errorResponse(400, `invalid status: ${params.status}`, logger);
      }
      updates.status = params.status;
    }

    if (params.priority !== undefined) {
      const p = Number(params.priority);
      if (!ALLOWED_PRIORITIES.has(p)) {
        return errorResponse(400, `invalid priority: ${params.priority}`, logger);
      }
      updates.priority = p;
    }

    const token = getBearerToken(params);
    const url = new URL(`https://${params.hostname}/attask/api/v21.0/PROJ/${params.projectId}`);
    Object.entries(updates).forEach(([k, v]) => url.searchParams.set(k, v));

    logger.info(`PUT PROJ/${params.projectId} ${JSON.stringify(updates)}`);

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
    logger.info(`Successfully updated PROJ/${params.projectId}`);
    return { statusCode: 200, body: data.data };

  } catch (error) {
    logger.error(error);
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;

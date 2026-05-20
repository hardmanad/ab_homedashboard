/*
* Fetches current, requested, and on-hold projects for the authenticated user
* and returns structured project data including hours, costs, and status.
*/

const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');

const HOSTNAME_RE = /^([a-z0-9-]+\.)+workfront\.(adobe\.)?com$/;

const FIELDS = [
  'referenceNumber', 'name', 'status', 'owner:name', 'ownerID',
  'percentComplete', 'priority', 'condition', 'actualCost',
  'actualWorkRequired', 'plannedCost', 'plannedCompletionDate', 'workRequired'
].join(',');

async function main (params) {
  const logger = Core.Logger('projectsTableWidget', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling projectsTableWidget action');
    logger.debug('Params:', stringParameters(params));

    const requiredParams = ['hostname'];
    const requiredHeaders = ['Authorization'];
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);
    if (errorMessage) return errorResponse(400, errorMessage, logger);

    if (!HOSTNAME_RE.test(params.hostname)) {
      return errorResponse(400, 'invalid hostname', logger);
    }

    const token = getBearerToken(params);

    const url = new URL(`https://${params.hostname}/attask/api/v21.0/PROJ/search`);
    url.searchParams.set('status', 'CUR');
    url.searchParams.set('status_Mod', 'eq');
    url.searchParams.set('OR:1:status', 'REQ');
    url.searchParams.set('OR:1:status_Mod', 'eq');
    url.searchParams.set('OR:2:status', 'ONH');
    url.searchParams.set('OR:2:status_Mod', 'eq');
    url.searchParams.set('$$LIMIT', '10');
    url.searchParams.set('fields', FIELDS);

    logger.info('Fetching projects from Workfront');

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(`Workfront error ${res.status}: ${body}`);
      return errorResponse(res.status, 'Workfront request failed', logger);
    }

    const json = await res.json();
    const projects = json.data || [];

    logger.info(`Received ${projects.length} projects from Workfront`);

    const processedProjects = projects.map(project => {
      const plannedHours = project.workRequired ? Math.round(project.workRequired / 60) : 0;
      const actualHours = project.actualWorkRequired ? Math.round(project.actualWorkRequired / 60) : 0;

      return {
        id: project.ID,
        referenceNumber: project.referenceNumber || 'N/A',
        name: project.name,
        status: project.status,
        priority: project.priority,
        owner: project.owner ? project.owner.name : 'Unassigned',
        plannedHours,
        actualHours,
        remainingHours: plannedHours - actualHours,
        percentComplete: project.percentComplete || 0,
        plannedCost: project.plannedCost || 0,
        actualCost: project.actualCost || 0
      };
    });

    logger.info(`${processedProjects.length} projects processed successfully`);
    return { statusCode: 200, body: processedProjects };

  } catch (error) {
    logger.error('Error in projectsTableWidget:', error.message);
    logger.error(error.stack);
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;

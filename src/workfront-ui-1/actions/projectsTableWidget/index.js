/*
* Fetches current, requested, and on-hold projects for the authenticated user
* and returns structured project data including hours, costs, and status.
*/

const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');
const { WorkfrontServiceClient } = require('../utils/wfClient.js');

async function main (params) {
  const logger = Core.Logger('projectsTableWidget', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling projectsTableWidget action');
    logger.debug('Params:', stringParameters(params));

    const requiredParams = ['hostname']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    const token = getBearerToken(params)
    const baseURL = `https://${params.hostname}/attask/api/v20.0`;
    const wfClient = new WorkfrontServiceClient(baseURL, token);

    const projects = await wfClient.request({
      'method': 'search',
      'objCode': 'PROJ',
      'parameters': {
        'status': 'CUR',
        'status_Mod': 'eq',
        'OR:1:status': 'REQ',
        'OR:1:status_Mod': 'eq',
        'OR:2:status': 'ONH',
        'OR:2:status_Mod': 'eq',
        '$$LIMIT': 10,
        'fields': 'referenceNumber,name,status,owner:name,ownerID,plannedCompletionDate,percentComplete,priority,condition,actualCost,actualWorkRequired,plannedCost,plannedCompletionDate,workRequired'
      }
    });

    logger.info(`Received ${projects ? projects.length : 0} projects from Workfront`);
    logger.debug('Raw projects response:', JSON.stringify(projects, null, 2));

    if (!Array.isArray(projects)) {
      logger.error('Projects response is not an array:', typeof projects);
      return errorResponse(500, 'Invalid projects response format', logger);
    }

    if (projects.length === 0) {
      logger.info('No projects found matching the criteria');
    }

    const processedProjects = projects.map((project, index) => {
      logger.debug(`Processing project ${index + 1}/${projects.length}: ${project.name}`);

      const plannedHours = project.workRequired ? Math.round(project.workRequired / 60) : 0;
      const actualHours = project.actualWorkRequired ? Math.round(project.actualWorkRequired / 60) : 0;
      const remainingHours = plannedHours - actualHours;

      return {
        id: project.ID,
        referenceNumber: project.referenceNumber || 'N/A',
        name: project.name,
        status: project.status,
        priority: project.priority,
        owner: project.owner ? project.owner.name : 'Unassigned',
        plannedHours,
        actualHours,
        remainingHours,
        percentComplete: project.percentComplete || 0,
        plannedCost: project.plannedCost || 0,
        actualCost: project.actualCost || 0
      };
    });

    logger.info(`Successfully processed ${processedProjects.length} projects`);
    logger.debug('Processed projects:', JSON.stringify(processedProjects, null, 2));

    const response = {
      statusCode: 200,
      body: processedProjects
    }

    logger.info(`${response.statusCode}: successful request with ${processedProjects.length} projects`)
    return response
  } catch (error) {
    logger.error('Error in projectsTableWidget:', error.message);
    logger.error(error.stack);
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main

/*
* Josh Hardman First Try, don't laugh
 */

const fetch = require('node-fetch');
const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');
const { WorkfrontServiceClient } = require('../utils/wfClient.js');

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    // 'info' is the default level if not set
    logger.info('========== PROJECT TABLE WIDGET ACTION STARTED ==========');
    logger.info('Calling the main action');
    logger.info('Params: ', stringParameters(params));
    console.log('Full params object:', JSON.stringify(params, null, 2));

    // check for missing request input parameters and headers
    const requiredParams = ['hostname']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    // extract the user Bearer token from the Authorization header
    const token = getBearerToken(params)
    logger.info('Token extracted successfully');

    // replace this with the api you want to access
    const baseURL = `https://${params.hostname}/attask/api/v20.0`;
    logger.info(`BaseURL set to: ${baseURL}`);
    
    const wfClient = new WorkfrontServiceClient(baseURL, token);
    logger.info('WorkfrontServiceClient created');
    
    // Fetch projects with all necessary fields
    logger.info('Starting to fetch projects from Workfront API...');
    const projects = await wfClient.request({
      'method': 'search',
      'objCode': 'PROJ',
      'parameters': {
        'status': 'CUR', // Current status
        'status_Mod': 'eq',
        'OR:1:status': 'REQ', // OR Requested status
        'OR:1:status_Mod': 'eq',
        'OR:2:status': 'ONH', // OR On Hold status
        'OR:2:status_Mod': 'eq',
        '$$LIMIT': 10,
        'fields': 'referenceNumber,name,status,owner:name,ownerID,plannedCompletionDate,percentComplete,priority,condition,actualCost,actualWorkRequired,plannedCost,plannedCompletionDate,workRequired'
      }
    });

    logger.info(`Received ${projects ? projects.length : 0} projects from Workfront`);
    console.log('Raw Workfront Projects Response:', JSON.stringify(projects, null, 2));

    // Check if projects is an array
    if (!Array.isArray(projects)) {
      logger.error('Projects response is not an array:', typeof projects);
      console.log('Projects value:', projects);
      return errorResponse(500, 'Invalid projects response format', logger);
    }

    if (projects.length === 0) {
      logger.info('No projects found matching the criteria');
    }

    // Process the projects data
    logger.info('Starting to process projects...');
    const processedProjects = projects.map((project, index) => {
      logger.debug(`Processing project ${index + 1}/${projects.length}: ${project.name}`);
      // Calculate hours from minutes (Workfront stores time in minutes)
      const plannedHours = project.workRequired ? Math.round(project.workRequired / 60) : 0;
      const actualHours = project.actualWorkRequired ? Math.round(project.actualWorkRequired / 60) : 0;
      const remainingHours = plannedHours - actualHours;

      // Map status codes to friendly names
      let statusName = 'Unknown';
      switch(project.status) {
        case 'CUR':
          statusName = 'Current';
          break;
        case 'REQ':
          statusName = 'Requested';
          break;
        case 'PLN':
          statusName = 'Planning';
          break;
        case 'ONH':
          statusName = 'On Hold';
          break;
        case 'CPL':
          statusName = 'Complete';
          break;
        case 'DED':
          statusName = 'Dead';
          break;
        default:
          statusName = project.status;
      }

      // Map priority values to friendly names
      let priorityName = 'Normal';
      switch(project.priority) {
        case 0:
          priorityName = 'None';
          break;
        case 1:
          priorityName = 'Low';
          break;
        case 2:
          priorityName = 'Normal';
          break;
        case 3:
          priorityName = 'High';
          break;
        case 4:
          priorityName = 'Urgent';
          break;
      }

      const processedProject = {
        id: project.ID,
        referenceNumber: project.referenceNumber || 'N/A',
        name: project.name,
        status: statusName,
        owner: project.owner ? project.owner.name : 'Unassigned',
        plannedHours: plannedHours,
        actualHours: actualHours,
        remainingHours: remainingHours,
        percentComplete: project.percentComplete || 0,
        plannedCost: project.plannedCost || 0,
        actualCost: project.actualCost || 0,
        priority: priorityName
      };
      
      logger.debug(`Processed project data:`, JSON.stringify(processedProject, null, 2));
      return processedProject;
    });

    logger.info(`Successfully processed ${processedProjects.length} projects`);
    console.log('Final Processed Projects:', JSON.stringify(processedProjects, null, 2));

    const response = {
      statusCode: 200,
      body: processedProjects
    }

    // log the response status code
    logger.info(`${response.statusCode}: successful request with ${processedProjects.length} projects`)
    logger.info('Response body length:', response.body.length);
    console.log('Final Response:', JSON.stringify(response, null, 2));
    return response
  } catch (error) {
    // log any server errors
    logger.error('Error occurred in projectsTableWidget action');
    logger.error('Error message:', error.message);
    logger.error('Error stack:', error.stack);
    console.log('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // return with 500
    return errorResponse(500, `server error: ${error.message}`, logger)
  }
}

exports.main = main

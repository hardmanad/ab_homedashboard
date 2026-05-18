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
    logger.info('Calling the main action');
    logger.info('Params: ', stringParameters(params));

    // log parameters, only if params.LOG_LEVEL === 'debug'
    //logger.debug(stringParameters(params))

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

    // replace this with the api you want to access
    const baseURL = `https://${params.hostname}/attask/api/v20.0`;
    const wfClient = new WorkfrontServiceClient(baseURL, token);
    

    // fetch content from external api endpoint
    //const res = await fetch(apiEndpoint)
    const resMyApprovals = await wfClient.request({
      'method': 'get',
      'objCode': 'APPROVAL',
      'parameters': {
        'query': 'myApprovals'
      }
    });
    //console.log(resMyApprovals);
    
    const processedApprovals = await Promise.all(
      resMyApprovals.map(async(myApproval) => {
        const awaitingApprovals = await wfClient.request({
          'method': 'get',
          'objCode': myApproval.objCode,
          'ID': myApproval.ID,
          'parameters': {
            'fields': 'approvalStartDate,awaitingApprovals:*,approvalProcess:name,currentApprovalStep'
          }
        });

        const approvalSubmittedBy = await wfClient.request({
          'method': 'get',
          'objCode': 'USER',
          'ID': awaitingApprovals.awaitingApprovals[0].submittedByID,
          'parameters': {
            'fields': 'name'
          }
        });
        return {
          id: myApproval.ID,
          objCode: myApproval.objCode,
          title: myApproval.name,
          priority: myApproval.priority,
          date: awaitingApprovals.approvalStartDate,
          approvalStepName: awaitingApprovals.currentApprovalStep.name,
          approvalSubmittedBy: approvalSubmittedBy.name
        }
      })
    );
    
    console.log('Workfront Data:', processedApprovals);

    const response = {
      statusCode: 200,
      body: processedApprovals
    }

    // log the response status code
    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main

/*
* Fetches pending approvals for the current user and returns structured approval data
* including the approval step name and who submitted the approval request.
*/

const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');
const { WorkfrontServiceClient } = require('../utils/wfClient.js');

async function main (params) {
  const logger = Core.Logger('pendingApprovalsWidget', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling pendingApprovalsWidget action');
    logger.debug('Params: ', stringParameters(params));

    const requiredParams = ['hostname']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    const token = getBearerToken(params)
    const baseURL = `https://${params.hostname}/attask/api/v20.0`;
    const wfClient = new WorkfrontServiceClient(baseURL, token);

    const resMyApprovals = await wfClient.request({
      'method': 'get',
      'objCode': 'APPROVAL',
      'parameters': {
        'query': 'myApprovals',
        'fields': 'approvalStartDate,currentApprovalStep:name,submittedBy:name'
      }
    });

    const processedApprovals = resMyApprovals.map((myApproval) => ({
      id: myApproval.ID,
      objCode: myApproval.objCode,
      title: myApproval.name,
      priority: myApproval.priority,
      date: myApproval.approvalStartDate,
      approvalStepName: myApproval.currentApprovalStep.name,
      approvalSubmittedBy: myApproval.submittedBy.name
    }));

    logger.debug('Processed approvals:', JSON.stringify(processedApprovals, null, 2))

    const response = {
      statusCode: 200,
      body: processedApprovals
    }

    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main

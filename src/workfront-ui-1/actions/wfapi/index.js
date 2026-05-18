/*
* Josh Hardman First Try, don't laugh
*/

const { Core } = require('@adobe/aio-sdk')
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils')
const { WorkfrontServiceClient } = require('../utils/wfClient.js')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action')
    logger.info('Params: ', stringParameters(params));

    // log parameters, only if params.LOG_LEVEL === 'debug'
    //logger.debug(stringParameters(params))
    
    // check for missing request input parameters and headers
    const requiredParams = ['requestObj']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    // extract the user Bearer token from the Authorization header
    const token = getBearerToken(params);
    const baseURL = `https://${params.requestObj.hostname}/attask/api/v20.0`;

    const wfClient = new WorkfrontServiceClient(baseURL, token);

    res = await wfClient.request(params.requestObj);

    //const res = await wfClient.query(params.obj, params.queryParams);
    console.log('Workfront Data:', res);

    const response = {
      statusCode: 200,
      body: res
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

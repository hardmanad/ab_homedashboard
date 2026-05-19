/*
* Generic Workfront API proxy — forwards a requestObj to the Workfront REST API
* and returns the result. Used for get, put, post, delete, and search operations.
*/

const { Core } = require('@adobe/aio-sdk')
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils')
const { WorkfrontServiceClient } = require('../utils/wfClient.js')

async function main (params) {
  const logger = Core.Logger('wfapi', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Calling wfapi action')
    logger.debug('Params: ', stringParameters(params))

    const requiredParams = ['requestObj']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    const token = getBearerToken(params);
    const baseURL = `https://${params.requestObj.hostname}/attask/api/v20.0`;

    const wfClient = new WorkfrontServiceClient(baseURL, token);
    const res = await wfClient.request(params.requestObj);

    logger.debug('Workfront response:', JSON.stringify(res, null, 2))

    const response = {
      statusCode: 200,
      body: res
    }

    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main

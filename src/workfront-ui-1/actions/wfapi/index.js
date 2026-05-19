/*
* Generic Workfront API proxy — forwards a requestObj to the Workfront REST API
* and returns the result. Used for get, put, post, delete, and search operations.
*
* Also handles UAS document approval decisions when requestObj.type === 'uas-decision'.
*/

const { Core } = require('@adobe/aio-sdk')
const { randomUUID } = require('crypto')
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils')
const { WorkfrontServiceClient } = require('../utils/wfClient.js')

const UAS_BASE = 'https://workfront.adobe.io/unified-approvals/public/api/v1/approvals'

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

    const token = getBearerToken(params)

    // --- UAS document approval decision ---
    if (params.requestObj.type === 'uas-decision') {
      const { documentVersionId, decision, hostname } = params.requestObj
      const subdomain = hostname.split('.')[0]
      const apiKey = params.SERVICE_API_KEY || ''

      logger.info(`UAS decision '${decision}' on DOCV ${documentVersionId}`)

      const uasRes = await fetch(
        `${UAS_BASE}/DOCV/${documentVersionId}/decisions`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-gw-subdomain': subdomain,
            'x-api-key': apiKey,
            'x-request-id': randomUUID(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ decision })
        }
      )

      let uasBody
      try {
        uasBody = await uasRes.json()
      } catch (e) {
        uasBody = {}
      }

      logger.info(`UAS response status: ${uasRes.status}`)
      return { statusCode: uasRes.status, body: uasBody }
    }

    // --- Standard Workfront REST API proxy ---
    const baseURL = `https://${params.requestObj.hostname}/attask/api/v20.0`
    const wfClient = new WorkfrontServiceClient(baseURL, token)
    const res = await wfClient.request(params.requestObj)

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

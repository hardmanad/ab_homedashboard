/*
* Fetches active campaigns from Workfront Planning (Maestro) for the Adobe GenStudio
* workspace and returns structured campaign data for the timeline widget.
*/

const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');
const { WorkfrontServiceClient } = require('../utils/wfPlanningClient.js');

async function main (params) {
  const logger = Core.Logger('campaignTimelineWidget', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling campaignTimelineWidget action');
    logger.debug('Params:', stringParameters(params));

    const requiredParams = ['hostname']
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    const token = getBearerToken(params)
    const baseURL = `https://${params.hostname}/maestro/api`;
    const wfPlanningClient = new WorkfrontServiceClient(baseURL, token);

    const workspaces = await wfPlanningClient.request({
        'method': 'get',
        'objCode': 'workspaces'
    });

    const workspace = workspaces['workspaces'].find(workspace => workspace.name === "Adobe GenStudio");
    logger.info(`Found workspace: ${workspace ? workspace.name : 'not found'}`);

    const recordTypes = await wfPlanningClient.request({
        'method': 'get',
        'objCode': 'record-types',
        'parameters': {
          'workspaceId': workspace.id
        }
    });

    const campaignRecordType = recordTypes.find(recordType => recordType.alias === "campaigns");
    logger.info(`Found campaign record type: ${campaignRecordType ? campaignRecordType.id : 'not found'}`);

    const campaigns = await wfPlanningClient.request({
        'method': 'search',
        'recordTypeId': campaignRecordType.id,
        'limit': 10
    });

    const processedCampaigns = await Promise.all(
      campaigns.records.map(async(campaign) => {
        if(campaign.data.status == 'complete' || !campaign.data.owner) {
          return;
        } else {
          const formattedStartDate = new Date(campaign.data.start).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
          });
          const formattedEndDate = new Date(campaign.data.end).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
          });
          return {
            workspaceId: workspace.id,
            recordTypeId: campaignRecordType.id,
            id: campaign.id,
            name: campaign.data.name,
            tag: 'Digital',
            person: campaign.data.owner[0].name,
            status: campaign.data.status == '9a41209d-18ad-4d1f-9570-5e3d98e849db' ? 'on-hold' : campaign.data.status,
            budget: campaign.data.budget,
            spent: campaign.data.spent,
            progress: campaign.data.percent_complete,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            milestone: 'Dec 31'
          };
        }
      })
    );

    logger.debug('Processed campaigns:', JSON.stringify(processedCampaigns, null, 2));

    const response = {
      statusCode: 200,
      body: processedCampaigns.filter(Boolean)
    }

    logger.info(`${response.statusCode}: successful request with ${response.body.length} campaigns`)
    return response
  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main

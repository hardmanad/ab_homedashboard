/*
* Josh Hardman First Try, don't laugh
 */


const fetch = require('node-fetch');
const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');
const { WorkfrontServiceClient } = require('../utils/wfPlanningClient.js');


// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    // Necessary Data:
    //    {
    //    id: 1,
    //    name: 'Q1 Digital Marketing Campaign',
    //    tag: 'Digital',
    //    person: 'Sarah Chen',
    //    status: 'on-track',
    //    budget: 125000,
    //    spent: 89500,
    //    progress: 85,
    //    startDate: 'Dec 2023',
    //    endDate: 'Jan 2024',
    //    milestone: 'Dec 31'
    //    }

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
    const baseURL = `https://${params.hostname}/maestro/api`;
    const wfPlanningClient = new WorkfrontServiceClient(baseURL, token);

    // get workspaces
    const workspaces = await wfPlanningClient.request({
        'method': 'get',
        'objCode': 'workspaces'
    });
    //console.log('Workspaces:', workspaces);

    const workspace = workspaces['workspaces'].find(workspace => workspace.name === "Adobe GenStudio");
    
    const recordTypes  = await wfPlanningClient.request({
        'method': 'get',
        'objCode': 'record-types',
        'parameters': {
          'workspaceId': workspace.id
        }
    });

    const campaignRecordType = recordTypes.find(recordType => recordType.alias === "campaigns");
    
    const campaigns  = await wfPlanningClient.request({
        'method': 'search',
        'recordTypeId': campaignRecordType.id,
        'limit': 10
    });

    //console.log('Campaigns:', campaigns);

    const processedCampaigns = await Promise.all(
      campaigns.records.map(async(campaign) => {
        if(campaign.data.status == 'complete' || !campaign.data.owner) {
          return;
        } else {
          const startDate = campaign.data.start;
          const endDate = campaign.data.end;
          const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
          });
          const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric'
          });
          return {
                // Necessary Data:
                //    {
                //    id: 1,
                //    name: 'Q1 Digital Marketing Campaign',
                //    tag: 'Digital',
                //    person: 'Sarah Chen',
                //    status: 'on-track',
                //    budget: 125000,
                //    spent: 89500,
                //    progress: 85,
                //    startDate: 'Dec 2023',
                //    endDate: 'Jan 2024',
                //    milestone: 'Dec 31'
                //    }
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
    console.log('Here we are done with it');
    console.log('Workfront Data:', processedCampaigns);

    const response = {
      statusCode: 200,
      body: processedCampaigns.filter(Boolean)
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

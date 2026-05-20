/*
* Fetches active campaigns from Workfront Planning (Maestro) and returns
* structured campaign data for the timeline widget.
*
* Requires WF_PLANNING_WORKSPACE_ID, WF_PLANNING_CAMPAIGN_RECORD_TYPE_ID, and
* WF_PLANNING_ON_HOLD_STATUS_ID to be set in app.config.yaml. See README.md
* for instructions on finding these values for your organization.
*/

const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils/utils');

const HOSTNAME_RE = /^([a-z0-9-]+\.)+workfront\.(adobe\.)?com$/;
const DEFAULT_TAG = 'Digital';
const DEFAULT_TAG_COLOR = '#3b82f6';

// Workfront Planning color name → hex
const PLANNING_COLOR_MAP = {
  red:         '#ef4444',
  orange:      '#f97316',
  yellow:      '#eab308',
  chartreuse:  '#84cc16',
  green:       '#22c55e',
  teal:        '#14b8a6',
  blue:        '#3b82f6',
  blueDodger:  '#1d8ef0',
  blueLight:   '#38bdf8',
  purple:      '#a855f7',
  lavender:    '#c084fc',
  fuchsia:     '#d946ef',
  pink:        '#ec4899',
  gray:        '#6b7280',
};

async function main (params) {
  const logger = Core.Logger('campaignTimelineWidget', { level: params.LOG_LEVEL || 'info' });

  try {
    logger.info('Calling campaignTimelineWidget action');
    logger.debug('Params:', stringParameters(params));

    const requiredParams = ['hostname', 'WF_PLANNING_WORKSPACE_ID', 'WF_PLANNING_CAMPAIGN_RECORD_TYPE_ID', 'WF_PLANNING_ON_HOLD_STATUS_ID'];
    const requiredHeaders = ['Authorization'];
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);
    if (errorMessage) return errorResponse(400, errorMessage, logger);

    if (!HOSTNAME_RE.test(params.hostname)) {
      return errorResponse(400, 'invalid hostname', logger);
    }

    const token = getBearerToken(params);
    const recordTypeId = params.WF_PLANNING_CAMPAIGN_RECORD_TYPE_ID;
    const workspaceId = params.WF_PLANNING_WORKSPACE_ID;
    const onHoldStatusId = params.WF_PLANNING_ON_HOLD_STATUS_ID;
    const planningBase = `https://${params.hostname}/maestro/api`;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Fetch campaigns and record type definition in parallel
    const searchUrl = new URL(`${planningBase}/v1/records/search`);
    searchUrl.searchParams.set('recordTypeId', recordTypeId);
    searchUrl.searchParams.set('limit', '200');
    searchUrl.searchParams.set('aliased', 'true');

    const [campaignsRes, recordTypeRes] = await Promise.all([
      fetch(searchUrl.toString(), { headers: authHeaders }),
      fetch(`${planningBase}/record-types/${recordTypeId}`, { headers: authHeaders })
    ]);

    if (!campaignsRes.ok) {
      const body = await campaignsRes.text();
      logger.error(`Campaigns search failed: ${campaignsRes.status}: ${body}`);
      return errorResponse(campaignsRes.status, 'Failed to fetch campaigns', logger);
    }

    // Build category option map: opt.name → { label, color }
    // opt.name matches campaign.data.category (the stored value, e.g. "digital")
    // Falls back gracefully if the record type endpoint fails or has unexpected shape
    const categoryOptionMap = {};
    if (recordTypeRes.ok) {
      const recordTypeData = await recordTypeRes.json();
      const fields = recordTypeData.fields || [];
      const categoryField = fields.find(f =>
        f.alias === 'category' || (f.displayName || '').toLowerCase() === 'category'
      );
      if (categoryField) {
        (categoryField.options || []).forEach(opt => {
          // opt.name is the stored value (e.g. "digital"); opt.displayName is the label
          categoryOptionMap[opt.name] = {
            label: opt.displayName || opt.name || DEFAULT_TAG,
            color: PLANNING_COLOR_MAP[opt.color] || DEFAULT_TAG_COLOR
          };
        });
      }
    }

    const campaignsData = await campaignsRes.json();

    const processedCampaigns = (campaignsData.records || []).reduce((acc, campaign) => {
      if (campaign.data.status === 'complete' || !campaign.data.owner) return acc;

      const rawCategory = campaign.data.category;
      const categoryOption = categoryOptionMap[rawCategory];

      acc.push({
        workspaceId,
        recordTypeId,
        id: campaign.id,
        name: campaign.data.name,
        tag: categoryOption ? categoryOption.label : DEFAULT_TAG,
        tagColor: categoryOption ? categoryOption.color : DEFAULT_TAG_COLOR,
        person: campaign.data.owner[0].name,
        status: campaign.data.status === onHoldStatusId ? 'on-hold' : campaign.data.status,
        budget: campaign.data.budget,
        spent: campaign.data.spent,
        progress: campaign.data.percent_complete,
        startDate: new Date(campaign.data.start).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        endDate: new Date(campaign.data.end).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      });
      return acc;
    }, []);

    logger.info(`${processedCampaigns.length} active campaigns returned`);
    return { statusCode: 200, body: processedCampaigns };

  } catch (error) {
    logger.error(error);
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;

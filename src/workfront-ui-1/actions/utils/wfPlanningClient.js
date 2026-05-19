const axios = require("axios");
const { Core } = require('@adobe/aio-sdk')

class WorkfrontServiceClient {

  constructor(baseURL, imsToken) {
    this.logger = Core.Logger('WorkfrontPlanningClient', { level: 'debug' })
    this.logger.info('Creating WorkfrontPlanningClient instance');
    this.logger.debug(`BaseURL: ${baseURL}`);

    this.axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {'Authorization': `Bearer ${imsToken}`}
    });
  }

  async request(requestObj) {
    this.logger.info(`Request: ${requestObj.method} ${requestObj.objCode || requestObj.recordTypeId}`);
    this.logger.debug('Full request object:', JSON.stringify(requestObj, null, 2));

    if(requestObj.method !== 'search') {
      const method = requestObj.method.toLowerCase();
      const url = `/${requestObj.objCode}${requestObj.ID ? `/${requestObj.ID}` : ''}`;
      const body = requestObj.body ? requestObj.body : {};
      const parameters = requestObj.parameters ? requestObj.parameters : {};

      try {
        const response = await this.axiosInstance.request({
          method: method,
          url: url,
          data: body,
          params: parameters
        });

        this.logger.info(`Response status: ${response.status}`);
        this.logger.debug('Response data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        this.logger.error(`Error in ${method.toUpperCase()} request: ${error.message}`);
        if (error.response) {
          this.logger.error(`Response status: ${error.response.status}`);
          this.logger.debug('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
      }
    } else {
      const method = 'get';
      const url = `/v1/records/search`;
      const parameters = {
        "recordTypeId": requestObj.recordTypeId,
        "limit": 200,
        "aliased": true
      };

      try {
        const response = await this.axiosInstance.request({
          method: method,
          url: url,
          data: {},
          params: parameters
        });

        this.logger.info(`Response status: ${response.status}`);
        this.logger.debug('Search response data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        this.logger.error(`Error in search request: ${error.message}`);
        if (error.response) {
          this.logger.error(`Response status: ${error.response.status}`);
          this.logger.debug('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
      }
    }
  }
}

module.exports = { WorkfrontServiceClient };

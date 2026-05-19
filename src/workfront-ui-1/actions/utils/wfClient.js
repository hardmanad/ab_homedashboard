const axios = require("axios");
const { Core } = require('@adobe/aio-sdk')

class WorkfrontServiceClient {

  constructor(baseURL, imsToken) {
    this.logger = Core.Logger('WorkfrontServiceClient', { level: 'debug' })
    this.logger.info('Creating WorkfrontServiceClient instance');
    this.logger.debug(`BaseURL: ${baseURL}`);

    this.axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {'Authorization': `Bearer ${imsToken}`}
    });
  }

  async request(requestObj) {
    this.logger.info(`Request: ${requestObj.method} ${requestObj.objCode}${requestObj.ID ? `/${requestObj.ID}` : ''}`);
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

        return response.data.data;
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
      const countUrl = `/${requestObj.objCode}/count`;
      const searchUrl = `/${requestObj.objCode}/search`;
      const parameters = requestObj.parameters ? requestObj.parameters : {};

      if(!parameters['$$LIMIT'] || parameters['$$LIMIT'] > 2000) {
        parameters['$$LIMIT'] = 2000;
      }

      try {
        const countResponse = await this.axiosInstance.request({
          method: method,
          url: countUrl,
          params: parameters
        });

        const totalCount = countResponse.data.data ? countResponse.data.data.count : 0;
        this.logger.info(`Total record count: ${totalCount}`);

        let totalResponse = [];

        if(totalCount > 2000) {
          let retrieved = 0;
          let pageNum = 1;

          while(retrieved < totalCount) {
            parameters['$$FIRST'] = retrieved;
            this.logger.debug(`Fetching page ${pageNum}, starting at record ${retrieved}`);

            const paginatedResponse = await this.axiosInstance.request({
              method: method,
              url: searchUrl,
              params: parameters
            });

            totalResponse = totalResponse.concat(paginatedResponse.data.data);
            retrieved = totalResponse.length;
            pageNum++;
          }
          this.logger.info(`Pagination complete. Total records retrieved: ${totalResponse.length}`);
        } else {
          const resp = await this.axiosInstance.request({
            method: method,
            url: searchUrl,
            params: parameters
          });

          totalResponse = resp.data.data;
          this.logger.info(`Search returned ${totalResponse ? totalResponse.length : 0} records`);
          this.logger.debug('Search response:', JSON.stringify(resp.data, null, 2));
        }

        return totalResponse;

      } catch (error) {
        this.logger.error(`Error in search request: ${error.message}`);
        this.logger.error(error.stack);
        if (error.response) {
          this.logger.error(`Response status: ${error.response.status} ${error.response.statusText}`);
          this.logger.debug('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
      }
    }
  }
}

module.exports = { WorkfrontServiceClient };

const axios = require("axios");
const { Core } = require('@adobe/aio-sdk')

class WorkfrontServiceClient {
  
  constructor(baseURL, imsToken) {
    this.logger = Core.Logger('WorkfrontServiceClient', { level: 'debug' })
    this.logger.info('Creating WorkfrontServiceClient instance');
    this.logger.info(`BaseURL: ${baseURL}`);
    this.logger.info(`Token length: ${imsToken ? imsToken.length : 0}`);
    
    this.axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {'Authorization': `Bearer ${imsToken}`}
    });
    
    this.logger.info('Axios instance created successfully');
  }

  async request(requestObj) {
    this.logger.info('========== WF CLIENT REQUEST START ==========');
    this.logger.info(`Request method: ${requestObj.method}`);
    this.logger.info(`Request objCode: ${requestObj.objCode}`);
    console.log('Full request object:', JSON.stringify(requestObj, null, 2));
    
    if(requestObj.method !== 'search') {
      const method = requestObj.method.toLowerCase();
      const url = `/${requestObj.objCode}${requestObj.ID ? `/${requestObj.ID}` : ''}`;
      const body = requestObj.body ? requestObj.body : {};
      const parameters = requestObj.parameters ? requestObj.parameters : {};

      this.logger.info(`HTTP Method: ${method}`);
      this.logger.info(`URL Path: ${url}`);
      this.logger.info(`Parameters:`, JSON.stringify(parameters, null, 2));
      console.log('Request body:', JSON.stringify(body, null, 2));

      try {
        const response = await this.axiosInstance.request({
          method: method,
          url: url,
          body: body,
          params: parameters
        });
        
        this.logger.info(`Response status: ${response.status}`);
        this.logger.info(`Response data type: ${typeof response.data}`);
        this.logger.info(`Response has data.data: ${!!response.data.data}`);
        console.log('Full response:', JSON.stringify(response.data, null, 2));
        
        return response.data.data;
      } catch (error) {
        this.logger.error('Error in non-search request');
        this.logger.error(`Error message: ${error.message}`);
        if (error.response) {
          this.logger.error(`Response status: ${error.response.status}`);
          this.logger.error(`Response data:`, JSON.stringify(error.response.data, null, 2));
        }
        throw error;
      }
    } else if(requestObj.method == 'search') {
      this.logger.info('Processing SEARCH request');
      const method = 'get';
      const countUrl = `/${requestObj.objCode}/count`;
      const searchUrl = `/${requestObj.objCode}/search`;
      const parameters = requestObj.parameters ? requestObj.parameters : {};
      
      this.logger.info(`Count URL: ${countUrl}`);
      this.logger.info(`Search URL: ${searchUrl}`);
      this.logger.info('Original parameters:', JSON.stringify(parameters, null, 2));
      
      if(!parameters['$$LIMIT'] || parameters['$$LIMIT'] > 2000) {
        parameters['$$LIMIT'] = 2000;
        this.logger.info(`Set $$LIMIT to 2000`);
      }
      
      try {
        this.logger.info('Making COUNT request to Workfront...');
        const countResponse = await this.axiosInstance.request({
          method: method,
          url: countUrl,
          params: parameters
        });
        
        this.logger.info(`Count response status: ${countResponse.status}`);
        console.log('Count response data:', JSON.stringify(countResponse.data, null, 2));
        
        const countTotal = countResponse.data;
        const totalCount = countTotal.data ? countTotal.data.count : 0;
        this.logger.info(`Total count from Workfront: ${totalCount}`);
        
        let totalResponse = [];
        
        if(totalCount > 2000) {
          this.logger.info(`Count > 2000, will paginate through ${totalCount} records`);
          let retrieved = 0;
          let pageNum = 1;
          
          while(retrieved < totalCount) {
            parameters['$$FIRST'] = retrieved;
            this.logger.info(`Fetching page ${pageNum}, starting at record ${retrieved}`);
            
            const paginatedResponse = await this.axiosInstance.request({
              method: method,
              url: searchUrl,
              params: parameters
            });
            
            this.logger.info(`Page ${pageNum} response status: ${paginatedResponse.status}`);
            this.logger.info(`Page ${pageNum} returned ${paginatedResponse.data.data ? paginatedResponse.data.data.length : 0} records`);
            
            totalResponse = totalResponse.concat(paginatedResponse.data.data);
            retrieved = totalResponse.length;
            pageNum++;
          }
          this.logger.info(`Pagination complete. Total records retrieved: ${totalResponse.length}`);
        } else {
          this.logger.info(`Count <= 2000 (${totalCount}), making single search request`);
          const resp = await this.axiosInstance.request({
            method: method,
            url: searchUrl,
            params: parameters
          });
          
          this.logger.info(`Search response status: ${resp.status}`);
          console.log('Search response data:', JSON.stringify(resp.data, null, 2));
          
          totalResponse = resp.data.data;
          this.logger.info(`Search returned ${totalResponse ? totalResponse.length : 0} records`);
        }
        
        this.logger.info('========== WF CLIENT REQUEST END ==========');
        return totalResponse;
        
      } catch (error) {
        this.logger.error('Error in search request');
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
        if (error.response) {
          this.logger.error(`Response status: ${error.response.status}`);
          this.logger.error(`Response statusText: ${error.response.statusText}`);
          console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
      }
    }
  }
}

module.exports = { WorkfrontServiceClient };
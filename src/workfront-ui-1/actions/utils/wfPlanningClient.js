const axios = require("axios");
//const { Core } = require('@adobe/aio-sdk')

class WorkfrontServiceClient {
  
  constructor(baseURL, imsToken) {
    //this.logger = Core.Logger('main', { level: envParams.LOG_LEVEL || 'info' })
    this.axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {'Authorization': `Bearer ${imsToken}`}
    });
  }

  async request(requestObj) {
    if(requestObj.method !== 'search') {
      const method = requestObj.method.toLowerCase();
      const url = `/${requestObj.objCode}${requestObj.ID ? `/${requestObj.ID}` : ''}`;
      const body = requestObj.body ? requestObj.body : {};
      const parameters = requestObj.parameters ? requestObj.parameters : {};
      const response = await this.axiosInstance.request({
        method: method,
        url: url,
        body: body,
        params: parameters
      });
      return response.data;
    } else if(requestObj.method == 'search') {
      const method = 'get';
      const url = `/v1/records/search`;
      const parameters = {
        "recordTypeId": requestObj.recordTypeId,
        "limit": 200,
        "aliased": true
      };
      const body = {};
      const response = await this.axiosInstance.request({
        method: method,
        url: url,
        body: body,
        params: parameters
      });
      return response.data;
    }
  } 
}

module.exports = { WorkfrontServiceClient };
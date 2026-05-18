/*
* <license header>
*/

/* global fetch */


/**
 *
 * Invokes a web action
 *
 * @param  {string} actionUrl
 * @param {object} headers
 * @param  {object} params
 *
 * @returns {Promise<string|object>} the response
 *
 */

async function actionWebInvoke (actionUrl, headers = {}, params = {}, options = { method: 'POST' }) {  
  
  const actionHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  const fetchConfig = {
    headers: actionHeaders
  }

  if (window.location.hostname === 'localhost') {
    actionHeaders['x-ow-extra-logging'] = 'on'
  }

  fetchConfig.method = options.method.toUpperCase()

  if (fetchConfig.method === 'GET') {
    actionUrl = new URL(actionUrl)
    Object.keys(params).forEach(key => actionUrl.searchParams.append(key, params[key]))
  } else if (fetchConfig.method === 'POST') {
    fetchConfig.body = JSON.stringify(params)
  }
  
  const response = await fetch(actionUrl, fetchConfig)
  
  return response;
}

export function getActionHost() {
  const host = process.env.REACT_APP_AIO_STATIC_HOST || process.env.AIO_STATIC_HOST;
  if (!host) {
    throw new Error('AIO_STATIC_HOST is not set. Set AIO_STATIC_HOST in your .env file.');
  }
  return host;
}

export function buildActionUrl(path) {
  const host = getActionHost();
  return `https://${host}${path}`;
}

export default actionWebInvoke

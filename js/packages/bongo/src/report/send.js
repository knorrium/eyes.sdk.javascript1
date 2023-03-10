'use strict'
const {BlobServiceClient} = require('@azure/storage-blob')
const fetch = require('node-fetch')

async function send({uri, payload}) {
  const result = await fetch(uri, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'},
  })
  return {isSuccessful: result.status === 200, message: result.statusText}
}

async function sendTestReport(payload) {
  return send({uri: 'http://applitools-quality-server.herokuapp.com/result', payload})
}

async function sendReleaseNotification({payload, name}) {
  return name === 'core'
    ? send({uri: 'http://applitools-quality-server.herokuapp.com/send_mail/core_sdk', payload})
    : send({uri: 'http://applitools-quality-server.herokuapp.com/send_mail/sdks', payload})
}

async function sendToStorage({
  sdkName,
  reportId,
  isSandbox,
  payload,
  connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING,
}) {
  function formatDate(d) {
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    const millis = String(d.getMilliseconds()).padStart(3, '0')
    return `${d.getFullYear()}-${month}-${date}-${hours}-${minutes}-${seconds}-${millis}`
  }

  if (!connectionString) {
    throw new Error(
      'In order to send test results to storage, connection string needs to be provided. Usually this is done by defining the env var AZURE_STORAGE_CONNECTION_STRING. For more details: https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs?toc=/azure/developer/javascript/toc.json&bc=/azure/developer/breadcrumb/toc.json#copy-your-credentials-from-the-azure-portal',
    )
  }
  const folderName = `${sdkName}/${isSandbox ? 'sandbox' : 'prod'}`
  const dateStr = formatDate(new Date())
  const sandboxStr = isSandbox ? '-sandbox' : ''
  const reportIdStr = reportId ? `-${reportId}` : ''
  const blobName = `${dateStr}${sandboxStr}${reportIdStr}.json`
  const blobPath = `${folderName}/${blobName}`
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient('coverage-test-results')
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)
  return await blockBlobClient.upload(payload, payload.length)
}

module.exports = {sendTestReport, sendReleaseNotification, sendToStorage}

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const dotenv = require("dotenv");
dotenv.config();

const azureOpenAIConfig = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_KEY,
  deploymentId: process.env.DEPLOYMENT_ID, 
};

const client = new OpenAIClient(azureOpenAIConfig.endpoint, new AzureKeyCredential(azureOpenAIConfig.apiKey));

module.exports = { client, deploymentId: azureOpenAIConfig.deploymentId };

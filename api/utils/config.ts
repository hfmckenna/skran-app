// Before running the sample, you will need to replace the values in the .env file,
import { ConfidentialClientApplication } from "@azure/msal-node";

const config = {
  auth: {
    clientId: process.env['CLIENT_ID'],
    authority: `https://login.microsoftonline.com/${process.env['TENANT_INFO']}`,
    clientSecret: process.env['CLIENT_SECRET'],
  },
};

// Create msal application object
const cca = new ConfidentialClientApplication(config);

export default cca;
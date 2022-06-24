import fetch from 'node-fetch';
import { decode, JwtHeader, verify } from "jsonwebtoken";
const jwksClient = require('jwks-rsa');

/**
 * Makes an authorization bearer token request
 * to given resource endpoint.
 */
export const callResourceAPI = async (newTokenValue: string, resourceURI: string) => {
    const options = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${newTokenValue}`,
            'Content-type': 'application/json',
        },
    };

    const response = await fetch(resourceURI, options);
    return response.json();
};

/**
 * Validates the access token for signature
 * and against a predefined set of claims
 */
export const validateAccessToken = async (accessToken: string) => {
  if (!accessToken || accessToken === '' || accessToken === 'undefined') {
    console.log('No tokens found');
    return false;
  }

  // we will first decode to get kid parameter in header
  let decodedToken;
  try {
    decodedToken = decode(accessToken, { complete: true });
  } catch (error) {
    console.log('Token cannot be decoded');
    console.log(error);
    return false;
  }

  // obtains signing keys from discovery endpoint
  let keys;

  try {
    if (!decodedToken) {
      console.log('No token decoded');
      return false;
    }
    keys = await getSigningKeys(decodedToken?.header);
  } catch (error) {
    console.log('Signing keys cannot be obtained');
    console.log(error);
    return false;
  }

  // verify the signature at header section using keys
  let verifiedToken;

  try {
    verifiedToken = verify(accessToken, keys);
  } catch (error) {
    console.log('Token cannot be verified');
    console.log(error);
    return false;
  }

  /**
   * Validates the token against issuer, audience, scope
   * and timestamp, though implementation and extent vary. For more information, visit:
   * https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validating-tokens
   */
  if (typeof verifiedToken !== 'string') {
    if (
      verifiedToken['iat'] &&
      verifiedToken['exp'] &&
      verifiedToken['aud'] &&
      verifiedToken['scp'] &&
      verifiedToken['iss']
    ) {
      const now = Math.round(new Date().getTime() / 1000); // in UNIX format
      const checkTimestamp =
        verifiedToken['iat'] <= now && verifiedToken['exp'] >= now;
      const checkAudience =
        verifiedToken['aud'] === process.env['CLIENT_ID'] ||
        verifiedToken['aud'] === 'api://' + process.env['CLIENT_ID'];
      const checkScope =
        verifiedToken['scp'] === process.env['EXPECTED_SCOPES'];
      const checkIssuer = !!verifiedToken['iss'].includes(
        process.env['TENANT_INFO']
      );

      if (checkTimestamp && checkAudience && checkScope && checkIssuer) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Fetches signing keys of an access token
 * from the authority discovery endpoint
 */
const getSigningKeys = async (header: JwtHeader) => {
  // In single-tenant apps, discovery keys endpoint will be specific to your tenant
  const jwksUri = `https://login.microsoftonline.com/${process.env['TENANT_INFO']}/discovery/v2.0/keys`;

  const client = jwksClient({
    jwksUri: jwksUri,
  });

  return (await client.getSigningKeyAsync(header.kid)).getPublicKey();
};
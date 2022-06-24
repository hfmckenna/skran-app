// @ts-nocheck

import { decode, verify } from 'jsonwebtoken';

const jwksClient = require('jwks-rsa');
import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch from 'node-fetch';
import RecipesService from '../services/recipes';

// Before running the sample, you will need to replace the values in the .env file,
const config = {
    auth: {
        clientId: process.env['CLIENT_ID'],
        authority: `https://login.microsoftonline.com/${process.env['TENANT_INFO']}`,
        clientSecret: process.env['CLIENT_SECRET'],
    },
};

// Create msal application object
const cca = new ConfidentialClientApplication(config);

let aadAppUniqueUser = null;

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    try {
        // get ssoToken from client request
        let ssoToken = req.body?.ssoToken;
        const headerToken = req.headers['x-custom-authorization'];
        // strip bearer prefix from get requests
        if (req.method === 'GET' && headerToken) {
            ssoToken = headerToken.substring(7, headerToken.length);
        }

        context.log(headerToken);

        if (!ssoToken)
            throw Error({
                name: 'Sample-Auth',
                message: 'no ssoToken sent from client',
                status: 401,
            });

        // validate client's ssoToken
        const isAuthorized = await validateAccessToken(ssoToken);
        if (!isAuthorized)
            throw Error({
                name: 'Sample-Auth',
                message: "can't validate access token",
                status: 401,
            });

        // construct scope for API call - must match registered scopes
        const oboRequest = {
            oboAssertion: ssoToken,
            scopes: ['User.Read'],
        };

        // get token on behalf of user
        let response = await cca.acquireTokenOnBehalfOf(oboRequest);
        if (!response.accessToken)
            throw Error({
                name: 'Sample-Auth',
                message: 'no access token acquired',
                status: 401,
            });

        // call API on behalf of user
        let apiResponse = await callResourceAPI(
            response.accessToken,
            'https://graph.microsoft.com/v1.0/me'
        );
        if (!apiResponse)
            throw Error({
                name: 'Sample-Graph',
                message: 'call to Graph failed',
                status: 500,
            });

        // MongoDB (CosmosDB) connect
        const mongoDBConnected = await RecipesService.connect();
        if (!mongoDBConnected)
            throw Error({
                name: 'Sample-DBConnection',
                message: "couldn't connect to database",
                status: 500,
            });
        context.log(req.method);
        switch (req.method) {
            case 'POST':
                await postRecipe(context, req);
                break;
            case 'GET':
                await getRecipes(context);
                break;
            default:
        }
    } catch (error) {
        context.log(error);

        context.res = {
            status: 500,
            body: {
                response: JSON.stringify(error)
            },
        };
    }
};

/**
 * Makes an authorization bearer token request
 * to given resource endpoint.
 */
const callResourceAPI = async (newTokenValue, resourceURI) => {
    let options = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${newTokenValue}`,
            'Content-type': 'application/json',
        },
    };

    let response = await fetch(resourceURI, options);
    let json = await response.json();
    return json;
};

/**
 * Validates the access token for signature
 * and against a predefined set of claims
 */
const validateAccessToken = async (accessToken) => {
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
        keys = await getSigningKeys(decodedToken.header);
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

    const now = Math.round(new Date().getTime() / 1000); // in UNIX format

    const checkTimestamp =
        verifiedToken['iat'] <= now && verifiedToken['exp'] >= now
            ? true
            : false;
    const checkAudience =
        verifiedToken['aud'] === process.env['CLIENT_ID'] ||
        verifiedToken['aud'] === 'api://' + process.env['CLIENT_ID']
            ? true
            : false;
    const checkScope =
        verifiedToken['scp'] === process.env['EXPECTED_SCOPES'] ? true : false;
    const checkIssuer = verifiedToken['iss'].includes(
        process.env['TENANT_INFO']
    )
        ? true
        : false;

    if (checkTimestamp && checkAudience && checkScope && checkIssuer) {
        // capture decodedToken, because sub is user's unique ID
        // for the Active Directory app
        aadAppUniqueUser = decodedToken;
        return true;
    }
    return false;
};

/**
 * Fetches signing keys of an access token
 * from the authority discovery endpoint
 */
const getSigningKeys = async (header) => {
    // In single-tenant apps, discovery keys endpoint will be specific to your tenant
    const jwksUri = `https://login.microsoftonline.com/${process.env['TENANT_INFO']}/discovery/v2.0/keys`;
    console.log(jwksUri);

    const client = jwksClient({
        jwksUri: jwksUri,
    });

    return (await client.getSigningKeyAsync(header.kid)).getPublicKey();
};

const postRecipe = async (context, req) => {
    // get appUser from client request
    // this isn't passed in on first request
    const newRecipe = req.body?.newRecipe;

    let foundRecipe = await RecipesService.getRecipeByTitle(newRecipe.title);

    // Upsert to MongoDB (CosmosDB)
    if (!foundRecipe) {
        foundRecipe = await RecipesService.addRecipe(newRecipe);
        if (!foundRecipe)
            throw Error({
                name: 'Sample-DBConnection',
                message: 'no user returned from database',
                status: 500,
            });
    } else {
        return (context.res = {
            status: 409,
            body: {
                message: 'Recipe already exists',
                response: foundRecipe.toJSON() || null,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Return to client
    return (context.res = {
        status: 200,
        body: {
            response: foundRecipe.toJSON() || null,
        },
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

const getRecipes = async (context) => {
    // MongoDB (CosmosDB) connect
    const mongoDBConnected = await RecipesService.connect();
    if (!mongoDBConnected)
        throw Error({
            name: 'Sample-DBConnection',
            message: "couldn't connect to database",
            status: 500,
        });
    const allRecipes = await RecipesService.getAllRecipes();
    console.log(allRecipes);
    // Return to client
    if (allRecipes) {
        return (context.res = {
            status: 200,
            body: {
                response: allRecipes,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } else {
        return (context.res = {
            status: 404,
            body: {
                response: 'No recipes found',
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

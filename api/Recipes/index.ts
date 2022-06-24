import { callResourceAPI, validateAccessToken } from '../services/validate';
import { Context, HttpRequest } from '@azure/functions';
import RecipesService from '../services/recipes';
import cca from '../utils/config'

module.exports = async function (context: Context, req: HttpRequest) {
    context.log('JavaScript HTTP trigger function processed a request.');
    // get ssoToken from client request
    let ssoToken = req.body?.ssoToken;
    const headerToken = req.headers['x-custom-authorization'];
    // strip bearer prefix from get requests
    if (req.method === 'GET' && headerToken) {
        ssoToken = headerToken.substring(7, headerToken.length);
    }

    context.log(headerToken);

    if (!ssoToken) {
        context.log.error('no ssoToken sent from client');
        return (context.res = {
            status: 401,
        });
    }

    // validate client's ssoToken
    const isAuthorized = await validateAccessToken(ssoToken);
    if (!isAuthorized) {
        context.log.error('cant validate access token');
        return (context.res = {
            status: 401,
        });
    }

    // construct scope for API call - must match registered scopes
    const oboRequest = {
        oboAssertion: ssoToken,
        scopes: ['User.Read'],
    };

    // get token on behalf of user
    const response = await cca.acquireTokenOnBehalfOf(oboRequest);
    if (!response?.accessToken) {
        context.log.error('no access token acquired');
        return (context.res = {
            status: 401,
        });
    }

    // call API on behalf of user
    const apiResponse = await callResourceAPI(
        response.accessToken,
        'https://graph.microsoft.com/v1.0/me'
    );
    if (!apiResponse) {
        context.log.error('call to Graph failed');
        return (context.res = {
            status: 401,
        });
    }

    // MongoDB (CosmosDB) connect
    const mongoDBConnected = await RecipesService.connect();
    if (!mongoDBConnected) {
        context.log.error('couldnt connect to database');
        return (context.res = {
            status: 401,
        });
    }

    switch (req.method) {
        case 'POST':
            await postRecipe(context, req);
            break;
        case 'GET':
            await getRecipes(context);
            break;
        default:
    }
};

const postRecipe = async (context: Context, req: HttpRequest) => {
    // get appUser from client request
    // this isn't passed in on first request
    const newRecipe = req.body?.newRecipe;

    let foundRecipe = await RecipesService.getRecipeByTitle(newRecipe.title);

    // Upsert to MongoDB (CosmosDB)
    if (!foundRecipe) {
        foundRecipe = await RecipesService.addRecipe(newRecipe);
        if (!foundRecipe) {
            context.log.error('no user returned from database');
            return (context.res = {
                status: 401,
            });
        }
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

const getRecipes = async (context: Context) => {
    // MongoDB (CosmosDB) connect
    const mongoDBConnected = await RecipesService.connect();
    if (!mongoDBConnected) {
        context.log.error('couldnt connect to database');
        return (context.res = {
            status: 401,
        });
    }

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

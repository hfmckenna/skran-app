// @ts-nocheck

import { connect as mongooseConnect } from 'mongoose';
import Recipes from '../models/recipes';

let connected = false;
let connection = null;

const mongooseConfig = {
    url: process.env.MONGODB_URL,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.NODE_ENV
    },
};

const connect = async () => {
    try {
        if (
            !connected &&
            mongooseConfig &&
            mongooseConfig.url &&
            mongooseConfig.options
        ) {
            // connect to DB
            connection = await mongooseConnect(
                mongooseConfig.url,
                mongooseConfig.options
            );
            connected = true;
            return connected;
        } else if (connected) {
            // already connected to DB
            console.log('Mongoose already connected');
            return connected;
        } else {
            // can't connect to DB
            throw Error(
                'Mongoose URL needs to be added to Config settings as MONGODB_URL'
            );
        }
    } catch (err) {
        console.log(`Mongoose connection error: ${err}`);
        throw Error('connection error -' + err);
    }
};

const disconnect = () => {
    connection.disconnect();
};

const isConnected = () => {
    return connected;
};

const queryRecipes = async (filter, options) => {
    const recipes = await Recipes.paginate(filter, options);
    return recipes;
};

const getRecipeByTitle = async (title) => {
    return Recipes.findOne({ title });
};

const getRecipeById = async (id) => {
    return await Recipes.findById(id);
};

const addRecipe = async (recipe) => {
    const newRecipe = new Recipes(recipe);
    return newRecipe.save();
};

const deleteRecipeById = async (recipeId) => {
    const tempUser = await getRecipeById(recipeId);
    if (!tempUser) {
        throw new Error('User not found');
    }
    await Recipes.remove();
    return tempUser;
};

const getAllRecipes = async () => {
    return Recipes.find({});
};

const deleteAllRecipes = async () => {
    await Recipes.deleteMany({});
}

export default {
    connect,
    disconnect,
    isConnected,
    queryRecipes,
    getRecipeByTitle,
    getRecipeById,
    addRecipe,
    deleteRecipeById,
    getAllRecipes,
    deleteAllRecipes
};

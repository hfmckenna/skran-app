import { Recipe, PaginationOptions } from '../types';
import {
    connect as mongooseConnect,
    disconnect as mongooseDisconnect,
} from 'mongoose';
import Recipes from '../models/recipes';
let connected = false;

const mongooseConfig = {
    url: process.env.MONGODB_URL,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.NODE_ENV,
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
            await mongooseConnect(mongooseConfig.url, mongooseConfig.options);
            connected = true;
            return connected;
        } else if (connected) {
            // already connected to DB
            console.log('Mongoose already connected');
            return connected;
        } else {
            // can't connect to DB
            console.log('Mongoose needs Config settings');
        }
    } catch (err) {
        console.log(`Mongoose connection error: ${err}`);
        throw Error('connection error -' + err);
    }
    return false;
};

const disconnect = async () => {
    await mongooseDisconnect();
};

const isConnected = () => {
    return connected;
};

const queryRecipes = async (filter: string, options: PaginationOptions) => {
    return Recipes.paginate(filter, options);
};

const getRecipeByTitle = async (title: string) => {
    return Recipes.findOne({ title });
};

const getRecipeById = async (id: string) => {
    return await Recipes.findById(id);
};

const addRecipe = async (recipe: Recipe) => {
    const newRecipe = new Recipes(recipe);
    return newRecipe.save();
};

const deleteRecipeById = async (recipeId: string) => {
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
};

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
    deleteAllRecipes,
};

import { Schema, model, Document } from 'mongoose';
import { Component, Recipe } from "../types";
import { paginate } from '../utils/mapping';

interface IRecipe extends Document {
    id?: string;
    _id?: string;
    __v?: string;
    title: string;
    instructions: string;
    components: Component[];
    paginate: () => PaginationReturn;
}

type PaginationReturn = {
    results: Recipe[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
};

const recipeSchema: Schema = new Schema<Recipe>({
    title: {
        type: String,
        required: true,
        minlength: 3,
    },
    instructions: {
        type: String,
        required: true,
        minlength: 20,
    },
    components: [
        {
            name: {
                type: String,
                required: true,
                minlength: 3,
            },
            technique: {
                type: String,
                required: true,
                minlength: 3,
            },
            ingredients: [
                {
                    name: {
                        type: String,
                        required: true,
                        minlength: 3,
                    },
                    value: {
                        type: Number,
                        required: true,
                        min: 1,
                    },
                    measurement: {
                        type: String,
                        required: false,
                        enum: ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp'],
                        nullable: true,
                    },
                },
            ],
        },
    ],
});

recipeSchema.set('toJSON', {
    transform: (_document, returnedObject: IRecipe) => {
        if (returnedObject._id) {
            returnedObject.id = returnedObject._id.toString();
            delete returnedObject._id;
        }
        delete returnedObject.__v;
    },
});

recipeSchema.plugin(paginate);

const Recipes: any = model<IRecipe>('Recipes', recipeSchema);

export default Recipes;

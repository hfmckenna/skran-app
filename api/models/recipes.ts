import { Schema, model } from 'mongoose';
import { Recipe as RecipeType } from '../types';
import { paginate } from '../utils/mapping';

interface RecipeObject extends RecipeType {
    id?: string;
    _id?: string;
    __v?: string;
}

const recipeSchema: Schema = new Schema<RecipeType>({
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
    transform: (_document, returnedObject: RecipeObject) => {
        if (returnedObject._id) {
            returnedObject.id = returnedObject._id.toString();
            delete returnedObject._id;
        }
        delete returnedObject.__v;
    },
});

recipeSchema.plugin(paginate);

const Recipes = model<RecipeType>('Recipes', recipeSchema);

export default Recipes;

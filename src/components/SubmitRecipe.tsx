// @ts-nocheck
import React from 'react';

import { callOwnApiWithToken } from '../fetch';

interface RecipeProps {
    accessToken: any;
    endpoint: any;
    user: any;
    changeFunctionData: any;
}

const newRecipe = {
    title: 'Spaghetti and meatballs 3',
    instructions: 'First boil some spaghetti, then you get your meatballs.',
    components: [
        {
            name: 'Spaghetti',
            technique: 'Boil',
            ingredients: [
                {
                    name: 'Pasta',
                    value: 500,
                    measurement: 'g',
                },
            ],
        },
        {
            name: 'Meatballs',
            technique: 'Fry',
            ingredients: [
                {
                    name: 'Beef mince',
                    value: 250,
                    measurement: 'g',
                },
                {
                    name: 'Oregano',
                    value: 1,
                    measurement: 'tsp',
                },
                {
                    name: 'Breadcrumbs',
                    value: 50,
                    measurement: 'g',
                },
            ],
        },
        {
            name: 'Tomato Sauce',
            technique: 'Sauté',
            ingredients: [
                {
                    name: 'Tinned Tomatoes',
                    value: 500,
                    measurement: 'g',
                },
                {
                    name: 'Onions',
                    value: 2,
                },
                {
                    name: 'Garlic cloves',
                    value: 4,
                },
            ],
        },
    ],
};

export const SubmitRecipe = (props: RecipeProps) => {
    const { accessToken, endpoint, changeFunctionData } = props;

    const updateRecipeOnServer = async () => {
        const updateRecipe = await callOwnApiWithToken(
            accessToken,
            endpoint,
            newRecipe
        );
        changeFunctionData(updateRecipe);
    };

    const onFormSubmit = async (event: any) => {
        event.preventDefault();
        console.log('Submitting recipe...');
        updateRecipeOnServer().catch((error) => console.log(error));
    };

    return (
        <>
            <center>
                <hr></hr>
                <h2>Your favorite Color?</h2>
                <button onClick={onFormSubmit}>
                    Submit
                </button>
            </center>
        </>
    );
};

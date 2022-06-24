// @ts-nocheck

import { useEffect, useState } from 'react';
import { callOwnApiWithToken } from '../fetch';

interface RecipeProps {
    accessToken: any;
    endpoint: any;
    user: any;
    changeFunctionData: any;
}

export const Colour = (props: RecipeProps) => {
    const {accessToken, endpoint, user, changeFunctionData} = props;
    const [color, setColor] = useState('');

    useEffect(() => {
        if (user && user.favoriteColor) {
            setColor(user.favoriteColor);
        }
    }, [user]);

    const onColorChange = (event: any) => {
        setColor(event.target.value);
    };

    const updateUserOnServer = async () => {
        // @ts-ignore
      const updateUser = await callOwnApiWithToken(accessToken, endpoint, {
            favoriteColor: color,
        });
        changeFunctionData(updateUser);
    };

    const onFormSubmit = async (event: any) => {
        event.preventDefault();
        console.log('An color was submitted: ' + color);
        // @ts-ignore
      updateUserOnServer()
            .then((response) => setColor(response))
            .catch((error) => console.log(error));
    };

    // @ts-ignore
    return (
        <>
            {' '}
            {user && (
                <center>
                    <hr></hr>
                    <h2>Your favorite Color?</h2>
                    <form onSubmit={onFormSubmit}>
                        <input
                            type='text'
                            value={color}
                            onChange={onColorChange}
                            name='favoriteColor'
                        />
                        <input type='submit' value='Submit' />
                    </form>
                </center>
            )}
        </>
    );
};

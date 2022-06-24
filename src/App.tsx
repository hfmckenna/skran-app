import { useEffect, useState } from 'react';
import './App.css';

function App() {
    return (
        <div className='App'>
            <Recipe />
        </div>
    );
}

function Recipe() {
    const [recipe, setRecipe] = useState<any>(null);

    useEffect(() => {
        (async function getRecipe() {
            const recipe = await fetch(
                import.meta.env.VITE_API_URL +
                    '/api/v1/recipe/622cd36f70a4d852b7dcbd55'
            ).then((res) => res.json());
            setRecipe(recipe);
        })()
    }, []);

    return <div>{recipe && recipe?.title}</div>;
}

export default App;

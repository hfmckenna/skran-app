import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './index.css';

export function App() {
    return (
        <>
            <div className='App'>
                <div>
                    <nav>
                        <ul className='flex justify-evenly py-5'>
                            <li>
                                <Link to='/'>Home</Link>
                            </li>
                            <li>
                                <Link to='/admin'>Admin</Link>
                            </li>
                            <li>
                                <Link to='/recipe'>Recipe</Link>
                            </li>
                        </ul>
                    </nav>
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export function Home() {
    return (
        <div>
            <h1 className='text-center'>Home</h1>
        </div>
    );
}

export function Admin() {
    return (
        <div>
            <h1 className='text-center'>Admin</h1>
        </div>
    );
}

export function Recipe() {
    const [recipe, setRecipe] = useState<any>(null);

    useEffect(() => {
        (async function getRecipe() {
            const recipe = await fetch(
                '/api/v1/recipe/622cd36f70a4d852b7dcbd55'
            ).then((res) => res.json());
            setRecipe(recipe);
        })();
    }, []);

    return <div className='text-center'>{recipe && recipe?.title}</div>;
}

export default App;

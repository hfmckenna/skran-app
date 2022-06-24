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
                                <Link to='/recipes'>Recipes</Link>
                            </li>
                        </ul>
                    </nav>
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export default App;

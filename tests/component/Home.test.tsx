import Home from '../../src/pages/Home';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';

test('renders home page', () => {
    render(<Home />);
    expect(screen.getByText('Home')).toBeDefined();
});

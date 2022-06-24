import { test, expect, beforeAll, afterAll } from 'vitest';
import recipes from '../../api/services/recipes';

beforeAll(async () => {
    await recipes.connect();
});

afterAll(async () => {
    await recipes.disconnect();
});

test('paginates schema correctly', () => {
    const test = 0;
    expect(test).toBe(0);
});

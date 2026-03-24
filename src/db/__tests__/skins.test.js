import { __restoreOpenDatabaseForTests, __setOpenDatabaseForTests } from '../db.js';
import { getSkinBySetId, getAllSkins } from '../skins.js';
import { createFreshTestDatabase, getOpenDatabaseAsyncForTests, teardownTestDatabase } from './testDatabase.js';

beforeEach(async function () {
  await createFreshTestDatabase();
  __setOpenDatabaseForTests(getOpenDatabaseAsyncForTests());
});
afterEach(async function () {
  await teardownTestDatabase();
});

afterAll(function () {
  __restoreOpenDatabaseForTests();
});

describe('Dice Shop Operations', function () {
  test('getSkinBySetId returns seeded skin by ID', async function () {
    const result = await getSkinBySetId(1); // Classic skin
    expect(result.skin_name).toBe('Classic');
    expect(result.skin_description).toBe('Default skin');
    expect(result.skin_folder).toBe('dark-wood');
    expect(result.skin_fill_color).toBe('#e0e0e0');
    expect(result.skin_edge_color).toBe('#000000');
  });

  test('getAllSkins returns an array of skins', async function () {
    const result = await getAllSkins();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

});
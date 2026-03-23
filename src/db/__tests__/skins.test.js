import {
  __restoreOpenDatabaseForTests,
  __setOpenDatabaseForTests,
  getSkinByID,
  getAllSkins,
} from '../db.js';
import {
  createFreshTestDatabase,
  getOpenDatabaseAsyncForTests,
  teardownTestDatabase,
} from './testDatabase.js';

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
  test('getSkinsByID returns seeded skin by ID', async function () {
    const result = await getSkinByID(1); // Classic skin
    expect(result.skin_name).toBe('Classic');
    expect(result.skin_description).toBe('Default skin');
    expect(result.skin_folder).toBe('classic');
    expect(result.owned).toBe(1);
    // expect(result.equipped).toBe(1);
  });


});
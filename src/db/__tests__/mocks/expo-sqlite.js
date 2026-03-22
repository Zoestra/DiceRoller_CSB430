/**
 * expo-sqlite Jest mock
 */

const mockTables = {
  user_state: [{ id: 1, points: 100, total_rolls: 0, active_set_id: null, dark_mode: 0 }],
  roll_history: [],
};

global._mockTables = mockTables;
global._resetMockTables = () => {
  mockTables.user_state[0] = { id: 1, points: 100, total_rolls: 0, active_set_id: null, dark_mode: 0 };
  mockTables.roll_history.splice(0);
};

module.exports = {
  openDatabaseAsync: jest.fn().mockResolvedValue({
    getFirstAsync: jest.fn((sql, params) => {
      if (sql.includes('user_state')) {
        const row = mockTables.user_state[0];
        return Promise.resolve(row ? { ...row } : undefined);
      }
      if (sql.includes('dice_sets') && sql.includes('active_set_id')) {
        const row = mockTables.user_state[0];
        return Promise.resolve(row ? { active_set_id: row.active_set_id } : undefined);
      }
      if (sql.includes('roll_history') && sql.includes('COUNT')) {
        const setId = params?.[0];
        const rows = mockTables.roll_history.filter((roll) => roll.set_id === setId);
        return Promise.resolve({
          total_rolls: rows.length,
          average: rows.length ? rows.reduce((sum, roll) => sum + roll.result, 0) / rows.length : 0,
          min_roll: rows.length ? Math.min(...rows.map((roll) => roll.result)) : 0,
          max_roll: rows.length ? Math.max(...rows.map((roll) => roll.result)) : 0,
        });
      }
      return Promise.resolve(undefined);
    }),
    getAllAsync: jest.fn((sql, params) => {
      if (sql.includes('roll_history') && sql.includes('GROUP BY')) {
        const setId = params?.[0];
        const rows = mockTables.roll_history.filter((roll) => roll.set_id === setId);
        const grouped = {};
        rows.forEach((roll) => {
          grouped[roll.result] = (grouped[roll.result] || 0) + 1;
        });

        return Promise.resolve(
          Object.entries(grouped).map(([result, count]) => ({
            result: parseInt(result, 10),
            count,
          }))
        );
      }

      if (sql.includes('roll_history')) {
        const setId = params?.[0];
        const limit = params?.[1];
        let rows = mockTables.roll_history.filter((roll) => roll.set_id === setId);
        rows = rows.slice(0, limit || rows.length);
        return Promise.resolve(rows.map((roll) => ({ ...roll })));
      }

      return Promise.resolve([]);
    }),
    runAsync: jest.fn((sql, params) => {
      if (sql.includes('UPDATE user_state')) {
        if (sql.includes('points = points +')) {
          mockTables.user_state[0].points += params[0];
        } else if (sql.includes('points = ?')) {
          mockTables.user_state[0].points = params[0];
        }

        if (sql.includes('total_rolls = total_rolls +')) {
          mockTables.user_state[0].total_rolls += params[0];
        }

        if (sql.includes('active_set_id = ?')) {
          mockTables.user_state[0].active_set_id = params[params.length - 1];
        }
        return Promise.resolve({});
      }

      if (sql.includes('INSERT INTO roll_history')) {
        const [setId, dieType, result] = params;
        mockTables.roll_history.push({
          id: mockTables.roll_history.length + 1,
          set_id: setId,
          die_type: dieType,
          result,
        });
        mockTables.user_state[0].total_rolls += 1;
        return Promise.resolve({});
      }

      if (sql.includes('DELETE FROM roll_history')) {
        mockTables.roll_history.splice(0);
        return Promise.resolve({});
      }

      return Promise.resolve({});
    }),
    execAsync: jest.fn(() => Promise.resolve()),
  }),
};

/**
 * Skins Database Queries
 *
 * Handles all queries related to skins table.
 *
 * ---
 * NOTE: This file is a placeholder. Implementation assigned to dallasWed.
 * See Issues: #24, #25, #26, #27, #39
 * This file was created with AI assistance (Qwen Code).
 * ---
 */

// TODO: Implement skin queries (Issues #24-27, #39)

import { getDB } from './db.js';

// Get all skins
export async function getAllSkins() {
    const database = await getDB();
    return await database.getAllAsync(
        'SELECT * FROM skins'
    );
}

// Get skin by ID
export async function getSkinBySetId(setId) {
  const database = await getDB();
  return await database.getFirstAsync(
    'SELECT s.skin_folder, s.skin_name, s.skin_fill_color, s.skin_edge_color, s.skin_description FROM dice_sets ds JOIN skins s ON ds.set_skin = s.id WHERE ds.id = ?',
<<<<<<< HEAD
    setId
=======
    [setId]
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
  );
}

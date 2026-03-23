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

// Get all skins, sorting owned sets to the top of the list
export async function getAllSkins() {
    const database = await getDB();
    return await database.getAllAsync(
        'SELECT * FROM skins ORDER BY owned DESC, skin_name ASC'
    );
}

// Get skin by ID
export async function getSkinByID(skinID) {
    const database = await getDB();
    return await database.getFirstAsync(
        'SELECT * FROM skins WHERE id = ?',
        skinID
    );
}

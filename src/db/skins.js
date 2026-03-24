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
export async function getSkinByID(skinID) {
    const database = await getDB();
    return await database.getFirstAsync(
        'SELECT * FROM skins WHERE id = ?',
        skinID
    );
}

// Add a new skin / texture combo
export async function addNewSkin() {

}

// Get skin by set ID
export async function getSkinBySetID(setID) {
    const database = await getDB();
    return await database.getFirstAsync(
        'SELECT s.skin_folder, s.skin_name FROM dice_sets ds JOIN skins s ON ds.set_skin = s.id WHERE ds.id = ?',
        setID
    );
}

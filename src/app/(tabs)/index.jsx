/**
 * Legacy tabs index route.
 *
 * Keeps compatibility by forwarding to the renamed Roll route.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { Redirect } from 'expo-router';

export default function IndexRedirectScreen() {
  return <Redirect href="/(tabs)/roll" />;
}

/**
 * Legacy tabs explore route.
 *
 * Keeps compatibility by forwarding to the renamed Stats route.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { Redirect } from 'expo-router';

export default function ExploreRedirectScreen() {
  return <Redirect href="/(tabs)/stats" />;
}

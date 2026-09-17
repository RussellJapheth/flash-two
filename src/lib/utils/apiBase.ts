/**
 * Sync API origin.
 *
 * `PUBLIC_API_BASE_URL` is injected at build time from `.env` and baked into
 * the client bundle, so every call site resolves through this module instead of
 * embedding a hardcoded host.
 */
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const API_ORIGIN = PUBLIC_API_BASE_URL;
export const API_BASE_URL = `${API_ORIGIN}/api/flashcards`;

/**
 * @typedef {'cline' | 'cursor' | 'roo' | 'windsurf'} RulesProfile
 */

/**
 * Available rules profiles for project initialization and rules command
 *
 * ⚠️  SINGLE SOURCE OF TRUTH: This is the authoritative list of all supported rules profiles.
 * This constant is used directly throughout the codebase (previously aliased as PROFILE_NAMES).
 *
 * @type {RulesProfile[]}
 * @description Defines possible rules profile sets:
 * - cline: Cline IDE rules
 * - cursor: Cursor IDE rules (default)
 * - roo: Roo Code IDE rules
 * - windsurf: Windsurf IDE rules
 *
 * To add a new rules profile:
 * 1. Add the profile name to this array
 * 2. Create a profile file in scripts/profiles/{profile}.js
 * 3. Export it as {profile}Profile in scripts/profiles/index.js
 */
export const RULES_PROFILES = ['cline', 'cursor', 'roo', 'windsurf'];

/**
 * Check if a given rules profile is valid
 * @param {string} rulesProfile - The rules profile to check
 * @returns {boolean} True if the rules profile is valid, false otherwise
 */
export function isValidRulesProfile(rulesProfile) {
	return RULES_PROFILES.includes(rulesProfile);
}

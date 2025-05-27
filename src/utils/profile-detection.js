/**
 * Profile Detection Utility
 * Helper functions to detect existing profiles in a project
 */
import fs from 'fs';
import path from 'path';
import { RULE_PROFILES } from '../constants/profiles.js';
import { getRulesProfile } from './rule-transformer.js';

/**
 * Detect which profiles are currently installed in the project
 * @param {string} projectRoot - Project root directory
 * @returns {string[]} Array of installed profile names
 */
export function getInstalledProfiles(projectRoot) {
	const installedProfiles = [];

	for (const profileName of RULE_PROFILES) {
		const profileConfig = getRulesProfile(profileName);
		if (!profileConfig) continue;

		// Check if the profile directory exists
		const profileDir = path.join(projectRoot, profileConfig.profileDir);
		const rulesDir = path.join(projectRoot, profileConfig.rulesDir);

		// A profile is considered installed if either the profile dir or rules dir exists
		if (fs.existsSync(profileDir) || fs.existsSync(rulesDir)) {
			installedProfiles.push(profileName);
		}
	}

	return installedProfiles;
}

/**
 * Check if removing the specified profiles would result in no profiles remaining
 * @param {string} projectRoot - Project root directory
 * @param {string[]} profilesToRemove - Array of profile names to remove
 * @returns {boolean} True if removal would result in no profiles remaining
 */
export function wouldRemovalLeaveNoProfiles(projectRoot, profilesToRemove) {
	const installedProfiles = getInstalledProfiles(projectRoot);
	const remainingProfiles = installedProfiles.filter(
		(profile) => !profilesToRemove.includes(profile)
	);

	return remainingProfiles.length === 0 && installedProfiles.length > 0;
}

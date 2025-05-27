/**
 * Profiles Utility
 * Consolidated utilities for profile detection, setup, and summary generation
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { log } from '../../scripts/modules/utils.js';
import { getRulesProfile } from './rule-transformer.js';
import { RULE_PROFILES } from '../constants/profiles.js';

// =============================================================================
// PROFILE DETECTION
// =============================================================================

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

// =============================================================================
// PROFILE SETUP
// =============================================================================

/**
 * Get the display name for a profile
 */
function getProfileDisplayName(name) {
	const profile = getRulesProfile(name);
	return profile?.displayName || name.charAt(0).toUpperCase() + name.slice(1);
}

// Dynamically generate availableRulesProfiles from RULE_PROFILES
const availableRulesProfiles = RULE_PROFILES.map((name) => {
	const displayName = getProfileDisplayName(name);
	return {
		name: displayName,
		value: name
	};
});

/**
 * Launches an interactive prompt for selecting which rule profiles to include in your project.
 *
 * This function dynamically lists all available profiles (from RULE_PROFILES) and presents them as checkboxes.
 * The user must select at least one profile (no defaults are pre-selected). The result is an array of selected profile names.
 *
 * Used by both project initialization (init) and the CLI 'task-master rules setup' command.
 *
 * @returns {Promise<string[]>} Array of selected profile names (e.g., ['cursor', 'windsurf'])
 */
export async function runInteractiveRulesSetup() {
	console.log(
		chalk.cyan(
			'\nRule profiles help enforce best practices and conventions for Task Master.'
		)
	);
	const rulesProfilesQuestion = {
		type: 'checkbox',
		name: 'rulesProfiles',
		message: 'Which tools would you like rule profiles included for?',
		choices: availableRulesProfiles,
		validate: (input) => input.length > 0 || 'You must select at least one.'
	};
	const { rulesProfiles } = await inquirer.prompt([rulesProfilesQuestion]);
	return rulesProfiles;
}

// =============================================================================
// PROFILE SUMMARY
// =============================================================================

/**
 * Generate appropriate summary message for a profile based on its type
 * @param {string} profileName - Name of the profile
 * @param {Object} addResult - Result object with success/failed counts
 * @returns {string} Formatted summary message
 */
export function generateProfileSummary(profileName, addResult) {
	const profileConfig = getRulesProfile(profileName);
	const isSimpleProfile = Object.keys(profileConfig.fileMap).length === 0;

	if (isSimpleProfile) {
		// Simple profiles like Claude and Codex only copy AGENTS.md
		const targetFileName = profileName === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';
		return `Summary for ${profileName}: Integration guide copied to ${targetFileName}`;
	} else {
		return `Summary for ${profileName}: ${addResult.success} rules added, ${addResult.failed} failed.`;
	}
}

/**
 * Generate appropriate summary message for profile removal
 * @param {string} profileName - Name of the profile
 * @param {Object} removeResult - Result object from removal operation
 * @returns {string} Formatted summary message
 */
export function generateProfileRemovalSummary(profileName, removeResult) {
	const profileConfig = getRulesProfile(profileName);
	const isSimpleProfile = Object.keys(profileConfig.fileMap).length === 0;

	if (removeResult.skipped) {
		return `Summary for ${profileName}: Skipped (default or protected files)`;
	}

	if (removeResult.error && !removeResult.success) {
		return `Summary for ${profileName}: Failed to remove - ${removeResult.error}`;
	}

	if (isSimpleProfile) {
		// Simple profiles like Claude and Codex only have an integration guide
		const targetFileName = profileName === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';
		return `Summary for ${profileName}: Integration guide (${targetFileName}) removed`;
	} else {
		// Full profiles have rules directories and potentially MCP configs
		let summary = `Summary for ${profileName}: Rules directory removed`;
		if (removeResult.notice) {
			summary += ` (${removeResult.notice})`;
		}
		return summary;
	}
}

/**
 * Categorize profiles and generate final summary statistics
 * @param {Array} addResults - Array of add result objects
 * @returns {Object} Object with categorized profiles and totals
 */
export function categorizeProfileResults(addResults) {
	const successfulProfiles = [];
	const simpleProfiles = [];
	let totalSuccess = 0;
	let totalFailed = 0;

	addResults.forEach((r) => {
		totalSuccess += r.success;
		totalFailed += r.failed;

		const profileConfig = getRulesProfile(r.profileName);
		const isSimpleProfile = Object.keys(profileConfig.fileMap).length === 0;

		if (isSimpleProfile) {
			// Simple profiles are successful if they completed without error
			simpleProfiles.push(r.profileName);
		} else if (r.success > 0) {
			// Full profiles are successful if they added rules
			successfulProfiles.push(r.profileName);
		}
	});

	return {
		successfulProfiles,
		simpleProfiles,
		allSuccessfulProfiles: [...successfulProfiles, ...simpleProfiles],
		totalSuccess,
		totalFailed
	};
}

/**
 * Categorize removal results and generate final summary statistics
 * @param {Array} removalResults - Array of removal result objects
 * @returns {Object} Object with categorized removal results
 */
export function categorizeRemovalResults(removalResults) {
	const successfulRemovals = [];
	const skippedRemovals = [];
	const failedRemovals = [];
	const removalsWithNotices = [];

	removalResults.forEach((result) => {
		if (result.success) {
			successfulRemovals.push(result.profileName);
		} else if (result.skipped) {
			skippedRemovals.push(result.profileName);
		} else if (result.error) {
			failedRemovals.push(result);
		}

		if (result.notice) {
			removalsWithNotices.push(result);
		}
	});

	return {
		successfulRemovals,
		skippedRemovals,
		failedRemovals,
		removalsWithNotices
	};
}

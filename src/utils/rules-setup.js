import readline from 'readline';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { log } from '../../scripts/modules/utils.js';
import { getRulesProfile } from './rule-transformer.js';
import { RULES_PROFILES } from '../constants/profiles.js';

// Dynamically generate availableRulesProfiles from RULES_PROFILES
const availableRulesProfiles = RULES_PROFILES.map((name) => {
	const displayName = getProfileDisplayName(name);
	return {
		name: name === 'cursor' ? `${displayName} (default)` : displayName,
		value: name
	};
});

/**
 * Get the display name for a profile
 */
function getProfileDisplayName(name) {
	const profile = getRulesProfile(name);
	return profile?.profileName || name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Runs the interactive rules setup flow (profile rules selection only)
 * @returns {Promise<string[]>} The selected profile rules
 */
/**
 * Launches an interactive prompt for selecting which profile rules to include in your project.
 *
 * This function dynamically lists all available profiles (from RULES_PROFILES) and presents them as checkboxes.
 * The user must select at least one profile (default: cursor). The result is an array of selected profile names.
 *
 * Used by both project initialization (init) and the CLI 'task-master rules setup' command to ensure DRY, consistent UX.
 *
 * @returns {Promise<string[]>} Array of selected profile rule names (e.g., ['cursor', 'windsurf'])
 */
export async function runInteractiveRulesSetup() {
	console.log(
		chalk.cyan(
			'\nRules help enforce best practices and conventions for Task Master.'
		)
	);
	const rulesProfilesQuestion = {
		type: 'checkbox',
		name: 'rulesProfiles',
		message: 'Which IDEs would you like rules included for?',
		choices: availableRulesProfiles,
		default: ['cursor'],
		validate: (input) => input.length > 0 || 'You must select at least one.'
	};
	const { rulesProfiles } = await inquirer.prompt([rulesProfilesQuestion]);
	return rulesProfiles;
}

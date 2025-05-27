import chalk from 'chalk';
import boxen from 'boxen';

/**
 * Confirm removing profile rules (destructive operation)
 * @param {string[]} profiles - Array of profile names to remove
 * @returns {Promise<boolean>} - Promise resolving to true if user confirms, false otherwise
 */
async function confirmProfilesRemove(profiles) {
	const profileList = profiles
		.map((b) => b.charAt(0).toUpperCase() + b.slice(1))
		.join(', ');
	console.log(
		boxen(
			chalk.yellow(
				`WARNING: This will permanently delete all rules and configuration for: ${profileList}.
This will remove the entire .[profile] directory for each selected profile.\n\nAre you sure you want to proceed?`
			),
			{ padding: 1, borderColor: 'yellow', borderStyle: 'round' }
		)
	);
	const inquirer = await import('inquirer');
	const { confirm } = await inquirer.default.prompt([
		{
			type: 'confirm',
			name: 'confirm',
			message: 'Type y to confirm, or n to abort:',
			default: false
		}
	]);
	return confirm;
}

/**
 * Confirm removing ALL remaining profile rules (extremely critical operation)
 * @param {string[]} profiles - Array of profile names to remove
 * @param {string[]} remainingProfiles - Array of profiles that would be left after removal
 * @returns {Promise<boolean>} - Promise resolving to true if user confirms, false otherwise
 */
async function confirmRemoveAllRemainingProfiles(profiles, remainingProfiles) {
	const profileList = profiles
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(', ');

	console.log(
		boxen(
			chalk.red.bold(
				`⚠️  CRITICAL WARNING: REMOVING ALL RULES PROFILES ⚠️\n\n` +
					`You are about to remove: ${profileList}\n` +
					`This will leave your project with NO rules profiles remaining!\n\n` +
					`This could significantly impact functionality and development experience:\n` +
					`• Loss of IDE-specific rules and conventions\n` +
					`• No MCP configurations for AI assistants\n` +
					`• Reduced development guidance and best practices\n\n` +
					`Are you absolutely sure you want to proceed?`
			),
			{
				padding: 1,
				borderColor: 'red',
				borderStyle: 'double',
				title: '🚨 CRITICAL OPERATION',
				titleAlignment: 'center'
			}
		)
	);

	const inquirer = await import('inquirer');
	const { confirm } = await inquirer.default.prompt([
		{
			type: 'confirm',
			name: 'confirm',
			message: 'Type y to confirm removing ALL rules profiles, or n to abort:',
			default: false
		}
	]);
	return confirm;
}

export { confirmProfilesRemove, confirmRemoveAllRemainingProfiles };

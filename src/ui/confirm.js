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

export { confirmProfilesRemove };

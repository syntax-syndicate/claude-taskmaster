/**
 * tools/rules.js
 * Tool to add or remove rules from a project (MCP server)
 */

import { z } from 'zod';
import {
	createErrorResponse,
	handleApiResult,
	withNormalizedProjectRoot
} from './utils.js';
import { rulesDirect } from '../core/direct-functions/rules.js';
import { RULES_PROFILES } from '../../../src/constants/profiles.js';

/**
 * Register the rules tool with the MCP server
 * @param {Object} server - FastMCP server instance
 */
export function registerRulesTool(server) {
	server.addTool({
		name: 'rules',
		description:
			'Add or remove rules profiles from the project.',
		parameters: z.object({
			action: z
				.enum(['add', 'remove'])
				.describe('Whether to add or remove rules profiles.'),
			profiles: z
				.array(z.enum(RULES_PROFILES))
				.min(1)
				.describe(
					`List of rules profiles to add or remove (e.g., [\"cursor\", \"roo\"]). Available options: ${RULES_PROFILES.join(', ')}`
				),
			projectRoot: z
				.string()
				.describe(
					'The root directory of the project. Must be an absolute path.'
				)
		}),
		execute: withNormalizedProjectRoot(async (args, { log, session }) => {
			try {
				log.info(
					`[rules tool] Executing action: ${args.action} for profiles: ${args.profiles.join(', ')} in ${args.projectRoot}`
				);
				const result = await rulesDirect(args, log, { session });
				return handleApiResult(result, log);
			} catch (error) {
				log.error(`[rules tool] Error: ${error.message}`);
				return createErrorResponse(error.message, { details: error.stack });
			}
		})
	});
}

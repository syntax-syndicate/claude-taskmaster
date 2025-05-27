// Cursor conversion profile for rule-transformer
import { createProfile, COMMON_TOOL_MAPPINGS } from './base-profile.js';

// Create cursor profile using the base factory
const cursorProfile = createProfile({
	name: 'cursor',
	displayName: 'Cursor',
	url: 'cursor.so',
	docsUrl: 'docs.cursor.com',
	profileDir: '.cursor',
	rulesDir: '.cursor/rules',
	mcpConfig: true,
	mcpConfigName: 'mcp.json',
	fileExtension: '.mdc',
	targetExtension: '.mdc', // Cursor keeps .mdc extension
	toolMappings: COMMON_TOOL_MAPPINGS.STANDARD,
	customFileMap: {
		'cursor_rules.mdc': 'cursor_rules.mdc' // Keep the same name for cursor
	}
});

// Export all the standard profile properties
export const {
	conversionConfig,
	fileMap,
	globalReplacements,
	profileName,
	displayName,
	profileDir,
	rulesDir,
	mcpConfig,
	mcpConfigName,
	mcpConfigPath,
	getTargetRuleFilename
} = cursorProfile;

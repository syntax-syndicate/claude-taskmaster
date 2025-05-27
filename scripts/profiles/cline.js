// Cline conversion profile for rule-transformer
import { createProfile, COMMON_TOOL_MAPPINGS } from './base-profile.js';

// Create cline profile using the base factory
const clineProfile = createProfile({
	name: 'cline',
	displayName: 'Cline',
	url: 'cline.bot',
	docsUrl: 'docs.cline.bot',
	profileDir: '.clinerules',
	rulesDir: '.clinerules',
	mcpConfig: false,
	mcpConfigName: 'cline_mcp_settings.json',
	fileExtension: '.mdc',
	targetExtension: '.md',
	toolMappings: COMMON_TOOL_MAPPINGS.ROO_STYLE, // Cline uses transformed tool names
	customFileMap: {
		'cursor_rules.mdc': 'cline_rules.md'
	}
});

// Export all the standard profile properties
export const {
	conversionConfig,
	fileMap,
	globalReplacements,
	profileName,
	profileDir,
	rulesDir,
	mcpConfig,
	mcpConfigName,
	mcpConfigPath,
	getTargetRuleFilename
} = clineProfile;

// Trae conversion profile for rule-transformer
import { createProfile, COMMON_TOOL_MAPPINGS } from './base-profile.js';

// Create trae profile using the base factory
const traeProfile = createProfile({
	name: 'trae',
	displayName: 'Trae',
	url: 'trae.ai',
	docsUrl: 'docs.trae.ai',
	profileDir: '.trae',
	rulesDir: '.trae/rules',
	mcpConfig: false,
	mcpConfigName: 'trae_mcp_settings.json',
	fileExtension: '.mdc',
	targetExtension: '.md',
	toolMappings: COMMON_TOOL_MAPPINGS.STANDARD // Trae uses standard tool names
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
} = traeProfile;

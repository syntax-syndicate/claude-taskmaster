// Windsurf conversion profile for rule-transformer
import { createProfile, COMMON_TOOL_MAPPINGS } from './base-profile.js';

// Create windsurf profile using the base factory
const windsurfProfile = createProfile({
	name: 'windsurf',
	displayName: 'Windsurf',
	url: 'windsurf.com',
	docsUrl: 'docs.windsurf.com',
	profileDir: '.windsurf',
	rulesDir: '.windsurf/rules',
	mcpConfig: true,
	mcpConfigName: 'mcp.json',
	fileExtension: '.mdc',
	targetExtension: '.md',
	toolMappings: COMMON_TOOL_MAPPINGS.ROO_STYLE // Windsurf uses transformed tool names
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
} = windsurfProfile;

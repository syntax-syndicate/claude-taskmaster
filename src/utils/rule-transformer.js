/**
 * Rule Transformer Module
 * Handles conversion of Cursor rules to profile rules
 *
 * This module procedurally generates .{profile}/rules files from assets/rules files,
 * eliminating the need to maintain both sets of files manually.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../../scripts/modules/utils.js';

// Import the shared MCP configuration helper
import { setupMCPConfiguration } from './mcp-config-setup.js';

// Import profile constants (single source of truth)
import { RULES_PROFILES } from '../constants/profiles.js';

// --- Profile Imports ---
import * as profilesModule from '../../scripts/profiles/index.js';

export function isValidProfile(profile) {
	return RULES_PROFILES.includes(profile);
}

/**
 * Get rules profile by name
 * @param {string} name - Profile name
 * @returns {Object|null} Profile object or null if not found
 */
export function getRulesProfile(name) {
	if (!isValidProfile(name)) {
		return null;
	}

	// Get the profile from the imported profiles module
	const profileKey = `${name}Profile`;
	const profile = profilesModule[profileKey];

	if (!profile) {
		throw new Error(
			`Profile not found: static import missing for '${name}'. Valid profiles: ${RULES_PROFILES.join(', ')}`
		);
	}

	return profile;
}

/**
 * Replace basic Cursor terms with profile equivalents
 */
function replaceBasicTerms(content, conversionConfig) {
	let result = content;

	// Apply profile term replacements
	conversionConfig.profileTerms.forEach((pattern) => {
		if (typeof pattern.to === 'function') {
			result = result.replace(pattern.from, pattern.to);
		} else {
			result = result.replace(pattern.from, pattern.to);
		}
	});

	// Apply file extension replacements
	conversionConfig.fileExtensions.forEach((pattern) => {
		result = result.replace(pattern.from, pattern.to);
	});

	return result;
}

/**
 * Replace Cursor tool references with profile tool equivalents
 */
function replaceToolReferences(content, conversionConfig) {
	let result = content;

	// Basic pattern for direct tool name replacements
	const toolNames = conversionConfig.toolNames;
	const toolReferencePattern = new RegExp(
		`\\b(${Object.keys(toolNames).join('|')})\\b`,
		'g'
	);

	// Apply direct tool name replacements
	result = result.replace(toolReferencePattern, (match, toolName) => {
		return toolNames[toolName] || toolName;
	});

	// Apply contextual tool replacements
	conversionConfig.toolContexts.forEach((pattern) => {
		result = result.replace(pattern.from, pattern.to);
	});

	// Apply tool group replacements
	conversionConfig.toolGroups.forEach((pattern) => {
		result = result.replace(pattern.from, pattern.to);
	});

	return result;
}

/**
 * Update documentation URLs to point to profile documentation
 */
function updateDocReferences(content, conversionConfig) {
	let result = content;

	// Apply documentation URL replacements
	conversionConfig.docUrls.forEach((pattern) => {
		if (typeof pattern.to === 'function') {
			result = result.replace(pattern.from, pattern.to);
		} else {
			result = result.replace(pattern.from, pattern.to);
		}
	});

	return result;
}

/**
 * Update file references in markdown links
 */
function updateFileReferences(content, conversionConfig) {
	const { pathPattern, replacement } = conversionConfig.fileReferences;
	return content.replace(pathPattern, replacement);
}

/**
 * Main transformation function that applies all conversions
 */
function transformCursorToProfileRules(
	content,
	conversionConfig,
	globalReplacements = []
) {
	// Apply all transformations in appropriate order
	let result = content;
	result = replaceBasicTerms(result, conversionConfig);
	result = replaceToolReferences(result, conversionConfig);
	result = updateDocReferences(result, conversionConfig);
	result = updateFileReferences(result, conversionConfig);

	// Apply any global/catch-all replacements from the profile
	// Super aggressive failsafe pass to catch any variations we might have missed
	// This ensures critical transformations are applied even in contexts we didn't anticipate
	globalReplacements.forEach((pattern) => {
		if (typeof pattern.to === 'function') {
			result = result.replace(pattern.from, pattern.to);
		} else {
			result = result.replace(pattern.from, pattern.to);
		}
	});

	return result;
}

/**
 * Convert a single Cursor rule file to profile rule format
 */
export function convertRuleToProfileRule(sourcePath, targetPath, profile) {
	const { conversionConfig, globalReplacements } = profile;
	try {
		log(
			'debug',
			`Converting Cursor rule ${path.basename(sourcePath)} to ${profile.profileName} rule ${path.basename(targetPath)}`
		);

		// Read source content
		const content = fs.readFileSync(sourcePath, 'utf8');

		// Transform content
		const transformedContent = transformCursorToProfileRules(
			content,
			conversionConfig,
			globalReplacements
		);

		// Ensure target directory exists
		const targetDir = path.dirname(targetPath);
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}

		// Write transformed content
		fs.writeFileSync(targetPath, transformedContent);
		log(
			'debug',
			`Successfully converted ${path.basename(sourcePath)} to ${path.basename(targetPath)}`
		);

		return true;
	} catch (error) {
		log(
			'error',
			`Failed to convert rule file ${path.basename(sourcePath)}: ${error.message}`
		);
		return false;
	}
}

/**
 * Convert all Cursor rules to profile rules for a specific profile
 */
export function convertAllRulesToProfileRules(projectDir, profile) {
	const sourceDir = fileURLToPath(
		new URL('../../assets/rules', import.meta.url)
	);
	const targetDir = path.join(projectDir, profile.rulesDir);

	// Ensure target directory exists
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}

	// Setup MCP configuration if enabled
	if (profile.mcpConfig !== false) {
		setupMCPConfiguration(projectDir, profile.mcpConfigPath);
	}

	let success = 0;
	let failed = 0;

	// Use fileMap to determine which files to copy
	const sourceFiles = Object.keys(profile.fileMap);

	for (const sourceFile of sourceFiles) {
		try {
			const sourcePath = path.join(sourceDir, sourceFile);

			// Check if source file exists
			if (!fs.existsSync(sourcePath)) {
				log(
					'warn',
					`[Rule Transformer] Source file not found: ${sourceFile}, skipping`
				);
				continue;
			}

			const targetFilename = profile.getTargetRuleFilename
				? profile.getTargetRuleFilename(sourceFile)
				: sourceFile;
			const targetPath = path.join(targetDir, targetFilename);

			// Read source content
			let content = fs.readFileSync(sourcePath, 'utf8');

			// Apply transformations
			content = transformCursorToProfileRules(
				content,
				profile.conversionConfig,
				profile.globalReplacements
			);

			// Write to target
			fs.writeFileSync(targetPath, content, 'utf8');
			success++;

			log(
				'debug',
				`[Rule Transformer] Converted ${sourceFile} -> ${targetFilename} for ${profile.profileName}`
			);
		} catch (error) {
			failed++;
			log(
				'error',
				`[Rule Transformer] Failed to convert ${sourceFile} for ${profile.profileName}: ${error.message}`
			);
		}
	}

	// Call post-processing hook if defined (e.g., for Roo's rules-*mode* folders)
	if (typeof profile.onPostConvertRulesProfile === 'function') {
		profile.onPostConvertRulesProfile(projectDir);
	}

	return { success, failed };
}

/**
 * Remove profile rules for a specific profile
 * @param {string} projectDir - Target project directory
 * @param {Object} profile - Profile configuration
 * @returns {Object} Result object
 */
export function removeProfileRules(projectDir, profile) {
	const targetDir = path.join(projectDir, profile.rulesDir);
	const profileDir = path.join(projectDir, profile.profileDir);
	const mcpConfigPath = path.join(projectDir, profile.mcpConfigPath);

	let result = {
		profileName: profile.profileName,
		success: false,
		skipped: false,
		error: null
	};

	try {
		// Remove rules directory
		if (fs.existsSync(targetDir)) {
			fs.rmSync(targetDir, { recursive: true, force: true });
			log('debug', `[Rule Transformer] Removed rules directory: ${targetDir}`);
		}

		// Remove MCP config if it exists
		if (fs.existsSync(mcpConfigPath)) {
			fs.rmSync(mcpConfigPath, { force: true });
			log('debug', `[Rule Transformer] Removed MCP config: ${mcpConfigPath}`);
		}

		// Call removal hook if defined
		if (typeof profile.onRemoveRulesProfile === 'function') {
			profile.onRemoveRulesProfile(projectDir);
		}

		// Remove profile directory if empty
		if (fs.existsSync(profileDir)) {
			const remaining = fs.readdirSync(profileDir);
			if (remaining.length === 0) {
				fs.rmSync(profileDir, { recursive: true, force: true });
				log(
					'debug',
					`[Rule Transformer] Removed empty profile directory: ${profileDir}`
				);
			}
		}

		result.success = true;
		log(
			'debug',
			`[Rule Transformer] Successfully removed ${profile.profileName} rules from ${projectDir}`
		);
	} catch (error) {
		result.error = error.message;
		log(
			'error',
			`[Rule Transformer] Failed to remove ${profile.profileName} rules: ${error.message}`
		);
	}

	return result;
}

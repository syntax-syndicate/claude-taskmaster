import {
	isValidProfile,
	getRulesProfile
} from '../../src/utils/rule-transformer.js';
import { RULES_PROFILES } from '../../src/constants/profiles.js';

describe('Rule Transformer - General', () => {
	describe('Profile Configuration Validation', () => {
		it('should use RULES_PROFILES as the single source of truth', () => {
			// Ensure RULES_PROFILES is properly defined and contains expected profiles
			expect(Array.isArray(RULES_PROFILES)).toBe(true);
			expect(RULES_PROFILES.length).toBeGreaterThan(0);
			
			// Verify expected profiles are present
			const expectedProfiles = ['cline', 'cursor', 'roo', 'windsurf'];
			expectedProfiles.forEach(profile => {
				expect(RULES_PROFILES).toContain(profile);
			});
		});

		it('should validate profiles correctly with isValidProfile', () => {
			// Test valid profiles
			RULES_PROFILES.forEach((profile) => {
				expect(isValidProfile(profile)).toBe(true);
			});

			// Test invalid profiles
			expect(isValidProfile('invalid')).toBe(false);
			expect(isValidProfile('')).toBe(false);
			expect(isValidProfile(null)).toBe(false);
			expect(isValidProfile(undefined)).toBe(false);
		});

		it('should return correct rules profile with getRulesProfile', () => {
			// Test valid profiles
			RULES_PROFILES.forEach((profile) => {
				const profileConfig = getRulesProfile(profile);
				expect(profileConfig).toBeDefined();
				expect(profileConfig.profileName.toLowerCase()).toBe(profile);
			});

			// Test invalid profile - should return null
			expect(getRulesProfile('invalid')).toBeNull();
		});
	});

	describe('Profile Structure', () => {
		it('should have all required properties for each profile', () => {
			RULES_PROFILES.forEach((profile) => {
				const profileConfig = getRulesProfile(profile);

				// Check required properties
				expect(profileConfig).toHaveProperty('profileName');
				expect(profileConfig).toHaveProperty('conversionConfig');
				expect(profileConfig).toHaveProperty('fileMap');
				expect(profileConfig).toHaveProperty('rulesDir');
				expect(profileConfig).toHaveProperty('profileDir');

				// Check that conversionConfig has required structure
				expect(profileConfig.conversionConfig).toHaveProperty('profileTerms');
				expect(profileConfig.conversionConfig).toHaveProperty('toolNames');
				expect(profileConfig.conversionConfig).toHaveProperty('toolContexts');
				expect(profileConfig.conversionConfig).toHaveProperty('toolGroups');
				expect(profileConfig.conversionConfig).toHaveProperty('docUrls');
				expect(profileConfig.conversionConfig).toHaveProperty('fileReferences');

				// Verify arrays are actually arrays
				expect(Array.isArray(profileConfig.conversionConfig.profileTerms)).toBe(
					true
				);
				expect(typeof profileConfig.conversionConfig.toolNames).toBe('object');
				expect(Array.isArray(profileConfig.conversionConfig.toolContexts)).toBe(
					true
				);
				expect(Array.isArray(profileConfig.conversionConfig.toolGroups)).toBe(
					true
				);
				expect(Array.isArray(profileConfig.conversionConfig.docUrls)).toBe(
					true
				);
			});
		});

		it('should have valid fileMap with required files for each profile', () => {
			const expectedFiles = ['cursor_rules.mdc', 'dev_workflow.mdc', 'self_improve.mdc', 'taskmaster.mdc'];
			
			RULES_PROFILES.forEach((profile) => {
				const profileConfig = getRulesProfile(profile);

				// Check that fileMap exists and is an object
				expect(profileConfig.fileMap).toBeDefined();
				expect(typeof profileConfig.fileMap).toBe('object');
				expect(profileConfig.fileMap).not.toBeNull();

				// Check that fileMap is not empty
				const fileMapKeys = Object.keys(profileConfig.fileMap);
				expect(fileMapKeys.length).toBeGreaterThan(0);

				// Check that all expected source files are defined in fileMap
				expectedFiles.forEach(expectedFile => {
					expect(fileMapKeys).toContain(expectedFile);
					expect(typeof profileConfig.fileMap[expectedFile]).toBe('string');
					expect(profileConfig.fileMap[expectedFile].length).toBeGreaterThan(0);
				});

				// Verify fileMap has exactly the expected files
				expect(fileMapKeys.sort()).toEqual(expectedFiles.sort());
			});
		});
	});

	describe('MCP Configuration Properties', () => {
		it('should have all required MCP properties for each profile', () => {
			RULES_PROFILES.forEach((profile) => {
				const profileConfig = getRulesProfile(profile);

				// Check MCP-related properties exist
				expect(profileConfig).toHaveProperty('mcpConfig');
				expect(profileConfig).toHaveProperty('mcpConfigName');
				expect(profileConfig).toHaveProperty('mcpConfigPath');

				// Check types
				expect(typeof profileConfig.mcpConfig).toBe('boolean');
				expect(typeof profileConfig.mcpConfigName).toBe('string');
				expect(typeof profileConfig.mcpConfigPath).toBe('string');

				// Check that mcpConfigPath is properly constructed
				expect(profileConfig.mcpConfigPath).toBe(
					`${profileConfig.profileDir}/${profileConfig.mcpConfigName}`
				);
			});
		});

		it('should have correct MCP configuration for each profile', () => {
			const expectedConfigs = {
				cursor: {
					mcpConfig: true,
					mcpConfigName: 'mcp.json',
					expectedPath: '.cursor/mcp.json'
				},
				windsurf: {
					mcpConfig: true,
					mcpConfigName: 'mcp.json',
					expectedPath: '.windsurf/mcp.json'
				},
				roo: {
					mcpConfig: true,
					mcpConfigName: 'mcp.json',
					expectedPath: '.roo/mcp.json'
				},
				cline: {
					mcpConfig: false,
					mcpConfigName: 'cline_mcp_settings.json',
					expectedPath: '.clinerules/cline_mcp_settings.json'
				}
			};

			RULES_PROFILES.forEach((profile) => {
				const profileConfig = getRulesProfile(profile);
				const expected = expectedConfigs[profile];

				expect(profileConfig.mcpConfig).toBe(expected.mcpConfig);
				expect(profileConfig.mcpConfigName).toBe(expected.mcpConfigName);
				expect(profileConfig.mcpConfigPath).toBe(expected.expectedPath);
			});
		});

		it('should have consistent profileDir and mcpConfigPath relationship', () => {
			RULES_PROFILES.forEach((profile) => {
				const profileConfig = getRulesProfile(profile);

				// The mcpConfigPath should start with the profileDir
				expect(profileConfig.mcpConfigPath).toMatch(
					new RegExp(`^${profileConfig.profileDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`)
				);

				// The mcpConfigPath should end with the mcpConfigName
				expect(profileConfig.mcpConfigPath).toMatch(
					new RegExp(`${profileConfig.mcpConfigName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
				);
			});
		});

		it('should have unique profile directories', () => {
			const profileDirs = RULES_PROFILES.map((profile) => {
				const profileConfig = getRulesProfile(profile);
				return profileConfig.profileDir;
			});

			const uniqueProfileDirs = [...new Set(profileDirs)];
			expect(uniqueProfileDirs).toHaveLength(profileDirs.length);
		});

		it('should have unique MCP config paths', () => {
			const mcpConfigPaths = RULES_PROFILES.map((profile) => {
				const profileConfig = getRulesProfile(profile);
				return profileConfig.mcpConfigPath;
			});

			const uniqueMcpConfigPaths = [...new Set(mcpConfigPaths)];
			expect(uniqueMcpConfigPaths).toHaveLength(mcpConfigPaths.length);
		});
	});
});

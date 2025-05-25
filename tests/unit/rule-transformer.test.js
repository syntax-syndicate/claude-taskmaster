import {
	BRAND_PROFILES,
	BRAND_NAMES,
	isValidBrand,
	getBrandProfile
} from '../../src/utils/rule-transformer.js';
import { BRAND_RULE_OPTIONS } from '../../src/constants/rules.js';

describe('Rule Transformer - General', () => {
	describe('Brand Configuration Validation', () => {
		it('should have BRAND_PROFILES that match BRAND_RULE_OPTIONS', () => {
			// Ensure BRAND_PROFILES keys match the authoritative list from constants/rules.js
			const profileKeys = Object.keys(BRAND_PROFILES).sort();
			const ruleOptions = [...BRAND_RULE_OPTIONS].sort();
			
			expect(profileKeys).toEqual(ruleOptions);
		});

		it('should have BRAND_NAMES derived from BRAND_PROFILES', () => {
			const expectedNames = Object.keys(BRAND_PROFILES);
			expect(BRAND_NAMES).toEqual(expectedNames);
		});

		it('should validate brands correctly with isValidBrand', () => {
			// Test valid brands
			BRAND_RULE_OPTIONS.forEach(brand => {
				expect(isValidBrand(brand)).toBe(true);
			});

			// Test invalid brands
			expect(isValidBrand('invalid')).toBe(false);
			expect(isValidBrand('vscode')).toBe(false);
			expect(isValidBrand('')).toBe(false);
			expect(isValidBrand(null)).toBe(false);
			expect(isValidBrand(undefined)).toBe(false);
		});

		it('should return correct brand profiles with getBrandProfile', () => {
			BRAND_RULE_OPTIONS.forEach(brand => {
				const profile = getBrandProfile(brand);
				expect(profile).toBeDefined();
				expect(profile.brandName.toLowerCase()).toBe(brand);
			});

			// Test invalid brand
			expect(getBrandProfile('invalid')).toBeUndefined();
		});
	});

	describe('Brand Profile Structure', () => {
		it('should have all required properties for each brand profile', () => {
			BRAND_RULE_OPTIONS.forEach(brand => {
				const profile = BRAND_PROFILES[brand];
				
				// Check required properties
				expect(profile).toHaveProperty('brandName');
				expect(profile).toHaveProperty('conversionConfig');
				expect(profile).toHaveProperty('fileMap');
				expect(profile).toHaveProperty('rulesDir');
				expect(profile).toHaveProperty('brandDir');
				
				// Verify brand name matches (brandName is capitalized in profiles)
				expect(profile.brandName.toLowerCase()).toBe(brand);
			});
		});
	});
}); 
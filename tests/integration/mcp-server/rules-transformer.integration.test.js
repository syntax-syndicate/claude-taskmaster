// Integration tests for rules transformer functions in MCP server context
import { jest } from '@jest/globals';
import {
	convertAllRulesToBrandRules,
	removeBrandRules
} from '../../../scripts/modules/rule-transformer.js';
import * as windsurfProfile from '../../../scripts/profiles/windsurf.js';

// Mock fs functions as in direct-functions.test.js
const mockExistsSync = jest.fn();
const mockWriteFileSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockUnlinkSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockRmSync = jest.fn();
const mockReaddirSync = jest.fn();

jest.mock('fs', () => ({
	existsSync: mockExistsSync,
	writeFileSync: mockWriteFileSync,
	readFileSync: mockReadFileSync,
	unlinkSync: mockUnlinkSync,
	mkdirSync: mockMkdirSync,
	rmSync: mockRmSync,
	readdirSync: mockReaddirSync
}));

describe('rules transformer', () => {
	const mockProjectDir = '/mock/project/root';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should convert all Cursor rules to windsurf brand rules', () => {
		// Arrange
		mockExistsSync.mockImplementation((p) => {
			// Simulate that the cursor rules directory exists
			if (p === '/mock/project/root/assets/rules') return true;
			// Simulate that the brand rules directory does not exist initially
			if (p === '/mock/project/root/.windsurf/rules') return false;
			return false;
		});
		mockReadFileSync.mockImplementation((p) => 'mock rule content');
		mockReaddirSync.mockImplementation((dir) => ['sample-rule.mdc']);
		mockWriteFileSync.mockImplementation(() => {});
		mockMkdirSync.mockImplementation(() => {});

		// Act
		const result = convertAllRulesToBrandRules(mockProjectDir, windsurfProfile);

		// Assert
		expect(result.success).toBeGreaterThanOrEqual(0);
		expect(mockWriteFileSync).toHaveBeenCalled();
		expect(mockMkdirSync).toHaveBeenCalled();
	});

	test('should remove windsurf brand rules', () => {
		// Arrange
		mockExistsSync.mockImplementation((p) => {
			// Simulate that the brand rules directory exists
			if (p === '/mock/project/root/.windsurf/rules') return true;
			return false;
		});
		mockRmSync.mockImplementation(() => {});
		mockUnlinkSync.mockImplementation(() => {});
		mockReaddirSync.mockImplementation((dir) => []);

		// Act
		const removed = removeBrandRules(mockProjectDir, windsurfProfile);

		// Assert
		expect(removed).toBe(true);
		expect(mockRmSync).toHaveBeenCalled();
	});
});

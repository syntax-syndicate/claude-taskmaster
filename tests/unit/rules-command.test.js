// tests/unit/rules-command.test.js

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as windsurfProfile from '../../scripts/profiles/windsurf.js';
import {
	convertAllRulesToBrandRules,
	removeBrandRules
} from '../../scripts/modules/rule-transformer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectDir = path.join(__dirname, '../tmp/rules-test');
const assetsRulesDir = path.join(projectDir, 'assets', 'rules');

function setupCursorRules() {
	if (!fs.existsSync(assetsRulesDir)) {
		fs.mkdirSync(assetsRulesDir, { recursive: true });
	}
	fs.writeFileSync(
		path.join(assetsRulesDir, 'sample-rule.mdc'),
		`---\ndescription: Example Cursor Rule\nglobs: src/**/*.js\nalwaysApply: true\n---\n- **Do this**\n  - Example line\n`
	);
	// Copy the real windsurf profile to the test temp directory for CLI
	const testProfilesDir = path.join(projectDir, 'scripts', 'profiles');
	if (!fs.existsSync(testProfilesDir)) {
		fs.mkdirSync(testProfilesDir, { recursive: true });
	}
	const realProfilePath = path.join(
		__dirname,
		'../../scripts/profiles/windsurf.js'
	);
	const testProfilePath = path.join(testProfilesDir, 'windsurf.js');
	fs.copyFileSync(realProfilePath, testProfilePath);
}

describe('rules CLI command', () => {
	beforeEach(() => {
		fs.rmSync(projectDir, { recursive: true, force: true });
		setupCursorRules();
	});

	afterEach(() => {
		fs.rmSync(projectDir, { recursive: true, force: true });
	});

	describe('Direct module usage', () => {
		it('should convert all Cursor rules to windsurf brand rules', () => {
			// Act
			const result = convertAllRulesToBrandRules(projectDir, windsurfProfile);
			// Assert
			const brandRulePath = path.join(
				projectDir,
				windsurfProfile.rulesDir,
				'sample-rule.mdc'
			);
			expect(result.success).toBeGreaterThan(0);
			expect(fs.existsSync(brandRulePath)).toBe(true);
			const content = fs.readFileSync(brandRulePath, 'utf8');
			// Check for a windsurf-specific transformation (adjust as needed)
			expect(content.toLowerCase()).toContain('windsurf');
		});

		it('should remove windsurf brand rules', () => {
			convertAllRulesToBrandRules(projectDir, windsurfProfile);
			const removed = removeBrandRules(projectDir, windsurfProfile);
			expect(removed && removed.success).toBe(true);
			expect(
				fs.existsSync(path.join(projectDir, windsurfProfile.rulesDir))
			).toBe(false);
		});
	});

	describe('CLI integration', () => {
		const cliPath = path.join(__dirname, '../../bin/task-master.js');

		it('should add windsurf rules via CLI', () => {
			const result = spawnSync('node', [cliPath, 'rules', 'add', 'windsurf'], {
				cwd: projectDir,
				encoding: 'utf8'
			});
			console.log('CLI STDOUT:', result.stdout);
			console.log('CLI STDERR:', result.stderr);
			expect(result.status).toBe(0);
			const brandRulePath = path.join(
				projectDir,
				windsurfProfile.rulesDir,
				'sample-rule.mdc'
			);
			expect(fs.existsSync(brandRulePath)).toBe(true);
		});

		it('should remove windsurf rules via CLI', () => {
			// First add, then remove
			spawnSync('node', [cliPath, 'rules', 'add', 'windsurf'], {
				cwd: projectDir,
				encoding: 'utf8'
			});
			const result = spawnSync(
				'node',
				[cliPath, 'rules', 'remove', 'windsurf'],
				{
					cwd: projectDir,
					encoding: 'utf8'
				}
			);
			expect(result.status).toBe(0);
			expect(
				fs.existsSync(path.join(projectDir, windsurfProfile.rulesDir))
			).toBe(false);
		});

		it('should error if brand is missing', () => {
			const result = spawnSync('node', [cliPath, 'rules', 'add'], {
				cwd: projectDir,
				encoding: 'utf8'
			});
			expect(result.status).not.toBe(0);
			expect(result.stderr).toContain('Please specify at least one brand');
		});
	});
});

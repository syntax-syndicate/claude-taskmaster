import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { convertRuleToProfileRule } from '../../src/utils/rule-transformer.js';
import * as clineProfile from '../../scripts/profiles/cline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Cline Rule Transformer', () => {
	const testDir = path.join(__dirname, 'temp-test-dir');

	beforeAll(() => {
		// Create test directory
		if (!fs.existsSync(testDir)) {
			fs.mkdirSync(testDir, { recursive: true });
		}
	});

	afterAll(() => {
		// Clean up test directory
		if (fs.existsSync(testDir)) {
			fs.rmSync(testDir, { recursive: true, force: true });
		}
	});

	it('should correctly convert basic terms', () => {
		// Create a test Cursor rule file with basic terms
		const testCursorRule = path.join(testDir, 'basic-terms.mdc');
		const testContent = `---
description: Test Cursor rule for basic terms
globs: **/*
alwaysApply: true
---

This is a Cursor rule that references cursor.so and uses the word Cursor multiple times.
Also has references to .mdc files.`;

		fs.writeFileSync(testCursorRule, testContent);

		// Convert it
		const testClineRule = path.join(testDir, 'basic-terms.md');
		convertRuleToProfileRule(
			testCursorRule,
			testClineRule,
			clineProfile.clineProfile
		);

		// Read the converted file
		const convertedContent = fs.readFileSync(testClineRule, 'utf8');

		// Verify transformations
		expect(convertedContent).toContain('Cline');
		expect(convertedContent).toContain('cline.bot');
		expect(convertedContent).toContain('.md');
		expect(convertedContent).not.toContain('cursor.so');
		expect(convertedContent).not.toContain('Cursor rule');
	});

	it('should correctly convert tool references', () => {
		// Create a test Cursor rule file with tool references
		const testCursorRule = path.join(testDir, 'tool-refs.mdc');
		const testContent = `---
description: Test Cursor rule for tool references
globs: **/*
alwaysApply: true
---

- Use the search tool to find code
- The edit_file tool lets you modify files
- run_command executes terminal commands
- use_mcp connects to external services`;

		fs.writeFileSync(testCursorRule, testContent);

		// Convert it
		const testClineRule = path.join(testDir, 'tool-refs.md');
		convertRuleToProfileRule(
			testCursorRule,
			testClineRule,
			clineProfile.clineProfile
		);

		// Read the converted file
		const convertedContent = fs.readFileSync(testClineRule, 'utf8');

		// Verify transformations (Cline uses standard tool names)
		expect(convertedContent).toContain('search tool');
		expect(convertedContent).toContain('edit_file tool');
		expect(convertedContent).toContain('run_command');
		expect(convertedContent).toContain('use_mcp');
	});

	it('should correctly update file references', () => {
		// Create a test Cursor rule file with file references
		const testCursorRule = path.join(testDir, 'file-refs.mdc');
		const testContent = `---
description: Test Cursor rule for file references
globs: **/*
alwaysApply: true
---

This references [dev_workflow.mdc](mdc:.cursor/rules/dev_workflow.mdc) and 
[taskmaster.mdc](mdc:.cursor/rules/taskmaster.mdc).`;

		fs.writeFileSync(testCursorRule, testContent);

		// Convert it
		const testClineRule = path.join(testDir, 'file-refs.md');
		convertRuleToProfileRule(
			testCursorRule,
			testClineRule,
			clineProfile.clineProfile
		);

		// Read the converted file
		const convertedContent = fs.readFileSync(testClineRule, 'utf8');

		// Verify transformations
		expect(convertedContent).toContain('(.clinerules/dev_workflow.md)');
		expect(convertedContent).toContain('(.clinerules/taskmaster.md)');
		expect(convertedContent).not.toContain('(mdc:.cursor/rules/');
	});
});

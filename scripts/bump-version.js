#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');

const args = process.argv.slice(2);
const versionType = args[0] || 'patch';

try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const currentVersion = packageJson.version;
  console.log(`Current version: ${currentVersion}`);

  const [major, minor, patch] = currentVersion.split('.').map(Number);

  let newVersion;
  switch (versionType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  // Update package.json with new version
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

  console.log(`Version bumped to: ${newVersion}`);
  console.log(`\nVersion bump: ${currentVersion} → ${newVersion}`);
} catch (error) {
  console.error('Error updating version:', error);
  process.exit(1);
}

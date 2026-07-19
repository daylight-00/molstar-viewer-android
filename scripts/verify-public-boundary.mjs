#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const requiredPaths = [
    'README.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    '.github/CODEOWNERS',
    '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/ISSUE_TEMPLATE/bug-report.yml',
    '.github/ISSUE_TEMPLATE/feature-request.yml',
    '.github/ISSUE_TEMPLATE/config.yml',
    'docs/user/README.md',
    'docs/user/troubleshooting.md',
    'docs/project/README.md',
    'docs/project/naming-and-branding.md',
    'docs/development/README.md',
    'docs/development/architecture.md',
    'docs/development/upstream-molstar.md',
    'docs/development/automation.md',
    'docs/development/releasing.md',
    'project.properties',
];
const forbiddenPaths = [
    'docs/COLLABORATION_PROTOCOL.md',
    'docs/GITHUB_COLLABORATION_WORKFLOW.md',
    'docs/local-handoff.md',
    'docs/linux-handoff.md',
    'scripts/rclone',
    'scripts/linux-bootstrap-and-publish.sh',
];
for (const item of requiredPaths) {
    if (!fs.statSync(item, { throwIfNoEntry: false })?.isFile()) {
        throw new Error(`public/developer documentation is missing: ${item}`);
    }
}
for (const item of forbiddenPaths) {
    if (fs.existsSync(item)) throw new Error(`private operations path must not be public: ${item}`);
}

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
const forbiddenText = [
    'HW-T/',
    'agent-to-user',
    'user-to-agent',
    'single-runner',
    'hwjang00@snu.ac.kr',
    '$HOME/projects/molstar-android-viewer-bootstrap',
    'Assistant changes are delivered',
    'Google Drive carries bounded runner',
];
const self = 'scripts/verify-public-boundary.mjs';
const binaryExtensions = new Set(['.jar', '.ico', '.jpg', '.png', '.apk', '.zst', '.bundle']);
for (const file of tracked) {
    if (file === self || file.startsWith('app/src/main/assets/viewer/vendor/molstar/')) continue;
    if (binaryExtensions.has(path.extname(file).toLowerCase())) continue;
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    for (const marker of forbiddenText) {
        if (text.includes(marker)) throw new Error(`private operations marker found in ${file}: ${marker}`);
    }
}

const markdown = tracked.filter(file => file.endsWith('.md') && fs.existsSync(file));
for (const file of markdown) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = match[1].split('#', 1)[0];
        if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
        const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
        if (!fs.existsSync(resolved)) throw new Error(`broken relative link in ${file}: ${target}`);
    }
}

const security = fs.readFileSync('SECURITY.md', 'utf8');
if (!security.includes('Report a vulnerability')) throw new Error('SECURITY.md must direct reporters to private vulnerability reporting');
if (/mailto:/i.test(security)) throw new Error('SECURITY.md must not expose an owner-specific email address');

const license = fs.readFileSync('LICENSE', 'utf8');
if (!license.includes('Copyright (c) 2026 David Hyunyoo Jang')) throw new Error('LICENSE must use the owner legal name');
if (license.includes('Copyright (c) 2026 daylight-00')) throw new Error('LICENSE must not use the GitHub handle as the copyright holder');

const readme = fs.readFileSync('README.md', 'utf8');
if (!readme.startsWith('# Mol* Viewer for Android\n')) throw new Error('public project title must be Mol* Viewer for Android');
if (!readme.includes('maintained in the Mol* GitHub organization by David Hyunyoo Jang')) throw new Error('README must state current hosting and maintenance');
if (!readme.includes('github.com/molstar/molstar-viewer-android/actions/workflows/ci.yml')) throw new Error('CI badge must use the organization repository URL');
if (!readme.includes('git clone https://github.com/molstar/molstar-viewer-android.git')) throw new Error('clone instructions must use the organization repository URL');
for (const retired of [
    'github.com/daylight-00/molstar-viewer-android',
    'github.com/daylight-00/molstar-android-viewer',
    'not presented as an official Mol* release',
    'subject to naming and branding guidance',
]) {
    if (readme.includes(retired)) throw new Error(`README contains retired project state: ${retired}`);
}

const userGuide = fs.readFileSync('docs/user/README.md', 'utf8');
if (!userGuide.includes('Mol* Viewer for Android packages the upstream Mol* Viewer runtime')) throw new Error('user guide must use the current project relationship');
if (userGuide.includes('maintainer naming and branding guidance')) throw new Error('user guide contains the retired pending naming gate');

const naming = fs.readFileSync('docs/project/naming-and-branding.md', 'utf8');
for (const marker of [
    'UPSTREAM_NAMING_STATUS=approved',
    'PROJECT_TITLE=Mol* Viewer for Android',
    'STABLE_APPLICATION_LABEL=Mol* Viewer',
    'REPOSITORY=https://github.com/molstar/molstar-viewer-android',
    'MAINTAINER=David Hyunyoo Jang',
    'https://github.com/molstar/molstar/discussions/1883',
    'discussioncomment-17665978',
    'retaining administrator access and full control',
    'Stable-release gate',
]) {
    if (!naming.includes(marker)) throw new Error(`project identity record is incomplete: ${marker}`);
}
for (const retired of ['UPSTREAM_NAMING_STATUS=pending', 'Draft upstream discussion', 'Decision matrix']) {
    if (naming.includes(retired)) throw new Error(`project identity record contains retired planning text: ${retired}`);
}
const projectProperties = fs.readFileSync('project.properties', 'utf8');
if (!/^UPSTREAM_NAMING_STATUS=approved$/m.test(projectProperties)) throw new Error('project identity status must be approved');

const codeowners = fs.readFileSync('.github/CODEOWNERS', 'utf8');
if (!/^\* @daylight-00\s*$/m.test(codeowners)) throw new Error('CODEOWNERS must route repository review to the maintainer');

const viewerIndex = fs.readFileSync('app/src/main/assets/viewer/index.html', 'utf8');
if (!viewerIndex.includes('<title>Mol* Viewer</title>')) throw new Error('embedded application title must remain Mol* Viewer');
const legacyViewerTitle = '<title>Mol* ' + 'Android Viewer</title>';
if (viewerIndex.includes(legacyViewerTitle)) throw new Error('legacy embedded application title must be removed');

const build = fs.readFileSync('app/build.gradle.kts', 'utf8');
if (!build.includes('manifestPlaceholders["appLabel"] = "Mol* Viewer"')) throw new Error('stable installed application label must remain Mol* Viewer');
if (!build.includes('manifestPlaceholders["appLabel"] = "Mol* Viewer Candidate"')) throw new Error('candidate application label must remain distinguishable');

const settings = fs.readFileSync('settings.gradle.kts', 'utf8');
if (!settings.includes('rootProject.name = "molstar-viewer-android"')) throw new Error('technical project name must match the repository slug');
const contributing = fs.readFileSync('CONTRIBUTING.md', 'utf8');
if (!contributing.includes('cd molstar-viewer-android')) throw new Error('contributor checkout path must match the repository slug');

const releaseScript = fs.readFileSync('scripts/release/prepare-release.sh', 'utf8');
if (!releaseScript.includes('title: `Mol* Viewer for Android ${artifact.versionName}`')) throw new Error('stable release title must use the public project title');
const promote = fs.readFileSync('.github/workflows/promote.yml', 'utf8');
if (!promote.includes('Verify project identity status')) throw new Error('stable promotion must verify the approved project identity');
if (!promote.includes('UPSTREAM_NAMING_STATUS')) throw new Error('stable promotion identity invariant is missing');

const issueConfig = fs.readFileSync('.github/ISSUE_TEMPLATE/config.yml', 'utf8');
if (!issueConfig.includes('https://github.com/molstar/molstar-viewer-android/security/advisories/new')) throw new Error('issue config must use the organization private-report URL');
if (!issueConfig.includes('github.com/molstar/molstar/issues')) throw new Error('issue config must identify the upstream Mol* tracker');
for (const retired of ['github.com/daylight-00/molstar-viewer-android', 'github.com/daylight-00/molstar-android-viewer']) {
    if (issueConfig.includes(retired)) throw new Error(`issue config contains retired repository URL: ${retired}`);
}

console.log('Public/developer/private repository boundary passed.');

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const gitExe = '"C:\\Program Files\\Git\\cmd\\git.exe"';
const ghExe = '"C:\\Program Files\\GitHub CLI\\gh.exe"';
const logFile = path.join(dir, 'git_final_log.md');
const lines = [];

function log(msg) { lines.push(msg); }
function run(label, cmd, timeout = 120000) {
    log(`\n### ${label}`);
    log(`\`${cmd}\``);
    try {
        const out = execSync(cmd, { cwd: dir, encoding: 'utf-8', timeout, stdio: ['pipe', 'pipe', 'pipe'] });
        log('```\n' + (out.trim() || '(no output)') + '\n```');
        log('✅ Success');
        return { ok: true, out: out.trim() };
    } catch (e) {
        const msg = ((e.stdout || '') + (e.stderr || '')).trim() || e.message;
        log('```\n' + msg + '\n```');
        log('❌ Failed');
        return { ok: false, out: msg };
    }
}

log('# Git Push — Final Log\n');

// Step 1: Kill zombie git processes
log('## Step 1: Kill zombie git processes');
try { execSync('taskkill /F /IM git.exe', { stdio: 'ignore', shell: true }); log('Killed git.exe'); } catch (e) { log('No git.exe to kill'); }
try { execSync('taskkill /F /IM git-remote-https.exe', { stdio: 'ignore', shell: true }); log('Killed git-remote-https.exe'); } catch (e) { log('No git-remote-https to kill'); }

// Busy-wait 2 seconds
const end = Date.now() + 3000;
while (Date.now() < end) { }

// Step 2: Remove old .git directory entirely
log('\n## Step 2: Remove old .git directory');
const gitDir = path.join(dir, '.git');
try {
    if (fs.existsSync(gitDir)) {
        // Use cmd to force remove (handles locked files better)
        execSync(`cmd /c "rmdir /s /q "${gitDir}""`, { stdio: 'ignore', shell: false });
        log('✅ Removed .git directory via rmdir');
    } else {
        log('✅ No .git directory found');
    }
} catch (e) {
    log('⚠️ rmdir failed, trying alternative...');
    try {
        // Alternative: rename it first
        const tempDir = path.join(dir, '.git_old_' + Date.now());
        fs.renameSync(gitDir, tempDir);
        log('✅ Renamed .git to ' + path.basename(tempDir));
    } catch (e2) {
        log('❌ Could not remove .git: ' + e2.message);
        log('💡 Please close VS Code, delete .git folder manually, and reopen');
    }
}

// Step 3: Fresh git init
log('\n## Step 3: Initialize fresh repository');
run('git init', `${gitExe} init`);
run('git config email', `${gitExe} config user.email "pushkar-web@users.noreply.github.com"`);
run('git config name', `${gitExe} config user.name "pushkar-web"`);
run('git add all', `${gitExe} add -A`);
run('git commit', `${gitExe} commit -m "feat: HealthShop AI portal with AI-powered product recommendations, Recharts charts, dark dashboard"`);

// Step 4: Check gh auth status
log('\n## Step 4: GitHub CLI Auth');
const authResult = run('gh auth status', `${ghExe} auth status`);

if (!authResult.ok && authResult.out.includes('not logged')) {
    log('\n⚠️ You need to authenticate with GitHub CLI first.');
    log('Run this command manually: `"C:\\Program Files\\GitHub CLI\\gh.exe" auth login`');
} else {
    // Step 5: Create new repo and push
    log('\n## Step 5: Create repo and push');
    run('gh repo create', `${ghExe} repo create nline-health-shopping-portal-with-product-recommendation-Project --public --source=. --remote=origin --push`);
}

// Write log
fs.writeFileSync(logFile, lines.join('\n'), 'utf-8');

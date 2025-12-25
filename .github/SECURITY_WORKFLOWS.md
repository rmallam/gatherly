# GitHub Actions Security Workflows

This directory contains automated security testing workflows for the Dravify application.

## Workflows

### 1. Dependency Scanning (`security-dependency-scan.yml`)
- **Runs on:** Push to main/develop, PRs, Every Monday
- **Tools:** npm audit, Snyk
- **Tests:** Known vulnerabilities in dependencies

### 2. OWASP ZAP Scan (`security-zap-scan.yml`)
- **Runs on:** Push to main, Every Sunday, Manual trigger
- **Tools:** OWASP ZAP
- **Tests:** Web application vulnerabilities (XSS, SQLi, etc.)

### 3. CodeQL Analysis (`security-codeql.yml`)
- **Runs on:** Push to main/develop, PRs, Daily
- **Tools:** GitHub CodeQL
- **Tests:** Code-level security issues

### 4. MobSF Mobile Scan (`security-mobsf.yml`)
- **Runs on:** Manual trigger only
- **Tools:** MobSF (Mobile Security Framework)
- **Tests:** Android APK security issues

## Setup Instructions

### 1. Enable GitHub Security Features
1. Go to your repo Settings → Security → Code security and analysis
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Code scanning (CodeQL)
   - ✅ Secret scanning

### 2. Add Snyk Token (Optional)
1. Sign up at https://snyk.io (free for open source)
2. Get your API token from Account Settings
3. Add to GitHub: Settings → Secrets → New repository secret
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk API token

### 3. Configure ZAP Rules (Optional)
Create `.zap/rules.tsv` in your repo root to customize ZAP scanning rules.

## Viewing Results

### Security Tab
- Go to your GitHub repo → Security tab
- View all security alerts in one place

### Actions Tab
- Go to Actions → Select a workflow
- Click on a run to see detailed results

### Artifacts
- ZAP scan results are uploaded as artifacts
- Download HTML/JSON reports from completed workflow runs

## Manual Triggers

Some workflows can be triggered manually:
1. Go to Actions → Select workflow
2. Click "Run workflow"
3. Select branch and options

## Best Practices

1. **Fix Critical Issues First:** Address critical and high severity issues immediately
2. **Review Weekly:** Check security tab weekly for new alerts
3. **Update Dependencies:** Keep dependencies up to date
4. **Test Before Merge:** Run security scans on PRs before merging

## Notifications

To get notified of security issues:
1. Go to repo Settings → Notifications
2. Enable email notifications for security alerts
3. Or watch the repo for all activity

## Troubleshooting

### Workflow Fails
- Check workflow logs in Actions tab
- Common issues:
  - Snyk token not configured
  - Backend URL unreachable
  - Build failures

### False Positives
- Review each alert carefully
- Some alerts may not apply to your use case
- Dismiss with justification if needed

## Next Steps

1. ✅ Push these workflows to GitHub
2. ✅ Enable security features in repo settings
3. ✅ Add Snyk token (optional)
4. ✅ Review first scan results
5. ✅ Fix any critical issues found

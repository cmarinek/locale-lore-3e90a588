# LocaleLore Admin Guide

**Version:** 1.0.0  
**Last Updated:** 2025-11-10

This guide provides comprehensive instructions for LocaleLore administrators on managing the platform, moderating content, and handling user issues.

---

## Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [User Management](#user-management)
3. [Content Moderation](#content-moderation)
4. [Contributor Management](#contributor-management)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [System Administration](#system-administration)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [Emergency Procedures](#emergency-procedures)

---

## Admin Dashboard Overview

### Accessing the Dashboard

**URL:** `/admin`

**Requirements:**
- Admin account (is_admin = true in profiles table)
- Active authentication session

**If you can't access:**
1. Verify your account has admin privileges
2. Check database: `profiles` table → `is_admin` column
3. Contact system administrator to grant admin access

### Dashboard Layout

The admin dashboard consists of several sections:

- **Overview**: Key metrics and quick stats
- **Users**: User management and profiles
- **Content**: Fact moderation queue
- **Contributors**: Contributor applications and management
- **Analytics**: Detailed analytics and reports
- **Monitoring**: System health and performance
- **Settings**: System configuration

---

## User Management

### Viewing Users

**Path:** Admin → Users

**User List Features:**
- Search by name, email, or ID
- Filter by status (active, suspended, deleted)
- Sort by join date, activity, contributions
- Bulk actions

### User Profile Actions

**View User Details:**
1. Click on user's name in the list
2. View full profile information:
   - Personal details
   - Activity history
   - Submitted facts
   - Gamification stats
   - Moderation history

**Available Actions:**

- **Edit Profile**: Modify user information
- **View Activity**: See user's recent actions
- **View Facts**: List all user's submissions
- **Suspend User**: Temporarily block access
- **Ban User**: Permanently block account
- **Delete User**: Remove account (GDPR compliance)
- **Promote to Admin**: Grant admin privileges
- **Grant Contributor Status**: Make user a verified contributor

### Suspension & Banning

**When to Suspend:**
- Repeated content guideline violations
- Suspicious activity
- Pending investigation
- Temporary cooling-off period

**Suspension Process:**
1. Go to user profile
2. Click "Suspend User"
3. Select duration (1 day, 7 days, 30 days, indefinite)
4. Provide reason (shown to user)
5. Optionally notify user via email
6. Confirm suspension

**When to Ban:**
- Severe content violations
- Harassment or abuse
- Fraud or illegal activity
- Repeat offenses after warnings

**Ban Process:**
1. Go to user profile
2. Click "Ban User"
3. Provide detailed reason (for internal records)
4. Confirm permanent ban
5. User receives notification (cannot log in)

**Unbanning:**
- Only possible for mistakes
- Document reason for reversal
- Notify user of reinstatement

### User Data Requests (GDPR)

**Export User Data:**
1. User profile → Actions → Export Data
2. Generates zip file with:
   - Profile information
   - All submitted facts
   - Comments and interactions
   - Activity logs
   - Analytics data
3. Provide download link to user

**Delete User Data:**
1. User profile → Actions → Delete Account
2. Confirm deletion (irreversible)
3. Process:
   - Anonymize submitted facts (author = "Deleted User")
   - Delete personal information
   - Remove from database
   - Log deletion for compliance

---

## Content Moderation

### Moderation Queue

**Path:** Admin → Content → Pending

**Queue Categories:**
- **Pending Facts**: Awaiting initial review
- **Flagged Facts**: Reported by users
- **Edited Facts**: Re-review required
- **Appealed Rejections**: Users requesting reconsideration

### Reviewing Facts

**Review Process:**

1. **Open Fact**: Click to view full details
2. **Check Content**:
   - Verify accuracy
   - Check for appropriate content
   - Assess quality and value
   - Verify images are relevant and appropriate
   - Confirm location accuracy
3. **Make Decision**:
   - ✅ **Approve**: Fact goes live immediately
   - ❌ **Reject**: Fact is hidden, user notified
   - ⚠️ **Request Changes**: Ask user to improve

**Approval Checklist:**
- [ ] Content is accurate and verifiable
- [ ] Appropriate for all audiences
- [ ] Not spam or promotional
- [ ] Images are high quality
- [ ] Location is correct
- [ ] Category is appropriate
- [ ] Grammar/spelling acceptable

**Rejection Reasons:**
- Inaccurate information
- Low quality or insufficient detail
- Inappropriate content
- Spam or promotional
- Copyright violation
- Duplicate of existing fact
- Wrong location

**Always provide feedback when rejecting!**

### Handling Flagged Content

**Flag Types:**
- Inappropriate/Offensive
- Inaccurate information
- Spam/Promotional
- Copyright violation
- Wrong location
- Other

**Review Process:**
1. View flagged fact
2. Read flag reason and details
3. Assess flag validity
4. Take action:
   - **Dismiss Flag**: No violation found (log decision)
   - **Remove Fact**: Violation confirmed
   - **Warn User**: First offense
   - **Suspend User**: Repeated violations

**Response Times:**
- Critical flags (offensive, illegal): < 1 hour
- High priority (inaccurate, spam): < 24 hours
- Standard flags: < 48 hours

### Bulk Moderation

**Bulk Actions:**
1. Select multiple items using checkboxes
2. Choose action from dropdown:
   - Approve selected
   - Reject selected
   - Flag for review
   - Delete selected
3. Confirm bulk action
4. Items processed in background

**Use Cases:**
- Clearing spam submissions
- Approving quality batch
- Deleting duplicates

---

## Contributor Management

### Contributor Applications

**Path:** Admin → Contributors → Applications

**Application Review:**

1. **Open Application**: Click to view details
2. **Review Portfolio**:
   - Check submitted sample facts
   - Assess quality and consistency
   - Review user statistics
   - Check quality score history
3. **Verify Eligibility**:
   - Account age > 30 days
   - 10+ approved facts
   - Quality score ≥ 4.0
   - No violations
4. **Make Decision**:
   - ✅ **Approve**: Grant contributor status
   - ❌ **Reject**: Deny with feedback
   - ⏸️ **Request More Samples**: Ask for additional work

**Approval Process:**
1. Click "Approve"
2. System automatically:
   - Updates user profile (is_contributor = true)
   - Sends approval notification
   - Grants contributor badge
   - Enables payment setup
3. Welcome email sent with next steps

**Rejection with Feedback:**
1. Click "Reject"
2. Provide detailed feedback:
   - Why they weren't approved
   - What they need to improve
   - When they can reapply
3. User receives notification with feedback

### Managing Active Contributors

**Contributor Dashboard:**
- View all active contributors
- Track earnings and performance
- Monitor quality scores
- Review flagged submissions

**Contributor Actions:**
- **View Performance**: Detailed stats and earnings
- **Adjust Quality Score**: Manual override (with reason)
- **Process Payments**: Verify and approve payments
- **Suspend Contributor Status**: Temporary removal
- **Revoke Contributor Status**: Permanent removal

**When to Revoke Status:**
- Consistent low quality (< 3.0 for 30 days)
- Content guideline violations
- Fraud or manipulation
- Inactivity (6+ months)

---

## Monitoring & Analytics

### Production Monitoring

**Path:** Admin → Monitoring

**Dashboard Sections:**

1. **System Health**:
   - Uptime percentage
   - Active errors
   - Response times
   - Database status

2. **Error Tracking**:
   - Recent errors
   - Error rates by type
   - Critical issues
   - Error trends

3. **Performance Metrics**:
   - API response times
   - Database query performance
   - Edge function latency
   - Core Web Vitals

4. **User Analytics**:
   - Active users (real-time)
   - Daily/Weekly/Monthly active users
   - User growth trends
   - Session statistics

### Reading Metrics

**Key Metrics to Monitor:**

- **Uptime**: Should be > 99.9%
- **Error Rate**: Should be < 0.1%
- **Avg Response Time**: Should be < 500ms
- **Active Users**: Track growth trends

**Alert Thresholds:**
- 🔴 **Critical**: Uptime < 99%, Error rate > 1%
- 🟡 **Warning**: Response time > 1s, Error rate > 0.5%
- 🟢 **Good**: All metrics in normal range

### Analytics Dashboard

**Path:** Admin → Analytics

**Available Reports:**

1. **User Metrics**:
   - Sign-ups over time
   - User retention (Day 1, 7, 30)
   - Active user trends
   - User demographics

2. **Content Metrics**:
   - Facts submitted over time
   - Approval rates
   - Average quality scores
   - Top categories

3. **Engagement Metrics**:
   - Likes and comments
   - Social interactions
   - Gamification participation
   - Feature usage

4. **Revenue Metrics** (if applicable):
   - Subscription revenue
   - Contributor payouts
   - Costs vs. revenue

**Exporting Reports:**
- Click "Export" button
- Choose format (CSV, PDF)
- Select date range
- Download file

---

## System Administration

### Database Management

**⚠️ CRITICAL: Never modify database directly unless absolutely necessary!**

**Accessing Database:**
- Supabase Dashboard: https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx
- Use Table Editor for safe viewing
- Use SQL Editor only when necessary

**Common Database Tasks:**

1. **View Table Data**:
   - Table Editor → Select table → View rows
   - Filter and search as needed

2. **Run SQL Queries** (admin only):
   - SQL Editor → New query
   - Write SELECT query (read-only recommended)
   - Execute and view results

3. **Apply Migrations**:
   - Migrations apply automatically on deployment
   - Never run migrations manually unless instructed

### Edge Function Management

**Monitoring Edge Functions:**
- Supabase Dashboard → Functions
- View logs, errors, and invocations
- Check response times

**Common Issues:**
- Function timeout (> 60s)
- Environment variable missing
- Authentication errors

**Viewing Logs:**
1. Go to Supabase Dashboard
2. Functions → [Select function]
3. Logs tab
4. Filter by time range and log level

### Managing Secrets

**Adding Secrets:**
1. Supabase Dashboard → Settings → Edge Functions
2. Add new secret
3. Name: SECRET_NAME
4. Value: [sensitive value]
5. Save

**Never share secrets in code or logs!**

---

## Common Tasks

### 1. Approving a Fact

1. Admin → Content → Pending
2. Click on fact
3. Review content and images
4. Click "Approve"
5. Fact goes live immediately

### 2. Handling User Report

1. Admin → Content → Flagged
2. Review flagged item
3. Assess validity
4. Take appropriate action (remove, dismiss, warn)
5. Notify user if needed

### 3. Processing Contributor Application

1. Admin → Contributors → Applications
2. Open application
3. Review portfolio and stats
4. Approve or reject with feedback
5. System handles notification

### 4. Granting Admin Access

1. Admin → Users
2. Find user
3. Click "Promote to Admin"
4. Confirm action
5. User gains admin privileges

### 5. Generating Analytics Report

1. Admin → Analytics
2. Select date range
3. Choose metrics
4. Click "Generate Report"
5. Export as needed

### 6. Investigating Error Spike

1. Admin → Monitoring → Errors
2. Filter by time period
3. Identify error pattern
4. Check edge function logs
5. Fix issue or escalate

### 7. Processing Payment Dispute

1. Check user account
2. Review transaction history
3. Verify with Stripe dashboard
4. Resolve with refund/credit if appropriate
5. Document resolution

---

## Troubleshooting

### Common Issues

#### "Admin dashboard won't load"

**Causes:**
- Not logged in as admin
- Session expired
- Server error

**Solutions:**
1. Verify you're logged in
2. Check you have admin privileges
3. Clear cache and refresh
4. Check monitoring for errors

#### "Can't approve facts"

**Causes:**
- Permission issue
- Database connection error
- Fact already approved

**Solutions:**
1. Refresh page
2. Check fact status
3. Try again
4. Check error logs

#### "User reports missing"

**Causes:**
- No recent reports
- Filter applied
- Loading error

**Solutions:**
1. Clear filters
2. Refresh page
3. Check date range

### Error Messages

**"Unauthorized"**
- Not logged in as admin
- Session expired → Log in again

**"Database error"**
- Temporary connection issue → Retry
- Persistent issue → Check monitoring

**"Function timeout"**
- Edge function taking too long → Check logs
- May need optimization

---

## Emergency Procedures

### P0 Incidents (Critical)

**Examples:**
- Complete site outage
- Data breach
- Security vulnerability
- Payment system down

**Immediate Actions:**
1. Alert team via emergency channel
2. Check monitoring dashboard
3. Review error logs
4. Check Supabase status page
5. If needed, rollback deployment
6. Document incident timeline
7. Communicate with users

**Escalation:**
- Developer on-call
- Tech Lead
- CTO

### P1 Incidents (High Priority)

**Examples:**
- Major feature not working
- Severe performance degradation
- Mass user reports

**Response:**
1. Confirm issue
2. Check logs and monitoring
3. Attempt quick fix
4. If not resolved in 30 min, escalate
5. Communicate status to team

### Rollback Procedure

**When to rollback:**
- Critical bug in production
- Data integrity issue
- Security vulnerability

**How to rollback:**
1. Identify last good deployment commit
2. Navigate to Lovable dashboard
3. Click "Rollback" button
4. Select previous version
5. Confirm rollback
6. Verify functionality restored
7. Investigate root cause

**Alternative (manual):**
```bash
git revert [bad-commit-hash]
git push origin main
```

### Communication Templates

**Incident Announcement:**
```
🔴 INCIDENT: [Brief description]
IMPACT: [Who/what affected]
STATUS: Investigating / Fixing / Resolved
ETA: [Estimated resolution time]
UPDATES: [Where to check for updates]
```

**Resolution Announcement:**
```
✅ RESOLVED: [Incident description]
ROOT CAUSE: [Brief explanation]
ACTIONS TAKEN: [What was fixed]
PREVENTION: [What we're doing to prevent recurrence]
```

---

## Best Practices

### Content Moderation

1. **Be Consistent**: Apply guidelines uniformly
2. **Be Fair**: Give users benefit of doubt on first offense
3. **Be Transparent**: Always explain decisions
4. **Be Timely**: Review content within SLA (24-48 hours)
5. **Be Professional**: Remain neutral and respectful

### User Communication

1. **Be Clear**: Use simple, direct language
2. **Be Helpful**: Offer solutions, not just problems
3. **Be Empathetic**: Understand user frustration
4. **Be Prompt**: Respond within 24 hours
5. **Be Professional**: Maintain brand voice

### Security

1. **Never share credentials**: Not even with team members
2. **Use strong passwords**: Enable 2FA when available
3. **Log out when done**: Especially on shared computers
4. **Verify before taking action**: Double-check critical operations
5. **Report suspicious activity**: Alert team immediately

---

## Admin Resources

### Documentation

- **User Guide**: [USER_GUIDE.md](USER_GUIDE.md)
- **Contributor Guide**: [CONTRIBUTOR_GUIDE.md](CONTRIBUTOR_GUIDE.md)
- **Deployment Guide**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- **API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### External Tools

- **Supabase Dashboard**: https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx
- **Stripe Dashboard**: https://dashboard.stripe.com (if applicable)
- **Error Tracking**: /monitoring (or Sentry if configured)

### Support

- **Admin Channel**: Slack/Discord (if available)
- **Technical Support**: dev-team@localelore.com
- **Emergency Contact**: [On-call phone number]

---

## Changelog

**v1.0.0** (2025-11-10)
- Initial admin guide created
- All core features documented
- Emergency procedures defined

---

**Document Maintained By**: Development Team  
**Last Review**: 2025-11-10  
**Next Review**: Monthly

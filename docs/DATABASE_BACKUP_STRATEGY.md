# Database Backup & Recovery Strategy

## Overview
Comprehensive backup strategy for LocaleLore production database with automated backups, point-in-time recovery, and verification procedures.

---

## 1. Backup Architecture

### 1.1 Supabase Built-in Backups
**Automatic Daily Backups (Managed by Supabase)**
- **Frequency**: Daily automated backups
- **Retention**: 7 days (free tier), 30 days (Pro plan)
- **Type**: Full database snapshots
- **Storage**: Encrypted in Supabase infrastructure
- **Access**: Via Supabase Dashboard → Database → Backups

### 1.2 Point-in-Time Recovery (PITR)
**Continuous Database State Tracking**
- **Available on**: Pro plan and above
- **Recovery Window**: Up to 30 days
- **Granularity**: Restore to any second within window
- **Use Cases**: 
  - Accidental data deletion
  - Data corruption recovery
  - Rollback after failed migrations

---

## 2. Backup Retention Policy

### Production Database
| Backup Type | Frequency | Retention | Priority |
|-------------|-----------|-----------|----------|
| **Automated Daily** | Every 24h at 02:00 UTC | 30 days | HIGH |
| **Pre-Migration** | Before each migration | 90 days | CRITICAL |
| **Weekly Archive** | Sunday 03:00 UTC | 6 months | MEDIUM |
| **Monthly Archive** | 1st of month 04:00 UTC | 2 years | LOW |

### Development/Staging
| Backup Type | Frequency | Retention | Priority |
|-------------|-----------|-----------|----------|
| **Automated Daily** | Every 24h at 03:00 UTC | 7 days | MEDIUM |
| **Pre-Migration** | Before each migration | 30 days | HIGH |

---

## 3. Automated Backup Procedures

### 3.1 Enable PITR (Point-in-Time Recovery)
```bash
# Via Supabase Dashboard:
# 1. Navigate to Project Settings → Database
# 2. Enable Point-in-time Recovery (PITR)
# 3. Configure retention window (default: 7 days, max: 30 days)
# 4. Monitor WAL (Write-Ahead Log) storage usage
```

### 3.2 Pre-Migration Backup Automation
**Integrated with GitHub Actions**
```yaml
# .github/workflows/database-migration.yml
- name: Create Pre-Migration Backup
  run: |
    # Trigger Supabase backup via API
    curl -X POST "${SUPABASE_URL}/rest/v1/rpc/create_backup" \
      -H "apikey: ${SUPABASE_SERVICE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
      -d '{"backup_name": "pre_migration_'$(date +%Y%m%d_%H%M%S)'"}'
```

### 3.3 Custom Backup Export Function
**Edge Function for Custom Exports**
```typescript
// supabase/functions/backup-database/index.ts
// Exports critical tables to JSON for external storage
```

---

## 4. Backup Verification Procedures

### 4.1 Automated Verification (Weekly)
**Sunday 05:00 UTC - Verify Last Backup Integrity**

1. **Backup Existence Check**
   - Verify backup file exists in Supabase
   - Check backup timestamp is within expected window
   - Validate backup size (should be > 0 bytes)

2. **Data Integrity Check**
   - Sample 10 random records from each critical table
   - Compare record counts with production
   - Verify foreign key constraints

3. **Restore Test (Monthly)**
   - Restore backup to temporary database
   - Run smoke tests on restored data
   - Verify critical queries return expected results
   - Clean up temporary database

### 4.2 Manual Verification Checklist
```markdown
- [ ] Backup file accessible in Supabase Dashboard
- [ ] Backup timestamp matches schedule
- [ ] Backup size reasonable (compare to previous backups)
- [ ] Critical tables present: facts, profiles, user_roles
- [ ] Record counts match production (±5% tolerance)
- [ ] Restore test successful (if monthly verification)
```

---

## 5. Recovery Procedures

### 5.1 Point-in-Time Recovery (PITR)
**Scenario**: Recover from accidental data deletion at 14:30 UTC

```bash
# Via Supabase Dashboard:
# 1. Go to Database → Backups → Point-in-time Recovery
# 2. Select restore point: 14:29:00 UTC (1 minute before deletion)
# 3. Choose restoration target:
#    - Option A: Create new database (recommended for testing)
#    - Option B: Restore to current database (DESTRUCTIVE)
# 4. Confirm and monitor restoration progress
# 5. Verify data integrity post-restore
# 6. Update application connection strings if new database created
```

### 5.2 Full Backup Restore
**Scenario**: Complete database corruption or data loss

```bash
# Via Supabase Dashboard:
# 1. Navigate to Database → Backups
# 2. Select backup to restore (e.g., "Daily Backup - 2025-01-15")
# 3. Click "Restore" → Choose restoration method:
#    - Create new project (safest, recommended)
#    - Restore to current project (CAUTION: overwrites existing data)
# 4. Confirm restoration
# 5. Wait for completion (typically 5-20 minutes depending on size)
# 6. Verify restoration:
#    - Check table counts
#    - Verify recent data exists
#    - Test critical queries
# 7. Update DNS/connection strings if necessary
# 8. Monitor application logs for errors
```

### 5.3 Partial Data Recovery
**Scenario**: Recover specific table or records

```sql
-- Step 1: Restore backup to temporary database (via Supabase Dashboard)
-- Step 2: Connect to temporary database and export specific data

-- Export specific table
COPY (SELECT * FROM facts WHERE deleted_at > '2025-01-15') 
TO STDOUT WITH CSV HEADER;

-- Step 3: Import to production database
COPY facts FROM '/path/to/recovered_data.csv' WITH CSV HEADER;

-- Step 4: Verify data integrity
SELECT COUNT(*) FROM facts WHERE created_at::date = '2025-01-15';

-- Step 5: Drop temporary database
```

---

## 6. Disaster Recovery Plan

### 6.1 Recovery Time Objectives (RTO)
| Scenario | Target RTO | Max Acceptable RTO |
|----------|------------|-------------------|
| PITR (Recent data loss) | 30 minutes | 1 hour |
| Full restore (< 10GB) | 1 hour | 2 hours |
| Full restore (> 10GB) | 2 hours | 4 hours |
| Complete disaster | 4 hours | 8 hours |

### 6.2 Recovery Point Objectives (RPO)
| Data Type | Target RPO | Max Acceptable RPO |
|-----------|------------|-------------------|
| User-generated content | 0 seconds (PITR) | 5 minutes |
| User profiles | 0 seconds (PITR) | 1 hour |
| System configuration | 1 hour | 24 hours |
| Analytics/logs | 24 hours | 7 days |

### 6.3 Disaster Scenarios & Response

#### Scenario A: Accidental Mass Data Deletion
**Detection**: User reports or monitoring alert
**Response**:
1. Immediately stop all write operations (if possible)
2. Identify exact deletion timestamp
3. Initiate PITR to 1 minute before deletion
4. Verify restoration in staging environment
5. Restore to production
6. Monitor for data consistency issues

#### Scenario B: Database Corruption
**Detection**: Database errors, query failures
**Response**:
1. Activate maintenance mode
2. Assess corruption scope
3. Restore from most recent backup
4. If corruption recent, use PITR
5. Run integrity checks
6. Resume operations
7. Investigate corruption cause

#### Scenario C: Complete Supabase Outage
**Detection**: 5xx errors, unable to connect
**Response**:
1. Check Supabase status page
2. Activate read-only mode (if possible)
3. Wait for Supabase recovery (SLA-based)
4. If extended (>4 hours), consider backup restoration to alternative provider
5. Update DNS to point to backup instance
6. Monitor restoration progress

---

## 7. Backup Monitoring & Alerts

### 7.1 Automated Alerts (Recommended Setup)

**Supabase Dashboard Notifications**
- Backup failure alerts
- PITR storage threshold warnings (>80% capacity)
- Backup verification failures

**Custom Monitoring (via Edge Function)**
```typescript
// Scheduled function: Daily at 06:00 UTC
// Checks last backup status and sends alerts

interface BackupStatus {
  last_backup_time: string;
  backup_size_mb: number;
  status: 'success' | 'failed' | 'pending';
  pitr_enabled: boolean;
  pitr_retention_days: number;
}

async function checkBackupHealth(): Promise<void> {
  // 1. Query Supabase for last backup metadata
  // 2. Verify backup is < 36 hours old
  // 3. Check PITR is enabled
  // 4. Validate backup size is reasonable
  // 5. Send alert if any issues detected
}
```

### 7.2 Alert Channels
- **Critical**: PagerDuty / On-call system
- **High**: Email to ops team
- **Medium**: Slack #alerts channel
- **Low**: Daily digest email

---

## 8. Security & Compliance

### 8.1 Backup Encryption
- **At Rest**: AES-256 encryption (Supabase default)
- **In Transit**: TLS 1.3
- **Access Control**: Service role key required
- **Audit**: All backup access logged

### 8.2 Access Control
| Role | Permissions |
|------|-------------|
| **Admin** | Create, restore, delete backups |
| **Ops Team** | Create, restore backups (read-only delete) |
| **Developer** | View backup metadata only |
| **Auditor** | Read-only access to backup logs |

### 8.3 Compliance Requirements
- **GDPR**: Backups included in data retention policies
- **Right to Erasure**: Manual backup purge after user deletion
- **Data Residency**: Backups stored in same region as primary database

---

## 9. Testing & Maintenance

### 9.1 Monthly Backup Drill (First Sunday of Month)
```markdown
# Monthly Backup Recovery Test

## Objective
Verify backup restoration procedures work correctly

## Steps
1. [ ] Select a backup from previous week
2. [ ] Restore to temporary Supabase project
3. [ ] Run smoke tests:
   - [ ] Query 5 critical tables
   - [ ] Verify record counts match expectations
   - [ ] Test foreign key integrity
   - [ ] Validate user authentication works
4. [ ] Document any issues found
5. [ ] Clean up temporary project
6. [ ] Update runbook if procedures changed

## Success Criteria
- Restoration completes in < 30 minutes
- All smoke tests pass
- No data corruption detected

## Participants
- Lead DevOps Engineer (primary)
- Backend Developer (observer)
- DBA (if available)
```

### 9.2 Quarterly Disaster Recovery Simulation
**Full-scale DR test simulating complete data center failure**
- Test complete failover procedures
- Verify RTO/RPO targets are met
- Train team on recovery procedures
- Update documentation based on lessons learned

---

## 10. Implementation Checklist

### Immediate Actions (Week 1)
- [ ] Enable PITR in Supabase Dashboard (Pro plan required)
- [ ] Set retention window to 30 days
- [ ] Document current backup schedule
- [ ] Create backup monitoring dashboard
- [ ] Setup backup failure alerts

### Short-term Actions (Month 1)
- [ ] Implement pre-migration backup automation
- [ ] Create backup verification edge function
- [ ] Schedule first monthly backup drill
- [ ] Document recovery procedures in runbook
- [ ] Train team on restoration procedures

### Long-term Actions (Quarter 1)
- [ ] Implement automated backup verification
- [ ] Setup external backup export (AWS S3/GCS)
- [ ] Create disaster recovery playbooks
- [ ] Conduct full DR simulation
- [ ] Review and optimize retention policies

---

## 11. Backup Cost Analysis

### Supabase Backup Costs (Estimated)
| Plan | Daily Backups | PITR | Storage Cost | Total/Month |
|------|---------------|------|--------------|-------------|
| **Free** | 7 days | ❌ | Included | $0 |
| **Pro** | 30 days | ✅ 7 days | ~$10-50* | $25-75 |
| **Team** | 90 days | ✅ 14 days | ~$20-100* | $50-150 |
| **Enterprise** | Custom | ✅ 30 days | Negotiated | Custom |

*Storage costs vary based on database size and change rate

### Cost Optimization Tips
1. **Tune PITR Retention**: Use 7 days for most use cases
2. **Archive Old Backups**: Export to cheaper external storage
3. **Compress Exports**: Use gzip for long-term archives
4. **Clean Up Test Restores**: Delete temporary databases promptly

---

## 12. Contact & Escalation

### Backup Issues
- **L1 Support**: Check Supabase Dashboard, review alerts
- **L2 Support**: DevOps team, attempt recovery procedures
- **L3 Support**: Contact Supabase support (support@supabase.io)
- **Emergency**: Supabase Enterprise Support (if applicable)

### Escalation Path
1. **0-30 min**: DevOps team investigates
2. **30-60 min**: Escalate to lead engineer
3. **60-120 min**: Contact Supabase support
4. **>2 hours**: Activate disaster recovery plan

---

## Appendix A: Useful SQL Queries

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
```

### Check Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

### Verify Record Counts
```sql
SELECT 
  'facts' as table_name, COUNT(*) as records FROM facts
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
ORDER BY table_name;
```

---

## Appendix B: Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| **DevOps Lead** | TBD | 24/7 on-call |
| **Database Admin** | TBD | Business hours |
| **Supabase Support** | support@supabase.io | 24/7 (Pro+) |
| **Emergency Escalation** | TBD | Critical issues only |

---

**Last Updated**: 2025-01-15  
**Next Review**: 2025-04-15  
**Owner**: DevOps Team  
**Status**: ✅ Active

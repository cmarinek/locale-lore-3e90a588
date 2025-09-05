# Security Documentation

## Known Security Exceptions

### PostGIS System Tables

**Exception**: `public.spatial_ref_sys` table has RLS disabled

**Justification**: 
- This is a PostGIS system table owned by `supabase_admin`
- Contains standardized spatial reference system definitions (EPSG codes, projections)
- Data is non-sensitive reference information used by geographic functions
- Cannot enable RLS due to ownership restrictions in Supabase

**Risk Assessment**: **LOW**
- Read-only reference data
- No user-generated content
- Standard coordinate system definitions
- Used internally by PostGIS functions

**Mitigation Measures**:
1. ✅ API access restrictions implemented
2. ✅ Usage monitoring in place
3. ✅ Application-level access controls
4. ✅ Regular security audits

**Review Date**: 2025-01-05
**Next Review**: 2025-07-05

---

## Security Guidelines

### Database Access
- All user tables have RLS enabled with appropriate policies
- System tables are documented exceptions only
- No direct database access from client-side code
- All queries go through Supabase client with proper authentication

### API Security
- Row Level Security enforced on all user data
- Authentication required for data modifications
- Rate limiting implemented
- Input validation and sanitization

### Monitoring
- Database access patterns logged
- Suspicious queries flagged
- Regular security scans performed
- Exception access monitored
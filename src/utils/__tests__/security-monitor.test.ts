import { validateQuery, POSTGIS_SYSTEM_TABLES, logSystemTableAccess } from '../security-monitor';
import { supabase } from '@/integrations/supabase/client';

jest.mock('@/integrations/supabase/client');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Security Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateQuery', () => {
    it('should block direct access to PostGIS system tables', () => {
      const queries = [
        'SELECT * FROM spatial_ref_sys',
        'UPDATE spatial_ref_sys SET srid = 4326',
        'DELETE FROM geometry_columns',
        'INSERT INTO geography_columns VALUES (1, 2, 3)',
      ];

      queries.forEach(query => {
        expect(validateQuery(query)).toBe(false);
      });
    });

    it('should allow queries to regular tables', () => {
      const queries = [
        'SELECT * FROM users',
        'UPDATE profiles SET name = "John"',
        'INSERT INTO facts VALUES (1, 2, 3)',
        'DELETE FROM comments WHERE id = 1',
      ];

      queries.forEach(query => {
        expect(validateQuery(query)).toBe(true);
      });
    });

    it('should be case-insensitive', () => {
      const queries = [
        'select * from SPATIAL_REF_SYS',
        'SELECT * FROM Spatial_Ref_Sys',
        'SeLeCt * FrOm SpAtIaL_rEf_SyS',
      ];

      queries.forEach(query => {
        expect(validateQuery(query)).toBe(false);
      });
    });
  });

  describe('POSTGIS_SYSTEM_TABLES', () => {
    it('should contain all PostGIS system tables', () => {
      expect(POSTGIS_SYSTEM_TABLES).toContain('spatial_ref_sys');
      expect(POSTGIS_SYSTEM_TABLES).toContain('geometry_columns');
      expect(POSTGIS_SYSTEM_TABLES).toContain('geography_columns');
    });

    it('should have exactly 3 system tables', () => {
      expect(POSTGIS_SYSTEM_TABLES).toHaveLength(3);
    });
  });

  describe('logSystemTableAccess', () => {
    it('should log access to PostGIS system tables', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.auth = {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
        }),
      } as any;

      await logSystemTableAccess('spatial_ref_sys', 'SELECT');

      expect(mockSupabase.from).toHaveBeenCalledWith('user_activity_log');
    });

    it('should not log access to non-system tables', async () => {
      mockSupabase.from = jest.fn();

      await logSystemTableAccess('users', 'SELECT');

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });
});

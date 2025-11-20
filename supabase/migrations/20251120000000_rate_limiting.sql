-- Rate limiting table for edge functions
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  count integer NOT NULL DEFAULT 1,
  reset_at bigint NOT NULL,
  last_request_at bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role can manage rate_limits"
  ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE reset_at < EXTRACT(EPOCH FROM now()) * 1000
  AND last_request_at < EXTRACT(EPOCH FROM now() - interval '1 day') * 1000;
END;
$$;

-- Create index for cleanup function
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup
  ON rate_limits(reset_at, last_request_at);

-- Add comment
COMMENT ON TABLE rate_limits IS 'Stores rate limiting data for edge functions';
COMMENT ON FUNCTION cleanup_expired_rate_limits() IS 'Removes expired rate limit records older than 1 day';

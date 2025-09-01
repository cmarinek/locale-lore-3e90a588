-- Fix security warnings: Add search_path to functions and enable RLS on missing tables

-- Update functions with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_reputation(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(reputation_score, 0)
    FROM public.profiles
    WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.update_fact_vote_counts()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_upvote THEN
            UPDATE public.facts 
            SET vote_count_up = vote_count_up + 1 
            WHERE id = NEW.fact_id;
        ELSE
            UPDATE public.facts 
            SET vote_count_down = vote_count_down + 1 
            WHERE id = NEW.fact_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote change
        IF OLD.is_upvote != NEW.is_upvote THEN
            IF NEW.is_upvote THEN
                UPDATE public.facts 
                SET vote_count_up = vote_count_up + 1, vote_count_down = vote_count_down - 1
                WHERE id = NEW.fact_id;
            ELSE
                UPDATE public.facts 
                SET vote_count_up = vote_count_up - 1, vote_count_down = vote_count_down + 1
                WHERE id = NEW.fact_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_upvote THEN
            UPDATE public.facts 
            SET vote_count_up = vote_count_up - 1 
            WHERE id = OLD.fact_id;
        ELSE
            UPDATE public.facts 
            SET vote_count_down = vote_count_down - 1 
            WHERE id = OLD.fact_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_facts_near_location(
    search_lat DECIMAL,
    search_lng DECIMAL,
    radius_meters INTEGER DEFAULT 1000,
    search_text TEXT DEFAULT '',
    category_filter UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    location_name TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_meters DOUBLE PRECISION,
    category_id UUID,
    status fact_status,
    vote_count_up INTEGER,
    vote_count_down INTEGER,
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        f.id,
        f.title,
        f.description,
        f.location_name,
        f.latitude,
        f.longitude,
        ST_Distance(
            f.geolocation,
            ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)
        ) as distance_meters,
        f.category_id,
        f.status,
        f.vote_count_up,
        f.vote_count_down,
        f.author_id,
        f.created_at
    FROM public.facts f
    WHERE 
        ST_DWithin(
            f.geolocation,
            ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326),
            radius_meters
        )
        AND (search_text = '' OR f.title ILIKE '%' || search_text || '%' OR f.description ILIKE '%' || search_text || '%')
        AND (category_filter IS NULL OR f.category_id = category_filter)
        AND f.status IN ('verified', 'pending')
    ORDER BY distance_meters ASC;
$$;

CREATE OR REPLACE FUNCTION public.calculate_user_reputation(_user_id UUID)
RETURNS INTEGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    reputation INTEGER := 0;
    fact_votes INTEGER := 0;
    verified_facts INTEGER := 0;
BEGIN
    -- Points for upvotes on user's facts
    SELECT COALESCE(SUM(vote_count_up - vote_count_down), 0)
    INTO fact_votes
    FROM public.facts
    WHERE author_id = _user_id;
    
    -- Points for verified facts
    SELECT COUNT(*)
    INTO verified_facts
    FROM public.facts
    WHERE author_id = _user_id AND status = 'verified';
    
    -- Calculate total reputation
    reputation := (fact_votes * 1) + (verified_facts * 10);
    
    -- Update the profile
    UPDATE public.profiles
    SET reputation_score = reputation
    WHERE id = _user_id;
    
    RETURN reputation;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
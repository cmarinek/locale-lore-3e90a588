-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums
CREATE TYPE public.user_role_type AS ENUM ('free', 'contributor', 'admin');
CREATE TYPE public.fact_status AS ENUM ('pending', 'verified', 'disputed', 'rejected');
CREATE TYPE public.notification_type AS ENUM ('vote', 'comment', 'fact_verified', 'fact_disputed', 'mention');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    reputation_score INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id)
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_type DEFAULT 'free' NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    granted_by UUID REFERENCES public.profiles(id),
    UNIQUE(user_id, role)
);

-- Create categories table with multilingual support
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Category translations table
CREATE TABLE public.category_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    UNIQUE(category_id, language_code)
);

-- Create facts table
CREATE TABLE public.facts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    geolocation GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    status fact_status DEFAULT 'pending' NOT NULL,
    media_urls TEXT[],
    author_id UUID NOT NULL REFERENCES public.profiles(id),
    verified_by UUID REFERENCES public.profiles(id),
    vote_count_up INTEGER DEFAULT 0 NOT NULL,
    vote_count_down INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create votes table
CREATE TABLE public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_upvote BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(fact_id, user_id)
);

-- Create saved_facts table
CREATE TABLE public.saved_facts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, fact_id)
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_fact_id UUID REFERENCES public.facts(id) ON DELETE CASCADE,
    related_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_facts_geolocation ON public.facts USING GIST (geolocation);
CREATE INDEX idx_facts_category ON public.facts(category_id);
CREATE INDEX idx_facts_status ON public.facts(status);
CREATE INDEX idx_facts_author ON public.facts(author_id);
CREATE INDEX idx_votes_fact ON public.votes(fact_id);
CREATE INDEX idx_votes_user ON public.votes(user_id);
CREATE INDEX idx_comments_fact ON public.comments(fact_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    );
$$;

-- Helper function to get user reputation
CREATE OR REPLACE FUNCTION public.get_user_reputation(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(reputation_score, 0)
    FROM public.profiles
    WHERE id = _user_id;
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "User roles are viewable by everyone" ON public.user_roles
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage user roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for category_translations
CREATE POLICY "Category translations are viewable by everyone" ON public.category_translations
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage category translations" ON public.category_translations
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for facts
CREATE POLICY "Facts are viewable by everyone" ON public.facts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create facts" ON public.facts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own facts" ON public.facts
    FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete facts" ON public.facts
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for votes
CREATE POLICY "Votes are viewable by everyone" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.votes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_facts
CREATE POLICY "Users can view their own saved facts" ON public.saved_facts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save facts" ON public.saved_facts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own facts" ON public.saved_facts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete comments" ON public.comments
    FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'username', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'free');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION public.update_fact_vote_counts()
RETURNS TRIGGER
LANGUAGE PLPGSQL
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

-- Trigger for vote count updates
CREATE TRIGGER trigger_update_fact_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON public.votes
    FOR EACH ROW EXECUTE PROCEDURE public.update_fact_vote_counts();

-- Function for geospatial search
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

-- Function to calculate user reputation
CREATE OR REPLACE FUNCTION public.calculate_user_reputation(_user_id UUID)
RETURNS INTEGER
LANGUAGE PLPGSQL
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

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facts_updated_at
    BEFORE UPDATE ON public.facts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (slug, icon, color) VALUES
    ('history', '🏛️', 'hsl(210, 100%, 50%)'),
    ('nature', '🌿', 'hsl(120, 60%, 50%)'),
    ('culture', '🎭', 'hsl(270, 70%, 60%)'),
    ('architecture', '🏗️', 'hsl(30, 80%, 55%)'),
    ('legend', '⚡', 'hsl(45, 100%, 60%)'),
    ('food', '🍽️', 'hsl(15, 90%, 65%)'),
    ('mystery', '🔍', 'hsl(300, 50%, 45%)'),
    ('sports', '⚽', 'hsl(180, 70%, 50%)');

-- Insert default category translations (English)
INSERT INTO public.category_translations (category_id, language_code, name, description)
SELECT 
    id,
    'en',
    CASE slug
        WHEN 'history' THEN 'History'
        WHEN 'nature' THEN 'Nature'
        WHEN 'culture' THEN 'Culture'
        WHEN 'architecture' THEN 'Architecture'
        WHEN 'legend' THEN 'Legends'
        WHEN 'food' THEN 'Food & Cuisine'
        WHEN 'mystery' THEN 'Mysteries'
        WHEN 'sports' THEN 'Sports'
    END,
    CASE slug
        WHEN 'history' THEN 'Historical events, people, and places'
        WHEN 'nature' THEN 'Natural wonders, wildlife, and environmental facts'
        WHEN 'culture' THEN 'Cultural traditions, festivals, and customs'
        WHEN 'architecture' THEN 'Buildings, monuments, and architectural marvels'
        WHEN 'legend' THEN 'Local legends, myths, and folklore'
        WHEN 'food' THEN 'Local cuisine, restaurants, and culinary traditions'
        WHEN 'mystery' THEN 'Unexplained phenomena and local mysteries'
        WHEN 'sports' THEN 'Sports history, venues, and achievements'
    END
FROM public.categories;
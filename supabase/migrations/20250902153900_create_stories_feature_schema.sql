-- Migration to create tables for the "Stories" feature

-- 1. Create the main "stories" table
CREATE TABLE public.stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
    title TEXT,
    view_count INTEGER DEFAULT 0 NOT NULL,
    like_count INTEGER DEFAULT 0 NOT NULL,
    comment_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_stories_user_id ON public.stories(user_id);
CREATE INDEX idx_stories_expires_at ON public.stories(expires_at);

-- 2. Create the "story_likes" table
CREATE TABLE public.story_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, story_id)
);

-- 3. Create the "story_comments" table
CREATE TABLE public.story_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_story_comments_story_id ON public.story_comments(story_id);


-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;


-- RLS Policies for "stories" table
CREATE POLICY "Stories are viewable by everyone" ON public.stories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create stories" ON public.stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON public.stories
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for "story_likes" table
CREATE POLICY "Story likes are viewable by everyone" ON public.story_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like stories" ON public.story_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.story_likes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for "story_comments" table
CREATE POLICY "Story comments are viewable by everyone" ON public.story_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment on stories" ON public.story_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.story_comments
    FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));


-- Function to update story like count
CREATE OR REPLACE FUNCTION public.update_story_like_count()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.stories
        SET like_count = like_count + 1
        WHERE id = NEW.story_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.stories
        SET like_count = like_count - 1
        WHERE id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for story like count updates
CREATE TRIGGER trigger_update_story_like_count
    AFTER INSERT OR DELETE ON public.story_likes
    FOR EACH ROW EXECUTE PROCEDURE public.update_story_like_count();

-- Function to update story comment count
CREATE OR REPLACE FUNCTION public.update_story_comment_count()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.stories
        SET comment_count = comment_count + 1
        WHERE id = NEW.story_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.stories
        SET comment_count = comment_count - 1
        WHERE id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for story comment count updates
CREATE TRIGGER trigger_update_story_comment_count
    AFTER INSERT OR DELETE ON public.story_comments
    FOR EACH ROW EXECUTE PROCEDURE public.update_story_comment_count();

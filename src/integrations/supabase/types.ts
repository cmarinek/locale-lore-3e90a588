export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          reason: string | null
          scheduled_deletion: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          reason?: string | null
          scheduled_deletion?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          reason?: string | null
          scheduled_deletion?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          badge_color: string | null
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number | null
          slug: string
        }
        Insert: {
          badge_color?: string | null
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number | null
          slug: string
        }
        Update: {
          badge_color?: string | null
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number | null
          slug?: string
        }
        Relationships: []
      }
      acquisition_jobs: {
        Row: {
          completed_at: string | null
          configuration: Json
          created_at: string
          created_by: string | null
          error_count: number
          error_log: string[] | null
          estimated_completion: string | null
          id: string
          name: string
          processed_count: number
          progress_data: Json | null
          source_type: string
          status: string
          success_count: number
          target_count: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          configuration?: Json
          created_at?: string
          created_by?: string | null
          error_count?: number
          error_log?: string[] | null
          estimated_completion?: string | null
          id?: string
          name: string
          processed_count?: number
          progress_data?: Json | null
          source_type: string
          status?: string
          success_count?: number
          target_count?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          configuration?: Json
          created_at?: string
          created_by?: string | null
          error_count?: number
          error_log?: string[] | null
          estimated_completion?: string | null
          id?: string
          name?: string
          processed_count?: number
          progress_data?: Json | null
          source_type?: string
          status?: string
          success_count?: number
          target_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      acquisition_queue: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          id: string
          item_type: string
          job_id: string
          max_attempts: number
          processed_at: string | null
          result_data: Json | null
          source_data: Json
          source_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          item_type: string
          job_id: string
          max_attempts?: number
          processed_at?: string | null
          result_data?: Json | null
          source_data?: Json
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          item_type?: string
          job_id?: string
          max_attempts?: number
          processed_at?: string | null
          result_data?: Json | null
          source_data?: Json
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "acquisition_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          related_fact_id: string | null
          related_user_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          related_fact_id?: string | null
          related_user_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          related_fact_id?: string | null
          related_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_related_fact_id_fkey"
            columns: ["related_fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          confidence_score: number
          created_at: string
          delivered_at: string | null
          expires_at: string | null
          fact_id: string
          id: string
          is_delivered: boolean | null
          metadata: Json | null
          reasoning: string | null
          recommendation_type: string
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          delivered_at?: string | null
          expires_at?: string | null
          fact_id: string
          id?: string
          is_delivered?: boolean | null
          metadata?: Json | null
          reasoning?: string | null
          recommendation_type: string
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          delivered_at?: string | null
          expires_at?: string | null
          fact_id?: string
          id?: string
          is_delivered?: boolean | null
          metadata?: Json | null
          reasoning?: string | null
          recommendation_type?: string
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_reports: {
        Row: {
          actual_behavior: string | null
          browser_info: Json | null
          created_at: string
          description: string
          expected_behavior: string | null
          id: string
          priority: string
          status: string
          steps_to_reproduce: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_behavior?: string | null
          browser_info?: Json | null
          created_at?: string
          description: string
          expected_behavior?: string | null
          id?: string
          priority?: string
          status?: string
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_behavior?: string | null
          browser_info?: Json | null
          created_at?: string
          description?: string
          expected_behavior?: string | null
          id?: string
          priority?: string
          status?: string
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      build_logs: {
        Row: {
          app_name: string
          build_config: Json | null
          build_id: string
          bundle_id: string
          completed_at: string | null
          created_at: string | null
          download_url: string | null
          error_message: string | null
          expires_at: string | null
          id: string
          platform: string
          progress: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          app_name: string
          build_config?: Json | null
          build_id: string
          bundle_id: string
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          platform: string
          progress?: number | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          app_name?: string
          build_config?: Json | null
          build_id?: string
          bundle_id?: string
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          platform?: string
          progress?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          slug?: string
        }
        Relationships: []
      }
      category_translations: {
        Row: {
          category_id: string
          description: string | null
          id: string
          language_code: string
          name: string
        }
        Insert: {
          category_id: string
          description?: string | null
          id?: string
          language_code: string
          name: string
        }
        Update: {
          category_id?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          end_date: string | null
          id: string
          is_active: boolean
          reward_badge_id: string | null
          reward_points: number
          start_date: string
          target_action: string
          target_value: number
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          reward_badge_id?: string | null
          reward_points?: number
          start_date?: string
          target_action: string
          target_value: number
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          reward_badge_id?: string | null
          reward_points?: number
          start_date?: string
          target_action?: string
          target_value?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_reward_badge_id_fkey"
            columns: ["reward_badge_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          is_upvote: boolean
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          is_upvote: boolean
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          is_upvote?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "fact_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          fact_id: string
          id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          fact_id: string
          id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          fact_id?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_content_id: string
          reported_content_type: string
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_content_id: string
          reported_content_type: string
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_content_id?: string
          reported_content_type?: string
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          expires_at: string | null
          export_type: string
          file_url: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          export_type?: string
          file_url?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          export_type?: string
          file_url?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      discovery_of_the_day: {
        Row: {
          ai_summary: string
          created_at: string
          date: string
          engagement_score: number | null
          fact_id: string
          fun_fact: string | null
          id: string
        }
        Insert: {
          ai_summary: string
          created_at?: string
          date?: string
          engagement_score?: number | null
          fact_id: string
          fun_fact?: string | null
          id?: string
        }
        Update: {
          ai_summary?: string
          created_at?: string
          date?: string
          engagement_score?: number | null
          fact_id?: string
          fun_fact?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_of_the_day_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_notifications: {
        Row: {
          action_url: string | null
          body: string
          bundle_id: string | null
          campaign_id: string | null
          category: string
          channels_used: string[] | null
          clicked_at: string | null
          context: Json | null
          created_at: string
          data: Json | null
          delivered_at: string | null
          dismissed_at: string | null
          experiment_id: string | null
          expires_at: string | null
          group_key: string | null
          icon_url: string | null
          id: string
          image_url: string | null
          interaction_count: number | null
          priority: Database["public"]["Enums"]["notification_priority"] | null
          read_at: string | null
          scheduled_for: string | null
          source_app: string | null
          status: Database["public"]["Enums"]["notification_status"] | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
          view_duration_seconds: number | null
        }
        Insert: {
          action_url?: string | null
          body: string
          bundle_id?: string | null
          campaign_id?: string | null
          category: string
          channels_used?: string[] | null
          clicked_at?: string | null
          context?: Json | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          dismissed_at?: string | null
          experiment_id?: string | null
          expires_at?: string | null
          group_key?: string | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          interaction_count?: number | null
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          scheduled_for?: string | null
          source_app?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id: string
          view_duration_seconds?: number | null
        }
        Update: {
          action_url?: string | null
          body?: string
          bundle_id?: string | null
          campaign_id?: string | null
          category?: string
          channels_used?: string[] | null
          clicked_at?: string | null
          context?: Json | null
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          dismissed_at?: string | null
          experiment_id?: string | null
          expires_at?: string | null
          group_key?: string | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          interaction_count?: number | null
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          scheduled_for?: string | null
          source_app?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          view_duration_seconds?: number | null
        }
        Relationships: []
      }
      fact_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          depth: number | null
          fact_id: string
          id: string
          is_verified: boolean | null
          parent_id: string | null
          reply_count: number | null
          updated_at: string
          verified_by: string | null
          vote_count_down: number | null
          vote_count_up: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          depth?: number | null
          fact_id: string
          id?: string
          is_verified?: boolean | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string
          verified_by?: string | null
          vote_count_down?: number | null
          vote_count_up?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          depth?: number | null
          fact_id?: string
          id?: string
          is_verified?: boolean | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string
          verified_by?: string | null
          vote_count_down?: number | null
          vote_count_up?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_comments_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fact_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_reactions: {
        Row: {
          created_at: string | null
          fact_id: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fact_id: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fact_id?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_reactions_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_shares: {
        Row: {
          created_at: string | null
          fact_id: string
          id: string
          platform: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fact_id: string
          id?: string
          platform: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fact_id?: string
          id?: string
          platform?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_shares_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facts: {
        Row: {
          author_id: string | null
          category_id: string
          created_at: string
          description: string
          geolocation: unknown | null
          id: string
          image_url: string | null
          latitude: number
          location_name: string
          longitude: number
          media_urls: string[] | null
          status: Database["public"]["Enums"]["fact_status"]
          title: string
          updated_at: string
          verified_by: string | null
          vote_count_down: number
          vote_count_up: number
        }
        Insert: {
          author_id?: string | null
          category_id: string
          created_at?: string
          description: string
          geolocation?: unknown | null
          id?: string
          image_url?: string | null
          latitude: number
          location_name: string
          longitude: number
          media_urls?: string[] | null
          status?: Database["public"]["Enums"]["fact_status"]
          title: string
          updated_at?: string
          verified_by?: string | null
          vote_count_down?: number
          vote_count_up?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string
          created_at?: string
          description?: string
          geolocation?: unknown | null
          id?: string
          image_url?: string | null
          latitude?: number
          location_name?: string
          longitude?: number
          media_urls?: string[] | null
          status?: Database["public"]["Enums"]["fact_status"]
          title?: string
          updated_at?: string
          verified_by?: string | null
          vote_count_down?: number
          vote_count_up?: number
        }
        Relationships: [
          {
            foreignKeyName: "facts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facts_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_featured: boolean
          order_index: number
          question: string
          updated_at: string
          view_count: number
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          order_index?: number
          question: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          order_index?: number
          question?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      feature_request_votes: {
        Row: {
          created_at: string
          feature_request_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_request_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_request_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_request_votes_feature_request_id_fkey"
            columns: ["feature_request_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
          vote_count: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
          vote_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          vote_count?: number
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          created_at: string
          id: string
          leaderboard_type: string
          location_filter: string | null
          period_end: string
          period_start: string
          rank: number | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leaderboard_type: string
          location_filter?: string | null
          period_end?: string
          period_start?: string
          rank?: number | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leaderboard_type?: string
          location_filter?: string | null
          period_end?: string
          period_start?: string
          rank?: number | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      location_qr_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          latitude: number
          location_name: string
          longitude: number
          scan_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          latitude: number
          location_name: string
          longitude: number
          scan_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          latitude?: number
          location_name?: string
          longitude?: number
          scan_count?: number | null
        }
        Relationships: []
      }
      location_triggers: {
        Row: {
          created_at: string
          fact_id: string
          id: string
          is_active: boolean | null
          max_triggers_per_user: number | null
          notification_body: string
          notification_title: string
          trigger_location: unknown
          trigger_radius: number
        }
        Insert: {
          created_at?: string
          fact_id: string
          id?: string
          is_active?: boolean | null
          max_triggers_per_user?: number | null
          notification_body: string
          notification_title: string
          trigger_location: unknown
          trigger_radius?: number
        }
        Update: {
          created_at?: string
          fact_id?: string
          id?: string
          is_active?: boolean | null
          max_triggers_per_user?: number | null
          notification_body?: string
          notification_title?: string
          trigger_location?: unknown
          trigger_radius?: number
        }
        Relationships: [
          {
            foreignKeyName: "location_triggers_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_submissions: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_draft: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          media_urls: string[] | null
          step_completed: number | null
          submission_data: Json | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_draft?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          media_urls?: string[] | null
          step_completed?: number | null
          submission_data?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_draft?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          media_urls?: string[] | null
          step_completed?: number | null
          submission_data?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_analytics: {
        Row: {
          browser: string | null
          channel: string
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          location_city: string | null
          location_country: string | null
          notification_id: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          channel: string
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          location_city?: string | null
          location_country?: string | null
          notification_id: string
          user_id: string
        }
        Update: {
          browser?: string | null
          channel?: string
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          location_city?: string | null
          location_country?: string | null
          notification_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_bundles: {
        Row: {
          category: string
          collapse_after_count: number | null
          created_at: string
          id: string
          is_collapsed: boolean | null
          is_read: boolean | null
          last_activity_at: string | null
          max_notifications: number | null
          notification_count: number | null
          summary: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          collapse_after_count?: number | null
          created_at?: string
          id?: string
          is_collapsed?: boolean | null
          is_read?: boolean | null
          last_activity_at?: string | null
          max_notifications?: number | null
          notification_count?: number | null
          summary: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          collapse_after_count?: number | null
          created_at?: string
          id?: string
          is_collapsed?: boolean | null
          is_read?: boolean | null
          last_activity_at?: string | null
          max_notifications?: number | null
          notification_count?: number | null
          summary?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          ai_optimization_enabled: boolean | null
          category_preferences: Json | null
          created_at: string
          digest_frequency: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          location_based_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          smart_bundling_enabled: boolean | null
          sms_enabled: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_optimization_enabled?: boolean | null
          category_preferences?: Json | null
          created_at?: string
          digest_frequency?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          location_based_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          smart_bundling_enabled?: boolean | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_optimization_enabled?: boolean | null
          category_preferences?: Json | null
          created_at?: string
          digest_frequency?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          location_based_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          smart_bundling_enabled?: boolean | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_comment_id: string | null
          related_fact_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_comment_id?: string | null
          related_fact_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_comment_id?: string | null
          related_fact_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_comment_id_fkey"
            columns: ["related_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_fact_id_fkey"
            columns: ["related_fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_sessions: {
        Row: {
          amount: number
          created_at: string
          id: string
          session_id: string
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          session_id: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          session_id?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_id: string | null
          tier: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          tier?: string | null
          type?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          tier?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          favorite_cities: Json | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_public: boolean | null
          reputation_score: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          favorite_cities?: Json | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          is_public?: boolean | null
          reputation_score?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          favorite_cities?: Json | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_public?: boolean | null
          reputation_score?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          browser: string | null
          created_at: string
          device_type: string | null
          endpoint: string
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          os: string | null
          p256dh_key: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          browser?: string | null
          created_at?: string
          device_type?: string | null
          endpoint: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          os?: string | null
          p256dh_key: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          browser?: string | null
          created_at?: string
          device_type?: string | null
          endpoint?: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          os?: string | null
          p256dh_key?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_facts: {
        Row: {
          created_at: string
          fact_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fact_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fact_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_facts_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_facts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_locations: {
        Row: {
          created_at: string
          fact_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          fact_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          fact_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_locations_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          name: string
          notification_enabled: boolean | null
          query: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          name: string
          notification_enabled?: boolean | null
          query: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string
          notification_enabled?: boolean | null
          query?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          created_at: string
          id: string
          query: string
          query_embedding: string | null
          results_count: number
          search_context: Json | null
          selected_results: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          query_embedding?: string | null
          results_count?: number
          search_context?: Json | null
          selected_results?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          query_embedding?: string | null
          results_count?: number
          search_context?: Json | null
          selected_results?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          clicked_result_id: string | null
          created_at: string
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          user_id: string
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          user_id: string
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          comment_count: number
          content: string
          created_at: string
          expires_at: string
          geolocation: unknown | null
          hashtags: string[] | null
          id: string
          is_active: boolean
          is_trending: boolean
          latitude: number | null
          like_count: number
          location_name: string | null
          longitude: number | null
          media_type: string
          media_urls: string[] | null
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          comment_count?: number
          content: string
          created_at?: string
          expires_at?: string
          geolocation?: unknown | null
          hashtags?: string[] | null
          id?: string
          is_active?: boolean
          is_trending?: boolean
          latitude?: number | null
          like_count?: number
          location_name?: string | null
          longitude?: number | null
          media_type: string
          media_urls?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          comment_count?: number
          content?: string
          created_at?: string
          expires_at?: string
          geolocation?: unknown | null
          hashtags?: string[] | null
          id?: string
          is_active?: boolean
          is_trending?: boolean
          latitude?: number | null
          like_count?: number
          location_name?: string | null
          longitude?: number | null
          media_type?: string
          media_urls?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_likes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          ip_address: unknown | null
          session_id: string | null
          story_id: string
          user_agent: string | null
          user_id: string | null
          viewed_at: string
          watch_duration: number | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          story_id: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          watch_duration?: number | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          story_id?: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          watch_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          contributor_since: string | null
          created_at: string
          email: string
          id: string
          is_contributor: boolean | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contributor_since?: string | null
          created_at?: string
          email: string
          id?: string
          is_contributor?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contributor_since?: string | null
          created_at?: string
          email?: string
          id?: string
          is_contributor?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          is_staff_reply: boolean
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_staff_reply?: boolean
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_staff_reply?: boolean
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      trending_facts: {
        Row: {
          comment_count: number | null
          created_at: string
          fact_id: string
          id: string
          period_end: string
          period_start: string
          score: number
          share_count: number | null
          view_count: number | null
          vote_count: number | null
        }
        Insert: {
          comment_count?: number | null
          created_at?: string
          fact_id: string
          id?: string
          period_end: string
          period_start: string
          score?: number
          share_count?: number | null
          view_count?: number | null
          vote_count?: number | null
        }
        Update: {
          comment_count?: number | null
          created_at?: string
          fact_id?: string
          id?: string
          period_end?: string
          period_start?: string
          score?: number
          share_count?: number | null
          view_count?: number | null
          vote_count?: number | null
        }
        Relationships: []
      }
      trending_locations: {
        Row: {
          created_at: string
          fact_count: number | null
          id: string
          latitude: number
          location_name: string
          longitude: number
          period_end: string
          period_start: string
          score: number
          view_count: number | null
        }
        Insert: {
          created_at?: string
          fact_count?: number | null
          id?: string
          latitude: number
          location_name: string
          longitude: number
          period_end: string
          period_start: string
          score?: number
          view_count?: number | null
        }
        Update: {
          created_at?: string
          fact_count?: number | null
          id?: string
          latitude?: number
          location_name?: string
          longitude?: number
          period_end?: string
          period_start?: string
          score?: number
          view_count?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          location: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          location?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          location?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          current_progress: number
          id: string
          is_completed: boolean
          started_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_discovery_history: {
        Row: {
          context: Json | null
          created_at: string
          device_info: Json | null
          dwell_time: number | null
          fact_id: string
          id: string
          interaction_type: string
          location: unknown | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          device_info?: Json | null
          dwell_time?: number | null
          fact_id: string
          id?: string
          interaction_type: string
          location?: unknown | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          device_info?: Json | null
          dwell_time?: number | null
          fact_id?: string
          id?: string
          interaction_type?: string
          location?: unknown | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_discovery_history_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          message: string
          page_url: string | null
          rating: number | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_type: string
          id?: string
          message: string
          page_url?: string | null
          rating?: number | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          message?: string
          page_url?: string | null
          rating?: number | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          created_at: string
          current_level: number
          current_xp: number
          id: string
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_taken: string | null
          body: string
          data: Json | null
          delivered_at: string | null
          id: string
          is_read: boolean | null
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          body: string
          data?: Json | null
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          body?: string
          data?: Json | null
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          points: number
          related_comment_id: string | null
          related_fact_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          points: number
          related_comment_id?: string | null
          related_fact_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          related_comment_id?: string | null
          related_fact_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_related_comment_id_fkey"
            columns: ["related_comment_id"]
            isOneToOne: false
            referencedRelation: "fact_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_points_related_fact_id_fkey"
            columns: ["related_fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          category_preferences: Json
          created_at: string
          discovery_time_preferences: Json
          id: string
          interaction_patterns: Json
          last_location: unknown | null
          location_preferences: Json
          notification_preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          category_preferences?: Json
          created_at?: string
          discovery_time_preferences?: Json
          id?: string
          interaction_patterns?: Json
          last_location?: unknown | null
          location_preferences?: Json
          notification_preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          category_preferences?: Json
          created_at?: string
          discovery_time_preferences?: Json
          id?: string
          interaction_patterns?: Json
          last_location?: unknown | null
          location_preferences?: Json
          notification_preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rate_limits: {
        Row: {
          action_count: number | null
          action_type: string
          id: string
          last_action: string
          user_id: string
          window_start: string
        }
        Insert: {
          action_count?: number | null
          action_type: string
          id?: string
          last_action?: string
          user_id: string
          window_start?: string
        }
        Update: {
          action_count?: number | null
          action_type?: string
          id?: string
          last_action?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          created_at: string
          expires_at: string | null
          fact_id: string
          id: string
          reason: string | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          fact_id: string
          id?: string
          reason?: string | null
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          fact_id?: string
          id?: string
          reason?: string | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          comments_made: number | null
          created_at: string
          facts_verified: number | null
          id: string
          last_activity_date: string | null
          streak_days: number | null
          total_score: number | null
          updated_at: string
          user_id: string
          votes_cast: number | null
          votes_received: number | null
        }
        Insert: {
          comments_made?: number | null
          created_at?: string
          facts_verified?: number | null
          id?: string
          last_activity_date?: string | null
          streak_days?: number | null
          total_score?: number | null
          updated_at?: string
          user_id: string
          votes_cast?: number | null
          votes_received?: number | null
        }
        Update: {
          comments_made?: number | null
          created_at?: string
          facts_verified?: number | null
          id?: string
          last_activity_date?: string | null
          streak_days?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
          votes_cast?: number | null
          votes_received?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          activity_tracking: boolean
          created_at: string
          data_processing_consent: boolean
          discovery_radius: number
          email_notifications: boolean
          id: string
          in_app_notifications: boolean
          language: string
          location_sharing: boolean
          marketing_emails: boolean
          profile_visibility: string
          push_notifications: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_tracking?: boolean
          created_at?: string
          data_processing_consent?: boolean
          discovery_radius?: number
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          language?: string
          location_sharing?: boolean
          marketing_emails?: boolean
          profile_visibility?: string
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_tracking?: boolean
          created_at?: string
          data_processing_consent?: boolean
          discovery_radius?: number
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          language?: string
          location_sharing?: boolean
          marketing_emails?: boolean
          profile_visibility?: string
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          achievements_earned: number
          comments_made: number
          created_at: string
          current_streak: number
          facts_submitted: number
          facts_verified: number
          id: string
          last_activity: string | null
          locations_discovered: number
          longest_streak: number
          profile_views: number
          total_points: number
          updated_at: string
          user_id: string
          votes_cast: number
        }
        Insert: {
          achievements_earned?: number
          comments_made?: number
          created_at?: string
          current_streak?: number
          facts_submitted?: number
          facts_verified?: number
          id?: string
          last_activity?: string | null
          locations_discovered?: number
          longest_streak?: number
          profile_views?: number
          total_points?: number
          updated_at?: string
          user_id: string
          votes_cast?: number
        }
        Update: {
          achievements_earned?: number
          comments_made?: number
          created_at?: string
          current_streak?: number
          facts_submitted?: number
          facts_verified?: number
          id?: string
          last_activity?: string | null
          locations_discovered?: number
          longest_streak?: number
          profile_views?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          votes_cast?: number
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string
          evidence_text: string | null
          evidence_urls: string[] | null
          fact_id: string
          id: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          evidence_text?: string | null
          evidence_urls?: string[] | null
          fact_id: string
          id?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          evidence_text?: string | null
          evidence_urls?: string[] | null
          fact_id?: string
          id?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          fact_id: string
          id: string
          is_upvote: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          fact_id: string
          id?: string
          is_upvote: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          fact_id?: string
          id?: string
          is_upvote?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      add_to_bundle: {
        Args: { p_bundle_id: string; p_notification_id: string }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      audit_table_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_count: number
          rls_enabled: boolean
          security_status: string
          table_name: string
        }[]
      }
      award_points: {
        Args: {
          p_action_type: string
          p_description?: string
          p_points: number
          p_related_comment_id?: string
          p_related_fact_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_user_reputation: {
        Args: { _user_id: string }
        Returns: number
      }
      calculate_user_similarity: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      check_rls_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_system_table: boolean
          rls_enabled: boolean
          table_name: string
        }[]
      }
      cleanup_expired_builds: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification_bundle: {
        Args: {
          p_category: string
          p_summary: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      generate_user_recommendations: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_fact_clusters: {
        Args:
          | {
              p_east: number
              p_north: number
              p_south: number
              p_west: number
              p_zoom: number
            }
          | {
              p_east: number
              p_north: number
              p_south: number
              p_west: number
              p_zoom?: number
            }
        Returns: {
          cluster_bounds: Json
          cluster_count: number
          cluster_id: string
          cluster_latitude: number
          cluster_longitude: number
        }[]
      }
      get_nearby_triggers: {
        Args: { max_distance?: number; user_lat: number; user_lng: number }
        Returns: {
          body: string
          distance_meters: number
          fact_id: string
          title: string
          trigger_id: string
        }[]
      }
      get_notification_preferences: {
        Args: { p_user_id: string }
        Returns: {
          category_preferences: Json
          email_enabled: boolean
          in_app_enabled: boolean
          push_enabled: boolean
          smart_bundling_enabled: boolean
        }[]
      }
      get_optimized_fact_clusters: {
        Args: {
          p_east: number
          p_limit?: number
          p_north: number
          p_south: number
          p_west: number
          p_zoom?: number
        }
        Returns: {
          cluster_bounds: Json
          cluster_count: number
          cluster_id: string
          cluster_latitude: number
          cluster_longitude: number
          sample_facts: Json
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_user_reputation: {
        Args: { _user_id: string }
        Returns: number
      }
      get_xp_for_level: {
        Args: { level: number }
        Returns: number
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args:
          | {
              _role: Database["public"]["Enums"]["user_role_type"]
              _user_id: string
            }
          | { _role: string; _user_id: string }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_notification_read: {
        Args: { p_channel?: string; p_notification_id: string }
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: number
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search_facts_near_location: {
        Args: {
          category_filter?: string
          radius_meters?: number
          search_lat: number
          search_lng: number
          search_text?: string
        }
        Returns: {
          author_id: string
          category_id: string
          created_at: string
          description: string
          distance_meters: number
          id: string
          latitude: number
          location_name: string
          longitude: number
          status: Database["public"]["Enums"]["fact_status"]
          title: string
          vote_count_down: number
          vote_count_up: number
        }[]
      }
      security_status_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          details: string
          item: string
          status: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_trending_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_trending_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      fact_status: "pending" | "verified" | "disputed" | "rejected"
      notification_priority: "low" | "normal" | "high" | "urgent"
      notification_status:
        | "pending"
        | "delivered"
        | "read"
        | "clicked"
        | "dismissed"
        | "expired"
      notification_type:
        | "vote"
        | "comment"
        | "fact_verified"
        | "fact_disputed"
        | "mention"
      user_role_type: "free" | "contributor" | "admin"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      fact_status: ["pending", "verified", "disputed", "rejected"],
      notification_priority: ["low", "normal", "high", "urgent"],
      notification_status: [
        "pending",
        "delivered",
        "read",
        "clicked",
        "dismissed",
        "expired",
      ],
      notification_type: [
        "vote",
        "comment",
        "fact_verified",
        "fact_disputed",
        "mention",
      ],
      user_role_type: ["free", "contributor", "admin"],
    },
  },
} as const

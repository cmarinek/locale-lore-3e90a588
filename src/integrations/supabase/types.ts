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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          referrer: string | null
          session_id: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          url?: string | null
        }
        Relationships: []
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
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          thread_id?: string
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
      error_logs: {
        Row: {
          created_at: string | null
          error_context: Json | null
          error_message: string
          error_stack: string | null
          id: string
          session_id: string | null
          url: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          error_context?: Json | null
          error_message: string
          error_stack?: string | null
          id?: string
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          error_context?: Json | null
          error_message?: string
          error_stack?: string | null
          id?: string
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      expert_badges: {
        Row: {
          badge_level: number
          badge_type: string
          expires_at: string | null
          id: string
          issued_by: string
          location_area: string | null
          requirements_met: string[]
          specialization: string | null
          user_id: string
          verification_date: string
        }
        Insert: {
          badge_level?: number
          badge_type: string
          expires_at?: string | null
          id?: string
          issued_by: string
          location_area?: string | null
          requirements_met?: string[]
          specialization?: string | null
          user_id: string
          verification_date?: string
        }
        Update: {
          badge_level?: number
          badge_type?: string
          expires_at?: string | null
          id?: string
          issued_by?: string
          location_area?: string | null
          requirements_met?: string[]
          specialization?: string | null
          user_id?: string
          verification_date?: string
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
            foreignKeyName: "fact_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          geolocation: unknown
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
          geolocation?: unknown
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
          geolocation?: unknown
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
      location_claims: {
        Row: {
          benefits_enabled: Json | null
          business_name: string | null
          business_type: string | null
          claim_status: string
          claimed_at: string
          id: string
          latitude: number
          location_name: string
          longitude: number
          user_id: string
          verification_documents: string[] | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          benefits_enabled?: Json | null
          business_name?: string | null
          business_type?: string | null
          claim_status?: string
          claimed_at?: string
          id?: string
          latitude: number
          location_name: string
          longitude: number
          user_id: string
          verification_documents?: string[] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          benefits_enabled?: Json | null
          business_name?: string | null
          business_type?: string | null
          claim_status?: string
          claimed_at?: string
          id?: string
          latitude?: number
          location_name?: string
          longitude?: number
          user_id?: string
          verification_documents?: string[] | null
          verified_at?: string | null
          verified_by?: string | null
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
      map_drawings: {
        Row: {
          coordinates: Json
          created_at: string
          description: string | null
          drawing_type: string
          id: string
          is_public: boolean | null
          name: string
          share_token: string | null
          style_properties: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coordinates: Json
          created_at?: string
          description?: string | null
          drawing_type: string
          id?: string
          is_public?: boolean | null
          name: string
          share_token?: string | null
          style_properties?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coordinates?: Json
          created_at?: string
          description?: string | null
          drawing_type?: string
          id?: string
          is_public?: boolean | null
          name?: string
          share_token?: string | null
          style_properties?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          file_url: string
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_url: string
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_url?: string
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
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
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          labels: Json | null
          metric_name: string
          metric_value: number
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          labels?: Json | null
          metric_name: string
          metric_value: number
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          labels?: Json | null
          metric_name?: string
          metric_value?: number
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      premium_content: {
        Row: {
          content_type: string
          content_url: string
          created_at: string
          creator_id: string
          currency: string
          description: string
          discovery_id: string
          id: string
          preview_content: string | null
          price: number
          purchase_count: number
          rating: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          content_url: string
          created_at?: string
          creator_id: string
          currency?: string
          description: string
          discovery_id: string
          id?: string
          preview_content?: string | null
          price: number
          purchase_count?: number
          rating?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          content_url?: string
          created_at?: string
          creator_id?: string
          currency?: string
          description?: string
          discovery_id?: string
          id?: string
          preview_content?: string | null
          price?: number
          purchase_count?: number
          rating?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_content_discovery_id_fkey"
            columns: ["discovery_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
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
      promo_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at: string
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
          used_count?: number
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
      security_scan_history: {
        Row: {
          categories: Json
          created_at: string
          critical_count: number
          findings: Json
          high_count: number
          id: string
          low_count: number
          medium_count: number
          scan_date: string
          scan_duration_ms: number | null
          security_score: number
          total_findings: number
        }
        Insert: {
          categories?: Json
          created_at?: string
          critical_count?: number
          findings?: Json
          high_count?: number
          id?: string
          low_count?: number
          medium_count?: number
          scan_date?: string
          scan_duration_ms?: number | null
          security_score: number
          total_findings?: number
        }
        Update: {
          categories?: Json
          created_at?: string
          critical_count?: number
          findings?: Json
          high_count?: number
          id?: string
          low_count?: number
          medium_count?: number
          scan_date?: string
          scan_duration_ms?: number | null
          security_score?: number
          total_findings?: number
        }
        Relationships: []
      }
      site_announcements: {
        Row: {
          background_color: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          starts_at: string | null
          text_color: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          starts_at?: string | null
          text_color?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          starts_at?: string | null
          text_color?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_configuration: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
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
      sponsored_partnerships: {
        Row: {
          brand_id: string
          budget: number
          campaign_type: string
          created_at: string
          creator_id: string
          currency: string
          deliverables: string[] | null
          description: string
          end_date: string
          id: string
          requirements: string[] | null
          start_date: string
          status: string
          title: string
        }
        Insert: {
          brand_id: string
          budget: number
          campaign_type: string
          created_at?: string
          creator_id: string
          currency?: string
          deliverables?: string[] | null
          description: string
          end_date: string
          id?: string
          requirements?: string[] | null
          start_date: string
          status?: string
          title: string
        }
        Update: {
          brand_id?: string
          budget?: number
          campaign_type?: string
          created_at?: string
          creator_id?: string
          currency?: string
          deliverables?: string[] | null
          description?: string
          end_date?: string
          id?: string
          requirements?: string[] | null
          start_date?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          comment_count: number
          content: string
          created_at: string
          expires_at: string
          geolocation: unknown
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
          geolocation?: unknown
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
          geolocation?: unknown
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
          ip_address: unknown
          session_id: string | null
          story_id: string
          user_agent: string | null
          user_id: string | null
          viewed_at: string
          watch_duration: number | null
        }
        Insert: {
          id?: string
          ip_address?: unknown
          session_id?: string | null
          story_id: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          watch_duration?: number | null
        }
        Update: {
          id?: string
          ip_address?: unknown
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
      tip_jars: {
        Row: {
          created_at: string
          custom_message: string | null
          description: string | null
          display_name: string
          id: string
          is_enabled: boolean
          suggested_amounts: number[] | null
          tip_count: number
          total_received: number
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_enabled?: boolean
          suggested_amounts?: number[] | null
          tip_count?: number
          total_received?: number
          user_id: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_enabled?: boolean
          suggested_amounts?: number[] | null
          tip_count?: number
          total_received?: number
          user_id?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          amount: number
          created_at: string
          currency: string
          discovery_id: string | null
          id: string
          message: string | null
          processed_at: string | null
          recipient_id: string
          sender_id: string
          status: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          discovery_id?: string | null
          id?: string
          message?: string | null
          processed_at?: string | null
          recipient_id: string
          sender_id: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          discovery_id?: string | null
          id?: string
          message?: string | null
          processed_at?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_discovery_id_fkey"
            columns: ["discovery_id"]
            isOneToOne: false
            referencedRelation: "facts"
            referencedColumns: ["id"]
          },
        ]
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
          ip_address: unknown
          location: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          location?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          location?: unknown
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
          location: unknown
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
          location?: unknown
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
          location?: unknown
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
          last_location: unknown
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
          last_location?: unknown
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
          last_location?: unknown
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
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
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
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
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
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
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
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
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
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      add_to_bundle: {
        Args: { p_bundle_id: string; p_notification_id: string }
        Returns: boolean
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      audit_table_security: {
        Args: never
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
      calculate_user_reputation: { Args: { _user_id: string }; Returns: number }
      calculate_user_similarity: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      check_rls_status: {
        Args: never
        Returns: {
          is_system_table: boolean
          rls_enabled: boolean
          table_name: string
        }[]
      }
      cleanup_expired_builds: { Args: never; Returns: undefined }
      cleanup_expired_stories: { Args: never; Returns: undefined }
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
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      generate_user_recommendations: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
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
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
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
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_fact_clusters:
        | {
            Args: {
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
        | {
            Args: {
              p_east: number
              p_north: number
              p_south: number
              p_west: number
              p_zoom: number
            }
            Returns: {
              cluster_bounds: string
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
      get_user_reputation: { Args: { _user_id: string }; Returns: number }
      get_xp_for_level: { Args: { level: number }; Returns: number }
      gettransactionid: { Args: never; Returns: unknown }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["user_role_type"]
              _user_id: string
            }
            Returns: boolean
          }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_notification_read: {
        Args: { p_channel?: string; p_notification_id: string }
        Returns: boolean
      }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
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
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
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
        Args: never
        Returns: {
          category: string
          details: string
          item: string
          status: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
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
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
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
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
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
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
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
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
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
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
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
      st_generatepoints:
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
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
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
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
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
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
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
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
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
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
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
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
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unaccent: { Args: { "": string }; Returns: string }
      unlockrows: { Args: { "": string }; Returns: number }
      update_trending_scores: { Args: never; Returns: undefined }
      update_trending_stories: { Args: never; Returns: undefined }
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
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
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

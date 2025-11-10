import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { HelpCircle, Users, Trophy, Shield, DollarSign, MapPin } from 'lucide-react';

const FAQ = () => {
  const faqSections = [
    {
      title: 'General Questions',
      icon: HelpCircle,
      questions: [
        {
          q: 'What is LocaleLore?',
          a: 'LocaleLore is a community-driven platform for discovering and sharing local stories, hidden gems, and fascinating facts about places around the world. Users can explore discoveries on an interactive map, contribute their own content, and earn rewards for quality contributions.',
        },
        {
          q: 'Is LocaleLore free to use?',
          a: 'Yes! LocaleLore is free to use. You can explore content, submit facts, and participate in the community without any cost. We also offer optional premium subscriptions with additional features and benefits.',
        },
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button in the navigation menu. You can create an account using your email address and password, or sign up quickly using your Google account. After signing up, verify your email address to activate all features.',
        },
        {
          q: 'Is my data safe and private?',
          a: 'Absolutely. We take your privacy seriously. We use industry-standard encryption, secure authentication, and row-level security in our database. You have full control over your privacy settings. Read our Privacy Policy for complete details.',
        },
        {
          q: 'Can I use LocaleLore on mobile?',
          a: 'Yes! LocaleLore works great on mobile browsers and is a Progressive Web App (PWA), which means you can install it on your phone for an app-like experience. Native iOS and Android apps are coming soon!',
        },
      ],
    },
    {
      title: 'Content & Submissions',
      icon: MapPin,
      questions: [
        {
          q: 'How do I submit a fact?',
          a: 'Navigate to the Submit page, fill in the required details including the fact title, description, location, and category. You can also add images to make your submission more engaging. Once submitted, your fact will be reviewed and appear on the map.',
        },
        {
          q: 'What makes a good fact submission?',
          a: 'Good facts are accurate, interesting, well-written, and include specific details. Add location information, select an appropriate category, and include high-quality images when possible. Check our Content Guidelines for best practices.',
        },
        {
          q: 'How long does fact review take?',
          a: 'Most fact submissions are reviewed within 24-48 hours. The review time may vary depending on submission volume. You can check the status of your submissions in your profile under "My Submissions".',
        },
        {
          q: 'Can I edit my submitted facts?',
          a: 'Yes! You can edit your own facts at any time. Navigate to your profile, find the fact you want to edit, and click the edit button. Changes to approved facts may require re-approval.',
        },
        {
          q: 'What should I do if I find inappropriate content?',
          a: 'Use the report button on any fact or comment to flag inappropriate content. Our moderation team reviews all reports promptly. You can also block users to prevent seeing their content.',
        },
      ],
    },
    {
      title: 'Gamification & Rewards',
      icon: Trophy,
      questions: [
        {
          q: 'How does the XP system work?',
          a: 'You earn XP (Experience Points) by contributing to LocaleLore. Activities like submitting facts (+50 XP), logging in daily (+5 XP), receiving likes (+2 XP), and getting comments (+3 XP) all contribute to your XP total.',
        },
        {
          q: 'What are the different user levels?',
          a: 'Users progress through 10 levels: Novice (0 XP), Explorer (100 XP), Adventurer (250 XP), Wayfinder (500 XP), Pathfinder (1000 XP), Trailblazer (2000 XP), Pioneer (4000 XP), Virtuoso (7000 XP), Master (12000 XP), and Legend (20000 XP). Each level unlocks new benefits!',
        },
        {
          q: 'How do I unlock achievements?',
          a: 'Achievements are unlocked automatically when you meet specific criteria. There are over 50 achievements including your first fact submission, reaching milestones, earning likes, and exploring different categories. Check the Gamification page to see all available achievements.',
        },
        {
          q: 'What can I buy in the Rewards Shop?',
          a: 'The Rewards Shop offers profile customizations including special badges, profile titles, custom themes, and other exclusive items. You can purchase these using XP or through premium subscriptions.',
        },
      ],
    },
    {
      title: 'Contributor Program',
      icon: DollarSign,
      questions: [
        {
          q: 'How do I become a paid contributor?',
          a: 'To become a verified contributor, you must have an account for at least 30 days, submit at least 10 approved facts, and maintain a quality score of 70% or higher. Then you can apply through the Contributor page. Our team reviews applications within 1-2 weeks.',
        },
        {
          q: 'How much can I earn as a contributor?',
          a: 'Earnings vary based on content quality and engagement. The base rate is $5-15 per approved fact, with bonuses for high engagement. Top contributors can earn $500+ per month. Plus, you can receive tips from users and create premium content for additional income.',
        },
        {
          q: 'What is the quality score?',
          a: 'Your quality score (0-100%) measures content quality, user engagement, community feedback, and consistency. It affects your base earnings rate and eligibility for the contributor program. Maintain high quality to maximize earnings.',
        },
        {
          q: 'How and when do I get paid?',
          a: 'Payments are processed monthly around the 15th for the previous month\'s earnings. The minimum payout is $50. We support PayPal, bank transfer, and Stripe for payments. You can track your earnings in the Contributor Dashboard.',
        },
        {
          q: 'Can I sell premium content?',
          a: 'Yes! Verified contributors can create and sell premium content including detailed guides, exclusive photos, video tours, and insider tips. You set your own prices and keep 70% of revenue (platform takes 30%).',
        },
      ],
    },
    {
      title: 'Social Features',
      icon: Users,
      questions: [
        {
          q: 'How do I add friends?',
          a: 'Search for users by name or username, visit their profile, and click "Add Friend". Once they accept your friend request, you\'ll be connected. You can also discover potential friends through shared interests and locations.',
        },
        {
          q: 'What can I do with friends?',
          a: 'Friends can view each other\'s activity (based on privacy settings), compare stats on leaderboards, and filter the feed to see only friends\' contributions. Direct messaging is coming soon!',
        },
        {
          q: 'How do leaderboards work?',
          a: 'Leaderboards rank users by XP, contributions, and engagement. There are global leaderboards (all users) and friend leaderboards (just your friends). Rankings update in real-time based on activity.',
        },
        {
          q: 'Can I control who sees my activity?',
          a: 'Yes! Visit Privacy Settings to control your profile visibility, location sharing, online status, and who can send you messages. You can make your profile public, friends-only, or private.',
        },
      ],
    },
    {
      title: 'Privacy & Account',
      icon: Shield,
      questions: [
        {
          q: 'What data do you collect?',
          a: 'We collect information you provide (profile, submissions, comments), usage data (pages visited, features used), and location data (when you enable it). We never sell your data. See our Privacy Policy for complete details.',
        },
        {
          q: 'How do I download my data?',
          a: 'You have the right to access all your data. Go to Settings → Privacy → Data Access and click "Request My Data". We\'ll prepare a downloadable archive of your profile, submissions, and activity within 30 days.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Go to Settings → Account → Delete Account. This permanently removes your profile and personal data. Your published facts may remain (anonymized) to preserve the community knowledge base, but all personal information is deleted.',
        },
        {
          q: 'Is two-factor authentication available?',
          a: 'Two-factor authentication (2FA) is coming soon! We recommend using a strong, unique password and enabling email notifications for account changes in the meantime.',
        },
        {
          q: 'How do I change my password or email?',
          a: 'Go to Settings → Account to change your display name, email, or password. Email changes require verification of both your old and new email addresses for security.',
        },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>FAQ - Frequently Asked Questions | LocaleLore</title>
        <meta
          name="description"
          content="Find answers to common questions about LocaleLore, including how to use the platform, submit content, earn rewards, become a contributor, and more."
        />
        <meta property="og:title" content="FAQ - Frequently Asked Questions | LocaleLore" />
        <meta
          property="og:description"
          content="Get answers to your questions about LocaleLore's features, content submission, gamification, and contributor program."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about LocaleLore. Can't find what you're looking for?{' '}
            <a href="/support" className="text-primary hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <Card key={sectionIndex} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((item, qIndex) => (
                    <AccordionItem 
                      key={qIndex} 
                      value={`${sectionIndex}-${qIndex}`}
                      className="border-b border-border/50 last:border-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium">{item.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="text-2xl font-semibold mb-3">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/support"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/user-guide"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                View User Guide
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FAQ;

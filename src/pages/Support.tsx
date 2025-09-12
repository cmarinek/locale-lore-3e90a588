import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  HelpCircle, 
  Bug, 
  Lightbulb, 
  Search, 
  Ticket, 
  ThumbsUp,
  Send,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_featured: boolean;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  vote_count: number;
  status: string;
  created_at: string;
}

export const Support = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [featureForm, setFeatureForm] = useState({
    title: '',
    description: '',
    category: 'enhancement'
  });
  const [bugForm, setBugForm] = useState({
    title: '',
    description: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load FAQ items
      const { data: faqData } = await supabase
        .from('faq_items')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (faqData) setFaqItems(faqData);

      // Load user's tickets if authenticated
      if (user) {
        const { data: ticketsData } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ticketsData) setTickets(ticketsData);

        // Load feature requests
        const { data: featuresData } = await supabase
          .from('feature_requests')
          .select('*')
          .order('vote_count', { ascending: false });
        
        if (featuresData) setFeatureRequests(featuresData);
      }
    } catch (error) {
      console.error('Error loading support data:', error);
      toast.error('Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a support ticket');
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          ...ticketForm,
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.display_name || user.email
        }]);

      if (error) throw error;

      toast.success('Support ticket submitted successfully!');
      setTicketForm({ subject: '', description: '', category: 'general', priority: 'medium' });
      loadData();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit support ticket');
    }
  };

  const submitFeatureRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a feature request');
      return;
    }

    try {
      const { error } = await supabase
        .from('feature_requests')
        .insert([{
          ...featureForm,
          user_id: user.id
        }]);

      if (error) throw error;

      toast.success('Feature request submitted successfully!');
      setFeatureForm({ title: '', description: '', category: 'enhancement' });
      loadData();
    } catch (error) {
      console.error('Error submitting feature request:', error);
      toast.error('Failed to submit feature request');
    }
  };

  const submitBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a bug report');
      return;
    }

    try {
      const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bug_reports')
        .insert([{
          ...bugForm,
          user_id: user.id,
          browser_info: browserInfo
        }]);

      if (error) throw error;

      toast.success('Bug report submitted successfully!');
      setBugForm({
        title: '',
        description: '',
        steps_to_reproduce: '',
        expected_behavior: '',
        actual_behavior: ''
      });
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report');
    }
  };

  const voteForFeature = async (featureId: string) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const { error } = await supabase
        .from('feature_request_votes')
        .insert([{
          feature_request_id: featureId,
          user_id: user.id
        }]);

      if (error) throw error;

      toast.success('Vote submitted!');
      loadData();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    }
  };

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading support center...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Help & Support | Locale Lore</title>
        <meta name="description" content="Get help with Locale Lore. Find answers in our FAQ, submit support tickets, request features, and report bugs." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <HelpCircle className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Help & Support</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to common questions, get help with issues, or submit feedback to improve Locale Lore
            </p>
          </div>

          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Support
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="bugs" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Bug Reports
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search FAQ
                  </CardTitle>
                  <CardDescription>
                    Find answers to frequently asked questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-6"
                  />
                  
                  <div className="space-y-4">
                    {filteredFAQ.map((item) => (
                      <Card key={item.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{item.question}</h3>
                            {item.is_featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">{item.answer}</p>
                          <div className="mt-4">
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support Tickets Tab */}
            <TabsContent value="tickets" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Submit New Ticket */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Submit Support Ticket
                    </CardTitle>
                    <CardDescription>
                      Get help with technical issues or account problems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user ? (
                      <form onSubmit={submitTicket} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            value={ticketForm.subject}
                            onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                            placeholder="Brief description of your issue"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <select
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                            className="w-full p-2 border border-input bg-background rounded-md"
                          >
                            <option value="general">General</option>
                            <option value="technical">Technical Issue</option>
                            <option value="account">Account</option>
                            <option value="billing">Billing</option>
                            <option value="feature">Feature Request</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <select
                            value={ticketForm.priority}
                            onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                            className="w-full p-2 border border-input bg-background rounded-md"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={ticketForm.description}
                            onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                            placeholder="Please provide detailed information about your issue"
                            rows={4}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Submit Ticket
                        </Button>
                      </form>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          Please sign in to submit a support ticket.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Existing Tickets */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Support Tickets</CardTitle>
                    <CardDescription>
                      Track the status of your submitted tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user ? (
                      <div className="space-y-4">
                        {tickets.length > 0 ? (
                          tickets.map((ticket) => (
                            <div key={ticket.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium">{ticket.subject}</h4>
                                <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                                  {ticket.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {ticket.description.substring(0, 100)}...
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline">{ticket.category}</Badge>
                                <Badge variant="outline">{ticket.priority}</Badge>
                                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No support tickets yet. Submit one above if you need help.
                          </p>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          Please sign in to view your support tickets.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Feature Requests Tab */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Submit Feature Request */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Request a Feature
                    </CardTitle>
                    <CardDescription>
                      Suggest new features or improvements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user ? (
                      <form onSubmit={submitFeatureRequest} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Feature Title</label>
                          <Input
                            value={featureForm.title}
                            onChange={(e) => setFeatureForm({...featureForm, title: e.target.value})}
                            placeholder="Brief title for your feature request"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={featureForm.description}
                            onChange={(e) => setFeatureForm({...featureForm, description: e.target.value})}
                            placeholder="Detailed description of the feature you'd like to see"
                            rows={4}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Submit Request
                        </Button>
                      </form>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          Please sign in to submit feature requests.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Feature Requests List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Community Feature Requests</CardTitle>
                    <CardDescription>
                      Vote for features you'd like to see implemented
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {featureRequests.length > 0 ? (
                        featureRequests.slice(0, 5).map((request) => (
                          <div key={request.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{request.title}</h4>
                              <Badge variant="outline">{request.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {request.description.substring(0, 120)}...
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => voteForFeature(request.id)}
                                disabled={!user}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {request.vote_count}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No feature requests yet. Be the first to suggest one!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bug Reports Tab */}
            <TabsContent value="bugs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Report a Bug
                  </CardTitle>
                  <CardDescription>
                    Help us improve by reporting bugs and issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <form onSubmit={submitBugReport} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Bug Title</label>
                        <Input
                          value={bugForm.title}
                          onChange={(e) => setBugForm({...bugForm, title: e.target.value})}
                          placeholder="Brief description of the bug"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={bugForm.description}
                          onChange={(e) => setBugForm({...bugForm, description: e.target.value})}
                          placeholder="What happened? Describe the bug in detail"
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Steps to Reproduce</label>
                        <Textarea
                          value={bugForm.steps_to_reproduce}
                          onChange={(e) => setBugForm({...bugForm, steps_to_reproduce: e.target.value})}
                          placeholder="1. Go to... 2. Click on... 3. The bug occurs when..."
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Expected Behavior</label>
                          <Textarea
                            value={bugForm.expected_behavior}
                            onChange={(e) => setBugForm({...bugForm, expected_behavior: e.target.value})}
                            placeholder="What should have happened?"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Actual Behavior</label>
                          <Textarea
                            value={bugForm.actual_behavior}
                            onChange={(e) => setBugForm({...bugForm, actual_behavior: e.target.value})}
                            placeholder="What actually happened?"
                            rows={2}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Submit Bug Report
                      </Button>
                    </form>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Please sign in to submit bug reports.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Get in touch with our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Support Hours</h4>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM UTC<br />
                        Weekend: Limited support available
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Response Times</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Urgent issues: Within 2 hours</li>
                        <li>• High priority: Within 24 hours</li>
                        <li>• Medium priority: Within 48 hours</li>
                        <li>• Low priority: Within 72 hours</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Community Guidelines</CardTitle>
                    <CardDescription>
                      Help us maintain a positive support environment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="text-muted-foreground space-y-2">
                      <li>• Be respectful and courteous</li>
                      <li>• Provide detailed information about issues</li>
                      <li>• Search FAQ before submitting tickets</li>
                      <li>• One issue per support ticket</li>
                      <li>• Include relevant screenshots when helpful</li>
                      <li>• Follow up on ticket responses promptly</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

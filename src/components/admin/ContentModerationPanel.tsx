import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  MessageSquare, 
  User, 
  Clock,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';
import { log } from '@/utils/logger';

interface ContentReport {
  id: string;
  reason: string;
  description: string;
  status: string;
  reported_content_type: string;
  reported_content_id: string;
  reporter_id: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  resolution_notes: string | null;
}

export const ContentModerationPanel = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filterStatus, searchQuery]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReports(data);
    } catch (error) {
      log.error('Error loading reports', error, { component: 'ContentModerationPanel', action: 'loadReports' });
      toast.error('Failed to load content reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(report =>
        report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reported_content_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId: string, newStatus: string, notes?: string) => {
    if (!user) return;

    try {
      const updateData: any = {
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      };

      if (notes) {
        updateData.resolution_notes = notes;
      }

      const { error } = await supabase
        .from('content_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report status updated successfully');
      loadReports();
    } catch (error) {
      log.error('Error updating report', error, { component: 'ContentModerationPanel', action: 'updateReportStatus', reportId });
      toast.error('Failed to update report status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'reviewing':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Reviewing</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'spam':
        return 'text-orange-600';
      case 'harassment':
        return 'text-red-600';
      case 'inappropriate':
        return 'text-purple-600';
      case 'false_information':
        return 'text-blue-600';
      case 'copyright':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="h-6 w-6 text-primary" />
            Content Moderation
          </h2>
          <p className="text-muted-foreground">
            Review and manage reported content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {reports.filter(r => r.status === 'pending').length} pending
          </Badge>
          <Badge variant="outline">
            {reports.filter(r => r.status === 'reviewing').length} reviewing
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <Flag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">
                  {reports.length > 0 
                    ? Math.round(((reports.length - reports.filter(r => r.status === 'pending').length) / reports.length) * 100)
                    : 0}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Content Reports</CardTitle>
          <CardDescription>
            Review and take action on reported content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p>No reports found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getReasonColor(report.reason)}>
                          {report.reason.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {report.reported_content_type}
                        </Badge>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Report ID: {report.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{new Date(report.created_at).toLocaleDateString()}</p>
                      <p>{new Date(report.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>

                  {report.resolution_notes && (
                    <div className="bg-muted/50 p-3 rounded">
                      <p className="text-sm font-medium mb-1">Resolution Notes:</p>
                      <p className="text-sm">{report.resolution_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      Reporter: {report.reporter_id.slice(0, 8)}
                      {report.reviewed_by && (
                        <>
                          • Reviewed by: {report.reviewed_by.slice(0, 8)}
                        </>
                      )}
                    </div>
                    
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'reviewing')}
                        >
                          Start Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'resolved', 'Content removed per community guidelines')}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'dismissed', 'Report does not violate guidelines')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}

                    {report.status === 'reviewing' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'resolved', 'Content moderated')}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'dismissed', 'No action needed')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidelines Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Guidelines</CardTitle>
          <CardDescription>
            Quick reference for content moderation decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Resolve When:</h4>
              <ul className="text-sm space-y-1">
                <li>• Content clearly violates community guidelines</li>
                <li>• Spam or promotional content</li>
                <li>• Inappropriate or offensive material</li>
                <li>• False or misleading information</li>
                <li>• Copyright violations</li>
                <li>• Personal information or doxxing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">Dismiss When:</h4>
              <ul className="text-sm space-y-1">
                <li>• Content follows community guidelines</li>
                <li>• Disagreement on facts (not misinformation)</li>
                <li>• Cultural or opinion-based differences</li>
                <li>• Technical issues (not guideline violations)</li>
                <li>• Duplicate or resolved reports</li>
                <li>• Insufficient evidence of violation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
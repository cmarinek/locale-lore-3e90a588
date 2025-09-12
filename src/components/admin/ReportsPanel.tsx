import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { AlertTriangle, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsPanel: React.FC = () => {
  const { getContentReports, updateReportStatus, isAdmin, loading: adminLoading } = useAdmin();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading reports with filter:', statusFilter);
      console.log('Admin status:', isAdmin, 'Admin loading:', adminLoading);
      
      if (!isAdmin && !adminLoading) {
        setError('You do not have admin privileges to view reports');
        return;
      }
      
      const data = await getContentReports(statusFilter || undefined);
      console.log('Reports loaded:', data?.length || 0, 'reports');
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, status: string) => {
    try {
      await updateReportStatus(reportId, status, resolutionNotes);
      toast.success(`Report ${status} successfully`);
      setSelectedReport(null);
      setResolutionNotes('');
      loadReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case 'reviewed':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'dismissed':
        return 'secondary';
      case 'reviewed':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'spam':
        return '🚫';
      case 'inappropriate':
        return '⚠️';
      case 'harassment':
        return '👮';
      case 'fake':
        return '🚨';
      case 'copyright':
        return '©️';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Content Reports
          </CardTitle>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {adminLoading || loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-2">⚠️ Error</div>
              <div className="text-muted-foreground">{error}</div>
              {!isAdmin && (
                <div className="mt-4 text-sm text-muted-foreground">
                  You need admin privileges to access the reports panel.
                </div>
              )}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">No reports found</div>
              <div className="text-sm text-muted-foreground">
                {statusFilter 
                  ? `No reports match the selected status filter: ${statusFilter}`
                  : 'No content reports have been submitted yet'
                }
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reports List */}
              <div className="space-y-4">
                {reports.map((report) => (
                  <div 
                    key={report.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedReport?.id === report.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getReasonIcon(report.reason)}</span>
                      <span className="font-medium">{report.reason}</span>
                      <span className="text-xs text-muted-foreground">
                        {report.reported_content_type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.description || 'No additional details provided'}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Reporter: {report.reporter?.username || 'Anonymous'}</span>
                      {report.reviewer && (
                        <span>• Reviewed by: {report.reviewer.username}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Report Details */}
              <div>
                {selectedReport ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Report Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Content Type</label>
                        <p className="text-sm text-muted-foreground capitalize">
                          {selectedReport.reported_content_type}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Reason</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.reason}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.description || 'No description provided'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Reporter</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.reporter?.username || 'Anonymous'} 
                          ({selectedReport.reporter?.email || 'No email'})
                        </p>
                      </div>
                      
                      {selectedReport.status !== 'pending' && (
                        <div>
                          <label className="text-sm font-medium">Resolution Notes</label>
                          <p className="text-sm text-muted-foreground">
                            {selectedReport.resolution_notes || 'No notes provided'}
                          </p>
                        </div>
                      )}
                      
                      {selectedReport.status === 'pending' && (
                        <div className="space-y-4 pt-4 border-t">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Resolution Notes
                            </label>
                            <Textarea
                              placeholder="Add notes about your decision..."
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(selectedReport.id, 'dismissed')}
                              className="flex-1"
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    Select a report to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
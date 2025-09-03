import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square, RefreshCw, Settings, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface AcquisitionJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  source_type: string;
  target_count: number;
  processed_count: number;
  success_count: number;
  error_count: number;
  configuration: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

const FactAcquisitionManager: React.FC = () => {
  const [jobs, setJobs] = useState<AcquisitionJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const [newJobForm, setNewJobForm] = useState({
    name: '',
    target_count: 100,
    categories: ['history', 'science', 'culture', 'geography', 'nature'],
    include_images: true,
    auto_categorize: true,
    content_moderation: true
  });

  useEffect(() => {
    loadJobs();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      console.log('Loading acquisition jobs...');
      const { data, error } = await supabase.functions.invoke('bulk-import-processor', {
        body: { action: 'get_jobs', limit: 50 }
      });

      console.log('Jobs response:', { data, error });
      
      if (error) throw error;
      
      const jobs = data?.jobs || [];
      console.log('Loaded jobs:', jobs);
      setJobs(jobs);
      
      if (jobs.length === 0) {
        console.log('No jobs found');
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast({
        title: "Error loading jobs",
        description: `Failed to fetch acquisition jobs: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const createJob = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-import-processor', {
        body: {
          action: 'create_job',
          name: newJobForm.name,
          target_count: newJobForm.target_count,
          configuration: {
            categories: newJobForm.categories,
            include_images: newJobForm.include_images,
            auto_categorize: newJobForm.auto_categorize,
            content_moderation: newJobForm.content_moderation
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Job created successfully",
        description: `Created job: ${newJobForm.name}`,
      });

      setShowCreateDialog(false);
      setNewJobForm({
        name: '',
        target_count: 100,
        categories: ['history', 'science', 'culture', 'geography', 'nature'],
        include_images: true,
        auto_categorize: true,
        content_moderation: true
      });
      
      loadJobs();
    } catch (error) {
      console.error('Failed to create job:', error);
      toast({
        title: "Error creating job",
        description: "Failed to create acquisition job",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const startJob = async (jobId: string) => {
    setLoading(true);
    try {
      console.log('Starting job:', jobId);
      const { data, error } = await supabase.functions.invoke('bulk-import-processor', {
        body: { action: 'start_processing', jobId }
      });

      console.log('Start job response:', { data, error });

      if (error) throw error;

      toast({
        title: "Job started",
        description: "Fact acquisition job started successfully. Processing in background...",
      });

      // Refresh jobs immediately to show updated status
      setTimeout(loadJobs, 1000);
    } catch (error) {
      console.error('Failed to start job:', error);
      toast({
        title: "Error starting job",
        description: `Failed to start acquisition job: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pauseJob = async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-import-processor', {
        body: { action: 'pause_job', jobId }
      });

      if (error) throw error;

      toast({
        title: "Job paused",
        description: "Fact acquisition job paused successfully",
      });

      loadJobs();
    } catch (error) {
      console.error('Failed to pause job:', error);
      toast({
        title: "Error pausing job",
        description: "Failed to pause acquisition job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resumeJob = async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-import-processor', {
        body: { action: 'resume_job', jobId }
      });

      if (error) throw error;

      toast({
        title: "Job resumed",
        description: "Fact acquisition job resumed successfully",
      });

      loadJobs();
    } catch (error) {
      console.error('Failed to resume job:', error);
      toast({
        title: "Error resuming job",
        description: "Failed to resume acquisition job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-import-processor', {
        body: { action: 'cancel_job', jobId }
      });

      if (error) throw error;

      toast({
        title: "Job cancelled",
        description: "Fact acquisition job cancelled successfully",
      });

      loadJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
      toast({
        title: "Error cancelling job",
        description: "Failed to cancel acquisition job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgress = (job: AcquisitionJob) => {
    if (job.target_count === 0) return 0;
    return Math.round((job.processed_count / job.target_count) * 100);
  };

  const categories = ['history', 'science', 'culture', 'geography', 'nature', 'technology', 'art', 'sports', 'politics'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fact Acquisition Manager</h2>
          <p className="text-muted-foreground">
            Automate fact collection from Wikipedia and other sources
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadJobs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Database className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Acquisition Job</DialogTitle>
                <DialogDescription>
                  Configure a new automated fact acquisition job
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-name">Job Name</Label>
                  <Input
                    id="job-name"
                    placeholder="e.g., Historical Facts Collection"
                    value={newJobForm.name}
                    onChange={(e) => setNewJobForm({ ...newJobForm, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="target-count">Target Count</Label>
                  <Input
                    id="target-count"
                    type="number"
                    min="10"
                    max="10000"
                    value={newJobForm.target_count}
                    onChange={(e) => setNewJobForm({ ...newJobForm, target_count: parseInt(e.target.value) || 100 })}
                  />
                </div>

                <div>
                  <Label>Categories</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={newJobForm.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewJobForm({
                                ...newJobForm,
                                categories: [...newJobForm.categories, category]
                              });
                            } else {
                              setNewJobForm({
                                ...newJobForm,
                                categories: newJobForm.categories.filter(c => c !== category)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-sm capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-images"
                      checked={newJobForm.include_images}
                      onCheckedChange={(checked) => setNewJobForm({ ...newJobForm, include_images: !!checked })}
                    />
                    <Label htmlFor="include-images">Include Images</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-categorize"
                      checked={newJobForm.auto_categorize}
                      onCheckedChange={(checked) => setNewJobForm({ ...newJobForm, auto_categorize: !!checked })}
                    />
                    <Label htmlFor="auto-categorize">Auto Categorization</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="content-moderation"
                      checked={newJobForm.content_moderation}
                      onCheckedChange={(checked) => setNewJobForm({ ...newJobForm, content_moderation: !!checked })}
                    />
                    <Label htmlFor="content-moderation">Content Moderation</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={createJob}
                    disabled={creating || !newJobForm.name || newJobForm.categories.length === 0}
                    className="flex-1"
                  >
                    {creating ? 'Creating...' : 'Create Job'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{job.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(job.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                  <div className="flex gap-1">
                    {job.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => startJob(job.id)}
                        disabled={loading}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'running' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseJob(job.id)}
                        disabled={loading}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => resumeJob(job.id)}
                        disabled={loading}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {(job.status === 'running' || job.status === 'paused') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelJob(job.id)}
                        disabled={loading}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <div className="font-semibold">{job.target_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processed:</span>
                    <div className="font-semibold">{job.processed_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Success:</span>
                    <div className="font-semibold text-green-600">{job.success_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors:</span>
                    <div className="font-semibold text-red-600">{job.error_count.toLocaleString()}</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{getProgress(job)}%</span>
                  </div>
                  <Progress value={getProgress(job)} className="h-2" />
                </div>
                
                {job.configuration?.categories && (
                  <div>
                    <span className="text-sm text-muted-foreground">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.configuration.categories.map((category: string) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {jobs.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No acquisition jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first automated fact acquisition job to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create First Job
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FactAcquisitionManager;
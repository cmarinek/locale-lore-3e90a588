import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square, RefreshCw, Settings, Database, MapPin, Image, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AcquisitionJob {
  id: string;
  name: string;
  status: string;
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

interface ImportedFact {
  id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  media_urls?: string[];
  created_at: string;
  status: string;
}

const FactAcquisitionManager: React.FC = () => {
  const [jobs, setJobs] = useState<AcquisitionJob[]>([]);
  const [importedFacts, setImportedFacts] = useState<ImportedFact[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const [newJobForm, setNewJobForm] = useState({
    name: '',
    target_count: 100,
    categories: ['history', 'science', 'culture', 'geography', 'nature'],
    include_images: true,
    require_coordinates: true,
    quality_filter: true
  });

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    await Promise.all([loadJobs(), loadImportedFacts()]);
  };

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('acquisition_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast({
        title: "Error loading jobs",
        description: "Failed to fetch acquisition jobs",
        variant: "destructive",
      });
    }
  };

  const loadImportedFacts = async () => {
    try {
      const { data, error } = await supabase
        .from('facts')
        .select('*')
        .is('author_id', null) // System-generated facts
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setImportedFacts(data || []);
    } catch (error) {
      console.error('Failed to load imported facts:', error);
      toast({
        title: "Error loading facts",
        description: "Failed to fetch imported facts",
        variant: "destructive",
      });
    }
  };

  const createJob = async () => {
    if (!newJobForm.name || newJobForm.categories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a job name and select at least one category",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('fact-acquisition', {
        body: {
          action: 'create_job',
          name: newJobForm.name,
          target_count: newJobForm.target_count,
          configuration: {
            categories: newJobForm.categories,
            include_images: newJobForm.include_images,
            require_coordinates: newJobForm.require_coordinates,
            quality_filter: newJobForm.quality_filter
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
        require_coordinates: true,
        quality_filter: true
      });
      
      await loadJobs();
    } catch (error) {
      console.error('Failed to create job:', error);
      toast({
        title: "Error creating job",
        description: error.message || "Failed to create acquisition job",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const startJob = async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fact-acquisition', {
        body: { action: 'start_job', jobId }
      });

      if (error) throw error;

      toast({
        title: "Job started",
        description: "Fact acquisition job started successfully",
      });

      await loadJobs();
    } catch (error) {
      console.error('Failed to start job:', error);
      toast({
        title: "Error starting job",
        description: error.message || "Failed to start acquisition job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pauseJob = async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fact-acquisition', {
        body: { action: 'pause_job', jobId }
      });

      if (error) throw error;

      toast({
        title: "Job paused",
        description: "Fact acquisition job paused successfully",
      });
      
      await loadJobs();
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
      const { data, error } = await supabase.functions.invoke('fact-acquisition', {
        body: { action: 'resume_job', jobId }
      });

      if (error) throw error;

      toast({
        title: "Job resumed",
        description: "Fact acquisition job resumed successfully",
      });

      await loadJobs();
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
      const { data, error } = await supabase.functions.invoke('fact-acquisition', {
        body: { action: 'cancel_job', jobId }
      });

      if (error) throw error;

      toast({
        title: "Job cancelled",
        description: "Fact acquisition job cancelled successfully",
      });

      await loadJobs();
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
      case 'running': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      case 'paused': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getProgress = (job: AcquisitionJob) => {
    if (job.target_count === 0) return 0;
    return Math.round((job.processed_count / job.target_count) * 100);
  };

  const categories = ['history', 'science', 'culture', 'geography', 'nature', 'technology', 'art', 'sports'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fact Acquisition Manager</h2>
          <p className="text-muted-foreground">
            Automate fact collection from Wikipedia with images and coordinates
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
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
                    placeholder="e.g., Historical Landmarks Collection"
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
                    max="1000"
                    value={newJobForm.target_count}
                    onChange={(e) => setNewJobForm({ ...newJobForm, target_count: parseInt(e.target.value) || 100 })}
                  />
                </div>

                <div>
                  <Label>Categories</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                      id="require-coordinates"
                      checked={newJobForm.require_coordinates}
                      onCheckedChange={(checked) => setNewJobForm({ ...newJobForm, require_coordinates: !!checked })}
                    />
                    <Label htmlFor="require-coordinates">Require Coordinates</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quality-filter"
                      checked={newJobForm.quality_filter}
                      onCheckedChange={(checked) => setNewJobForm({ ...newJobForm, quality_filter: !!checked })}
                    />
                    <Label htmlFor="quality-filter">Quality Filter</Label>
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

      {/* Tabs */}
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">
            Jobs ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="facts">
            Imported Facts ({importedFacts.length})
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No acquisition jobs found</p>
                <p className="text-muted-foreground">Create your first job to start importing facts</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Created {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        <span>Target: {job.target_count} facts</span>
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelJob(job.id)}
                          disabled={loading || job.status === 'completed'}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {job.processed_count} / {job.target_count}</span>
                      <span>{getProgress(job)}%</span>
                    </div>
                    <Progress value={getProgress(job)} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{job.success_count}</div>
                        <div className="text-muted-foreground">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{job.error_count}</div>
                        <div className="text-muted-foreground">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{job.processed_count}</div>
                        <div className="text-muted-foreground">Processed</div>
                      </div>
                    </div>

                    {job.configuration && (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          Categories: {job.configuration.categories?.join(', ') || 'general'}
                        </Badge>
                        {job.configuration.include_images && (
                          <Badge variant="outline">
                            <Image className="h-3 w-3 mr-1" />
                            Images
                          </Badge>
                        )}
                        {job.configuration.require_coordinates && (
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            Coordinates
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Facts Tab */}
        <TabsContent value="facts" className="space-y-4">
          <div className="grid gap-4">
            {importedFacts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No imported facts found</p>
                  <p className="text-muted-foreground">Run acquisition jobs to import facts</p>
                </CardContent>
              </Card>
            ) : (
              importedFacts.map((fact) => (
                <Card key={fact.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {fact.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={fact.image_url}
                            alt={fact.title}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{fact.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {fact.description.length > 150 
                            ? `${fact.description.substring(0, 150)}...`
                            : fact.description
                          }
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {fact.location_name}
                          </span>
                          <span>
                            {fact.latitude.toFixed(4)}, {fact.longitude.toFixed(4)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {fact.status}
                          </Badge>
                          {fact.media_urls && fact.media_urls.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Image className="h-4 w-4" />
                              {fact.media_urls.length} images
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FactAcquisitionManager;
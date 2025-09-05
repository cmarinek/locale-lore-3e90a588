import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Download, 
  Building, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BuildLog {
  id: string;
  build_id: string;
  platform: string;
  status: string;
  progress: number;
  download_url?: string | null;
  error_message?: string | null;
  app_name: string;
  bundle_id: string;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  expires_at: string;
  user_id: string;
  build_config?: any;
}

export const MobileAppBuilder: React.FC = () => {
  const { toast } = useToast();
  const [builds, setBuilds] = useState<BuildLog[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load builds from database
  useEffect(() => {
    loadBuilds();
    
    // Set up real-time subscription for build updates
    const subscription = supabase
      .channel('build_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'build_logs' },
        () => {
          loadBuilds();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadBuilds = async () => {
    try {
      const { data, error } = await supabase
        .from('build_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setBuilds(data || []);
    } catch (error) {
      console.error('Error loading builds:', error);
      toast({
        title: "Error",
        description: "Failed to load build history.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startBuild = async (platform: 'android' | 'ios') => {
    const buildId = `build_${Date.now()}_${platform}`;
    setIsBuilding(true);

    try {
      const { data, error } = await supabase.functions.invoke('build-mobile-app', {
        body: {
          platform,
          buildId,
          appName: 'LocaleLore',
          bundleId: 'app.lovable.8ee9bb219cd64b2281a4e2322ff21c98'
        }
      });

      if (error) throw error;

      toast({
        title: "Build Started",
        description: `${platform === 'android' ? 'Android APK' : 'iOS IPA'} build has been initiated.`,
      });

      // Refresh builds to show the new one
      await loadBuilds();

    } catch (error) {
      console.error('Build error:', error);
      toast({
        title: "Build Failed",
        description: `Failed to start ${platform} build. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const downloadBuild = async (build: BuildLog) => {
    if (build.download_url) {
      try {
        // Get signed URL for secure download
        const { data, error } = await supabase.storage
          .from('builds')
          .createSignedUrl(`${build.build_id}.${build.platform === 'android' ? 'apk' : 'ipa'}`, 300);

        if (error) throw error;

        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = `LocaleLore_${build.platform}_${build.build_id}.${build.platform === 'android' ? 'apk' : 'ipa'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: `Downloading ${build.platform === 'android' ? 'Android APK' : 'iOS IPA'} file.`,
        });
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "Download Failed",
          description: "Failed to download the build file.",
          variant: "destructive"
        });
      }
    }
  };

  const cancelBuild = async (buildId: string) => {
    try {
      const { error } = await supabase
        .from('build_logs')
        .update({ status: 'cancelled' })
        .eq('build_id', buildId);

      if (error) throw error;

      toast({
        title: "Build Cancelled",
        description: "The build has been cancelled successfully.",
      });

      await loadBuilds();
    } catch (error) {
      console.error('Cancel error:', error);
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel the build.",
        variant: "destructive"
      });
    }
  };

  const deleteBuild = async (build: BuildLog) => {
    try {
      // Delete from storage if exists
      if (build.download_url) {
        await supabase.storage
          .from('builds')
          .remove([`${build.build_id}.${build.platform === 'android' ? 'apk' : 'ipa'}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('build_logs')
        .delete()
        .eq('id', build.id);

      if (error) throw error;

      toast({
        title: "Build Deleted",
        description: "The build has been deleted successfully.",
      });

      await loadBuilds();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the build.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'building':
        return <Building className="w-4 h-4 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'building':
        return <Badge variant="outline" className="text-primary border-primary">Building</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600 text-white">Complete</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading builds...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Mobile App Builder</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Build and distribute mobile applications for Android and iOS
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadBuilds}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Building mobile apps requires proper signing certificates and can take 10-20 minutes. 
              iOS builds require Apple Developer certificates. Built files expire after 7 days.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Android APK</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Build APK file for Google Play Store distribution
                </p>
                <Button 
                  onClick={() => startBuild('android')}
                  disabled={isBuilding}
                  className="w-full"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Build Android APK
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold">iOS IPA</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Build IPA file for Apple App Store distribution
                </p>
                <Button 
                  onClick={() => startBuild('ios')}
                  disabled={isBuilding}
                  className="w-full"
                  variant="outline"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Build iOS IPA
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {builds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Build History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {builds.map((build) => (
                <div key={build.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className={`w-5 h-5 ${build.platform === 'android' ? 'text-green-600' : 'text-gray-700'}`} />
                      <div>
                        <h4 className="font-semibold">
                          {build.platform === 'android' ? 'Android APK' : 'iOS IPA'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(build.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {build.build_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(build.status)}
                      {getStatusBadge(build.status)}
                    </div>
                  </div>

                  {build.status === 'building' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Building...</span>
                        <span>{build.progress}%</span>
                      </div>
                      <Progress value={build.progress} className="w-full" />
                      <Button 
                        onClick={() => cancelBuild(build.build_id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Cancel Build
                      </Button>
                    </div>
                  )}

                  {build.status === 'failed' && build.error_message && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{build.error_message}</AlertDescription>
                    </Alert>
                  )}

                  {build.status === 'completed' && build.download_url && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => downloadBuild(build)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download {build.platform === 'android' ? 'APK' : 'IPA'}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Expires: {new Date(build.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {(build.status === 'completed' || build.status === 'failed' || build.status === 'cancelled') && (
                    <Button 
                      onClick={() => deleteBuild(build)}
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Build
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
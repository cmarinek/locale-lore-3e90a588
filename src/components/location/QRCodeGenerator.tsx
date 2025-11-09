import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { QrCode, Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCodeLib from 'qrcode';

interface LocationQRCode {
  id: string;
  code: string;
  location_name: string;
  latitude: number;
  longitude: number;
  scan_count: number;
  expires_at: string | null;
  created_at: string;
}

export const QRCodeGenerator: React.FC = () => {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<LocationQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    location_name: '',
    latitude: '',
    longitude: '',
    expires_in_days: '30',
  });

  useEffect(() => {
    if (user) {
      fetchQRCodes();
    }
  }, [user]);

  const fetchQRCodes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('location_qr_codes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQrCodes(data || []);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!user) return;

    const { location_name, latitude, longitude, expires_in_days } = form;

    if (!location_name || !latitude || !longitude) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const code = crypto.randomUUID();
      const expiresAt = expires_in_days
        ? new Date(Date.now() + parseInt(expires_in_days) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('location_qr_codes')
        .insert({
          code,
          location_name,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          created_by: user.id,
          expires_at: expiresAt,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "QR code generated successfully",
      });

      setForm({
        location_name: '',
        latitude: '',
        longitude: '',
        expires_in_days: '30',
      });

      fetchQRCodes();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = async (qrCode: LocationQRCode) => {
    try {
      const url = `${window.location.origin}/location/${qrCode.code}`;
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `qr-${qrCode.location_name.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Downloaded",
        description: "QR code downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('location_qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQrCodes(prev => prev.filter(qr => qr.id !== id));

      toast({
        title: "Deleted",
        description: "QR code deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Location QR Code</CardTitle>
          <CardDescription>
            Create QR codes that link to specific locations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_name">Location Name</Label>
            <Input
              id="location_name"
              value={form.location_name}
              onChange={e => setForm({ ...form, location_name: e.target.value })}
              placeholder="Enter location name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_in_days">Expires In (Days)</Label>
            <Input
              id="expires_in_days"
              type="number"
              value={form.expires_in_days}
              onChange={e => setForm({ ...form, expires_in_days: e.target.value })}
              placeholder="30"
            />
          </div>

          <Button
            onClick={generateQRCode}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {qrCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Codes</CardTitle>
            <CardDescription>
              {qrCodes.length} QR code{qrCodes.length !== 1 ? 's' : ''} created
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrCodes.map(qr => (
              <div
                key={qr.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{qr.location_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {qr.scan_count} scans • Created {new Date(qr.created_at).toLocaleDateString()}
                  </p>
                  {qr.expires_at && (
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(qr.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(qr)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteQRCode(qr.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Copy, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  description?: string;
}

export const PromoCodeManager: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    max_uses: 100,
    expires_at: '',
    description: ''
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = () => {
    setLoading(true);
    try {
      // This would be a custom table for promo codes
      // For now, we'll simulate the data structure
      setPromoCodes([
        {
          id: '1',
          code: 'WELCOME10',
          discount_type: 'percentage',
          discount_value: 10,
          max_uses: 1000,
          used_count: 250,
          is_active: true,
          expires_at: '2024-12-31T23:59:59Z',
          created_at: '2024-01-01T00:00:00Z',
          description: 'Welcome discount for new users'
        },
        {
          id: '2',
          code: 'SUMMER50',
          discount_type: 'fixed',
          discount_value: 50,
          max_uses: 500,
          used_count: 120,
          is_active: true,
          expires_at: '2024-08-31T23:59:59Z',
          created_at: '2024-06-01T00:00:00Z',
          description: 'Summer promotion fixed discount'
        }
      ]);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast({
        title: "Error",
        description: "Failed to load promo codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.functions.invoke('admin-promo-codes', {
        body: {
          action: editingCode ? 'update' : 'create',
          id: editingCode?.id,
          ...formData
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Promo code ${editingCode ? 'updated' : 'created'} successfully`,
      });

      setIsCreateOpen(false);
      setEditingCode(null);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_uses: 100,
        expires_at: '',
        description: ''
      });
      loadPromoCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save promo code",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'delete', id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });
      loadPromoCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete promo code",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Promo code "${code}" copied to clipboard`,
    });
  };

  const formatDiscount = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `$${value}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Promo Code Management</h2>
          <p className="text-muted-foreground">Create and manage promotional discount codes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Edit' : 'Create'} Promo Code</DialogTitle>
              <DialogDescription>
                {editingCode ? 'Update the promotional code details' : 'Create a new promotional discount code'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="DISCOUNT10"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="discount_value">
                  Discount Value {formData.discount_type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  min="0"
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="max_uses">Maximum Uses</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expires_at">Expiration Date</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the promotion"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingCode ? 'Update' : 'Create'} Code
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCode(null);
                    setFormData({
                      code: '',
                      discount_type: 'percentage',
                      discount_value: 0,
                      max_uses: 100,
                      expires_at: '',
                      description: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {promoCodes.map((promoCode) => (
          <Card key={promoCode.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono font-bold">{promoCode.code}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(promoCode.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{promoCode.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">
                          {formatDiscount(promoCode.discount_type, promoCode.discount_value)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Discount</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">
                          {promoCode.used_count}/{promoCode.max_uses}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Used</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={promoCode.is_active ? "default" : "secondary"}>
                    {promoCode.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    Expires {new Date(promoCode.expires_at).toLocaleDateString()}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingCode(promoCode);
                      setFormData({
                        code: promoCode.code,
                        discount_type: promoCode.discount_type,
                        discount_value: promoCode.discount_value,
                        max_uses: promoCode.max_uses,
                        expires_at: promoCode.expires_at.slice(0, 16), // Format for datetime-local
                        description: promoCode.description || ''
                      });
                      setIsCreateOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(promoCode.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethodDetails {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  type: string;
}

export function PaymentMethodDisplay() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  const fetchPaymentMethod = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-payment-method');

      if (error) throw error;
      setPaymentMethod(data);
    } catch (error: any) {
      console.error('Error fetching payment method:', error);
      if (error.message !== 'No active subscription found' && error.message !== 'No payment method found') {
        toast.error('Failed to load payment method');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentMethod) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
        <CardDescription>
          Your default payment method for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getCardBrandIcon(paymentMethod.brand)}</div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {formatBrand(paymentMethod.brand)}
                </Badge>
                <span className="text-sm font-medium">
                  •••• {paymentMethod.last4}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Expires {String(paymentMethod.exp_month).padStart(2, '0')}/{paymentMethod.exp_year}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Database, Server, Cpu, HardDrive } from 'lucide-react';

export function SystemHealth() {
  const services = [
    { name: 'Web Application', status: 'operational', uptime: '99.9%', responseTime: '45ms' },
    { name: 'API Server', status: 'operational', uptime: '99.8%', responseTime: '120ms' },
    { name: 'Database', status: 'operational', uptime: '99.99%', responseTime: '15ms' },
    { name: 'Edge Functions', status: 'operational', uptime: '99.7%', responseTime: '180ms' },
    { name: 'CDN', status: 'operational', uptime: '100%', responseTime: '8ms' },
    { name: 'Authentication', status: 'operational', uptime: '99.95%', responseTime: '95ms' },
  ];

  const infrastructure = [
    { name: 'CPU Usage', value: 34, unit: '%', status: 'good', icon: Cpu },
    { name: 'Memory Usage', value: 58, unit: '%', status: 'good', icon: HardDrive },
    { name: 'Database Connections', value: 23, unit: '/100', status: 'good', icon: Database },
    { name: 'Active Servers', value: 4, unit: '/4', status: 'good', icon: Server },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Current status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uptime: {service.uptime} • Response: {service.responseTime}
                    </p>
                  </div>
                </div>
                {getStatusBadge(service.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {infrastructure.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value}
                {metric.unit}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${
                    metric.status === 'good'
                      ? 'bg-green-500'
                      : metric.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${metric.unit === '%' ? metric.value : (metric.value / 100) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Service disruptions in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 font-semibold">No incidents reported</p>
              <p className="text-sm text-muted-foreground">All systems have been operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

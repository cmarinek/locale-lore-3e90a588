import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Database, Cookie, Mail, Eye, MapPin } from 'lucide-react';

export const Privacy = () => {
  const { t } = useTranslation('legal');

  return (
    <MainLayout>
      <Helmet>
        <title>{t('privacy.meta.title')} | Locale Lore</title>
        <meta name="description" content={t('privacy.meta.description')} />
        <link rel="canonical" href={`${window.location.origin}/privacy`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Shield className="h-8 w-8" />
              <h1 className="text-4xl font-bold">{t('privacy.title')}</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
            <p className="text-muted-foreground">
              {t('privacy.intro')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t('privacy.dataCollection.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.dataCollection.account.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacy.dataCollection.account.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.dataCollection.activity.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacy.dataCollection.activity.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.dataCollection.location.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacy.dataCollection.location.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.dataCollection.analytics.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacy.dataCollection.analytics.content')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t('privacy.usage.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• {t('privacy.usage.items.0')}</li>
                <li>• {t('privacy.usage.items.1')}</li>
                <li>• {t('privacy.usage.items.2')}</li>
                <li>• {t('privacy.usage.items.3')}</li>
                <li>• {t('privacy.usage.items.4')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('privacy.location.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('privacy.location.content')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                {t('privacy.cookies.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.cookies.essential.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacy.cookies.essential.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.cookies.analytics.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacy.cookies.analytics.content')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('privacy.rights.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">{t('privacy.rights.access.title')}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t('privacy.rights.access.content')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('privacy.rights.rectification.title')}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t('privacy.rights.rectification.content')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('privacy.rights.erasure.title')}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t('privacy.rights.erasure.content')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('privacy.rights.optout.title')}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t('privacy.rights.optout.content')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('privacy.contact.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('privacy.contact.content')}{' '}
                <a href="mailto:privacy@localelore.com" className="text-primary hover:underline">
                  privacy@localelore.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
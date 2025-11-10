import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Users, Shield, AlertTriangle, Gavel } from 'lucide-react';

export const Terms = () => {
  const { t } = useTranslation('legal');

  return (
    <MainLayout>
      <Helmet>
        <title>{t('terms.meta.title')} | Locale Lore</title>
        <meta name="description" content={t('terms.meta.description')} />
        <link rel="canonical" href={`${window.location.origin}/terms`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <FileText className="h-8 w-8" />
              <h1 className="text-4xl font-bold">{t('terms.title')}</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {t('terms.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
            <p className="text-muted-foreground">
              {t('terms.intro')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('terms.acceptance.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('terms.acceptance.content')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('terms.userAccounts.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('terms.userAccounts.responsibility.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.userAccounts.responsibility.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('terms.userAccounts.age.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.userAccounts.age.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('terms.userAccounts.termination.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.userAccounts.termination.content')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('terms.content.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('terms.content.userContent.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.content.userContent.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('terms.content.prohibited.title')}</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>• {t('terms.content.prohibited.items.0')}</li>
                  <li>• {t('terms.content.prohibited.items.1')}</li>
                  <li>• {t('terms.content.prohibited.items.2')}</li>
                  <li>• {t('terms.content.prohibited.items.3')}</li>
                  <li>• {t('terms.content.prohibited.items.4')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('terms.privacy.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('terms.privacy.content')}{' '}
                <Link to="/privacy" className="text-primary hover:underline">{t('terms.privacy.link')}</Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('terms.subscription.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('terms.subscription.premium.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.subscription.premium.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('terms.subscription.cancellation.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.subscription.cancellation.content')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('terms.disclaimers.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('terms.disclaimers.availability.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.disclaimers.availability.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('terms.disclaimers.accuracy.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.disclaimers.accuracy.content')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                {t('terms.legal.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('terms.legal.liability.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.legal.liability.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('terms.legal.governing.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.legal.governing.content')}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">{t('terms.legal.changes.title')}</h3>
                <p className="text-muted-foreground">
                  {t('terms.legal.changes.content')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('terms.contact.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('terms.contact.content')}{' '}
                <a href="mailto:legal@localelore.com" className="text-primary hover:underline">
                  legal@localelore.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
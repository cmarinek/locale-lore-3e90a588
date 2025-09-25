import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const Admin: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Locale Lore</title>
        <meta name="description" content="Administrative dashboard for managing Locale Lore platform" />
      </Helmet>
      
      <AdminDashboard />
    </>
  );
};

export default Admin;
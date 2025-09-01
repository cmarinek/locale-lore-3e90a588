import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

const AuthResetPassword = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/auth');
  };

  return (
    <AuthLayout
      title="Update Password"
      description="Enter your new password below"
      showBackButton={true}
      onBack={() => navigate('/auth')}
    >
      <PasswordResetForm
        mode="update"
        onSuccess={handleSuccess}
        onBack={() => navigate('/auth')}
      />
    </AuthLayout>
  );
};

export default AuthResetPassword;
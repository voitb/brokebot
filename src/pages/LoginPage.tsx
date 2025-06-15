import React from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";
import { SEOMetadata } from "../components/common/SEOMetadata";

export const LoginPage: React.FC = () => {
  return (
    <>
      <SEOMetadata
        title="Login"
        description="Access your BrokeBot account to continue your conversations."
      />
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
};

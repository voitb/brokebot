import React from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";
import { SEOMetadata } from "../components/common/SEOMetadata";

export const ForgotPasswordPage: React.FC = () => {
  return (
    <>
      <SEOMetadata
        title="Forgot Password"
        description="Recover your BrokeBot account password."
      />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
};

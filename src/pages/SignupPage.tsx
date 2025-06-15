import React from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { SignupForm } from "../components/auth/SignupForm";
import { SEOMetadata } from "../components/common/SEOMetadata";

export const SignupPage: React.FC = () => {
  return (
    <>
      <SEOMetadata
        title="Sign Up"
        description="Create a new BrokeBot account to start your AI journey."
      />
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </>
  );
};

import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";
import { SEOMetadata } from "../components/common/SEOMetadata";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    if (!userId || !secret) {
      navigate("/");
    }
  }, [userId, secret, navigate]);

  if (!userId || !secret) {
    return null; // or a loading indicator
  }

  return (
    <>
      <SEOMetadata
        title="Reset Password"
        description="Set a new password for your BrokeBot account."
      />
      <AuthLayout>
        <ResetPasswordForm userId={userId} secret={secret} />
      </AuthLayout>
    </>
  );
};

import React from "react";
import { SEOMetadata } from "../components/common/SEOMetadata"; 
 

export const TermsOfService: React.FC = () => { 
 

  return (
    <>
      <SEOMetadata
        title="Terms of Service"
        description="Read the terms of service for BrokeBot."
      />
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Welcome to BrokeBot! These terms of service outline the rules and
            regulations for the use of our application.
          </p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using BrokeBot, you accept and agree to be bound by
            the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Our Privacy Policy explains how we
            collect, use, and protect your personal information. Please read it
            carefully. As this is a locally-run application, your data primarily
            stays on your device.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Conduct</h2>
          <p>
            You agree not to use the application for any unlawful purpose or any
            purpose prohibited under this clause. You agree not to use the
            application in any way that could damage the application, services, or
            general business of BrokeBot.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            4. Disclaimers and Limitation of Liability
          </h2>
          <p>
            The application is provided "as is". BrokeBot makes no warranties,
            expressed or implied, and hereby disclaims and negates all other
            warranties. Further, BrokeBot does not warrant or make any
            representations concerning the accuracy or reliability of the use of
            the materials on its website or otherwise relating to such materials
            or on any sites linked to this site.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            5. Changes to This Agreement
          </h2>
          <p>
            We reserve the right to modify these terms of service at any time. We
            do so by posting and drawing attention to the updated terms on the
            Site. Your decision to continue to visit and make use of the Site
            after such changes have been made constitutes your formal acceptance
            of the new Terms of Service.
          </p>
        </div>
      </div>
    </>
  );
};

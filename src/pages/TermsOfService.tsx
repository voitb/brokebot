import React from "react";
import { SEOMetadata } from "../components/common/SEOMetadata"; 

export const TermsOfService: React.FC = () => { 
  return (
    <>
      <SEOMetadata
        title="Terms of Service"
        description="Read the terms of service for brokebot - your privacy-first AI assistant."
      />
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Welcome to <strong>brokebot</strong> - your privacy-first AI assistant! These terms of service outline the rules and
            regulations for the use of our application and explain exactly how your data is handled.
          </p>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using brokebot, you accept and agree to be bound by
            these terms and provisions. If you do not agree to these terms, please do not use our application.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Our Privacy-First Approach</h2>
          <p>
            <strong>brokebot is designed with privacy as the core principle.</strong> Here's exactly what happens with your data:
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">🔒 Local Data Processing</h3>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Conversations:</strong> All your chat messages and conversations are stored locally in your browser using IndexedDB. They never leave your device.</li>
            <li><strong>Files:</strong> Any documents you upload (.txt, .md files) are processed and stored entirely on your device.</li>
            <li><strong>Settings:</strong> Your preferences, selected models, and configuration remain local.</li>
            <li><strong>Local AI Models:</strong> When using WebLLM models, all processing happens directly in your browser with no data transmission.</li>
            <li><strong>API Keys:</strong> If you provide your own API keys (OpenAI, Anthropic, Google), they are encrypted using strong AES-256-GCM encryption with user-specific keys derived via PBKDF2 (100,000 iterations) and stored only in your browser's local storage.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">🌐 What Goes Online</h3>
          <p>Only two features require internet connectivity and data transmission:</p>
          
          <h4 className="text-lg font-medium mt-4 mb-2">A) User Authentication (Optional)</h4>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Service:</strong> Powered by Appwrite (open-source backend)</li>
            <li><strong>Data sent:</strong> Only your email and chosen username for account creation</li>
            <li><strong>Purpose:</strong> Enables cloud sync and conversation sharing features</li>
            <li><strong>Security:</strong> All authentication data is encrypted and follows industry standards</li>
            <li><strong>Optional:</strong> You can use brokebot completely offline without creating an account</li>
          </ul>

          <h4 className="text-lg font-medium mt-4 mb-2">B) OpenRouter Free Models</h4>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>What's sent:</strong> Your chat messages and prompts when using free OpenRouter models</li>
            <li><strong>Trade-off:</strong> In exchange for free access, OpenRouter may use your prompts to improve their models</li>
            <li><strong>Transparency:</strong> This is clearly indicated in the model selection interface</li>
            <li><strong>Alternative:</strong> Use local WebLLM models or your own API keys for complete privacy</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">🔐 External Encryption Services</h3>
          <p>When using your own API keys, brokebot employs additional security measures:</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Server-Side Encryption:</strong> API keys are re-encrypted on our secure Appwrite functions before being sent to AI providers</li>
            <li><strong>User-Specific Keys:</strong> Each user gets a unique encryption key derived from their user ID using cryptographic key derivation (PBKDF2)</li>
            <li><strong>No Key Storage:</strong> The master encryption key is stored only in server environment variables and never logged or persisted</li>
            <li><strong>Transit Security:</strong> All communications use HTTPS/TLS encryption</li>
            <li><strong>Zero Knowledge:</strong> Even our servers cannot decrypt your API keys without your specific user context</li>
            <li><strong>Open Source:</strong> You can inspect the encryption functions in our GitHub repository and even deploy your own instance</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Retention and Deletion</h2>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Local Data:</strong> Remains on your device until you manually delete it or clear browser data</li>
            <li><strong>Account Data:</strong> If you create an account, you can delete it anytime through settings</li>
            <li><strong>Conversation Exports:</strong> You can export your conversations as JSON or Markdown files</li>
            <li><strong>Complete Control:</strong> You have full control over all your data at all times</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. User Conduct and Responsibilities</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">You agree to:</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>Use the application in compliance with all applicable laws and regulations</li>
            <li>Not attempt to reverse engineer, hack, or compromise the application's security</li>
            <li>Not use the service to generate harmful, illegal, or malicious content</li>
            <li>Respect the terms of service of third-party AI providers when using their models</li>
            <li>Keep your account credentials secure if you choose to create an account</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">You are responsible for:</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>The content of your conversations and any files you upload</li>
            <li>Maintaining the security of your own API keys if you choose to use them</li>
            <li>Understanding the privacy implications of different model choices</li>
            <li>Backing up your local data if desired (we provide export functionality)</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Third-Party Services</h2>
          <p>brokebot integrates with several third-party services:</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Appwrite:</strong> For optional user authentication and cloud features</li>
            <li><strong>OpenRouter:</strong> For access to various AI models (when you choose to use them)</li>
            <li><strong>WebLLM:</strong> For local AI model execution (no data leaves your device)</li>
            <li><strong>Model Providers:</strong> OpenAI, Anthropic, Google (only when you provide your own API keys)</li>
          </ul>
          <p>
            Each third-party service has its own terms of service and privacy policy. 
            We encourage you to read them to understand how your data is handled.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Open Source Commitment</h2>
          <p>
            brokebot is open source software released under the MIT License. This means:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>You can inspect our code to verify our privacy claims</li>
            <li>You can modify and distribute the software</li>
            <li>You can run your own instance for complete control</li>
            <li>The community can contribute to improvements and security</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Disclaimers and Limitations</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Service Availability</h3>
          <p>
            The application is provided "as is" without warranties of any kind. While we strive for 
            reliability, we cannot guarantee continuous availability of online features.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">AI-Generated Content</h3>
          <p>
            AI models may produce inaccurate, biased, or inappropriate content. Users should:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Verify important information from AI responses</li>
            <li>Use their judgment when acting on AI-generated advice</li>
            <li>Understand that AI models reflect patterns in their training data</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Limitation of Liability</h3>
          <p>
            brokebot and its developers shall not be liable for any direct, indirect, incidental, 
            special, or consequential damages resulting from the use or inability to use the service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to These Terms</h2>
          <p>
            We may update these terms occasionally to reflect changes in the application or legal requirements. 
            When we do:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>We'll update the "Last updated" date at the top</li>
            <li>Significant changes will be announced through the application</li>
            <li>Continued use constitutes acceptance of updated terms</li>
            <li>You can always access the current terms within the application</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Information</h2>
          <p>
            If you have questions about these terms or our privacy practices:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Email:</strong> v017dev@gmail.com</li>
            <li><strong>GitHub:</strong> <a href="https://github.com/voitb/brokebot" className="text-blue-600 hover:underline">github.com/voitb/brokebot</a></li>
            <li><strong>Security Issues:</strong> v017dev@gmail.com</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. Governing Law</h2>
          <p>
            These terms are governed by the laws of Poland. Any disputes will be resolved 
            in accordance with Polish jurisdiction.
          </p>

          <hr className="my-8" />
          
          <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">🛡️ Summary: Your Privacy Matters</h3>
            <p className="mb-3">
              <strong>brokebot is built privacy-first.</strong> Your conversations, files, and personal data 
              stay on your device by default. Only optional features (account creation and free AI models) 
              involve any data transmission, and we're completely transparent about what, when, and why.
            </p>
            <p>
              You have complete control over your data and can use brokebot entirely offline if you prefer. 
              That's the beauty of local-first software! 🎉
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

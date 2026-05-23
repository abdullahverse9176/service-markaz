import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Service Markaz Terms and Conditions. Please read these terms carefully before using our services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">
            Last Updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Service Markaz. By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
              Service Markaz is a local services marketplace that connects customers with service providers across Pakistan.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p><strong>2.1 Registration:</strong> To create an account, you must provide accurate and complete information.</p>
              <p><strong>2.2 Account Security:</strong> You are responsible for maintaining the security of your account credentials.</p>
              <p><strong>2.3 Account Types:</strong> Service Markaz offers two types of accounts - Customer and Provider</p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Provider Terms</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p><strong>3.1 Business Listing:</strong> Providers must provide accurate business information when creating their listings.</p>
              <p><strong>3.2 Verification:</strong> Business verification is optional but highly recommended to build trust with customers.</p>
              <p><strong>3.3 Lead Response:</strong> Providers are expected to respond to customer leads in a timely manner.</p>
              <p><strong>3.4 Service Quality:</strong> Providers must deliver quality services as advertised on their profiles.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Customer Terms</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p><strong>4.1 Service Booking:</strong> Customers can directly contact service providers through the platform.</p>
              <p><strong>4.2 Reviews:</strong> Customer reviews must be honest, fair, and respectful.</p>
              <p><strong>4.3 Payment:</strong> All payments are settled directly between customers and providers. Service Markaz is not involved in financial transactions.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Activities</h2>
            <div className="space-y-2 text-gray-700">
              <p>The following activities are strictly prohibited on our platform:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing fake or misleading information</li>
                <li>Spam, harassment, or abusive behavior</li>
                <li>Promoting illegal activities or services</li>
                <li>Misusing the platform for unauthorized purposes</li>
                <li>Accessing other users' accounts without permission</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Referral Program</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p><strong>6.1 Eligibility:</strong> Only verified service providers can participate in the referral program.</p>
              <p><strong>6.2 Rewards:</strong> Rewards are automatically granted when referral milestones are achieved.</p>
              <p><strong>6.3 Fraud Prevention:</strong> Accounts found engaging in fake referrals will be suspended or terminated.</p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on the Service Markaz platform, including logos, trademarks, and design elements, are the intellectual property of Service Markaz. 
              You may not copy, distribute, or reproduce any content without prior written permission.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              Service Markaz is a platform that connects customers with service providers. 
              We are not responsible for the quality of services, pricing disputes, or provider behavior. 
              Users are advised to conduct their own due diligence before engaging with service providers.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Service Markaz shall not be liable for any direct, indirect, incidental, consequential, or punitive damages 
              arising from your use of the platform or services obtained through the platform.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Service Markaz reserves the right to modify these Terms and Conditions at any time. 
              Users will be notified of significant changes via email or platform notifications.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions, please{' '}
              <Link href="/contact-us" className="text-teal-600 hover:text-teal-700 font-semibold">
                contact us
              </Link>
              .
            </p>
          </section>

        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

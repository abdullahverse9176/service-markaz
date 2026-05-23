import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Service Markaz Privacy Policy. Learn how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
              Service Markaz takes your privacy seriously. This Privacy Policy explains how we 
              collect, use, and protect your personal information when you use our platform.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Business information (for service providers)</li>
                  <li>Profile pictures and business images</li>
                  <li>Location data (optional)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on the platform</li>
                  <li>Search queries and user interactions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="space-y-2 text-gray-700">
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To create and manage your account</li>
                <li>To connect service providers with customers</li>
                <li>To improve and personalize our platform</li>
                <li>To provide customer support</li>
                <li>To send important updates and notifications</li>
                <li>To prevent fraud and abuse</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p><strong>4.1 Public Information:</strong> Provider profiles are publicly visible, including business name, contact information, and customer reviews.</p>
              <p><strong>4.2 With Service Providers:</strong> When you create a lead, your contact information is shared with the service provider.</p>
              <p><strong>4.3 Third Parties:</strong> We do not sell your personal information to third parties.</p>
              <p><strong>4.4 Legal Requirements:</strong> We may share information when required by law or to comply with legal obligations.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We use industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure password hashing</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies & Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              Service Markaz uses cookies and similar technologies to improve user experience. 
              You can disable cookies in your browser settings, but some features may not work properly.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <div className="space-y-2 text-gray-700">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> You can access your personal information at any time</li>
                <li><strong>Correction:</strong> You can correct inaccurate information</li>
                <li><strong>Deletion:</strong> You can request account deletion</li>
                <li><strong>Opt-out:</strong> You can unsubscribe from marketing emails</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information as long as your account is active or as needed to fulfill legal requirements. 
              After account deletion, we will delete your personal information within a reasonable timeframe.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Service Markaz is not intended for users under 18 years of age. 
              We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              Service Markaz uses third-party services (Google OAuth, AWS S3, etc.). 
              These services have their own privacy policies, which are available on their respective websites.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. 
              Users will be notified of significant changes via email or platform notifications.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions or concerns about our privacy practices, please{' '}
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

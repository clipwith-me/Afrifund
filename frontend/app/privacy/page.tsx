export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-4 text-sm text-gray-500">Last updated: June 12, 2026</p>

      <div className="mt-8 space-y-8 text-gray-600">
        <section>
          <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
          <p className="mt-2">
            AfriFund ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and safeguard your information when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
          <p className="mt-2">We collect information you provide directly to us, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Name, email address, and contact information</li>
            <li>Campaign information and project details</li>
            <li>Payment and transaction information</li>
            <li>KYC verification documents</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
          <p className="mt-2">We use your information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Verify user identity through KYC processes</li>
            <li>Send updates about campaigns you support</li>
            <li>Respond to your requests and provide customer support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
          <p className="mt-2">
            We implement appropriate security measures to protect your personal information. However, no
            method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, please contact us at privacy@afrifund.com
          </p>
        </section>
      </div>
    </div>
  );
}

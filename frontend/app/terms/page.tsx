export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-4 text-sm text-gray-500">Last updated: June 12, 2026</p>

      <div className="mt-8 space-y-8 text-gray-600">
        <section>
          <h2 className="text-2xl font-bold text-gray-900">Agreement to Terms</h2>
          <p className="mt-2">
            By accessing and using AfriFund, you agree to be bound by these Terms of Service and all
            applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
          <p className="mt-2">
            When you create an account with us, you must provide accurate and complete information. You
            are responsible for maintaining the security of your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Guidelines</h2>
          <p className="mt-2">Campaign creators must:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide honest and accurate information about their projects</li>
            <li>Complete KYC verification before launching campaigns</li>
            <li>Use funds for stated project purposes</li>
            <li>Keep backers updated on project progress</li>
            <li>Fulfill any promises made to backers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Payments and Fees</h2>
          <p className="mt-2">
            AfriFund charges a platform fee on successfully funded campaigns. Payment processing fees
            may also apply. All fees will be clearly disclosed before you complete a transaction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
          <p className="mt-2">
            AfriFund is a platform connecting creators and backers. We are not responsible for the
            success or failure of campaigns, or for any disputes between users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
          <p className="mt-2">
            For questions about these Terms, contact us at legal@afrifund.com
          </p>
        </section>
      </div>
    </div>
  );
}

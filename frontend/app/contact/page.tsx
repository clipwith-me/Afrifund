export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
      <div className="mt-8 space-y-6">
        <p className="text-lg text-gray-600">
          Have questions or need support? We're here to help!
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Email</h3>
            <p className="text-gray-600">support@afrifund.com</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">General Inquiries</h3>
            <p className="text-gray-600">info@afrifund.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

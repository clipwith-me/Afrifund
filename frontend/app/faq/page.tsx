export default function FAQPage() {
  const faqs = [
    {
      question: 'How does AfriFund work?',
      answer: 'AfriFund connects African entrepreneurs with backers and mentors. Create a campaign, share your vision, and receive funding and expert guidance to bring your project to life.',
    },
    {
      question: 'Who can create a campaign?',
      answer: 'Anyone with an innovative project idea can create a campaign. We welcome entrepreneurs, startups, and innovators from all across Africa.',
    },
    {
      question: 'How do I become a backer?',
      answer: 'Simply browse our campaigns, find projects you believe in, and contribute any amount. All backers receive a free digital certificate of contribution.',
    },
    {
      question: 'What is the mentorship program?',
      answer: 'Our unique mentorship program connects campaigns with experienced professionals who provide guidance in exchange for equity. This ensures sustainable support for growing businesses.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept payments through Flutterwave and Paystack, supporting various payment methods across Africa.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
      <div className="mt-12 space-y-8">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold text-gray-900">{faq.question}</h3>
            <p className="mt-2 text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

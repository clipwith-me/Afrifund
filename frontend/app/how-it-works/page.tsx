export default function HowItWorksPage() {
  const steps = [
    {
      title: 'Create Your Campaign',
      description: 'Sign up and create a compelling campaign showcasing your project, goals, and vision. Add images, videos, and detailed information to attract backers.',
    },
    {
      title: 'Get Funded & Find Mentors',
      description: 'Share your campaign with potential backers across Africa and beyond. Connect with experienced mentors who provide expertise in exchange for equity.',
    },
    {
      title: 'Bring Your Vision to Life',
      description: 'Use the funds and mentorship to execute your project. Keep your backers updated on your progress and celebrate success together.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900">How AfriFund Works</h1>
      <p className="mt-4 text-lg text-gray-600">
        Three simple steps to turn your innovative idea into reality
      </p>

      <div className="mt-12 space-y-12">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
              {index + 1}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-primary-50 p-8">
        <h3 className="text-xl font-bold text-gray-900">Why Choose AfriFund?</h3>
        <ul className="mt-4 space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Free digital certificates for all backers</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Expert mentorship with equity-based compensation</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Transparent KYC verification process</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Support for multiple African payment methods</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

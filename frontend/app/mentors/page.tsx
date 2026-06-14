export default function MentorsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Find a Mentor</h1>
        <p className="mt-4 text-lg text-gray-600">
          Connect with experienced professionals who provide guidance in exchange for equity
        </p>
      </div>

      <div className="mt-12 rounded-lg bg-primary-50 p-8">
        <h2 className="text-2xl font-bold text-gray-900">Mentorship Program</h2>
        <div className="mt-6 space-y-4 text-gray-700">
          <p>
            Our unique mentorship program connects innovative African entrepreneurs with
            experienced business professionals and industry experts.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900">For Entrepreneurs:</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Get expert guidance from industry professionals</li>
                <li>Access to valuable networks and resources</li>
                <li>Strategic advice tailored to your business</li>
                <li>Equity-based compensation for mentors</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">For Mentors:</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Earn equity in promising startups</li>
                <li>Support African innovation and entrepreneurship</li>
                <li>Flexible time commitment</li>
                <li>Track record of successful mentorships</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">Mentor profiles coming soon!</p>
      </div>
    </div>
  );
}

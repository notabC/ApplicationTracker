export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d21] to-[#15171a] p-4 md:p-8">
      {/* Header section remains the same */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: 20 November 2024</p>
        </div>

        <div className="space-y-6">
          {/* Overview Card */}
          <section className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-gradient-slow" />
            <div className="relative backdrop-blur-xl border border-white/10 p-6 md:p-8">
              <p className="text-gray-300 leading-relaxed">
                The Job Application Tracker is committed to protecting your privacy. This policy explains how we handle your data, 
                what we collect, and how we use it to help you track your job applications. We prioritize your privacy by letting you 
                maintain full control over which emails are imported and stored.
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="group rounded-3xl bg-[#1e2228] hover:bg-[#1f2329] transition-all duration-300 p-6 md:p-8 border border-white/5">
            <h2 className="text-2xl font-semibold text-white mb-6">Data We Collect</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/20">
                <div className="h-2 w-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div>
                  <h3 className="text-white font-medium mb-1">Google Authentication Data</h3>
                  <p className="text-gray-400">Basic profile information (name and email) when you sign in with Google</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/20">
                <div className="h-2 w-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div>
                  <h3 className="text-white font-medium mb-1">Email Data</h3>
                  <p className="text-gray-400">We request read-only access to Gmail to display your job-related emails. However, we only store the specific emails you explicitly select for import. No emails are stored without your direct selection and consent.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/20">
                <div className="h-2 w-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div>
                  <h3 className="text-white font-medium mb-1">Job Applications</h3>
                  <p className="text-gray-400">Information about your job applications that you choose to track</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="group rounded-3xl bg-[#1e2228] hover:bg-[#1f2329] transition-all duration-300 p-6 md:p-8 border border-white/5">
            <h2 className="text-2xl font-semibold text-white mb-6">How We Use Your Data</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Only for tracking and managing your job applications
              </li>
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                We only store emails you explicitly select to import
              </li>
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Data is stored securely on AWS servers
              </li>
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                We never share your data with third parties
              </li>
            </ul>
          </section>

          {/* Cookie Usage */}
          <section className="group rounded-3xl bg-[#1e2228] hover:bg-[#1f2329] transition-all duration-300 p-6 md:p-8 border border-white/5">
            <h2 className="text-2xl font-semibold text-white mb-6">Cookie Usage</h2>
            <div className="space-y-3 text-gray-300">
              <p>We use cookies for:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Authentication (keeping you signed in)
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Storing your email import preferences
                </li>
              </ul>
            </div>
          </section>

          {/* Your Rights section remains the same */}
          <section className="group rounded-3xl bg-[#1e2228] hover:bg-[#1f2329] transition-all duration-300 p-6 md:p-8 border border-white/5">
            <h2 className="text-2xl font-semibold text-white mb-6">Your Rights</h2>
            <div className="space-y-4 text-gray-300">
              <p>You have the right to:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Request a copy of your data
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Request deletion of your data
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Withdraw your consent at any time
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Control which emails are imported and stored
                </li>
              </ul>
              <p className="mt-4">Data will be retained until you request its deletion.</p>
            </div>
          </section>

          {/* Contact section remains the same */}
          <section className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-gradient-slow" />
            <div className="relative backdrop-blur-xl border border-white/10 p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300">
                For any privacy-related questions or to exercise your data rights, please contact us at:{' '}
                <a 
                  href="mailto:wudongyiu@gmail.com" 
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  wudongyiu@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
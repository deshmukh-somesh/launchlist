// app/legal/privacy/page.tsx
export default function PrivacyPolicyPage() {
    return (
      <div className="min-h-screen bg-[#151725] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-400">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Data Protection Commitment</h2>
              <p>At Product Launches (productlaunches.in), we are committed to protecting your privacy. We do not share your personal information with any third parties.</p>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email)</li>
                <li>Product submission details</li>
                <li>Payment information for featured listings</li>
                <li>Usage analytics to improve our service</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Data Usage</h2>
              <p>We use your information solely to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process your product submissions</li>
                <li>Display your products on our platform</li>
                <li>Create promotional content (for featured listings)</li>
                <li>Communicate important updates</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Your Data Rights</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Request data corrections</li>
                <li>Delete your account and data</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p>For privacy concerns:</p>
              <p className="text-[#6E3AFF]">productlaunchesg@gmail.com</p>
              <p className="text-[#6E3AFF]">https://www.productlaunches.in</p>
            </section>
  
            <p className="text-sm text-gray-500 mt-8">Last updated: January 23, 2025</p>
          </div>
        </div>
      </div>
    );
  }
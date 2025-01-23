// app/legal/terms/page.tsx
export default function TermsPage() {
    return (
      <div className="min-h-screen bg-[#151725] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Terms & Conditions</h1>
          
          <div className="space-y-6 text-gray-400">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">1. Product Submissions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Products must be legitimate and functional</li>
                <li>Featured listings cost $10 (non-refundable)</li>
                <li>We reserve right to reject inappropriate submissions</li>
                <li>Creators retain ownership of their products</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">2. Featured Listings</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Premium placement at the top of Product Launches</li>
                <li>Includes Instagram and YouTube Reel promotion</li>
                <li>Payment must be completed before featuring</li>
                <li>No refunds on featured listings</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">3. Promotional Content</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We create promotional content for featured products</li>
                <li>Right to use product assets in promotions</li>
                <li>Distribution on our social media channels</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">4. Account Rules</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accurate information required</li>
                <li>No fraudulent or spam submissions</li>
                <li>Respect community guidelines</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p>Questions about terms:</p>
              <p className="text-[#6E3AFF]">productlaunchesg@gmail.com</p>
              <p className="text-[#6E3AFF]">https://www.productlaunches.in</p>
            </section>
  
            <p className="text-sm text-gray-500 mt-8">Last updated: January 23, 2025</p>
          </div>
        </div>
      </div>
    );
  }
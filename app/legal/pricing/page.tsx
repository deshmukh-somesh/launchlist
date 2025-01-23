// app/legal/pricing/page.tsx
export default function PricingPolicyPage() {
    return (
      <div className="min-h-screen bg-[#151725] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Pricing Policy</h1>
          
          <div className="space-y-6 text-gray-400">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Featured Product Listing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>$10 one-time fee for featured product placement</li>
                <li>Premium spot on the top of Product Launches</li>
                <li>Complimentary promotional content:</li>
                <ul className="list-disc pl-6 mt-2">
                  <li>Instagram Reel feature</li>
                  <li>YouTube Reel promotion</li>
                </ul>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Standard Listing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Free product submission</li>
                <li>Standard position based on launch date</li>
                <li>Basic product analytics</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Payment Terms</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices in USD</li>
                <li>Payment required before featured placement</li>
                <li>No refunds on featured listings</li>
                <li>Secure payment processing</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p>For pricing inquiries:</p>
              <p className="text-[#6E3AFF]">productlaunchesg@gmail.com</p>
              <p className="text-[#6E3AFF]">https://www.productlaunches.in</p>
            </section>
  
            <p className="text-sm text-gray-500 mt-8">Last updated: January 23, 2025</p>
          </div>
        </div>
      </div>
    );
  }
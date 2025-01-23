// app/legal/refund/page.tsx
export default function RefundPage() {
    return (
      <div className="min-h-screen bg-[#151725] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Refund Policy</h1>
          
          <div className="space-y-6 text-gray-400">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">No Refund Policy</h2>
              <p>Product Launches operates on a strict no-refund policy for featured listings. The $10 fee for featured placement is non-refundable under any circumstances.</p>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Featured Listing Terms</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment is final and non-refundable</li>
                <li>Featured spot guaranteed upon payment</li>
                <li>Includes promotional content creation</li>
                <li>Social media promotion included</li>
              </ul>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p>For any questions:</p>
              <p className="text-[#6E3AFF]">productlaunchesg@gmail.com</p>
              <p className="text-[#6E3AFF]">https://www.productlaunches.in</p>
            </section>
  
            <p className="text-sm text-gray-500 mt-8">Last updated: January 23, 2025</p>
          </div>
        </div>
      </div>
    );
  }
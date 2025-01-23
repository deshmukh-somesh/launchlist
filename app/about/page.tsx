// app/about/page.tsx
export default function AboutPage() {
    return (
      <div className="min-h-screen bg-[#151725] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] text-transparent bg-clip-text mb-8">
            About Product Launches
          </h1>
          
          <div className="space-y-8 text-gray-400">
            <section className="space-y-4">
              <p className="text-lg text-white">
                Product Launches is India&apos;s premier platform for discovering and launching innovative digital products. We connect talented creators with engaged audiences, providing a spotlight for products that deserve recognition.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2 mt-12">
                <div className="bg-[#1A1C2E] p-6 rounded-lg border border-[#2A2B3C]">
                  <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
                  <p>Empowering creators by giving their products the visibility they deserve through strategic promotion and community engagement.</p>
                </div>
  
                <div className="bg-[#1A1C2E] p-6 rounded-lg border border-[#2A2B3C]">
                  <h3 className="text-xl font-semibold text-white mb-3">Our Vision</h3>
                  <p>To become the go-to platform for digital product launches in India, fostering innovation and creator success.</p>
                </div>
              </div>
            </section>
  
            <section className="mt-12 space-y-6">
              <h2 className="text-2xl font-semibold text-white">What We Offer</h2>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-[#1A1C2E] p-6 rounded-lg border border-[#2A2B3C]">
                  <h3 className="text-lg font-semibold text-white mb-3">Premium Visibility</h3>
                  <p>Featured spots that put your product in front of engaged audiences.</p>
                </div>
  
                <div className="bg-[#1A1C2E] p-6 rounded-lg border border-[#2A2B3C]">
                  <h3 className="text-lg font-semibold text-white mb-3">Social Promotion</h3>
                  <p>Instagram and YouTube Reel creation to amplify your product&apos;s reach.</p>
                </div>
  
                <div className="bg-[#1A1C2E] p-6 rounded-lg border border-[#2A2B3C]">
                  <h3 className="text-lg font-semibold text-white mb-3">Community</h3>
                  <p>A supportive ecosystem of creators, makers, and early adopters.</p>
                </div>
              </div>
            </section>
  
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>
              <div className="bg-[#1A1C2E] p-6 rounded-lg border border-[#2A2B3C]">
                <p className="mb-4">Have questions or want to feature your product?</p>
                <p className="text-[#6E3AFF]">productlaunchesg@gmail.com</p>
                <p className="text-[#6E3AFF]">https://www.productlaunches.in</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
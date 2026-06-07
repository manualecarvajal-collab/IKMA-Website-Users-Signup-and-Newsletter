export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop min-h-[calc(100vh-5rem)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center w-full">
          <div className="flex flex-col space-y-6 pr-0 lg:pr-12">
            <h1 className="font-headline-xl text-[clamp(2.5rem,5vw,4rem)] text-on-surface tracking-tight leading-[1.05]">
              Healing through <span className="text-primary">faith</span> and{" "}
              <span className="text-primary">excellence</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              We are a mission-driven medical association dedicated to providing accessible, high-quality healthcare and
              funding to those in need. Join us in making a profound impact on communities worldwide.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <button className="bg-primary text-on-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-all shadow-[0_8px_16px_0_rgba(7,68,105,0.1)] active:scale-95 cursor-pointer">
                Support Our Mission
              </button>
              <button className="bg-secondary-container text-primary font-label-bold text-label-bold px-8 py-3.5 rounded-lg hover:bg-secondary-container/80 transition-all active:scale-95 flex items-center space-x-2 cursor-pointer">
                <span>Sign up for free</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-[0_20px_40px_0_rgba(7,68,105,0.06)] bg-surface-variant">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV8zbc1VsO7_tMSGR2RBmy6wM6vk-VcvPAmV4KSqnAbpXaDgYRIA4gYQ3-WCdTkOes_cs4xLagdchqy5qS9UUKg5g00jrHqRcErnzU_2ZeQSakEnHY73GpQash7mHRT7Iuq0cN_OvZe-XsB-AQAYHsh5sq8Ahn4JLhRpUTUlw_uxTaPGQxvuPedNh1Dq7dA_0XvAnBpHbBF9DJOBP8O9D3Dz9QZbEBOmLAOzuhKLhDG3VygVGyw52wlxyqJ3gmZkKMlPq-lB7rbyM"
              alt="Medical professionals working together"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Insights & Stories Section */}
      <section className="bg-surface-container-lowest py-section-padding border-t border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Insights &amp; Stories</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Updates from our missions and medical breakthroughs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <article className="flex flex-col group cursor-pointer">
              <div className="w-full h-64 rounded-lg overflow-hidden mb-6 bg-surface-variant shadow-sm relative group-hover:shadow-[0_20px_20px_0_rgba(7,68,105,0.04)] group-hover:-translate-y-1 transition-all duration-300">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtj2_UADzENxPpAypwUlKOXfP4jAXr84LcletR9iXHB7vovWFIWSQiZFVZRPT7e6_LM5aNm6bEBZw9XR5qvQvHobmdV_ZfS-CA5L4wSdrTn_nlrJnLw910ii3aW6ZYDJGjQkh9GAobbDlZPu0zWNvwI1apafl-vBpzM_9UOSl7BSoCR1cGNw8-bOoiYqllNt8jRpH48udSBxjEVVI_F8iyOxgHBaubo2ewEdVyxhUozTUsrhStCgmDviC_m5vimSP9-T2lyLb5Qn8"
                  alt="Medical supplies being prepared"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center mb-3">
                <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
                  Mission Update
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">
                Expanding Care in Rural Communities
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-4">
                Our latest initiative has successfully established three new mobile clinics, bringing essential pediatric
                and maternal care to previously unreached regions.
              </p>
              <div className="flex items-center text-primary font-semibold space-x-1">
                <span>Read More</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </div>
            </article>
            <div className="flex flex-col space-y-6">
              <div className="flex space-x-4 p-4 rounded-lg hover:bg-surface-container transition-colors cursor-pointer group">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4UImxzKlQG1xEgUib0LCmX5PloStnSX8JKONE1ppvULsfXyL_j8czGSN-WTspKXccjm68nKpBBqpY7PXru8I749gQnOl9UiTNo1uxh_e171GPTj1cB3FyXZflYO73khwbZReyZqjRM8be-zv1JduZty_FsoalyBJ9AJsGLxNzaP7_6886clLzQ3CPrYdXW7LBNQuGcbsaEw2T7ohxEZBp1znmPUIq9Zt4HO_ZtQnCeE7mywsNIdBqFWJ1PM_iWh7h1Jfrj3DO9uY"
                    alt="Hands holding a growing plant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">Patient Story</span>
                  <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Maria's Recovery</h4>
                  <p className="text-sm text-on-surface-variant line-clamp-1">Life-saving cardiovascular surgery for a young mother.</p>
                  <button className="text-xs font-bold text-primary mt-1 hover:underline cursor-pointer">Read More</button>
                </div>
              </div>
              <div className="flex space-x-4 p-4 rounded-lg hover:bg-surface-container transition-colors cursor-pointer group">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV8zbc1VsO7_tMSGR2RBmy6wM6vk-VcvPAmV4KSqnAbpXaDgYRIA4gYQ3-WCdTkOes_cs4xLagdchqy5qS9UUKg5g00jrHqRcErnzU_2ZeQSakEnHY73GpQash7mHRT7Iuq0cN_OvZe-XsB-AQAYHsh5sq8Ahn4JLhRpUTUlw_uxTaPGQxvuPedNh1Dq7dA_0XvAnBpHbBF9DJOBP8O9D3Dz9QZbEBOmLAOzuhKLhDG3VygVGyw52wlxyqJ3gmZkKMlPq-lB7rbyM"
                    alt="Medical staff in hallway"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Excellence</span>
                  <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Medical Excellence in Faith-Based Care</h4>
                  <p className="text-sm text-on-surface-variant line-clamp-1">How we integrate spiritual values with world-class medical standards.</p>
                  <button className="text-xs font-bold text-primary mt-1 hover:underline cursor-pointer">Read More</button>
                </div>
              </div>
              <div className="flex space-x-4 p-4 rounded-lg hover:bg-surface-container transition-colors cursor-pointer group">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC03_6DfzYX6va02PtEg3uKMPfTx9qbP8biGLZEhm8sEMuealLUGntsFSVusJL0QXkADDx9gZOIuptHYPMo7p4pnF_VozdK6foynOWpU3UaECPZVXPi-j2N7Jt67k0DmWCKosPiLm7qqzVUzoufv17qV9viiOaJZKSdDhnC10JcHCdM93uM9TaOcPiGn35JooQuYUO9TyMbycXRplAvqVl6o6DCSCNroMN2eDBoYgOWWXly5cqPBKrTRMslsUAkCb5InkQc2xwvFbU"
                    alt="Doctor smiling"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Community News</span>
                  <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Community Spotlight: Volunteer Impact</h4>
                  <p className="text-sm text-on-surface-variant line-clamp-1">Celebrating the dedicated individuals who make our missions possible.</p>
                  <button className="text-xs font-bold text-primary mt-1 hover:underline cursor-pointer">Read More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

export default function AboutPage() {
  return (
    <div className="scrollable-page bg-dark-bg">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-candle-amber/20 flex items-center justify-center">
              <div className="w-6 h-6 bg-candle-amber rounded-full shadow-lg shadow-candle-amber/50"></div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-candle-glow mb-6">
              Tänd ett ljus
            </h1>
            <p className="text-lg text-gray-400 font-body leading-relaxed max-w-xl mx-auto">
              A light in the darkness. A symbol of hope. A connection that transcends distance.
            </p>
          </div>

          {/* Story */}
          <div className="space-y-10">
            {/* Section 1 */}
            <section className="bg-dark-surface/30 rounded-2xl p-8 border border-forest-dark/20">
              <h2 className="font-display text-2xl text-candle-amber mb-4">
                Why We Built This
              </h2>
              <div className="space-y-4 text-gray-300 font-body leading-relaxed">
                <p>
                  The holiday season is a time for warmth, family, and togetherness. But for many
                  people around the world, this time brings a different reality — one of separation,
                  loss, and longing.
                </p>
                <p>
                  Wars have torn families apart. Economic hardships have forced loved ones to different
                  corners of the world. Some spend the holidays alone, far from the embrace of those
                  they hold dear.
                </p>
                <p>
                  <strong className="text-candle-glow">Tänd ett ljus</strong> — Swedish for "Light a candle" —
                  is our way of bringing people together, even when physical distance separates them.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-dark-surface/30 rounded-2xl p-8 border border-forest-dark/20">
              <h2 className="font-display text-2xl text-candle-amber mb-4">
                How It Works
              </h2>
              <div className="space-y-4 text-gray-300 font-body leading-relaxed">
                <p>
                  When you light a candle on our map, you're doing more than making a donation —
                  you're sending a beacon of hope across Sweden and beyond.
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-candle-amber rounded-full mt-2 flex-shrink-0"></div>
                    <span>Each candle represents a real donation to help those in need during the holidays</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-candle-amber rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your name appears on the map, showing the world that you care</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-candle-amber rounded-full mt-2 flex-shrink-0"></div>
                    <span>The larger your donation, the brighter and longer your candle burns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-candle-amber rounded-full mt-2 flex-shrink-0"></div>
                    <span>Join a team and compete with others to spread the most light</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-dark-surface/30 rounded-2xl p-8 border border-forest-dark/20">
              <h2 className="font-display text-2xl text-candle-amber mb-4">
                Where Your Donation Goes
              </h2>
              <div className="space-y-4 text-gray-300 font-body leading-relaxed">
                <p>
                  Every candle you light helps provide:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-forest-dark/20 rounded-xl p-4 border border-forest-dark/30">
                    <h3 className="font-display text-lg text-white mb-1">Warm Meals</h3>
                    <p className="text-sm text-gray-400">Holiday dinners for families who can't afford them</p>
                  </div>
                  <div className="bg-forest-dark/20 rounded-xl p-4 border border-forest-dark/30">
                    <h3 className="font-display text-lg text-white mb-1">Shelter</h3>
                    <p className="text-sm text-gray-400">Safe, warm places for those without homes</p>
                  </div>
                  <div className="bg-forest-dark/20 rounded-xl p-4 border border-forest-dark/30">
                    <h3 className="font-display text-lg text-white mb-1">Gifts for Children</h3>
                    <p className="text-sm text-gray-400">Joy for kids who might otherwise go without</p>
                  </div>
                  <div className="bg-forest-dark/20 rounded-xl p-4 border border-forest-dark/30">
                    <h3 className="font-display text-lg text-white mb-1">Connection</h3>
                    <p className="text-sm text-gray-400">Helping separated families stay in touch</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quote */}
            <section className="text-center py-8">
              <blockquote className="font-display text-2xl md:text-3xl text-candle-glow italic leading-relaxed">
                "It is better to light a candle than curse the darkness."
              </blockquote>
              <cite className="text-gray-500 mt-4 block">— Eleanor Roosevelt</cite>
            </section>

            {/* Call to Action */}
            <section className="text-center bg-gradient-to-b from-candle-amber/10 to-transparent rounded-2xl p-8 border border-candle-amber/20">
              <h2 className="font-display text-3xl text-candle-glow mb-4">
                Be Part of Something Beautiful
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                This holiday season, join thousands of others in lighting up Sweden.
                Together, we can push back the darkness and bring hope to those who need it most.
              </p>
              <Link
                to="/donate"
                className="inline-block btn-primary text-lg px-8 py-4 font-display"
              >
                Tänd ett ljus
              </Link>
            </section>

            {/* Technical Note */}
            <section className="text-center text-sm text-gray-500 pt-8 border-t border-forest-dark/20">
              <p>
                Built with love for the Hackathon 2024. This is a demonstration project
                showcasing how technology can be used for social good.
              </p>
              <p className="mt-2">
                Made with React, Three.js, and AWS
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-candle-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-forest-dark/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-candle-glow/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

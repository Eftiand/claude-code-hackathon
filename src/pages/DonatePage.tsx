import { Header } from '../components/Header';
import { DonationForm } from '../components/DonationForm';

export default function DonatePage() {
  return (
    <div className="scrollable-page bg-dark-bg">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Hero section */}
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-candle-glow mb-4">
              Tänd ett ljus
            </h2>
            <p className="text-gray-400 font-body text-lg">
              Push back the darkness with your donation. Your candle will shine
              on the map of Sweden.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-dark-surface/50 backdrop-blur-sm rounded-2xl border border-forest-dark/20 p-6 md:p-8">
            <DonationForm />
          </div>

          {/* Additional info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              The larger your donation, the brighter your candle shines and the
              longer it burns.
            </p>
          </div>
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-candle-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-forest-dark/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

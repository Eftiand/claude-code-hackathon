import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-forest-dark/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-candle-amber/80 group-hover:bg-candle-amber transition-colors shadow-sm shadow-candle-amber/30"></div>
          <h1 className="font-display text-xl md:text-2xl font-semibold text-candle-glow group-hover:text-candle-amber transition-colors">
            Tänd ett ljus
          </h1>
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            to="/"
            className={`font-body text-sm md:text-base transition-colors ${
              location.pathname === '/'
                ? 'text-candle-amber'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Map
          </Link>
          <Link
            to="/donate"
            className={`font-body text-sm md:text-base transition-colors ${
              location.pathname === '/donate'
                ? 'text-candle-amber'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Donate
          </Link>
          <Link
            to="/about"
            className={`font-body text-sm md:text-base transition-colors ${
              location.pathname === '/about'
                ? 'text-candle-amber'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

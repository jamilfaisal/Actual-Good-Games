import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Actual Good Games</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/games" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Games
                </Link>
                <Link href="/reviews" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Reviews
                </Link>
                <Link href="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Games
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Worth Playing
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Cut through the noise and find genuinely exceptional video games. 
            Each recommendation comes with honest reviews and community ratings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105">
              Browse Games
            </button>
            <button className="border border-gray-400 text-gray-300 hover:text-white hover:border-white font-bold py-3 px-8 rounded-lg transition duration-300">
              Read Reviews
            </button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Find Your Next Game</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for games by title, genre, or platform..."
                className="w-full bg-gray-700 text-white px-6 py-4 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none text-lg"
              />
              <button className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">Featured Games</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Game Card 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-400 transition duration-300 transform hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Game Image</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-white mb-2">Amazing RPG</h4>
                <p className="text-gray-300 mb-4">An incredible journey through a fantasy world with deep storytelling and character development.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                    <span className="text-gray-300 ml-2">9.2/10</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 font-semibold">Read Review</button>
                </div>
              </div>
            </div>

            {/* Game Card 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-400 transition duration-300 transform hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Game Image</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-white mb-2">Stellar Strategy</h4>
                <p className="text-gray-300 mb-4">A mind-bending strategy game that will challenge your tactical thinking and planning skills.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-lg">★★★★☆</span>
                    <span className="text-gray-300 ml-2">8.7/10</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 font-semibold">Read Review</button>
                </div>
              </div>
            </div>

            {/* Game Card 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-400 transition duration-300 transform hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Game Image</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-white mb-2">Action Adventure</h4>
                <p className="text-gray-300 mb-4">Fast-paced action combined with exploration and puzzle-solving in a beautiful open world.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                    <span className="text-gray-300 ml-2">9.5/10</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 font-semibold">Read Review</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">Why Actual Good Games?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Curated Selection</h4>
              <p className="text-gray-300">Every game is carefully selected and reviewed to ensure quality and entertainment value.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Honest Reviews</h4>
              <p className="text-gray-300">Detailed, unbiased reviews covering gameplay, graphics, story, and overall experience.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Community Ratings</h4>
              <p className="text-gray-300">Rate games yourself and see what the community thinks about each title.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Discover Your Next Favorite Game?</h3>
          <p className="text-xl text-gray-300 mb-8">
            Join our community of gamers who value quality over quantity.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 text-lg">
            Start Exploring
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">© 2025 Actual Good Games. Built for gamers, by gamers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

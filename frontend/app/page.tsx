import Navbar from '@/components/navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main 
        className="min-h-screen flex items-center justify-center relative"
        style={{ 
          background: 'url("/landing-bg.png") center/cover no-repeat, #000000'
        }}
      >        
        {/* Content overlay */}
        <div className="max-w-4xl mx-auto text-center px-6 relative z-20">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            Scale, Simplify, Secure
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              Your API with AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Transform your ideas into scalable realities faster than ever
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <button className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 text-lg">
              Get Started
            </button>
            <button className="px-8 py-4 border border-border text-foreground rounded-lg font-semibold hover:bg-secondary transition-all duration-200 text-lg">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

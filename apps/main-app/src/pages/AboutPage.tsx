import { Link } from 'react-router-dom';
import { Users, ShoppingBag, Shield, Globe } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">About The Bazaar</h1>
            <p className="text-xl text-gray-400">
              Connecting buyers with verified vendors across Kenya and beyond
            </p>
          </div>

          {/* Mission */}
          <section className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              The Bazaar is dedicated to creating a thriving marketplace ecosystem that empowers
              local businesses and provides consumers with access to quality products and services.
              We're building a platform that combines the best of e-commerce with the personalized
              touch of local shopping.
            </p>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <Shield className="h-8 w-8 text-netflix-red mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Trust & Safety</h3>
                <p className="text-gray-400">
                  We verify all vendors and ensure secure transactions to protect both buyers and
                  sellers.
                </p>
              </div>

              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <Users className="h-8 w-8 text-netflix-red mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Community First</h3>
                <p className="text-gray-400">
                  We believe in supporting local businesses and building a strong community of
                  buyers and sellers.
                </p>
              </div>

              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <ShoppingBag className="h-8 w-8 text-netflix-red mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Quality Products</h3>
                <p className="text-gray-400">
                  Every product on our platform is vetted to ensure quality and authenticity.
                </p>
              </div>

              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <Globe className="h-8 w-8 text-netflix-red mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Innovation</h3>
                <p className="text-gray-400">
                  We continuously improve our platform to provide the best shopping experience
                  possible.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-netflix-red to-orange-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Join The Bazaar</h2>
            <p className="text-white/90 mb-6">
              Whether you're a buyer looking for great deals or a vendor ready to grow your
              business, we're here to help.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-netflix-red hover:bg-gray-100"
              >
                <Link to="/register">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link to="/vendors/register">Become a Vendor</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


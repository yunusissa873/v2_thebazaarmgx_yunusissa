import { Truck, Clock, Shield, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Shipping Information</h1>
            <p className="text-xl text-gray-400">
              Everything you need to know about shipping and delivery
            </p>
          </div>

          {/* Shipping Options */}
          <section className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Truck className="h-6 w-6 text-netflix-red" />
              Shipping Options
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-netflix-red pl-4">
                <h3 className="text-lg font-semibold text-white mb-2">Standard Shipping</h3>
                <p className="text-gray-400 mb-2">
                  <strong className="text-white">KES 500</strong> - Delivery within 3-5 business
                  days
                </p>
                <p className="text-gray-500 text-sm">
                  Available for orders under KES 5,000. Delivery to Nairobi and major cities.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-white mb-2">Free Shipping</h3>
                <p className="text-gray-400 mb-2">
                  <strong className="text-green-500">FREE</strong> - Orders over KES 5,000
                </p>
                <p className="text-gray-500 text-sm">
                  Enjoy free standard shipping on all orders above KES 5,000.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-white mb-2">Express Shipping</h3>
                <p className="text-gray-400 mb-2">
                  <strong className="text-white">KES 1,500</strong> - Next day delivery
                </p>
                <p className="text-gray-500 text-sm">
                  Available for Nairobi and select areas. Order before 2 PM for next-day delivery.
                </p>
              </div>
            </div>
          </section>

          {/* Delivery Areas */}
          <section className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-netflix-red" />
              Delivery Areas
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Nairobi</h3>
                <p className="text-gray-400 text-sm">
                  All areas within Nairobi are covered. Standard delivery: 2-3 business days.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Other Cities</h3>
                <p className="text-gray-400 text-sm">
                  Major cities including Mombasa, Kisumu, Nakuru. Delivery: 5-7 business days.
                </p>
              </div>
            </div>
          </section>

          {/* Tracking */}
          <section className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-netflix-red" />
              Order Tracking
            </h2>
            <p className="text-gray-400 mb-4">
              Once your order is shipped, you'll receive a tracking number via email and SMS. You
              can track your order status in real-time from your Orders page.
            </p>
            <div className="space-y-2 text-gray-400 text-sm">
              <p>• You'll receive a confirmation email once your order is placed</p>
              <p>• A shipping notification will be sent when your order is dispatched</p>
              <p>• Track your package using the tracking number provided</p>
              <p>• Receive SMS updates on delivery day</p>
            </div>
          </section>

          {/* Returns */}
          <section className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-netflix-red" />
              Returns & Refunds
            </h2>
            <div className="space-y-4 text-gray-400">
              <p>
                <strong className="text-white">Return Window:</strong> You have 7 days from
                delivery to return items in original, unopened condition.
              </p>
              <p>
                <strong className="text-white">Return Process:</strong> Contact our support team
                to initiate a return. We'll provide a return shipping label and instructions.
              </p>
              <p>
                <strong className="text-white">Refunds:</strong> Refunds are processed within 5-7
                business days after we receive and inspect the returned items.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


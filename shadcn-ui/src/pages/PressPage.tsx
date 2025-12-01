import { Newspaper, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PressPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Newspaper className="h-12 w-12 text-netflix-red mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Press & Media</h1>
            <p className="text-xl text-gray-400">
              Resources for journalists and media professionals
            </p>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Press Kit</h2>
            <p className="text-gray-400 mb-6">
              Download our press kit for logos, brand guidelines, and company information.
            </p>
            <Button
              variant="outline"
              className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Press Kit
            </Button>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Media Inquiries</h2>
            <p className="text-gray-400 mb-4">
              For media inquiries, interview requests, or press releases, please contact our press
              team:
            </p>
            <div className="flex items-center gap-2 text-netflix-red">
              <Mail className="h-5 w-5" />
              <a
                href="mailto:press@thebazaar.com"
                className="hover:underline"
              >
                press@thebazaar.com
              </a>
            </div>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Latest News</h2>
            <div className="space-y-6">
              <div className="border-b border-netflix-medium-gray pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold text-white mb-2">
                  The Bazaar Launches in Kenya
                </h3>
                <p className="text-gray-400 text-sm mb-2">November 2024</p>
                <p className="text-gray-300">
                  The Bazaar officially launches its marketplace platform, connecting buyers and
                  vendors across Kenya with a focus on local businesses and quality products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


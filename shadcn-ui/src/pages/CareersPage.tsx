import { Briefcase, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const jobOpenings = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    description:
      'We\'re looking for an experienced React developer to join our growing team and help build the future of e-commerce in Africa.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Nairobi, Kenya / Remote',
    type: 'Full-time',
    description:
      'Join our design team to create beautiful, user-friendly experiences that delight our customers and vendors.',
  },
  {
    title: 'Customer Success Manager',
    department: 'Support',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    description:
      'Help vendors succeed on our platform by providing excellent support and guidance.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-400">
              Build the future of e-commerce in Africa with us
            </p>
          </div>

          {jobOpenings.length > 0 ? (
            <div className="space-y-6">
              {jobOpenings.map((job, index) => (
                <div
                  key={index}
                  className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6"
                >
                  <h2 className="text-2xl font-semibold text-white mb-2">{job.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {job.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{job.description}</p>
                  <Button
                    variant="outline"
                    className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                  >
                    Apply Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No Open Positions</h2>
              <p className="text-gray-400 mb-6">
                We're not currently hiring, but we're always interested in connecting with talented
                individuals.
              </p>
              <a href="/contact">
                <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
                  Get in Touch
                </Button>
              </a>
            </div>
          )}

          <div className="mt-12 bg-gradient-to-r from-netflix-red to-orange-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Don't See a Role That Fits?</h2>
            <p className="text-white/90 mb-6">
              We're always looking for exceptional talent. Send us your resume and we'll keep you in
              mind for future opportunities.
            </p>
            <a href="/contact">
              <Button className="bg-white text-netflix-red hover:bg-gray-100">
                Send Resume
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


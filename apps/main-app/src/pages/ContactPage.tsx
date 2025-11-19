import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Textarea } from '@thebazaar/ui/textarea';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@thebazaar/ui/form';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Send contact form to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Thank you! We\'ll get back to you soon.');
      form.reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-gray-400">
              Have a question? We're here to help. Get in touch with our team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-netflix-red mt-1" />
                    <div>
                      <h3 className="text-white font-medium mb-1">Email</h3>
                      <a
                        href="mailto:support@thebazaar.com"
                        className="text-gray-400 hover:text-netflix-red transition-colors"
                      >
                        support@thebazaar.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-netflix-red mt-1" />
                    <div>
                      <h3 className="text-white font-medium mb-1">Phone</h3>
                      <a
                        href="tel:+254712345678"
                        className="text-gray-400 hover:text-netflix-red transition-colors"
                      >
                        +254 712 345 678
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-netflix-red mt-1" />
                    <div>
                      <h3 className="text-white font-medium mb-1">Address</h3>
                      <p className="text-gray-400">
                        Nairobi, Kenya
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Business Hours</h3>
                <div className="text-gray-400 space-y-1">
                  <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Name</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    rules={{ required: 'Subject is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Subject</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    rules={{ required: 'Message is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Contact Us</h1>
          <p className="text-base sm:text-xl text-primary-100 max-w-2xl mx-auto">
            Have a question or need help? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600">
                Our support team is available Monday to Friday, 8am - 6pm GMT.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: EnvelopeIcon, label: 'Email', value: 'support@intemso.com' },
                { icon: PhoneIcon, label: 'Phone', value: '+233 30 123 4567' },
                { icon: MapPinIcon, label: 'Address', value: 'Accra, Ghana' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" required className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select className="input-field">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Payment Issue</option>
                    <option>Enterprise Sales</option>
                    <option>Press / Media</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={5} required className="input-field" placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" className="btn-primary w-full sm:w-auto">Send Message</button>
              </form>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';

const STORIES = [
  {
    name: 'Kwame Asante',
    university: 'University of Ghana',
    title: 'Event Usher & Campus Helper',
    gigs_label: '18 gigs',
    story: 'I started on Intemso during my 200 level with zero skills. My first gig was ushering at a product launch — I just had to show up and be friendly. Now I do ushering, flyer distribution, and campus errands regularly. It covers my food and transport every month.',
    rating: 4.9,
    gigs: 18,
  },
  {
    name: 'Ama Mensah',
    university: 'KNUST',
    title: 'Typist & Data Entry',
    gigs_label: '25 gigs',
    story: 'I can type fast and use Word — that\'s literally all I needed to start earning on Intemso. I type up lecture notes, fill in spreadsheets, and do data entry for small businesses. The escrow system means I always get paid on time.',
    rating: 5.0,
    gigs: 25,
  },
  {
    name: 'Akosua Darko',
    university: 'University of Ghana',
    title: 'Tutor & Note Typist',
    gigs_label: '35 gigs',
    story: 'I tutor junior students in maths and science, and I also type notes for people. Between the two, I\'m making enough to pay for textbooks and save a little. Intemso made it easy to find students and businesses who need help.',
    rating: 4.9,
    gigs: 35,
  },
  {
    name: 'Yaw Boateng',
    university: 'University of Cape Coast',
    title: 'App Tester & Surveyor',
    gigs_label: '12 gigs',
    story: 'I test apps and websites for companies — they send me the app, I use it, and I report bugs. I also do campus surveys. You don\'t need any technical knowledge, just a phone and attention to detail. Great pocket money for a Level 100 student.',
    rating: 4.7,
    gigs: 12,
  },
];

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Real students, real results. See how Intemso is changing lives across Ghanaian universities.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {STORIES.map((story) => (
            <div key={story.name} className="bg-white border border-gray-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600">
                    {story.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{story.name}</h3>
                  <p className="text-sm text-gray-500">{story.title} · {story.university}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{story.story}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-4">
                <span className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  {story.rating}
                </span>
                <span>{story.gigs} gigs completed</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/auth/register" className="btn-primary">
            Start Your Story
          </Link>
        </div>
      </section>
    </div>
  );
}

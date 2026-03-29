export default function BlogPage() {
  const posts = [
    { title: 'Top 10 Skills Employers Look for in Student Freelancers', category: 'Career Tips', date: 'Mar 20, 2026', readTime: '5 min', excerpt: 'Discover the most in-demand skills on Intemso and how to develop them while still in university.' },
    { title: 'How to Build a Portfolio That Gets You Hired', category: 'Student Guide', date: 'Mar 15, 2026', readTime: '7 min', excerpt: 'A step-by-step guide to showcasing your work and attracting high-quality clients on Intemso.' },
    { title: 'The Rise of Student Freelancing in Ghana', category: 'Industry Trends', date: 'Mar 10, 2026', readTime: '6 min', excerpt: 'How Ghanaian university students are leveraging digital platforms to earn while they learn.' },
    { title: '5 Mistakes to Avoid When Writing Proposals', category: 'Career Tips', date: 'Mar 5, 2026', readTime: '4 min', excerpt: 'Common pitfalls that cost students gigs — and how to write proposals that win.' },
    { title: 'Balancing Freelancing and Studies: A Student Guide', category: 'Student Guide', date: 'Feb 28, 2026', readTime: '8 min', excerpt: 'Practical time management tips for students juggling academic work and freelance gigs.' },
    { title: 'Why Businesses Are Hiring University Students', category: 'Employer Insights', date: 'Feb 20, 2026', readTime: '5 min', excerpt: 'The business case for tapping into the university talent pool for your next project.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Insights, tips, and stories from the Intemso community.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.title} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer">
              <div className="h-40 bg-linear-to-br from-primary-100 to-primary-50" />
              <div className="p-6">
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{post.category}</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime} read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

import { Github, Twitter, Mail, ExternalLink } from 'lucide-react'

export default function About() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data Centers Are Eating The World 🌍
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            An open-source, automated mapping project that makes the invisible infrastructure
            powering our digital lives visible.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h2>
          <p className="text-gray-700 mb-4">
            We live in a world increasingly dependent on cloud computing, AI, and digital services.
            Yet the physical infrastructure behind this digital revolution—massive data centers
            consuming gigawatts of power—remains largely invisible to the public.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Key Questions We're Answering:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Where exactly are data centers located?</li>
              <li>Who owns them? (Local vs. foreign operators)</li>
              <li>How much power do they consume?</li>
              <li>How fast is this infrastructure growing?</li>
              <li>What's the environmental and economic impact?</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Approach</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Automated Data Collection</h3>
              <p className="text-gray-700">
                We scrape and aggregate data from multiple public sources including DataCenterMap,
                Datacenters.com, company announcements, and news APIs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Data Processing Pipeline</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Deduplication using fuzzy matching</li>
                <li>Geocoding for precise coordinates</li>
                <li>Validation and quality checks</li>
                <li>Enrichment with contextual data</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Human Verification</h3>
              <p className="text-gray-700">
                Every data point is cited with sources, and new entries are flagged for manual
                review to ensure accuracy.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Frontend</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>React + TypeScript</li>
                <li>Mapbox GL JS</li>
                <li>D3.js</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Backend</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Node.js + Express</li>
                <li>PostgreSQL + PostGIS</li>
                <li>RESTful API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Data Pipeline</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Python scrapers</li>
                <li>BeautifulSoup</li>
                <li>Selenium</li>
                <li>FuzzyWuzzy</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">License & Philosophy</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 mb-2">
                <span className="font-bold">Code:</span> MIT License
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-bold">Data:</span> CC BY 4.0 (attribution required)
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h3 className="font-bold text-gray-900 mb-2">We believe:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Digital infrastructure is too important to remain invisible</li>
                <li>Data about data centers should be openly accessible</li>
                <li>Emerging markets deserve the same transparency as developed ones</li>
                <li>Community-driven projects can compete with commercial offerings</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Involved</h2>
          <p className="text-gray-700 mb-6">
            This is an open-source project and we welcome contributions from everyone!
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Github size={20} />
              <span>View on GitHub</span>
              <ExternalLink size={16} />
            </a>
            <a
              href="https://twitter.com/your-handle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Twitter size={20} />
              <span>Follow Updates</span>
              <ExternalLink size={16} />
            </a>
            <a
              href="mailto:your-email@example.com"
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Mail size={20} />
              <span>Contact Us</span>
            </a>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>Built with ❤️ to make digital infrastructure visible</p>
          <p className="mt-2">Version 0.1 - Alpha | Last updated: October 2025</p>
        </div>
      </div>
    </div>
  )
}


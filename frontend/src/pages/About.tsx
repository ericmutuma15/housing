export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white py-16 px-4">
        <div className="app-container max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Housing Dashboards</h1>
          <p className="text-xl opacity-90">Data Analysis • GIS • Inventory Management</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-container max-w-4xl mx-auto py-12">
        {/* About Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">About This Project</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Housing Dashboards is a comprehensive web application designed to facilitate data-driven decision-making
              in the housing sector. The platform integrates three powerful modules: interactive data analysis with
              real-time KPIs, geographic information system (GIS) mapping for spatial analysis, and a robust inventory
              management system for tracking housing assets and utilization.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Built with modern web technologies, this application provides an intuitive interface for stakeholders to
              visualize, analyze, and manage housing-related data efficiently. The platform supports both light and dark
              themes for optimal user experience across different environments.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Data Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interactive dashboards with comprehensive KPIs and real-time visualizations powered by Plotly.js
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">GIS Mapping</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Geographic visualization and spatial analysis using Leaflet with interactive map controls
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Inventory Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive inventory tracking and management system for housing assets
              </p>
            </div>
          </div>
        </section>

        {/* Development Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">About the Development Team</h2>

          {/* Organization Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              ICT Department - Machakos Affordable Housing Programme
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This project was developed by the ICT Department of the Machakos Affordable Housing Programme. The team
              is dedicated to leveraging technology to improve housing management and decision-making in the Machakos County.
            </p>
            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-4 rounded">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Mission:</strong> To deliver innovative IT solutions that enhance the efficiency, transparency,
                and effectiveness of affordable housing initiatives in Machakos County.
              </p>
            </div>
          </div>

          {/* Team Member Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 text-white text-2xl font-bold">
                  EM
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Eric Mutuma</h4>
                <p className="text-lg font-medium text-sky-600 dark:text-sky-400 mb-2">Lead - IT Operations</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Oversees the development, deployment, and maintenance of the Housing Dashboards application.
                  Responsible for ensuring system reliability, security, and optimal performance across all modules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Frontend</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• React 18.2.0</li>
                <li>• TypeScript 5.2.2</li>
                <li>• Vite 4.3.9</li>
                <li>• Tailwind CSS 3.4.7</li>
                <li>• Plotly.js 2.24.0</li>
                <li>• Leaflet 1.9.4</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Backend</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• FastAPI 0.95.2</li>
                <li>• SQLAlchemy 2.0.20</li>
                <li>• Pydantic 1.10.12</li>
                <li>• Python-Jose 3.3.0</li>
                <li>• Uvicorn 0.22.0</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg opacity-90 mb-6">
              For inquiries or support, please contact the ICT Department
            </p>
            <p className="text-sm opacity-75">
              Machakos Affordable Housing Programme
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

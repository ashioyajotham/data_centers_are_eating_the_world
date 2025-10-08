import { Server, Building2, Zap, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import StatCard from '@/components/StatCard'
import { useStatistics, useDataCenters } from '@/hooks/useDataCenters'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const { data: statistics, isLoading: statsLoading } = useStatistics()
  const { data: dataCenters, isLoading: dataLoading } = useDataCenters()

  if (statsLoading || dataLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statusData = statistics?.byStatus
    ? Object.entries(statistics.byStatus).map(([name, value]) => ({
        name: name.replace('-', ' '),
        value,
      }))
    : []

  const ownershipData = statistics?.byOwnership
    ? Object.entries(statistics.byOwnership).map(([name, value]) => ({
        name: name.replace('-', ' '),
        value,
      }))
    : []

  const growthData = statistics?.growthByYear || []

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of data center infrastructure</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Data Centers"
            value={statistics?.totalDataCenters || 0}
            icon={Server}
            color="blue"
          />
          <StatCard
            title="Operational"
            value={statistics?.byStatus?.operational || 0}
            icon={Building2}
            color="green"
          />
          <StatCard
            title="Total Capacity"
            value={`${statistics?.totalCapacityMW || 0} MW`}
            icon={Zap}
            color="orange"
          />
          <StatCard
            title="Average Capacity"
            value={`${statistics?.averageCapacity?.toFixed(1) || 0} MW`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Growth Over Time */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Ownership Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ownership Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ownershipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ownershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Country Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Countries</h3>
            <div className="space-y-3">
              {statistics?.byCountry &&
                Object.entries(statistics.byCountry)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-gray-700">{country}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{
                              width: `${(count / statistics.totalDataCenters) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.byCountry ? Object.keys(statistics.byCountry).length : 0}
              </p>
              <p className="text-sm text-gray-600">Countries Covered</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-2xl font-bold text-gray-900">
                {((statistics?.byOwnership?.foreign || 0) / (statistics?.totalDataCenters || 1) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600">Foreign Owned</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-2xl font-bold text-gray-900">
                {((statistics?.byStatus?.['under-construction'] || 0) / (statistics?.totalDataCenters || 1) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600">Under Construction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


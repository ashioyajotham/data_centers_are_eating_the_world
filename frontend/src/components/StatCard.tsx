import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <span className={`text-sm font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}


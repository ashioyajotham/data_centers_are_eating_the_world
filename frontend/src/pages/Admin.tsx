import { useState } from 'react'
import { CheckCircle, XCircle, Edit, Trash2, Eye } from 'lucide-react'
import { useDataCenters } from '@/hooks/useDataCenters'
import type { DataCenter } from '@/types'
import toast from 'react-hot-toast'

export default function Admin() {
  const { data: dataCenters, isLoading } = useDataCenters()
  const [selectedDC, setSelectedDC] = useState<DataCenter | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleVerify = (dc: DataCenter) => {
    // TODO: Implement API call to verify
    toast.success(`Verified: ${dc.name}`)
  }

  const handleReject = (dc: DataCenter) => {
    // TODO: Implement API call to reject
    toast.error(`Rejected: ${dc.name}`)
  }

  const handleEdit = (dc: DataCenter) => {
    setSelectedDC(dc)
    setShowModal(true)
  }

  const handleDelete = (dc: DataCenter) => {
    if (confirm(`Are you sure you want to delete ${dc.name}?`)) {
      // TODO: Implement API call to delete
      toast.success(`Deleted: ${dc.name}`)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const unverifiedDataCenters = dataCenters?.filter(
    dc => !dc.sources.every(s => s.verified)
  ) || []

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Review and verify data center submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Data Centers</p>
            <p className="text-3xl font-bold text-gray-900">{dataCenters?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">{unverifiedDataCenters.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Verified</p>
            <p className="text-3xl font-bold text-green-600">
              {(dataCenters?.length || 0) - unverifiedDataCenters.length}
            </p>
          </div>
        </div>

        {/* Pending Review List */}
        {unverifiedDataCenters.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Review</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{width: '30%'}}>
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{width: '20%'}}>
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{width: '20%'}}>
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{minWidth: '180px'}}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase" style={{width: '120px'}}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unverifiedDataCenters.map(dc => (
                    <tr key={dc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 truncate" title={dc.name}>{dc.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="truncate" title={dc.operator}>{dc.operator}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="truncate">{dc.city}, {dc.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 capitalize whitespace-nowrap">
                          {dc.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(dc)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View/Edit"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleVerify(dc)}
                            className="text-green-600 hover:text-green-900"
                            title="Verify"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(dc)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Data Centers */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Data Centers</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{width: '28%'}}>
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{width: '18%'}}>
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{width: '18%'}}>
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{minWidth: '180px'}}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase" style={{width: '100px'}}>
                    Verified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase" style={{width: '120px'}}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataCenters?.map(dc => (
                  <tr key={dc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 truncate" title={dc.name}>{dc.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="truncate" title={dc.operator}>{dc.operator}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="truncate">{dc.city}, {dc.country}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize whitespace-nowrap">
                        {dc.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {dc.sources.every(s => s.verified) ? (
                        <CheckCircle size={18} className="text-green-500 inline-block" />
                      ) : (
                        <XCircle size={18} className="text-gray-300 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(dc)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dc)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal (simplified - would be a full form in production) */}
      {showModal && selectedDC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedDC.name}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Basic Information</h3>
                <p className="text-sm text-gray-600">Operator: {selectedDC.operator}</p>
                <p className="text-sm text-gray-600">Location: {selectedDC.city}, {selectedDC.country}</p>
                <p className="text-sm text-gray-600">Status: {selectedDC.status}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Sources</h3>
                {selectedDC.sources.map((source, idx) => (
                  <div key={idx} className="text-sm text-gray-600 mb-2">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {source.name}
                    </a>
                    {source.verified && <span className="ml-2 text-green-600">✓ Verified</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleVerify(selectedDC)
                  setShowModal(false)
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


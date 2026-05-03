import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  LogOut,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDataCenters } from '@/hooks/useDataCenters'
import { dataCenterApi } from '@/services/api'
import type { DataCenter } from '@/types'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAdminSession } from '@/contexts/AdminSessionContext'

function toastApiError(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data as { error?: string } | undefined
    toast.error(msg?.error || fallback)
    return
  }
  toast.error(fallback)
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/5">
      <div className="max-h-[min(70vh,560px)] overflow-auto">
        <table className="min-w-[720px] w-full divide-y divide-slate-200">{children}</table>
      </div>
    </div>
  )
}

export default function Admin() {
  const session = useAdminSession()
  const queryClient = useQueryClient()
  const { data: dataCenters, isLoading } = useDataCenters()
  const [selectedDC, setSelectedDC] = useState<DataCenter | null>(null)
  const [showModal, setShowModal] = useState(false)

  const verifyMutation = useMutation({
    mutationFn: (id: string) => dataCenterApi.verifySources(id),
    onSuccess: (dc) => {
      queryClient.invalidateQueries({ queryKey: ['datacenters'] })
      toast.success(`Sources verified: ${dc.name}`)
    },
    onError: (err) => toastApiError(err, 'Verification failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataCenterApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['datacenters'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      const name = dataCenters?.find((d) => d.id === id)?.name ?? 'Record'
      toast.success(`Removed: ${name}`)
    },
    onError: (err) => toastApiError(err, 'Delete failed'),
  })

  const handleVerify = (dc: DataCenter) => verifyMutation.mutate(dc.id)
  const handleReject = (dc: DataCenter) => {
    if (!confirm(`Reject and permanently delete "${dc.name}"? This cannot be undone.`)) return
    deleteMutation.mutate(dc.id)
  }
  const handleEdit = (dc: DataCenter) => {
    setSelectedDC(dc)
    setShowModal(true)
  }
  const handleDelete = (dc: DataCenter) => {
    if (!confirm(`Permanently delete "${dc.name}"? This cannot be undone.`)) return
    deleteMutation.mutate(dc.id)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100/80">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  const unverifiedDataCenters =
    dataCenters?.filter((dc) => !dc.sources.every((s) => s.verified)) || []
  const busy = verifyMutation.isPending || deleteMutation.isPending

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50">
      <header className="shrink-0 border-b border-slate-200/90 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 ring-1 ring-primary-500/20">
              <ShieldCheck className="h-5 w-5 text-primary-600" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                Admin dashboard
              </h1>
              <p className="truncate text-sm text-slate-600">Verify sources and manage records</p>
            </div>
          </div>
          {session && (
            <button
              type="button"
              onClick={session.logout}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4 opacity-70" />
              Log out
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-950/5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
                {dataCenters?.length || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm ring-1 ring-amber-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800/80">Pending review</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-amber-700">
                {unverifiedDataCenters.length}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm ring-1 ring-emerald-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">Verified</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-emerald-700">
                {(dataCenters?.length || 0) - unverifiedDataCenters.length}
              </p>
            </div>
          </div>

          {unverifiedDataCenters.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Pending review</h2>
              <TableShell>
                <thead className="sticky top-0 z-[1] bg-slate-50/95 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Operator
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {unverifiedDataCenters.map((dc) => (
                    <tr key={dc.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="max-w-[200px] px-4 py-3">
                        <div className="truncate font-medium text-slate-900" title={dc.name}>
                          {dc.name}
                        </div>
                      </td>
                      <td className="max-w-[160px] px-4 py-3">
                        <div className="truncate text-sm text-slate-600" title={dc.operator}>
                          {dc.operator}
                        </div>
                      </td>
                      <td className="max-w-[140px] px-4 py-3">
                        <div className="truncate text-sm text-slate-600" title={`${dc.city}, ${dc.country}`}>
                          {dc.city}, {dc.country}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 capitalize">
                          {dc.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(dc)}
                            disabled={busy}
                            className="rounded-lg p-2 text-primary-600 transition hover:bg-primary-50 disabled:opacity-50"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerify(dc)}
                            disabled={busy}
                            className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                            title="Verify sources"
                          >
                            {verifyMutation.isPending && verifyMutation.variables === dc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(dc)}
                            disabled={busy}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            title="Reject and delete"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">All data centers</h2>
            <TableShell>
              <thead className="sticky top-0 z-[1] bg-slate-50/95 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Operator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Verified
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dataCenters?.map((dc) => (
                  <tr key={dc.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="max-w-[200px] px-4 py-3">
                      <div className="truncate font-medium text-slate-900" title={dc.name}>
                        {dc.name}
                      </div>
                    </td>
                    <td className="max-w-[160px] px-4 py-3">
                      <div className="truncate text-sm text-slate-600" title={dc.operator}>
                        {dc.operator}
                      </div>
                    </td>
                    <td className="max-w-[140px] px-4 py-3">
                      <div className="truncate text-sm text-slate-600">
                        {dc.city}, {dc.country}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 capitalize">
                        {dc.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dc.sources.every((s) => s.verified) ? (
                        <CheckCircle className="inline-block h-5 w-5 text-emerald-500" aria-label="Verified" />
                      ) : (
                        <XCircle className="inline-block h-5 w-5 text-slate-300" aria-label="Not verified" />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(dc)}
                          disabled={busy}
                          className="rounded-lg p-2 text-primary-600 transition hover:bg-primary-50 disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(dc)}
                          disabled={busy}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </section>
        </div>
      </div>

      {showModal && selectedDC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setShowModal(false)}
          />
          <div className="relative max-h-[min(90vh,640px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl ring-1 ring-slate-950/10 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">{selectedDC.name}</h2>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <h3 className="mb-1 font-medium text-slate-800">Basics</h3>
                <p className="text-slate-600">Operator: {selectedDC.operator}</p>
                <p className="text-slate-600">
                  Location: {selectedDC.city}, {selectedDC.country}
                </p>
                <p className="text-slate-600">Status: {selectedDC.status}</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-slate-800">Sources</h3>
                {selectedDC.sources.map((source, idx) => (
                  <div key={idx} className="mb-2 text-slate-600">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {source.name}
                    </a>
                    {source.verified && <span className="ml-2 text-emerald-600">Verified</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  handleVerify(selectedDC)
                  setShowModal(false)
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
              >
                Verify sources
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

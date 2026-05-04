import { useState } from 'react'
import { Send } from 'lucide-react'
import { ingestionApi } from '@/services/api'
import toast from 'react-hot-toast'
import axios from 'axios'
import type { PublicSuggestionPayload } from '@/types'

interface SuggestFormState {
  name: string
  operator: string
  address: string
  city: string
  country: string
  latitude: string
  longitude: string
  status: PublicSuggestionPayload['status']
  ownershipType: PublicSuggestionPayload['ownershipType']
  sourceUrl: string
  sourceName: string
  yearEstablished: string
  powerMw: string
  submitterEmail: string
  submitterName: string
  notes: string
  website: string
}

const emptyForm: SuggestFormState = {
  name: '',
  operator: '',
  address: '',
  city: '',
  country: 'Kenya',
  latitude: '',
  longitude: '',
  status: 'operational',
  ownershipType: 'local',
  sourceUrl: '',
  sourceName: '',
  yearEstablished: '',
  powerMw: '',
  submitterEmail: '',
  submitterName: '',
  notes: '',
  website: '',
}

export default function SuggestFacility() {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const lat = Number(form.latitude)
      const lon = Number(form.longitude)
      const yearEstablished =
        form.yearEstablished.trim() === '' ? undefined : Number(form.yearEstablished)
      const powerMw = form.powerMw.trim() === '' ? undefined : Number(form.powerMw)

      const payload: PublicSuggestionPayload = {
        name: form.name.trim(),
        operator: form.operator.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim() || 'Kenya',
        latitude: lat,
        longitude: lon,
        status: form.status,
        ownershipType: form.ownershipType,
        sourceUrl: form.sourceUrl.trim(),
        sourceName: form.sourceName.trim() || undefined,
        yearEstablished:
          yearEstablished !== undefined && Number.isFinite(yearEstablished)
            ? yearEstablished
            : undefined,
        powerMw:
          powerMw !== undefined && Number.isFinite(powerMw) ? powerMw : undefined,
        submitterEmail: form.submitterEmail.trim() || undefined,
        submitterName: form.submitterName.trim() || undefined,
        notes: form.notes.trim() || undefined,
        website: form.website,
      }

      const res = await ingestionApi.suggestPublic(payload)
      toast.success(res.message)
      setForm(emptyForm)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data as { error?: string } | undefined
        toast.error(msg?.error || 'Could not submit. Check the form and try again.')
      } else {
        toast.error('Could not submit.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-100 to-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-950/5 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 text-primary-700 ring-1 ring-primary-500/20">
              <Send className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Suggest a data center
              </h1>
              <p className="text-sm text-slate-600">
                Kenya-focused catalogue. Submissions are reviewed before appearing on the map.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={update('website')}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Facility name *</label>
                <input required className={inputCls} value={form.name} onChange={update('name')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Operator *</label>
                <input
                  required
                  className={inputCls}
                  value={form.operator}
                  onChange={update('operator')}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Address *</label>
                <input
                  required
                  className={inputCls}
                  value={form.address}
                  onChange={update('address')}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">City *</label>
                <input required className={inputCls} value={form.city} onChange={update('city')} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Country *</label>
                <input
                  required
                  className={inputCls}
                  value={form.country}
                  onChange={update('country')}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Latitude *</label>
                <input
                  required
                  inputMode="decimal"
                  className={inputCls}
                  value={form.latitude}
                  onChange={update('latitude')}
                  placeholder="-1.29"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Longitude *</label>
                <input
                  required
                  inputMode="decimal"
                  className={inputCls}
                  value={form.longitude}
                  onChange={update('longitude')}
                  placeholder="36.82"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Status *</label>
                <select className={inputCls} value={form.status} onChange={update('status')}>
                  <option value="operational">Operational</option>
                  <option value="planned">Planned</option>
                  <option value="under-construction">Under construction</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Ownership *</label>
                <select
                  className={inputCls}
                  value={form.ownershipType}
                  onChange={update('ownershipType')}
                >
                  <option value="local">Local</option>
                  <option value="foreign">Foreign</option>
                  <option value="joint-venture">Joint venture</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Reference URL * (news, operator, regulator, etc.)
                </label>
                <input
                  required
                  type="url"
                  className={inputCls}
                  value={form.sourceUrl}
                  onChange={update('sourceUrl')}
                  placeholder="https://…"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Reference title (optional)</label>
                <input className={inputCls} value={form.sourceName} onChange={update('sourceName')} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Year established (optional)</label>
                <input className={inputCls} value={form.yearEstablished} onChange={update('yearEstablished')} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Power (MW, optional)</label>
                <input className={inputCls} value={form.powerMw} onChange={update('powerMw')} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Your email (optional)</label>
                <input
                  type="email"
                  className={inputCls}
                  value={form.submitterEmail}
                  onChange={update('submitterEmail')}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Your name (optional)</label>
                <input className={inputCls} value={form.submitterName} onChange={update('submitterName')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Notes (optional)</label>
                <textarea
                  className={`${inputCls} min-h-[88px] resize-y`}
                  value={form.notes}
                  onChange={update('notes')}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Admin is notified by email when{' '}
              <code className="rounded bg-slate-100 px-1">RESEND_API_KEY</code>,{' '}
              <code className="rounded bg-slate-100 px-1">RESEND_FROM_EMAIL</code>, and{' '}
              <code className="rounded bg-slate-100 px-1">ADMIN_NOTIFY_EMAIL</code> are set on the API.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

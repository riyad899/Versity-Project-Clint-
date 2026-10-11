import { useEffect } from 'react'
import { X, Ban, CheckCircle2, AlertTriangle, User } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Input } from '@/Components/ui/input'

/**
 * MsgModal - A sleek, modern custom message and confirmation modal
 * for user status updates (Ban / Activate) in the Admin portal.
 */
export default function MsgModal({
  isOpen,
  onClose,
  title,
  description,
  user,
  actionType = 'ban', // 'ban' | 'active'
  reason = '',
  onReasonChange,
  onConfirm,
  isLoading = false,
  confirmText,
  cancelText = 'Cancel',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isBanning = actionType === 'ban'

  const defaultTitle = isBanning
    ? 'Ban User Account'
    : 'Activate User Account'

  const defaultDescription = isBanning
    ? 'Are you sure you want to suspend this user? They will be immediately blocked from logging in or using campus transit services.'
    : 'Are you sure you want to reactivate this user? Full access to their account and campus transit services will be restored.'

  const resolvedTitle = title || defaultTitle
  const resolvedDescription = description || defaultDescription
  const resolvedConfirmText = confirmText || (isBanning ? 'Confirm & Ban User' : 'Confirm & Activate User')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-2xs ${
                isBanning
                  ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/60'
                  : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60'
              }`}
            >
              {isBanning ? (
                <Ban className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-950">
                {resolvedTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Status Update Action</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-700"
            title="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Card Pill */}
        {user && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-2xs">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <Badge
              variant={user.banned ? 'softRed' : 'softGreen'}
              className="text-[10px] capitalize shrink-0 ml-2"
            >
              {user.banned ? 'Currently Banned' : 'Currently Active'}
            </Badge>
          </div>
        )}

        {/* Description / Message */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {resolvedDescription}
        </p>

        {/* Ban Reason Input (only shown when banning) */}
        {isBanning && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-700 block">
              Reason for Ban <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Violation of code of conduct, terms infringement..."
              value={reason}
              onChange={(e) => onReasonChange && onReasonChange(e.target.value)}
              className="h-10 text-xs"
              autoFocus
            />
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`text-xs font-bold ${
              isBanning
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </span>
            ) : (
              resolvedConfirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

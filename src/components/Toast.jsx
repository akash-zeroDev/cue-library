import { useApp } from '../context/AppContext.jsx'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export default function Toast() {
  const { toast } = useApp()
  return (
    <div
      className={`toast${toast ? ' toast-show' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon"><CheckIcon /></span>
      <span className="toast-msg">{toast?.message ?? ''}</span>
    </div>
  )
}

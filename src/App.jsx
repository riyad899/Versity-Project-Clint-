import toast, { Toaster, ToastBar } from 'react-hot-toast'
import './App.css'

function App({ children }) {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          },
          success: {
            duration: 2500,
          },
          error: {
            duration: 4000,
          },
        }}
      >
        {(t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            title="Click to dismiss"
          >
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-sm font-semibold text-slate-800">{message}</span>
                  {t.type !== 'loading' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.dismiss(t.id)
                      }}
                      className="ml-2 -mr-1 p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors text-xs font-bold"
                      title="Close"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </ToastBar>
          </div>
        )}
      </Toaster>
      {children}
    </>
  )
}

export default App

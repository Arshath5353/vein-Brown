import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(
  ({ label, error, icon: Icon, type = 'text', className = '', ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const resolvedType = isPassword && showPassword ? 'text' : type

    return (
      <label className="block w-full">
        {label && <span className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</span>}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={`input-field ${Icon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''} ${
              error ? 'border-red-500' : ''
            } ${className}`}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
      </label>
    )
  }
)

Input.displayName = 'Input'

export default Input

import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

const Button = ({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  onClick,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={`${VARIANTS[variant]} w-full ${className}`}
    {...rest}
  >
    {loading ? (
      <Loader2 className="h-5 w-5 animate-spin" />
    ) : (
      <>
        {Icon && <Icon className="h-5 w-5" />}
        {children}
      </>
    )}
  </button>
)

export default Button

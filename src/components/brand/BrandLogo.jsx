const BrandLogo = ({ compact = false, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img src="/brand/vein-brown-icon.png" alt="Vein Brown" className="h-10 w-10 rounded-xl object-contain" />
    {!compact && <span className="font-display text-xl font-bold tracking-tight">Vein Brown</span>}
  </div>
)

export default BrandLogo

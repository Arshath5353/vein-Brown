const Card = ({ children, className = '', hover = false, as: Tag = 'div', ...rest }) => (
  <Tag
    className={`card-surface ${hover ? 'transition-colors hover:bg-card-hover' : ''} ${className}`}
    {...rest}
  >
    {children}
  </Tag>
)

export default Card

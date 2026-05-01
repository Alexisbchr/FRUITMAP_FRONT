interface BadgeProps {
  label: string
  colorClasses?: string
}

export function Badge({ label, colorClasses = 'bg-gray-100 text-gray-700' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      {label}
    </span>
  )
}

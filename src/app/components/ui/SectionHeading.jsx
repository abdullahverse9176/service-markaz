import React from 'react'

const SectionHeading = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
    </div>
  )
}

export default SectionHeading
import React from 'react'

const FormHeader = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800">{title}</h1>
      <p className="mt-4 text-gray-600">{subtitle}</p>
    </div>
  )
}

export default FormHeader
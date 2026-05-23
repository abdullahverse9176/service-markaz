import React from 'react'

const FormSubmitBtn = ({ title }) => {
  return (
    <>
        <button type="submit" className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer transition duration-200">
            {title}
        </button>
    </>
  )
}

export default FormSubmitBtn
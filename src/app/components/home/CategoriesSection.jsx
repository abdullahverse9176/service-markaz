import { categories } from '@/data/categories'
import React from 'react'
import SectionHeading from '../ui/SectionHeading'
import CategoriesGrid from '../CategoriesGrid'

const CategoriesSection = () => {
  return (
    <>
      <section className="max-w-6xl w-full mx-auto px-6">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Popular Services</h2>
          <p className="text-gray-500 mt-2">
            Explore the most searched services near you
          </p>
        </div>

        <CategoriesGrid categories={categories} />
      </section>

    </>
  )
}

export default CategoriesSection
import Link from 'next/link'
import React from 'react'
import WhiteBtn from '../buttons/WhiteBtn'
import WhiteOutlineBtn from '../buttons/WhiteOutlineBtn'
import BusinessCard from '../ui/BusinessCard'

const AddBusinessCTA = () => {
    return (

        <BusinessCard
            title="Ready to Get Started?"
            subtitle="Join our growing community of customers and service providers today"
            buttonText="Find a Service"
            buttonHref="/services"
            buttonText2="Register as Provider"
            buttonHref2="/add-business"
        />
    )
}

export default AddBusinessCTA
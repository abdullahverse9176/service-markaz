// Comprehensive providers data with all profile information
export const providers = [
  // Electricians in Rawalpindi
  {
    id: 1,
    name: "Qamar Zaman",
    category: "electricians",
    city: "rawalpindi",
    area: "Saddar",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 156,
    experience: 12,
    availability: "Available",
    responseTime: "< 2 hours",
    verification: true,
    about:
      "Certified electrician with 12 years of experience in residential and commercial electrical work. Specializing in wiring, repairs, and installations with 100% customer satisfaction.",
    services: [
      "Residential Wiring",
      "Electric Repairs",
      "Panel Installation",
      "LED Lighting Setup",
      "Short Circuit Fixing",
    ],
    experience_details: {
      years: 12,
      projects: 500,
      specializations: ["Residential", "Commercial", "Industrial"],
    },
    serviceAreas: ["Rawalpindi", "Islamabad", "Pindi Bhattian"],
    pricing: {
      calloutFee: "Rs 500",
      hourlyRate: "Rs 1500-2000",
      minCharge: "Rs 1000",
    },
    reviews_list: [
      {
        author: "Ali Khan",
        rating: 5,
        text: "Excellent service! Very professional and on time.",
        date: "2 weeks ago",
      },
      {
        author: "Fatima Ahmed",
        rating: 4,
        text: "Good work, reasonable prices.",
        date: "1 month ago",
      },
    ],
    contact: {
      phone: "+92-300-1234567",
      whatsapp: "+92-300-1234567",
      email: "qamar@servicez.com",
    },
  },
  {
    id: 2,
    name: "Ali Electrical Services",
    category: "electricians",
    city: "rawalpindi",
    area: "Adiala",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    rating: 4.6,
    reviews: 98,
    experience: 8,
    availability: "Available",
    responseTime: "< 3 hours",
    verification: true,
    about:
      "Licensed electrician providing reliable electrical services throughout Rawalpindi. Fast, affordable, and professional with guaranteed quality work.",
    services: [
      "Wiring & Installation",
      "Fault Diagnosis",
      "Switch & Socket Installation",
      "Generator Connection",
      "Maintenance Services",
    ],
    experience_details: {
      years: 8,
      projects: 250,
      specializations: ["Residential", "Maintenance"],
    },
    serviceAreas: ["Rawalpindi", "Azad Ppur"],
    pricing: {
      calloutFee: "Rs 400",
      hourlyRate: "Rs 1200-1800",
      minCharge: "Rs 800",
    },
    reviews_list: [
      {
        author: "Hassan Raza",
        rating: 5,
        text: "Very reliable. Will definitely hire again.",
        date: "3 weeks ago",
      },
    ],
    contact: {
      phone: "+92-300-7654321",
      whatsapp: "+92-300-7654321",
      email: "ali@servicez.com",
    },
  },

  // Plumbers in Rawalpindi
  {
    id: 3,
    name: "Master Plumber Services",
    category: "plumbers",
    city: "rawalpindi",
    area: "Pir Wadhai",
    image: "https://images.unsplash.com/photo-1530268729831-4be0f74b3c19?w=300&h=300&fit=crop",
    rating: 4.7,
    reviews: 142,
    experience: 15,
    availability: "Available",
    responseTime: "< 1 hour",
    verification: true,
    about:
      "Expert plumber with 15 years of experience. Handling all types of plumbing issues from leaks to pipe installation with professional expertise.",
    services: [
      "Pipe Installation",
      "Leak Fixing",
      "Drain Cleaning",
      "Water Tank Installation",
      "Sewage System Repair",
    ],
    experience_details: {
      years: 15,
      projects: 450,
      specializations: ["Residential", "Commercial", "Emergency"],
    },
    serviceAreas: ["Rawalpindi", "Islamabad", "Chakbeli"],
    pricing: {
      calloutFee: "Rs 600",
      hourlyRate: "Rs 1800-2500",
      minCharge: "Rs 1200",
    },
    reviews_list: [
      {
        author: "Sara Khan",
        rating: 5,
        text: "Fixed our leaking pipes perfectly. Highly recommended!",
        date: "10 days ago",
      },
    ],
    contact: {
      phone: "+92-300-9876543",
      whatsapp: "+92-300-9876543",
      email: "master@plumbing.com",
    },
  },

  // AC Repair in Rawalpindi
  {
    id: 4,
    name: "Cool Zone AC Services",
    category: "ac-repair",
    city: "rawalpindi",
    area: "Westridge",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a9?w=300&h=300&fit=crop",
    rating: 4.9,
    reviews: 178,
    experience: 10,
    availability: "Available",
    responseTime: "< 2 hours",
    verification: true,
    about:
      "Professional AC repair and installation service. Specialized in all brands with same-day service available. Expert technicians ensuring your comfort.",
    services: [
      "AC Installation",
      "AC Repair",
      "Maintenance & Cleaning",
      "Gas Refilling",
      "Compressor Replacement",
    ],
    experience_details: {
      years: 10,
      projects: 600,
      specializations: ["Window AC", "Split AC", "Central AC"],
    },
    serviceAreas: ["Rawalpindi", "Islamabad"],
    pricing: {
      calloutFee: "Rs 700",
      hourlyRate: "Rs 2000-2500",
      minCharge: "Rs 1500",
    },
    reviews_list: [
      {
        author: "Ahmed Khan",
        rating: 5,
        text: "Amazing service! Got AC running perfectly same day.",
        date: "1 week ago",
      },
    ],
    contact: {
      phone: "+92-300-1122334",
      whatsapp: "+92-300-1122334",
      email: "cool@acservices.com",
    },
  },

  // Carpenters in Rawalpindi
  {
    id: 5,
    name: "Expert Carpentry Works",
    category: "carpenters",
    city: "rawalpindi",
    area: "Chaklala",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop",
    rating: 4.5,
    reviews: 87,
    experience: 14,
    availability: "Available",
    responseTime: "< 4 hours",
    verification: false,
    about:
      "Experienced carpenter providing custom furniture and installation solutions. Quality craftsmanship with attention to detail and competitive pricing.",
    services: [
      "Custom Furniture",
      "Door & Window Frame",
      "Kitchen Cabinet",
      "Wardrobe Installation",
      "Wooden Flooring",
    ],
    experience_details: {
      years: 14,
      projects: 380,
      specializations: ["Custom Furniture", "Home Renovation", "Retail Fit-outs"],
    },
    serviceAreas: ["Rawalpindi", "Islamabad"],
    pricing: {
      calloutFee: "Free Consultation",
      hourlyRate: "Rs 1500-2000",
      minCharge: "Rs 2000",
    },
    reviews_list: [
      {
        author: "Zara Ahmed",
        rating: 5,
        text: "Beautiful wardrobes! Perfect finish and quality.",
        date: "2 weeks ago",
      },
    ],
    contact: {
      phone: "+92-300-5566778",
      whatsapp: "+92-300-5566778",
      email: "expert@carpentry.com",
    },
  },

  // Electricians in Islamabad
  {
    id: 6,
    name: "Islamabad Electrical Experts",
    category: "electricians",
    city: "islamabad",
    area: "Soan Garden",
    image: "https://images.unsplash.com/photo-1507845109343-583b4c68b53d?w=300&h=300&fit=crop",
    rating: 4.7,
    reviews: 134,
    experience: 11,
    availability: "Available",
    responseTime: "< 2 hours",
    verification: true,
    about:
      "Certified electrical engineers with comprehensive knowledge of modern electrical systems. Serving Islamabad with high-quality and safe electrical solutions.",
    services: [
      "House Wiring",
      "Panel Installation",
      "HVAC Electrical",
      "Solar Setup",
      "Emergency Repairs",
    ],
    experience_details: {
      years: 11,
      projects: 420,
      specializations: ["Residential", "Renewable Energy"],
    },
    serviceAreas: ["Islamabad", "Rawalpindi"],
    pricing: {
      calloutFee: "Rs 600",
      hourlyRate: "Rs 1800-2200",
      minCharge: "Rs 1200",
    },
    reviews_list: [
      {
        author: "Faisal Malik",
        rating: 5,
        text: "Professional team. Solar installation was flawless.",
        date: "3 weeks ago",
      },
    ],
    contact: {
      phone: "+92-300-8899001",
      whatsapp: "+92-300-8899001",
      email: "expert@electrical.com",
    },
  },

  // Plumbers in Islamabad
  {
    id: 7,
    name: "Aqua Solutions Plumbing",
    category: "plumbers",
    city: "islamabad",
    area: "Blue Area",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 165,
    experience: 16,
    availability: "Available",
    responseTime: "< 1.5 hours",
    verification: true,
    about:
      "Premium plumbing solutions in Islamabad. Experienced team handling residential and commercial projects with state-of-the-art equipment and materials.",
    services: [
      "Water Line Installation",
      "Blockage Removal",
      "Fixture Installation",
      "Water Softener Setup",
      "24/7 Emergency Service",
    ],
    experience_details: {
      years: 16,
      projects: 520,
      specializations: ["Residential", "Commercial", "Emergency"],
    },
    serviceAreas: ["Islamabad", "Rawalpindi", "Margalla Hills"],
    pricing: {
      calloutFee: "Rs 700",
      hourlyRate: "Rs 2000-2800",
      minCharge: "Rs 1500",
    },
    reviews_list: [
      {
        author: "Hina Khan",
        rating: 5,
        text: "Best plumber in Islamabad. Very professional!",
        date: "1 week ago",
      },
    ],
    contact: {
      phone: "+92-300-2233445",
      whatsapp: "+92-300-2233445",
      email: "aqua@solutions.com",
    },
  },
];

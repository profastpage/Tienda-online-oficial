'use client'

import { useEffect } from 'react'
import Storefront from '@/components/storefront'

export default function DemoPage() {
  useEffect(() => {
    // Inject structured data for SEO
    const organizationLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Urban Style",
      "url": "https://tienda-online-oficial.vercel.app",
      "logo": "https://tienda-online-oficial.vercel.app/icon.svg",
      "description": "Tienda online de streetwear en Perú",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lima",
        "addressCountry": "PE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+51-999-888-777",
        "contactType": "customer service",
        "availableLanguage": "Spanish"
      }
    }

    const websiteLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Urban Style",
      "url": "https://tienda-online-oficial.vercel.app",
      "description": "Tienda online de streetwear en Perú",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://tienda-online-oficial.vercel.app/demo?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }

    const script1 = document.createElement('script')
    script1.type = 'application/ld+json'
    script1.textContent = JSON.stringify(organizationLd)
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.type = 'application/ld+json'
    script2.textContent = JSON.stringify(websiteLd)
    document.head.appendChild(script2)

    return () => {
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [])

  return <Storefront />
}

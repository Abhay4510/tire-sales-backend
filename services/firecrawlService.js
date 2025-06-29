const axios = require('axios');

class FirecrawlService {
  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY;
    this.baseURL = 'https://api.firecrawl.dev/v1';
  }

  async scrapeWebsite(url) {
    try {
      const response = await axios.post(`${this.baseURL}/scrape`, {
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'h4', 'p', 'li', 'div', 'section', 'article'],
        excludeTags: ['script', 'style', 'nav', 'footer', 'header', 'aside', 'form', 'iframe'],
        waitFor: 3000,
        timeout: 20000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
      return {
        markdown: data.data?.markdown || data.markdown || '',
        html: data.data?.html || data.html || '',
        metadata: data.data?.metadata || data.metadata || {},
        success: true
      };
    } catch (error) {
      console.error('Firecrawl API Error:', error.response?.data || error.message);
      
      return {
        markdown: '',
        html: '',
        metadata: {},
        success: false,
        error: error.message
      };
    }
  }

  extractEmails(content) {
    if (!content) return [];
    
    // Enhanced email regex pattern
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailRegex) || [];
    
    // Remove duplicates and filter out common non-business emails
    const filteredEmails = [...new Set(emails)]
      .filter(email => {
        const lowerEmail = email.toLowerCase();
        // Filter out common generic/spam emails
        return !lowerEmail.includes('noreply') && 
               !lowerEmail.includes('no-reply') && 
               !lowerEmail.includes('donotreply') &&
               !lowerEmail.includes('example.com') &&
               !lowerEmail.includes('test.com');
      });

    // Categorize emails by type
    const categorizedEmails = {
      sales: [],
      support: [],
      info: [],
      contact: [],
      general: []
    };

    filteredEmails.forEach(email => {
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.includes('sales') || lowerEmail.includes('business')) {
        categorizedEmails.sales.push(email);
      } else if (lowerEmail.includes('support') || lowerEmail.includes('help')) {
        categorizedEmails.support.push(email);
      } else if (lowerEmail.includes('info')) {
        categorizedEmails.info.push(email);
      } else if (lowerEmail.includes('contact')) {
        categorizedEmails.contact.push(email);
      } else {
        categorizedEmails.general.push(email);
      }
    });

    return {
      all: filteredEmails,
      categorized: categorizedEmails,
      count: filteredEmails.length
    };
  }

  extractKeyInfo(content) {
    if (!content) return { 
      products: [], 
      services: [], 
      description: '',
      rawContent: '',
      businessType: '',
      keyFeatures: [],
      emails: { all: [], categorized: {}, count: 0 }
    };

    const keyInfo = {
      products: [],
      services: [],
      description: '',
      rawContent: content,
      businessType: '',
      keyFeatures: [],
      emails: this.extractEmails(content) // Add email extraction
    };

    const lowerContent = content.toLowerCase();
    
    const productKeywords = [
      'motorcycle', 'motorbike', 'bike', 'bicycle', 'cycle', 'scooter', 
      'atv', 'quad', 'dirt bike', 'sports bike', 'cruiser', 'touring bike',
      'car', 'truck', 'bus', 'commercial vehicle', 'passenger vehicle',
      'auto', 'vehicle', 'automotive',
      
      'tire', 'tyre', 'radial', 'bias', 'tubeless', 'tube tire',
      'winter tire', 'summer tire', 'all-season', 'off-road tire',
      'racing tire', 'performance tire', 'eco tire', 'run-flat',
      'bladder', 'tire bladder', 'inner tube', 'valve',
      
      'parts', 'accessories', 'wheels', 'rims', 'engines', 'brakes',
      'suspension', 'exhaust', 'battery', 'oil', 'filter', 'spark plug',
      'chain', 'sprocket', 'bearing', 'clutch', 'carburetor',
      'rubber', 'compound', 'tread', 'sidewall'
    ];

    const serviceKeywords = [
      'repair', 'service', 'maintenance', 'installation', 'tune-up',
      'oil change', 'brake service', 'tire change', 'tire fitting',
      'wheel alignment', 'balancing', 'customization', 'modification',
      'inspection', 'diagnostic', 'overhaul', 'restoration',
      'consultation', 'training', 'support', 'warranty',
      'manufacturing', 'production', 'supply', 'distribution'
    ];

    const businessTypeKeywords = {
      'manufacturer': ['manufacturing', 'manufacture', 'producer', 'factory', 'plant', 'production', 'maker'],
      'dealer': ['dealer', 'dealership', 'authorized dealer', 'distributor'],
      'retailer': ['retail', 'shop', 'store', 'outlet', 'showroom'],
      'service_center': ['service center', 'workshop', 'garage', 'repair shop'],
      'wholesaler': ['wholesale', 'bulk', 'distributor', 'supplier'],
      'importer': ['import', 'international', 'global', 'overseas'],
      'exporter': ['export', 'international', 'global', 'overseas']
    };

    productKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        keyInfo.products.push(keyword);
      }
    });

    serviceKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        keyInfo.services.push(keyword);
      }
    });

    for (const [type, keywords] of Object.entries(businessTypeKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        keyInfo.businessType = type;
        break;
      }
    }

    const featureKeywords = [
      'iso certified', 'iso 9001', 'quality', 'premium', 'high-performance', 
      'durable', 'reliable', 'eco-friendly', 'sustainable',
      'innovative', 'advanced', 'technology', 'certified',
      'warranty', 'guaranteed', 'tested', 'approved',
      'experience', 'established', 'trusted', 'leading'
    ];

    featureKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        keyInfo.keyFeatures.push(keyword);
      }
    });

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    const relevantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return lowerSentence.includes('company') || 
             lowerSentence.includes('business') || 
             lowerSentence.includes('established') ||
             lowerSentence.includes('specialize') ||
             lowerSentence.includes('leading') ||
             lowerSentence.includes('manufacture');
    }).slice(0, 3);

    const descriptionSentences = relevantSentences.length > 0 ? relevantSentences : sentences.slice(0, 3);
    const description = descriptionSentences.join('. ');
    
    keyInfo.description = description.length > 500 
      ? description.substring(0, 500) + '...' 
      : description;

    keyInfo.products = [...new Set(keyInfo.products)];
    keyInfo.services = [...new Set(keyInfo.services)];
    keyInfo.keyFeatures = [...new Set(keyInfo.keyFeatures)];

    return keyInfo;
  }
}

module.exports = new FirecrawlService();
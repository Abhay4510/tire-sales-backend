const firecrawlService = require('../services/firecrawlService');
const geminiService = require('../services/geminiService');
const csvService = require('../services/csvService');

exports.generatePersonalizedEmail = async (req, res) => {
  try {
    const { companyIdentifier } = req.body;

    if (!companyIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Company identifier is required",
        example: {
          companyIdentifier: "JK Tyre & Industries Ltd"
        }
      });
    }

    let company;
    if (/^\d+$/.test(companyIdentifier)) {
      company = csvService.getCompanyById(parseInt(companyIdentifier));
    } else {
      company = csvService.getCompanyByName(companyIdentifier);
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found in database"
      });
    }

    console.log(`Processing company: ${company.companyName}`);
    console.log(`Company website: ${company.website}`);

    let websiteData = { 
      products: [], 
      services: [], 
      description: '', 
      scrapingStatus: 'not_attempted',
      detailedInfo: {},
      businessType: '',
      keyFeatures: [],
      emails: { all: [], categorized: {}, count: 0 }
    };

    if (company.website && company.website.trim() !== '') {
      try {
        console.log(`Scraping website: ${company.website}`);
        
        const scrapedData = await firecrawlService.scrapeWebsite(company.website);
        
        if (scrapedData.success && scrapedData.markdown) {
          websiteData = firecrawlService.extractKeyInfo(scrapedData.markdown);
          websiteData.scrapingStatus = 'success';
          websiteData.rawContent = scrapedData.markdown; 
          websiteData.metadata = scrapedData.metadata;
          
          console.log('Website scraping completed successfully',scrapedData);
          console.log('Products found:', websiteData.products);
          console.log('Services found:', websiteData.services);
          console.log('Business type:', websiteData.businessType);
          console.log('Emails found:', websiteData.emails);
        } else {
          console.warn('Website scraping returned empty content');
          websiteData.scrapingStatus = 'empty_content';
          websiteData.scrapingError = 'No content extracted from website';
        }
        
      } catch (scrapeError) {
        console.warn('Website scraping failed:', scrapeError.message);
        websiteData.scrapingStatus = 'failed';
        websiteData.scrapingError = scrapeError.message;
      }
    } else {
      websiteData.scrapingStatus = 'no_website';
    }

    const companyData = {
      name: company.companyName,
      originalName: company.originalCompanyName,
      website: company.website,
      industry: company.industry || 'Automotive',
      location: company.location,
      employeeCount: company.employees,
      phone: company.phone,
      foundedYear: company.foundedYear,
      revenue: company.revenue,
      websiteContent: websiteData.rawContent || '',
      products: websiteData.products || [],
      services: websiteData.services || [],
      detailedDescription: websiteData.description || company.description || '',
      scrapingSuccess: websiteData.scrapingStatus === 'success'
    };

    const emailData = await geminiService.generatePersonalizedEmail(companyData, websiteData);
console.log("emaildata-------------------------->",emailData)

    res.status(200).json({
      success: true,
      message: "Email generated successfully",
      email: {
        subject: emailData.subject,
        body: emailData.content
      },
      companyEmails: websiteData.emails, // Add extracted emails to response
      metadata: {
        companyName: company.companyName,
        websiteScraped: websiteData.scrapingStatus === 'success',
        generatedAt: emailData.generatedAt,
        dataSource: emailData.dataSource,
        emailsFound: websiteData.emails.count
      }
    });

  } catch (error) {
    console.error("Email Generation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate personalized email",
      error: error.message
    });
  }
};
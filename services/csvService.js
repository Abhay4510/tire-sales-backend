const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

class CSVService {
  constructor() {
    this.csvPath = path.join(__dirname, '../data/apollo-accounts-export.csv');
    this.companies = [];
    this.loadCompanies();
  }

  async loadCompanies() {
    try {
      const csvData = fs.readFileSync(this.csvPath, 'utf8');
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });

      this.companies = parsed.data
        .filter(company => company['Company Name for Emails'] && company['Company Name for Emails'].trim() !== '')
        .map((company, index) => ({
          id: index + 1,
          companyName: company['Company Name for Emails']?.trim() || '',
          originalCompanyName: company['Company']?.trim() || '',
          website: this.cleanWebsite(company['Website']),
          industry: company['Industry']?.trim() || '',
          employees: company['# Employees'] || 0,
          location: this.formatLocation(company),
          phone: company['Company Phone']?.trim() || '',
          description: company['Short Description']?.trim() || '',
          foundedYear: company['Founded Year'] || null,
          revenue: company['Annual Revenue'] || null,
          linkedinUrl: company['Company Linkedin Url']?.trim() || '',
          facebookUrl: company['Facebook Url']?.trim() || '',
          twitterUrl: company['Twitter Url']?.trim() || '',
          accountStage: company['Account Stage']?.trim() || '',
          accountOwner: company['Account Owner']?.trim() || '',
          keywords: company['Keywords']?.trim() || '',
          technologies: company['Technologies']?.trim() || '',
          address: company['Company Address']?.trim() || ''
        }));

      console.log(`Loaded ${this.companies.length} companies from CSV`);
    } catch (error) {
      console.error('Error loading CSV:', error.message);
      this.companies = [];
    }
  }

  cleanWebsite(website) {
    if (!website) return '';
    
    let cleanUrl = website.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    return cleanUrl;
  }

  formatLocation(company) {
    const parts = [
      company['Company City']?.trim(),
      company['Company State']?.trim(),
      company['Company Country']?.trim()
    ].filter(part => part && part !== '');
    
    return parts.join(', ');
  }

  getAllCompanies() {
    return this.companies;
  }

  getCompanyByName(companyName) {
    return this.companies.find(company => 
      company.companyName.toLowerCase() === companyName.toLowerCase() ||
      company.originalCompanyName.toLowerCase() === companyName.toLowerCase()
    );
  }

  getCompanyById(id) {
    return this.companies.find(company => company.id === parseInt(id));
  }

  searchCompanies(searchTerm) {
    if (!searchTerm) return this.companies;
    
    const term = searchTerm.toLowerCase();
    return this.companies.filter(company =>
      company.companyName.toLowerCase().includes(term) ||
      company.originalCompanyName.toLowerCase().includes(term) ||
      company.industry.toLowerCase().includes(term) ||
      company.location.toLowerCase().includes(term)
    );
  }
}

module.exports = new CSVService();

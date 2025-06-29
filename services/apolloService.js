const axios = require('axios');

class ApolloService {
  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY;
    this.baseURL = 'https://api.apollo.io/v1';
  }

  async searchCompanies(query = {}) {
    try {
      const searchParams = {
        q_organization_keyword_tags: ['motorcycle', 'bike', 'cycle', 'automotive parts'],
        organization_industry_tag_ids: ['5567cd4573996d7f79000d58'], 
        organization_locations: query.locations || null,
        organization_num_employees_ranges: ['1,50', '51,200', '201,1000'],
        page: query.page || 1,
        per_page: query.perPage || 10
      };

      Object.keys(searchParams).forEach(key => 
        searchParams[key] === null && delete searchParams[key]
      );

      const response = await axios.get(`${this.baseURL}/mixed_people/search`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        params: searchParams
      });

      return response.data;
    } catch (error) {
      console.error('Apollo API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch companies from Apollo');
    }
  }

  async getOrganizationDetails(organizationId) {
    try {
      const response = await axios.get(`${this.baseURL}/organizations/${organizationId}`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Apollo Organization Details Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch organization details');
    }
  }
}

module.exports = new ApolloService();
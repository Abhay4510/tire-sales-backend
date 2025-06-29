// const apolloService = require('../services/apolloService');

// exports.searchCompanies = async (req, res) => {
//   try {
//     const { location, page = 1, limit = 10 } = req.query;
    
//     const searchQuery = {
//       locations: location ? [location] : null,
//       page: parseInt(page),
//       perPage: parseInt(limit)
//     };

//     const apolloData = await apolloService.searchCompanies(searchQuery);
    
//     // Process and format the company data
//     const companies = apolloData.people?.map(person => {
//       const org = person.organization;
//       return {
//         apolloId: org?.id,
//         name: org?.name,
//         domain: org?.primary_domain,
//         website: org?.website_url,
//         industry: org?.industry,
//         employeeCount: org?.estimated_num_employees,
//         location: `${org?.primary_city || ''}, ${org?.primary_state || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
//         contact: {
//           name: person.name,
//           email: person.email,
//           title: person.title,
//           phone: person.phone_numbers?.[0]?.sanitized_number,
//           linkedinUrl: person.linkedin_url
//         }
//       };
//     }).filter(company => company.name && company.contact.email) || [];

//     res.status(200).json({
//       success: true,
//       message: `Found ${companies.length} companies`,
//       data: {
//         companies,
//         pagination: {
//           currentPage: parseInt(page),
//           totalResults: apolloData.pagination?.total_entries || 0,
//           hasMore: apolloData.pagination?.total_pages > page
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Apollo Search Error:", error.message);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to search companies",
//       error: error.message 
//     });
//   }
// };

// exports.getCompanyDetails = async (req, res) => {
//   try {
//     const { organizationId } = req.params;
    
//     const companyDetails = await apolloService.getOrganizationDetails(organizationId);
    
//     res.status(200).json({
//       success: true,
//       data: companyDetails
//     });

//   } catch (error) {
//     console.error("Get Company Details Error:", error.message);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to get company details",
//       error: error.message 
//     });
//   }
// };

const csvService = require('../services/csvService');

exports.getAllCompanies = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let companies = search ? csvService.searchCompanies(search) : csvService.getAllCompanies();
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCompanies = companies.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      message: `Retrieved ${paginatedCompanies.length} companies`,
      data: {
        companies: paginatedCompanies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(companies.length / limit),
          totalCompanies: companies.length,
          hasNext: endIndex < companies.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    console.error("Get All Companies Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve companies",
      error: error.message
    });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let company;
    
    if (/^\d+$/.test(identifier)) {
      company = csvService.getCompanyById(parseInt(identifier));
    } else {
      company = csvService.getCompanyByName(identifier);
    }
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Company retrieved successfully",
      data: {
        company
      }
    });
  } catch (error) {
    console.error("Get Company Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve company",
      error: error.message
    });
  }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generatePersonalizedEmail(companyData, websiteData) {
    try {
      const hasWebsiteData = companyData.scrapingSuccess && websiteData.rawContent;
      console.log("companyData------------------------------------>",companyData)
      console.log("websiteData------------------------------------>",websiteData)
      const prompt = `
You are Abhay Vasava, a friendly and professional sales representative from TirePro Industries, a top-tier tire manufacturer in Mumbai.

Generate a short and engaging B2B sales email (150–200 words) for the following target company:

Target Company:
- Name: ${companyData.name}
- Industry: ${companyData.industry || 'Automotive'}
- Location: ${companyData.location || 'Not specified'}
- Website: ${companyData.website || 'N/A'}

${hasWebsiteData ? `
Website Insights:
- Products/Services: ${companyData.products?.join(', ') || 'General automotive products'}
- Business Type: ${websiteData.businessType || 'Not specified'}
- Highlights: ${websiteData.keyFeatures?.join(', ') || 'Not specified'}
- Summary: ${websiteData.rawContent?.substring(0, 800)}...
` : `
No website content available. Focus on their industry and general needs.
`}

Your Company (TirePro Industries):
- Products: motorcycle, bicycle, and automotive tires
- Strengths: durability, performance, cost-effectiveness
- Location: Mumbai, India
- Contact: Sarah Johnson, +91-9876543210, sarah.johnson@tirepro.com

Instructions:
1. Use a warm, personalized tone
2. No placeholders – use real names
3. Focus on mutual benefits and next steps (e.g., schedule a call, send catalog)
4. Mention 1–2 benefits like durability or smoother production
5. Keep the subject catchy and professional

Format:
SUBJECT: [short and clear subject line]

BODY: [full email content ready to send, no placeholders]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const subjectMatch = text.match(/SUBJECT:\s*(.+)/);
      const bodyMatch = text.match(/BODY:\s*([\s\S]+)/);

      return {
        subject: subjectMatch ? subjectMatch[1].trim() : 'Premium Tire Solutions for Your Business',
        content: bodyMatch ? bodyMatch[1].trim() : text,
        generatedAt: new Date().toISOString(),
        dataSource: hasWebsiteData ? 'enhanced_with_website' : 'basic_csv_data'
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate email content: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
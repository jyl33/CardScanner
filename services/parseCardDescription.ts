/**
 * Parses a card description into its component parts
 * @param {string} description - The full card description string
 * @returns {Object} Parsed card attributes
 */
const ParseCardDescription = (description: string) => {
    // Remove any extra whitespace
    const cleanedDescription = description.trim();
    
    // Default return object
    const cardInfo = {
      year: "",
      brand: "",
      subject: "",
      variety: "",
      card_grade: ""
    };
  
    // Attempt to extract year (first 4 digits)
    const yearMatch = cleanedDescription.match(/^(\d{4})/);
    if (yearMatch) {
      cardInfo.year = yearMatch[1];
    }
  
    // Try to extract grade if present (PSA, BGS, SGC)
    const gradeMatch = cleanedDescription.match(/(PSA|BGS|SGC)\s*(\d+(?:\.\d+)?)/i);
    if (gradeMatch) {
      cardInfo.card_grade = `${gradeMatch[1].toUpperCase()} ${gradeMatch[2]}`;
    }
  
    // Remove year and grade from description for further parsing
    let remainingDesc = cleanedDescription
      .replace(/^(\d{4})\s*/, '')
      .replace(/(PSA|BGS|SGC)\s*\d+(?:\.\d+)?/i, '')
      .trim();
  
    // Try to separate brand, subject, and variety
    const parts = remainingDesc.split(/\s+/);
    
    // Find the subject (likely the name)
    let subjectIndex = -1;
    for (let i = 0; i < parts.length; i++) {
      // Common ways to identify the subject
      if (/^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(parts.slice(i, i+2).join(' '))) {
        subjectIndex = i;
        break;
      }
    }
  
    if (subjectIndex !== -1) {
      // Brand is everything before the subject
      cardInfo.brand = parts.slice(0, subjectIndex).join(' ');
      
      // Subject is the name
      cardInfo.subject = parts.slice(subjectIndex, subjectIndex + 2).join(' ');
      
      // Variety is everything after the subject
      cardInfo.variety = parts.slice(subjectIndex + 2).join(' ');
    } else {
      // Fallback parsing if subject detection fails
      cardInfo.brand = parts.slice(0, -2).join(' ');
      cardInfo.subject = parts[parts.length - 2];
      cardInfo.variety = parts[parts.length - 1];
    }
  
    return cardInfo;
  };

export default ParseCardDescription;

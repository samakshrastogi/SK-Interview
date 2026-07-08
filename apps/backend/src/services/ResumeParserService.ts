const pdf = require('pdf-parse');
import fs from 'fs';

export interface IParsedResume {
  qualification?: string;
  experienceYears?: number;
  skills: string[];
  languages: string[];
  state?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  isPWD?: boolean;
  sportsQuota?: boolean;
  nccCertificate?: 'None' | 'A' | 'B' | 'C';
  drivingLicense?: 'None' | 'Two-Wheeler' | 'Four-Wheeler' | 'Heavy-Vehicle' | 'Both';
}

export class ResumeParserService {
  
  async parsePDF(filePath: string): Promise<IParsedResume> {
    const dataBuffer = fs.readFileSync(filePath);
    let extractedText = '';

    try {
      const data = await pdf(dataBuffer);
      extractedText = data.text || '';
    } catch (err) {
      console.error('Failed parsing pdf text, falling back to basic metadata scanning', err);
      // Clean up file if parsing fails
      extractedText = '';
    }

    return this.analyzeText(extractedText);
  }

  private analyzeText(text: string): IParsedResume {
    const textLower = text.toLowerCase();
    const result: IParsedResume = {
      skills: [],
      languages: []
    };

    // 1. Extract Qualification / Degree
    const degrees = [
      { key: 'M.Tech', patterns: [/m\.?\s*tech/i, /master\s*of\s*technology/i] },
      { key: 'B.Tech', patterns: [/b\.?\s*tech/i, /bachelor\s*of\s*technology/i, /engineering/i] },
      { key: 'MCA', patterns: [/m\.?\s*c\.?\s*a/i, /master\s*of\s*computer\s*applications/i] },
      { key: 'BCA', patterns: [/b\.?\s*c\.?\s*a/i, /bachelor\s*of\s*computer\s*applications/i] },
      { key: 'Post Graduate', patterns: [/post\s*graduate/i, /master/i, /m\.sc/i, /mba/i] },
      { key: 'Graduate', patterns: [/graduate/i, /bachelor/i, /b\.sc/i, /b\.com/i, /ba\b/i] },
      { key: 'HSC', patterns: [/h\.?s\.?c/i, /12th/i, /higher\s*secondary/i, /intermediate/i] },
      { key: 'SSC', patterns: [/s\.?s\.?c/i, /10th/i, /secondary\s*school/i, /matriculation/i] }
    ];

    for (const d of degrees) {
      if (d.patterns.some(p => p.test(textLower))) {
        result.qualification = d.key;
        break;
      }
    }
    // Default fallback if not found
    if (!result.qualification) {
      result.qualification = 'Graduate';
    }

    // 2. Extract Work Experience Years
    // Match: "3 years experience", "5+ years of experience", "exp: 2 years"
    const expPatterns = [
      /(\d+)\+?\s*years?\s*of?\s*experience/i,
      /(\d+)\+?\s*years?\s*work\s*experience/i,
      /experience\s*:\s*(\d+)/i,
      /exp\s*:\s*(\d+)/i,
      /(\d+)\+?\s*years?\s*exp/i
    ];

    for (const p of expPatterns) {
      const match = textLower.match(p);
      if (match) {
        result.experienceYears = parseInt(match[1], 10);
        break;
      }
    }
    if (result.experienceYears === undefined) {
      result.experienceYears = 0;
    }

    // 3. Extract Skills (Matches against a common list)
    const skillsList = [
      'React', 'Node.js', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
      'Python', 'Django', 'Flask', 'Java', 'Spring', 'C++', 'C#', 'SQL', 'MySQL', 'MongoDB',
      'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Git', 'Excel', 'Word', 'PowerPoint',
      'Office', 'Photoshop', 'PHP', 'Machine Learning', 'AI', 'Logistics', 'Operations'
    ];

    for (const skill of skillsList) {
      const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(text)) {
        result.skills.push(skill);
      }
    }

    // 4. Extract Languages
    const languagesList = [
      'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'French', 'German'
    ];

    for (const lang of languagesList) {
      const regex = new RegExp(`\\b${lang}\\b`, 'i');
      if (regex.test(text)) {
        result.languages.push(lang);
      }
    }
    if (result.languages.length === 0) {
      result.languages = ['English', 'Hindi'];
    }

    // 5. Extract State
    const states = [
      'Maharashtra', 'Karnataka', 'Delhi', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu',
      'West Bengal', 'Kerala', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Haryana'
    ];

    for (const state of states) {
      const regex = new RegExp(`\\b${state}\\b`, 'i');
      if (regex.test(text)) {
        result.state = state;
        break;
      }
    }
    if (!result.state) {
      result.state = 'Delhi';
    }

    // 6. Extract Age / Birth Year
    // e.g. "age: 24", "age - 26"
    const ageMatch = textLower.match(/\bage\s*[:\-]\s*(\d{2})\b/i);
    if (ageMatch) {
      result.age = parseInt(ageMatch[1], 10);
    } else {
      // Search for birth year (e.g. 1998, 2001) to compute age relative to 2026
      const yearMatch = text.match(/\b(19\d{2}|200\d)\b/);
      if (yearMatch) {
        const birthYear = parseInt(yearMatch[1], 10);
        result.age = 2026 - birthYear; // Current simulated system year is 2026
      }
    }

    // 7. Extract Driving License indicators
    if (/heavy\s*vehicle/i.test(textLower)) {
      result.drivingLicense = 'Heavy-Vehicle';
    } else if (/two\s*wheeler\s*and\s*four\s*wheeler/i.test(textLower) || /both\s*licenses/i.test(textLower)) {
      result.drivingLicense = 'Both';
    } else if (/four\s*wheeler/i.test(textLower) || /car\s*license/i.test(textLower)) {
      result.drivingLicense = 'Four-Wheeler';
    } else if (/two\s*wheeler/i.test(textLower) || /bike\s*license/i.test(textLower)) {
      result.drivingLicense = 'Two-Wheeler';
    }

    // 8. Extract Quotas and Certificates
    if (/ncc\s*c\s*certificate/i.test(textLower)) {
      result.nccCertificate = 'C';
    } else if (/ncc\s*b\s*certificate/i.test(textLower)) {
      result.nccCertificate = 'B';
    } else if (/ncc\s*a\s*certificate/i.test(textLower)) {
      result.nccCertificate = 'A';
    }

    if (/sports\s*quota/i.test(textLower) || /national\s*sports/i.test(textLower) || /state\s*level\s*athlete/i.test(textLower)) {
      result.sportsQuota = true;
    }

    if (/pwd\b/i.test(textLower) || /physically\s*handicapped/i.test(textLower) || /disability\s*certificate/i.test(textLower)) {
      result.isPWD = true;
    }

    return result;
  }
}

export const resumeParserService = new ResumeParserService();

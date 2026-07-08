import { IUserProfile } from '@sk-careerhub/types';
import { Exam, IExamDocument } from '../models/Exam';
import { examRepository } from '../repositories/ExamRepository';

export interface IEligibilityResult {
  examId: string;
  examName: string;
  status: 'Eligible' | 'Partially Eligible' | 'Not Eligible';
  reasons: string[];
  recommendations: string[];
  matchScore: number; // 0 to 100
}

export class EligibilityService {
  
  // Custom helper to score qualification hierarchy rank
  private getQualificationRank(qual: string): number {
    const q = qual.toLowerCase();
    if (q.includes('post graduate') || q.includes('pg') || q.includes('master') || q.includes('m.tech') || q.includes('m.sc') || q.includes('mba') || q.includes('m.ca')) {
      return 4;
    }
    if (q.includes('graduate') || q.includes('degree') || q.includes('bachelor') || q.includes('b.tech') || q.includes('b.e') || q.includes('b.sc') || q.includes('b.ca') || q.includes('b.com') || q.includes('b.a')) {
      return 3;
    }
    if (q.includes('12th') || q.includes('hsc') || q.includes('intermediate') || q.includes('10+2')) {
      return 2;
    }
    if (q.includes('10th') || q.includes('ssc') || q.includes('matriculation') || q.includes('high school')) {
      return 1;
    }
    return 0; // Unknown / Other certificate
  }

  // Custom helper to match driving license compatibility
  private matchLicense(
    userLicense: string | undefined, 
    requiredLicense: string | undefined
  ): boolean {
    if (!requiredLicense || requiredLicense === 'None') return true;
    if (!userLicense || userLicense === 'None') return false;
    
    if (userLicense === 'Both') return true;
    if (userLicense === requiredLicense) return true;

    // Both covers two/four wheelers
    if (requiredLicense === 'Two-Wheeler' && (userLicense === 'Both' || userLicense === 'Heavy-Vehicle')) return true;
    if (requiredLicense === 'Four-Wheeler' && userLicense === 'Both') return true;

    return false;
  }

  evaluateEligibility(profile: IUserProfile, exam: IExamDocument): IEligibilityResult {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let matchScore = 100;
    
    const userAge = profile.age || 21;
    const userCategory = profile.category || 'General';
    const userQual = profile.qualification || '';
    const userTyping = profile.typingSpeed || 0;
    const userLicense = profile.drivingLicense || 'None';
    const userPWD = profile.isPWD || false;
    const userSports = profile.sportsQuota || false;

    const { 
      minAge, 
      maxAge, 
      qualifications, 
      categoryAgeRelaxation, 
      minTypingSpeed, 
      drivingLicenseRequired, 
      pwdAllowed, 
      sportsQuotaAllowed 
    } = exam.eligibility;

    // 1. Age Checking with Category Relaxation
    let relaxation = 0;
    if (userCategory !== 'General' && categoryAgeRelaxation) {
      // Find matching key (Map values can be obtained via .get or standard Map conversion)
      const relaxationMap = categoryAgeRelaxation as any;
      if (relaxationMap instanceof Map) {
        relaxation = relaxationMap.get(userCategory) || 0;
      } else if (typeof relaxationMap === 'object') {
        relaxation = relaxationMap[userCategory] || 0;
      }
    }

    const effectiveMaxAge = maxAge + relaxation;

    if (userAge < minAge) {
      reasons.push(`Age (${userAge}) is below the minimum required age of ${minAge} years.`);
      matchScore -= 30;
    } else if (userAge > effectiveMaxAge) {
      if (relaxation > 0) {
        reasons.push(`Age (${userAge}) exceeds the maximum limit of ${maxAge} (including ${relaxation} years relaxation for ${userCategory}).`);
      } else {
        reasons.push(`Age (${userAge}) exceeds the maximum limit of ${maxAge} years.`);
      }
      matchScore -= 40;
    }

    // 2. Qualification Checks
    const userRank = this.getQualificationRank(userQual);
    
    // Evaluate if any exam qualification criteria is matched or exceeded
    const isQualEligible = qualifications.some((examQual) => {
      const examRank = this.getQualificationRank(examQual);
      return userRank >= examRank && examRank > 0;
    });

    if (!isQualEligible && qualifications.length > 0) {
      reasons.push(`Highest qualification (${userQual}) does not meet the criteria. Exam requires: ${qualifications.join(' or ')}.`);
      recommendations.push(`Acquire or select a higher educational qualification matching ${qualifications[0]}.`);
      matchScore -= 40;
    }

    // 3. PWD Check
    if (userPWD && !pwdAllowed) {
      reasons.push('Disability reservation (PWD) is not accommodated for this operational post.');
      matchScore -= 50;
    }

    // 4. Typing Speed Check
    if (minTypingSpeed && minTypingSpeed > 0) {
      if (userTyping < minTypingSpeed) {
        reasons.push(`Typing speed (${userTyping} WPM) is below the required ${minTypingSpeed} WPM.`);
        recommendations.push(`Practice typing to achieve at least ${minTypingSpeed} WPM.`);
        matchScore -= 20;
      }
    }

    // 5. Driving License check
    if (drivingLicenseRequired && drivingLicenseRequired !== 'None') {
      const licenseOk = this.matchLicense(userLicense, drivingLicenseRequired);
      if (!licenseOk) {
        reasons.push(`Requires a ${drivingLicenseRequired} driving license, but user profile lists: ${userLicense}.`);
        recommendations.push(`Apply for a valid RTO ${drivingLicenseRequired} driving license.`);
        matchScore -= 20;
      }
    }

    // Determine status
    let status: 'Eligible' | 'Partially Eligible' | 'Not Eligible' = 'Eligible';
    if (matchScore < 50) {
      status = 'Not Eligible';
    } else if (matchScore < 100) {
      status = 'Partially Eligible';
    }

    // Bound match score
    matchScore = Math.max(0, Math.min(100, matchScore));

    return {
      examId: exam._id.toString(),
      examName: exam.examName,
      status,
      reasons,
      recommendations,
      matchScore,
    };
  }

  async evaluateUserEligibility(profile: IUserProfile): Promise<IEligibilityResult[]> {
    const activeExams = await Exam.find({ status: 'Active' });
    return activeExams.map((exam) => this.evaluateEligibility(profile, exam));
  }
}

export const eligibilityService = new EligibilityService();

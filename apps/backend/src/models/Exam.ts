import mongoose, { Schema, Document } from 'mongoose';

export interface IEligibilityCriteria {
  minAge: number;
  maxAge: number;
  qualifications: string[]; // e.g., ["B.Tech", "Graduate", "12th"]
  categoryAgeRelaxation?: Record<string, number>; // e.g., { "OBC": 3, "SC": 5 }
  minTypingSpeed?: number;
  drivingLicenseRequired?: 'None' | 'Two-Wheeler' | 'Four-Wheeler' | 'Heavy-Vehicle' | 'Both';
  pwdAllowed: boolean;
  sportsQuotaAllowed: boolean;
  nccPreference?: 'None' | 'A' | 'B' | 'C';
}

export interface IImportantDates {
  notificationDate?: Date;
  applicationStartDate?: Date;
  applicationEndDate?: Date;
  correctionWindowStart?: Date;
  correctionWindowEnd?: Date;
  admitCardDate?: Date;
  examDate?: Date;
  resultDate?: Date;
}

export interface IExamPattern {
  stages: {
    name: string; // e.g., "Prelims", "Mains", "Interview"
    type: 'Objective' | 'Descriptive' | 'Physical' | 'Practical';
    subjects: string[];
    marks: number;
    durationMinutes: number;
  }[];
}

export interface IExamDocument extends Document {
  examName: string;
  department: string;
  notificationTitle: string;
  applicationLink?: string;
  officialWebsite?: string;
  eligibility: IEligibilityCriteria;
  salaryRange?: {
    min: number;
    max: number;
    payLevel?: string;
  };
  vacancies?: number;
  selectionProcess?: string[];
  examPattern?: IExamPattern;
  syllabus?: {
    subject: string;
    topics: string[];
  }[];
  importantDates: IImportantDates;
  fees: {
    general: number;
    obc?: number;
    sc: number;
    st: number;
    ews?: number;
    women: number;
    pwd: number;
  };
  correctionWindowOpen: boolean;
  resultUrl?: string;
  answerKeyUrl?: string;
  cutoffInfo?: string;
  previousYearPapers?: {
    year: number;
    title: string;
    pdfUrl: string;
  }[];
  preparationGuide?: string[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  notificationPdfUrl?: string;
  officialLinks?: {
    title: string;
    url: string;
  }[];
  status: 'Draft' | 'Active' | 'Closed' | 'Result-Out' | 'Suspended';
  lastUpdated: Date;
}

const EligibilityCriteriaSchema = new Schema<IEligibilityCriteria>({
  minAge: { type: Number, required: true, default: 18 },
  maxAge: { type: Number, required: true, default: 35 },
  qualifications: [{ type: String, required: true }],
  categoryAgeRelaxation: { type: Map, of: Number, default: {} },
  minTypingSpeed: { type: Number, default: 0 },
  drivingLicenseRequired: { 
    type: String, 
    enum: ['None', 'Two-Wheeler', 'Four-Wheeler', 'Heavy-Vehicle', 'Both'], 
    default: 'None' 
  },
  pwdAllowed: { type: Boolean, default: true },
  sportsQuotaAllowed: { type: Boolean, default: false },
  nccPreference: { type: String, enum: ['None', 'A', 'B', 'C'], default: 'None' },
}, { _id: false });

const ImportantDatesSchema = new Schema<IImportantDates>({
  notificationDate: { type: Date },
  applicationStartDate: { type: Date },
  applicationEndDate: { type: Date },
  correctionWindowStart: { type: Date },
  correctionWindowEnd: { type: Date },
  admitCardDate: { type: Date },
  examDate: { type: Date },
  resultDate: { type: Date },
}, { _id: false });

const ExamPatternSchema = new Schema<IExamPattern>({
  stages: [{
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['Objective', 'Descriptive', 'Physical', 'Practical'], 
      required: true 
    },
    subjects: [{ type: String }],
    marks: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
  }]
}, { _id: false });

const ExamSchema = new Schema<IExamDocument>({
  examName: { type: String, required: true, unique: true, index: true },
  department: { type: String, required: true, index: true },
  notificationTitle: { type: String, required: true },
  applicationLink: { type: String },
  officialWebsite: { type: String },
  eligibility: { type: EligibilityCriteriaSchema, required: true },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
    payLevel: { type: String },
  },
  vacancies: { type: Number },
  selectionProcess: [{ type: String }],
  examPattern: { type: ExamPatternSchema },
  syllabus: [{
    subject: { type: String, required: true },
    topics: [{ type: String }],
  }],
  importantDates: { type: ImportantDatesSchema, required: true },
  fees: {
    general: { type: Number, required: true, default: 0 },
    obc: { type: Number },
    sc: { type: Number, required: true, default: 0 },
    st: { type: Number, required: true, default: 0 },
    ews: { type: Number },
    women: { type: Number, required: true, default: 0 },
    pwd: { type: Number, required: true, default: 0 },
  },
  correctionWindowOpen: { type: Boolean, default: false },
  resultUrl: { type: String },
  answerKeyUrl: { type: String },
  cutoffInfo: { type: String },
  previousYearPapers: [{
    year: { type: Number, required: true },
    title: { type: String, required: true },
    pdfUrl: { type: String, required: true },
  }],
  preparationGuide: [{ type: String }],
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
  }],
  notificationPdfUrl: { type: String },
  officialLinks: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
  }],
  status: { 
    type: String, 
    enum: ['Draft', 'Active', 'Closed', 'Result-Out', 'Suspended'], 
    default: 'Active',
    index: true
  },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Text index to support full text search on examName, department, notificationTitle, syllabus topics
ExamSchema.index({ 
  examName: 'text', 
  department: 'text', 
  notificationTitle: 'text',
  'syllabus.subject': 'text',
  'syllabus.topics': 'text'
});

export const Exam = mongoose.model<IExamDocument>('Exam', ExamSchema);

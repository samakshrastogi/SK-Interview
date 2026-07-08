import { Exam, IExamDocument } from '../models/Exam';

export class ExamRepository {
  async findById(id: string): Promise<IExamDocument | null> {
    return Exam.findById(id);
  }

  async findByName(examName: string): Promise<IExamDocument | null> {
    return Exam.findOne({ examName });
  }

  async create(examData: Partial<IExamDocument>): Promise<IExamDocument> {
    const exam = new Exam(examData);
    return exam.save();
  }

  async update(id: string, examData: Partial<IExamDocument>): Promise<IExamDocument | null> {
    return Exam.findByIdAndUpdate(id, { $set: examData }, { new: true });
  }

  async upsertByName(examName: string, examData: Partial<IExamDocument>): Promise<IExamDocument> {
    const existing = await Exam.findOne({ examName });
    if (existing) {
      return Exam.findByIdAndUpdate(existing._id, { $set: examData }, { new: true }) as any;
    } else {
      const exam = new Exam({ examName, ...examData });
      return exam.save();
    }
  }

  async saveMany(exams: Partial<IExamDocument>[]): Promise<IExamDocument[]> {
    const results: IExamDocument[] = [];
    for (const data of exams) {
      if (data.examName) {
        const doc = await this.upsertByName(data.examName, data);
        results.push(doc);
      }
    }
    return results;
  }

  async search(query: string): Promise<IExamDocument[]> {
    return Exam.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  }

  async queryExams(filters: {
    status?: string;
    department?: string;
    qualification?: string;
    minAge?: number;
    maxAge?: number;
    search?: string;
  }): Promise<IExamDocument[]> {
    const mongoQuery: any = {};

    if (filters.status) {
      mongoQuery.status = filters.status;
    }

    if (filters.department) {
      mongoQuery.department = new RegExp(filters.department, 'i');
    }

    if (filters.qualification) {
      mongoQuery['eligibility.qualifications'] = { $in: [new RegExp(filters.qualification, 'i')] };
    }

    if (filters.minAge) {
      mongoQuery['eligibility.minAge'] = { $lte: filters.minAge };
    }

    if (filters.maxAge) {
      mongoQuery['eligibility.maxAge'] = { $gte: filters.maxAge };
    }

    if (filters.search) {
      // Fallback regex search if text index is too strict or not ready
      mongoQuery.$or = [
        { examName: new RegExp(filters.search, 'i') },
        { department: new RegExp(filters.search, 'i') },
        { notificationTitle: new RegExp(filters.search, 'i') },
      ];
    }

    return Exam.find(mongoQuery).sort({ lastUpdated: -1 });
  }
}

export const examRepository = new ExamRepository();

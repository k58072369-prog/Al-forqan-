/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: number;
  code: string;
  name: string;
  parentName: string;
  parentPhone: string;
  teacherName: string;
  groupName: string;
}

export interface News {
  id: number;
  title: string;
  image: string; // Base64 or local URL
  content: string;
  date: string;
}

export type LibraryType = 'youtube' | 'pdf' | 'image' | 'file' | 'post' | 'announcement';

export interface LibraryItem {
  id: number;
  type: LibraryType;
  title: string;
  url?: string;            // for YouTube, custom links, PDF or file downloads
  coverImage?: string;     // Base64 or local image
  description?: string;    // post description / announcement details
  date: string;
}

export interface ExamRecord {
  date: string;
  memorization: string;     // مقدار التسميع
  review: string;           // مقدار المراجعة
  grade: number;            // الدرجة
  rating: string;           // التقدير
}

export interface CompetitionResult {
  id?: number;
  studentId: number;
  studentCode?: string;     // joined from Student
  studentName?: string;     // joined from Student
  competitionName: string;
  competitionDate: string;
  level: string;
  numExams: number;
  exams: ExamRecord[];       // parsed from JSON in backend
  totalScore: number;
  percentage: number;
  levelRank: number;
  overallRank: number;
  qualified: boolean;       // التأهل
  certificate: boolean;     // الشهادة
  honor: boolean;           // التكريم
  rankAchieved: string;     // المركز المحقق
  levelAverageScore: number; // متوسط المستوى
  scoreDiff: number;        // فرق الدرجات
  studentRank: number;      // ترتيب الطالب
  strengths: string;        // نقاط القوة
  repeatedErrors: string;   // الأخطاء المتكررة
  recommendations: string;  // التوصيات
  honorDecision: boolean;   // يستحق التكريم
  honorType: string;        // نوع التكريم
  honorReason: string;      // سبب التكريم
}

export interface ParentReport {
  id?: number;
  studentId: number;
  studentCode?: string;     // joined from Student
  studentName?: string;     // joined from Student
  parentName?: string;      // joined from Student
  parentPhone?: string;     // joined from Student
  teacherName?: string;     // joined from Student
  groupName?: string;       // joined from Student
  month: string;            // الشهر (مثلاً: يوليو 2026)
  numClasses: number;
  numPresent: number;
  numAbsent: number;
  numLate: number;
  attendanceRate: number;   // نسبة الالتزام
  memorizationStart: string;
  memorizationEnd: string;
  newMemorizationAmount: string;
  numPages: number;
  numParts: number;
  reviewStart: string;
  reviewEnd: string;
  reviewAmount: string;
  reviewMastery: string;    // مستوى الإتقان
  avgRating: number;        // متوسط التقييم
  highestRating: number;    // أعلى تقييم
  lowestRating: number;     // أقل تقييم
  memorizationRating: number; // تقييم الحفظ
  reviewRating: number;     // تقييم المراجعة
  behaviorRating: number;   // تقييم السلوك
  disciplineRating: number; // تقييم الانضباط
  improvementRate: number;  // نسبة التحسن مقارنة بالشهر السابق
  strengths: string;        // نقاط القوة
  followupNeeds: string;    // نقاط تحتاج متابعة
  teacherNotes: string;     // ملاحظات المعلم
  parentRecommendations: string; // توصيات ولي الأمر
  detailedSummary: string;  // الخلاصة النهائية التفصيلية
}

export interface Competition {
  id?: number;
  name: string;
  date: string;
  level: string;
  description?: string;
}

export interface FileMedia {
  id?: number;
  filename: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  createdAt: string;
}

export interface DeletedRecord {
  id: number;
  tableName: string;
  originalId: number;
  recordData: string; // JSON string encoded
  deletedAt: string;
  deletedBy: string;
}


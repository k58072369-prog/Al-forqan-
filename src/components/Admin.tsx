/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, Newspaper, BookOpen, Award, FileText, Lock, ShieldAlert, 
  Trash2, Edit, Plus, Search, Check, RefreshCw, X, LogOut, ArrowRight, Save,
  FolderOpen, Settings, Undo2
} from "lucide-react";
import { 
  Student, News, LibraryItem, CompetitionResult, ParentReport, ExamRecord, LibraryType,
  Competition, FileMedia, DeletedRecord
} from "../types";

interface AdminProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export default function Admin({ isAdminLoggedIn, setIsAdminLoggedIn }: AdminProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isActiveSubTab, setIsActiveSubTab] = useState<
    "students" | "news" | "library" | "results" | "reports" | "logs" | "competitions" | "files" | "content" | "deleted"
  >("students");

  const isAuthenticated = isAdminLoggedIn;
  const setIsAuthenticated = setIsAdminLoggedIn;

  const [adminLogs, setAdminLogs] = useState<any[]>([]);

  // Authenticated fetch wrapper injecting Bearer token of session
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("admin_token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {}),
    };
    return fetch(url, { ...options, headers });
  };

  // State Collections
  const [students, setStudents] = useState<Student[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [reports, setReports] = useState<ParentReport[]>([]);

  // New Dynamic Modules State Collections
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filesMedia, setFilesMedia] = useState<FileMedia[]>([]);
  const [websiteContent, setWebsiteContent] = useState<Record<string, string>>({});
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);

  // Search trackers
  const [searchComp, setSearchComp] = useState("");
  const [searchFile, setSearchFile] = useState("");
  const [searchDel, setSearchDel] = useState("");

  // New Mobiles modals & forms
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [competitionForm, setCompetitionForm] = useState({
    name: "",
    date: "",
    level: "",
    description: ""
  });

  const [contentForm, setContentForm] = useState<Record<string, string>>({});

  // Search terms
  const [searchStu, setSearchStu] = useState("");

  // Loading indicator states
  const [loading, setLoading] = useState(false);

  // Form states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    code: "",
    name: "",
    parentName: "",
    parentPhone: "",
    teacherName: "الشيخ عبد الله الديب",
    groupName: "حلقة الفجر المتميزة",
  });

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    image: "",
    content: "",
    date: "",
  });

  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<LibraryItem | null>(null);
  const [libraryForm, setLibraryForm] = useState({
    type: "youtube" as LibraryType,
    title: "",
    url: "",
    coverImage: "",
    description: "",
    date: "",
  });

  // Competitions results complex editor
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState<CompetitionResult | null>(null);
  const [resultForm, setResultForm] = useState({
    studentId: 0,
    competitionName: "مسابقة الفرقان الكبرى السنوية لعشرة أجزاء",
    competitionDate: "",
    level: "حفظ عشرة أجزاء متتالية مع التجويد",
    numExams: 3,
    exams: [] as ExamRecord[],
    totalScore: 291,
    percentage: 97.0,
    levelRank: 3,
    overallRank: 7,
    qualified: true,
    certificate: true,
    honor: true,
    rankAchieved: "",
    levelAverageScore: 91.5,
    scoreDiff: 5.5,
    studentRank: 3,
    strengths: "",
    repeatedErrors: "",
    recommendations: "",
    honorDecision: true,
    honorType: "",
    honorReason: "",
  });

  // Parent report editor
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ParentReport | null>(null);
  const [reportForm, setReportForm] = useState({
    studentId: 0,
    month: "يوليو 2026",
    numClasses: 12,
    numPresent: 12,
    numAbsent: 0,
    numLate: 0,
    attendanceRate: 100,
    memorizationStart: "",
    memorizationEnd: "",
    newMemorizationAmount: "",
    numPages: 10,
    numParts: 0.5,
    reviewStart: "",
    reviewEnd: "",
    reviewAmount: "",
    reviewMastery: "ممتاز ومستقر جداً",
    avgRating: 9.8,
    highestRating: 10,
    lowestRating: 9,
    memorizationRating: 9.8,
    reviewRating: 9.8,
    behaviorRating: 10,
    disciplineRating: 10,
    improvementRate: 5,
    strengths: "",
    followupNeeds: "",
    teacherNotes: "",
    parentRecommendations: "",
    detailedSummary: "",
  });

  // LOAD DATA CORES
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [stuRes, newsRes, libRes, resRes, repRes, compRes, filesRes, contentRes, delRes] = await Promise.all([
        authFetch("/api/students"),
        authFetch("/api/news"),
        authFetch("/api/library"),
        authFetch("/api/results"),
        authFetch("/api/reports"),
        authFetch("/api/competitions"),
        authFetch("/api/files-media"),
        authFetch("/api/website-content"),
        authFetch("/api/admin/deleted-records")
      ]);

      if (stuRes.ok) setStudents(await stuRes.json());
      if (newsRes.ok) setNews(await newsRes.json());
      if (libRes.ok) setLibrary(await libRes.json());
      if (resRes.ok) setResults(await resRes.json());
      if (repRes.ok) setReports(await repRes.json());
      if (compRes.ok) setCompetitions(await compRes.json());
      if (filesRes.ok) setFilesMedia(await filesRes.json());
      if (contentRes.ok) {
        const data = await contentRes.json();
        setWebsiteContent(data);
        setContentForm(data);
      }
      if (delRes.ok) setDeletedRecords(await delRes.json());
    } catch (err) {
      console.error("خطأ أثناء استرجاع بيانات لوحة الإدارة:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await authFetch("/api/admin/logs");
      if (res.ok) setAdminLogs(await res.json());
    } catch (err) {
      console.error("خطأ أثناء جلب العمليات المدونة:", err);
    }
  };

  // NEW ACTIONS & REFRETCHERS
  const fetchCompetitions = async () => {
    try {
      const res = await authFetch("/api/competitions");
      if (res.ok) setCompetitions(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await authFetch("/api/files-media");
      if (res.ok) setFilesMedia(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWebsiteContent = async () => {
    try {
      const res = await authFetch("/api/website-content");
      if (res.ok) {
        const data = await res.json();
        setWebsiteContent(data);
        setContentForm(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeletedRecords = async () => {
    try {
      const res = await authFetch("/api/admin/deleted-records");
      if (res.ok) setDeletedRecords(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // COMPETITIONS ACTIONS
  const handleSaveCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionForm.name || !competitionForm.level) {
      alert("حقول الاسم والمستوى مطلوبة لتدشين مسابقة");
      return;
    }
    try {
      const url = editingCompetition ? `/api/competitions/${editingCompetition.id}` : "/api/competitions";
      const method = editingCompetition ? "PUT" : "POST";
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(competitionForm)
      });
      if (res.ok) {
        setShowCompetitionModal(false);
        setEditingCompetition(null);
        setCompetitionForm({ name: "", date: "", level: "", description: "" });
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || "خطأ بحفظ المسابقة");
      }
    } catch (err) {
      alert("حدث خطأ أثناء حفظ المسابقة.");
    }
  };

  const handleDeleteCompetition = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه المسابقة؟ سيتم إدراجها بسلة المحذوفات لتأمين واستعادة البيانات.")) return;
    try {
      const res = await authFetch(`/api/competitions/${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditCompetition = (comp: Competition) => {
    setEditingCompetition(comp);
    setCompetitionForm({
      name: comp.name,
      date: comp.date,
      level: comp.level,
      description: comp.description || ""
    });
    setShowCompetitionModal(true);
  };

  // WEBSITE CONTENT ACTIONS
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/website-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentForm })
      });
      if (res.ok) {
        alert("تم تحديث نصوص ومحتويات مكتب الفرقان بالموقع بنجاح تام!");
        fetchWebsiteContent();
      } else {
        alert("فشل تحديث محتويات الموقع");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MEDIA FILE ACTIONS
  const handleDeleteFile = async (id: number) => {
    if (!confirm("هل تريد إزالة هذا الملف محلياً ومن السجل الرقمي؟ سيتم أرشفته بسلة المحذوفات.")) return;
    try {
      const res = await authFetch(`/api/files-media/${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // RECOVERY AND RESTORE ACTIONS
  const handleRestoreRecord = async (id: number) => {
    try {
      const res = await authFetch(`/api/admin/deleted-records/${id}/restore`, { method: "POST" });
      if (res.ok) {
        alert("تم التراجع واسترجاع السجل الفيديرالي وإعادته لمكانه المنهجي بنجاح!");
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "فشل في استرداد السجل الفيديرالي");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurgeRecord = async (id: number) => {
    if (!confirm("تحذير أمني: هل أنت متأكد من حذف هذا السجل الرقمي بالكامل ونهائياً؟ هذا الإجراء لا يمكن التراجع عنه.")) return;
    try {
      const res = await authFetch(`/api/admin/deleted-records/${id}/purge`, { method: "DELETE" });
      if (res.ok) {
        alert("تم إتلاف السجل نهائياً بنجاح مبرم.");
        fetchAllData();
      } else {
        alert("فشل إتلاف السجل من سلة المحذوفات");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isActiveSubTab === "logs") {
        fetchLogs();
      } else if (isActiveSubTab === "competitions") {
        fetchCompetitions();
      } else if (isActiveSubTab === "files") {
        fetchFiles();
      } else if (isActiveSubTab === "content") {
        fetchWebsiteContent();
      } else if (isActiveSubTab === "deleted") {
        fetchDeletedRecords();
      }
    }
  }, [isActiveSubTab, isAuthenticated]);

  // LOGIN VALIDATOR
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        setPassword("");
        setAuthError("");
      } else {
        setAuthError(data.error || "خطأ في اسم المستخدم أو كلمة المرور");
      }
    } catch (err) {
      setAuthError("فشل الاتصال بالخادم الداخلي للتحقق.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setAdminLogs([]);
    setUsername("");
    setPassword("");
  };

  // STUDENT ACTIONS
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.code || !studentForm.name) return;
    
    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "PUT" : "POST";
      
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm),
      });

      if (res.ok) {
        setShowStudentModal(false);
        setEditingStudent(null);
        setStudentForm({ code: "", name: "", parentName: "", parentPhone: "", teacherName: "الشيخ عبد الله الديب", groupName: "حلقة الفجر المتميزة" });
        fetchAllData();
        alert("تم حفظ بيانات الطالب بنجاح!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "فشل حفظ الطالب");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب نهائياً؟ سيتم حذف جميع المسابقات والتقارير الشهرية المرتبطة به فوراً.")) return;
    try {
      const res = await authFetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
        alert("تم حذف وأرشفة الطالب وكل متعلقاته بسلة المحذوفات بنجاح!");
      } else {
        alert("فشل حذف الطالب");
      }
    } catch (err) {
      alert("خطأ اتصال");
    }
  };

  const startEditStudent = (stu: Student) => {
    setEditingStudent(stu);
    setStudentForm({
      code: stu.code,
      name: stu.name,
      parentName: stu.parentName,
      parentPhone: stu.parentPhone,
      teacherName: stu.teacherName,
      groupName: stu.groupName,
    });
    setShowStudentModal(true);
  };


  // NEWS ACTIONS
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) return;
    try {
      const url = editingNews ? `/api/news/${editingNews.id}` : "/api/news";
      const method = editingNews ? "PUT" : "POST";
      
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsForm),
      });

      if (res.ok) {
        setShowNewsModal(false);
        setEditingNews(null);
        setNewsForm({ title: "", image: "", content: "", date: "" });
        fetchAllData();
        alert("تم حفظ ونشر التقرير الإخباري بنجاح تام!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "فشل حفظ الخبر، يرجى ملء الخانات مجدداً");
      }
    } catch (err) {
      alert("خطأ شبكة أثناء حفظ الخبر");
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("هل متأكد من حذف الخبر وأرشفته بسلة المحذوفات للتأمين؟")) return;
    try {
      const res = await authFetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
        alert("تم حذف الخبر بنجاح وأرشفة نسخته بمسودة المحذوفات!");
      } else {
        alert("فشل حذف مادة الخبر");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditNews = (n: News) => {
    setEditingNews(n);
    setNewsForm({
      title: n.title,
      image: n.image || "",
      content: n.content,
      date: n.date,
    });
    setShowNewsModal(true);
  };


  // LIBRARY ACTIONS
  const handleSaveLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libraryForm.title || !libraryForm.type) return;
    try {
      const url = editingLibrary ? `/api/library/${editingLibrary.id}` : "/api/library";
      const method = editingLibrary ? "PUT" : "POST";
      
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(libraryForm),
      });

      if (res.ok) {
        setShowLibraryModal(false);
        setEditingLibrary(null);
        setLibraryForm({ type: "youtube", title: "", url: "", coverImage: "", description: "", date: "" });
        fetchAllData();
        alert("تم حفظ وتعقيب الفائدة وتحديث كشاف المكتبة بنجاح!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "فشل حفظ مادة المكتبة");
      }
    } catch (err) {
      alert("خطأ شبكة حفظ مادة المكتبة");
    }
  };

  const handleDeleteLibrary = async (id: number) => {
    if (!confirm("هل متأكد من حذف هذه المادة التعليمية بسلة المحذوفات؟")) return;
    try {
      const res = await authFetch(`/api/library/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
        alert("تم حذف وتوثيق أرشفة مادة المكتبة بنجاح!");
      } else {
        alert("فشل حذف مادة المكتبة");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditLibrary = (l: LibraryItem) => {
    setEditingLibrary(l);
    setLibraryForm({
      type: l.type,
      title: l.title,
      url: l.url || "",
      coverImage: l.coverImage || "",
      description: l.description || "",
      date: l.date,
    });
    setShowLibraryModal(true);
  };


  // COMPETITIONS RESULTS SAVE / ADD
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.studentId) {
      alert("يرجى اختيار طالب معتمد أولاً");
      return;
    }
    try {
      const url = editingResult ? `/api/results/${editingResult.id}` : "/api/results";
      const method = editingResult ? "PUT" : "POST";
      
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultForm),
      });

      if (res.ok) {
        setShowResultModal(false);
        setEditingResult(null);
        fetchAllData();
        alert("تم رصد وتسجيل نتيجة الطالب بالمسابقة وبطاقة التكريم التلقائية بنجاح!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "فشل حفظ النتيجة، تفقد الخانات والمعدلات الفنية");
      }
    } catch (err) {
      alert("خطأ شبكة بالاتصال مع خادم الرصد");
    }
  };

  const startAddResultFor = (studentId: number) => {
    setEditingResult(null);
    setResultForm({
      studentId,
      competitionName: "مسابقة الفرقان الكبرى السنوية لعشرة أجزاء",
      competitionDate: new Date().toISOString().split("T")[0],
      level: "حفظ عشرة أجزاء متتالية مع التجويد",
      numExams: 2,
      exams: [
         { date: new Date().toISOString().split("T")[0], memorization: "أول جزءين", review: "سورة البقرة", grade: 95, rating: "ممتاز" },
         { date: new Date().toISOString().split("T")[0], memorization: "الأجزاء من 3 إلى 5", review: "سورتي البقرة وآل عمران", grade: 97, rating: "ممتاز مرتفع" }
      ],
      totalScore: 192,
      percentage: 96.0,
      levelRank: 2,
      overallRank: 5,
      qualified: true,
      certificate: true,
      honor: true,
      rankAchieved: "المركز الثاني بفرع الحفظ المتميز",
      levelAverageScore: 92.0,
      scoreDiff: 4.0,
      studentRank: 2,
      strengths: "الحفظ ممتاز والورد متصل ومرتب والأحكام تامة ومخرج الحاء والراء رائع.",
      repeatedErrors: "تردد عند دمج المتشابهات ببداية البقرة.",
      recommendations: "التسميع المتتابع أمام المعلم.",
      honorDecision: true,
      honorType: "مصحف الحفظ وشهادة مذهبة وجائزة كفر الباجور النقدية",
      honorReason: "التفوق البارز وحصوله على رتبة التفوق المتصل.",
    });
    setShowResultModal(true);
  };

  const startEditResult = (r: CompetitionResult) => {
    setEditingResult(r);
    setResultForm({
      studentId: r.studentId,
      competitionName: r.competitionName,
      competitionDate: r.competitionDate,
      level: r.level,
      numExams: r.numExams,
      exams: r.exams,
      totalScore: r.totalScore,
      percentage: r.percentage,
      levelRank: r.levelRank,
      overallRank: r.overallRank,
      qualified: r.qualified,
      certificate: r.certificate,
      honor: r.honor,
      rankAchieved: r.rankAchieved,
      levelAverageScore: r.levelAverageScore,
      scoreDiff: r.scoreDiff,
      studentRank: r.studentRank,
      strengths: r.strengths || "",
      repeatedErrors: r.repeatedErrors || "",
      recommendations: r.recommendations || "",
      honorDecision: r.honorDecision,
      honorType: r.honorType || "",
      honorReason: r.honorReason || "",
    });
    setShowResultModal(true);
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف نتيجة المسابقة هذه؟ سيتم نقلها للأرشفة المؤقتة بسلة المحذوفات.")) return;
    try {
      const res = await authFetch(`/api/results/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
        alert("تم أرشفة وحذف سجل نتيجة المسابقة للطالب بنجاح!");
      } else {
        alert("فشل حذف سجل النتيجة");
      }
    } catch (err) {
      console.error(err);
    }
  };


  // PARENTS REPORT ACTIONS
  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.studentId) {
      alert("الرجاء اختيار الطالب");
      return;
    }
    try {
      const url = editingReport ? `/api/reports/${editingReport.id}` : "/api/reports";
      const method = editingReport ? "PUT" : "POST";
      
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });

      if (res.ok) {
        setShowReportModal(false);
        setEditingReport(null);
        fetchAllData();
        alert("تم إصدار بطاقة التقرير والمتابعة لولي الأمر بنجاح تام!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "فشل حفظ التقرير، تفقد دقة المعدلات العددية");
      }
    } catch (err) {
      alert("خطأ شبكة أثناء حفظ التقرير");
    }
  };

  const startAddReportFor = (studentId: number) => {
    setEditingReport(null);
    setReportForm({
      studentId,
      month: "يوليو 2026",
      numClasses: 12,
      numPresent: 11,
      numAbsent: 1,
      numLate: 0,
      attendanceRate: 91.6,
      memorizationStart: "بداية الجزء الثالث عشر",
      memorizationEnd: "نهاية الجزء الثالث عشر",
      newMemorizationAmount: "جزء كامل مسمع ومتقن",
      numPages: 20,
      numParts: 1.0,
      reviewStart: "الجزء الأول",
      reviewEnd: "الجزء الخامس",
      reviewAmount: "5 أجزاء كاملة",
      reviewMastery: "ممتاز ومرتفع التميز",
      avgRating: 9.6,
      highestRating: 10,
      lowestRating: 9,
      memorizationRating: 9.7,
      reviewRating: 9.5,
      behaviorRating: 10,
      disciplineRating: 10,
      improvementRate: 6,
      strengths: "الأخلاق الفاضلة، الانضباط في الصف، سرعة التثبيت للحفظ الممنهج والتلاوة التجويدية الراقية.",
      followupNeeds: "متابعة متشابهات سورة يوسف في قصة السجناء وتثبيتها بشكل مستمر تكراراً للتمليك.",
      teacherNotes: "نرجو مواصلة تشجيع الطالب في البيت وحثه على السرد لتقوية الذاكرة.",
      parentRecommendations: "الاستماع لقراءته لمدة 15 دقيقة قبل النوم بانتظام والورد اليومي الثابت.",
      detailedSummary: "تطور أداء الطالب بشكل ملموس هذا الشهر، وحافظ على مستويات تقييم متميزة مع تفوق ملحوظ في حلقة التسميع المترابطة ومرئيات سلوكية رفيعة تبشر بالخير.",
    });
    setShowReportModal(true);
  };

  const startEditReport = (rep: ParentReport) => {
    setEditingReport(rep);
    setReportForm({
      studentId: rep.studentId,
      month: rep.month,
      numClasses: rep.numClasses,
      numPresent: rep.numPresent,
      numAbsent: rep.numAbsent,
      numLate: rep.numLate,
      attendanceRate: rep.attendanceRate,
      memorizationStart: rep.memorizationStart,
      memorizationEnd: rep.memorizationEnd,
      newMemorizationAmount: rep.newMemorizationAmount,
      numPages: rep.numPages,
      numParts: rep.numParts,
      reviewStart: rep.reviewStart,
      reviewEnd: rep.reviewEnd,
      reviewAmount: rep.reviewAmount,
      reviewMastery: rep.reviewMastery,
      avgRating: rep.avgRating,
      highestRating: rep.highestRating,
      lowestRating: rep.lowestRating,
      memorizationRating: rep.memorizationRating,
      reviewRating: rep.reviewRating,
      behaviorRating: rep.behaviorRating,
      disciplineRating: rep.disciplineRating,
      improvementRate: rep.improvementRate,
      strengths: rep.strengths || "",
      followupNeeds: rep.followupNeeds || "",
      teacherNotes: rep.teacherNotes || "",
      parentRecommendations: rep.parentRecommendations || "",
      detailedSummary: rep.detailedSummary || "",
    });
    setShowReportModal(true);
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف تقرير ولي الأمر هذا؟ سيتم إرساله لسلة المؤرشفات.")) return;
    try {
      const res = await authFetch(`/api/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
        alert("تم حذف وأرشفة بطاقة تقرير المتابعة بنجاح!");
      } else {
        alert("فشل حذف التقرير");
      }
    } catch (err) {
      console.error(err);
    }
  };


  // FILE BASE64 SIMULATOR HANDLER
  const handleLogoUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>, target: "news" | "library") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const uploadRes = await authFetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, filename: file.name }),
        });
        if (uploadRes.ok) {
          const uData = await uploadRes.json();
          if (target === "news") {
            setNewsForm({ ...newsForm, image: uData.url });
          } else {
            setLibraryForm({ ...libraryForm, coverImage: uData.url });
          }
        }
      } catch (err) {
        alert("فشل تحميل الصورة");
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter student lists
  const filteredStudents = students.filter((s) => 
    s.name.includes(searchStu) || s.code.includes(searchStu) || s.parentName.includes(searchStu)
  );

  // ---------------------------------------------------------------------------
  // AUTHENTICATION INTERFACE (SPLASHED TO AN ADMIN ENTRY)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl space-y-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-800 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          
          <div className="space-y-1 text-center">
            <h2 className="font-serif text-xl sm:text-2xl font-black text-emerald-950">
              تسجيل دخول الإدارة والمحفظين
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              لوحة تحكم خاصة لشيوخ الحلقات لتسجيل الطلاب وتعديل درجات الحفظ والمراجعة الأسبوعية والشهرية.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5 text-right">
              <label className="font-bold text-emerald-950">اسم المستخدم المعتمد:</label>
              <input
                type="text"
                required
                placeholder="أدخل اسم المستخدم (مثال: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-right bg-gray-50 border outline-none border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 px-4 text-xs transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="font-bold text-emerald-950">كلمة المرور السرية:</label>
              <input
                type="password"
                required
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-right bg-gray-50 border outline-none border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 px-4 text-xs transition-all font-mono"
              />
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl text-[11px] text-emerald-900 border border-emerald-100/60 text-center font-sans font-bold leading-relaxed space-y-0.5">
               <div>حساب التجربة والدخول المعتمد للتقييم:</div>
               <div className="text-emerald-850 dir-ltr text-center font-mono">
                 اسم المستخدم: <span className="underline select-all text-amber-700">admin</span> | كلمة المرور: <span className="underline select-all text-amber-700">admin2026</span>
               </div>
            </div>

            {authError && (
              <p className="text-xs text-red-600 font-sans font-bold leading-relaxed text-center p-2.5 bg-red-50 border border-red-100 rounded-xl">{authError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{loading ? "جاري التحقق والمزامنة..." : "التحقق والولوج بصفة مدير"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // WORKSPACE CONTROLLERS (AUTHORIZED)
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-300">
      
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-emerald-900 text-white p-6 rounded-3xl border border-emerald-950 gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
          <div className="text-right">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-300">لوحة الإدارة والمتابعة الفنية</h2>
            <p className="text-[10px] text-emerald-100">بوابة تحوير البيانات وتنزيل السجلات وتحرير الأعداد</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            id="refresh-btn"
            className="p-2.5 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/60 rounded-xl text-emerald-100 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">تحديث قاعدة البيانات</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION CONTROLS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 font-sans">
        <button
          onClick={() => setIsActiveSubTab("students")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "students" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الطلاب والأكواد</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("competitions")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "competitions" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>المسابقات المنهجية</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("results")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "results" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>كشوف النتائج</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("reports")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "reports" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>تقارير أولياء الأمور</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("library")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "library" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>مسائل المكتبة</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("news")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "news" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>إدارة الأخبار</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("files")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "files" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FolderOpen className="w-4 h-4 text-emerald-600" />
          <span>الملفات والوسائط</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("content")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "content" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings className="w-4 h-4 text-blue-600" />
          <span>محتوى الموقع</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("logs")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "logs" ? "bg-emerald-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>سجل العمليات</span>
        </button>
        <button
          onClick={() => setIsActiveSubTab("deleted")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            isActiveSubTab === "deleted" ? "bg-emerald-800 text-white animate-bounce-slow" : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          <Undo2 className="w-4 h-4 text-red-500" />
          <span>سلة المحذوفات</span>
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
          <p className="text-gray-500 text-xs sm:text-sm font-bold">جاري مزامنة قاعدة بيانات SQLite المحلية الفيديرالية...</p>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 1: STUDENTS DIRECTORY MANAGER (CRUD + ACTION TRIGGER CORES)
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "students" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-serif text-lg font-bold text-emerald-950">دليل الطلاب المعتمدين والأكواد</h3>
            
            <button
              onClick={() => {
                setEditingStudent(null);
                setStudentForm({ code: "", name: "", parentName: "", parentPhone: "", teacherName: "الشيخ عبد الله الديب", groupName: "حلقة الفجر المتميزة" });
                setShowStudentModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طالب جديد وتوليد كود</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن الطلاب بالاسم الكود أو ولي الأمر..."
              value={searchStu}
              onChange={(e) => setSearchStu(e.target.value)}
              className="w-full text-right bg-gray-50 border outline-none border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-xs font-sans transition-all"
            />
            <Search className="w-4.5 h-4.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 text-xs sm:text-sm">لا يتوفر أي نتائج مطابقة للبحث الحالي بقاعدة بيانات الفرقان.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-right border-collapse min-w-[700px] text-xs sm:text-sm font-sans">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-950 font-bold">
                    <th className="p-3">كود المتابعة</th>
                    <th className="p-3">اسم الطالب الكامل</th>
                    <th className="p-3">اسم حلقة التحفيظ</th>
                    <th className="p-3">شيخ الحلقة المؤتمن</th>
                    <th className="p-3">هاتف ولي الأمر</th>
                    <th className="p-3 text-center">الإجراءات والعمليات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-emerald-50/10">
                      <td className="p-3 font-mono font-bold text-emerald-800">{s.code}</td>
                      <td className="p-3 font-bold text-gray-800">{s.name}</td>
                      <td className="p-3">{s.groupName}</td>
                      <td className="p-3 text-emerald-900 font-semibold">{s.teacherName}</td>
                      <td className="p-3 font-mono text-gray-500">{s.parentPhone || "-"}</td>
                      <td className="p-3 flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => startAddReportFor(s.id)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-900 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          إدخال تقرير شهري
                        </button>
                        <button
                          onClick={() => startAddResultFor(s.id)}
                          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-900 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          رصد نتيجة مسابقة
                        </button>
                        <button
                          onClick={() => startEditStudent(s)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل بيانات الطالب"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف الطالب المختار"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 2: NEWS MANAGER (CRUD CORES)
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "news" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-emerald-950">إدارة الأخبار والتوجيهات الإخبارية</h3>
            <button
              onClick={() => {
                setEditingNews(null);
                setNewsForm({ title: "", image: "", content: "", date: new Date().toISOString().split("T")[0] });
                setShowNewsModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خبر جديد للموقع</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 font-sans text-xs">
            {news.map((n) => (
              <div key={n.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center gap-4">
                <div className="text-right">
                  <div className="text-amber-600 font-bold font-mono">{n.date}</div>
                  <h4 className="font-bold text-emerald-950 text-sm mt-0.5">{n.title}</h4>
                  <p className="text-gray-500 text-xs line-clamp-2 mt-1">{n.content}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditNews(n)}
                    className="p-2 bg-white text-gray-500 hover:text-emerald-700 border border-gray-100 rounded-lg cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(n.id)}
                    className="p-2 bg-white text-red-500 hover:text-red-700 border border-gray-100 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 3: LIBRARY MANAGER (CRUD CORES)
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "library" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-emerald-950">إدارة مقررات ونشرات المكتبة</h3>
            <button
              onClick={() => {
                setEditingLibrary(null);
                setLibraryForm({ type: "youtube", title: "", url: "", coverImage: "", description: "", date: new Date().toISOString().split("T")[0] });
                setShowLibraryModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة محتوى للمكتبة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 font-sans text-xs">
            {library.map((l) => (
              <div key={l.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {l.type}
                  </span>
                  <h4 className="font-bold text-emerald-950 text-sm mt-1.5">{l.title}</h4>
                  <p className="text-gray-500 leading-relaxed text-xs line-clamp-1 mt-0.5">{l.description || "-"}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditLibrary(l)}
                    className="p-2 bg-white text-gray-500 hover:text-emerald-700 border border-gray-100 rounded-lg cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLibrary(l.id)}
                    className="p-2 bg-white text-red-500 hover:text-red-700 border border-gray-100 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 4: RESULTS MANAGER (CRUD CORES)
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "results" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-emerald-950">تحصيل رصود درجات المسابقات المعتمدة</h3>
            <span className="text-xs text-gray-400 font-semibold font-sans">
              * لإضافة درجات طالب جديد، انتقل لتبويب (الطلاب) واضغط الزر المناسب بجوار اسمه لتسهيل المطابقة.
            </span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">قاعدة نتائج المسابقات خالية حالياً.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-right border-collapse text-xs sm:text-sm font-sans">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-950 font-bold">
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">اسم المسابقة</th>
                    <th className="p-3">فرع المستوى</th>
                    <th className="p-3 text-center">الدرجة المئوية</th>
                    <th className="p-3 text-center">الترتيب بالفصل</th>
                    <th className="p-3 text-center">العمليات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-50/10">
                      <td className="p-3 font-semibold text-emerald-900">{r.studentName}</td>
                      <td className="p-3 font-bold">{r.competitionName}</td>
                      <td className="p-3">{r.level}</td>
                      <td className="p-3 text-center font-bold font-mono">{r.percentage}%</td>
                      <td className="p-3 text-center font-bold">المركز {r.levelRank}</td>
                      <td className="p-3 flex justify-center gap-1.5">
                        <button
                          onClick={() => startEditResult(r)}
                          className="p-1.5 bg-white text-gray-500 hover:text-emerald-700 border border-gray-100 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResult(r.id!)}
                          className="p-1.5 bg-white text-red-500 hover:text-red-700 border border-gray-100 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 5: REPORTS MANAGER (CRUD CORES)
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "reports" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-emerald-950">سجلات تقارير المتابعة الدورية لأولياء الأمور</h3>
            <span className="text-xs text-gray-400 font-semibold font-sans">
              * لإضافة تقارير متابعة جديدة، يرجى تصفح تبويب (الطلاب) المندرج بالبداية والضغط على "إدخال تقرير شهري".
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">لا يتوفر أي تقارير شهرية مسجلة حالياً.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-right border-collapse text-xs sm:text-sm font-sans">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-950 font-bold">
                    <th className="p-3">اسم الطالب المنتسب</th>
                    <th className="p-3">شهر التقرير</th>
                    <th className="p-3">معدل الانضباط</th>
                    <th className="p-3">الحفظ الجديد</th>
                    <th className="p-3 text-center">التقييم الشامل</th>
                    <th className="p-3 text-center">العمليات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {reports.map((rp) => (
                    <tr key={rp.id} className="hover:bg-emerald-50/10">
                      <td className="p-3 font-semibold text-emerald-900">{rp.studentName}</td>
                      <td className="p-3 font-bold">{rp.month}</td>
                      <td className="p-3 font-mono">{rp.attendanceRate}%</td>
                      <td className="p-3">{rp.newMemorizationAmount}</td>
                      <td className="p-3 text-center font-bold text-amber-600 font-mono">{rp.avgRating}/10</td>
                      <td className="p-3 flex justify-center gap-1.5">
                        <button
                          onClick={() => startEditReport(rp)}
                          className="p-1.5 bg-white text-gray-500 hover:text-emerald-700 border border-gray-100 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(rp.id!)}
                          className="p-1.5 bg-white text-red-500 hover:text-red-700 border border-gray-100 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && isActiveSubTab === "logs" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-4 gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-950">سجل العمليات والرقابة الإدارية</h3>
              <p className="text-gray-400 text-xs mt-0.5 font-sans font-medium">مراقبة شفافة لجميع عمليات إضافة وحذف وتعديل المحتوى والطلاب.</p>
            </div>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-xs border border-emerald-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث السجل يدويًا</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-150 font-sans">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-gray-200">
                  <th className="p-3">المسؤول</th>
                  <th className="p-3">الحدث الأساسي</th>
                  <th className="p-3">تفاصيل الإجراء والمعدّل</th>
                  <th className="p-3 font-mono text-center">عنوان IP</th>
                  <th className="p-3 text-center">تاريخ الحدث ووقت العملية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-xs text-gray-700">
                {adminLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 font-bold">لا يوجد عمليات إدارية مسجلة في قاعدة البيانات حالياً.</td>
                  </tr>
                ) : (
                  adminLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-50/10 transition-colors">
                      <td className="p-3 font-bold text-emerald-950 font-mono select-all">@{log.username}</td>
                      <td className="p-3">
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg text-[10px] font-bold font-sans">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 font-medium leading-relaxed max-w-sm font-sans">{log.details}</td>
                      <td className="p-3 font-mono text-gray-400 text-center select-all text-[11px]">{log.ipAddress}</td>
                      <td className="p-3 text-gray-400 text-center font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 7: COMPETITIONS MANAGER
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "competitions" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-4 gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-950">إدارة المسابقات والتقييمات المنهجية</h3>
              <p className="text-gray-400 text-xs mt-0.5 font-sans font-medium">تنظيم مسابقات الحفظ المتتابع، فروع الاختبار والتقديرات السنوية.</p>
            </div>
            <button
              onClick={() => {
                setEditingCompetition(null);
                setCompetitionForm({ name: "", date: new Date().toISOString().split("T")[0], level: "", description: "" });
                setShowCompetitionModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مسابقة جديدة</span>
            </button>
          </div>

          <div className="flex bg-gray-50 p-3 rounded-2xl items-center border border-gray-100 max-w-md">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="ابحث عن مسابقة..."
              value={searchComp}
              onChange={(e) => setSearchComp(e.target.value)}
              className="bg-transparent text-right w-full text-xs outline-none focus:ring-0 font-sans"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-150 font-sans">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-emerald-50/60 text-emerald-950 font-bold border-b border-gray-200">
                  <th className="p-3">اسم المسابقة وبنيان الفروع</th>
                  <th className="p-3">المستوى المطلوب والأجزاء</th>
                  <th className="p-3 text-center">التاريخ المقرر</th>
                  <th className="p-3">وصف وتوجيهات</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {competitions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">لا يوجد مسابقات منهجية مسجلة حالياً.</td>
                  </tr>
                ) : (
                  competitions
                    .filter((c) => c.name.toLowerCase().includes(searchComp.toLowerCase()) || (c.level && c.level.includes(searchComp)))
                    .map((comp) => (
                      <tr key={comp.id} className="hover:bg-emerald-50/10 transition-colors">
                        <td className="p-3 font-bold text-emerald-950">{comp.name}</td>
                        <td className="p-3 text-gray-600 font-medium">{comp.level}</td>
                        <td className="p-3 text-center text-gray-500 font-mono">{comp.date}</td>
                        <td className="p-3 text-gray-500 max-w-xs truncate">{comp.description || "بدون وصف"}</td>
                        <td className="p-3 text-center">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => startEditCompetition(comp)}
                              className="p-1.5 bg-white text-emerald-700 hover:text-emerald-950 border border-emerald-100 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompetition(comp.id!)}
                              className="p-1.5 bg-white text-red-500 hover:text-red-700 border border-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 8: FILES & MEDIA MANAGER
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "files" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-4 gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-950">إدارة مذكرات وملفات الوسائط المرفوعة</h3>
              <p className="text-gray-400 text-xs mt-0.5 font-sans font-medium">متابعة السعة التخزينية للمستندات والكتب، الصور، والملفات المحملة بالسيرفر.</p>
            </div>
            <button
              onClick={() => {
                fetchAllData();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-xs border border-emerald-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث السجل</span>
            </button>
          </div>

          <div className="flex bg-gray-50 p-3 rounded-2xl items-center border border-gray-100 max-w-md">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="ابحث باسم الملف..."
              value={searchFile}
              onChange={(e) => setSearchFile(e.target.value)}
              className="bg-transparent text-right w-full text-xs outline-none focus:ring-0 font-sans"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-150 font-sans">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-emerald-50/60 text-emerald-950 font-bold border-b border-gray-200">
                  <th className="p-3">اسم المستند والملف</th>
                  <th className="p-3">نوع الملف (Mime)</th>
                  <th className="p-3">الحجم المحسوب</th>
                  <th className="p-3 text-center">تاريخ الرفع في السيرفر</th>
                  <th className="p-3 text-center">رابط المعاينة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700 animate-in fade-in">
                {filesMedia.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 font-bold">لا توجد ملفات أو وسائط مرفوعة مسجلة بقاعدة البيانات بعد.</td>
                  </tr>
                ) : (
                  filesMedia
                    .filter((f) => f.filename.toLowerCase().includes(searchFile.toLowerCase()))
                    .map((file) => (
                      <tr key={file.id} className="hover:bg-emerald-50/10 transition-colors">
                        <td className="p-3 font-mono text-[11px] font-bold text-emerald-950 max-w-xs truncate text-right inline-block" title={file.filename}>
                          {file.filename}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md text-[10px] font-bold font-mono">
                            {file.fileType || "unknown"}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-gray-600 text-[11px]">{file.fileSize}</td>
                        <td className="p-3 text-center text-gray-400 font-mono text-[11px]">{new Date(file.createdAt).toLocaleString("ar-EG")}</td>
                        <td className="p-3 text-center">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="text-emerald-700 hover:underline font-bold text-[11px] font-serif"
                          >
                            معاينة وحفظ ↗
                          </a>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteFile(file.id!)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 9: WEBSITE THEMATIC CONTENT TEXTS
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "content" && (
        <form onSubmit={handleSaveContent} className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-4 gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-950">إدارة وتحرير نصوص ومحتويات الموقع</h3>
              <p className="text-gray-400 text-xs mt-0.5 font-sans font-medium">تحوير وتعديل صياغة خطابات الموقع وإعلانات شريط التنبيهات دون ملامسة الأكواد البرمجية.</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-serif font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتطبيق النصوص الآن</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right font-sans text-xs">
            <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-50/50 space-y-4">
              <h4 className="font-serif text-sm font-bold text-emerald-900 border-b border-emerald-100 pb-2">نصوص الصفحة الرئيسية الفيديرالية</h4>
              
              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950">العنوان الرئيسي للموقع (خطاب ترحيبي):</label>
                <textarea
                  rows={2}
                  value={contentForm.home_title || ""}
                  onChange={(e) => setContentForm({ ...contentForm, home_title: e.target.value })}
                  placeholder="مكتب الفرقان لتحفيظ القرآن الكريم بكفر الباجور"
                  className="w-full text-right bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950">العنوان التعريفي الفرعي والرسالة الدعوية المرافقة:</label>
                <textarea
                  rows={3}
                  value={contentForm.home_subtitle || ""}
                  onChange={(e) => setContentForm({ ...contentForm, home_subtitle: e.target.value })}
                  placeholder="منارة قرآنية تهدف لإحياء قلوب الأجيال الناشئة..."
                  className="w-full text-right bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950">الإعلان العاجل (الملصق في شريط الإشعارات المتحرك في الأعلى):</label>
                <input
                  type="text"
                  value={contentForm.announcement || ""}
                  onChange={(e) => setContentForm({ ...contentForm, announcement: e.target.value })}
                  placeholder="تبدأ اختبارات مراجعة نصف العام في الأول من ذي القعدة..."
                  className="w-full text-right bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="bg-sky-50/15 p-5 rounded-2xl border border-sky-100/50 space-y-4">
              <h4 className="font-serif text-sm font-bold text-cyan-950 border-b border-sky-150 pb-2">التعريف بالمكتب ومعلومات التواصل</h4>

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950 font-sans">نبذة تعريفية شاملة (نبذة تحت صورة فضيلة الشيخ):</label>
                <textarea
                  rows={4}
                  value={contentForm.about_text || ""}
                  onChange={(e) => setContentForm({ ...contentForm, about_text: e.target.value })}
                  placeholder="تأسس مكتب الفرْقان ليكون حاضنة تربوية إسلامية ممتازة..."
                  className="w-full text-right bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">رقم الهاتف الفني المباشر للتسجيل:</label>
                  <input
                    type="text"
                    value={contentForm.phone || ""}
                    onChange={(e) => setContentForm({ ...contentForm, phone: e.target.value })}
                    className="w-full text-right bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 text-xs font-mono"
                    placeholder="01127225409"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">العنوان الفعلي التفصيلي لموقع المكتب:</label>
                  <input
                    type="text"
                    value={contentForm.location || ""}
                    onChange={(e) => setContentForm({ ...contentForm, location: e.target.value })}
                    className="w-full text-right bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 text-xs"
                    placeholder="كفر الباجور، المنوفية - بجوار مسجد الحامدية"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-100/70 text-[10px] sm:text-xs">
                ⚠️ بمجرد ضغط زر حفظ، سيتم تعديل العناوين بالصفحة الأولى وتوزيع قيمها على كافة الزوار مباشرة وتحديثها في الـ Dom.
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------------------------------
          TAB 10: RECYCLE BIN (SOFT DELETE MANAGER & RESTORATION CORES)
         --------------------------------------------------------------------------- */}
      {!loading && isActiveSubTab === "deleted" && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-4 gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-red-950">سلة محذوفات مكتب الفرقان المرموقة</h3>
              <p className="text-gray-400 text-xs mt-0.5 font-sans font-medium">حماية مشددة من الحذف العشوائي للبيانات والتقارير الشهرية كالأكواد والوسائط مع زر للاسترداد.</p>
            </div>
            <button
              onClick={fetchDeletedRecords}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-800 hover:bg-red-100 rounded-xl text-xs font-serif font-bold transition-all border border-red-100 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث سلة المحذوفات</span>
            </button>
          </div>

          <div className="flex bg-gray-50 p-3 rounded-2xl items-center border border-gray-100 max-w-md">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="ابحث بقاعة المحذوفات..."
              value={searchDel}
              onChange={(e) => setSearchDel(e.target.value)}
              className="bg-transparent text-right w-full text-xs outline-none focus:ring-0 font-sans"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-150 font-sans">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-red-50/40 text-red-950 font-bold border-b border-gray-200">
                  <th className="p-3">نوع السجل الأصلي</th>
                  <th className="p-3">محتوى / تفاصيل المعاينة الفيديرالية</th>
                  <th className="p-3 text-center">المحذوف بواسطة</th>
                  <th className="p-3 text-center">تاريخ ووقت الحذف</th>
                  <th className="p-3 text-center">الإجراءات والمسار الأمني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {deletedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 font-bold">كل شيء آمن! سلة المحذوفات خاوية من السجلات الرقمية حالياً.</td>
                  </tr>
                ) : (
                  deletedRecords
                    .filter((rec) => {
                      const dataStr = rec.recordData.toLowerCase();
                      const tableStr = rec.tableName.toLowerCase();
                      const term = searchDel.toLowerCase();
                      return dataStr.includes(term) || tableStr.includes(term);
                    })
                    .map((rec) => {
                      let parsed: any = {};
                      try { parsed = JSON.parse(rec.recordData); } catch (e) { parsed = {}; }
                      
                      const getPreviewName = () => {
                        return parsed.name || parsed.title || parsed.studentName || parsed.competitionName || parsed.filename || `سجل رقم ${rec.originalId}`;
                      };

                      const getTableTitle = () => {
                        switch (rec.tableName) {
                          case "students": return "👤 طالب وأكواد";
                          case "news": return "📰 خبر وتنويه";
                          case "library": return "📚 مذكرات ومسائل";
                          case "competition_results": return "🏆 نتيجة مسابقة";
                          case "parent_reports": return "📝 تقرير شهري لولي الأمر";
                          case "competitions": return "🏅 مسابقة منهجية";
                          case "files_media": return "📁 ملفات علمية مرفوعة";
                          default: return rec.tableName;
                        }
                      };

                      return (
                        <tr key={rec.id} className="hover:bg-red-50/10 transition-colors">
                          <td className="p-3">
                            <span className="inline-block px-2 py-1 bg-red-50 text-red-800 rounded-lg text-[10px] font-bold">
                              {getTableTitle()}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-sans font-semibold text-gray-900">{getPreviewName()}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[240px]" title={rec.recordData}>
                              {rec.recordData}
                            </div>
                          </td>
                          <td className="p-3 text-center text-gray-600 font-mono select-all">@{rec.deletedBy}</td>
                          <td className="p-3 text-center text-gray-400 font-mono text-[11px]">
                            {new Date(rec.deletedAt).toLocaleString("ar-EG")}
                          </td>
                          <td className="p-3 text-center animate-pulse">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleRestoreRecord(rec.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-150 rounded-xl text-[10px] font-serif font-bold transition-all cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>استرجاع</span>
                              </button>
                              <button
                                onClick={() => handlePurgeRecord(rec.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-800 hover:bg-red-100 border border-red-150 rounded-xl text-[10px] font-serif font-bold transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>إتلاف</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCompetitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-emerald-900">
                {editingCompetition ? "تحديث المسابقة المنهجية" : "إنشاء وتدشين مسابقة حفظ جديدة"}
              </h3>
              <button onClick={() => setShowCompetitionModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompetition} className="space-y-4 font-sans text-xs text-right">
              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950">اسم المسابقة الكبرى:</label>
                <input
                  type="text"
                  required
                  value={competitionForm.name}
                  onChange={(e) => setCompetitionForm({ ...competitionForm, name: e.target.value })}
                  placeholder="مثال: مسابقة ريحان القرآن الرمضانية الأولى"
                  className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">المستوى المنهجي المطلوب:</label>
                  <input
                    type="text"
                    required
                    value={competitionForm.level}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, level: e.target.value })}
                    placeholder="مثال: حفظ ثلاثة أجزاء متتالية بسند متصل"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">تاريخ المسابقة المقرر والامتحان:</label>
                  <input
                    type="date"
                    required
                    value={competitionForm.date}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, date: e.target.value })}
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950">توجيهات وشروط إضافية للمتسابقين:</label>
                <textarea
                  rows={3}
                  value={competitionForm.description}
                  onChange={(e) => setCompetitionForm({ ...competitionForm, description: e.target.value })}
                  placeholder="بيان شروط الفوز والجوائز النقدية لكل مستوى..."
                  className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompetitionModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  حفظ وتطبيق المسابقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------------------------
          MODAL 1: STUDENT INPUT FORM (MODAL DESIGN)
         --------------------------------------------------------------------------- */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-emerald-900">
                {editingStudent ? "تحديث وتعديل بيانات المنتسب" : "تسجيل طالب وتوليد كود المتابعة الجديد"}
              </h3>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950 font-sans">كود الطالب الفريد (أرقام فقط):</label>
                  <input
                    type="text"
                    required
                    value={studentForm.code}
                    onChange={(e) => setStudentForm({ ...studentForm, code: e.target.value })}
                    placeholder="مثال: 1004"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950 font-sans">اسم الطالب الكريم رباعياً:</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="بيان الاسم المنهجي كاملًا"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">اسم ولي الأمر التابع:</label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    placeholder="الاسم الكامل لولي الأمر"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">رقم الهاتف للتواصل المباشر:</label>
                  <input
                    type="text"
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    placeholder="مثال: 01127225409"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">المعلم الفني المسؤول:</label>
                  <input
                    type="text"
                    value={studentForm.teacherName}
                    onChange={(e) => setStudentForm({ ...studentForm, teacherName: e.target.value })}
                    placeholder="الشيخ عبد الله الديب"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">حلقة التنسيب الحالية:</label>
                  <input
                    type="text"
                    value={studentForm.groupName}
                    onChange={(e) => setStudentForm({ ...studentForm, groupName: e.target.value })}
                    placeholder="مثال: حلقة فرسان القرآن"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  حفظ وتأكيد السجل الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          MODAL 2: NEWS INPUT FORM (MODAL DESIGN)
         --------------------------------------------------------------------------- */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 animate-out shrink-0">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-emerald-900">إدخال / تحديث خبر بالموقع</h3>
              <button onClick={() => setShowNewsModal(false)} className="text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4 font-sans text-xs text-right">
              <div className="space-y-1.5">
                <label className="font-bold">عنوان الخبر الرئيسي:</label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="مثال: انطلاق الحفل السنوي لتكريم الحفظة المتميزين"
                  className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold">تاريخ النشر المعتمد:</label>
                  <input
                    type="date"
                    required
                    value={newsForm.date}
                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-bold">تحميل صورة ملحقة للخبر (اختياري):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUploadSimulate(e, "news")}
                    className="w-full text-xs font-mono"
                  />
                  {newsForm.image && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-emerald-600 block font-bold">تم إرفاق صورة الخبر بنجاح.</p>
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 mt-1 shadow-xs bg-gray-50 flex items-center justify-center">
                        <img src={newsForm.image} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold">تحرير نص الخبر بالكامل:</label>
                <textarea
                  rows={4}
                  required
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  placeholder="اكتب التقرير الإخباري التفصيلي الذي تود عرضه على الجمهور بالموقع..."
                  className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 font-sans h-28"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewsModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs">حفظ ونشر الخبر</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          MODAL 3: LIBRARY INPUT FORM (MODAL DESIGN)
         --------------------------------------------------------------------------- */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-emerald-100">إرسال / تعديل محتوى للمكتبة وعظي ثري</h3>
              <button onClick={() => setShowLibraryModal(false)} className="text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLibrary} className="space-y-4 font-sans text-xs text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">نوع المادة العلمية:</label>
                  <select
                    value={libraryForm.type}
                    onChange={(e) => setLibraryForm({ ...libraryForm, type: e.target.value as LibraryType })}
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none"
                  >
                    <option value="youtube">تسجيل مرئي يوتيوب</option>
                    <option value="pdf">كتيب ومذكرة PDF</option>
                    <option value="post">منشور وتوجيهات الحفظ</option>
                    <option value="announcement">تنويه وإعلان مواعيد</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">العنوان التعريفي للخبر/المادة:</label>
                  <input
                    type="text"
                    required
                    value={libraryForm.title}
                    onChange={(e) => setLibraryForm({ ...libraryForm, title: e.target.value })}
                    placeholder="مثال: كتيب شرح تحفة الأطفال الميسر"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                  />
                </div>
              </div>

              {(libraryForm.type === "youtube" || libraryForm.type === "pdf") && (
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">رابط توجيه المصدر (يوتيوب أو ملف PDF للتنزيل):</label>
                  <input
                    type="text"
                    value={libraryForm.url}
                    onChange={(e) => setLibraryForm({ ...libraryForm, url: e.target.value })}
                    placeholder={libraryForm.type === "youtube" ? "مثال: https://www.youtube.com/watch?v=..." : "أدخل رابط ملف الكتاب PDF المباشر للتنزيل"}
                    className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950">الوصف التعريفي ونص المادة الفعلي:</label>
                <textarea
                  rows={4}
                  value={libraryForm.description}
                  onChange={(e) => setLibraryForm({ ...libraryForm, description: e.target.value })}
                  placeholder="تفاصيل التنويه أو الفائدة أو لمحة موجزة عن الملف..."
                  className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3 h-28"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">تاريخ الطرح والنشر الفعلي:</label>
                  <input
                    type="date"
                    required
                    value={libraryForm.date}
                    onChange={(e) => setLibraryForm({ ...libraryForm, date: e.target.value })}
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-950">غلاف مادة المكتبة (اختياري):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUploadSimulate(e, "library")}
                    className="w-full text-xs font-mono"
                  />
                  {libraryForm.coverImage && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-emerald-600 block font-bold">تم إرفاق غلاف المادة بنجاح.</p>
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 mt-1 shadow-xs bg-gray-50 flex items-center justify-center">
                        <img src={libraryForm.coverImage} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowLibraryModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs">حفظ وتعميد المادة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          MODAL 4: COMPETITION RESULT DETAILED COMPLEX PANEL RASTER
         --------------------------------------------------------------------------- */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto font-sans text-xs">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-emerald-900">
                {editingResult ? "تحوير وتحرير نتيجة مسودة المسابقة" : "رصد وسرد درجات مسابقة قرآنية متميزة جديدة"}
              </h3>
              <button onClick={() => setShowResultModal(false)} className="text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-6 text-right">
              {/* STU INFO SHOWCASE */}
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-50 flex justify-between items-center text-[11px] text-emerald-900">
                <span>اسم الطالب المنسق لتأكيد الرصد:</span>
                <span className="font-sans font-black">
                  {students.find(s => s.id === resultForm.studentId)?.name || "غير محدد"}
                </span>
              </div>

              {/* SECTION A: METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold">اسم المسابقة الكبرى الفني:</label>
                  <input
                    type="text"
                    required
                    value={resultForm.competitionName}
                    onChange={(e) => setResultForm({ ...resultForm, competitionName: e.target.value })}
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-bold">المستوى / الفرع التخصصي:</label>
                  <input
                    type="text"
                    required
                    value={resultForm.level}
                    onChange={(e) => setResultForm({ ...resultForm, level: e.target.value })}
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px]">المجموع الكلي للدرجات:</label>
                  <input
                    type="number"
                    required
                    value={resultForm.totalScore}
                    onChange={(e) => setResultForm({ ...resultForm, totalScore: Number(e.target.value) })}
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px]">النسبة المئوية الحاصلة:</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={resultForm.percentage}
                    onChange={(e) => setResultForm({ ...resultForm, percentage: Number(e.target.value) })}
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px]">ترتيبه بفرعه بالفصل:</label>
                  <input
                    type="number"
                    required
                    value={resultForm.levelRank}
                    onChange={(e) => setResultForm({ ...resultForm, levelRank: Number(e.target.value) })}
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px]">الترتيب العام بالقرية:</label>
                  <input
                    type="number"
                    required
                    value={resultForm.overallRank}
                    onChange={(e) => setResultForm({ ...resultForm, overallRank: Number(e.target.value) })}
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono"
                  />
                </div>
              </div>

              {/* ACHIEVEMENTS AND CHECKS */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 grid grid-cols-3 gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[10px]">
                  <input type="checkbox" checked={resultForm.qualified} onChange={(e) => setResultForm({ ...resultForm, qualified: e.target.checked })} />
                  <span>متأهل للتصعيد</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[10px]">
                  <input type="checkbox" checked={resultForm.certificate} onChange={(e) => setResultForm({ ...resultForm, certificate: e.target.checked })} />
                  <span>منحه شهادة تقدير</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[10px]">
                  <input type="checkbox" checked={resultForm.honor} onChange={(e) => setResultForm({ ...resultForm, honor: e.target.checked })} />
                  <span>مستحق للتكريم السنوي</span>
                </label>
              </div>

              {/* JURY FEEDBACK TEXTS */}
              <div className="space-y-1.5">
                <label className="font-bold">ثغرات وأخطاء تكررت:</label>
                <input
                  type="text"
                  value={resultForm.repeatedErrors}
                  onChange={(e) => setResultForm({ ...resultForm, repeatedErrors: e.target.value })}
                  className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                  placeholder="مثال: نسيان والتردد في متشابهات النساء والآية 24"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold">جوانب قوة وإشادة بالحلقة:</label>
                  <input
                    type="text"
                    value={resultForm.strengths}
                    onChange={(e) => setResultForm({ ...resultForm, strengths: e.target.value })}
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold">توجيهات العمل والمتابعة الساعية:</label>
                  <input
                    type="text"
                    value={resultForm.recommendations}
                    onChange={(e) => setResultForm({ ...resultForm, recommendations: e.target.value })}
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                  />
                </div>
              </div>

              {/* HONOR COMPLEX CONFIGS */}
              <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-200 space-y-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-extrabold select-none mb-2">
                  <input type="checkbox" checked={resultForm.honorDecision} onChange={(e) => setResultForm({ ...resultForm, honorDecision: e.target.checked })} />
                  <span>يستحق تكريم استثنائي من الدرجة الأولى</span>
                </label>
                
                {resultForm.honorDecision && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/50">
                    <div className="space-y-1">
                      <span className="font-bold">نوع التكريم العيني:</span>
                      <input
                        type="text"
                        value={resultForm.honorType}
                        onChange={(e) => setResultForm({ ...resultForm, honorType: e.target.value })}
                        placeholder="مثال: درع التفوق الفاخر ومصحف مجوهر ومكافأة"
                        className="w-full text-right bg-white border border-gray-200 rounded-lg p-2.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold">سبب وجدوى الجائزة:</span>
                      <input
                        type="text"
                        value={resultForm.honorReason}
                        onChange={(e) => setResultForm({ ...resultForm, honorReason: e.target.value })}
                        placeholder="مثال: الحصول على ترتيب الصدارة بتقدير مكرر"
                        className="w-full text-right bg-white border border-gray-200 rounded-lg p-2.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowResultModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs">تثبيت ورصد مجموع الدرجات كليا</button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------------------------
          MODAL 5: PARENT REPORT INPUT FORM (MODAL DESIGN)
         --------------------------------------------------------------------------- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto font-sans text-xs">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-emerald-950">
                {editingReport ? "تحرير وتحديث سجل ولي الأمر الشهري" : "تضمين وبث بطاقة المتابعة الشهرية لولي الأمر"}
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-6 text-right">
              {/* STU SHOWCASE */}
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-50 flex justify-between items-center text-[11px] text-emerald-900 font-bold">
                <span>تسميع الطالب المستهدف:</span>
                <span>
                  {students.find(s => s.id === reportForm.studentId)?.name || "غير محدد"}
                </span>
              </div>

              {/* SECTION A: BASE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold">شهر التقرير المستعلم:</label>
                  <input
                    type="text"
                    required
                    value={reportForm.month}
                    onChange={(e) => setReportForm({ ...reportForm, month: e.target.value })}
                    placeholder="مثال: يوليو 2026"
                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-bold">درجة التحسن مقارنة بالشهر السابق (نسبة مئوية %):</label>
                  <input
                    type="number"
                    required
                    value={reportForm.improvementRate}
                    onChange={(e) => setReportForm({ ...reportForm, improvementRate: Number(e.target.value) })}
                    placeholder="امتداد التثبيت الرقمي لنسبة التحسن"
                    className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono font-bold"
                  />
                </div>
              </div>

              {/* SECTION B: ATTENDANCE */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-150 text-center">
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">عدد الحصص المقررة:</span>
                  <input type="number" required value={reportForm.numClasses} onChange={(e) => setReportForm({ ...reportForm, numClasses: Number(e.target.value) })} className="w-full text-center p-2 rounded-lg bg-white border" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">مرات الحضور:</span>
                  <input type="number" required value={reportForm.numPresent} onChange={(e) => setReportForm({ ...reportForm, numPresent: Number(e.target.value) })} className="w-full text-center p-2 rounded-lg bg-white border" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">مرات الغياب:</span>
                  <input type="number" required value={reportForm.numAbsent} onChange={(e) => setReportForm({ ...reportForm, numAbsent: Number(e.target.value) })} className="w-full text-center p-2 rounded-lg bg-white border" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">مرات التأخر:</span>
                  <input type="number" required value={reportForm.numLate} onChange={(e) => setReportForm({ ...reportForm, numLate: Number(e.target.value) })} className="w-full text-center p-2 rounded-lg bg-white border" />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="font-bold text-[10px]">نسبة الالتزام (%):</span>
                  <input type="number" required value={reportForm.attendanceRate} onChange={(e) => setReportForm({ ...reportForm, attendanceRate: Number(e.target.value) })} className="w-full text-center p-2 rounded-lg bg-white border font-bold" />
                </div>
              </div>

              {/* SECTION C: MEMORIZATION DETAILS */}
              <div className="border border-emerald-100 p-4 rounded-xl space-y-4">
                <h4 className="font-serif text-xs font-bold text-emerald-950 border-b border-emerald-50 pb-1 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>تفصيل نطاقات وجدول الحفظ المنجز والماضي:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="font-bold">بداية نطاق الحفظ:</span>
                    <input type="text" value={reportForm.memorizationStart} onChange={(e) => setReportForm({ ...reportForm, memorizationStart: e.target.value })} className="w-full text-right p-2.5 rounded-lg bg-gray-50 border" placeholder="مثال: سورة يونس" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold">نهاية نطاق الحفظ:</span>
                    <input type="text" value={reportForm.memorizationEnd} onChange={(e) => setReportForm({ ...reportForm, memorizationEnd: e.target.value })} className="w-full text-right p-2.5 rounded-lg bg-gray-50 border" placeholder="سورة هود" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold">كمية الحفظ الكلي المنجز:</span>
                    <input type="text" value={reportForm.newMemorizationAmount} onChange={(e) => setReportForm({ ...reportForm, newMemorizationAmount: e.target.value })} className="w-full text-right p-2.5 rounded-lg bg-gray-50 border" placeholder="جزء ونصف" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-[10px]">عدد الصفحات المحفوظة:</span>
                    <input type="number" value={reportForm.numPages} onChange={(e) => setReportForm({ ...reportForm, numPages: Number(e.target.value) })} className="w-full text-center p-2 rounded-lg bg-gray-50 border" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-[10px]">عدد الأجزاء الحاصلة:</span>
                    <input type="number" step="0.1" value={reportForm.numParts} onChange={(e) => setReportForm({ ...reportForm, numParts: Number(e.target.value) })} className="w-full text-center p-2 rounded-lg bg-gray-50 border" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="font-bold">الحصيلة التراكمية في المراجعة:</span>
                    <input type="text" value={reportForm.reviewAmount} onChange={(e) => setReportForm({ ...reportForm, reviewAmount: e.target.value })} className="w-full text-right p-2 rounded-lg bg-gray-50 border" placeholder="5 أجزاء الأولى" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="font-bold">بدء المراجعة من:</span>
                    <input type="text" value={reportForm.reviewStart} onChange={(e) => setReportForm({ ...reportForm, reviewStart: e.target.value })} className="w-full text-right p-2 rounded-lg bg-gray-50 border" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold">نهاية المراجعة لـ:</span>
                    <input type="text" value={reportForm.reviewEnd} onChange={(e) => setReportForm({ ...reportForm, reviewEnd: e.target.value })} className="w-full text-right p-2 rounded-lg bg-gray-50 border" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold">مستوى الإتقان العام المحقق:</span>
                    <input type="text" value={reportForm.reviewMastery} onChange={(e) => setReportForm({ ...reportForm, reviewMastery: e.target.value })} className="w-full text-right p-2 rounded-lg bg-gray-50 border" placeholder="ممتاز مع التجويد" />
                  </div>
                </div>
              </div>

              {/* RATING SLIDERS */}
              <div className="bg-emerald-50/20 p-4 border rounded-xl grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">تقييم الحفظ الجديد (من 10):</span>
                  <input type="number" step="0.1" min="0" max="10" value={reportForm.memorizationRating} onChange={(e) => setReportForm({ ...reportForm, memorizationRating: Number(e.target.value) })} className="w-full text-center p-2 bg-white rounded border" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">تقييم مراجعة الماضي (من 10):</span>
                  <input type="number" step="0.1" min="0" max="10" value={reportForm.reviewRating} onChange={(e) => setReportForm({ ...reportForm, reviewRating: Number(e.target.value) })} className="w-full text-center p-2 bg-white rounded border" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">تقييم السلوك والأدب (من 10):</span>
                  <input type="number" step="0.1" min="0" max="10" value={reportForm.behaviorRating} onChange={(e) => setReportForm({ ...reportForm, behaviorRating: Number(e.target.value) })} className="w-full text-center p-2 bg-white rounded border" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[10px]">تقييم الانتباه بالمجموعة (من 10):</span>
                  <input type="number" step="0.1" min="0" max="10" value={reportForm.disciplineRating} onChange={(e) => setReportForm({ ...reportForm, disciplineRating: Number(e.target.value) })} className="w-full text-center p-2 bg-white rounded border" />
                </div>
              </div>

              {/* ANALYSIS TEXTS */}
              <div className="space-y-1.5">
                <label className="font-bold text-emerald-950">الخلاصة والبيان والتقرير النهائي المتكامل:</label>
                <textarea
                  rows={3}
                  required
                  value={reportForm.detailedSummary}
                  onChange={(e) => setReportForm({ ...reportForm, detailedSummary: e.target.value })}
                  placeholder="مستوى الطالب الكلي شهرياً وتوجيه لجنة التحفيظ..."
                  className="w-full text-right bg-gray-50 border border-gray-200 rounded-xl p-3"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold">أبرز مواطن التميز والقوة:</label>
                  <input type="text" value={reportForm.strengths} onChange={(e) => setReportForm({ ...reportForm, strengths: e.target.value })} className="w-full text-right p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold">تحديات بحاجة لمتابعة ودعم:</label>
                  <input type="text" value={reportForm.followupNeeds} onChange={(e) => setReportForm({ ...reportForm, followupNeeds: e.target.value })} className="w-full text-right p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold">عناوين وتوصيات المعلم لولي الأمر بالبيت:</label>
                  <input type="text" value={reportForm.teacherNotes} onChange={(e) => setReportForm({ ...reportForm, teacherNotes: e.target.value })} className="w-full text-right p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="مثال: يرجى متابعة موازاة السرد اليومي" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold">تطبيقات ومقترحات الموازرة العائلية:</label>
                  <input type="text" value={reportForm.parentRecommendations} onChange={(e) => setReportForm({ ...reportForm, parentRecommendations: e.target.value })} className="w-full text-right p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="تجهيز الحوافز المعنوية للأبناء" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs">تثبيت وتعميم بطاقة المتابعة</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

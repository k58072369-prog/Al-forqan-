/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import crypto from "crypto";

// Initialize SQLite database
const dbFile = path.join(process.cwd(), "al_furqan.db");
const db = new Database(dbFile);

// Enable WAL mode for performance
db.pragma("journal_mode = WAL");

// Helper function to initialize database tables
function initDB() {
  // Create admin_users table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin'
    )
  `).run();

  // Create admin_sessions table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES admin_users(id) ON DELETE CASCADE
    )
  `).run();

  // Create admin_logs table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ipAddress TEXT,
      createdAt TEXT NOT NULL
    )
  `).run();

  // Seed default admin user if none exists
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admin_users").get() as { count: number };
  if (adminCount.count === 0) {
    const saltVal = crypto.randomBytes(16).toString("hex");
    const passHash = crypto.createHash("sha256").update("admin2026" + saltVal).digest("hex");
    db.prepare(`
      INSERT INTO admin_users (username, password_hash, salt, role)
      VALUES (?, ?, ?, ?)
    `).run("admin", passHash, saltVal, "admin");
    console.log("Seeded default admin user: username 'admin', password 'admin2026' (securely hashed with salt)");
  }

  // Create Students table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      parentName TEXT NOT NULL,
      parentPhone TEXT NOT NULL,
      teacherName TEXT NOT NULL,
      groupName TEXT NOT NULL
    )
  `).run();

  // Create News table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT,
      content TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `).run();

  // Create Library table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      coverImage TEXT,
      description TEXT,
      date TEXT NOT NULL
    )
  `).run();

  // Create Competition Results table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS competition_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      competitionName TEXT NOT NULL,
      competitionDate TEXT NOT NULL,
      level TEXT NOT NULL,
      numExams INTEGER NOT NULL,
      examsJson TEXT NOT NULL, -- JSON array of ExamRecord
      totalScore REAL NOT NULL,
      percentage REAL NOT NULL,
      levelRank INTEGER NOT NULL,
      overallRank INTEGER NOT NULL,
      qualified INTEGER NOT NULL, -- 0 or 1
      certificate INTEGER NOT NULL, -- 0 or 1
      honor INTEGER NOT NULL, -- 0 or 1
      rankAchieved TEXT NOT NULL,
      levelAverageScore REAL NOT NULL,
      scoreDiff REAL NOT NULL,
      studentRank INTEGER NOT NULL,
      strengths TEXT,
      repeatedErrors TEXT,
      recommendations TEXT,
      honorDecision INTEGER NOT NULL, -- 0 or 1
      honorType TEXT,
      honorReason TEXT,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )
  `).run();

  // Create Parent Reports table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS parent_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      month TEXT NOT NULL,
      numClasses INTEGER NOT NULL,
      numPresent INTEGER NOT NULL,
      numAbsent INTEGER NOT NULL,
      numLate INTEGER NOT NULL,
      attendanceRate REAL NOT NULL,
      memorizationStart TEXT NOT NULL,
      memorizationEnd TEXT NOT NULL,
      newMemorizationAmount TEXT NOT NULL,
      numPages INTEGER NOT NULL,
      numParts REAL NOT NULL,
      reviewStart TEXT NOT NULL,
      reviewEnd TEXT NOT NULL,
      reviewAmount TEXT NOT NULL,
      reviewMastery TEXT NOT NULL,
      avgRating REAL NOT NULL,
      highestRating REAL NOT NULL,
      lowestRating REAL NOT NULL,
      memorizationRating REAL NOT NULL,
      reviewRating REAL NOT NULL,
      behaviorRating REAL NOT NULL,
      disciplineRating REAL NOT NULL,
      improvementRate REAL NOT NULL,
      strengths TEXT,
      followupNeeds TEXT,
      teacherNotes TEXT,
      parentRecommendations TEXT,
      detailedSummary TEXT,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )
  `).run();

  // Create deleted_records table for fully recoverable deletes
  db.prepare(`
    CREATE TABLE IF NOT EXISTS deleted_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tableName TEXT NOT NULL,
      originalId INTEGER NOT NULL,
      recordData TEXT NOT NULL,
      deletedAt TEXT NOT NULL,
      deletedBy TEXT NOT NULL
    )
  `).run();

  // Create website_content table for custom homepage texts
  db.prepare(`
    CREATE TABLE IF NOT EXISTS website_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `).run();

  // Create files_media table for tracking uploaded files
  db.prepare(`
    CREATE TABLE IF NOT EXISTS files_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      fileUrl TEXT NOT NULL,
      fileSize TEXT NOT NULL,
      fileType TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `).run();

  // Create competitions table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT
    )
  `).run();

  // Seed default website_content if empty
  const contentCount = db.prepare("SELECT COUNT(*) as count FROM website_content").get() as { count: number };
  if (contentCount.count === 0) {
    const insertContent = db.prepare("INSERT INTO website_content (key, value) VALUES (?, ?)");
    insertContent.run("hero_title", "مكتب الفرقان لتحفيظ القرآن الكريم");
    insertContent.run("hero_subtitle", "بكفر الباجور - منوفية");
    insertContent.run("hero_description", "صرح قرآني مبارك يقوم على غرس حب كتاب الله عز وجل في قلوب الناشئة، وبناء جيل قرآني فريد يلتزم بتعاليم الدين السمحة ومحاسن الأخلاق تلاوةً وحفظاً وتقديراً.");
    insertContent.run("about_title", "رؤيتنا ورسالتنا بالقرية المباركة");
    insertContent.run("about_content", "انطلق مكتب الفرقان بكفر الباجور ليكون منارة مضيئة للعلم الشرعي وحفظ القرآن بالقرية وما جاورها من ربوع محافظة المنوفية. نحن نؤمن بأن تحفيظ كتاب الله لابد أن يلازمه استقامة في السلوك، وتحلٍ بالأدب، وربط لولي الأمر بحلقات التعليم لتكون المتابعة متكاملة متوازية.");
    insertContent.run("sheikh_name", "فضيلة الشيخ عبد الله الديب");
    insertContent.run("sheikh_role", "المشرف العام ومعلم القراءات بالمقر");
    insertContent.run("sheikh_bio", "حاصل على إجازات متعددة في رواية حفص عن عاصم، كرس جهوده لخدمة القرآن الكريم وتحفيظ وتوجيه أجيال الناشئة بكفر الباجور بأسلوب تربوي مبسط مفعم بالأبوة والتشجيع المتبادل لجميع فئات الأطفال والمتقدمين.");
    insertContent.run("phone", "201127225409");
    insertContent.run("maps_url", "https://maps.app.goo.gl/QVBftuu6YAKMHYwQ8");
  }

  // Seed default competitions if empty
  const compCount = db.prepare("SELECT COUNT(*) as count FROM competitions").get() as { count: number };
  if (compCount.count === 0) {
    const insertComp = db.prepare("INSERT INTO competitions (name, date, level, description) VALUES (?, ?, ?, ?)");
    insertComp.run("مسابقة الفرقان الكبرى السنوية لعشرة أجزاء", "2026-05-15", "حفظ عشرة أجزاء متتالية مع التجويد", "المسابقة السنوية الكبرى التي يشارك فيها فرسان الحفظ بالمكتب لتثبيت الأجزاء العشرة الأولى.");
    insertComp.run("مسابقة براعم الإيمان لحفظ جزئين", "2026-05-15", "حفظ جزئين من القرآن الكريم", "مسابقة مخصصة للأطفال وصغار الحفاظ لتحفيزهم وتكريمهم بدرجات التميز وبمكافآت عينية.");
  }

  // Seed initial data if students is empty
  const studentCount = db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number };
  if (studentCount.count === 0) {
    console.log("Seeding initial database data...");

    // 1. Seed Students
    const insertStudent = db.prepare(`
      INSERT INTO students (code, name, parentName, parentPhone, teacherName, groupName)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const s1 = insertStudent.run("1001", "أحمد محمد علي منصور", "محمد علي منصور", "01127225409", "الشيخ عبد الله الديب", "حلقة الفجر المتميزة");
    const s2 = insertStudent.run("1002", "فاطمة عبد الرحمن حسن", "عبد الرحمن حسن", "01099887766", "الأستاذة عائشة سعيد", "حلقة الزهرات الصالحات");
    const s3 = insertStudent.run("1003", "عمر محمود الشامي", "محمود الشامي", "01233445566", "الشيخ عبد الله الديب", "حلقة فرسان القرآن");

    // 2. Seed News
    const insertNews = db.prepare(`
      INSERT INTO news (title, image, content, date)
      VALUES (?, ?, ?, ?)
    `);
    insertNews.run(
      "انطلاق مسابقة الفرقان الكبرى السنوية بكفر الباجور لعام 2026",
      null,
      "بفضل الله وتوفيقه، انطلقت تصفيات مسابقة الفرقان السنوية الكبرى بمشاركة أكثر من 150 طالباً وطالبة من مختلف الأعمار، وتشرف المسابقة بفرسان الحفظ في مستويات حفظ القرآن كاملاً، ونصف القرآن، وعشرة أجزاء، وخمسة أجزاء. نسأل الله التوفيق لأبنائنا الحفظة.",
      "2026-06-01"
    );
    insertNews.run(
      "حفل تكريم حفظة كتاب الله المتميزين لشهر مايو 2026",
      null,
      "أقام مكتب الفرقان لتحفيظ القرآن الكريم حفل التكريم الشهري لطلابه المتفوقين في فروع الحفظ والمراجعة والسلوك القويم. وشهد الحفل توزيع الجوائز النقدية وشهادات التقدير بحضور الشيخ عبد الله الديب وأولياء أمور الطلاب الكرام وسط فرحة عارمة.",
      "2026-05-28"
    );
    insertNews.run(
      "فتح باب التسجيل في الحلقات الصيفية المكثفة لقراءات التجويد والمخارج",
      null,
      "يعلن مكتب الفرقان بكفر الباجور عن فتح باب القبول والتسجيل في الحلقات الصيفية المكثفة التي تهدف إلى تمكين الطلاب من إتقان التلاوة وتصحيح مخارج الحروف بطريقة علمية مبسطة مع قراءة أجزاء كاملة تلاوةً وحفظاً. سارعوا بالتسجيل لحجز مقاعدكم.",
      "2026-06-05"
    );

    // 3. Seed Library
    const insertLibrary = db.prepare(`
      INSERT INTO library (type, title, url, coverImage, description, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // YouTube Video
    insertLibrary.run(
      "youtube",
      "ثمار المداومة على حفظ القرآن الكريم - توجيهات الشيخ عبد الله الديب",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      null,
      "تسجيل مرئي قيم يحتوي على نصائح المعلم الفاضل للطلاب وأولياء الأمور حول تنظيم الوقت للمراجعة والتسميع اليومي وتجنب التفلت.",
      "2026-06-02"
    );

    // PDF Book
    insertLibrary.run(
      "pdf",
      "كتيب الأربعون النووية بتعليقات ميسرة لحفظة مكتب الفرقان",
      "https://darpdf.org/wp-content/uploads/2021/04/الأربعون-النووية.pdf",
      null,
      "كتاب الأربعون النووية في الأحاديث الصحيحة النبوية مع شرح وتخريج يسير يناسب عقول ناشئة الحفظ بقرية كفر الباجور.",
      "2026-05-20"
    );

    // Post
    insertLibrary.run(
      "post",
      "مقال هام: كيف تتابع تفوق ولدك في حلقة القرآن الكريم بالمنزل؟",
      null,
      null,
      "إن حلقة التحفيظ تمثل نصف الطريق بينما يمثل البيت النصف الآخر والمكمل الحقيقي. ينصح مكتب الفرقان أولياء الأمور بالتالي: 1- الاستماع اليومي لنصف صفحة على الأقل، 2- تشجيع الحفظ بمكافآت عينية بسيطة، 3- توفير ركن هادئ ومناسب للتلاوة خالي من المشوشات، 4- التواصل الأسبوعي المستمر مع شيخ الحلقة لمعرفة مستوى الحفظ والتطور.",
      "2026-06-06"
    );

    // Advertisement
    insertLibrary.run(
      "announcement",
      "تنويه هام بشأن مواعيد حلقة الفجر المتميزة وحلقة فرسان القرآن",
      null,
      null,
      "نهيب بأولياء الأمور الكرام أن مواعيد الحلقة الصباحية (حلقة الفجر المتميزة) ستبدأ بمشيئة الله تعالى في تمام الساعة 5:00 صباحاً عقب صلاة الفجر مباشرة وحتى الساعة 7:30 صباحاً، بينما تبدأ حلقة فرسان القرآن العصرية في تمام الساعة 4:30 عصراً وحسب مواعيد المجموعات الموزعة سلفاً.",
      "2026-06-07"
    );

    // 4. Seed Competition Results for أحمد محمد علي (StudentId = 1, Code = 1001)
    const insertResult = db.prepare(`
      INSERT INTO competition_results (
        studentId, competitionName, competitionDate, level, numExams, examsJson,
        totalScore, percentage, levelRank, overallRank, qualified, certificate,
        honor, rankAchieved, levelAverageScore, scoreDiff, studentRank, strengths,
        repeatedErrors, recommendations, honorDecision, honorType, honorReason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const exams1 = [
      { date: "2026-05-10", memorization: "الجزء الأول والثاني", review: "سورة البقرة", grade: 98, rating: "ممتاز مرتفع" },
      { date: "2026-05-12", memorization: "الأجزاء من الثالث إلى الخامس", review: "سورتي آل عمران والنساء", grade: 96, rating: "ممتاز" },
      { date: "2026-05-14", memorization: "الأجزاء من السادس إلى العاشر", review: "سورتي المائدة والأنعام", grade: 97, rating: "ممتاز" }
    ];

    insertResult.run(
      s1.lastInsertRowid,
      "مسابقة الفرقان الكبرى السنوية لعشرة أجزاء",
      "2026-05-15",
      "حفظ عشرة أجزاء متتالية مع التجويد",
      3,
      JSON.stringify(exams1),
      291,
      97.0,
      3, // levelRank
      7, // overallRank
      1, // qualified
      1, // certificate
      1, // honor
      "المركز الثالث على مستوى كفر الباجور",
      91.5, // levelAverageScore
      5.5,  // scoreDiff (+5.5)
      3,   // studentRank
      "مخارج الحروف دقيقة للغاية، تميز واثق في أحكام الغنن والمدود، وصوت حسن يتغنى بكلمات الله في خشوع وبهاء.",
      "نسيان يسير في متشابهات نهاية سورة النساء عند الآية 24 والآية 113. وتم تدارك الخطأ في حينه.",
      "الاستمرار فوراً بالبدء في حفظ الجزء الحادي عشر فصاعداً، وتخصيص ربع ساعة يومية لمراجعته الماضي وتثبيت متشابهات الميتتين والقصص.",
      1, // honorDecision
      "درع التميز الطلابي الفاخر، مصحف الحفظ الملون برواية حفص ومكافأة مالية تشجيعية قدرها 1000 جنيه مصري",
      "حصوله على المركز الثالث بتقدير ممتاز مرتفع وإظهار خلق رفيع وإتقان متميز بالتسميع متصل الأيام"
    );

    // 5. Seed Parent Report for أحمد محمد علي (StudentId = 1)
    const insertReport = db.prepare(`
      INSERT INTO parent_reports (
        studentId, month, numClasses, numPresent, numAbsent, numLate, attendanceRate,
        memorizationStart, memorizationEnd, newMemorizationAmount, numPages, numParts,
        reviewStart, reviewEnd, reviewAmount, reviewMastery, avgRating, highestRating,
        lowestRating, memorizationRating, reviewRating, behaviorRating, disciplineRating,
        improvementRate, strengths, followupNeeds, teacherNotes, parentRecommendations, detailedSummary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run(
      s1.lastInsertRowid,
      "مايو 2026",
      12, // numClasses
      11, // numPresent
      1,  // numAbsent
      0,  // numLate
      91.6, // attendanceRate
      "الجزء الحادي عشر (الآية 1 من سورة يونس)",
      "الجزء الثاني عشر (الآية 53 من سورة هود)",
      "جزء ونصف كاملين بحمد الله تلاوة ومذاكرة",
      30, // numPages
      1.5, // numParts
      "الجزء الأول",
      "الجزء الخامس",
      "خمسة أجزاء كاملة تلاوة ومراجعة وعرض متمكن",
      "ممتاز ومستقر جداً مع إشادة وتثبيت",
      9.7, // avgRating
      10.0, // highestRating
      9.0, // lowestRating
      9.8, // memorizationRating
      9.6, // reviewRating
      10.0, // behaviorRating
      10.0, // disciplineRating
      8.0, // improvementRate
      "حفظ سريع ومتقن للأبيات والآيات، استجابة وتنفيذ فوري لتصويبات المعلم، السلوك الحسن المتواضع والتفاعل الإيجابي مع أقرانه داخل الحلقة.",
      "ثغرات خفيفة في متشابهات منتصف سورة هود، وسورة يونس عند قصة موسى عليه السلام بحاجة لإعادة العرض والتمكين المكرر.",
      "أحمد طالب نابه، ذكي ومؤدب، نرى فيه مستقبلاً واعداً لخدمة القرآن وأهله. نسأل الله أن يبارك لولي أمره فيه ويحفظه لعائلته الكريمة تليق به الألقاب.",
      "نرجو من الأهل المتابعة المنزلية المستمرة والاستماع إلى تلاوته قبل النوم لمدة 20 دقيقة، مع ترك مساحات تحفيز معنوية له في عطلة نهاية الأسبوع.",
      "حقّق الطالب أحمد قفزة نوعية في درجة إتقانه هذا الشهر مقارنةً بالأشهر السابقة، حيث حافظ على تسميع يومي قوي وتغلب على تحدي الخجل في الحلقات الجماعية. نسبة التزامه بلغت 91.6% مع تطور سلوكي ملموس نال عليه الثناء المتكرر من شيخ الحلقة ولجنتنا المشرفة."
    );

    // Seed Fatima Competition Results and Report
    const exams2 = [
      { date: "2026-05-11", memorization: "الجزء الأول", review: "الفاتحة والبقرة", grade: 99, rating: "ممتاز مرتفع" },
      { date: "2026-05-13", memorization: "الجزء الثاني", review: "سورة البقرة بالكامل", grade: 98, rating: "ممتاز مرتفع" }
    ];
    insertResult.run(
      s2.lastInsertRowid,
      "مسابقة براعم الإيمان لحفظ جزئين",
      "2026-05-15",
      "حفظ جزئين من القرآن الكريم",
      2,
      JSON.stringify(exams2),
      197,
      98.5,
      1,
      2,
      1,
      1,
      1,
      "المركز الأول مكرر على حلقة الزهرات الصالحات",
      93.2,
      5.3,
      1,
      "صوت ملائكي عذب في التلاوة، تركيز قوي في الحفظ، تمكن كبير من قواعد السكت والترتيل الميسر للأطفال.",
      "تردد قليل جداً عند الانتقال من سورة آل عمران للبقرة، تم معالجتها بالتمكين الثنائي السريع.",
      "البدء في حفظ الجزء الثالث والمحافظة على الورد الممنهج بمعدل صفحة يومية على الأقل.",
      1,
      "شهادة تفوق مذهبة، مصحف مبطن بالقطيفة الزرقاء، ودمية وهدية علمية ذات قيمة تعليمية متميزة",
      "حصولها على المركز الأول مكرر بامتياز وجدارة خلقية عالية ونشاط مثالي في الحلقة"
    );

    insertReport.run(
      s2.lastInsertRowid,
      "مايو 2026",
      12,
      12,
      0,
      0,
      100.0,
      "الجزء الثالث (سورة آل عمران)",
      "الجزء الثالث (نصف سورة آل عمران)",
      "نصف جزء تلاوة وحفظ راسخ",
      10,
      0.5,
      "الجزء الأول",
      "الجزء الثاني",
      "كامل جزأين البداية",
      "ممتاز مع درجة السرد المتواصل",
      9.9,
      10.0,
      9.5,
      9.9,
      9.8,
      10.0,
      10.0,
      10.0,
      "حضور مثالي بنسبة 100% دون أي غياب أو تأخير، حرص دائم ومبكر، وتلاوة ملائكية هادئة تبعث في الحلقة السكينة والطمأنينة.",
      "تثبيت ضبط متشابهات بدايات الأرباع في الربع الثاني من البقرة.",
      "فاطمة نموذج يحتذى به لكل الفتيات في سنها، رعاية وإشراف المعلمة يبشر بحافظة ذات بصمة ممتازة. بوركت عائلتها المصونة.",
      "الاستمرار بتشجيعها على القراءة بالتجويد أمام الكبار لتعزيز ثقتها بنفسها والحرص على قراءة وردها في صلواتها المعتادة.",
      "حققت ابنتنا فاطمة تفوقاً تاماً ومستقراً طيلة الشهر الفضيل، والتزمت بجميع تلاواتها اليومية المنهجية وحققت نسبة حضور كاملة 100% مما جعلها نجمة الشهر المتكامل للحلقة وسجلت تقديرات ممتازة مكررة ونالت الثناء العاطر من الهيئة المشرفة."
    );
  }
}

initDB();

// Initialize Express App
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enable CORS/headers for local preview if needed
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Provide a static folder for public uploaded assets if any
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
// Serve files uploaded from client securely
app.use("/uploads", express.static(publicDir));

// Serve generated images from src/assets too so they are fully available to APIs if needed
app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));

// -----------------------------------------------------------------------------
// SECURE ADMINISTRATIVE SESSION MANAGEMENT & AUDIT LOGGING MODULE
// -----------------------------------------------------------------------------

// Retrieve user linked with auth token
function getSessionUser(req: express.Request): { username: string; userId: number; role: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const session = db.prepare(`
      SELECT s.*, u.username, u.role
      FROM admin_sessions s
      JOIN admin_users u ON s.userId = u.id
      WHERE s.token = ? AND s.expiresAt > ?
    `).get(token, new Date().toISOString()) as { userId: number; username: string; role: string } | undefined;

    if (!session) return null;
    return { username: session.username, userId: session.userId, role: session.role };
  } catch (error) {
    return null;
  }
}

// Middleware to protect routes against unauthenticated access
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "غير مصرح بالوصول، يرجى تسجيل الدخول للوحة الإدارة أولاً" });
  }
  (req as any).adminUser = user;
  next();
}

// Write to admin audit trails log
function logAdminAction(username: string, action: string, details: string, req: express.Request) {
  try {
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
    const stmt = db.prepare(`
      INSERT INTO admin_logs (username, action, details, ipAddress, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(username, action, details, ipAddress, new Date().toISOString());
  } catch (err) {
    console.error("خطأ أثناء تسجيل العمليات الإدارية:", err);
  }
}

// --- Auth Routes ---
app.post("/api/admin/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور حقول مطلوبة" });
    }

    const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username) as { id: number; username: string; password_hash: string; salt: string; role: string } | undefined;
    
    if (!user) {
      logAdminAction(username, "محاولة تسجيل دخول فاشلة", `اسم مستخدم غير موجود: ${username}`, req);
      return res.status(401).json({ error: "خطأ في اسم المستخدم أو كلمة المرور" });
    }

    const calculatedHash = crypto.createHash("sha256").update(password + user.salt).digest("hex");
    if (calculatedHash !== user.password_hash) {
      logAdminAction(username, "محاولة تسجيل دخول فاشلة", `كلمة مرور خاطئة للحساب: ${username}`, req);
      return res.status(401).json({ error: "خطأ في اسم المستخدم أو كلمة المرور" });
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours session duration

    db.prepare(`
      INSERT INTO admin_sessions (token, userId, createdAt, expiresAt)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, new Date().toISOString(), expiresAt);

    logAdminAction(username, "تسجيل الدخول", "تم تسجيل الدخول بنجاح للوحة الإدارة", req);

    res.json({
      success: true,
      token,
      username: user.username,
      role: user.role
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/logout", (req, res) => {
  try {
    const user = getSessionUser(req);
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
    }
    if (user) {
      logAdminAction(user.username, "تسجيل الخروج", "تم تسجيل الخروج بنجاح وإنهاء الجلسة الآمنة", req);
    }
    res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/check-session", (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ isAuthenticated: false });
  }
  res.json({ isAuthenticated: true, username: user.username, role: user.role });
});

app.get("/api/admin/logs", requireAdmin, (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM admin_logs ORDER BY id DESC LIMIT 500");
    res.json(stmt.all());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------------------
// REST API ENDPOINTS
// -----------------------------------------------------------------------------

// 1. STUDENTS API
app.get("/api/students", requireAdmin, (req, res) => {
  try {
    const search = req.query.search as string || "";
    let stmt;
    if (search) {
      stmt = db.prepare(`
        SELECT * FROM students 
        WHERE name LIKE ? OR code LIKE ? OR parentName LIKE ?
        ORDER BY id DESC
      `);
      const results = stmt.all(`%${search}%`, `%${search}%`, `%${search}%`);
      res.json(results);
    } else {
      stmt = db.prepare("SELECT * FROM students ORDER BY id DESC");
      res.json(stmt.all());
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/students", requireAdmin, (req, res) => {
  try {
    const { code, name, parentName, parentPhone, teacherName, groupName } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: "كود الطالب والاسم حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      INSERT INTO students (code, name, parentName, parentPhone, teacherName, groupName)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(code, name, parentName || "", parentPhone || "", teacherName || "", groupName || "");
    
    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "إضافة طالب جديد", `تم تسجيل الطالب الجديد: ${name} بكود متابعة: ${code}`, req);

    res.json({ id: info.lastInsertRowid, code, name, parentName, parentPhone, teacherName, groupName });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "كود الطالب مسجل مسبقاً، يرجى كتابة كود فريد" });
    }
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/students/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, parentName, parentPhone, teacherName, groupName } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: "كود الطالب والاسم حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      UPDATE students 
      SET code = ?, name = ?, parentName = ?, parentPhone = ?, teacherName = ?, groupName = ?
      WHERE id = ?
    `);
    const result = stmt.run(code, name, parentName || "", parentPhone || "", teacherName || "", groupName || "", id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "لم يتم العثور على الطالب" });
    }

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "تحديث معلومات طالب", `تم تعديل ملف الطالب: ${name} كود: ${code}`, req);

    res.json({ id: Number(id), code, name, parentName, parentPhone, teacherName, groupName });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "كود الطالب مسجل مسبقاً، يرجى كتابة كود فريد" });
    }
    res.status(500).json({ error: error.message });
  }
});

function archiveDeletedRecord(tableName: string, originalId: number, recordObj: any, deletedBy: string) {
  try {
    const stmt = db.prepare(`
      INSERT INTO deleted_records (tableName, originalId, recordData, deletedAt, deletedBy)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(tableName, originalId, JSON.stringify(recordObj), new Date().toISOString(), deletedBy);
  } catch (err) {
    console.error("Failed to archive deleted record:", err);
  }
}

app.delete("/api/students/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as any;
    if (!student) {
      return res.status(404).json({ error: "الطالب غير موجود" });
    }
    const studentDesc = `${student.name} (كود: ${student.code})`;

    // Archive student
    archiveDeletedRecord("students", Number(id), student, adminUser.username);

    // Find and archive all cascaded result records
    const resultsList = db.prepare("SELECT * FROM competition_results WHERE studentId = ?").all(id) as any[];
    for (const resItem of resultsList) {
      archiveDeletedRecord("competition_results", resItem.id, resItem, adminUser.username);
    }

    // Find and archive all cascaded report records
    const reportsList = db.prepare("SELECT * FROM parent_reports WHERE studentId = ?").all(id) as any[];
    for (const repItem of reportsList) {
      archiveDeletedRecord("parent_reports", repItem.id, repItem, adminUser.username);
    }

    // Execute physical cascade delete
    db.prepare("DELETE FROM competition_results WHERE studentId = ?").run(id);
    db.prepare("DELETE FROM parent_reports WHERE studentId = ?").run(id);
    db.prepare("DELETE FROM students WHERE id = ?").run(id);

    logAdminAction(adminUser.username, "حذف كود طالب", `تم مسح أرشفة ملف الطالب ${studentDesc} وكافة اختباراته وتقاريره بنجاح بسلة المحذوفات للتأمين ومعدل الاسترداد المباشر`, req);

    res.json({ success: true, message: "تم حذف الطالب وأرشفة سجلاته بنجاح بسلة المحذوفات" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 2. NEWS API
app.get("/api/news", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM news ORDER BY date DESC, id DESC");
    res.json(stmt.all());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/news", requireAdmin, (req, res) => {
  try {
    const { title, image, content, date } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "العنوان وتفاصيل الخبر حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      INSERT INTO news (title, image, content, date)
      VALUES (?, ?, ?, ?)
    `);
    const defaultDate = date || new Date().toISOString().split("T")[0];
    const info = stmt.run(title, image || null, content, defaultDate);

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "إضافة خبر جديد", `تم نشر خبر جديد بعنوان: ${title}`, req);

    res.json({ id: info.lastInsertRowid, title, image, content, date: defaultDate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/news/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, content, date } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "العنوان وتفاصيل الخبر حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      UPDATE news 
      SET title = ?, image = ?, content = ?, date = ?
      WHERE id = ?
    `);
    const info = stmt.run(title, image || null, content, date, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "الخبر غير موجود" });
    }

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "تعديل خبر بالموقع", `تم تعديل وتحديث بيانات الخبر: ${title}`, req);

    res.json({ id: Number(id), title, image, content, date });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/news/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    const newsItem = db.prepare("SELECT * FROM news WHERE id = ?").get(id) as any;
    if (!newsItem) {
      return res.status(404).json({ error: "الخبر غير موجود" });
    }

    // Archive first
    archiveDeletedRecord("news", Number(id), newsItem, adminUser.username);

    db.prepare("DELETE FROM news WHERE id = ?").run(id);

    logAdminAction(adminUser.username, "حذف خبر بالموقع", `تم أرشفة وحذف الخبر: ${newsItem.title} بسلة المحذوفات`, req);

    res.json({ success: true, message: "تم أرشفة وحذف الخبر بنجاح بسلة المحذوفات" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 3. LIBRARY API
app.get("/api/library", (req, res) => {
  try {
    const { type } = req.query;
    let stmt;
    if (type) {
      stmt = db.prepare("SELECT * FROM library WHERE type = ? ORDER BY id DESC");
      res.json(stmt.all(type));
    } else {
      stmt = db.prepare("SELECT * FROM library ORDER BY id DESC");
      res.json(stmt.all());
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/library", requireAdmin, (req, res) => {
  try {
    const { type, title, url, coverImage, description, date } = req.body;
    if (!type || !title) {
      return res.status(400).json({ error: "العنوان والنوع حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      INSERT INTO library (type, title, url, coverImage, description, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const defaultDate = date || new Date().toISOString().split("T")[0];
    const info = stmt.run(type, title, url || null, coverImage || null, description || null, defaultDate);

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "إضافة مادة للمكتبة", `تم طرح مادة جديدة بالمكتبة بعنوان: ${title} [النوع: ${type}]`, req);

    res.json({ id: info.lastInsertRowid, type, title, url, coverImage, description, date: defaultDate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/library/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, url, coverImage, description, date } = req.body;
    if (!type || !title) {
      return res.status(400).json({ error: "العنوان والنوع حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      UPDATE library 
      SET type = ?, title = ?, url = ?, coverImage = ?, description = ?, date = ?
      WHERE id = ?
    `);
    const info = stmt.run(type, title, url || null, coverImage || null, description || null, date, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "المحتوى غير موجود" });
    }

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "تعديل مادة بالمكتبة", `تم تحديث المادة العلمية: ${title} [النوع: ${type}]`, req);

    res.json({ id: Number(id), type, title, url, coverImage, description, date });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/library/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    const libItem = db.prepare("SELECT * FROM library WHERE id = ?").get(id) as any;
    if (!libItem) {
      return res.status(404).json({ error: "المحتوى غير موجود" });
    }
    const libTitle = `${libItem.title} [${libItem.type}]`;

    // Archive first
    archiveDeletedRecord("library", Number(id), libItem, adminUser.username);

    db.prepare("DELETE FROM library WHERE id = ?").run(id);

    logAdminAction(adminUser.username, "حذف مادة من المكتبة", `تم أرشفة وحذف مادة المكتبة: ${libTitle} بسلة المحذوفات`, req);

    res.json({ success: true, message: "تم أرشفة وحذف مادة المكتبة بنجاح بسلة المحذوفات" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 4. COMPETITION RESULTS API (SEARCH BY STUDENT CODE OR GET ALL)
app.get("/api/results", (req, res) => {
  try {
    const { studentCode } = req.query;
    if (studentCode) {
      const stmt = db.prepare(`
        SELECT r.*, s.name as studentName, s.code as studentCode, s.groupName, s.teacherName
        FROM competition_results r
        JOIN students s ON r.studentId = s.id
        WHERE s.code = ?
        ORDER BY r.id DESC
      `);
      const results = stmt.all(studentCode);
      // Map JSON exams text back to array
      const mapped = results.map((item: any) => ({
        ...item,
        exams: JSON.parse(item.examsJson),
        qualified: !!item.qualified,
        certificate: !!item.certificate,
        honor: !!item.honor,
        honorDecision: !!item.honorDecision,
      }));
      return res.json(mapped);
    } else {
      // Admin only listing
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({ error: "غير مصرح، يرجى تسجيل الدخول للوحة التحكم أولاً" });
      }

      const stmt = db.prepare(`
        SELECT r.*, s.name as studentName, s.code as studentCode, s.groupName
        FROM competition_results r
        JOIN students s ON r.studentId = s.id
        ORDER BY r.id DESC
      `);
      const results = stmt.all();
      const mapped = results.map((item: any) => ({
        ...item,
        exams: JSON.parse(item.examsJson),
        qualified: !!item.qualified,
        certificate: !!item.certificate,
        honor: !!item.honor,
        honorDecision: !!item.honorDecision,
      }));
      return res.json(mapped);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/results", requireAdmin, (req, res) => {
  try {
    const {
      studentId, competitionName, competitionDate, level, numExams, exams,
      totalScore, percentage, levelRank, overallRank, qualified, certificate,
      honor, rankAchieved, levelAverageScore, scoreDiff, studentRank, strengths,
      repeatedErrors, recommendations, honorDecision, honorType, honorReason
    } = req.body;

    if (!studentId || !competitionName || !level) {
      return res.status(400).json({ error: "اسم المسابقة، الطالب، والمستوى حقول مطلوبة" });
    }

    const stmt = db.prepare(`
      INSERT INTO competition_results (
        studentId, competitionName, competitionDate, level, numExams, examsJson,
        totalScore, percentage, levelRank, overallRank, qualified, certificate,
        honor, rankAchieved, levelAverageScore, scoreDiff, studentRank, strengths,
        repeatedErrors, recommendations, honorDecision, honorType, honorReason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      studentId,
      competitionName,
      competitionDate || new Date().toISOString().split("T")[0],
      level,
      numExams || 0,
      JSON.stringify(exams || []),
      totalScore || 0,
      percentage || 0,
      levelRank || 0,
      overallRank || 0,
      qualified ? 1 : 0,
      certificate ? 1 : 0,
      honor ? 1 : 0,
      rankAchieved || "",
      levelAverageScore || 0,
      scoreDiff || 0,
      studentRank || 0,
      strengths || "",
      repeatedErrors || "",
      recommendations || "",
      honorDecision ? 1 : 0,
      honorType || "",
      honorReason || ""
    );

    const student = db.prepare("SELECT name FROM students WHERE id = ?").get(studentId) as { name: string } | undefined;
    const studentName = student ? student.name : `معرف: ${studentId}`;
    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "رصد نتيجة مسابقة", `تم تسجيل نتيجة مسابقة (${competitionName}) للطالب: ${studentName}`, req);

    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/results/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId, competitionName, competitionDate, level, numExams, exams,
      totalScore, percentage, levelRank, overallRank, qualified, certificate,
      honor, rankAchieved, levelAverageScore, scoreDiff, studentRank, strengths,
      repeatedErrors, recommendations, honorDecision, honorType, honorReason
    } = req.body;

    if (!studentId || !competitionName || !level) {
      return res.status(400).json({ error: "بيانات الإدخال ناقصة" });
    }

    const stmt = db.prepare(`
      UPDATE competition_results
      SET studentId = ?, competitionName = ?, competitionDate = ?, level = ?, numExams = ?, examsJson = ?,
          totalScore = ?, percentage = ?, levelRank = ?, overallRank = ?, qualified = ?, certificate = ?,
          honor = ?, rankAchieved = ?, levelAverageScore = ?, scoreDiff = ?, studentRank = ?, strengths = ?,
          repeatedErrors = ?, recommendations = ?, honorDecision = ?, honorType = ?, honorReason = ?
      WHERE id = ?
    `);

    const info = stmt.run(
      studentId,
      competitionName,
      competitionDate || new Date().toISOString().split("T")[0],
      level,
      numExams || 0,
      JSON.stringify(exams || []),
      totalScore || 0,
      percentage || 0,
      levelRank || 0,
      overallRank || 0,
      qualified ? 1 : 0,
      certificate ? 1 : 0,
      honor ? 1 : 0,
      rankAchieved || "",
      levelAverageScore || 0,
      scoreDiff || 0,
      studentRank || 0,
      strengths || "",
      repeatedErrors || "",
      recommendations || "",
      honorDecision ? 1 : 0,
      honorType || "",
      honorReason || "",
      id
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: "السجل غير موجود" });
    }

    const student = db.prepare("SELECT name FROM students WHERE id = ?").get(studentId) as { name: string } | undefined;
    const studentName = student ? student.name : `معرف: ${studentId}`;
    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "تحديث نتيجة مسابقة", `تم تعديل وتحديث نتيجة مسابقة (${competitionName}) للطالب: ${studentName}`, req);

    res.json({ id: Number(id), ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/results/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    const resultItem = db.prepare("SELECT * FROM competition_results WHERE id = ?").get(id) as any;
    if (!resultItem) {
      return res.status(404).json({ error: "السجل غير موجود" });
    }

    // Archive first
    archiveDeletedRecord("competition_results", Number(id), resultItem, adminUser.username);

    db.prepare("DELETE FROM competition_results WHERE id = ?").run(id);

    logAdminAction(adminUser.username, "حذف نتيجة مسابقة", `تم أرشفة وحذف نتيجة المسابقة رقم (#${id}) بسلة المحذوفات`, req);

    res.json({ success: true, message: "تم أرشفة وحذف نتيجة المسابقة بنجاح بسلة المحذوفات" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 5. PARENT REPORTS API (SEARCH BY STUDENT CODE OR GET ALL)
app.get("/api/reports", (req, res) => {
  try {
    const { studentCode } = req.query;
    if (studentCode) {
      const stmt = db.prepare(`
        SELECT r.*, s.name as studentName, s.code as studentCode, s.parentName, s.parentPhone, s.teacherName, s.groupName
        FROM parent_reports r
        JOIN students s ON r.studentId = s.id
        WHERE s.code = ?
        ORDER BY r.id DESC
      `);
      const results = stmt.all(studentCode);
      return res.json(results);
    } else {
      // Admin only access
      const user = getSessionUser(req);
      if (!user) {
        return res.status(401).json({ error: "غير مصرح، يرجى تسجيل الدخول أولاً" });
      }

      const stmt = db.prepare(`
        SELECT r.*, s.name as studentName, s.code as studentCode, s.parentName, s.groupName
        FROM parent_reports r
        JOIN students s ON r.studentId = s.id
        ORDER BY r.id DESC
      `);
      const results = stmt.all();
      return res.json(results);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reports", requireAdmin, (req, res) => {
  try {
    const {
      studentId, month, numClasses, numPresent, numAbsent, numLate, attendanceRate,
      memorizationStart, memorizationEnd, newMemorizationAmount, numPages, numParts,
      reviewStart, reviewEnd, reviewAmount, reviewMastery, avgRating, highestRating,
      lowestRating, memorizationRating, reviewRating, behaviorRating, disciplineRating,
      improvementRate, strengths, followupNeeds, teacherNotes, parentRecommendations, detailedSummary
    } = req.body;

    if (!studentId || !month) {
      return res.status(400).json({ error: "الطالب والشهر مطلوبان" });
    }

    const stmt = db.prepare(`
      INSERT INTO parent_reports (
        studentId, month, numClasses, numPresent, numAbsent, numLate, attendanceRate,
        memorizationStart, memorizationEnd, newMemorizationAmount, numPages, numParts,
        reviewStart, reviewEnd, reviewAmount, reviewMastery, avgRating, highestRating,
        lowestRating, memorizationRating, reviewRating, behaviorRating, disciplineRating,
        improvementRate, strengths, followupNeeds, teacherNotes, parentRecommendations, detailedSummary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      studentId, month, numClasses || 0, numPresent || 0, numAbsent || 0, numLate || 0, attendanceRate || 0,
      memorizationStart || "", memorizationEnd || "", newMemorizationAmount || "", numPages || 0, numParts || 0,
      reviewStart || "", reviewEnd || "", reviewAmount || "", reviewMastery || "", avgRating || 0, highestRating || 0,
      lowestRating || 0, memorizationRating || 0, reviewRating || 0, behaviorRating || 0, disciplineRating || 0,
      improvementRate || 0, strengths || "", followupNeeds || "", teacherNotes || "", parentRecommendations || "", detailedSummary || ""
    );

    const student = db.prepare("SELECT name FROM students WHERE id = ?").get(studentId) as { name: string } | undefined;
    const studentName = student ? student.name : `معرف: ${studentId}`;
    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "إصدار تقرير شهري", `تم إصدار بطاقة متابعة شهرية لشهر (${month}) للطالب: ${studentName}`, req);

    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/reports/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId, month, numClasses, numPresent, numAbsent, numLate, attendanceRate,
      memorizationStart, memorizationEnd, newMemorizationAmount, numPages, numParts,
      reviewStart, reviewEnd, reviewAmount, reviewMastery, avgRating, highestRating,
      lowestRating, memorizationRating, reviewRating, behaviorRating, disciplineRating,
      improvementRate, strengths, followupNeeds, teacherNotes, parentRecommendations, detailedSummary
    } = req.body;

    if (!studentId || !month) {
      return res.status(400).json({ error: "الطالب والشهر حقول مطلوبة" });
    }

    const stmt = db.prepare(`
      UPDATE parent_reports
      SET studentId = ?, month = ?, numClasses = ?, numPresent = ?, numAbsent = ?, numLate = ?, attendanceRate = ?,
          memorizationStart = ?, memorizationEnd = ?, newMemorizationAmount = ?, numPages = ?, numParts = ?,
          reviewStart = ?, reviewEnd = ?, reviewAmount = ?, reviewMastery = ?, avgRating = ?, highestRating = ?,
          lowestRating = ?, memorizationRating = ?, reviewRating = ?, behaviorRating = ?, disciplineRating = ?,
          improvementRate = ?, strengths = ?, followupNeeds = ?, teacherNotes = ?, parentRecommendations = ?, detailedSummary = ?
      WHERE id = ?
    `);

    const info = stmt.run(
      studentId, month, numClasses || 0, numPresent || 0, numAbsent || 0, numLate || 0, attendanceRate || 0,
      memorizationStart || "", memorizationEnd || "", newMemorizationAmount || "", numPages || 0, numParts || 0,
      reviewStart || "", reviewEnd || "", reviewAmount || "", reviewMastery || "", avgRating || 0, highestRating || 0,
      lowestRating || 0, memorizationRating || 0, reviewRating || 0, behaviorRating || 0, disciplineRating || 0,
      improvementRate || 0, strengths || "", followupNeeds || "", teacherNotes || "", parentRecommendations || "", detailedSummary || "",
      id
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: "التقرير غير موجود" });
    }

    const student = db.prepare("SELECT name FROM students WHERE id = ?").get(studentId) as { name: string } | undefined;
    const studentName = student ? student.name : `معرف: ${studentId}`;
    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "تحديث تقرير شهري", `تم تحديث المراجعة الشهرية لبطاقة (${month}) للطالب: ${studentName}`, req);

    res.json({ id: Number(id), ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/reports/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    const reportItem = db.prepare("SELECT * FROM parent_reports WHERE id = ?").get(id) as any;
    if (!reportItem) {
      return res.status(404).json({ error: "التقرير غير موجود" });
    }

    // Archive first
    archiveDeletedRecord("parent_reports", Number(id), reportItem, adminUser.username);

    db.prepare("DELETE FROM parent_reports WHERE id = ?").run(id);

    logAdminAction(adminUser.username, "حذف تقرير شهري", `تم أرشفة وحذف بطاقة التقرير الشهري رقم (#${id}) بسلة المحذوفات`, req);

    res.json({ success: true, message: "تم أرشفة وحذف تقرير ولي الأمر بنجاح بسلة المحذوفات" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------------------
// NEW WEB CONTENT, COMPETITIONS, FILES/MEDIA, AND RECOVERY APIS
// -----------------------------------------------------------------------------

// 1. Recoverable Deleted Records APIs
app.get("/api/admin/deleted-records", requireAdmin, (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM deleted_records ORDER BY id DESC");
    res.json(stmt.all());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/deleted-records/:id/restore", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const archived = db.prepare("SELECT * FROM deleted_records WHERE id = ?").get(id) as any;
    if (!archived) {
      return res.status(404).json({ error: "السجل المحذوف غير موجود لمعدلات الاسترداد" });
    }
    const data = JSON.parse(archived.recordData);
    const tableName = archived.tableName;

    if (tableName === "students") {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO students (id, code, name, parentName, parentPhone, teacherName, groupName)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(data.id, data.code, data.name, data.parentName || "", data.parentPhone || "", data.teacherName || "", data.groupName || "");
    } else if (tableName === "news") {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO news (id, title, image, content, date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(data.id, data.title, data.image || null, data.content, data.date);
    } else if (tableName === "library") {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO library (id, type, title, url, coverImage, description, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(data.id, data.type, data.title, data.url || null, data.coverImage || null, data.description || null, data.date);
    } else if (tableName === "competition_results") {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO competition_results (
          id, studentId, competitionName, competitionDate, level, numExams, examsJson,
          totalScore, percentage, levelRank, overallRank, qualified, certificate,
          honor, rankAchieved, levelAverageScore, scoreDiff, studentRank, strengths,
          repeatedErrors, recommendations, honorDecision, honorType, honorReason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        data.id, data.studentId, data.competitionName, data.competitionDate, data.level, data.numExams,
        data.examsJson || JSON.stringify(data.exams || []), data.totalScore, data.percentage, data.levelRank, data.overallRank,
        data.qualified ? 1 : 0, data.certificate ? 1 : 0, data.honor ? 1 : 0, data.rankAchieved,
        data.levelAverageScore, data.scoreDiff, data.studentRank, data.strengths || "",
        data.repeatedErrors || "", data.recommendations || "", data.honorDecision ? 1 : 0,
        data.honorType || "", data.honorReason || ""
      );
    } else if (tableName === "parent_reports") {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO parent_reports (
          id, studentId, month, numClasses, numPresent, numAbsent, numLate, attendanceRate,
          memorizationStart, memorizationEnd, newMemorizationAmount, numPages, numParts,
          reviewStart, reviewEnd, reviewAmount, reviewMastery, avgRating, highestRating,
          lowestRating, memorizationRating, reviewRating, behaviorRating, disciplineRating,
          improvementRate, strengths, followupNeeds, teacherNotes, parentRecommendations, detailedSummary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        data.id, data.studentId, data.month, data.numClasses, data.numPresent, data.numAbsent, data.numLate, data.attendanceRate,
        data.memorizationStart || "", data.memorizationEnd || "", data.newMemorizationAmount || "", data.numPages, data.numParts,
        data.reviewStart || "", data.reviewEnd || "", data.reviewAmount || "", data.reviewMastery || "", data.avgRating, data.highestRating,
        data.lowestRating, data.memorizationRating, data.reviewRating, data.behaviorRating, data.disciplineRating,
        data.improvementRate, data.strengths || "", data.followupNeeds || "", data.teacherNotes || "", data.parentRecommendations || "", data.detailedSummary || ""
      );
    } else if (tableName === "files_media") {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO files_media (id, filename, fileUrl, fileSize, fileType, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(data.id, data.filename, data.fileUrl, data.fileSize, data.fileType, data.createdAt);
    } else if (tableName === "competitions") {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO competitions (id, name, date, level, description)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(data.id, data.name, data.date, data.level, data.description || "");
    } else {
      return res.status(400).json({ error: "شريحة الجدول التخصصية غير مدرجة بالاسترجاع الآلي" });
    }

    db.prepare("DELETE FROM deleted_records WHERE id = ?").run(id);

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "استعادة سجل محذوف", `تم استرجاع السجل من جدول (${tableName}) بالمعرف (#${data.id}) والمحتوى: ${data.name || data.title || data.competitionName || data.month}`, req);

    res.json({ success: true, message: "تم استعادة السجل بنجاح وإعادته للجدول الرئيسي" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/deleted-records/:id/purge", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const archived = db.prepare("SELECT * FROM deleted_records WHERE id = ?").get(id) as any;
    if (!archived) {
      return res.status(404).json({ error: "السجل المحذوف غير موجود" });
    }
    db.prepare("DELETE FROM deleted_records WHERE id = ?").run(id);

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "إتلاف سجل نهائياً", `تم تصفية وإتلاف السجل المحذوف رقم #${id} من سلة المحذوفات نهائياً`, req);

    res.json({ success: true, message: "تم تصفية السجل نهائياً بنجاح" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 2. Website Content APIs
app.get("/api/website-content", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM website_content").all() as any[];
    const contentMap: Record<string, string> = {};
    for (const row of rows) {
      contentMap[row.key] = row.value;
    }
    res.json(contentMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/website-content", requireAdmin, (req, res) => {
  try {
    const { content } = req.body; // Map of key -> value
    if (!content || typeof content !== "object") {
      return res.status(400).json({ error: "تنسيق البيانات المطلوب غير صحيح" });
    }

    const stmt = db.prepare(`
      INSERT INTO website_content (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, val] of Object.entries(content)) {
      stmt.run(key, String(val));
    }

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "تحديث محتوى الموقع", "تم تعديل بعض نصوص ومحتويات صفحات الموقع العامة آلياً من لوحة الإدارة", req);

    res.json({ success: true, message: "تم تحديث محتويات الموقع بنجاح" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 3. Relational Competitions APIs
app.get("/api/competitions", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM competitions ORDER BY date DESC, id DESC").all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/competitions", requireAdmin, (req, res) => {
  try {
    const { name, date, level, description } = req.body;
    if (!name || !level) {
      return res.status(400).json({ error: "اسم المسابقة والمستوى حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      INSERT INTO competitions (name, date, level, description)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(name, date || new Date().toISOString().split("T")[0], level, description || "");

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "إنشاء مسابقة", `تم فتح ملف مسابقة جديدة بعنوان: ${name}`, req);

    res.json({ id: info.lastInsertRowid, name, date, level, description });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/competitions/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, level, description } = req.body;
    if (!name || !level) {
      return res.status(400).json({ error: "اسم المسابقة والمستوى حقول مطلوبة" });
    }
    const stmt = db.prepare(`
      UPDATE competitions
      SET name = ?, date = ?, level = ?, description = ?
      WHERE id = ?
    `);
    const info = stmt.run(name, date, level, description || "", id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "المسابقة غير موجودة" });
    }

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "تحديث مسابقة", `تم تحديث تفاصيل مسابقة: ${name}`, req);

    res.json({ id: Number(id), name, date, level, description });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/competitions/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    const compObj = db.prepare("SELECT * FROM competitions WHERE id = ?").get(id) as any;
    if (!compObj) {
      return res.status(404).json({ error: "المسابقة غير موجودة" });
    }

    // Archive first
    archiveDeletedRecord("competitions", Number(id), compObj, adminUser.username);

    db.prepare("DELETE FROM competitions WHERE id = ?").run(id);

    logAdminAction(adminUser.username, "حذف مسابقة", `تم أرشفة وحذف ملف مسابقة: ${compObj.name} وحفظها في سلة المحذوفات للتأمين`, req);

    res.json({ success: true, message: "تم حذف المسابقة بنجاح وأرشفة ملفها بسلة المحذوفات" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 4. Custom Files and Media Tracker APIs
app.get("/api/files-media", requireAdmin, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM files_media ORDER BY id DESC").all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/files-media/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;

    const fileObj = db.prepare("SELECT * FROM files_media WHERE id = ?").get(id) as any;
    if (!fileObj) {
      return res.status(404).json({ error: "السجل الرقمي للملف غير موجود" });
    }

    // Archive record
    archiveDeletedRecord("files_media", Number(id), fileObj, adminUser.username);

    // Delete database entry
    db.prepare("DELETE FROM files_media WHERE id = ?").run(id);

    // Delete local physical file if exists
    const localPath = path.join(publicDir, path.basename(fileObj.fileUrl));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    logAdminAction(adminUser.username, "إزالة ملف ميديا", `تم إزالة وسيط ملفي الرقمي: ${fileObj.filename} وتصنيع حذفه نهائياً من الذاكرة اللفظية والقرص المحلي`, req);

    res.json({ success: true, message: "تم إزالة الملف الرقمي بنجاح" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Custom photo uploading handler (saves base64 directly and registers in files_media)
app.post("/api/upload", requireAdmin, (req, res) => {
  try {
    const { base64, filename } = req.body;
    if (!base64) {
      return res.status(400).json({ error: "الملف مفقود" });
    }
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    
    const uniqueFilename = `${Date.now()}-${filename || "file.png"}`;
    const filePath = path.join(publicDir, uniqueFilename);
    const urlPath = `/uploads/${uniqueFilename}`;
    
    fs.writeFileSync(filePath, buffer);

    const fileSizeInBytes = buffer.length;
    let fileSizeStr = "";
    if (fileSizeInBytes < 1024 * 1024) {
      fileSizeStr = `${(fileSizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      fileSizeStr = `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    // Insert into files_media tracking list
    db.prepare(`
      INSERT INTO files_media (filename, fileUrl, fileSize, fileType, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(filename || "image.png", urlPath, fileSizeStr, "صورة / وسائط", new Date().toISOString());

    const adminUser = (req as any).adminUser;
    logAdminAction(adminUser.username, "رفع صورة ووسائط", `تم رفع ملف جديد باسم: ${filename || "صورة"} برابط: ${urlPath}`, req);

    res.json({ url: urlPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// -----------------------------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite loading in Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Express serving static production files from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the Express + Vite backend server:", err);
});

/**
 * Calculate average marks for a single student.
 * 
 * @param {Object} student - Student object with marks
 * @param {number} student.math - Math marks
 * @param {number} student.biology - Biology marks
 * @param {number} student.physics - Physics marks
 * @returns {number} Average marks rounded to 2 decimal places
 * 
 * @example
 * const student = { name: "Alice", math: 85, biology: 90, physics: 88 };
 * const avg = calculateStudentAverage(student);
 * // Returns: 87.67
 */
export const calculateStudentAverage = (student) => {
  if (!student) return 0;
  
  const math = parseFloat(student.math) || 0;
  const biology = parseFloat(student.biology) || 0;
  const physics = parseFloat(student.physics) || 0;
  
  const sum = math + biology + physics;
  const average = sum / 3;
  
  return parseFloat(average.toFixed(2));
};

/**
 * Calculate class average from all students.
 * 
 * @param {Array<Object>} students - Array of student objects
 * @param {string} students[].name - Student name
 * @param {number} students[].math - Math marks
 * @param {number} students[].biology - Biology marks
 * @param {number} students[].physics - Physics marks
 * @returns {number} Class average marks rounded to 2 decimal places
 * 
 * @example
 * const students = [
 *   { name: "Alice", math: 85, biology: 90, physics: 88 },
 *   { name: "Bob", math: 75, biology: 80, physics: 82 },
 *   { name: "Charlie", math: 90, biology: 95, physics: 92 }
 * ];
 * const classAvg = calculateClassAverage(students);
 * // Returns: 86.78
 */
export const calculateClassAverage = (students) => {
  if (!students || students.length === 0) return 0;
  
  // Calculate average for each student
  const studentAverages = students.map(student => 
    calculateStudentAverage(student)
  );
  
  // Calculate mean of all student averages
  const totalSum = studentAverages.reduce((sum, avg) => sum + avg, 0);
  const classAverage = totalSum / studentAverages.length;
  
  return parseFloat(classAverage.toFixed(2));
};

/**
 * Calculate subject-wise class averages.
 * 
 * @param {Array<Object>} students - Array of student objects
 * @param {string} students[].name - Student name
 * @param {number} students[].math - Math marks
 * @param {number} students[].biology - Biology marks
 * @param {number} students[].physics - Physics marks
 * @returns {Object} Object with subject averages
 * @returns {number} return.math - Math class average
 * @returns {number} return.biology - Biology class average
 * @returns {number} return.physics - Physics class average
 * 
 * @example
 * const students = [
 *   { name: "Alice", math: 85, biology: 90, physics: 88 },
 *   { name: "Bob", math: 75, biology: 80, physics: 82 }
 * ];
 * const subjectAvgs = calculateSubjectAverages(students);
 * // Returns: { math: 80, biology: 85, physics: 85 }
 */
export const calculateSubjectAverages = (students) => {
  if (!students || students.length === 0) {
    return { math: 0, biology: 0, physics: 0 };
  }
  
  const mathSum = students.reduce((sum, s) => sum + (parseFloat(s.math) || 0), 0);
  const biologySum = students.reduce((sum, s) => sum + (parseFloat(s.biology) || 0), 0);
  const physicsSum = students.reduce((sum, s) => sum + (parseFloat(s.physics) || 0), 0);
  
  const count = students.length;
  
  return {
    math: parseFloat((mathSum / count).toFixed(2)),
    biology: parseFloat((biologySum / count).toFixed(2)),
    physics: parseFloat((physicsSum / count).toFixed(2))
  };
};

/**
 * Compare student average with class average.
 * Determine if student is above, at, or below class average.
 * 
 * @param {Object} student - Student object
 * @param {number} classAverage - Class average marks
 * @returns {Object} Comparison result
 * @returns {number} return.studentAverage - Student's average marks
 * @returns {number} return.classAverage - Class average marks
 * @returns {string} return.status - "above", "below", or "at" class average
 * @returns {number} return.difference - Difference from class average (positive if above)
 * 
 * @example
 * const student = { name: "Alice", math: 85, biology: 90, physics: 88 };
 * const result = compareStudentWithClass(student, 75);
 * // Returns: { studentAverage: 87.67, classAverage: 75, status: "above", difference: 12.67 }
 */
export const compareStudentWithClass = (student, classAverage) => {
  const studentAverage = calculateStudentAverage(student);
  const difference = parseFloat((studentAverage - classAverage).toFixed(2));
  
  let status = "at";
  if (difference > 0.01) {
    status = "above";
  } else if (difference < -0.01) {
    status = "below";
  }
  
  return {
    studentAverage,
    classAverage,
    status,
    difference
  };
};

/**
 * Generate subject-wise performance insights by comparing student marks with class averages.
 * Categorizes subjects into strengths (above average) and areas for improvement (below average).
 * 
 * @param {Object} student - Student object with subject marks
 * @param {string} student.name - Student name
 * @param {number} student.math - Math marks
 * @param {number} student.biology - Biology marks
 * @param {number} student.physics - Physics marks
 * @param {Object} subjectAverages - Class averages by subject
 * @param {number} subjectAverages.math - Math class average
 * @param {number} subjectAverages.biology - Biology class average
 * @param {number} subjectAverages.physics - Physics class average
 * @returns {Object} Categorized performance insights
 * @returns {Array<Object>} return.strengths - Subjects where student is above average
 * @returns {string} return.strengths[].subject - Subject name
 * @returns {number} return.strengths[].studentScore - Student's marks in this subject
 * @returns {number} return.strengths[].classAverage - Class average for this subject
 * @returns {number} return.strengths[].difference - How much above average
 * @returns {string} return.strengths[].insight - Descriptive insight message
 * @returns {Array<Object>} return.improvements - Subjects where student is below average
 * @returns {string} return.improvements[].subject - Subject name
 * @returns {number} return.improvements[].studentScore - Student's marks in this subject
 * @returns {number} return.improvements[].classAverage - Class average for this subject
 * @returns {number} return.improvements[].difference - How much below average
 * @returns {string} return.improvements[].insight - Descriptive insight message
 * 
 * @example
 * const student = { name: "Alice", math: 85, biology: 90, physics: 78 };
 * const subjectAvgs = { math: 80, biology: 85, physics: 82 };
 * const insights = generateSubjectInsights(student, subjectAvgs);
 * // Returns:
 * // {
 * //   strengths: [
 * //     { subject: "Math", studentScore: 85, classAverage: 80, difference: 5, insight: "Math: 85 is above class average (80)" },
 * //     { subject: "Biology", studentScore: 90, classAverage: 85, difference: 5, insight: "Biology: 90 is above class average (85)" }
 * //   ],
 * //   improvements: [
 * //     { subject: "Physics", studentScore: 78, classAverage: 82, difference: -4, insight: "Physics: 78 is below class average (82)" }
 * //   ]
 * // }
 */
export const generateSubjectInsights = (student, subjectAverages) => {
  if (!student || !subjectAverages) {
    return { strengths: [], improvements: [] };
  }

  const subjects = {
    math: { score: parseFloat(student.math) || 0, classAvg: subjectAverages.math || 0 },
    biology: { score: parseFloat(student.biology) || 0, classAvg: subjectAverages.biology || 0 },
    physics: { score: parseFloat(student.physics) || 0, classAvg: subjectAverages.physics || 0 }
  };

  const strengths = [];
  const improvements = [];

  // Iterate through each subject and categorize
  Object.entries(subjects).forEach(([subjectName, data]) => {
    const { score, classAvg } = data;
    const difference = parseFloat((score - classAvg).toFixed(2));
    const subjectLabel = subjectName.charAt(0).toUpperCase() + subjectName.slice(1); // Capitalize

    const insightObj = {
      subject: subjectLabel,
      studentScore: score,
      classAverage: classAvg,
      difference: difference,
      insight: `${subjectLabel}: ${score} is ${score > classAvg ? "above" : score < classAvg ? "below" : "at"} class average (${classAvg})`
    };

    if (score > classAvg) {
      strengths.push(insightObj);
    } else if (score < classAvg) {
      improvements.push(insightObj);
    }
    // If score === classAvg, it's neither strength nor improvement
  });

  return {
    strengths,
    improvements
  };
};

/**
 * Generate ranked list of students sorted by average score in descending order.
 * 
 * @param {Array<Object>} students - Array of student objects
 * @param {string} students[].name - Student name
 * @param {number} students[].math - Math marks
 * @param {number} students[].biology - Biology marks
 * @param {number} students[].physics - Physics marks
 * @returns {Array<Object>} Students sorted by average score (highest to lowest)
 * @returns {string} return[].name - Student name
 * @returns {number} return[].average - Student average score
 * @returns {number} return[].rank - 1-based rank position
 * 
 * @example
 * const students = [
 *   { name: "Alice", math: 85, biology: 90, physics: 88 },
 *   { name: "Bob", math: 75, biology: 80, physics: 82 },
 *   { name: "Charlie", math: 90, biology: 95, physics: 92 }
 * ];
 * const ranked = generateRankedStudents(students);
 * // Returns:
 * // [
 * //   { name: "Charlie", average: 92.33, rank: 1 },
 * //   { name: "Alice", average: 87.67, rank: 2 },
 * //   { name: "Bob", average: 79, rank: 3 }
 * // ]
 */
export const generateRankedStudents = (students) => {
  if (!students || students.length === 0) return [];

  // Create array with student name, average, and original data
  const studentScores = students.map(student => ({
    name: student.name,
    average: calculateStudentAverage(student),
    originalStudent: student
  }));

  // Sort by average in descending order
  studentScores.sort((a, b) => b.average - a.average);

  // Add rank (1-indexed)
  return studentScores.map((student, index) => ({
    name: student.name,
    average: student.average,
    rank: index + 1
  }));
};

/**
 * Extract top 3 performers from student list.
 * 
 * @param {Array<Object>} students - Array of student objects
 * @param {string} students[].name - Student name
 * @param {number} students[].math - Math marks
 * @param {number} students[].biology - Biology marks
 * @param {number} students[].physics - Physics marks
 * @returns {Array<Object>} Top 3 students (or fewer if list is smaller)
 * @returns {string} return[].name - Student name
 * @returns {number} return[].average - Student average score
 * @returns {number} return[].rank - Rank position (1, 2, or 3)
 * 
 * @example
 * const students = [
 *   { name: "Alice", math: 85, biology: 90, physics: 88 },
 *   { name: "Bob", math: 75, biology: 80, physics: 82 },
 *   { name: "Charlie", math: 90, biology: 95, physics: 92 }
 * ];
 * const topThree = getTopThreePerformers(students);
 * // Returns top 3 ranked students
 */
export const getTopThreePerformers = (students) => {
  if (!students || students.length === 0) return [];

  const ranked = generateRankedStudents(students);
  return ranked.slice(0, 3);
};

/**
 * Count how many students scored below the class average.
 * 
 * @param {Array<Object>} students - Array of student objects
 * @param {string} students[].name - Student name
 * @param {number} students[].math - Math marks
 * @param {number} students[].biology - Biology marks
 * @param {number} students[].physics - Physics marks
 * @param {number} classAverage - Class average score to compare against
 * @returns {number} Count of students below class average
 * 
 * @example
 * const students = [
 *   { name: "Alice", math: 85, biology: 90, physics: 88 },
 *   { name: "Bob", math: 75, biology: 80, physics: 82 },
 *   { name: "Charlie", math: 90, biology: 95, physics: 92 }
 * ];
 * const belowAvgCount = countStudentsBelowAverage(students, 85);
 * // Returns: 1 (Bob is below 85)
 */
export const countStudentsBelowAverage = (students, classAverage) => {
  if (!students || students.length === 0) return 0;

  return students.filter(student => 
    calculateStudentAverage(student) < classAverage
  ).length;
};

/**
 * Generate comprehensive admin analytics for a class.
 * Combines ranking, top performers, class average, and below-average count.
 * 
 * @param {Array<Object>} students - Array of student objects
 * @param {string} students[].name - Student name
 * @param {number} students[].math - Math marks
 * @param {number} students[].biology - Biology marks
 * @param {number} students[].physics - Physics marks
 * @returns {Object} Comprehensive admin analytics
 * @returns {Array<Object>} return.rankedStudents - All students ranked by average
 * @returns {string} return.rankedStudents[].name - Student name
 * @returns {number} return.rankedStudents[].average - Student average
 * @returns {number} return.rankedStudents[].rank - Rank position
 * @returns {Array<Object>} return.topThree - Top 3 performers
 * @returns {string} return.topThree[].name - Student name
 * @returns {number} return.topThree[].average - Student average
 * @returns {number} return.topThree[].rank - Rank position
 * @returns {number} return.classAverage - Class average score
 * @returns {number} return.belowAverageCount - Number of students below class average
 * @returns {number} return.totalStudents - Total number of students
 * 
 * @example
 * const students = [
 *   { name: "Alice", math: 85, biology: 90, physics: 88 },
 *   { name: "Bob", math: 75, biology: 80, physics: 82 },
 *   { name: "Charlie", math: 90, biology: 95, physics: 92 }
 * ];
 * const analytics = generateAdminAnalytics(students);
 * // Returns:
 * // {
 * //   rankedStudents: [...],
 * //   topThree: [...],
 * //   classAverage: 86.33,
 * //   belowAverageCount: 1,
 * //   totalStudents: 3
 * // }
 */
export const generateAdminAnalytics = (students) => {
  if (!students || students.length === 0) {
    return {
      rankedStudents: [],
      topThree: [],
      classAverage: 0,
      belowAverageCount: 0,
      totalStudents: 0
    };
  }

  const rankedStudents = generateRankedStudents(students);
  const classAverage = calculateClassAverage(students);
  const topThree = getTopThreePerformers(students);
  const belowAverageCount = countStudentsBelowAverage(students, classAverage);
  const totalStudents = students.length;

  return {
    rankedStudents,
    topThree,
    classAverage,
    belowAverageCount,
    totalStudents
  };
};

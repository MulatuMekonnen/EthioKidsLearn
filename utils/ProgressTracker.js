import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import { PDFDocument, rgb } from 'react-native-pdf-lib';

class ProgressTracker {
  async updateProgress(userId, childId, data) {
    try {
      const progressRef = doc(db, 'progress', `${userId}_${childId}`);
      await setDoc(progressRef, {
        ...data,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  async recordQuizScore(userId, childId, quizId, score) {
    try {
      const progressRef = doc(db, 'progress', `${userId}_${childId}`);
      await updateDoc(progressRef, {
        [`quizScores.${quizId}`]: score,
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error recording quiz score:', error);
      return false;
    }
  }

  async markLessonComplete(userId, childId, lessonId) {
    try {
      const progressRef = doc(db, 'progress', `${userId}_${childId}`);
      await updateDoc(progressRef, {
        completedLessons: firebase.firestore.FieldValue.arrayUnion(lessonId),
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      return false;
    }
  }

  async getChildProgress(childId) {
    try {
      const progressQuery = query(
        collection(db, 'progress'),
        where('childId', '==', childId)
      );
      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting child progress:', error);
      return [];
    }
  }

  async generateProgressReport(childId, startDate, endDate) {
    try {
      // Get progress data
      const progress = await this.getChildProgress(childId);
      
      // Filter data by date range
      const filteredProgress = progress.filter(p => {
        const date = p.lastUpdated.toDate();
        return date >= startDate && date <= endDate;
      });

      // Calculate statistics
      const stats = this.calculateStats(filteredProgress);

      // Generate PDF report
      const pdfPath = await this.createPDFReport(stats, childId, startDate, endDate);
      
      return pdfPath;
    } catch (error) {
      console.error('Error generating progress report:', error);
      return null;
    }
  }

  calculateStats(progress) {
    const stats = {
      totalQuizzes: 0,
      averageScore: 0,
      completedLessons: 0,
      weakAreas: [],
      strongAreas: [],
    };

    // Calculate quiz statistics
    if (progress.length > 0) {
      const quizScores = Object.values(progress[0].quizScores || {});
      stats.totalQuizzes = quizScores.length;
      stats.averageScore = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;

      // Analyze subject performance
      const subjectScores = {};
      progress.forEach(p => {
        if (p.subject && p.score) {
          if (!subjectScores[p.subject]) {
            subjectScores[p.subject] = [];
          }
          subjectScores[p.subject].push(p.score);
        }
      });

      // Identify strong and weak areas
      Object.entries(subjectScores).forEach(([subject, scores]) => {
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (average >= 80) {
          stats.strongAreas.push(subject);
        } else if (average <= 60) {
          stats.weakAreas.push(subject);
        }
      });
    }

    return stats;
  }

  async createPDFReport(stats, childId, startDate, endDate) {
    try {
      const pdfPath = `${FileSystem.documentDirectory}reports/progress_${childId}_${startDate.getTime()}.pdf`;
      
      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}reports/`,
        { intermediates: true }
      );

      // Create PDF
      const page = PDFDocument.create()
        .addPage()
        .setFont('Helvetica');

      // Add content to PDF
      page.drawText('Progress Report', {
        x: 50,
        y: 800,
        color: rgb(0, 0, 0),
      });

      // Add statistics
      const yPositions = [750, 700, 650, 600, 550];
      const content = [
        `Total Quizzes: ${stats.totalQuizzes}`,
        `Average Score: ${stats.averageScore.toFixed(2)}%`,
        `Completed Lessons: ${stats.completedLessons}`,
        `Strong Areas: ${stats.strongAreas.join(', ')}`,
        `Areas for Improvement: ${stats.weakAreas.join(', ')}`,
      ];

      content.forEach((text, index) => {
        page.drawText(text, {
          x: 50,
          y: yPositions[index],
          color: rgb(0, 0, 0),
        });
      });

      // Save PDF
      await PDFDocument.write(pdfPath);
      return pdfPath;
    } catch (error) {
      console.error('Error creating PDF report:', error);
      return null;
    }
  }
}

export default new ProgressTracker(); 
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

export default function StudentReports() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [reportText, setReportText] = useState('');
  const [scoreValue, setScoreValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [previousReports, setPreviousReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const subjects = [
    { id: 'math', name: 'Math', color: '#2196F3' },
    { id: 'english', name: 'English', color: '#4CAF50' },
    { id: 'amharic', name: 'Amharic', color: '#FF9800' },
    { id: 'oromo', name: 'Oromo', color: '#9C27B0' }
  ];

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      let childrenData = [];
      
      // First try to load from Firebase if user is authenticated
      if (user) {
        // Try to fetch children directly from the 'children' collection if it exists
        try {
          const childrenCollectionRef = collection(db, 'children');
          const childrenSnapshot = await getDocs(childrenCollectionRef);
          
          if (!childrenSnapshot.empty) {
            childrenData = childrenSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
        } catch (error) {
          console.log('No direct children collection, trying other methods');
        }
        
        // If no children found yet, try users with role 'child'
        if (childrenData.length === 0) {
          const childrenQuery = query(
            collection(db, 'users'),
            where('role', '==', 'child')
          );
          
          const childrenSnapshot = await getDocs(childrenQuery);
          
          if (!childrenSnapshot.empty) {
            childrenData = childrenSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
        }
        
        // If still no children, scan parent's children subcollections
        if (childrenData.length === 0) {
          const parentsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'parent')
          );
          
          const parentsSnapshot = await getDocs(parentsQuery);
          
          if (!parentsSnapshot.empty) {
            let allChildren = [];
            
            // For each parent, get their children
            for (const parentDoc of parentsSnapshot.docs) {
              const parentId = parentDoc.id;
              const parentData = parentDoc.data();
              const childrenCollectionRef = collection(db, `users/${parentId}/children`);
              const childrenDocs = await getDocs(childrenCollectionRef);
              
              if (!childrenDocs.empty) {
                const parentChildren = childrenDocs.docs.map(doc => ({
                  id: doc.id,
                  parentId: parentId,
                  parentName: parentData.displayName || parentData.email || 'Parent',
                  ...doc.data()
                }));
                
                allChildren = [...allChildren, ...parentChildren];
              }
            }
            
            if (allChildren.length > 0) {
              childrenData = allChildren;
            }
          }
        }
      }
      
      // If no children found in Firebase or not authenticated, fallback to AsyncStorage
      if (childrenData.length === 0) {
        const childrenJson = await AsyncStorage.getItem('children');
        if (childrenJson) {
          childrenData = JSON.parse(childrenJson);
        }
      }
      
      // Filter out any entries that don't have a name or are incomplete
      childrenData = childrenData.filter(child => 
        child && child.name && child.name.trim() !== ''
      );
      
      // Sort by name for better display
      childrenData.sort((a, b) => a.name.localeCompare(b.name));
      
      setStudents(childrenData);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
      
      // Final fallback - try AsyncStorage
      try {
        const childrenJson = await AsyncStorage.getItem('children');
        if (childrenJson) {
          const childrenData = JSON.parse(childrenJson);
          // Filter out unknown students
          const filteredChildren = childrenData.filter(child => 
            child && child.name && child.name.trim() !== ''
          );
          setStudents(filteredChildren);
        } else {
          setStudents([]);
        }
      } catch (e) {
        console.error('AsyncStorage fallback failed:', e);
        setStudents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousReports = async (student) => {
    if (!student || !user) return;
    
    setLoadingReports(true);
    try {
      // Query reports for this student with the indexed query
      const reportsQuery = query(
        collection(db, 'reports'),
        where('childId', '==', student.id),
        where('teacherId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(20) // Add limit for better performance
      );
      
      const reportsSnapshot = await getDocs(reportsQuery);
      
      if (!reportsSnapshot.empty) {
        const reports = reportsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
        }));
        
        setPreviousReports(reports);
        
        // Also cache these reports locally for offline access
        try {
          const cachedReportsKey = `reports_${student.id}_${user.uid}`;
          await AsyncStorage.setItem(cachedReportsKey, JSON.stringify(reports));
        } catch (cacheError) {
          console.log('Failed to cache reports locally:', cacheError);
        }
      } else {
        // Try to get cached reports if no online results
        try {
          const cachedReportsKey = `reports_${student.id}_${user.uid}`;
          const cachedReports = await AsyncStorage.getItem(cachedReportsKey);
          
          if (cachedReports) {
            setPreviousReports(JSON.parse(cachedReports));
          } else {
            setPreviousReports([]);
          }
        } catch (cacheError) {
          console.log('Failed to get cached reports:', cacheError);
          setPreviousReports([]);
        }
      }
    } catch (error) {
      console.error('Error loading previous reports:', error);
      
      // Fallback to cached data if online query fails
      try {
        const cachedReportsKey = `reports_${student.id}_${user.uid}`;
        const cachedReports = await AsyncStorage.getItem(cachedReportsKey);
        
        if (cachedReports) {
          setPreviousReports(JSON.parse(cachedReports));
        } else {
          setPreviousReports([]);
        }
      } catch (cacheError) {
        console.log('Failed to get cached reports in error fallback:', cacheError);
        setPreviousReports([]);
      }
    } finally {
      setLoadingReports(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setReportText('');
    setScoreValue('');
    loadPreviousReports(student);
    setModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedStudent || !selectedSubject) {
      Alert.alert('Error', 'Please select a student and subject');
      return;
    }

    if (!reportText.trim()) {
      Alert.alert('Error', 'Please enter a report');
      return;
    }

    // Validate score if provided
    let scoreNumber = null;
    if (scoreValue.trim()) {
      scoreNumber = parseInt(scoreValue.trim(), 10);
      if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 100) {
        Alert.alert('Error', 'Score must be a number between 0 and 100');
        return;
      }
    }

    try {
      setLoading(true);

      const reportData = {
        childId: selectedStudent.id,
        parentId: selectedStudent.parentId || null,
        teacherId: user?.uid,
        teacherName: user?.displayName || user?.email || 'Teacher',
        quizType: selectedSubject,
        subjectName: subjects.find(s => s.id === selectedSubject)?.name || selectedSubject,
        report: reportText.trim(),
        score: scoreNumber,
        timestamp: serverTimestamp()
      };

      // Add report to Firebase
      if (user) {
        await addDoc(collection(db, 'reports'), reportData);
      }

      // Also store in AsyncStorage for offline access
      const reportsJson = await AsyncStorage.getItem('teacherReports');
      let reports = reportsJson ? JSON.parse(reportsJson) : {};

      // Initialize subject and child if they don't exist
      if (!reports[selectedSubject]) {
        reports[selectedSubject] = {};
      }
      if (!reports[selectedSubject][selectedStudent.id]) {
        reports[selectedSubject][selectedStudent.id] = [];
      }

      // Add new report with local timestamp
      reports[selectedSubject][selectedStudent.id].push({
        ...reportData,
        id: Date.now().toString(), // Temporary ID for AsyncStorage
        timestamp: new Date().toISOString()
      });

      await AsyncStorage.setItem('teacherReports', JSON.stringify(reports));

      Alert.alert('Success', 'Report submitted successfully');
      setModalVisible(false);
      setReportText('');
      setScoreValue('');
      
      // Refresh the previous reports list
      await loadPreviousReports(selectedStudent);
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const renderSubjectTab = (subject) => (
    <TouchableOpacity
      key={subject.id}
      style={[
        styles.tab,
        selectedSubject === subject.id && { borderBottomColor: subject.color, borderBottomWidth: 3 }
      ]}
      onPress={() => setSelectedSubject(subject.id)}
    >
      <Text
        style={[
          styles.tabText,
          { color: selectedSubject === subject.id ? subject.color : currentTheme?.textSecondary || '#666' }
        ]}
      >
        {subject.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading && students.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#F5F5F5' }]}>
        <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Reports</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme?.primary || '#2196F3'} />
          <Text style={[styles.loadingText, { color: currentTheme?.textSecondary || '#666' }]}>
            Loading students...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#F5F5F5' }]}>
      <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Reports</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadStudents}>
          <Ionicons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: currentTheme?.text || '#333' }]}>
          Select a Student to Create Report
        </Text>

        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color={currentTheme?.textSecondary || '#666'} />
            <Text style={[styles.emptyText, { color: currentTheme?.text || '#333' }]}>
              No students found
            </Text>
            <Text style={[styles.emptySubtext, { color: currentTheme?.textSecondary || '#666' }]}>
              There are no students available for reporting
            </Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.studentCard, { 
                  backgroundColor: currentTheme?.card || '#FFF',
                  borderColor: currentTheme?.border || '#E0E0E0' 
                }]}
                onPress={() => handleStudentSelect(item)}
              >
                <View style={[styles.studentAvatar, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.studentInitial}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={[styles.studentName, { color: currentTheme?.text || '#333' }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                    Age: {item.age || 'N/A'} • Level: {item.level || 'N/A'}
                  </Text>
                  {item.parentName && (
                    <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                      Parent: {item.parentName}
                    </Text>
                  )}
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={currentTheme?.textSecondary || '#666'} 
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.studentList}
          />
        )}
      </View>

      {/* Report Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme?.card || '#FFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme?.text || '#333' }]}>
                Create Report for {selectedStudent?.name || 'Student'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme?.text || '#333'} />
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              {subjects.map(subject => renderSubjectTab(subject))}
            </View>

            <View style={styles.formContainer}>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreLabel, { color: currentTheme?.text || '#333' }]}>
                  Score (Optional):
                </Text>
                <TextInput
                  style={[styles.scoreInput, { 
                    borderColor: currentTheme?.border || '#E0E0E0',
                    color: currentTheme?.text || '#333'
                  }]}
                  value={scoreValue}
                  onChangeText={setScoreValue}
                  placeholder="0-100"
                  placeholderTextColor={currentTheme?.textSecondary || '#666'}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <Text style={[styles.inputLabel, { color: currentTheme?.text || '#333' }]}>
                Progress Report:
              </Text>
              <TextInput
                style={[styles.reportInput, { 
                  borderColor: currentTheme?.border || '#E0E0E0',
                  color: currentTheme?.text || '#333',
                  backgroundColor: currentTheme?.background || '#F5F5F5'
                }]}
                value={reportText}
                onChangeText={setReportText}
                placeholder="Provide detailed feedback about the student's progress in this subject..."
                placeholderTextColor={currentTheme?.textSecondary || '#666'}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: currentTheme?.primary || '#2196F3' }]}
                onPress={handleSubmitReport}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Previous Reports Section */}
            <View style={styles.previousReportsContainer}>
              <Text style={[styles.previousReportsTitle, { color: currentTheme?.text || '#333' }]}>
                Previous Reports
              </Text>
              
              {loadingReports ? (
                <ActivityIndicator size="small" color={currentTheme?.primary || '#2196F3'} />
              ) : previousReports.length === 0 ? (
                <Text style={[styles.noReportsText, { color: currentTheme?.textSecondary || '#666' }]}>
                  No previous reports found
                </Text>
              ) : (
                <FlatList
                  data={previousReports.filter(report => report.quizType === selectedSubject)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={[styles.reportCard, { borderColor: currentTheme?.border || '#E0E0E0' }]}>
                      <View style={styles.reportCardHeader}>
                        <Text style={[styles.reportDate, { color: currentTheme?.textSecondary || '#666' }]}>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                        {item.score !== null && item.score !== undefined && (
                          <View style={[styles.scoreChip, { backgroundColor: getScoreColor(item.score) }]}>
                            <Text style={styles.scoreChipText}>{item.score}%</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.previousReportText, { color: currentTheme?.text || '#333' }]}>
                        {item.report}
                      </Text>
                    </View>
                  )}
                  contentContainerStyle={styles.reportsList}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getScoreColor = (score) => {
  if (score >= 90) return '#4CAF50'; // Green
  if (score >= 75) return '#2196F3'; // Blue
  if (score >= 60) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  studentList: {
    paddingBottom: 20,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    padding: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  scoreInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  reportInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previousReportsContainer: {
    padding: 16,
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  previousReportsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noReportsText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reportsList: {
    paddingBottom: 8,
  },
  reportCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
  },
  scoreChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  scoreChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  previousReportText: {
    fontSize: 14,
  },
}); 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import ProgressTracker from '../utils/ProgressTracker';
import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';

const ProgressDisplay = ({ childId, userId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [childId]);

  const loadProgress = async () => {
    const childProgress = await ProgressTracker.getChildProgress(childId);
    setProgress(childProgress[0] || null);
    setLoading(false);
  };

  const generateReport = async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Last 30 days

    const reportPath = await ProgressTracker.generateProgressReport(
      childId,
      startDate,
      endDate
    );

    if (reportPath) {
      try {
        await Share.share({
          url: reportPath,
          title: 'Progress Report',
        });
      } catch (error) {
        console.error('Error sharing report:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading progress...</Text>
      </View>
    );
  }

  if (!progress) {
    return (
      <View style={styles.container}>
        <Text>No progress data available</Text>
      </View>
    );
  }

  const quizScores = Object.values(progress.quizScores || {});
  const averageScore = quizScores.length
    ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
    : 0;

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: quizScores.slice(-4) // Last 4 scores
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Overall Progress" />
        <Card.Content>
          <Text style={styles.stat}>
            Average Score: {averageScore.toFixed(1)}%
          </Text>
          <Text style={styles.stat}>
            Completed Lessons: {(progress.completedLessons || []).length}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Recent Performance" />
        <Card.Content>
          {quizScores.length > 0 ? (
            <LineChart
              data={chartData}
              width={300}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text>No quiz data available</Text>
          )}
        </Card.Content>
      </Card>

      <TouchableOpacity
        style={styles.button}
        onPress={generateReport}
      >
        <Text style={styles.buttonText}>Generate Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  stat: {
    fontSize: 16,
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressDisplay; 
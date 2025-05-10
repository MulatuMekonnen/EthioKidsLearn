# Firestore Setup Guide for EthioKidsLearn

This guide explains how to set up and deploy Firestore indexes and security rules for the EthioKidsLearn app. Proper indexes are essential for efficient querying of student reports and progress data.

## Firestore Indexes

The app requires several composite indexes to efficiently load student reports and progress data. These indexes are defined in the `firestore.indexes.json` file.

### Current Indexes

1. **Student Reports Index**
   - Collection: `reports`
   - Fields:
     - `childId` (ascending)
     - `teacherId` (ascending)
     - `timestamp` (descending)

2. **Reports by Quiz Type**
   - Collection: `reports`
   - Fields:
     - `childId` (ascending)
     - `quizType` (ascending) 
     - `timestamp` (descending)

3. **All Reports by Type**
   - Collection: `reports`
   - Fields:
     - `quizType` (ascending)
     - `timestamp` (descending)

## Deploying Indexes

Before deploying indexes, make sure you have:
1. Firebase CLI installed (`npm install -g firebase-tools`)
2. Logged in to Firebase (`firebase login`)
3. Firebase project configured (`firebase use --add`)

To deploy the indexes, run:

```bash
npm run deploy-indexes
```

This command deploys all indexes defined in `firestore.indexes.json`.

To deploy security rules, run:

```bash
npm run deploy-rules
```

## Data Loading Optimization

The app uses the following strategies to optimize data loading:

1. **Indexed Queries**: Uses proper Firestore indexes for efficient queries
2. **Data Caching**: Caches results in AsyncStorage to reduce Firebase reads
3. **Batch Loading**: Loads data for specific students rather than querying entire collections
4. **Query Limits**: Uses `limit()` to prevent loading too much data
5. **Fallback Mechanisms**: Falls back to cached data when offline or when queries fail

## Troubleshooting

If you experience slow data loading or missing data:

1. **Clear Cache**: Use the clear cache button in the Student Progress screen
2. **Check Indexes**: Ensure indexes are properly deployed with `firebase firestore:indexes`
3. **Check Network**: Make sure the device has an internet connection
4. **Firebase Console**: Check Firestore in the Firebase console to ensure data exists
5. **Deploy Rules**: Make sure security rules are properly deployed

## Common Issues

1. **"Missing index" errors**: If you see these in logs, deploy your indexes
2. **Slow queries**: May indicate missing indexes or large data volumes
3. **"Permission denied" errors**: Check security rules in `firestore.rules`

## Security Rules

The app's security rules are defined in `firestore.rules`. These rules ensure that:

1. Only authenticated users can read and write to reports
2. Teachers can only update their own reports
3. Quiz results can be accessed by appropriate users

For any questions, contact the development team. 
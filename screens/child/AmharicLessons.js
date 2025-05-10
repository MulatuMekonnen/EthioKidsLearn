const AmharicLessons = () => {
  const amharicTopics = [
    {
      id: 1,
      title: 'ፊደላት',
      icon: 'text-outline',
      screen: 'AmharicAlphabets',
      color: '#4CAF50',
      description: 'የአማርኛ ፊደላትን በጥሩ ሁኔታ ይማሩ'
    },
    {
      id: 7,
      title: 'የአማርኛ ይዘቶች',
      icon: 'library-outline',
      screen: 'ContentsScreen',
      color: '#9C27B0',
      description: 'ከመምህራን የተጽፉ የተጽዕኖ ያላቸውን የአማርኛ ይዘቶች ይመልከቱ እና ያውሉ',
      params: { category: 'amharic' }
    }
  ];

  const renderAmharicTopic = (topic) => {
    return (
      <TouchableOpacity
        key={topic.id}
        style={[
          styles.topicCard, 
          { 
            backgroundColor: cardBackground,
            shadowColor: isDarkMode ? '#000000' : '#000000',
            shadowOpacity: isDarkMode ? 0.5 : 0.1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderWidth: isDarkMode ? 1 : 0,
          }
        ]}
        onPress={() => navigation.navigate(topic.screen, topic.params || { childId, childName })}
        activeOpacity={0.7}
      >
        // ... rest of the existing code ...
      </TouchableOpacity>
    );
  };

  // ... rest of the existing code ...
} 
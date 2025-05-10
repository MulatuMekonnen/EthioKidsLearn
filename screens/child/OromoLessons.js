const OromoLessons = () => {
  const oromoTopics = [
    {
      id: 1,
      title: 'Qubeewwan',
      icon: 'text-outline',
      screen: 'OromoAlphabets',
      color: '#4CAF50',
      description: 'Qubeewwan Afaan Oromoo baradhaa'
    },
    {
      id: 7,
      title: 'Qormaata Afaan Oromoo',
      icon: 'library-outline',
      screen: 'ContentsScreen',
      color: '#9C27B0',
      description: 'Qormaata Afaan Oromoo barsiisota irraa argatan ilaalaa fi galchaa',
      params: { category: 'oromo' }
    }
  ];

  const renderOromoTopic = (topic) => {
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
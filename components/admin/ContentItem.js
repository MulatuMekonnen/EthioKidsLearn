import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch, Chip, IconButton } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';

const ContentItem = ({ item, onEdit, onDelete, onTogglePublish }) => {
  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <IconButton
        icon="delete"
        color="red"
        size={24}
        onPress={onDelete}
      />
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.leftActions}>
      <IconButton
        icon="pencil"
        color="#2196F3"
        size={24}
        onPress={onEdit}
      />
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
    >
      <List.Item
        title={item.title}
        description={new Date(item.lastUpdated).toLocaleDateString()}
        left={props => (
          <View style={styles.leftContent}>
            <Chip mode="outlined" style={styles.languageChip}>
              {item.language}
            </Chip>
          </View>
        )}
        right={props => (
          <Switch
            value={item.isPublished}
            onValueChange={() => onTogglePublish(item.id, item.isPublished)}
          />
        )}
        style={styles.listItem}
      />
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: 'white',
  },
  leftContent: {
    justifyContent: 'center',
  },
  languageChip: {
    marginRight: 8,
  },
  leftActions: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
  },
  rightActions: {
    backgroundColor: '#ffebee',
    justifyContent: 'center',
  },
});

export default ContentItem; 
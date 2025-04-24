import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import API from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // New state for filtering tasks
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state

  // Fetch tasks with an optional filter parameter
  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks', {
        params: { status: filter === 'All' ? '' : filter.toLowerCase() }, // Include filter in request
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;

    try {
      await API.post('/tasks', {
        title: newTitle,
        description: newDescription,
      });
      setNewTitle('');
      setNewDescription('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]); // Re-fetch tasks when filter changes

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>📋 To-Do List</Text>

      <TextInput
        placeholder="Title"
        value={newTitle}
        onChangeText={setNewTitle}
        style={[styles.input, isDarkMode && styles.darkInput]}
      />
      <TextInput
        placeholder="Description"
        value={newDescription}
        onChangeText={setNewDescription}
        style={[styles.input, isDarkMode && styles.darkInput]}
      />
      <Button title="Add Task" onPress={addTask} />

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Button title="All" onPress={() => setFilter('All')} />
        <Button title="Pending" onPress={() => setFilter('Pending')} />
        <Button title="Finished" onPress={() => setFilter('Finished')} />
      </View>

      {/* Dark Mode Toggle */}
      <View style={styles.darkModeToggleContainer}>
        <Button title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`} onPress={() => setIsDarkMode(!isDarkMode)} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={fetchTasks}
        renderItem={({ item }) => (
          <View style={[styles.task, item.completed && styles.completed, isDarkMode && styles.darkTask]}>
            <Text style={[styles.taskTitle, item.completed && styles.completed, isDarkMode && styles.darkText]}>
              {item.title}
            </Text>
            <Text style={isDarkMode && styles.darkText}>{item.description}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.delete}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  darkInput: {
    backgroundColor: '#444',
    color: '#fff',
  },
  task: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  darkTask: {
    backgroundColor: '#555',
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  actions: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  delete: {
    color: 'red',
    fontWeight: 'bold',
  },
  filterContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  darkModeToggleContainer: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

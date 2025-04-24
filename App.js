import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import API from './api';
import Checkbox from 'expo-checkbox';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null); // Track the task being edited
  const [refreshing, setRefreshing] = useState(false);
  const [theme, setTheme] = useState('light');
  const [filter, setFilter] = useState('All');

  const isDark = theme === 'dark';

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
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
        completed: false, // ← Add this!
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
      console.log(`Attempting to delete task with ID: ${id}`);
      const res = await API.delete(`/tasks/${id}`);
      console.log('Task deleted:', res.data);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error.response || error.message);
    }
  };

  const updateTask = async (task) => {
    console.log('Task object before update:', task); // Add this line to check the task structure
  
    if (!task || !task.id || !newTitle.trim()) {
      console.log('Invalid task object or missing title');
      return;
    }
  
    const updatedTask = {
      title: newTitle,
      description: newDescription,
      completed: false,
    };
  
    try {
      console.log(`Attempting to update task with ID: ${task.id}`);
      const res = await API.put(`/tasks/${task.id}`, updatedTask);
      console.log('Task updated:', res.data);
      setNewTitle('');
      setNewDescription('');
      setEditingTask(null); // Clear after update
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error.response || error.message);
    }
  };
  

  

  const toggleComplete = async (task) => {
    try {
      await API.put(`/tasks/${task.id}`, {
        ...task,
        completed: !task.completed,
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTitle(task.title);
    setNewDescription(task.description);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Finished') return task.completed;
  });

  if (!fontsLoaded) return null;

  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 To-Do List</Text>
        <Switch value={isDark} onValueChange={() => setTheme(isDark ? 'light' : 'dark')} />
      </View>

      <TextInput
        placeholder="Title"
        value={newTitle}
        onChangeText={setNewTitle}
        style={styles.input}
        placeholderTextColor={isDark ? '#aaa' : '#666'}
      />
      <TextInput
        placeholder="Description"
        value={newDescription}
        onChangeText={setNewDescription}
        style={styles.input}
        placeholderTextColor={isDark ? '#aaa' : '#666'}
      />
      {editingTask ? (
        <TouchableOpacity style={styles.addButton} onPress={() => updateTask(editingTask)}>
          <Text style={styles.addButtonText}>✏️ Update Task</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>➕ Add Task</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filterContainer}>
        {['All', 'Pending', 'Finished'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filter === type && styles.filterButtonActive]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[styles.filterText, filter === type && styles.filterTextActive]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={fetchTasks}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <View style={styles.taskLeft}>
              <Checkbox value={item.completed} onValueChange={() => toggleComplete(item)} />
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskTitle, item.completed && styles.completed]}>{item.title}</Text>
                <Text style={styles.taskDesc}>{item.description}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => editTask(item)}>
                <Text style={styles.edit}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.delete}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function createStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      paddingHorizontal: 20,
      backgroundColor: isDark ? '#1e1e1e' : '#f4f4f4',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Poppins_700Bold',
      color: isDark ? '#fff' : '#333',
    },
    input: {
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      color: isDark ? '#fff' : '#000',
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
      fontFamily: 'Poppins_400Regular',
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#ddd',
    },
    addButton: {
      backgroundColor: isDark ? '#4a90e2' : '#007bff',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Poppins_700Bold',
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      gap: 8,
    },
    filterButton: {
      padding: 8,
      paddingHorizontal: 15,
      backgroundColor: isDark ? '#3a3a3a' : '#e0e0e0',
      borderRadius: 8,
    },
    filterButtonActive: {
      backgroundColor: isDark ? '#4a90e2' : '#007bff',
    },
    filterText: {
      fontFamily: 'Poppins_400Regular',
      color: isDark ? '#fff' : '#333',
    },
    filterTextActive: {
      color: '#fff',
      fontWeight: 'bold',
    },
    task: {
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      padding: 12,
      marginVertical: 6,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#ddd',
    },
    taskLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    taskTextContainer: {
      flex: 1,
    },
    taskTitle: {
      fontFamily: 'Poppins_700Bold',
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
    },
    taskDesc: {
      fontFamily: 'Poppins_400Regular',
      color: isDark ? '#ccc' : '#555',
    },
    completed: {
      textDecorationLine: 'line-through',
      color: 'gray',
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    edit: {
      color: 'blue',
      fontWeight: 'bold',
    },
    delete: {
      color: 'red',
      fontWeight: 'bold',
    },
  });
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import TaskItem from '../components/TaskItem';
import API from '../api';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const scheme = useColorScheme();

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.log('Error fetching tasks:', err);
    }
  };

  const handleAddOrEdit = async () => {
    if (!title.trim()) return;

    try {
      if (editTask) {
        const res = await API.put(`/tasks/${editTask.id}`, {
          title,
          description: '',
          completed: editTask.completed,
        });
        setTasks(tasks.map(t => (t.id === res.data.id ? res.data : t)));
        setEditTask(null);
      } else {
        const res = await API.post('/tasks', {
          title,
          description: '',
        });
        setTasks([...tasks, res.data]);
      }
      setTitle('');
    } catch (err) {
      console.log('Error adding/editing task:', err);
    }
  };

  const handleToggle = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const res = await API.put(`/tasks/${id}`, {
        ...task,
        completed: !task.completed,
      });
      setTasks(tasks.map(t => (t.id === id ? res.data : t)));
    } catch (err) {
      console.log('Error toggling task:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.log('Error deleting task:', err);
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setTitle(task.title);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'finished') return task.completed;
    return true;
  });

  const themeStyles = darkMode ? styles.dark : styles.light;

  return (
    <View style={[styles.container, themeStyles]}>
      <Text style={[styles.header, themeStyles]}>📝 To-Do List</Text>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'finished'].map(type => (
          <TouchableOpacity key={type} onPress={() => setFilter(type)}>
            <Text style={[styles.filterButton, filter === type && styles.active]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor={darkMode ? "#ccc" : "#555"}
          style={[styles.input, themeStyles]}
        />
        <TouchableOpacity onPress={handleAddOrEdit} style={styles.addButton}>
          <Text style={styles.addText}>{editTask ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      />

      <TouchableOpacity onPress={toggleDarkMode} style={styles.darkModeToggle}>
        <Text style={{ color: darkMode ? '#fff' : '#333' }}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  light: {
    backgroundColor: '#fff',
    color: '#333',
  },
  dark: {
    backgroundColor: '#121212',
    color: '#eee',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#fcb312',
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    fontSize: 16,
    padding: 6,
    color: '#777',
  },
  active: {
    fontWeight: 'bold',
    color: '#fcb312',
  },
  darkModeToggle: {
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default HomeScreen;

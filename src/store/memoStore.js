import { create } from 'zustand';
import { getTasks, createTask, completeTask, createFamilyMember } from '../services/api';

const useMemoStore = create((set, get) => ({
  tasks: [],
  familyMembers: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await getTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: '获取任务失败', isLoading: false });
    }
  },

  addTask: async (task) => {
    set({ isLoading: true });
    try {
      const { id } = await createTask(task);
      const newTask = { ...task, id };
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false
      }));
    } catch (error) {
      set({ error: '添加任务失败', isLoading: false });
    }
  },

  completeTask: async (taskId) => {
    set({ isLoading: true });
    try {
      const { points } = await completeTask(taskId);
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, completed: true, completedAt: new Date() } : task
        ),
        isLoading: false
      }));
      return points;
    } catch (error) {
      set({ error: '完成任务失败', isLoading: false });
    }
  },

  addFamilyMember: async (member) => {
    set({ isLoading: true });
    try {
      const { id } = await createFamilyMember(member);
      set(state => ({
        familyMembers: [...state.familyMembers, { ...member, id }],
        isLoading: false
      }));
    } catch (error) {
      set({ error: '添加家庭成员失败', isLoading: false });
    }
  }
}));

export default useMemoStore;
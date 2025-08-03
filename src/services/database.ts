import { DailyTask, Project, Task, BackupData } from '../types';

class DatabaseService {
    private db: IDBDatabase | null = null;
    private readonly dbName = 'TaskOrganizerDB';
    private readonly version = 1;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains('dailyTasks')) {
                    const dailyTasksStore = db.createObjectStore('dailyTasks', { keyPath: 'id' });
                    dailyTasksStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains('projects')) {
                    const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectsStore.createIndex('name', 'name', { unique: false });
                }

                if (!db.objectStoreNames.contains('tasks')) {
                    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    tasksStore.createIndex('date', 'date', { unique: false });
                    tasksStore.createIndex('projectId', 'projectId', { unique: false });
                }
            };
        });
    }

    async saveDailyTask(dailyTask: DailyTask): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['dailyTasks'], 'readwrite');
            const store = transaction.objectStore('dailyTasks');
            const request = store.put(dailyTask);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getDailyTask(date: string): Promise<DailyTask | null> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['dailyTasks'], 'readonly');
            const store = transaction.objectStore('dailyTasks');
            const index = store.index('date');
            const request = index.get(date);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllDailyTasks(): Promise<DailyTask[]> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['dailyTasks'], 'readonly');
            const store = transaction.objectStore('dailyTasks');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveProject(project: Project): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            const request = store.put(project);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllProjects(): Promise<Project[]> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveTask(task: Task): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['tasks'], 'readwrite');
            const store = transaction.objectStore('tasks');
            const request = store.put(task);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getTasksByDate(date: string): Promise<Task[]> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const index = store.index('date');
            const request = index.getAll(date);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteDailyTask(id: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['dailyTasks'], 'readwrite');
            const store = transaction.objectStore('dailyTasks');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async deleteTask(id: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['tasks'], 'readwrite');
            const store = transaction.objectStore('tasks');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async deleteProject(id: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async exportData(): Promise<BackupData> {
        const [dailyTasks, projects] = await Promise.all([
            this.getAllDailyTasks(),
            this.getAllProjects()
        ]);

        return {
            dailyTasks,
            projects,
            version: '1.0.0',
            timestamp: new Date().toISOString()
        };
    }

    async importData(data: BackupData): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction(['dailyTasks', 'projects', 'tasks'], 'readwrite');

        // Clear existing data
        await Promise.all([
            new Promise<void>((resolve, reject) => {
                const dailyTasksStore = transaction.objectStore('dailyTasks');
                const request = dailyTasksStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            }),
            new Promise<void>((resolve, reject) => {
                const projectsStore = transaction.objectStore('projects');
                const request = projectsStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            }),
            new Promise<void>((resolve, reject) => {
                const tasksStore = transaction.objectStore('tasks');
                const request = tasksStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
        ]);

        // Import new data
        const dailyTasksStore = transaction.objectStore('dailyTasks');
        const projectsStore = transaction.objectStore('projects');
        const tasksStore = transaction.objectStore('tasks');

        // Import projects
        for (const project of data.projects) {
            projectsStore.put(project);
        }

        // Import daily tasks and their tasks
        for (const dailyTask of data.dailyTasks) {
            dailyTasksStore.put(dailyTask);
            for (const task of dailyTask.tasks) {
                tasksStore.put(task);
            }
        }
    }
}

export const databaseService = new DatabaseService(); 
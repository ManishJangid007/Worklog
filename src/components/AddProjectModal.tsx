import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Project } from '../types';
import { databaseService } from '../services/database';
import { v4 as uuidv4 } from 'uuid';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectAdded: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onProjectAdded }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editName, setEditName] = useState('');

    const resetForm = () => {
        setNewProjectName('');
        setEditingProject(null);
        setEditName('');
    };

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        } else {
            // Reset form when modal closes
            resetForm();
        }
    }, [isOpen]);

    const loadProjects = async () => {
        try {
            const allProjects = await databaseService.getAllProjects();
            setProjects(allProjects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    };

    const handleAddProject = async () => {
        if (!newProjectName.trim()) return;

        const project: Project = {
            id: uuidv4(),
            name: newProjectName.trim()
        };

        try {
            await databaseService.saveProject(project);
            setProjects([...projects, project]);
            setNewProjectName('');
            onProjectAdded();
        } catch (error) {
            console.error('Failed to add project:', error);
        }
    };

    const handleEditProject = async (project: Project) => {
        if (!editName.trim()) return;

        try {
            const updatedProject = { ...project, name: editName.trim() };
            await databaseService.saveProject(updatedProject);
            setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
            setEditingProject(null);
            setEditName('');
            onProjectAdded();
        } catch (error) {
            console.error('Failed to update project:', error);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            await databaseService.deleteProject(projectId);
            setProjects(projects.filter(p => p.id !== projectId));
            onProjectAdded();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const startEditing = (project: Project) => {
        setEditingProject(project);
        setEditName(project.name);
    };

    const cancelEditing = () => {
        setEditingProject(null);
        setEditName('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Manage Projects / Sections</h2>
                    <button className="close-button" onClick={() => {
                        resetForm();
                        onClose();
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="form-group">
                        <label>Add New Project / Section</label>
                        <div className="project-input">
                            <input
                                type="text"
                                placeholder="Enter project or section name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="form-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddProject();
                                    }
                                }}
                            />
                            <button
                                className="add-button"
                                onClick={handleAddProject}
                                disabled={!newProjectName.trim()}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="projects-list">
                        <h3>Existing Projects / Sections ({projects.length})</h3>
                        {projects.length === 0 ? (
                            <p className="no-projects">No projects or sections created yet. Add your first one above.</p>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} className="project-item">
                                    {editingProject?.id === project.id ? (
                                        <div className="project-edit">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="form-input"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleEditProject(project);
                                                    }
                                                }}
                                            />
                                            <button
                                                className="save-button"
                                                onClick={() => handleEditProject(project)}
                                                disabled={!editName.trim()}
                                            >
                                                <Save size={14} />
                                            </button>
                                            <button
                                                className="cancel-button"
                                                onClick={cancelEditing}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="project-display">
                                            <span className="project-name">{project.name}</span>
                                            <div className="project-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => startEditing(project)}
                                                    title="Edit project"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    title="Delete project"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="button secondary" onClick={() => {
                        resetForm();
                        onClose();
                    }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal; 
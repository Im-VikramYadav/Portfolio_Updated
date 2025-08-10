import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AdminBioSection from './AdminBioSection';
import AdminExperienceSection from './AdminExperienceSection';
import AdminCertificationsSection from './AdminCertificationsSection';
import AdminSkillsSection from './AdminSkillsSection';
import AdminEducationSection from './AdminEducationSection';
import VisitorStats from './VisitorStats';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  document_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

const AdminProjectsSection = () => {
  const { user, isAuthenticated, signOut, requireAuth } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    if (!requireAuth()) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch projects: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      let documentUrl = editingProject?.document_url;
      let thumbnailUrl = editingProject?.thumbnail_url;

      // Upload document if provided
      if (documentFile) {
        const documentPath = `${user.id}/${Date.now()}_${documentFile.name}`;
        await uploadFile(documentFile, 'project-documents', documentPath);
        documentUrl = `https://uyhcjaxaepvktflbyrlw.supabase.co/storage/v1/object/public/project-documents/${documentPath}`;
      }

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbnailPath = `${user.id}/${Date.now()}_${thumbnailFile.name}`;
        await uploadFile(thumbnailFile, 'project-thumbnails', thumbnailPath);
        thumbnailUrl = `https://uyhcjaxaepvktflbyrlw.supabase.co/storage/v1/object/public/project-thumbnails/${thumbnailPath}`;
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        document_url: documentUrl,
        thumbnail_url: thumbnailUrl,
        user_id: user.id,
      };

      if (editingProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast({ title: "Success", description: "Project updated successfully!" });
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
        toast({ title: "Success", description: "Project created successfully!" });
      }

      // Reset form and refresh projects
      setFormData({ title: '', description: '', tags: '' });
      setDocumentFile(null);
      setThumbnailFile(null);
      setEditingProject(null);
      setShowAddDialog(false);
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      tags: project.tags.join(', '),
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      toast({ title: "Success", description: "Project deleted successfully!" });
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', tags: '' });
    setDocumentFile(null);
    setThumbnailFile(null);
    setEditingProject(null);
  };

  if (!isAuthenticated) {
    return (
      <section id="admin" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Admin Access Required</h2>
          <p className="text-muted-foreground mb-8">Please login to access the admin panel.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Login to Continue
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <Button
            variant="outline"
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <Power size={16} />
            Logout
          </Button>
        </div>

        <div className="space-y-12">
          <VisitorStats />
          
          <AdminBioSection />
          <AdminEducationSection />
          <AdminExperienceSection />
          <AdminCertificationsSection />
          <AdminSkillsSection />
          
          <div>
            <h3 className="text-2xl font-bold mb-6">Projects Management</h3>
            
            <div className="mb-8">
              <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? 'Edit Project' : 'Add New Project'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Project Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Project Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                    <Input
                      placeholder="Tags (comma-separated)"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2">Document (optional)</label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Thumbnail (optional)</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No projects found.</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="glass hover:translate-y-[-4px] transition-transform"
                  >
                    <CardContent className="p-6">
                      {project.thumbnail_url && (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="text-xl font-semibold mb-4">{project.title}</h3>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {project.document_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => window.open(project.document_url, '_blank')}
                          >
                            <FileText size={16} />
                            View Document
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          className="flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectsSection;
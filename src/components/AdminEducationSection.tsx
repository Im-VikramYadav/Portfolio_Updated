import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Education {
  id: string;
  degree: string;
  university: string;
  graduation_year: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const AdminEducationSection = () => {
  const { user } = useAuth();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    degree: '',
    university: '',
    graduation_year: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      fetchEducation();
    }
  }, [user]);

  const fetchEducation = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('graduation_year', { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch education: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const educationData = {
        degree: formData.degree,
        university: formData.university,
        graduation_year: formData.graduation_year,
        description: formData.description,
        user_id: user.id,
      };

      if (editingEducation) {
        // Update existing education
        const { error } = await supabase
          .from('education')
          .update(educationData)
          .eq('id', editingEducation.id);

        if (error) throw error;
        toast({ title: "Success", description: "Education updated successfully!" });
      } else {
        // Create new education
        const { error } = await supabase
          .from('education')
          .insert([educationData]);

        if (error) throw error;
        toast({ title: "Success", description: "Education added successfully!" });
      }

      // Reset form and refresh education
      setFormData({ degree: '', university: '', graduation_year: '', description: '' });
      setEditingEducation(null);
      setShowAddDialog(false);
      fetchEducation();
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

  const handleEdit = (educationItem: Education) => {
    setEditingEducation(educationItem);
    setFormData({
      degree: educationItem.degree,
      university: educationItem.university,
      graduation_year: educationItem.graduation_year,
      description: educationItem.description || '',
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (educationId: string) => {
    if (!window.confirm('Are you sure you want to delete this education?')) return;

    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', educationId);

      if (error) throw error;
      toast({ title: "Success", description: "Education deleted successfully!" });
      fetchEducation();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ degree: '', university: '', graduation_year: '', description: '' });
    setEditingEducation(null);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        Education Management
      </h3>
      
      <div className="mb-8">
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEducation ? 'Edit Education' : 'Add Education'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Degree (e.g., B.Tech CSE)"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                required
              />
              <Input
                placeholder="University/Institution"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                required
              />
              <Input
                placeholder="Graduation Year (e.g., 2016)"
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : (editingEducation ? 'Update Education' : 'Add Education')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center">Loading education...</div>
      ) : education.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No education records found.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus size={16} className="mr-2" />
            Add Your First Education
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {education.map((edu) => (
            <Card key={edu.id} className="glass">
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-2">{edu.degree}</h4>
                <p className="text-primary font-medium mb-2">{edu.university}</p>
                <p className="text-sm text-muted-foreground mb-3">Class of {edu.graduation_year}</p>
                {edu.description && (
                  <p className="text-muted-foreground mb-4 text-sm italic">{edu.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(edu)}
                    className="flex items-center gap-2"
                  >
                    <Edit2 size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(edu.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEducationSection;
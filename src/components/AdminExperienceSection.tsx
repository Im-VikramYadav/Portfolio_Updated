import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const AdminExperienceSection = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    duration: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  useEffect(() => {
    if (user) fetchExperiences();
  }, [user]);

  const fetchExperiences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch experiences: " + error.message,
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

      const experienceData = {
        company: formData.company,
        position: formData.position,
        duration: formData.duration,
        location: formData.location || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description,
        user_id: user.id,
      };

      if (editingExperience) {
        const { error } = await supabase
          .from('experience')
          .update(experienceData)
          .eq('id', editingExperience.id);

        if (error) throw error;
        toast({ title: "Success", description: "Experience updated successfully!" });
      } else {
        const { error } = await supabase
          .from('experience')
          .insert([experienceData]);

        if (error) throw error;
        toast({ title: "Success", description: "Experience created successfully!" });
      }

      resetForm();
      fetchExperiences();
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

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      company: experience.company,
      position: experience.position,
      duration: experience.duration,
      location: experience.location || '',
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
      description: experience.description,
    });
    setShowDialog(true);
  };

  const handleDelete = async (experienceId: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;
      toast({ title: "Success", description: "Experience deleted successfully!" });
      fetchExperiences();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ company: '', position: '', duration: '', location: '', start_date: '', end_date: '', description: '' });
    setEditingExperience(null);
    setShowDialog(false);
  };

  if (loading) return <div>Loading experiences...</div>;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Experience Management</h3>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? 'Edit Experience' : 'Add Experience'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
              <Input
                placeholder="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
              <Input
                placeholder="Duration (e.g., Jan 2020 - Present)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
              <Input
                placeholder="Location (e.g., San Francisco, CA)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="End Date (leave empty if current)"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : (editingExperience ? 'Update Experience' : 'Create Experience')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {experiences.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No experiences found.</p>
            </CardContent>
          </Card>
        ) : (
          experiences.map((experience) => (
            <Card key={experience.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">{experience.position}</h4>
                    <p className="text-primary font-medium">{experience.company}</p>
                    {experience.location && (
                      <p className="text-sm text-muted-foreground">{experience.location}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{experience.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(experience)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(experience.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground">{experience.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminExperienceSection;
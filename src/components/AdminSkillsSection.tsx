import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency_level: number;
  created_at: string;
  updated_at: string;
}

const AdminSkillsSection = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiency_level: 5,
  });

  const categories = [
    'Programming Languages',
    'Frameworks & Libraries',
    'Databases',
    'Cloud & DevOps',
    'Tools & Software',
    'Soft Skills',
    'Other'
  ];

  useEffect(() => {
    if (user) fetchSkills();
  }, [user]);

  const fetchSkills = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch skills: " + error.message,
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

      const skillData = {
        name: formData.name,
        category: formData.category,
        proficiency_level: formData.proficiency_level,
        user_id: user.id,
      };

      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(skillData)
          .eq('id', editingSkill.id);

        if (error) throw error;
        toast({ title: "Success", description: "Skill updated successfully!" });
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([skillData]);

        if (error) throw error;
        toast({ title: "Success", description: "Skill created successfully!" });
      }

      resetForm();
      fetchSkills();
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

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency_level: skill.proficiency_level,
    });
    setShowDialog(true);
  };

  const handleDelete = async (skillId: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      toast({ title: "Success", description: "Skill deleted successfully!" });
      fetchSkills();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', proficiency_level: 5 });
    setEditingSkill(null);
    setShowDialog(false);
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) return <div>Loading skills...</div>;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Skills Management</h3>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? 'Edit Skill' : 'Add Skill'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Skill Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Proficiency Level: {formData.proficiency_level}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.proficiency_level}
                  onChange={(e) => setFormData({ ...formData, proficiency_level: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : (editingSkill ? 'Update Skill' : 'Create Skill')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedSkills).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No skills found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{skill.name}</h5>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(skill)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(skill.proficiency_level / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {skill.proficiency_level}/10
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSkillsSection;
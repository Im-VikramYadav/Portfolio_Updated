import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Bio {
  id: string;
  title: string;
  description: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

const AdminBioSection = () => {
  const { user } = useAuth();
  const [bio, setBio] = useState<Bio | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    if (user) fetchBio();
  }, [user]);

  const fetchBio = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bio')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setBio(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bio: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('project-thumbnails')
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      let profileImageUrl = bio?.profile_image_url;

      if (profileImage) {
        const imagePath = `${user.id}/profile_${Date.now()}_${profileImage.name}`;
        await uploadImage(profileImage, imagePath);
        profileImageUrl = `https://uyhcjaxaepvktflbyrlw.supabase.co/storage/v1/object/public/project-thumbnails/${imagePath}`;
      }

      const bioData = {
        title: formData.title,
        description: formData.description,
        profile_image_url: profileImageUrl,
        user_id: user.id,
      };

      if (bio) {
        const { error } = await supabase
          .from('bio')
          .update(bioData)
          .eq('id', bio.id);

        if (error) throw error;
        toast({ title: "Success", description: "Bio updated successfully!" });
      } else {
        const { error } = await supabase
          .from('bio')
          .insert([bioData]);

        if (error) throw error;
        toast({ title: "Success", description: "Bio created successfully!" });
      }

      setFormData({ title: '', description: '' });
      setProfileImage(null);
      setShowDialog(false);
      fetchBio();
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

  const handleEdit = () => {
    if (bio) {
      setFormData({
        title: bio.title,
        description: bio.description || '',
      });
      setShowDialog(true);
    }
  };

  const handleDelete = async () => {
    if (!bio || !window.confirm('Are you sure you want to delete your bio?')) return;

    try {
      const { error } = await supabase
        .from('bio')
        .delete()
        .eq('id', bio.id);

      if (error) throw error;
      toast({ title: "Success", description: "Bio deleted successfully!" });
      setBio(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading bio...</div>;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Bio Management</h3>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              {bio ? <Edit2 size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
              {bio ? 'Edit Bio' : 'Add Bio'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{bio ? 'Edit Bio' : 'Add Bio'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Bio Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Bio Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Profile Image (optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : (bio ? 'Update Bio' : 'Create Bio')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {bio ? (
        <Card>
          <CardContent className="p-6">
            {bio.profile_image_url && (
              <img
                src={bio.profile_image_url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
            )}
            <h4 className="text-xl font-semibold mb-2">{bio.title}</h4>
            <p className="text-muted-foreground mb-4">{bio.description}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit2 size={16} className="mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No bio found. Create one to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBioSection;
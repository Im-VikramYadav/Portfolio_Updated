import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, ExternalLink, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date_issued: string;
  credential_url?: string;
  badge_image_url?: string;
  created_at: string;
  updated_at: string;
}

const AdminCertificationsSection = () => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date_issued: '',
    credential_url: '',
    badge_image_url: '',
  });
  const [uploadingBadge, setUploadingBadge] = useState(false);

  useEffect(() => {
    if (user) fetchCertifications();
  }, [user]);

  const fetchCertifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('date_issued', { ascending: false });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch certifications: " + error.message,
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

      const certificationData = {
        title: formData.title,
        issuer: formData.issuer,
        date_issued: formData.date_issued,
        credential_url: formData.credential_url || null,
        badge_image_url: formData.badge_image_url || null,
        user_id: user.id,
      };

      if (editingCertification) {
        const { error } = await supabase
          .from('certifications')
          .update(certificationData)
          .eq('id', editingCertification.id);

        if (error) throw error;
        toast({ title: "Success", description: "Certification updated successfully!" });
      } else {
        const { error } = await supabase
          .from('certifications')
          .insert([certificationData]);

        if (error) throw error;
        toast({ title: "Success", description: "Certification created successfully!" });
      }

      resetForm();
      fetchCertifications();
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

  const handleEdit = (certification: Certification) => {
    setEditingCertification(certification);
    setFormData({
      title: certification.title,
      issuer: certification.issuer,
      date_issued: certification.date_issued,
      credential_url: certification.credential_url || '',
      badge_image_url: certification.badge_image_url || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (certificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;

    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', certificationId);

      if (error) throw error;
      toast({ title: "Success", description: "Certification deleted successfully!" });
      fetchCertifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBadgeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingBadge(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `certification-badges/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-thumbnails')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-thumbnails')
        .getPublicUrl(filePath);

      setFormData({ ...formData, badge_image_url: publicUrl });
      toast({ title: "Success", description: "Badge uploaded successfully!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to upload badge: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploadingBadge(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', issuer: '', date_issued: '', credential_url: '', badge_image_url: '' });
    setEditingCertification(null);
    setShowDialog(false);
  };

  if (loading) return <div>Loading certifications...</div>;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Certifications Management</h3>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCertification ? 'Edit Certification' : 'Add Certification'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Certification Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                placeholder="Issuer"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                required
              />
              <Input
                placeholder="Date Issued (e.g., May 2023)"
                value={formData.date_issued}
                onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
              />
              <Input
                placeholder="Credential URL (optional)"
                value={formData.credential_url}
                onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                type="url"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Badge Image (optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBadgeUpload}
                    className="hidden"
                    id="badge-upload"
                    disabled={uploadingBadge}
                  />
                  <label
                    htmlFor="badge-upload"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-2 p-2 border border-input rounded-md hover:bg-accent">
                      <Upload size={16} />
                      {uploadingBadge ? 'Uploading...' : 'Upload Badge'}
                    </div>
                  </label>
                </div>
                {formData.badge_image_url && (
                  <div className="flex items-center gap-2">
                    <img src={formData.badge_image_url} alt="Badge preview" className="w-8 h-8 rounded object-cover" />
                    <span className="text-sm text-muted-foreground">Badge uploaded</span>
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : (editingCertification ? 'Update Certification' : 'Create Certification')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No certifications found.</p>
            </CardContent>
          </Card>
        ) : (
          certifications.map((certification) => (
            <Card key={certification.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {certification.badge_image_url && (
                       <img 
                         src={certification.badge_image_url} 
                         alt={`${certification.title} badge`}
                         className="w-20 h-20 rounded object-cover flex-shrink-0"
                       />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{certification.title}</h4>
                      <p className="text-primary font-medium">{certification.issuer}</p>
                      {certification.date_issued && (
                        <p className="text-sm text-muted-foreground">{certification.date_issued}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(certification)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(certification.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                {certification.credential_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(certification.credential_url, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    View Credential
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCertificationsSection;
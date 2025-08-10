
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date_issued?: string;
  credential_url?: string;
  badge_image_url?: string;
}

const CertificationsSection = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('date_issued', { ascending: false });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="certifications" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-16 animate-fade-in">Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-full text-center">Loading certifications...</div>
          ) : certifications.length === 0 ? (
            <div className="col-span-full text-center">
              <p className="text-muted-foreground">No certifications found.</p>
            </div>
          ) : (
            certifications.map((cert, index) => (
              <div
                key={cert.id}
                className="glass p-6 rounded-lg hover-lift hover-glow transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  {cert.badge_image_url && (
                    <img 
                      src={cert.badge_image_url} 
                      alt={`${cert.title} badge`}
                      className="w-20 h-20 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gradient">{cert.title}</h3>
                    <p className="text-primary mb-1">{cert.issuer}</p>
                    {cert.date_issued && (
                      <p className="text-sm text-muted-foreground mb-3">Issued {cert.date_issued}</p>
                    )}
                  </div>
                </div>
                {cert.credential_url && (
                  <a 
                    href={cert.credential_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Credential
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;

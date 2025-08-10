
import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Education {
  id: string;
  degree: string;
  university: string;
  graduation_year: string;
  description?: string;
}

const EducationSection = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('graduation_year', { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (error) {
      console.error('Error fetching education:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="education" className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-16 animate-fade-in flex items-center justify-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-gradient">Education</span>
        </h2>
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center">Loading education...</div>
          ) : education.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground">No education records found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="cinematic-card p-8 rounded-xl border border-primary/20 shadow-lg hover-lift hover-glow transition-all duration-300 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold mb-3 text-gradient">{edu.degree}</h3>
                      <div className="mb-2 text-lg text-primary font-medium">{edu.university}</div>
                    </div>
                    <div className="flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
                      Class of {edu.graduation_year}
                    </div>
                  </div>
                  {edu.description && (
                    <div className="mt-6 pt-6 border-t border-primary/10">
                      <div className="text-muted-foreground italic">
                        {edu.description}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;

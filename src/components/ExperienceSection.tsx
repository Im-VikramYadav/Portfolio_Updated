
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Experience {
  id: string;
  position: string;
  company: string;
  duration: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

const ExperienceSection = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('start_date', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="experience" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-16 animate-fade-in">Professional Experience</h2>
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center">Loading experiences...</div>
          ) : experiences.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground">No experience records found.</p>
            </div>
          ) : (
            experiences.map((exp, index) => (
              <div
                key={exp.id}
                className="mb-12 last:mb-0 relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div 
                  className="absolute left-0 top-0 w-2 h-2 rounded-full bg-primary transform -translate-x-[3px] animate-scale-in" 
                  style={{ animationDelay: `${index * 200 + 100}ms` }} 
                />
                <div 
                  className="glass p-6 rounded-lg hover-lift hover-glow transition-all duration-300 animate-fade-in animate-delayed"
                  style={{ animationDelay: `${index * 200 + 200}ms` }}
                >
                  <div className="text-sm text-muted-foreground mb-2">{exp.duration}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gradient">{exp.position}</h3>
                  <div className="text-primary mb-2">{exp.company}</div>
                  {exp.location && (
                    <div className="text-sm text-muted-foreground mb-2">{exp.location}</div>
                  )}
                  {exp.description && (
                    <div className="text-muted-foreground mt-4">
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-2">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;

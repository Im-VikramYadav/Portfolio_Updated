import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface VolunteerExperience {
  period: string;
  role: string;
  organization: string;
  link?: string;
  profileUrl?: string;
  description: string[];
}

const VolunteerExperienceSection = () => {
  const [volunteerExperience, setVolunteerExperience] = useState<VolunteerExperience>({
    period: "Jul 2024 - Present",
    role: "Active Member",
    organization: "NextWork Community",
    link: "https://www.nextwork.org/",
    profileUrl: "https://community.nextwork.org/u/a52c6d31",
    description: [
      "Member of Cloud & AI Learner community",
      "Actively completed 35 Cloud Projects",
      "Collaborate with peers on cloud implementation best practices"
    ]
  });

  return (
    <section id="volunteer" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-16 animate-fade-in flex items-center justify-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <span className="text-gradient">Volunteer Experience</span>
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="cinematic-card p-8 rounded-xl border border-primary/20 shadow-lg hover-lift hover-glow transition-all duration-300 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-gradient">{volunteerExperience.role}</h3>
                <div className="mb-2 text-lg text-primary font-medium">
                  {volunteerExperience.link ? (
                    <a 
                      href={volunteerExperience.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {volunteerExperience.organization}
                    </a>
                  ) : (
                    volunteerExperience.organization
                  )}
                  {volunteerExperience.profileUrl && (
                    <>
                      {" - "}
                      <a 
                        href={volunteerExperience.profileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-sm"
                      >
                        My Profile
                      </a>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
                {volunteerExperience.period}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-primary/10">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {volunteerExperience.description.map((point, idx) => (
                  <li key={idx} className="pl-2">{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerExperienceSection;
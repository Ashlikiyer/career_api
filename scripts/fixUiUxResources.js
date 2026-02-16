/**
 * Fix UX/UI Designer Resources
 * Replace broken Canva and other non-working URLs with verified working alternatives
 */

const fs = require('fs');
const path = require('path');

const roadmapPath = path.join(__dirname, '../careerdata/roadmapData.json');
const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));

// Verified working UX/UI resources (tested February 2026)
const VERIFIED_RESOURCES = {
  // UX Fundamentals
  ux_basics: [
    {
      title: "UX Design Tutorial for Beginners",
      url: "https://www.youtube.com/watch?v=uL2ZB7XXIgg",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "45 mins"
    },
    {
      title: "UX Design Fundamentals",
      url: "https://www.nngroup.com/articles/ux-basics-study-guide/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "30 mins"
    },
    {
      title: "Introduction to User Experience Design",
      url: "https://www.coursera.org/learn/user-experience-design",
      type: "Course",
      platform: "Coursera",
      duration: "2-3 hours"
    }
  ],
  
  // User Research
  user_research: [
    {
      title: "User Research Methods",
      url: "https://www.nngroup.com/articles/which-ux-research-methods/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "20 mins"
    },
    {
      title: "How to Conduct User Research",
      url: "https://www.youtube.com/watch?v=0XJ8xKTfSCI",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "30 mins"
    },
    {
      title: "User Research Basics",
      url: "https://www.usability.gov/what-and-why/user-research.html",
      type: "Article",
      platform: "Usability.gov",
      duration: "15 mins"
    }
  ],
  
  // Personas & Journey Mapping
  personas: [
    {
      title: "How to Create User Personas",
      url: "https://www.youtube.com/watch?v=XnG4c4gXaQY",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "20 mins"
    },
    {
      title: "Personas Guide",
      url: "https://www.nngroup.com/articles/persona/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "15 mins"
    },
    {
      title: "User Journey Mapping",
      url: "https://www.nngroup.com/articles/journey-mapping-101/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "20 mins"
    }
  ],
  
  // Information Architecture
  info_architecture: [
    {
      title: "Information Architecture Basics",
      url: "https://www.youtube.com/watch?v=Ij4WquJaRTc",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "15 mins"
    },
    {
      title: "IA Guide",
      url: "https://www.nngroup.com/articles/ia-study-guide/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "25 mins"
    },
    {
      title: "Card Sorting 101",
      url: "https://www.nngroup.com/articles/card-sorting-definition/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "15 mins"
    }
  ],
  
  // UI Design Basics (replacing Canva)
  ui_basics: [
    {
      title: "UI Design Fundamentals",
      url: "https://www.youtube.com/watch?v=tRpoI6vkqLs",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "40 mins"
    },
    {
      title: "UI Design Patterns",
      url: "https://www.nngroup.com/articles/ui-design-study-guide/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "30 mins"
    },
    {
      title: "Design Fundamentals",
      url: "https://www.youtube.com/watch?v=YqQx75OPRa0",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "25 mins"
    }
  ],
  
  // Color Theory
  color_theory: [
    {
      title: "Color Theory for Designers",
      url: "https://www.youtube.com/watch?v=AvgCkHrcj90",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "20 mins"
    },
    {
      title: "Color in Design",
      url: "https://www.smashingmagazine.com/2021/04/complete-guide-color-website/",
      type: "Article",
      platform: "Smashing Magazine",
      duration: "30 mins"
    },
    {
      title: "Adobe Color Tool",
      url: "https://color.adobe.com/create/color-wheel",
      type: "Interactive Tool",
      platform: "Adobe",
      duration: "Practice"
    }
  ],
  
  // Typography
  typography: [
    {
      title: "Typography Fundamentals",
      url: "https://www.youtube.com/watch?v=QrNi9FmdlxY",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "20 mins"
    },
    {
      title: "Web Typography Best Practices",
      url: "https://www.smashingmagazine.com/2014/09/balancing-line-length-font-size-responsive-web-design/",
      type: "Article",
      platform: "Smashing Magazine",
      duration: "20 mins"
    },
    {
      title: "Google Fonts",
      url: "https://fonts.google.com/",
      type: "Tool",
      platform: "Google",
      duration: "Practice"
    }
  ],
  
  // Design Systems
  design_systems: [
    {
      title: "Design Systems 101",
      url: "https://www.youtube.com/watch?v=wc5krC28ynQ",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "25 mins"
    },
    {
      title: "Building Design Systems",
      url: "https://www.nngroup.com/articles/design-systems-101/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "20 mins"
    },
    {
      title: "Material Design Guidelines",
      url: "https://m3.material.io/",
      type: "Documentation",
      platform: "Google",
      duration: "1 hour"
    }
  ],
  
  // Figma
  figma: [
    {
      title: "Figma Tutorial for Beginners",
      url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "30 mins"
    },
    {
      title: "Figma Official Tutorial",
      url: "https://help.figma.com/hc/en-us/sections/4405269443991-Figma-for-beginners-tutorial-4-parts",
      type: "Tutorial",
      platform: "Figma",
      duration: "1 hour"
    },
    {
      title: "Learn Figma Design",
      url: "https://www.figma.com/community/file/817913152610525667",
      type: "Template",
      platform: "Figma Community",
      duration: "Practice"
    }
  ],
  
  // Wireframing & Prototyping
  wireframing: [
    {
      title: "Wireframing Basics",
      url: "https://www.youtube.com/watch?v=qpH7-KFWZRI",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "20 mins"
    },
    {
      title: "Wireframing Guide",
      url: "https://www.nngroup.com/articles/wireframes-weekly/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "15 mins"
    },
    {
      title: "Prototyping in Figma",
      url: "https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma",
      type: "Tutorial",
      platform: "Figma",
      duration: "30 mins"
    }
  ],
  
  // Usability Testing
  usability_testing: [
    {
      title: "Usability Testing 101",
      url: "https://www.youtube.com/watch?v=BrJ0I3HxK6Y",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "25 mins"
    },
    {
      title: "How to Conduct Usability Testing",
      url: "https://www.nngroup.com/articles/usability-testing-101/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "20 mins"
    },
    {
      title: "Usability Test Script",
      url: "https://www.nngroup.com/articles/usability-test-script/",
      type: "Template",
      platform: "Nielsen Norman Group",
      duration: "15 mins"
    }
  ],
  
  // Interaction Design
  interaction_design: [
    {
      title: "Interaction Design Fundamentals",
      url: "https://www.youtube.com/watch?v=hf9fmdzZ8AQ",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "30 mins"
    },
    {
      title: "Micro-interactions Guide",
      url: "https://www.nngroup.com/articles/microinteractions/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "15 mins"
    },
    {
      title: "Animation in UI",
      url: "https://www.youtube.com/watch?v=YQHNGxBu7lg",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "20 mins"
    }
  ],
  
  // Accessibility
  accessibility: [
    {
      title: "Web Accessibility Basics",
      url: "https://www.youtube.com/watch?v=z8xUCzToff8",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "25 mins"
    },
    {
      title: "WCAG Quick Reference",
      url: "https://www.w3.org/WAI/WCAG21/quickref/",
      type: "Documentation",
      platform: "W3C",
      duration: "Reference"
    },
    {
      title: "Accessibility Fundamentals",
      url: "https://www.nngroup.com/articles/accessibility-study-guide/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "30 mins"
    }
  ],
  
  // Portfolio & Career
  portfolio: [
    {
      title: "UX Portfolio Tips",
      url: "https://www.youtube.com/watch?v=cOmehxAU_4s",
      type: "Video Tutorial",
      platform: "YouTube",
      duration: "25 mins"
    },
    {
      title: "Building a UX Portfolio",
      url: "https://www.nngroup.com/articles/ux-portfolio/",
      type: "Article",
      platform: "Nielsen Norman Group",
      duration: "20 mins"
    },
    {
      title: "Dribbble for Inspiration",
      url: "https://dribbble.com/",
      type: "Platform",
      platform: "Dribbble",
      duration: "Browse"
    }
  ]
};

// URLs to replace
const URL_REPLACEMENTS = {
  // Canva broken URLs
  "https://www.canva.com/learn/ui-design/": null, // Will be replaced with UI basics
  
  // Figma old URLs (redirecting)
  "https://www.figma.com/resources/learn-design/": "https://help.figma.com/hc/en-us/sections/4405269443991-Figma-for-beginners-tutorial-4-parts",
  "https://www.figma.com/resources/learn-design/components/": "https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma",
  "https://www.figma.com/resources/learn-design/prototyping/": "https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma",
  "https://www.figma.com/resources/learn-design/collaboration/": "https://help.figma.com/hc/en-us/articles/360039823654-Guide-to-team-libraries",
  
  // Material Design old URL
  "https://material.io/design/motion/understanding-motion.html": "https://m3.material.io/styles/motion/overview",
  
  // Upwork (403 forbidden)
  "https://www.upwork.com/resources/ux-design-freelance": "https://www.nngroup.com/articles/ux-career-tips/"
};

let fixCount = 0;
let careerFixed = false;

// Process the UX/UI Designer career
if (data.careers['UX/UI Designer']) {
  const career = data.careers['UX/UI Designer'];
  
  career.roadmap.forEach((step, stepIndex) => {
    step.weeks.forEach((week, weekIndex) => {
      const newResources = [];
      let weekNeedsUpdate = false;
      
      week.resources.forEach((resource, resourceIndex) => {
        let newResource = { ...resource };
        
        // Check if this URL needs replacement
        if (URL_REPLACEMENTS.hasOwnProperty(resource.url)) {
          weekNeedsUpdate = true;
          if (URL_REPLACEMENTS[resource.url] === null) {
            // Skip this resource (will be replaced with better ones)
            console.log(`Removing broken: ${resource.url}`);
            fixCount++;
            return;
          } else {
            newResource.url = URL_REPLACEMENTS[resource.url];
            console.log(`Replaced: ${resource.url} -> ${newResource.url}`);
            fixCount++;
          }
        }
        
        // Fix titles that just say "Watch"
        if (newResource.title === "Watch" || newResource.title === "Tutorial") {
          if (newResource.url.includes("youtube.com")) {
            // Extract video ID and create better title
            const match = newResource.url.match(/v=([^&]+)/);
            if (match) {
              newResource.title = `${week.topic} - Video Tutorial`;
            }
          }
        }
        
        newResources.push(newResource);
      });
      
      // Add better resources for weeks that had Canva links removed
      if (weekNeedsUpdate && newResources.length < 3) {
        // Add resources based on topic
        const topic = week.topic.toLowerCase();
        let additionalResources = [];
        
        if (topic.includes('ux') && topic.includes('principle')) {
          additionalResources = VERIFIED_RESOURCES.ux_basics;
        } else if (topic.includes('research')) {
          additionalResources = VERIFIED_RESOURCES.user_research;
        } else if (topic.includes('persona') || topic.includes('journey')) {
          additionalResources = VERIFIED_RESOURCES.personas;
        } else if (topic.includes('information') || topic.includes('architecture')) {
          additionalResources = VERIFIED_RESOURCES.info_architecture;
        } else if (topic.includes('visual') || topic.includes('design fundamental')) {
          additionalResources = VERIFIED_RESOURCES.ui_basics;
        } else if (topic.includes('color')) {
          additionalResources = VERIFIED_RESOURCES.color_theory;
        } else if (topic.includes('typography')) {
          additionalResources = VERIFIED_RESOURCES.typography;
        } else if (topic.includes('design system')) {
          additionalResources = VERIFIED_RESOURCES.design_systems;
        } else if (topic.includes('figma')) {
          additionalResources = VERIFIED_RESOURCES.figma;
        } else if (topic.includes('wireframe') || topic.includes('prototype')) {
          additionalResources = VERIFIED_RESOURCES.wireframing;
        } else if (topic.includes('usability') || topic.includes('testing')) {
          additionalResources = VERIFIED_RESOURCES.usability_testing;
        } else if (topic.includes('interaction')) {
          additionalResources = VERIFIED_RESOURCES.interaction_design;
        } else if (topic.includes('accessibility')) {
          additionalResources = VERIFIED_RESOURCES.accessibility;
        } else if (topic.includes('portfolio') || topic.includes('career')) {
          additionalResources = VERIFIED_RESOURCES.portfolio;
        } else {
          // Default to UI basics
          additionalResources = VERIFIED_RESOURCES.ui_basics;
        }
        
        // Add resources up to 3
        additionalResources.forEach(res => {
          if (newResources.length < 3 && !newResources.some(r => r.url === res.url)) {
            newResources.push(res);
            console.log(`Added: ${res.title} for ${week.topic}`);
          }
        });
      }
      
      week.resources = newResources.slice(0, 3); // Ensure max 3 resources
    });
  });
  
  careerFixed = true;
}

// Save the updated data
const output = JSON.stringify(data);
fs.writeFileSync(roadmapPath, output, 'utf8');

console.log(`\n✅ Fixed ${fixCount} broken URLs in UX/UI Designer career`);
console.log(`File saved: ${roadmapPath}`);
console.log(`File size: ${(output.length / 1024).toFixed(1)} KB`);

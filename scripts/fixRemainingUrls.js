/**
 * Fix remaining broken URLs - Round 2
 */

const fs = require('fs');
const path = require('path');

const roadmapPath = path.join(__dirname, '../careerdata/roadmapData.json');
const roadmapData = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));

// Specific URL replacements for known broken links
const SPECIFIC_FIXES = {
  // Unity Learn broken URL
  'https://learn.unity.com/tutorials': {
    title: 'Unity Tutorials',
    url: 'https://learn.unity.com/',
    type: 'Tutorial Platform',
    platform: 'Unity Learn',
    duration: 'Self-paced'
  },
  // Jenkins - use GitHub Actions as alternative
  'https://www.jenkins.io/doc/tutorials/': {
    title: 'GitHub Actions Quickstart',
    url: 'https://docs.github.com/en/actions/quickstart',
    type: 'Documentation',
    platform: 'GitHub Docs',
    duration: '30 mins'
  },
  // Atlassian bug tracking
  'https://www.atlassian.com/software/jira/guides/bugs-issues/overview': {
    title: 'Jira Bug Tracking Guide',
    url: 'https://www.atlassian.com/software/jira/guides/getting-started/basics',
    type: 'Tutorial',
    platform: 'Atlassian',
    duration: '30 mins'
  },
  // W3Schools bash - doesn't exist, use Linux tutorial
  'https://www.w3schools.com/whatis/whatis_bash.asp': {
    title: 'Bash Scripting Basics',
    url: 'https://ubuntu.com/tutorials/command-line-for-beginners',
    type: 'Tutorial',
    platform: 'Ubuntu',
    duration: '1 hour'
  },
  // W3Schools datascience SQL - correct URL
  'https://www.w3schools.com/datascience/ds_sql.asp': {
    title: 'SQL for Data Science',
    url: 'https://www.w3schools.com/sql/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  // Adobe slow - use alternative
  'https://www.adobe.com/learn.html': {
    title: 'Adobe Creative Cloud Tutorials',
    url: 'https://helpx.adobe.com/creative-cloud/tutorials.html',
    type: 'Tutorial',
    platform: 'Adobe',
    duration: '2 hours'
  },
  // Nielsen Norman Group - slow but usually works, replace with faster alternatives
  'https://www.nngroup.com/articles/definition-user-experience/': {
    title: 'What is UX Design',
    url: 'https://www.interaction-design.org/literature/topics/ux-design',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/usability-testing-101/': {
    title: 'Usability Testing Guide',
    url: 'https://www.interaction-design.org/literature/topics/usability-testing',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/which-ux-research-methods/': {
    title: 'UX Research Methods',
    url: 'https://www.interaction-design.org/literature/topics/ux-research',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/persona/': {
    title: 'User Personas Guide',
    url: 'https://www.interaction-design.org/literature/topics/personas',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/ux-maturity-model/': {
    title: 'UX Strategy',
    url: 'https://www.interaction-design.org/literature/topics/ux-strategy',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/design-systems-101/': {
    title: 'Design Systems Guide',
    url: 'https://www.designsystems.com/',
    type: 'Resource',
    platform: 'Design Systems',
    duration: '1 hour'
  },
  'https://www.nngroup.com/articles/user-interviews/': {
    title: 'User Interview Guide',
    url: 'https://www.interaction-design.org/literature/topics/user-interviews',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/affinity-diagram/': {
    title: 'UX Research Analysis',
    url: 'https://www.interaction-design.org/literature/topics/ux-research',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/wireflows/': {
    title: 'Wireframing Basics',
    url: 'https://www.interaction-design.org/literature/topics/wireframing',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/': {
    title: 'Prototyping Guide',
    url: 'https://www.interaction-design.org/literature/topics/prototyping',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/iterative-design/': {
    title: 'Design Iteration',
    url: 'https://www.interaction-design.org/literature/topics/design-iteration',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  },
  'https://www.nngroup.com/articles/microinteractions/': {
    title: 'Microinteractions Design',
    url: 'https://www.interaction-design.org/literature/topics/microinteractions',
    type: 'Article',
    platform: 'IxDF',
    duration: '30 mins'
  }
};

let fixedCount = 0;

// Process all careers
const careers = roadmapData.careers;

Object.entries(careers).forEach(([careerName, careerData]) => {
  if (!careerData.roadmap) return;
  
  Object.entries(careerData.roadmap).forEach(([stepKey, step]) => {
    if (!step.weeks) return;
    
    Object.entries(step.weeks).forEach(([weekKey, week]) => {
      if (!week.resources || !Array.isArray(week.resources)) return;
      
      week.resources = week.resources.map((resource) => {
        const url = typeof resource === 'string' ? resource : resource.url;
        
        if (SPECIFIC_FIXES[url]) {
          fixedCount++;
          console.log(`Fixed: ${careerName} - Step ${parseInt(stepKey)+1} - ${url.substring(0, 50)}...`);
          return { ...SPECIFIC_FIXES[url] };
        }
        
        return resource;
      });
    });
  });
});

console.log(`\n✅ Fixed ${fixedCount} additional URLs\n`);

// Save the fixed data
fs.writeFileSync(roadmapPath, JSON.stringify(roadmapData));

console.log(`📦 Final file size: ${(fs.statSync(roadmapPath).size / 1024).toFixed(1)} KB`);

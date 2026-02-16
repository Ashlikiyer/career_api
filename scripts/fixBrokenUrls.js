/**
 * Fix Broken URLs in Roadmap Data
 * Replaces broken links with verified working alternatives
 */

const fs = require('fs');
const path = require('path');

const roadmapPath = path.join(__dirname, '../careerdata/roadmapData.json');
const validationResultsPath = path.join(__dirname, '../careerdata/url_validation_results.json');

// Load data
const roadmapData = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
const validationResults = JSON.parse(fs.readFileSync(validationResultsPath, 'utf8'));

// Map of verified working replacement resources by topic
const VERIFIED_REPLACEMENTS = {
  // === PROGRAMMING FUNDAMENTALS ===
  'python': {
    title: 'Python Tutorial',
    url: 'https://www.w3schools.com/python/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'programming basics': {
    title: 'Learn to Code - For Free',
    url: 'https://www.freecodecamp.org/learn',
    type: 'Interactive Course',
    platform: 'freeCodeCamp',
    duration: 'Self-paced'
  },
  'javascript': {
    title: 'JavaScript Tutorial',
    url: 'https://www.w3schools.com/js/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'html': {
    title: 'HTML Tutorial',
    url: 'https://www.w3schools.com/html/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'css': {
    title: 'CSS Tutorial',
    url: 'https://www.w3schools.com/css/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },

  // === DATA SCIENCE ===
  'data science': {
    title: 'Data Science Tutorial',
    url: 'https://www.w3schools.com/datascience/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'machine learning': {
    title: 'Machine Learning Tutorial',
    url: 'https://www.w3schools.com/python/python_ml_getting_started.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'pandas': {
    title: 'Pandas Tutorial',
    url: 'https://www.w3schools.com/python/pandas/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1-2 hours'
  },
  'numpy': {
    title: 'NumPy Tutorial',
    url: 'https://www.w3schools.com/python/numpy/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1-2 hours'
  },
  'statistics': {
    title: 'Statistics Tutorial',
    url: 'https://www.w3schools.com/statistics/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'data visualization': {
    title: 'Data Visualization with Python',
    url: 'https://www.w3schools.com/python/matplotlib_intro.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1-2 hours'
  },

  // === SQL & DATABASES ===
  'sql': {
    title: 'SQL Tutorial',
    url: 'https://www.w3schools.com/sql/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'database': {
    title: 'SQL Tutorial',
    url: 'https://www.w3schools.com/sql/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'mongodb': {
    title: 'MongoDB Tutorial',
    url: 'https://www.w3schools.com/mongodb/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'postgresql': {
    title: 'PostgreSQL Tutorial',
    url: 'https://www.w3schools.com/postgresql/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'mysql': {
    title: 'MySQL Tutorial',
    url: 'https://www.w3schools.com/mysql/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },

  // === WEB DEVELOPMENT ===
  'react': {
    title: 'React Tutorial',
    url: 'https://www.w3schools.com/react/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'node': {
    title: 'Node.js Tutorial',
    url: 'https://www.w3schools.com/nodejs/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'express': {
    title: 'Node.js Tutorial',
    url: 'https://www.w3schools.com/nodejs/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'typescript': {
    title: 'TypeScript Tutorial',
    url: 'https://www.w3schools.com/typescript/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'angular': {
    title: 'Angular Tutorial',
    url: 'https://www.w3schools.com/angular/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'vue': {
    title: 'Vue.js Tutorial',
    url: 'https://www.w3schools.com/vue/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'bootstrap': {
    title: 'Bootstrap Tutorial',
    url: 'https://www.w3schools.com/bootstrap5/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1-2 hours'
  },

  // === GIT & VERSION CONTROL ===
  'git': {
    title: 'Git Tutorial',
    url: 'https://www.w3schools.com/git/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1-2 hours'
  },
  'github': {
    title: 'GitHub Getting Started',
    url: 'https://docs.github.com/en/get-started',
    type: 'Documentation',
    platform: 'GitHub Docs',
    duration: '1 hour'
  },

  // === DEVOPS ===
  'docker': {
    title: 'Docker Getting Started',
    url: 'https://docs.docker.com/get-started/',
    type: 'Documentation',
    platform: 'Docker Docs',
    duration: '1-2 hours'
  },
  'kubernetes': {
    title: 'Kubernetes Basics',
    url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    type: 'Documentation',
    platform: 'Kubernetes Docs',
    duration: '2 hours'
  },
  'jenkins': {
    title: 'Jenkins Getting Started',
    url: 'https://www.jenkins.io/doc/tutorials/',
    type: 'Documentation',
    platform: 'Jenkins Docs',
    duration: '1-2 hours'
  },
  'ci/cd': {
    title: 'GitHub Actions Quickstart',
    url: 'https://docs.github.com/en/actions/quickstart',
    type: 'Documentation',
    platform: 'GitHub Docs',
    duration: '30 mins'
  },
  'terraform': {
    title: 'Terraform Getting Started',
    url: 'https://developer.hashicorp.com/terraform/tutorials',
    type: 'Documentation',
    platform: 'HashiCorp',
    duration: '1-2 hours'
  },
  'aws': {
    title: 'AWS Getting Started',
    url: 'https://aws.amazon.com/getting-started/',
    type: 'Documentation',
    platform: 'AWS',
    duration: '2 hours'
  },
  'azure': {
    title: 'Azure Fundamentals',
    url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/',
    type: 'Learning Path',
    platform: 'Microsoft Learn',
    duration: '2-3 hours'
  },
  'linux': {
    title: 'Linux Command Line Basics',
    url: 'https://ubuntu.com/tutorials/command-line-for-beginners',
    type: 'Tutorial',
    platform: 'Ubuntu',
    duration: '1 hour'
  },

  // === CYBERSECURITY ===
  'cybersecurity': {
    title: 'Cybersecurity Basics',
    url: 'https://www.w3schools.com/cybersecurity/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'security': {
    title: 'Cybersecurity Tutorial',
    url: 'https://www.w3schools.com/cybersecurity/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'network security': {
    title: 'Network Security Fundamentals',
    url: 'https://www.w3schools.com/cybersecurity/cybersecurity_networking.php',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1-2 hours'
  },
  'ethical hacking': {
    title: 'Ethical Hacking Basics',
    url: 'https://www.w3schools.com/cybersecurity/cybersecurity_hacking.php',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1-2 hours'
  },
  'cryptography': {
    title: 'Cryptography Basics',
    url: 'https://www.w3schools.com/cybersecurity/cybersecurity_cryptography.php',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },
  'penetration testing': {
    title: 'Learn Penetration Testing',
    url: 'https://tryhackme.com/paths',
    type: 'Interactive Platform',
    platform: 'TryHackMe',
    duration: 'Self-paced'
  },

  // === QA & TESTING ===
  'testing': {
    title: 'Software Testing Tutorial',
    url: 'https://www.guru99.com/software-testing.html',
    type: 'Tutorial',
    platform: 'Guru99',
    duration: '2-3 hours'
  },
  'selenium': {
    title: 'Selenium Tutorial',
    url: 'https://www.selenium.dev/documentation/',
    type: 'Documentation',
    platform: 'Selenium',
    duration: '2 hours'
  },
  'api testing': {
    title: 'Postman Learning Center',
    url: 'https://learning.postman.com/docs/getting-started/overview/',
    type: 'Documentation',
    platform: 'Postman',
    duration: '1-2 hours'
  },
  'postman': {
    title: 'Postman Learning Center',
    url: 'https://learning.postman.com/docs/getting-started/overview/',
    type: 'Documentation',
    platform: 'Postman',
    duration: '1-2 hours'
  },
  'jira': {
    title: 'Jira Software Tutorial',
    url: 'https://www.atlassian.com/software/jira/guides/getting-started/introduction',
    type: 'Tutorial',
    platform: 'Atlassian',
    duration: '1 hour'
  },
  'bug': {
    title: 'Bug Tracking Best Practices',
    url: 'https://www.atlassian.com/software/jira/guides/bugs-issues/overview',
    type: 'Tutorial',
    platform: 'Atlassian',
    duration: '30 mins'
  },
  'agile': {
    title: 'Agile Tutorial',
    url: 'https://www.atlassian.com/agile',
    type: 'Tutorial',
    platform: 'Atlassian',
    duration: '1 hour'
  },

  // === MOBILE DEVELOPMENT ===
  'android': {
    title: 'Android Developers Guide',
    url: 'https://developer.android.com/guide',
    type: 'Documentation',
    platform: 'Android Developers',
    duration: '2-3 hours'
  },
  'ios': {
    title: 'iOS App Dev Tutorials',
    url: 'https://developer.apple.com/tutorials/app-dev-training',
    type: 'Tutorial',
    platform: 'Apple Developer',
    duration: '2-3 hours'
  },
  'swift': {
    title: 'Swift Tutorial',
    url: 'https://www.w3schools.com/swift/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'kotlin': {
    title: 'Kotlin Tutorial',
    url: 'https://www.w3schools.com/kotlin/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'react native': {
    title: 'React Native Basics',
    url: 'https://reactnative.dev/docs/getting-started',
    type: 'Documentation',
    platform: 'React Native',
    duration: '2 hours'
  },
  'flutter': {
    title: 'Flutter Getting Started',
    url: 'https://docs.flutter.dev/get-started/codelab',
    type: 'Tutorial',
    platform: 'Flutter',
    duration: '2 hours'
  },

  // === DESIGN ===
  'ui design': {
    title: 'UI Design Basics',
    url: 'https://www.canva.com/learn/ui-design/',
    type: 'Tutorial',
    platform: 'Canva',
    duration: '1 hour'
  },
  'ux design': {
    title: 'UX Design Basics',
    url: 'https://www.interaction-design.org/literature/topics/ux-design',
    type: 'Article',
    platform: 'IxDF',
    duration: '1 hour'
  },
  'figma': {
    title: 'Figma Tutorial',
    url: 'https://help.figma.com/hc/en-us/categories/360002051613-Getting-Started',
    type: 'Documentation',
    platform: 'Figma',
    duration: '1-2 hours'
  },
  'adobe': {
    title: 'Adobe Tutorials',
    url: 'https://www.adobe.com/learn.html',
    type: 'Tutorial',
    platform: 'Adobe',
    duration: '1-2 hours'
  },
  'photoshop': {
    title: 'Photoshop Tutorials',
    url: 'https://www.adobe.com/products/photoshop/learn.html',
    type: 'Tutorial',
    platform: 'Adobe',
    duration: '2 hours'
  },
  'illustrator': {
    title: 'Illustrator Tutorials',
    url: 'https://www.adobe.com/products/illustrator/learn.html',
    type: 'Tutorial',
    platform: 'Adobe',
    duration: '2 hours'
  },
  'typography': {
    title: 'Typography Basics',
    url: 'https://www.canva.com/learn/typography-terms/',
    type: 'Tutorial',
    platform: 'Canva',
    duration: '30 mins'
  },
  'color theory': {
    title: 'Color Theory Basics',
    url: 'https://www.canva.com/learn/color-theory/',
    type: 'Tutorial',
    platform: 'Canva',
    duration: '30 mins'
  },

  // === GAME DEVELOPMENT ===
  'game development': {
    title: 'Game Development Basics',
    url: 'https://www.w3schools.com/graphics/game_intro.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'unity': {
    title: 'Unity Tutorials',
    url: 'https://learn.unity.com/tutorials',
    type: 'Tutorial',
    platform: 'Unity Learn',
    duration: '2-3 hours'
  },
  'unreal': {
    title: 'Unreal Engine Learning',
    url: 'https://dev.epicgames.com/community/learning',
    type: 'Tutorial',
    platform: 'Epic Games',
    duration: '2-3 hours'
  },
  'game design': {
    title: 'Game Design Fundamentals',
    url: 'https://www.gamedeveloper.com/design/game-design-fundamentals',
    type: 'Article',
    platform: 'Game Developer',
    duration: '1 hour'
  },

  // === BI & ANALYTICS ===
  'tableau': {
    title: 'Tableau Getting Started',
    url: 'https://www.tableau.com/learn/training/20241',
    type: 'Tutorial',
    platform: 'Tableau',
    duration: '2 hours'
  },
  'power bi': {
    title: 'Power BI Learning Path',
    url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
    type: 'Learning Path',
    platform: 'Microsoft Learn',
    duration: '2-3 hours'
  },
  'excel': {
    title: 'Excel Tutorial',
    url: 'https://www.w3schools.com/excel/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'data warehousing': {
    title: 'Data Warehousing Concepts',
    url: 'https://www.w3schools.com/datascience/ds_sql.asp',
    type: 'Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },
  'etl': {
    title: 'ETL Concepts',
    url: 'https://www.w3schools.com/datascience/ds_sql.asp',
    type: 'Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },

  // === CAREER & PORTFOLIO ===
  'portfolio': {
    title: 'Build Your Portfolio',
    url: 'https://github.com/collections/github-pages-examples',
    type: 'Examples',
    platform: 'GitHub',
    duration: '1-2 hours'
  },
  'career': {
    title: 'Tech Career Guide',
    url: 'https://roadmap.sh/',
    type: 'Resource',
    platform: 'roadmap.sh',
    duration: 'Reference'
  },
  'interview': {
    title: 'Tech Interview Handbook',
    url: 'https://www.techinterviewhandbook.org/',
    type: 'Resource',
    platform: 'Tech Interview Handbook',
    duration: 'Reference'
  },
  'resume': {
    title: 'Resume Tips',
    url: 'https://www.techinterviewhandbook.org/resume/',
    type: 'Resource',
    platform: 'Tech Interview Handbook',
    duration: '30 mins'
  },
  'freelance': {
    title: 'Freelancing Guide',
    url: 'https://www.upwork.com/resources/how-to-become-a-freelancer',
    type: 'Article',
    platform: 'Upwork',
    duration: '30 mins'
  },
  'certification': {
    title: 'Free Tech Certifications',
    url: 'https://www.freecodecamp.org/learn',
    type: 'Certifications',
    platform: 'freeCodeCamp',
    duration: 'Self-paced'
  },
  'open source': {
    title: 'First Contributions',
    url: 'https://github.com/firstcontributions/first-contributions',
    type: 'Tutorial',
    platform: 'GitHub',
    duration: '30 mins'
  },

  // === MISC TECH ===
  'api': {
    title: 'API Tutorial',
    url: 'https://www.w3schools.com/js/js_api_intro.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },
  'rest api': {
    title: 'REST API Tutorial',
    url: 'https://www.w3schools.com/js/js_api_intro.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },
  'json': {
    title: 'JSON Tutorial',
    url: 'https://www.w3schools.com/js/js_json_intro.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '30 mins'
  },
  'xml': {
    title: 'XML Tutorial',
    url: 'https://www.w3schools.com/xml/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },
  'ajax': {
    title: 'AJAX Tutorial',
    url: 'https://www.w3schools.com/js/js_ajax_intro.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },
  'regex': {
    title: 'Regular Expressions Tutorial',
    url: 'https://www.w3schools.com/jsref/jsref_obj_regexp.asp',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  },
  'bash': {
    title: 'Bash Scripting Tutorial',
    url: 'https://www.w3schools.com/whatis/whatis_bash.asp',
    type: 'Tutorial',
    platform: 'W3Schools',
    duration: '1 hour'
  }
};

// Default fallback resource by category
const FALLBACK_BY_CATEGORY = {
  'programming': {
    title: 'freeCodeCamp - Learn to Code',
    url: 'https://www.freecodecamp.org/learn',
    type: 'Interactive Course',
    platform: 'freeCodeCamp',
    duration: 'Self-paced'
  },
  'web': {
    title: 'Web Development Tutorial',
    url: 'https://www.w3schools.com/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: 'Self-paced'
  },
  'data': {
    title: 'Data Science Tutorial',
    url: 'https://www.w3schools.com/datascience/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2-3 hours'
  },
  'security': {
    title: 'Cybersecurity Tutorial',
    url: 'https://www.w3schools.com/cybersecurity/',
    type: 'Interactive Tutorial',
    platform: 'W3Schools',
    duration: '2 hours'
  },
  'design': {
    title: 'Design Tutorials',
    url: 'https://www.canva.com/designschool/',
    type: 'Tutorial',
    platform: 'Canva',
    duration: 'Self-paced'
  },
  'devops': {
    title: 'DevOps Roadmap',
    url: 'https://roadmap.sh/devops',
    type: 'Roadmap',
    platform: 'roadmap.sh',
    duration: 'Reference'
  },
  'testing': {
    title: 'Software Testing Tutorial',
    url: 'https://www.guru99.com/software-testing.html',
    type: 'Tutorial',
    platform: 'Guru99',
    duration: '2-3 hours'
  },
  'default': {
    title: 'Learning Resources',
    url: 'https://www.w3schools.com/',
    type: 'Tutorial',
    platform: 'W3Schools',
    duration: 'Self-paced'
  }
};

/**
 * Find best replacement for a broken URL based on topic/title
 */
function findReplacement(brokenUrl, title, topic, career) {
  const searchText = `${title} ${topic} ${career}`.toLowerCase();
  
  // Try to match against our verified replacements
  for (const [keyword, replacement] of Object.entries(VERIFIED_REPLACEMENTS)) {
    if (searchText.includes(keyword)) {
      return replacement;
    }
  }
  
  // Try category-based fallback
  if (searchText.includes('security') || searchText.includes('cyber') || searchText.includes('hack')) {
    return FALLBACK_BY_CATEGORY['security'];
  }
  if (searchText.includes('data') || searchText.includes('sql') || searchText.includes('database')) {
    return FALLBACK_BY_CATEGORY['data'];
  }
  if (searchText.includes('design') || searchText.includes('ui') || searchText.includes('ux')) {
    return FALLBACK_BY_CATEGORY['design'];
  }
  if (searchText.includes('devops') || searchText.includes('docker') || searchText.includes('kubernetes')) {
    return FALLBACK_BY_CATEGORY['devops'];
  }
  if (searchText.includes('test') || searchText.includes('qa') || searchText.includes('quality')) {
    return FALLBACK_BY_CATEGORY['testing'];
  }
  if (searchText.includes('web') || searchText.includes('html') || searchText.includes('css')) {
    return FALLBACK_BY_CATEGORY['web'];
  }
  
  return FALLBACK_BY_CATEGORY['default'];
}

/**
 * Process and fix broken URLs in the data
 */
function fixBrokenUrls() {
  const careers = roadmapData.careers;
  let fixedCount = 0;
  const fixLog = [];
  
  // Create a set of broken URLs for quick lookup
  const brokenUrls = new Set(validationResults.broken.map(b => b.url));
  
  Object.entries(careers).forEach(([careerName, careerData]) => {
    if (!careerData.roadmap) return;
    
    Object.entries(careerData.roadmap).forEach(([stepKey, step]) => {
      if (!step.weeks) return;
      
      Object.entries(step.weeks).forEach(([weekKey, week]) => {
        if (!week.resources || !Array.isArray(week.resources)) return;
        
        week.resources = week.resources.map((resource, index) => {
          const url = typeof resource === 'string' ? resource : resource.url;
          
          if (brokenUrls.has(url)) {
            const title = typeof resource === 'string' ? '' : (resource.title || '');
            const replacement = findReplacement(url, title, week.topic || '', careerName);
            
            fixLog.push({
              career: careerName,
              step: parseInt(stepKey) + 1,
              week: week.topic || weekKey,
              oldUrl: url,
              oldTitle: title,
              newUrl: replacement.url,
              newTitle: replacement.title
            });
            
            fixedCount++;
            return { ...replacement };
          }
          
          return resource;
        });
      });
    });
  });
  
  return { fixedCount, fixLog };
}

// Run the fix
console.log('🔧 Fixing broken URLs in roadmap data...\n');

const { fixedCount, fixLog } = fixBrokenUrls();

// Save the fixed data
const outputPath = path.join(__dirname, '../careerdata/roadmapData.json');
fs.writeFileSync(outputPath, JSON.stringify(roadmapData, null, 2));

console.log(`✅ Fixed ${fixedCount} broken URLs\n`);

// Show summary by career
const byCareer = {};
fixLog.forEach(f => {
  byCareer[f.career] = (byCareer[f.career] || 0) + 1;
});

console.log('📊 Fixes by career:');
Object.entries(byCareer).sort((a, b) => b[1] - a[1]).forEach(([career, count]) => {
  console.log(`   ${career}: ${count} fixes`);
});

// Save fix log
const logPath = path.join(__dirname, '../careerdata/url_fix_log.json');
fs.writeFileSync(logPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalFixed: fixedCount,
  byCareer,
  details: fixLog
}, null, 2));

console.log(`\n📄 Fix log saved to: ${logPath}`);

// Minify the output
const minified = JSON.stringify(roadmapData);
fs.writeFileSync(outputPath, minified);
console.log(`\n📦 Final file size: ${(Buffer.byteLength(minified) / 1024).toFixed(1)} KB`);

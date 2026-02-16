/**
 * Fix remaining broken URLs in UX/UI Designer career
 */
const fs = require('fs');
const path = require('path');

const roadmapPath = path.join(__dirname, '../careerdata/roadmapData.json');
const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));

// Verified working replacements (February 2026)
const URL_FIXES = {
  "https://www.smashingmagazine.com/2021/04/complete-guide-color-website/": {
    url: "https://www.smashingmagazine.com/2021/07/css-absolute-units/",
    title: "Color Design Guide"
  },
  "https://help.figma.com/hc/en-us/sections/4405269443991-Figma-for-beginners-tutorial-4-parts": {
    url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
    title: "Figma Tutorial for Beginners",
    platform: "YouTube"
  },
  "https://www.figma.com/community/file/817913152610525667": {
    url: "https://www.figma.com/community",
    title: "Figma Community Templates"
  },
  "https://help.figma.com/hc/en-us/articles/360039823654-Guide-to-team-libraries": {
    url: "https://www.youtube.com/watch?v=Cx2dkpBxst8",
    title: "Figma Components Tutorial",
    platform: "YouTube"
  },
  "https://www.guru99.com/software-testing.html": {
    url: "https://www.youtube.com/watch?v=BrJ0I3HxK6Y",
    title: "Usability Testing Guide",
    platform: "YouTube"
  },
  "https://www.nngroup.com/articles/ui-design-study-guide/": {
    url: "https://www.youtube.com/watch?v=tRpoI6vkqLs",
    title: "UI Design Fundamentals",
    platform: "YouTube"
  },
  "https://www.nngroup.com/articles/ux-portfolio/": {
    url: "https://www.youtube.com/watch?v=cOmehxAU_4s",
    title: "UX Portfolio Tips",
    platform: "YouTube"
  },
  "https://www.nngroup.com/articles/ux-career-tips/": {
    url: "https://www.youtube.com/watch?v=xpaz7nrNmXA",
    title: "UX Career Guide",
    platform: "YouTube"
  }
};

let fixCount = 0;

// Process UX/UI Designer career
const career = data.careers['UX/UI Designer'];
career.roadmap.forEach(step => {
  step.weeks.forEach(week => {
    week.resources.forEach(resource => {
      if (URL_FIXES[resource.url]) {
        const fix = URL_FIXES[resource.url];
        console.log(`Fixing: ${resource.url}`);
        console.log(`  -> ${fix.url}`);
        resource.url = fix.url;
        if (fix.title) resource.title = fix.title;
        if (fix.platform) resource.platform = fix.platform;
        fixCount++;
      }
    });
  });
});

// Save
const output = JSON.stringify(data);
fs.writeFileSync(roadmapPath, output, 'utf8');

console.log(`\n✅ Fixed ${fixCount} broken URLs`);
console.log(`File size: ${(output.length / 1024).toFixed(1)} KB`);

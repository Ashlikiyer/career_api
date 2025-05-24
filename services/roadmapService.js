const roadmapData = require('../careerData/roadmapData.json');

const getRoadmapForCareer = (careerName) => {
  const careerRoadmap = roadmapData.careers[careerName];
  if (!careerRoadmap) {
    throw new Error(`No roadmap found for career: ${careerName}`);
  }
  return careerRoadmap.roadmap;
};

module.exports = { getRoadmapForCareer };
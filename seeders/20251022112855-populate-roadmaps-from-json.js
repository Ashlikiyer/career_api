'use strict';

const roadmapData = require('../careerdata/roadmapData.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Populate roadmaps table from JSON data
    const roadmapsToInsert = [];

    for (const [careerName, careerData] of Object.entries(roadmapData.careers)) {
      const roadmap = careerData.roadmap;
      if (roadmap && roadmap.length > 0) {
        roadmapsToInsert.push({
          career_name: careerName,
          description: `Career roadmap for ${careerName} with ${roadmap.length} steps`,
          total_steps: roadmap.length,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    if (roadmapsToInsert.length > 0) {
      await queryInterface.bulkInsert('roadmaps', roadmapsToInsert, {});
    }

    console.log(`Populated ${roadmapsToInsert.length} roadmaps from JSON data`);
  },

  async down (queryInterface, Sequelize) {
    // Remove all roadmaps
    await queryInterface.bulkDelete('roadmaps', null, {});
  }
};

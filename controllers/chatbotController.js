const groq = require('../utils/groqClient');

// IT industry keywords for validation
const IT_KEYWORDS = [
  // Career-related
  'career', 'job', 'salary', 'skills', 'requirements', 'responsibilities', 'developer', 'engineer',
  'programmer', 'analyst', 'designer', 'tester', 'administrator', 'architect', 'manager',
  
  // Technologies
  'programming', 'coding', 'software', 'web', 'mobile', 'database', 'cloud', 'ai', 'ml',
  'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'azure', 'docker',
  
  // IT concepts
  'technology', 'computer', 'system', 'network', 'security', 'data', 'algorithm',
  'framework', 'api', 'frontend', 'backend', 'fullstack', 'devops', 'cybersecurity',
  
  // Design & Creative Tech
  'design', 'ui', 'ux', 'user', 'interface', 'experience', 'wireframe', 'prototype', 'mockup',
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'graphic', 'visual', 'branding',
  'typography', 'color', 'layout', 'responsive', 'mobile-first', 'accessibility', 'usability',
  'user-centered', 'human-computer', 'interaction', 'hci', 'product', 'digital',
  
  // Education & Learning
  'learn', 'study', 'course', 'certification', 'degree', 'bootcamp', 'tutorial',
  'roadmap', 'path', 'guide', 'resources', 'books', 'practice',
  
  // Industry terms
  'it', 'tech', 'startup', 'company', 'remote', 'freelance', 'interview', 'resume',
  'portfolio', 'github', 'project', 'experience', 'internship'
];

// Career information database
const CAREER_INFO = {
  'Software Engineer': {
    description: 'Software Engineers design, develop, and maintain software applications and systems.',
    responsibilities: [
      'Write clean, efficient, and maintainable code',
      'Design software architecture and systems',
      'Debug and troubleshoot applications',
      'Collaborate with cross-functional teams',
      'Participate in code reviews and testing'
    ],
    skills: ['Programming languages (Java, Python, C++)', 'Problem-solving', 'Software design patterns', 'Version control (Git)', 'Testing frameworks'],
    salary: '$70,000 - $150,000+ annually',
    growth: 'High demand with 22% job growth expected',
    pathways: ['Junior Developer → Senior Developer → Lead Engineer → Engineering Manager']
  },
  
  'Data Scientist': {
    description: 'Data Scientists analyze complex data to help organizations make informed business decisions.',
    responsibilities: [
      'Collect and analyze large datasets',
      'Build predictive models and algorithms',
      'Create data visualizations and reports',
      'Collaborate with stakeholders to understand business needs',
      'Present findings to non-technical audiences'
    ],
    skills: ['Python/R programming', 'Statistics and mathematics', 'Machine learning', 'SQL databases', 'Data visualization tools'],
    salary: '$80,000 - $160,000+ annually',
    growth: 'Excellent growth with 35% job growth expected',
    pathways: ['Data Analyst → Data Scientist → Senior Data Scientist → Data Science Manager']
  },
  
  'UX/UI Designer': {
    description: 'UX/UI Designers create intuitive and visually appealing user interfaces for digital products.',
    responsibilities: [
      'Research user needs and behaviors',
      'Create wireframes and prototypes',
      'Design user interfaces and visual elements',
      'Conduct usability testing',
      'Collaborate with developers and product managers'
    ],
    skills: ['Design tools (Figma, Sketch, Adobe)', 'User research methods', 'Prototyping', 'HTML/CSS basics', 'Design thinking'],
    salary: '$60,000 - $130,000+ annually',
    growth: 'Strong demand with 13% job growth expected',
    pathways: ['Junior Designer → UX/UI Designer → Senior Designer → Design Lead']
  },
  
  'QA Tester': {
    description: 'QA Testers ensure software quality by identifying bugs and verifying functionality.',
    responsibilities: [
      'Create and execute test plans',
      'Identify and document software defects',
      'Perform manual and automated testing',
      'Collaborate with development teams',
      'Ensure compliance with quality standards'
    ],
    skills: ['Testing methodologies', 'Test automation tools', 'Bug tracking systems', 'SQL basics', 'Attention to detail'],
    salary: '$45,000 - $100,000+ annually',
    growth: 'Steady demand with 8% job growth expected',
    pathways: ['QA Tester → Senior QA → QA Lead → QA Manager']
  },
  
  'Web Developer': {
    description: 'Web Developers build and maintain websites and web applications.',
    responsibilities: [
      'Develop responsive web applications',
      'Write HTML, CSS, and JavaScript code',
      'Optimize websites for performance',
      'Integrate with databases and APIs',
      'Ensure cross-browser compatibility'
    ],
    skills: ['HTML/CSS/JavaScript', 'Frontend frameworks (React, Vue)', 'Backend technologies', 'Responsive design', 'Web performance optimization'],
    salary: '$50,000 - $120,000+ annually',
    growth: 'High demand with 20% job growth expected',
    pathways: ['Junior Web Developer → Web Developer → Senior Developer → Full-Stack Developer']
  },
  
  'Cybersecurity Engineer': {
    description: 'Cybersecurity Engineers protect organizations from digital threats and security breaches.',
    responsibilities: [
      'Monitor security systems and networks',
      'Conduct vulnerability assessments',
      'Implement security measures and protocols',
      'Respond to security incidents',
      'Develop security policies and procedures'
    ],
    skills: ['Network security', 'Ethical hacking', 'Security tools', 'Risk assessment', 'Compliance frameworks'],
    salary: '$80,000 - $160,000+ annually',
    growth: 'Excellent growth with 31% job growth expected',
    pathways: ['Security Analyst → Cybersecurity Engineer → Security Architect → CISO']
  }
};

const isITRelated = (question) => {
  const lowerQuestion = question.toLowerCase();
  return IT_KEYWORDS.some(keyword => lowerQuestion.includes(keyword));
};

const getCareerInfo = (careerName) => {
  // Normalize career name for lookup
  const normalizedName = careerName.replace(/\b(Engineer|Developer|Designer|Tester|Analyst)\b/g, '').trim();
  
  for (const [key, info] of Object.entries(CAREER_INFO)) {
    if (key.toLowerCase().includes(normalizedName.toLowerCase()) || 
        normalizedName.toLowerCase().includes(key.toLowerCase())) {
      return { career: key, ...info };
    }
  }
  return null;
};

const chatbotHistoryService = require('../services/chatbotHistoryService');

const getChatbotResponse = async (req, res) => {
  try {
    const { question, message, session_uuid, context } = req.body;
    const userId = req.user?.id;
    
    // Accept both 'question' and 'message' for backward compatibility
    const userMessage = message || question;
    
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    // Check if question is IT-related
    if (!isITRelated(userMessage)) {
      return res.json({
        response: "I'm an IT career assistant focused on helping with technology and career-related questions. I can help you with:\n\n" +
                 "• IT career information and guidance\n" +
                 "• Technology skills and learning paths\n" +
                 "• Software development questions\n" +
                 "• UI/UX design and digital creative roles\n" +
                 "• Career progression in tech\n" +
                 "• Programming and technical concepts\n\n" +
                 "Please ask me something related to IT careers or technology!",
        type: 'scope_limitation'
      });
    }

    // Check if asking about specific career from our database
    const careerInfo = getCareerInfo(userMessage);
    if (careerInfo) {
      const response = `**${careerInfo.career}**\n\n` +
                     `${careerInfo.description}\n\n` +
                     `**Key Responsibilities:**\n${careerInfo.responsibilities.map(r => `• ${r}`).join('\n')}\n\n` +
                     `**Required Skills:**\n${careerInfo.skills.map(s => `• ${s}`).join('\n')}\n\n` +
                     `**Salary Range:** ${careerInfo.salary}\n\n` +
                     `**Job Growth:** ${careerInfo.growth}\n\n` +
                     `**Career Path:** ${careerInfo.pathways[0]}`;
      
      // Prepare career info response
      const responseData = {
        response,
        type: 'career_info',
        career: careerInfo.career
      };

      // Handle session integration for career info
      if (session_uuid && userId) {
        try {
          const session = await chatbotHistoryService.findOrCreateSessionForAsk(session_uuid, userId);
          
          if (session) {
            // Save user message
            const savedUserMessage = await chatbotHistoryService.addMessage(session_uuid, userId, {
              message_type: 'user',
              content: userMessage
            });

            // Save bot response
            const botMessage = await chatbotHistoryService.addMessage(session_uuid, userId, {
              message_type: 'bot',
              content: response,
              response_type: 'career_info',
              career: careerInfo.career
            });

            responseData.session_uuid = session_uuid;
            responseData.message_saved = true;
            responseData.user_message_id = savedUserMessage.id;
            responseData.bot_message_id = botMessage.id;
          }
        } catch (sessionError) {
          console.error('Session save error (career info):', sessionError);
          responseData.message_saved = false;
        }
      }

      return res.json(responseData);
    }

    // Use Groq AI for IT-focused responses
    const prompt = `You are an IT career assistant chatbot. You ONLY answer questions related to:
    - IT careers and job roles including design roles
    - Technology skills and programming
    - Software development
    - UI/UX design, graphic design, and digital creative roles in tech
    - Career paths in technology and design
    - Learning resources for tech and design skills
    - IT industry trends and advice
    
    Keep responses focused, helpful, and professional. Design-related questions (UI/UX, graphic design, web design, product design) are PART OF IT and should be answered normally.
    
    Available IT careers you can discuss: Software Engineer, Data Scientist, Web Developer, Mobile App Developer, UX/UI Designer, Backend Developer, Frontend Developer, Cybersecurity Engineer, Machine Learning Engineer, Database Administrator, Systems Administrator, Computer Systems Analyst, Game Developer, DevOps Engineer, Business Intelligence Analyst, QA Tester, Graphic Designer, Product Designer, Visual Designer.
    
    Question: ${userMessage}
    
    Provide a helpful, informative response:`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Prepare response data
    const responseData = {
      response: aiResponse,
      type: 'ai_response'
    };

    // Handle session integration if session_uuid provided and user is authenticated
    let userMessageId = null;
    let botMessageId = null;
    let messageSaved = false;

    if (session_uuid && userId) {
      try {
        const session = await chatbotHistoryService.findOrCreateSessionForAsk(session_uuid, userId);
        
        if (session) {
          // Save user message
          const savedUserMsg = await chatbotHistoryService.addMessage(session_uuid, userId, {
            message_type: 'user',
            content: userMessage
          });
          userMessageId = savedUserMsg.id;

          // Save bot response
          const botMessage = await chatbotHistoryService.addMessage(session_uuid, userId, {
            message_type: 'bot',
            content: aiResponse,
            response_type: 'ai_response',
            career: null
          });
          botMessageId = botMessage.id;
          messageSaved = true;

          responseData.session_uuid = session_uuid;
          responseData.message_saved = messageSaved;
          responseData.user_message_id = userMessageId;
          responseData.bot_message_id = botMessageId;
        }
      } catch (sessionError) {
        console.error('Session save error:', sessionError);
        // Continue without session saving - don't fail the entire request
        responseData.message_saved = false;
      }
    }

    res.json(responseData);

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Failed to get chatbot response',
      details: error.message
    });
  }
};

const getChatbotSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "What is a Software Engineer?",
      "What skills do I need for Data Science?",
      "How to become a Web Developer?",
      "What's the salary range for UX/UI Designer?",
      "How to become a UI/UX designer?",
      "What tools do graphic designers use?",
      "Top programming languages to learn in 2024",
      "Career path for Cybersecurity Engineer",
      "What does a DevOps Engineer do?",
      "How to get started in Machine Learning?",
      "Best practices for Software Testing",
      "Remote work opportunities in IT",
      "Design skills needed for tech jobs",
      "Difference between UI and UX design"
    ];

    res.json({
      suggestions,
      categories: [
        'Career Information',
        'Skills & Learning',
        'Salary & Growth',
        'Getting Started',
        'Industry Trends'
      ]
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      error: 'Failed to get suggestions'
    });
  }
};

module.exports = {
  getChatbotResponse,
  getChatbotSuggestions
};
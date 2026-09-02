const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'go', 'rust', 'ruby', 'php',
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'remix',
  'node.js', 'express', 'fastify', 'nestjs', 'django', 'flask', 'spring', 'rails',
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
  'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'github actions',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui',
  'graphql', 'rest', 'grpc', 'websocket', 'microservices',
  'testing', 'jest', 'vitest', 'cypress', 'playwright', 'selenium',
  'agile', 'scrum', 'kanban', 'jira', 'confluence',
  'machine learning', 'ai', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch',
  'leadership', 'mentoring', 'code review', 'architecture', 'system design',
];

function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const foundSkills = COMMON_SKILLS.filter(skill => 
    lowerText.includes(skill.toLowerCase())
  );
  return [...new Set(foundSkills)];
}

function extractExperience(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const expKeywords = ['experience', 'work history', 'employment', 'professional experience'];
  const expLines = lines.filter(line => 
    expKeywords.some(kw => line.toLowerCase().includes(kw))
  );
  return expLines.slice(0, 5).join(' ');
}

function extractEducation(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const eduKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd'];
  const eduLines = lines.filter(line => 
    eduKeywords.some(kw => line.toLowerCase().includes(kw))
  );
  return eduLines.slice(0, 3).join(' ');
}

function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines[0] || '';
}

async function parsePDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

async function parseDOCX(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function parseResume(file) {
  let text = '';
  
  if (file.mimetype === 'application/pdf') {
    text = await parsePDF(file.buffer);
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await parseDOCX(file.buffer);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX.');
  }

  const skills = extractSkills(text);
  const experience = extractExperience(text);
  const education = extractEducation(text);
  const name = extractName(text);

  return {
    rawText: text,
    parsed: {
      name,
      skills,
      experience,
      education,
    },
  };
}

module.exports = { parseResume, extractSkills, extractExperience, extractEducation, extractName };
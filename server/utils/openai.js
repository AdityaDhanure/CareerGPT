import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';

// const openai = new OpenAI({ 
//   apiKey: config.OPENAI_API_KEY
// });

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEKSEEK_API_KEY,
  // defaultHeaders: {
  //   "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
  //   "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  // },
});

// export const generateRoadmapText = async (skills, goal) => {
//   const prompt = `Create a step-by-step 6-month learning roadmap to become a ${goal} using the user's current skills: ${skills.join(', ')}`;
//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [{ role: "user", content: prompt }],
//   });
//   return response.choices[0].message.content;
// };

export const generateRoadmapText = async (skills, goal) => {
  const prompt = `Create a step-by-step 6-month learning roadmap to become a ${goal} using the user's current skills: ${skills.join(', ')}`;
  const response = await openai.chat.completions.create({
    model: "deepseek/deepseek-r1:free",
    messages: [
      {
        role: "user",
        content: prompt 
      }
    ],
  });

  return response.choices[0].message.content;
}

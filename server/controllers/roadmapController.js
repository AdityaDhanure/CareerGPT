import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import { generateRoadmapText } from '../utils/openai.js';

import puppeteer from 'puppeteer'; // for PDF generation

export const generateRoadmap = async (req, res) => {
  try{
    const { skills, goal } = req.body.data;
    const content = await generateRoadmapText(skills, goal);
    const user = await User.findOne({
      _id: req.id
    });
    if (!user) {
      return res.status(404).json({
        msg: 'User not found!'
      });
    }
    const roadmap = await Roadmap.create({ user: user, title: goal, content });
    res.status(200).json({
      roadmap: {
        id: roadmap._id,
        title: roadmap.title,
        content: roadmap.content,
        createdAt: roadmap.createdAt,
        updatedAt: roadmap.updatedAt
      },
      msg: 'Roadmap generated successfully'
    });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    res.status(500).json({ 
      msg: 'Failed to generate roadmap.' 
    });
  }
};

export const getRoadmaps = async (req, res) => {
  try{
    const roadmaps = await Roadmap.find({ user: req.id });
    if (!roadmaps || roadmaps.length === 0) {
      return res.status(404).json({ 
        msg: 'No roadmaps found!' 
      });
    }
    res.json({
      roadmaps: roadmaps.map(roadmap => ({
        id: roadmap._id,
        title: roadmap.title,
        content: roadmap.content,
        createdAt: roadmap.createdAt,
        updatedAt: roadmap.updatedAt
      })),
      msg: 'Roadmaps fetched successfully'
    });
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ 
      msg: 'Failed to fetch roadmaps.' 
    });
  }
};

export const updateRoadmap = async (req, res) => {
  try{
    const { title } = req.body.data;
    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found!' 
      });
    }
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: user._id });
    if (!roadmap) {
      return res.status(404).json({ 
        msg: 'No roadmap found!'   
      });
    }
    roadmap.versions.push({ title: roadmap.title }); // versioning old title
    roadmap.title = title;

    await roadmap.save();

    res.json({
      roadmap: {
        id: roadmap._id,
        title: roadmap.title,
        content: roadmap.content,
        createdAt: roadmap.createdAt,
        updatedAt: roadmap.updatedAt
      },
      msg: 'Roadmap updated successfully'
    });
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ 
      msg: 'Failed to update roadmap.' 
    });
  }
};

export const deleteRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res.status(401).json({ 
        msg: "User not found!" 
      });
    }

    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: user._id });
    if (!roadmap) {
      return res.status(404).json({ 
        msg: "No roadmap found!" 
      });
    }

    await roadmap.deleteOne(); // cleaner than passing the same filter again

    res.json({ 
      msg: "Roadmap deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting roadmap:", err);
    res.status(500).json({ 
      msg: "Server error" 
    });
  }
};




export const exportRoadmapPDF = async (req, res) => {
  console.log('[Export] Received request');
  const { htmlContent } = req.body;
  console.log('[Export] HTML length:', htmlContent?.length);
  try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--single-process'
            ]
        });
        console.log('[Export] Browser launched');
        const page = await browser.newPage();

        // Set HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        console.log('[Export] HTML set on page');

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close();
        console.log('[Export] PDF created, length:', pdfBuffer.length);

        // Set headers and send buffer
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="roadmap.pdf"',
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).send('Failed to generate PDF');
    }
};

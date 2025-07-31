// pages/api/generate-ai-content.js

/*
This is a Next.js API route that will handle requests to the Gemini API.
You'll need to set up your GEMINI_API_KEY in your environment variables.
*/

import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}
	
	try {
		const { prompt, model = 'gemini-2.0-flash-lite' } = req.body
		
		if (!prompt) {
			return res.status(400).json({ error: 'Prompt is required' })
		}
		
		// Initialize the Gemini API client
		const apiKey = process.env.GEMINI_API_KEY
		if (!apiKey) {
			return res.status(500).json({ error: 'Gemini API key is not configured' })
		}
		
		const genAI = new GoogleGenerativeAI(apiKey)
		const geminiModel = genAI.getGenerativeModel({ model })
		
		// Set generation config
		const generationConfig = {
			temperature: 0.7,
			topP: 0.95,
			topK: 40,
			maxOutputTokens: 3072,
		}
		
		// Generate content
		const result = await geminiModel.generateContent({
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig
		})
		
		const response = result.response
		const content = response.text()
		
		// Return the generated content
		return res.status(200).json({ content })
	} catch (error) {
		console.error('Error generating content:', error)
		
		// Return appropriate error
		return res.status(500).json({ 
			error: 'Error generating content',
			details: error.message
		})
	}
}
// pages/api/auth/signup.js
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' })
	}

	try {
		const userData = req.body

		if (!userData.email || !userData.password) {
			return res.status(400).json({ message: 'Email and password are required' })
		}

		const dataFilePath = path.join(process.cwd(), 'data', 'users.json')
		
		// Create directory if it doesn't exist
		const dataDir = path.join(process.cwd(), 'data')
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true })
		}

		// Read existing users or create empty array
		let users = []
		if (fs.existsSync(dataFilePath)) {
			const fileData = fs.readFileSync(dataFilePath, 'utf8')
			users = JSON.parse(fileData)
		}

		// Check if user already exists
		const existingUser = users.find(user => user.email === userData.email)
		if (existingUser) {
			return res.status(409).json({ message: 'User already exists' })
		}

		// Add new user (in a real app, you'd hash the password)
		const newUser = {
			id: Date.now().toString(),
			email: userData.email,
			password: userData.password, // NEVER store passwords in plain text in production
			name: userData.name || '',
			age: userData.age || '',
			gender: userData.gender || 'male',
			dietType: userData.dietType || 'non-vegetarian',
			height: userData.height || '',
			weight: userData.weight || '',
			fitnessGoal: userData.fitnessGoal || 'build-muscle',
			createdAt: new Date().toISOString()
		}

		users.push(newUser)

		// Write updated users back to file
		fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2))

		// Return user without password
		const { password, ...userWithoutPassword } = newUser
		return res.status(201).json({ 
			message: 'User created successfully',
			user: userWithoutPassword
		})
	} catch (error) {
		console.error('Error creating user:', error)
		return res.status(500).json({ message: 'Error creating user' })
	}
}
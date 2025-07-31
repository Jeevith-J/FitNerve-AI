// pages/api/auth/signin.js
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' })
	}

	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' })
		}

		const dataFilePath = path.join(process.cwd(), 'data', 'users.json')
		
		// Check if users file exists
		if (!fs.existsSync(dataFilePath)) {
			return res.status(404).json({ message: 'User not found' })
		}

		// Read users from file
		const fileData = fs.readFileSync(dataFilePath, 'utf8')
		const users = JSON.parse(fileData)

		// Find user with matching email and password
		const user = users.find(user => 
			user.email === email && user.password === password
		)

		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		// Return user without password
		const { password: pass, ...userWithoutPassword } = user
		return res.status(200).json({ 
			message: 'Login successful',
			user: userWithoutPassword
		})
	} catch (error) {
		console.error('Error during login:', error)
		return res.status(500).json({ message: 'Error during login' })
	}
}
// components/authClient.js
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function useAuth() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			setUser(JSON.parse(storedUser))
		}
		setLoading(false)
	}, [])

	const signup = async (userData) => {
		setLoading(true)
		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			})

			const data = await response.json()

			if (!response.ok) {
				if (response.status === 409) {
					toast.error('User already exists with this email')
				} else {
					toast.error(data.message || 'Error during signup')
				}
				throw new Error(data.message || 'Error during signup')
			}

			localStorage.setItem('user', JSON.stringify(data.user))
			setUser(data.user)
			toast.success('Account created successfully!')
			return data.user
		} catch (error) {
			toast.error(error.message || 'Failed to create account')
			throw error
		} finally {
			setLoading(false)
		}
	}

	const signin = async (email, password) => {
		setLoading(true)
		try {
			const response = await fetch('/api/auth/signin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			})

			const data = await response.json()

			if (!response.ok) {
				if (response.status === 401) {
					toast.error('Invalid email or password')
				} else if (response.status === 404) {
					toast.error('User not found')
				} else {
					toast.error(data.message || 'Invalid credentials')
				}
				throw new Error(data.message || 'Invalid credentials')
			}

			localStorage.setItem('user', JSON.stringify(data.user))
			setUser(data.user)
			toast.success('Signed in successfully!')
			return data.user
		} catch (error) {
			toast.error(error.message || 'Failed to sign in')
			throw error
		} finally {
			setLoading(false)
		}
	}

	const signout = () => {
		localStorage.removeItem('user')
		setUser(null)
		toast.success('Signed out')
	}

	return {
		user,
		loading,
		signup,
		signin,
		signout,
		isAuthenticated: !!user
	}
}
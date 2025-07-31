import Head from 'next/head'
import DashboardPage from '../components/DashboardPage'

export default function Home() {
	return (
		<div className="min-h-screen bg-cosmic">
			<Head>
				<title>AI Fitness Trainer</title>
				<meta name="description" content="Real-time squat form detection and feedback" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
			</Head>
			<DashboardPage activePage="/" showComponents={[]} />
		</div>
	)
}
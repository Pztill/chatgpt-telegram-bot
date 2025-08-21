import { NextResponse } from 'next/server'

export async function GET() {
  // This would check actual bot status in production
  return NextResponse.json({
    isRunning: false,
    lastActivity: 'Never',
    messageCount: 0
  })
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BotStatus {
  isRunning: boolean
  lastActivity: string
  messageCount: number
}

interface PersonalityTrait {
  id: string
  trait: string
  description: string
  strength: number
}

export default function Dashboard() {
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isRunning: false,
    lastActivity: 'Never',
    messageCount: 0
  })
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTrait[]>([])
  const [threadContent, setThreadContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState('')

  // Load bot status on component mount
  useEffect(() => {
    checkBotStatus()
  }, [])

  const checkBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status')
      if (response.ok) {
        const status = await response.json()
        setBotStatus(status)
      }
    } catch (error) {
      console.error('Failed to check bot status:', error)
    }
  }

  const startBot = async () => {
    try {
      const response = await fetch('/api/bot/start', { method: 'POST' })
      if (response.ok) {
        setBotStatus({ ...botStatus, isRunning: true })
      }
    } catch (error) {
      console.error('Failed to start bot:', error)
    }
  }

  const analyzeThread = async () => {
    if (!threadContent.trim()) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/bot/analyze-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: threadContent })
      })
      
      if (response.ok) {
        const result = await response.json()
        setPersonalityTraits(result.traits)
        setAnalysisResult('Analysis complete! Personality traits extracted successfully.')
        setThreadContent('')
      }
    } catch (error) {
      setAnalysisResult('Analysis failed. Please try again.')
    }
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ChatGPT Personality Bot Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Transform ChatGPT conversations into dynamic Telegram bot personalities
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analyze">Analyze Threads</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Bot Status
                    <Badge variant={botStatus.isRunning ? "default" : "secondary"}>
                      {botStatus.isRunning ? "Running" : "Stopped"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Last Activity: {botStatus.lastActivity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Messages Processed: {botStatus.messageCount}
                    </p>
                    <Button 
                      onClick={startBot} 
                      disabled={botStatus.isRunning}
                      className="w-full mt-4"
                    >
                      {botStatus.isRunning ? "Bot Running" : "Start Bot"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personality Traits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{personalityTraits.length}</p>
                    <p className="text-sm text-gray-600">Active personality traits</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {personalityTraits.slice(0, 3).map((trait) => (
                        <Badge key={trait.id} variant="outline" className="text-xs">
                          {trait.trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      View Chat Logs
                    </Button>
                    <Button variant="outline" className="w-full">
                      Export Personality
                    </Button>
                    <Button variant="outline" className="w-full">
                      Bot Commands
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyze ChatGPT Thread</CardTitle>
                <CardDescription>
                  Paste a ChatGPT conversation to extract personality traits and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="thread-content">ChatGPT Conversation</Label>
                    <Textarea
                      id="thread-content"
                      placeholder="Paste your ChatGPT conversation here..."
                      value={threadContent}
                      onChange={(e) => setThreadContent(e.target.value)}
                      className="min-h-40 mt-2"
                    />
                  </div>
                  
                  <Button 
                    onClick={analyzeThread}
                    disabled={isAnalyzing || !threadContent.trim()}
                    className="w-full"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Thread"}
                  </Button>

                  {analysisResult && (
                    <Alert>
                      <AlertDescription>{analysisResult}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personality Traits</CardTitle>
                <CardDescription>
                  Current personality traits extracted from ChatGPT threads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalityTraits.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No personality traits yet. Analyze a ChatGPT thread to get started!
                    </p>
                  ) : (
                    personalityTraits.map((trait) => (
                      <div key={trait.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge>{trait.trait}</Badge>
                          <span className="text-sm text-gray-500">
                            Strength: {Math.round(trait.strength * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{trait.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bot Configuration</CardTitle>
                <CardDescription>
                  Configure your Telegram bot settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input id="bot-name" placeholder="ChatGPT Personality Bot" />
                  </div>
                  
                  <div>
                    <Label htmlFor="response-style">Response Style</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Adaptive (uses extracted personality)</option>
                      <option>Consistent</option>
                      <option>Random</option>
                    </select>
                  </div>

                  <Button className="w-full">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { problemTitle, conversationHistory } = await request.json();

    if (!problemTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // System prompt - code comes from user messages, not here
    const systemPrompt = `You are a senior engineer at Google conducting a coding interview for "${problemTitle}".

YOUR STYLE:
- Respond to what the candidate actually said
- Ask ONE question at a time (never 2-3 at once)
- Acknowledge their points before asking follow-ups
- Be genuinely curious, not interrogative
- Use Socratic method - help them discover, don't tell

QUESTION TYPES (use these, not direct hints):
- "Can you walk me through what happens when [specific input]?"
- "What's your thinking behind [specific code choice]?"
- "What would this return if [edge case]?"
- "Can you trace through the code with [example]?"

NEVER:
- Ask multiple questions in one response
- Point out bugs directly
- Give answers
- Say things like "There's a bug" or "You should use X"

Keep responses to 2-3 sentences max. Sound like a real person having a conversation.`;

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (code is included in user messages)
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory as Message[]) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const Anthropic = require('@anthropic-ai/sdk');
const Groq = require('groq-sdk');
const FoodWasteEntry = require('../models/FoodWasteEntry');

async function callGroq(systemPrompt, messages) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 800,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ]
  });
  return { reply: response.choices[0].message.content, provider: 'groq' };
}

async function callAnthropic(systemPrompt, messages) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: systemPrompt,
    messages
  });
  return { reply: response.content[0].text, provider: 'anthropic' };
}

exports.chat = async (req, res) => {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const hasAnthropic = anthropicKey && anthropicKey !== 'your-anthropic-api-key-here';
    const hasGroq = groqKey && groqKey !== 'your-groq-api-key-here';

    if (!hasAnthropic && !hasGroq) {
      return res.status(503).json({
        error: 'AI assistant not configured. Add ANTHROPIC_API_KEY or GROQ_API_KEY to the .env file.'
      });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // ── Pull live campus data ────────────────────────────────────────────────
    const entries = await FoodWasteEntry.find({}).lean();
    const now = new Date();

    const totalWaste   = entries.reduce((s, e) => s + (e.weight || 0), 0);
    const totalCompost = entries.reduce((s, e) => s + Math.min(e.compostWeight || 0, e.weight || 0), 0);
    const divRate      = totalWaste > 0 ? ((totalCompost / totalWaste) * 100).toFixed(1) : 0;
    const published    = entries.filter(e => e.published).length;
    const avgBinFull   = entries.length ? (entries.reduce((s, e) => s + (e.binFullness || 0), 0) / entries.length).toFixed(0) : 0;
    const avgPH        = entries.length ? (entries.reduce((s, e) => s + (e.pH || 0), 0) / entries.length).toFixed(1) : 0;

    const weekAgo     = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
    const thisWeekEntries = entries.filter(e => new Date(e.date || e.createdAt) >= weekAgo);
    const lastWeekEntries = entries.filter(e => {
      const d = new Date(e.date || e.createdAt);
      return d >= twoWeeksAgo && d < weekAgo;
    });
    const thisWeekWaste   = thisWeekEntries.reduce((s, e) => s + (e.weight || 0), 0);
    const lastWeekWaste   = lastWeekEntries.reduce((s, e) => s + (e.weight || 0), 0);
    const thisWeekCompost = thisWeekEntries.reduce((s, e) => s + (e.compostWeight || 0), 0);
    const wasteChange     = lastWeekWaste > 0
      ? ((thisWeekWaste - lastWeekWaste) / lastWeekWaste * 100).toFixed(1)
      : 'N/A';

    const byLoc = {};
    entries.forEach(e => {
      const loc = e.location || 'Unknown';
      if (!byLoc[loc]) byLoc[loc] = { waste: 0, compost: 0, count: 0 };
      byLoc[loc].waste   += e.weight || 0;
      byLoc[loc].compost += e.compostWeight || 0;
      byLoc[loc].count   += 1;
    });
    const locationLines = Object.entries(byLoc)
      .sort((a, b) => b[1].waste - a[1].waste)
      .slice(0, 5)
      .map(([loc, d]) => {
        const rate = d.waste > 0 ? ((d.compost / d.waste) * 100).toFixed(0) : 0;
        return `  • ${loc}: ${d.waste.toFixed(1)} lbs waste, ${d.compost.toFixed(1)} lbs composted (${rate}% diversion), ${d.count} entries`;
      })
      .join('\n');

    const recentFive = [...entries]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 5)
      .map(e => `  • ${e.foodType || 'Unknown'} at ${e.location || '?'} — ${(e.weight || 0).toFixed(1)} lbs on ${e.date ? new Date(e.date).toLocaleDateString() : 'unknown date'}`)
      .join('\n');

    const systemPrompt = `You are MunchiesAI, the AI sustainability assistant built into MunchiesSNHU — SNHU's campus food waste tracking platform. You are knowledgeable, encouraging, and data-literate.

═══ LIVE CAMPUS DATA (as of right now) ═══

Overall Totals:
• Total waste logged: ${totalWaste.toFixed(1)} lbs across ${entries.length} entries (${published} published)
• Total composted: ${totalCompost.toFixed(1)} lbs
• Compost diversion rate: ${divRate}% (campus goal: 50%)
• Average bin fullness: ${avgBinFull}%
• Average pH: ${avgPH}

This Week vs Last Week:
• This week: ${thisWeekWaste.toFixed(1)} lbs waste, ${thisWeekCompost.toFixed(1)} lbs composted (${thisWeekEntries.length} entries)
• Last week: ${lastWeekWaste.toFixed(1)} lbs waste (${lastWeekEntries.length} entries)
• Week-over-week change: ${wasteChange}% ${Number(wasteChange) < 0 ? '(improving)' : Number(wasteChange) > 0 ? '(worsening)' : ''}

Top Locations by Waste Volume:
${locationLines || '  • No location data yet'}

5 Most Recent Entries:
${recentFive || '  • No entries yet'}

Logged-in user role: ${req.user?.role || 'unknown'}

═══ YOUR ROLE ═══

You help staff and students understand this data, take action, and improve sustainability outcomes.

Response style:
- Be conversational and encouraging — celebrate wins, gently flag problems
- Use the actual campus numbers above when they are relevant to the question
- Format responses clearly: use bullet points for lists, **bold** for key figures
- Keep answers to 2-4 sentences unless a detailed breakdown or explanation is needed
- For "what should I do?" questions, give concrete, prioritized next steps based on the data
- Help interpret numbers: explain what diversion rates, pH levels, and bin fullness mean in practice
- If asked something completely unrelated to sustainability, food waste, or composting, politely redirect

What you know:
- Composting food waste saves ~0.25 lbs of CO₂ per lb composted
- A good diversion rate is 50%+ (the campus goal)
- High bin fullness (>80%) means pickup frequency should increase
- pH under 6 or over 8 signals decomposition issues
- The dashboard tracks waste by weight (lbs), compost weight, temperature, humidity, pH, gas, and bin fullness`;

    const cleanMessages = messages.slice(-16).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 3000)
    }));

    // ── Try Anthropic first, auto-fallback to Groq ───────────────────────────
    let result;

    if (hasAnthropic) {
      try {
        result = await callAnthropic(systemPrompt, cleanMessages);
      } catch (anthropicErr) {
        const msg = anthropicErr.message || '';
        const isBillingOrRate = anthropicErr.status === 400 || anthropicErr.status === 429 || anthropicErr.status === 401;
        const isCredits = msg.toLowerCase().includes('credit') || msg.toLowerCase().includes('billing') || msg.toLowerCase().includes('balance');

        if ((isBillingOrRate || isCredits) && hasGroq) {
          console.log('Anthropic unavailable, falling back to Groq:', msg.slice(0, 80));
          result = await callGroq(systemPrompt, cleanMessages);
        } else {
          throw anthropicErr;
        }
      }
    } else {
      result = await callGroq(systemPrompt, cleanMessages);
    }

    res.json(result);

  } catch (err) {
    console.error('Chat controller error:', err.message);
    if (err.status === 401) {
      return res.status(503).json({ error: 'Invalid API key. Check your API keys in the .env file.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI rate limit reached. Please wait a moment and try again.' });
    }
    res.status(500).json({ error: 'AI assistant is temporarily unavailable. Please try again.' });
  }
};

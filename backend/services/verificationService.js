import Groq from 'groq-sdk';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Compress an image URL or base64 data URI to a small JPEG base64 string.
 * Max 768px wide, 60% quality — well within Groq's 4MB limit.
 */
const compressImage = async (urlOrDataUri) => {
  try {
    let inputBuffer;

    if (urlOrDataUri.startsWith('data:')) {
      // Base64 data URI → strip header and decode
      const base64 = urlOrDataUri.split(',')[1];
      inputBuffer = Buffer.from(base64, 'base64');
    } else {
      // HTTP URL → fetch the image
      const res = await fetch(urlOrDataUri);
      if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
      inputBuffer = Buffer.from(await res.arrayBuffer());
    }

    const compressed = await sharp(inputBuffer)
      .resize({ width: 768, withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer();

    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch (err) {
    console.warn('⚠️ Image compression failed, using original:', err.message);
    return urlOrDataUri; // fall back to original
  }
};

/**
 * Module 7: AI Verification Auditor
 * Compares before + after images to verify cleanup quality.
 *
 * @param {string} beforeUrl - Public URL of the before image
 * @param {string} afterUrl  - Public URL or base64 data URI of the after image
 * @returns {{ confidence, is_clean, landmarks_match, drain_clear, verdict, reasoning }}
 */
export const verifyCleanup = async (beforeUrl, afterUrl) => {
  try {
    console.log('🔍 Module 7: AI Verification Auditor starting...');

    // Compress both images to stay under Groq's request size limit
    console.log('🗜️  Compressing images...');
    const [compressedBefore, compressedAfter] = await Promise.all([
      compressImage(beforeUrl),
      compressImage(afterUrl),
    ]);
    console.log(`   Before: ${Math.round(compressedBefore.length / 1024)}KB  After: ${Math.round(compressedAfter.length / 1024)}KB`);

    const prompt = `You are a STRICT AI Quality Control auditor for a smart city garbage management system.

You are given TWO images:
1. BEFORE image — the site BEFORE cleanup (garbage/waste is present)
2. AFTER image  — the site AFTER the cleanup worker finished

Your job: verify whether the cleanup was genuinely done at the SAME location.

===== CRITICAL RULES (read carefully) =====

RULE 1 — LOCATION VERIFICATION (most important):
Compare every visual detail: background buildings, walls, road texture, pavement, poles, fences, trees, paint marks, shadows.
If the surroundings look DIFFERENT in any significant way → the worker likely submitted a photo from a DIFFERENT location.
In that case you MUST set: landmarks_match = false AND confidence <= 0.25
Do NOT give benefit of the doubt. If you are unsure whether it is the same place, set landmarks_match = false.

RULE 2 — GARBAGE CLEARED:
Is the garbage/waste from the before image visibly gone or significantly reduced in the SAME spot?

RULE 3 — DRAIN STATUS:
If a drain was blocked in the before image, is it now clear? If no drain is visible in either image, set drain_clear = true.

RULE 4 — VERDICT:
- verdict = "CLOSED" ONLY IF: landmarks_match = true AND is_clean = true AND confidence >= 0.85
- verdict = "REJECTED" in ALL other cases — including when landmarks do not match, or when confidence < 0.85

===== OUTPUT =====
Respond ONLY with a single valid JSON object. No markdown, no explanation, no code fences.
Exact format:
{"confidence":0.92,"is_clean":true,"landmarks_match":true,"drain_clear":true,"verdict":"CLOSED","reasoning":"Garbage pile completely removed. Drain now unblocked. Same location confirmed by wall and road markings."}

- confidence: 0.0–1.0
- reasoning: 1–2 sentences. If location mismatch, explain what visual cues differ.`;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'BEFORE image (garbage present):' },
            { type: 'image_url', image_url: { url: compressedBefore } },
            { type: 'text', text: 'AFTER image (post-cleanup):' },
            { type: 'image_url', image_url: { url: compressedAfter } },
            { type: 'text', text: prompt },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 512,
    });

    const rawText = completion.choices?.[0]?.message?.content || '';
    console.log('🤖 Verification AI raw response:', rawText);

    const jsonText = rawText.replace(/```json|```/gi, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.warn('⚠️ Verification AI returned non-JSON, defaulting to REJECTED');
      parsed = {
        confidence: 0,
        is_clean: false,
        landmarks_match: false,
        drain_clear: false,
        verdict: 'REJECTED',
        reasoning: 'AI parsing failed — manual review required.',
      };
    }

    const confidence = parseFloat(parsed.confidence) || 0;
    const landmarks_match = Boolean(parsed.landmarks_match);
    const is_clean = Boolean(parsed.is_clean);

    // Hard rules: different location OR not clean → always REJECTED, regardless of AI confidence
    const verdict = (landmarks_match && is_clean && confidence >= 0.85) ? 'CLOSED' : 'REJECTED';

    // If AI gave high confidence but flagged location mismatch, cap confidence at 0.4
    const finalConfidence = !landmarks_match ? Math.min(confidence, 0.4) : confidence;

    console.log(`🔍 Verification result: landmarks_match=${landmarks_match}, is_clean=${is_clean}, confidence=${finalConfidence}, verdict=${verdict}`);

    return {
      confidence: finalConfidence,
      is_clean,
      landmarks_match,
      drain_clear: Boolean(parsed.drain_clear),
      verdict,
      reasoning: parsed.reasoning || '',
      raw: rawText,
    };
  } catch (error) {
    console.error('❌ Verification Service Error:', error.message);
    throw error;
  }
};

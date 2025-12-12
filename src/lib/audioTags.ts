import type { AudioTag, TagCategory } from '@/types/dialogue';

/**
 * Comprehensive catalog of ElevenLabs v3 audio tags
 * Based on SDK_FINDINGS.md - all tags use square bracket notation [tag]
 * All tags are inline style (not wrap style)
 */
export const AUDIO_TAGS: AudioTag[] = [
  // ===========================
  // 1. EMOTION - Emotional States
  // ===========================
  {
    id: 'excited',
    tag: 'excited',
    displayName: 'Excited',
    category: 'emotion',
    description: 'Delivers text with enthusiasm and energy',
    example: '[excited] I can\'t believe we won!',
    syntax: 'inline'
  },
  {
    id: 'nervous',
    tag: 'nervous',
    displayName: 'Nervous',
    category: 'emotion',
    description: 'Adds hesitation and anxiety to delivery',
    example: '[nervous] Are you sure about this?',
    syntax: 'inline'
  },
  {
    id: 'frustrated',
    tag: 'frustrated',
    displayName: 'Frustrated',
    category: 'emotion',
    description: 'Conveys irritation and annoyance',
    example: '[frustrated] This isn\'t working again!',
    syntax: 'inline'
  },
  {
    id: 'sorrowful',
    tag: 'sorrowful',
    displayName: 'Sorrowful',
    category: 'emotion',
    description: 'Expresses deep sadness or grief',
    example: '[sorrowful] I miss them so much.',
    syntax: 'inline'
  },
  {
    id: 'calm',
    tag: 'calm',
    displayName: 'Calm',
    category: 'emotion',
    description: 'Peaceful, relaxed delivery',
    example: '[calm] Everything will be alright.',
    syntax: 'inline'
  },
  {
    id: 'happy',
    tag: 'happy',
    displayName: 'Happy',
    category: 'emotion',
    description: 'Joyful, cheerful tone',
    example: '[happy] What a wonderful day!',
    syntax: 'inline'
  },
  {
    id: 'sad',
    tag: 'sad',
    displayName: 'Sad',
    category: 'emotion',
    description: 'Melancholic, downcast delivery',
    example: '[sad] I wish things had turned out differently.',
    syntax: 'inline'
  },
  {
    id: 'angry',
    tag: 'angry',
    displayName: 'Angry',
    category: 'emotion',
    description: 'Forceful, hostile tone',
    example: '[angry] How dare you!',
    syntax: 'inline'
  },
  {
    id: 'fearful',
    tag: 'fearful',
    displayName: 'Fearful',
    category: 'emotion',
    description: 'Scared, anxious delivery',
    example: '[fearful] What was that sound?',
    syntax: 'inline'
  },
  {
    id: 'surprised',
    tag: 'surprised',
    displayName: 'Surprised',
    category: 'emotion',
    description: 'Startled, amazed reaction',
    example: '[surprised] I didn\'t expect to see you here!',
    syntax: 'inline'
  },
  {
    id: 'wistful',
    tag: 'wistful',
    displayName: 'Wistful',
    category: 'emotion',
    description: 'Nostalgic, yearning tone',
    example: '[wistful] I remember when we used to come here.',
    syntax: 'inline'
  },
  {
    id: 'resigned',
    tag: 'resigned',
    displayName: 'Resigned',
    category: 'emotion',
    description: 'Accepting defeat or inevitability',
    example: '[resigned] I suppose there\'s nothing we can do.',
    syntax: 'inline'
  },
  {
    id: 'conflicted',
    tag: 'conflicted',
    displayName: 'Conflicted',
    category: 'emotion',
    description: 'Torn between options, uncertain',
    example: '[conflicted] I don\'t know if this is the right choice.',
    syntax: 'inline'
  },
  {
    id: 'hopeful',
    tag: 'hopeful',
    displayName: 'Hopeful',
    category: 'emotion',
    description: 'Optimistic, expecting positive outcomes',
    example: '[hopeful] Maybe tomorrow will be better.',
    syntax: 'inline'
  },
  {
    id: 'regretful',
    tag: 'regretful',
    displayName: 'Regretful',
    category: 'emotion',
    description: 'Remorseful, wishing things were different',
    example: '[regretful] I should have listened to you.',
    syntax: 'inline'
  },
  {
    id: 'awestruck',
    tag: 'awestruck',
    displayName: 'Awestruck',
    category: 'emotion',
    description: 'Overwhelmed with wonder or admiration',
    example: '[awestruck] This is absolutely incredible!',
    syntax: 'inline'
  },
  {
    id: 'smug',
    tag: 'smug',
    displayName: 'Smug',
    category: 'emotion',
    description: 'Self-satisfied, superior tone',
    example: '[smug] I told you I was right.',
    syntax: 'inline'
  },
  {
    id: 'bitter',
    tag: 'bitter',
    displayName: 'Bitter',
    category: 'emotion',
    description: 'Resentful, cynical delivery',
    example: '[bitter] Of course it didn\'t work out.',
    syntax: 'inline'
  },

  // ===========================
  // 2. DELIVERY - Volume/Delivery Style
  // ===========================
  {
    id: 'whispering',
    tag: 'whispering',
    displayName: 'Whispering',
    category: 'delivery',
    description: 'Very quiet, secretive delivery',
    example: '[whispering] Don\'t let them hear us.',
    syntax: 'inline'
  },
  {
    id: 'whispers',
    tag: 'whispers',
    displayName: 'Whispers',
    category: 'delivery',
    description: 'Quiet, hushed tone (alternative form)',
    example: '[whispers] Come closer.',
    syntax: 'inline'
  },
  {
    id: 'quietly',
    tag: 'quietly',
    displayName: 'Quietly',
    category: 'delivery',
    description: 'Soft, subdued volume',
    example: '[quietly] I don\'t want to disturb anyone.',
    syntax: 'inline'
  },
  {
    id: 'loudly',
    tag: 'loudly',
    displayName: 'Loudly',
    category: 'delivery',
    description: 'Raised volume, projecting voice',
    example: '[loudly] Can everyone hear me?',
    syntax: 'inline'
  },
  {
    id: 'shouting',
    tag: 'shouting',
    displayName: 'Shouting',
    category: 'delivery',
    description: 'Very loud, yelling delivery',
    example: '[shouting] Get out of the way!',
    syntax: 'inline'
  },

  // ===========================
  // 3. SOUND - Sound Effects/Reactions
  // ===========================
  {
    id: 'sigh',
    tag: 'sigh',
    displayName: 'Sigh',
    category: 'sound',
    description: 'Audible exhalation expressing relief or frustration',
    example: '[sigh] I suppose you\'re right.',
    syntax: 'inline'
  },
  {
    id: 'laughs',
    tag: 'laughs',
    displayName: 'Laughs',
    category: 'sound',
    description: 'Laughter sound effect',
    example: 'That\'s hilarious! [laughs]',
    syntax: 'inline'
  },
  {
    id: 'gulps',
    tag: 'gulps',
    displayName: 'Gulps',
    category: 'sound',
    description: 'Swallowing sound, often nervous',
    example: '[gulps] That looks dangerous.',
    syntax: 'inline'
  },
  {
    id: 'gasps',
    tag: 'gasps',
    displayName: 'Gasps',
    category: 'sound',
    description: 'Sharp intake of breath, surprise or shock',
    example: '[gasps] I can\'t believe it!',
    syntax: 'inline'
  },
  {
    id: 'breathes',
    tag: 'breathes',
    displayName: 'Breathes',
    category: 'sound',
    description: 'Audible breathing sound',
    example: '[breathes] Just give me a second.',
    syntax: 'inline'
  },
  {
    id: 'clears-throat',
    tag: 'clears throat',
    displayName: 'Clears Throat',
    category: 'sound',
    description: 'Throat clearing sound',
    example: '[clears throat] May I have your attention?',
    syntax: 'inline'
  },
  {
    id: 'coughs',
    tag: 'coughs',
    displayName: 'Coughs',
    category: 'sound',
    description: 'Coughing sound effect',
    example: '[coughs] Excuse me.',
    syntax: 'inline'
  },

  // ===========================
  // 4. CHARACTER - Character Voices/Accents
  // ===========================
  {
    id: 'pirate-voice',
    tag: 'pirate voice',
    displayName: 'Pirate Voice',
    category: 'character',
    description: 'Stereotypical pirate speech patterns',
    example: '[pirate voice] Ahoy, matey!',
    syntax: 'inline'
  },
  {
    id: 'robot-voice',
    tag: 'robot voice',
    displayName: 'Robot Voice',
    category: 'character',
    description: 'Mechanical, robotic delivery',
    example: '[robot voice] Greetings, human.',
    syntax: 'inline'
  },
  {
    id: 'evil-scientist-voice',
    tag: 'evil scientist voice',
    displayName: 'Evil Scientist Voice',
    category: 'character',
    description: 'Villainous, maniacal scientist tone',
    example: '[evil scientist voice] My creation is complete!',
    syntax: 'inline'
  },
  {
    id: 'childlike-tone',
    tag: 'childlike tone',
    displayName: 'Childlike Tone',
    category: 'character',
    description: 'Youthful, innocent delivery',
    example: '[childlike tone] Can we go to the park?',
    syntax: 'inline'
  },
  {
    id: 'elderly-voice',
    tag: 'elderly voice',
    displayName: 'Elderly Voice',
    category: 'character',
    description: 'Aged, weathered voice quality',
    example: '[elderly voice] Back in my day...',
    syntax: 'inline'
  },
  {
    id: 'superhero-voice',
    tag: 'superhero voice',
    displayName: 'Superhero Voice',
    category: 'character',
    description: 'Heroic, commanding presence',
    example: '[superhero voice] Justice will prevail!',
    syntax: 'inline'
  },
  {
    id: 'narrator-voice',
    tag: 'narrator voice',
    displayName: 'Narrator Voice',
    category: 'character',
    description: 'Storytelling, omniscient narrator style',
    example: '[narrator voice] It was a dark and stormy night.',
    syntax: 'inline'
  },

  // Accents
  {
    id: 'american-accent',
    tag: 'American accent',
    displayName: 'American Accent',
    category: 'character',
    description: 'American English pronunciation',
    example: '[American accent] How are you doing today?',
    syntax: 'inline'
  },
  {
    id: 'british-accent',
    tag: 'British accent',
    displayName: 'British Accent',
    category: 'character',
    description: 'British English pronunciation and cadence',
    example: '[British accent] Lovely weather we\'re having.',
    syntax: 'inline'
  },
  {
    id: 'australian-accent',
    tag: 'Australian accent',
    displayName: 'Australian Accent',
    category: 'character',
    description: 'Australian English pronunciation',
    example: '[Australian accent] G\'day, mate!',
    syntax: 'inline'
  },
  {
    id: 'irish-accent',
    tag: 'Irish accent',
    displayName: 'Irish Accent',
    category: 'character',
    description: 'Irish English pronunciation',
    example: '[Irish accent] Top of the morning to you!',
    syntax: 'inline'
  },
  {
    id: 'scottish-accent',
    tag: 'Scottish accent',
    displayName: 'Scottish Accent',
    category: 'character',
    description: 'Scottish English pronunciation',
    example: '[Scottish accent] Aye, that\'s right!',
    syntax: 'inline'
  },
  {
    id: 'french-accent',
    tag: 'French accent',
    displayName: 'French Accent',
    category: 'character',
    description: 'French-accented English',
    example: '[French accent] Bonjour, my friend!',
    syntax: 'inline'
  },
  {
    id: 'german-accent',
    tag: 'German accent',
    displayName: 'German Accent',
    category: 'character',
    description: 'German-accented English',
    example: '[German accent] Sehr gut!',
    syntax: 'inline'
  },
  {
    id: 'spanish-accent',
    tag: 'Spanish accent',
    displayName: 'Spanish Accent',
    category: 'character',
    description: 'Spanish-accented English',
    example: '[Spanish accent] Hola, how are you?',
    syntax: 'inline'
  },
  {
    id: 'italian-accent',
    tag: 'Italian accent',
    displayName: 'Italian Accent',
    category: 'character',
    description: 'Italian-accented English',
    example: '[Italian accent] Ciao, bella!',
    syntax: 'inline'
  },
  {
    id: 'russian-accent',
    tag: 'Russian accent',
    displayName: 'Russian Accent',
    category: 'character',
    description: 'Russian-accented English',
    example: '[Russian accent] In Soviet Russia...',
    syntax: 'inline'
  },
  {
    id: 'indian-english-accent',
    tag: 'Indian English accent',
    displayName: 'Indian English Accent',
    category: 'character',
    description: 'Indian English pronunciation',
    example: '[Indian English accent] Thank you for calling.',
    syntax: 'inline'
  },

  // ===========================
  // 5. NARRATIVE - Cognitive/Tone Cues
  // ===========================
  {
    id: 'pauses',
    tag: 'pauses',
    displayName: 'Pauses',
    category: 'narrative',
    description: 'Hesitates or breaks in speech',
    example: '[pauses] What should we do next?',
    syntax: 'inline'
  },
  {
    id: 'hesitates',
    tag: 'hesitates',
    displayName: 'Hesitates',
    category: 'narrative',
    description: 'Uncertain, wavering delivery',
    example: '[hesitates] I\'m not sure if this is a good idea.',
    syntax: 'inline'
  },
  {
    id: 'stammers',
    tag: 'stammers',
    displayName: 'Stammers',
    category: 'narrative',
    description: 'Stuttering, struggling to speak',
    example: '[stammers] I-I didn\'t mean to...',
    syntax: 'inline'
  },
  {
    id: 'resigned-tone',
    tag: 'resigned tone',
    displayName: 'Resigned Tone',
    category: 'narrative',
    description: 'Acceptance with a hint of defeat',
    example: '[resigned tone] Fine, have it your way.',
    syntax: 'inline'
  },
  {
    id: 'cheerfully',
    tag: 'cheerfully',
    displayName: 'Cheerfully',
    category: 'narrative',
    description: 'Bright, upbeat delivery',
    example: '[cheerfully] Good morning, everyone!',
    syntax: 'inline'
  },
  {
    id: 'flatly',
    tag: 'flatly',
    displayName: 'Flatly',
    category: 'narrative',
    description: 'Monotone, emotionless delivery',
    example: '[flatly] I\'m so excited.',
    syntax: 'inline'
  },
  {
    id: 'deadpan',
    tag: 'deadpan',
    displayName: 'Deadpan',
    category: 'narrative',
    description: 'Deliberately emotionless, often for humor',
    example: '[deadpan] Oh no. What a tragedy.',
    syntax: 'inline'
  },
  {
    id: 'playfully',
    tag: 'playfully',
    displayName: 'Playfully',
    category: 'narrative',
    description: 'Teasing, lighthearted tone',
    example: '[playfully] Catch me if you can!',
    syntax: 'inline'
  },
  {
    id: 'sarcastically',
    tag: 'sarcastically',
    displayName: 'Sarcastically',
    category: 'narrative',
    description: 'Ironic, mocking delivery',
    example: '[sarcastically] Oh, that\'s just perfect.',
    syntax: 'inline'
  },
  {
    id: 'matter-of-fact',
    tag: 'matter-of-fact',
    displayName: 'Matter-of-fact',
    category: 'narrative',
    description: 'Straightforward, no-nonsense delivery',
    example: '[matter-of-fact] The meeting starts at 3 PM.',
    syntax: 'inline'
  },
  {
    id: 'professionally',
    tag: 'professionally',
    displayName: 'Professionally',
    category: 'narrative',
    description: 'Formal, business-like tone',
    example: '[professionally] Thank you for your inquiry.',
    syntax: 'inline'
  },
  {
    id: 'condescending',
    tag: 'condescending',
    displayName: 'Condescending',
    category: 'narrative',
    description: 'Patronizing, talking down to someone',
    example: '[condescending] Let me explain this in simple terms.',
    syntax: 'inline'
  },
  {
    id: 'dramatically',
    tag: 'dramatically',
    displayName: 'Dramatically',
    category: 'narrative',
    description: 'Theatrical, exaggerated delivery',
    example: '[dramatically] This changes everything!',
    syntax: 'inline'
  },

  // ===========================
  // 6. PACING - Timing Control
  // ===========================
  {
    id: 'pause',
    tag: 'pause',
    displayName: 'Pause',
    category: 'pacing',
    description: 'Brief silence for dramatic effect',
    example: 'The winner is... [pause] you!',
    syntax: 'inline'
  },
  {
    id: 'long-pause',
    tag: 'long pause',
    displayName: 'Long Pause',
    category: 'pacing',
    description: 'Extended silence for emphasis',
    example: 'I have something to tell you. [long pause] It\'s important.',
    syntax: 'inline'
  },
  {
    id: 'brief-pause',
    tag: 'brief pause',
    displayName: 'Brief Pause',
    category: 'pacing',
    description: 'Short moment of silence',
    example: 'Wait [brief pause] did you hear that?',
    syntax: 'inline'
  },
  {
    id: 'beat',
    tag: 'beat',
    displayName: 'Beat',
    category: 'pacing',
    description: 'Theatrical pause, dramatic timing',
    example: 'I never said [beat] I agreed with you.',
    syntax: 'inline'
  },
  {
    id: 'slowly',
    tag: 'slowly',
    displayName: 'Slowly',
    category: 'pacing',
    description: 'Reduced speed, deliberate pacing',
    example: '[slowly] Listen very carefully.',
    syntax: 'inline'
  },
  {
    id: 'quickly',
    tag: 'quickly',
    displayName: 'Quickly',
    category: 'pacing',
    description: 'Increased speed, urgent pacing',
    example: '[quickly] We don\'t have much time!',
    syntax: 'inline'
  },
  {
    id: 'rushed',
    tag: 'rushed',
    displayName: 'Rushed',
    category: 'pacing',
    description: 'Hurried, frenetic delivery',
    example: '[rushed] I need to tell you something before they get here.',
    syntax: 'inline'
  },
  {
    id: 'drawn-out',
    tag: 'drawn out',
    displayName: 'Drawn Out',
    category: 'pacing',
    description: 'Elongated, stretched delivery',
    example: '[drawn out] Nooooo way!',
    syntax: 'inline'
  },
  {
    id: 'rapid-fire',
    tag: 'rapid-fire',
    displayName: 'Rapid-fire',
    category: 'pacing',
    description: 'Very fast, machine-gun delivery',
    example: '[rapid-fire] Let\'s go, move, now, quickly, hurry!',
    syntax: 'inline'
  },
  {
    id: 'picks-up-pace',
    tag: 'picks up pace',
    displayName: 'Picks Up Pace',
    category: 'pacing',
    description: 'Gradually increases speed',
    example: '[picks up pace] And then things started happening faster and faster.',
    syntax: 'inline'
  },
  {
    id: 'slows-down',
    tag: 'slows down',
    displayName: 'Slows Down',
    category: 'pacing',
    description: 'Gradually decreases speed',
    example: '[slows down] And as the sun set, everything became quiet.',
    syntax: 'inline'
  },

  // ===========================
  // 7. DIALOGUE - Multi-speaker Flow
  // ===========================
  {
    id: 'interrupting',
    tag: 'interrupting',
    displayName: 'Interrupting',
    category: 'dialogue',
    description: 'Cuts into another speaker\'s line',
    example: '[interrupting] Wait, stop right there!',
    syntax: 'inline'
  },
  {
    id: 'overlapping',
    tag: 'overlapping',
    displayName: 'Overlapping',
    category: 'dialogue',
    description: 'Speaks at the same time as another',
    example: '[overlapping] I was just about to say that!',
    syntax: 'inline'
  },
  {
    id: 'cuts-in',
    tag: 'cuts in',
    displayName: 'Cuts In',
    category: 'dialogue',
    description: 'Interjects sharply',
    example: '[cuts in] That\'s not what happened!',
    syntax: 'inline'
  },
  {
    id: 'trailing-off',
    tag: 'trailing off',
    displayName: 'Trailing Off',
    category: 'dialogue',
    description: 'Voice fades out, incomplete thought',
    example: '[trailing off] I thought maybe we could...',
    syntax: 'inline'
  },
  {
    id: 'continues',
    tag: 'continues',
    displayName: 'Continues',
    category: 'dialogue',
    description: 'Resumes speaking after interruption',
    example: '[continues] As I was saying before...',
    syntax: 'inline'
  }
];

/**
 * Mapping of tag categories to their display labels and Lucide icon names
 */
export const TAG_CATEGORIES: Record<TagCategory, { label: string; icon: string }> = {
  emotion: {
    label: 'Emotions',
    icon: 'Heart'
  },
  delivery: {
    label: 'Delivery Style',
    icon: 'Mic'
  },
  sound: {
    label: 'Sound Effects',
    icon: 'Volume2'
  },
  character: {
    label: 'Character Voices',
    icon: 'User'
  },
  narrative: {
    label: 'Cognitive & Tone',
    icon: 'BrainCircuit'
  },
  pacing: {
    label: 'Timing & Pacing',
    icon: 'Clock'
  },
  dialogue: {
    label: 'Dialogue Flow',
    icon: 'MessagesSquare'
  }
};

/**
 * Get all tags belonging to a specific category
 */
export function getTagsByCategory(category: TagCategory): AudioTag[] {
  return AUDIO_TAGS.filter(tag => tag.category === category);
}

/**
 * Apply an audio tag to text at the specified cursor position
 * All v3 tags are inline format: [tag]
 */
export function applyTagToText(
  text: string,
  tag: AudioTag,
  cursorPosition?: number
): string {
  const insertPos = cursorPosition ?? text.length;

  // All v3 tags are inline, using square bracket notation
  const tagText = `[${tag.tag}]`;

  // Insert tag at cursor position with spacing
  const before = text.slice(0, insertPos);
  const after = text.slice(insertPos);

  // Add spacing intelligently
  const needsSpaceBefore = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
  const needsSpaceAfter = after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n');

  const spaceBefore = needsSpaceBefore ? ' ' : '';
  const spaceAfter = needsSpaceAfter ? ' ' : '';

  return `${before}${spaceBefore}${tagText}${spaceAfter}${after}`;
}

/**
 * Estimate character count for cost calculation
 * Strips all audio tag markup to count only spoken characters
 */
export function estimateCharacterCount(text: string): number {
  // Remove all square bracket tags: [tag] format
  const withoutTags = text.replace(/\[[\w\s-]+\]/g, '');

  // Trim whitespace and count
  return withoutTags.trim().length;
}

/**
 * Validate if text contains properly formatted tags
 */
export function validateTags(text: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for unclosed brackets
  const openBrackets = (text.match(/\[/g) || []).length;
  const closeBrackets = (text.match(/\]/g) || []).length;

  if (openBrackets !== closeBrackets) {
    errors.push('Unclosed brackets detected');
  }

  // Extract all tags from text
  const tagMatches = text.match(/\[[\w\s-]+\]/g) || [];
  const validTagNames = AUDIO_TAGS.map(t => t.tag.toLowerCase());

  // Check if tags are recognized
  tagMatches.forEach(match => {
    const tagName = match.slice(1, -1).toLowerCase(); // Remove brackets
    if (!validTagNames.includes(tagName)) {
      errors.push(`Unrecognized tag: ${match}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get tag by ID
 */
export function getTagById(id: string): AudioTag | undefined {
  return AUDIO_TAGS.find(tag => tag.id === id);
}

/**
 * Search tags by name or description
 */
export function searchTags(query: string): AudioTag[] {
  const lowerQuery = query.toLowerCase();
  return AUDIO_TAGS.filter(tag =>
    tag.displayName.toLowerCase().includes(lowerQuery) ||
    tag.tag.toLowerCase().includes(lowerQuery) ||
    tag.description.toLowerCase().includes(lowerQuery)
  );
}

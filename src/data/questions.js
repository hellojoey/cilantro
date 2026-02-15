// Cilantro - Question Data & Constants
// All questions, gardens, colors, and economy constants in one place.
// v2.1: 200 base questions (8 categories x 25) + 80 garden questions (8 gardens)

export const questions = [
  // ═══════════════════════════════════════════════
  // DEEP & REFLECTIVE (25 questions, mostly medium/hard)
  // ═══════════════════════════════════════════════
  { text: "Did you feel at peace today?", type: "deep", difficulty: 2 },
  { text: "Are you proud of who you're becoming?", type: "deep", difficulty: 3 },
  { text: "Did you listen to your intuition recently?", type: "deep", difficulty: 2 },
  { text: "Is there something you need to forgive yourself for?", type: "deep", difficulty: 3 },
  { text: "Are you being honest with yourself?", type: "deep", difficulty: 3 },
  { text: "Did you make time for silence today?", type: "deep", difficulty: 1 },
  { text: "Are you holding onto something you should let go?", type: "deep", difficulty: 3 },
  { text: "Did you feel grateful for something small?", type: "deep", difficulty: 1 },
  { text: "Are you where you thought you'd be at this point in life?", type: "deep", difficulty: 3 },
  { text: "Did you choose kindness over being right?", type: "deep", difficulty: 2 },
  { text: "Is your heart lighter than it was yesterday?", type: "deep", difficulty: 2 },
  { text: "Did you do something that scared you?", type: "deep", difficulty: 2 },
  { text: "Have you been avoiding a truth about yourself?", type: "deep", difficulty: 3 },
  { text: "Did you spend time with your thoughts today?", type: "deep", difficulty: 2 },
  { text: "Are you living with intention?", type: "deep", difficulty: 3 },
  { text: "Have you outgrown a version of yourself recently?", type: "deep", difficulty: 3 },
  { text: "Did you notice something beautiful that others missed?", type: "deep", difficulty: 1 },
  { text: "Are you carrying a burden that isn't yours to carry?", type: "deep", difficulty: 3 },
  { text: "Did you honor a boundary today?", type: "deep", difficulty: 2 },
  { text: "Have you been gentle with yourself lately?", type: "deep", difficulty: 2 },
  { text: "Is there a wound you keep reopening?", type: "deep", difficulty: 3 },
  { text: "Did you feel truly seen by someone today?", type: "deep", difficulty: 2 },
  { text: "Are you becoming more yourself or less?", type: "deep", difficulty: 3 },
  { text: "Have you sat with an uncomfortable emotion recently?", type: "deep", difficulty: 3 },
  { text: "Did you give yourself permission to feel today?", type: "deep", difficulty: 2 },

  // ═══════════════════════════════════════════════
  // LIGHT-HEARTED & FUN (25 questions, mostly easy)
  // ═══════════════════════════════════════════════
  { text: "Did you laugh out loud today?", type: "light", difficulty: 1 },
  { text: "Have you danced when nobody was watching?", type: "light", difficulty: 1 },
  { text: "Did you eat something delicious?", type: "light", difficulty: 1 },
  { text: "Have you taken a really good nap recently?", type: "light", difficulty: 1 },
  { text: "Did you sing in the shower?", type: "light", difficulty: 1 },
  { text: "Have you worn your favorite outfit this week?", type: "light", difficulty: 1 },
  { text: "Did you pet a dog or cat today?", type: "light", difficulty: 1 },
  { text: "Have you watched the clouds go by?", type: "light", difficulty: 1 },
  { text: "Did you treat yourself to something nice?", type: "light", difficulty: 1 },
  { text: "Have you stayed in pajamas all day (unapologetically)?", type: "light", difficulty: 1 },
  { text: "Did you take a photo of something beautiful?", type: "light", difficulty: 1 },
  { text: "Have you had breakfast for dinner?", type: "light", difficulty: 1 },
  { text: "Did you try a new food recently?", type: "light", difficulty: 1 },
  { text: "Have you done something silly today?", type: "light", difficulty: 1 },
  { text: "Did you say something that made yourself laugh?", type: "light", difficulty: 1 },
  { text: "Have you splashed in a puddle as an adult?", type: "light", difficulty: 1 },
  { text: "Did you make a wish on something today?", type: "light", difficulty: 1 },
  { text: "Have you worn mismatched socks on purpose?", type: "light", difficulty: 1 },
  { text: "Did you doodle or draw something just for fun?", type: "light", difficulty: 1 },
  { text: "Have you had an entire conversation with a pet?", type: "light", difficulty: 1 },
  { text: "Did you eat dessert first?", type: "light", difficulty: 1 },
  { text: "Have you made a blanket fort as an adult?", type: "light", difficulty: 1 },
  { text: "Did you wave at a baby today?", type: "light", difficulty: 1 },
  { text: "Have you used a silly voice for no reason?", type: "light", difficulty: 1 },
  { text: "Did you find money in an old pocket?", type: "light", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // SOCIAL & RELATIONSHIPS (25 questions, mixed)
  // ═══════════════════════════════════════════════
  { text: "Did you tell someone you appreciate them?", type: "social", difficulty: 2 },
  { text: "Have you called a friend just to chat?", type: "social", difficulty: 1 },
  { text: "Did you make someone smile today?", type: "social", difficulty: 1 },
  { text: "Have you hugged someone you love?", type: "social", difficulty: 1 },
  { text: "Did you really listen when someone talked to you?", type: "social", difficulty: 2 },
  { text: "Have you reconnected with an old friend?", type: "social", difficulty: 2 },
  { text: "Did you ask someone how they're really doing?", type: "social", difficulty: 2 },
  { text: "Have you shared a meal with someone?", type: "social", difficulty: 1 },
  { text: "Did you compliment a stranger?", type: "social", difficulty: 2 },
  { text: "Have you sent a thinking-of-you text?", type: "social", difficulty: 1 },
  { text: "Did you forgive someone today?", type: "social", difficulty: 3 },
  { text: "Have you made plans to see someone you miss?", type: "social", difficulty: 2 },
  { text: "Did you let someone help you today?", type: "social", difficulty: 2 },
  { text: "Have you told someone they inspire you?", type: "social", difficulty: 2 },
  { text: "Did you hold space for someone's feelings?", type: "social", difficulty: 3 },
  { text: "Have you said sorry when you were wrong?", type: "social", difficulty: 3 },
  { text: "Did you celebrate someone else's win today?", type: "social", difficulty: 1 },
  { text: "Have you had a deep conversation recently?", type: "social", difficulty: 2 },
  { text: "Did you introduce two people who should know each other?", type: "social", difficulty: 2 },
  { text: "Have you checked in on someone who went quiet?", type: "social", difficulty: 2 },
  { text: "Did you let someone go first today?", type: "social", difficulty: 1 },
  { text: "Have you thanked someone who's always there?", type: "social", difficulty: 2 },
  { text: "Did you share something vulnerable with someone?", type: "social", difficulty: 3 },
  { text: "Have you laughed with someone until it hurt?", type: "social", difficulty: 1 },
  { text: "Did you put your phone away during a conversation?", type: "social", difficulty: 2 },

  // ═══════════════════════════════════════════════
  // POP CULTURE & ENTERTAINMENT (25 questions, mostly easy)
  // ═══════════════════════════════════════════════
  { text: "Have you watched a movie that made you cry?", type: "popculture", difficulty: 1 },
  { text: "Do you know all the words to a Taylor Swift song?", type: "popculture", difficulty: 1 },
  { text: "Have you binged an entire series in one sitting?", type: "popculture", difficulty: 1 },
  { text: "Did you get emotionally attached to a fictional character?", type: "popculture", difficulty: 1 },
  { text: "Have you ever dressed up for a movie premiere?", type: "popculture", difficulty: 1 },
  { text: "Do you have a celebrity crush?", type: "popculture", difficulty: 1 },
  { text: "Have you cried during an animated movie?", type: "popculture", difficulty: 1 },
  { text: "Did you rewatch a comfort show recently?", type: "popculture", difficulty: 1 },
  { text: "Have you listened to a song on repeat for hours?", type: "popculture", difficulty: 1 },
  { text: "Do you know more about a fictional universe than real history?", type: "popculture", difficulty: 1 },
  { text: "Have you quoted a movie in a real conversation?", type: "popculture", difficulty: 1 },
  { text: "Did you discover a new artist you love?", type: "popculture", difficulty: 1 },
  { text: "Have you had a song stuck in your head all day?", type: "popculture", difficulty: 1 },
  { text: "Did a TV show change your perspective on something?", type: "popculture", difficulty: 2 },
  { text: "Have you stayed up too late finishing a book?", type: "popculture", difficulty: 1 },
  { text: "Do you have a comfort movie you've seen 10+ times?", type: "popculture", difficulty: 1 },
  { text: "Have you cried at a song in public?", type: "popculture", difficulty: 1 },
  { text: "Did you learn something real from a fictional story?", type: "popculture", difficulty: 2 },
  { text: "Have you recommended a show to everyone you know?", type: "popculture", difficulty: 1 },
  { text: "Do you have a playlist for your current mood?", type: "popculture", difficulty: 1 },
  { text: "Have you cosplayed or wanted to?", type: "popculture", difficulty: 1 },
  { text: "Did a podcast make you rethink something?", type: "popculture", difficulty: 2 },
  { text: "Have you felt understood by a song lyric?", type: "popculture", difficulty: 1 },
  { text: "Do you judge a person by their taste in music?", type: "popculture", difficulty: 1 },
  { text: "Have you written fan fiction or wanted to?", type: "popculture", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // TRIVIA & RANDOM (25 questions, mixed)
  // ═══════════════════════════════════════════════
  { text: "Can you name all the planets in order?", type: "trivia", difficulty: 2 },
  { text: "Do you know your blood type?", type: "trivia", difficulty: 1 },
  { text: "Have you ever seen a shooting star?", type: "trivia", difficulty: 1 },
  { text: "Can you fold a paper crane?", type: "trivia", difficulty: 2 },
  { text: "Do you know how to read a map without GPS?", type: "trivia", difficulty: 2 },
  { text: "Have you ever grown something from a seed?", type: "trivia", difficulty: 1 },
  { text: "Can you name a constellation in the night sky?", type: "trivia", difficulty: 2 },
  { text: "Do you remember your childhood phone number?", type: "trivia", difficulty: 2 },
  { text: "Have you ever been to a different continent?", type: "trivia", difficulty: 1 },
  { text: "Can you cook a meal without a recipe?", type: "trivia", difficulty: 1 },
  { text: "Do you know the capital of Australia?", type: "trivia", difficulty: 2 },
  { text: "Have you ever written a letter by hand?", type: "trivia", difficulty: 1 },
  { text: "Can you name five countries that start with 'M'?", type: "trivia", difficulty: 2 },
  { text: "Do you know what your name means?", type: "trivia", difficulty: 1 },
  { text: "Have you ever been awake for more than 24 hours?", type: "trivia", difficulty: 1 },
  { text: "Can you ride a bicycle with no hands?", type: "trivia", difficulty: 2 },
  { text: "Do you know how to change a tire?", type: "trivia", difficulty: 2 },
  { text: "Have you ever seen the Northern Lights?", type: "trivia", difficulty: 1 },
  { text: "Can you whistle a full melody?", type: "trivia", difficulty: 1 },
  { text: "Do you know how to swim?", type: "trivia", difficulty: 1 },
  { text: "Have you ever caught a fish?", type: "trivia", difficulty: 1 },
  { text: "Can you do mental math faster than your phone?", type: "trivia", difficulty: 2 },
  { text: "Do you know your Wi-Fi password by heart?", type: "trivia", difficulty: 1 },
  { text: "Have you ever built something with your hands?", type: "trivia", difficulty: 1 },
  { text: "Can you type without looking at the keyboard?", type: "trivia", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // DAILY LIFE & WELLNESS (25 questions, mostly easy)
  // ═══════════════════════════════════════════════
  { text: "Did you drink enough water today?", type: "wellness", difficulty: 1 },
  { text: "Have you stretched your body?", type: "wellness", difficulty: 1 },
  { text: "Did you get some fresh air?", type: "wellness", difficulty: 1 },
  { text: "Have you taken a deep breath on purpose?", type: "wellness", difficulty: 1 },
  { text: "Did you put your phone down for an hour?", type: "wellness", difficulty: 2 },
  { text: "Have you done something just for yourself?", type: "wellness", difficulty: 2 },
  { text: "Did you go to bed at a reasonable time?", type: "wellness", difficulty: 2 },
  { text: "Have you moved your body today?", type: "wellness", difficulty: 1 },
  { text: "Did you eat a vegetable?", type: "wellness", difficulty: 1 },
  { text: "Have you looked up from your screen at the sky?", type: "wellness", difficulty: 1 },
  { text: "Did you wake up feeling rested?", type: "wellness", difficulty: 1 },
  { text: "Have you taken a walk outside today?", type: "wellness", difficulty: 1 },
  { text: "Did you eat a home-cooked meal?", type: "wellness", difficulty: 1 },
  { text: "Have you said no to something that drains you?", type: "wellness", difficulty: 2 },
  { text: "Did you spend less than an hour on social media?", type: "wellness", difficulty: 2 },
  { text: "Have you cleaned or organized a space today?", type: "wellness", difficulty: 1 },
  { text: "Did you take your medication or vitamins?", type: "wellness", difficulty: 1 },
  { text: "Have you listened to your body's signals?", type: "wellness", difficulty: 2 },
  { text: "Did you do something that made you feel strong?", type: "wellness", difficulty: 2 },
  { text: "Have you journaled or reflected in writing?", type: "wellness", difficulty: 2 },
  { text: "Did you avoid comparing yourself to others today?", type: "wellness", difficulty: 3 },
  { text: "Have you created something today?", type: "wellness", difficulty: 2 },
  { text: "Did you rest without guilt?", type: "wellness", difficulty: 2 },
  { text: "Have you spent time in nature this week?", type: "wellness", difficulty: 1 },
  { text: "Did you set a healthy boundary today?", type: "wellness", difficulty: 3 },

  // ═══════════════════════════════════════════════
  // CREATIVITY & DREAMS (NEW - 25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you have a vivid dream last night?", type: "creativity", difficulty: 1 },
  { text: "Have you written something creative recently?", type: "creativity", difficulty: 2 },
  { text: "Did you make something with your hands today?", type: "creativity", difficulty: 2 },
  { text: "Have you had a new idea that excited you?", type: "creativity", difficulty: 1 },
  { text: "Did you daydream today?", type: "creativity", difficulty: 1 },
  { text: "Have you tried a new creative medium?", type: "creativity", difficulty: 2 },
  { text: "Did you take a photo that tells a story?", type: "creativity", difficulty: 2 },
  { text: "Have you been inspired by something unexpected?", type: "creativity", difficulty: 1 },
  { text: "Did you solve a problem in a creative way?", type: "creativity", difficulty: 2 },
  { text: "Have you shared your creative work with someone?", type: "creativity", difficulty: 3 },
  { text: "Did you play music or make a sound today?", type: "creativity", difficulty: 1 },
  { text: "Have you reimagined something ordinary?", type: "creativity", difficulty: 2 },
  { text: "Did you let yourself be a beginner at something?", type: "creativity", difficulty: 2 },
  { text: "Have you written down a dream or idea?", type: "creativity", difficulty: 1 },
  { text: "Did you color, paint, or sketch today?", type: "creativity", difficulty: 1 },
  { text: "Have you arranged something beautifully?", type: "creativity", difficulty: 1 },
  { text: "Did you make up a story or scenario?", type: "creativity", difficulty: 1 },
  { text: "Have you experimented in the kitchen?", type: "creativity", difficulty: 1 },
  { text: "Did you see art that moved you?", type: "creativity", difficulty: 1 },
  { text: "Have you imagined your ideal day in detail?", type: "creativity", difficulty: 2 },
  { text: "Did you express yourself in a new way?", type: "creativity", difficulty: 2 },
  { text: "Have you built or fixed something recently?", type: "creativity", difficulty: 2 },
  { text: "Did you find beauty in something broken?", type: "creativity", difficulty: 2 },
  { text: "Have you thought about what you'd create with unlimited time?", type: "creativity", difficulty: 2 },
  { text: "Did creativity bring you joy today?", type: "creativity", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // GROWTH & AMBITION (NEW - 25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you learn something new today?", type: "growth", difficulty: 1 },
  { text: "Have you taken a step toward a goal this week?", type: "growth", difficulty: 2 },
  { text: "Did you step outside your comfort zone?", type: "growth", difficulty: 2 },
  { text: "Have you asked for feedback recently?", type: "growth", difficulty: 2 },
  { text: "Did you fail at something and try again?", type: "growth", difficulty: 3 },
  { text: "Have you read something that challenged your thinking?", type: "growth", difficulty: 2 },
  { text: "Did you practice a skill you're developing?", type: "growth", difficulty: 2 },
  { text: "Have you invested in your future self?", type: "growth", difficulty: 2 },
  { text: "Did you have a productive day?", type: "growth", difficulty: 1 },
  { text: "Have you mentored or taught someone?", type: "growth", difficulty: 2 },
  { text: "Did you start something you've been putting off?", type: "growth", difficulty: 3 },
  { text: "Have you celebrated a small win?", type: "growth", difficulty: 1 },
  { text: "Did you choose progress over perfection?", type: "growth", difficulty: 2 },
  { text: "Have you written down your goals?", type: "growth", difficulty: 2 },
  { text: "Did you resist the urge to quit something hard?", type: "growth", difficulty: 3 },
  { text: "Have you changed your mind about something important?", type: "growth", difficulty: 3 },
  { text: "Did you prioritize what matters over what's urgent?", type: "growth", difficulty: 2 },
  { text: "Have you sought out a new perspective?", type: "growth", difficulty: 2 },
  { text: "Did you show up for yourself today?", type: "growth", difficulty: 2 },
  { text: "Have you been patient with your own progress?", type: "growth", difficulty: 2 },
  { text: "Did you make a decision you'd been avoiding?", type: "growth", difficulty: 3 },
  { text: "Have you thought about your purpose lately?", type: "growth", difficulty: 3 },
  { text: "Did you do the hard thing instead of the easy thing?", type: "growth", difficulty: 3 },
  { text: "Have you acknowledged how far you've come?", type: "growth", difficulty: 2 },
  { text: "Did you invest time in something meaningful today?", type: "growth", difficulty: 2 },
];

export const gardens = [
  // ── ORIGINAL 5 GARDENS ──
  {
    id: 'shadows', name: 'Shadows', description: 'The parts of yourself you avoid',
    icon: '🌑', color: '#4A5568', seedCost: 300, tier: 3,
    questions: [
      { text: "Are you running from something you should face?", difficulty: 3 },
      { text: "Do you judge others for traits you see in yourself?", difficulty: 3 },
      { text: "Have you been lying to yourself about something important?", difficulty: 3 },
      { text: "Is there a part of yourself you're ashamed of?", difficulty: 3 },
      { text: "Are you the villain in someone else's story?", difficulty: 3 },
      { text: "Do you self-sabotage when things are going well?", difficulty: 3 },
      { text: "Are you addicted to something you won't admit?", difficulty: 3 },
      { text: "Have you hurt someone and never apologized?", difficulty: 3 },
      { text: "Do you secretly enjoy other people's failures?", difficulty: 3 },
      { text: "Are you pretending to be someone you're not?", difficulty: 3 },
    ]
  },
  {
    id: 'mirrors', name: 'Mirrors', description: 'Honest reflections on who you are',
    icon: '🪞', color: '#718096', seedCost: 200, tier: 2,
    questions: [
      { text: "Would you want to be friends with yourself?", difficulty: 2 },
      { text: "Do people know the real you?", difficulty: 2 },
      { text: "Are you living your life or someone else's expectations?", difficulty: 3 },
      { text: "If you met yourself, would you trust you?", difficulty: 2 },
      { text: "Are your values actually reflected in your actions?", difficulty: 3 },
      { text: "Do you like who you become when you're alone?", difficulty: 2 },
      { text: "Are you the same person in private as in public?", difficulty: 2 },
      { text: "Would your younger self be disappointed in you?", difficulty: 3 },
      { text: "Are you kind when no one is watching?", difficulty: 2 },
      { text: "Do you take more than you give?", difficulty: 2 },
    ]
  },
  {
    id: 'crossroads', name: 'Crossroads', description: 'Life decisions and regrets',
    icon: '⚖️', color: '#9F7AEA', seedCost: 250, tier: 2,
    questions: [
      { text: "Is there a decision you've been avoiding?", difficulty: 2 },
      { text: "Are you staying somewhere out of fear, not love?", difficulty: 3 },
      { text: "Have you given up on a dream too easily?", difficulty: 3 },
      { text: "Are you in the right career for your soul?", difficulty: 3 },
      { text: "Is there someone you should let go of?", difficulty: 3 },
      { text: "Are you choosing comfort over growth?", difficulty: 2 },
      { text: "Would you make the same choices if you could start over?", difficulty: 3 },
      { text: "Are you waiting for permission to live your life?", difficulty: 2 },
      { text: "Is fear making your decisions for you?", difficulty: 2 },
      { text: "Are you settling for less than you deserve?", difficulty: 2 },
    ]
  },
  {
    id: 'roots', name: 'Roots', description: 'Family, origin, and belonging',
    icon: '🌳', color: '#48BB78', seedCost: 200, tier: 2,
    questions: [
      { text: "Have you forgiven your parents for their mistakes?", difficulty: 3 },
      { text: "Are you repeating patterns from your childhood?", difficulty: 3 },
      { text: "Do you feel like you belong somewhere?", difficulty: 2 },
      { text: "Are there family wounds you haven't healed?", difficulty: 3 },
      { text: "Do you carry guilt that isn't yours?", difficulty: 3 },
      { text: "Have you become what your family expected?", difficulty: 2 },
      { text: "Is there a conversation with family you need to have?", difficulty: 2 },
      { text: "Do you know where you come from?", difficulty: 1 },
      { text: "Are you running toward something or away from your past?", difficulty: 3 },
      { text: "Have you made peace with your upbringing?", difficulty: 3 },
    ]
  },
  {
    id: 'depths', name: 'Depths', description: 'Mortality, meaning, and existence',
    icon: '🌊', color: '#4299E1', seedCost: 400, tier: 3,
    questions: [
      { text: "Are you afraid of dying?", difficulty: 3 },
      { text: "Do you know what you're living for?", difficulty: 3 },
      { text: "Would your life have meaning if no one remembered you?", difficulty: 3 },
      { text: "Have you accepted that you won't live forever?", difficulty: 3 },
      { text: "Are you at peace with uncertainty?", difficulty: 3 },
      { text: "Do you believe you matter in the grand scheme?", difficulty: 3 },
      { text: "Have you found something worth suffering for?", difficulty: 3 },
      { text: "Are you running out of time for what matters most?", difficulty: 3 },
      { text: "Do you know what you'd regret on your deathbed?", difficulty: 3 },
      { text: "Have you truly lived, or just existed?", difficulty: 3 },
    ]
  },

  // ── NEW 3 GARDENS ──
  {
    id: 'embers', name: 'Embers', description: 'Love, desire, and intimacy',
    icon: '🔥', color: '#E53E3E', seedCost: 250, tier: 2,
    questions: [
      { text: "Are you in love right now?", difficulty: 2 },
      { text: "Have you lost someone you still think about?", difficulty: 3 },
      { text: "Do you love yourself the way you love others?", difficulty: 3 },
      { text: "Are you afraid of being truly known by someone?", difficulty: 3 },
      { text: "Have you ever loved someone who didn't love you back?", difficulty: 2 },
      { text: "Do you express love the way your people need it?", difficulty: 3 },
      { text: "Are you holding onto a love that's already gone?", difficulty: 3 },
      { text: "Have you let someone love you fully?", difficulty: 3 },
      { text: "Do you believe you deserve the love you want?", difficulty: 3 },
      { text: "Is there something about love you need to unlearn?", difficulty: 3 },
    ]
  },
  {
    id: 'compass', name: 'Compass', description: 'Purpose, calling, and direction',
    icon: '🧭', color: '#DD6B20', seedCost: 300, tier: 3,
    questions: [
      { text: "Do you know what you'd do if money didn't matter?", difficulty: 2 },
      { text: "Are you building someone else's dream?", difficulty: 3 },
      { text: "Have you ignored a calling because it seemed impractical?", difficulty: 3 },
      { text: "Do you feel like you're on the right path?", difficulty: 2 },
      { text: "Are you doing what you were meant to do?", difficulty: 3 },
      { text: "Have you sacrificed passion for stability?", difficulty: 3 },
      { text: "Do you wake up excited about your life?", difficulty: 2 },
      { text: "Are you living by someone else's definition of success?", difficulty: 3 },
      { text: "Have you followed your curiosity to somewhere unexpected?", difficulty: 2 },
      { text: "Do you know what legacy you want to leave?", difficulty: 3 },
    ]
  },
  {
    id: 'still', name: 'Still', description: 'Solitude, silence, and inner peace',
    icon: '🕊️', color: '#B794F4', seedCost: 150, tier: 1,
    questions: [
      { text: "Can you sit in silence without reaching for your phone?", difficulty: 2 },
      { text: "Do you know what your mind sounds like when it's quiet?", difficulty: 2 },
      { text: "Have you found a place where you feel completely calm?", difficulty: 2 },
      { text: "Are you comfortable being alone?", difficulty: 2 },
      { text: "Have you meditated or been still on purpose today?", difficulty: 1 },
      { text: "Do you know what peace feels like in your body?", difficulty: 2 },
      { text: "Are you always running from silence?", difficulty: 3 },
      { text: "Have you watched a sunrise or sunset with no distractions?", difficulty: 1 },
      { text: "Do you give yourself permission to do nothing?", difficulty: 2 },
      { text: "Is your inner voice kind or critical?", difficulty: 3 },
    ]
  },
];

// Soft, calming color palette for question types
export const typeColors = {
  deep: '#8B9DC3',
  light: '#B8D4E3',
  social: '#F2B5D4',
  popculture: '#C9B1FF',
  trivia: '#98D8C8',
  wellness: '#F7DC6F',
  creativity: '#F6AD55',
  growth: '#68D391',
  garden: '#a8a29e',
  daily30: '#F59E0B',
};

// Type labels for display
export const typeLabels = {
  deep: 'Deep & Reflective',
  light: 'Light-hearted',
  social: 'Social & Relationships',
  popculture: 'Pop Culture',
  trivia: 'Trivia & Random',
  wellness: 'Daily Life & Wellness',
  creativity: 'Creativity & Dreams',
  growth: 'Growth & Ambition',
  garden: 'Garden',
  daily30: 'Daily 30',
};

// Seeds economy constants
export const SEEDS = {
  STARTING_BALANCE: 0,
  CHANGE_ANSWER_COST: 5,
  PEEK_COST: 10,
  DAILY_30_BASE_BONUS: 30,
  DAILY_30_STREAK_MULTIPLIER: 5,
  GARDEN_COMPLETION_MULTIPLIER: 2,
};

// Generate consistent Daily 30 questions based on date (same for all users)
export const getDailyQuestions = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(seed + i) * 10000) % (i + 1));
    const k = j < 0 ? -j : j;
    [shuffled[i], shuffled[k % (i + 1)]] = [shuffled[k % (i + 1)], shuffled[i]];
  }

  return shuffled.slice(0, 30);
};

// Format timestamp to readable format
export const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

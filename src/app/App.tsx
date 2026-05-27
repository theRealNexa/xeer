import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Plus, Trash2, Pin, BookOpen, FileText, Search, Sun, Moon,
  ArrowLeft, Settings, ScrollText, Layers, ChevronLeft, ChevronRight,
} from "lucide-react";

/* ── Types ── */
type DocType = "PDF" | "EPUB";
type ReadMode = "scroll" | "page";

interface Document {
  id: number;
  title: string;
  author: string;
  type: DocType;
  progress: number;
  lastRead: string;
  lastPage?: number;
  charOffset?: number;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  readMode?: ReadMode;
  content?: string;        // for EPUBs — extracted plain text
  pdfBuffer?: ArrayBuffer; // for PDFs — raw file bytes
}

const MAX_PINS = 3;
const INITIAL_DOCS: Document[] = [];

/* ── Reading content map ── */
const BOOK_PAGES: Record<number, string[]> = {
  1: [
    `The design of everyday things is not merely about aesthetics. It is about communication — the silent dialogue between an object and its user. Every door handle, every faucet, every switch is a statement. It says: here is how you use me. When that statement is clear, the interaction feels almost invisible. When it fails, frustration blooms in the gap between intention and action.\n\nNorman calls this gap the gulf of evaluation and the gulf of execution. On one side, the user forms a goal. On the other, the world offers affordances — perceived possibilities for action. Great design bridges both gulfs so completely that the user never knows they crossed them.\n\nConsider the humble push-plate on a door. It offers exactly one instruction without words: push here. No handle, no ambiguity, no wrong move. That silence is the loudest design choice the architect made.`,
    `Affordances are the relationships between object properties and the capabilities of the agent interacting with them. A chair affords sitting, but also standing on, stacking, and throwing — if one is so inclined. What we perceive as affordances is shaped by our bodies, our culture, and our prior experience.\n\nSignifiers, distinct from affordances, are the perceivable signals that communicate affordances. A well-placed line of wear on a floor tells you where others have walked. A thumb-smudge on glass tells you where others have pressed. Good signifiers emerge from use; great ones are designed in from the start.\n\nThe lesson is not that designers must anticipate every user. It is that they must respect the ecology of everyday action — the invisible choreography of hand, eye, and expectation that governs every conscious moment.`,
    `Feedback is the cornerstone of effective systems. Without it, the user is navigating in silence, sending signals into a void and waiting for a world that may never answer. Feedback closes the loop between action and outcome.\n\nFeedback can be visual, auditory, tactile, or temporal. The click of a key, the resistance of a dial, the ripple on a touchscreen — each tells the hand something different. The most sophisticated systems layer multiple feedback channels so that failure in one is compensated by another.\n\nBut feedback must be calibrated. Too little, and the user is lost. Too much, and the signal drowns in noise. The art lies in choosing the quietest confirmation that still tells the whole truth.`,
    `Conceptual models are the mental maps users carry into every interaction. These models are rarely accurate, often contradictory, and almost always incomplete — yet they are the frames through which every product is judged.\n\nThe designer's job is not to correct these models but to cooperate with them. A thermostat that responds immediately to a higher setting cooperates with the widespread — and incorrect — belief that thermostats work like valves. To fight this model would frustrate the user. To design around it is compassion dressed as engineering.\n\nThis is the quiet humility at the heart of user-centred design: it is not about what the designer knows. It is about what the user believes, and how gracefully the system accommodates that belief.`,
    `Human error is almost never human. It is system error — a failure of design that placed a person in a situation where a mistake was the most natural outcome available. Every near-miss, every disaster, every moment of inexplicable stupidity is a lesson the system should have taught differently.\n\nSlips happen when the right intention meets the wrong action. Mistakes happen when the wrong intention is formed in the first place. Both can be designed against.\n\nThe question is not: why did the operator fail? It is: what in the environment made failure easier than success? That shift in question changes everything — blame becomes analysis, punishment becomes redesign, and the next failure becomes preventable rather than inevitable.`,
    `Good design is actually a lot harder to notice than poor design, in part because good designs fit our needs so well that the design is invisible, serving us without drawing attention to itself. Bad design, on the other hand, screams out its inadequacy, making itself known through the errors and frustration it produces in those who encounter it.\n\nDesign is really an act of communication, which means having a deep understanding of the person with whom the designer is communicating. This is why a designer who has spent years on a product and understands it intimately is often the worst person to evaluate whether someone new will understand it.\n\nDesign is not just what it looks like and feels like. Design is how it works — and that work is never done in isolation. It is always done in relationship to a human being who brings their full history into the interaction.`,
    `The seven stages of action form a complete theory of how humans interact with the world. We form a goal. We plan an action sequence. We execute it. We perceive the state of the world. We interpret what we have perceived. We evaluate whether the outcome matches the goal. And we begin again.\n\nMost interactions collapse several stages into an instant — a seasoned driver barely thinks about the mechanics of merging. But when novelty enters, the stages separate and become visible. The new user reaches for a menu and must consciously work through all seven, step by step.\n\nExpert design anticipates both the expert user and the novice, building interfaces that collapse gracefully for the former and scaffold gently for the latter.`,
    `We live in a complex world, filled with artifacts and systems. But complexity need not imply confusion. Complexity is inevitable; confusion is a design failure. The goal is to make systems that are understandable, navigable, and recoverable — systems that forgive the inevitable mistakes of the human beings who use them.\n\nThe best designs leave traces of their own logic. They are self-documenting. They invite exploration rather than demanding study. They are built on the assumption that the user is intelligent, curious, and deserving of respect.\n\nThis is the final lesson: design is not about the designer's vision. It is about the user's life. Every choice made at the drawing board ripples forward into someone's morning, someone's deadline, someone's moment of quiet competence or quiet despair.`,
  ],
  2: [
    `Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil. But I who have seen the nature of the good that it is beautiful, and of the bad that it is ugly, and the nature of him who does wrong, that it is akin to me, not only of the same blood or seed, but that it participates in the same intelligence and the same portion of the divinity, I can neither be injured by any of them, for no one can fix on me what is ugly, nor can I be angry with my kinsman, nor hate him.\n\nFor we are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth. To act against one another then is contrary to nature; and it is acting against one another to be vexed and to turn away.`,
    `Confine yourself to the present. All that happens to you is your material for spiritual progress. Do not disturb yourself by picturing your life as a whole. Do not think of the many and various troubles which have come in the past and may come in the future, but ask yourself with regard to every present difficulty: what is there in this that is intolerable and beyond endurance?\n\nYou would be ashamed to confess it, you would not. And then remind yourself that it is not the future or the past but only the present that weighs upon you, and the present will seem much more manageable if you take it in isolation and call your mind to task if it attempts to judge events that have not yet happened.`,
    `Never esteem anything as of advantage to you that will make you break your word or lose your self-respect. Do not be indifferent to what is happening around you. If your neighbor is sick, do not use this as an excuse to avoid helping him. If a friend is in error, do not refuse to correct him because correction involves conflict.\n\nThe universe is change; our life is what our thoughts make it. A man's life is what his thoughts make it. The Stoic does not flee the world. He inhabits it fully, with clear eyes and a steady will, giving what is required and taking only what is due.\n\nTo live with the gods is to live as a just person, accepting all things that happen as necessary, and offering what the moment asks, without calculation or complaint.`,
    `Waste no more time arguing about what a good man should be. Be one. The quality of your life is determined by the quality of your thoughts, and your thoughts are entirely within your own power.\n\nWhen you are troubled by anything external, the pain is not due to the thing itself, but to your estimate of it; and this you have the power to revoke at any moment. Your mind is the judge, and the judge cannot be harmed by the verdict it delivers.\n\nBe like the cliff against which the waves continually break; but it stands firm and tames the fury of the water around it. The obstacle is the way. The difficulty is the practice. The resistance is the teacher.`,
    `It is not death that a man should fear, but he should fear never beginning to live. Much of what passes for ambition is actually fear of mortality dressed in a more flattering costume.\n\nIf it is not right, do not do it; if it is not true, do not say it. These two principles, applied consistently, would simplify the life of every person who adopted them. Complexity, confusion, and regret would diminish in proportion to the honesty and integrity brought to each moment.\n\nWhenever you want to cheer yourself up, consider the qualities of the people around you — their energy, their modesty, their generosity. Nothing cheers you up so much as the images of virtue displayed in those who live with you.`,
    `The first rule: keep an untroubled spirit. The second: look things in the face and know them for what they are. Observation and equanimity are the twin pillars of Stoic life — not because the world is kind, but because distress about what cannot be changed is a form of self-abandonment.\n\nYou have power over your mind — not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts; therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature.\n\nVery little is needed to make a happy life; it is all within yourself — in your way of thinking. The Stoic turns inward not to escape the world but to master the only territory that was ever truly his.`,
    `Perfection of character is this: to live each day as if it were your last, without frenzy, without apathy, without pretense. That is to say: do everything that matters, and leave undone everything that does not.\n\nLook back over the past, with its changing empires that rose and fell, and you can foresee the future, too. All things are the same in character — every generation the same. Begin the morning by reminding yourself that you have not earned the day. The day is a gift, and the work it contains is a privilege.\n\nThe tranquility that comes from having attended to every moment honestly is better than any reward the world can offer. The Stoic does not chase tranquility; he clears the path for it by removing every pretense that stood in the way.`,
    `Everything harmonizes with me, which is harmonious to thee, O Universe. Nothing for me is too early nor too late, which is in due time for thee. Everything is fruit to me which thy seasons bring, O Nature: from thee are all things, in thee are all things, to thee all things return.\n\nThis is the Stoic's final prayer — not a petition but an affirmation. The universe does not need our blessing. We need its instruction. And the instruction is always the same: be present, be honest, be useful, and let go.\n\nThe object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane. To live deliberately, with open eyes and a willing heart — this is the whole of Stoic philosophy.`,
  ],
  3: [
    `The premise of the book is that there are two systems driving the way we think. System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control. System 2 allocates attention to the effortful mental activities that demand it, including complex computations. The operations of System 2 are often associated with the subjective experience of agency, choice, and concentration.\n\nWhen we think of ourselves, we identify with System 2 — the conscious, reasoning self that has beliefs, makes choices, and decides what to think about and what to do. Although System 2 believes itself to be where the action is, the automatic System 1 is the hero of this book. System 1 effortlessly originates impressions and feelings that are the main sources of the explicit beliefs and deliberate choices of System 2.`,
    `Attention is effort, and people — busy, tired, or distracted — are misers with it. The law of least effort applies to cognitive as well as physical exertion. If there are several ways of achieving the same goal, people will eventually gravitate to the least demanding course of action. Laziness is built deep into our nature.\n\nCognitive ease is what System 1 reads as truth. When you feel easy, you feel like you know. When you feel strained, you feel uncertain. This is why familiar things feel true: not because they are true, but because familiarity reduces the cognitive effort required to process them.\n\nPriming, anchoring, the availability heuristic — all exploit the basic architecture of a mind trying to do as little work as possible while still navigating a complicated world.`,
    `We are prone to overestimate how much we understand about the world and to underestimate the role of chance in events. Luck plays a larger role in success than we are comfortable admitting, because admitting it disrupts the narrative of agency that gives life its meaning.\n\nThe halo effect is one expression of this tendency. Once we form a positive impression of someone, we unconsciously assign them other positive qualities they may not possess. The attractive person seems more competent. The articulate speaker seems more honest. The confident claim seems more accurate.\n\nNarrative is the great deceiver. We build stories to explain the past, and those stories feel inevitable in retrospect — but they were never inevitable. They were contingent, fragile, the product of a thousand small accidents dressed up in the costume of destiny.`,
    `The anchoring effect illustrates how numbers, even arbitrary ones, can influence our estimates and decisions. When asked whether Gandhi was more or less than 114 years old when he died, people give higher estimates of his actual age than when asked if he was more or less than 35. The anchor contaminates the answer even when the person knows the anchor is irrelevant.\n\nThis effect is not limited to numbers. Any initial piece of information activates a selective search for information consistent with it. Confirmation bias and anchoring cooperate to trap the mind in whatever frame was offered first.\n\nGood decision-making requires knowing which frames you are inhabiting, which anchors have been set without your consent, and which stories you are telling yourself about why you know what you know.`,
    `The illusion of understanding the past fosters overconfidence in our ability to predict the future. We think we understand the past better than we actually do, because we revise our memory of our former beliefs to match what actually happened. This is hindsight bias, and it is nearly impossible to prevent.\n\nThe inside view focuses on the specific circumstances of a situation. The outside view ignores the details and focuses on statistical regularities — what usually happens in situations like this. The outside view is almost always more accurate, and almost always ignored.\n\nExperts are not immune. Indeed, the most articulate experts — those who have the most compelling stories — are often the most wrong, because their confidence comes from narrative fluency, not from accuracy.`,
    `We have two selves: the experiencing self, which lives in the present moment, and the remembering self, which keeps score and makes choices. These selves often want different things, and the remembering self usually wins — because it is the one that makes decisions.\n\nPeak-end rule governs the remembering self: it evaluates an episode by the average of its most intense moment and its final moment, ignoring duration entirely. A painful colonoscopy with a gentle ending is remembered as less painful than a shorter one that ended badly. This is the tyranny of endings.\n\nWe are not the same person across time. The experiencing self passes away with each moment. The remembering self constructs a story that outlasts any single experience. These two selves are strangers to each other, and we would do well to remember which one is running the show.`,
    `The planning fallacy is the tendency to underestimate time, costs, and risks of future actions while overestimating the benefits. It afflicts almost every project, from home renovations to government infrastructure. The inside view dominates: we see our plan in vivid detail and cannot easily imagine the thousand ways it might go wrong.\n\nThe cure is reference class forecasting — deliberately ignoring the details of your plan and asking: how long do projects like this actually take? How often do they come in on budget? The answer is almost always uncomfortable, and almost always closer to the truth.\n\nThis requires humility that runs against the optimistic bias that drives most innovation. The optimist who starts the project and the realist who finishes it are rarely the same person, and both are necessary.`,
    `Thinking slow is a discipline. It requires willingness to slow down, to notice the impressions that System 1 has already formed, and to subject them to the scrutiny of System 2. This is not always the right choice — sometimes fast is exactly what the situation requires. But on the decisions that matter most, slowing down is almost always worth it.\n\nThe bottom line is that System 1 is a machine for jumping to conclusions, and jumping to conclusions is efficient if the conclusions are likely to be correct, the costs of occasional mistakes are acceptable, and the alternative is slow and cumbersome cognitive operations.\n\nKnowing about the biases does not automatically correct them. But it is the beginning of a more honest relationship with your own mind — which is the beginning of wisdom.`,
  ],
  4: [
    `I want to tell you about the day I knew I was a writer. Not the day I first put words on paper — I had been doing that since I was six, filling composition notebooks with the adventures of heroes whose names I have long forgotten. I mean the day writing became something I could not imagine not doing.\n\nI was twelve. It was summer. I was writing a story about a haunted house in a blue notebook that smelled of must and possibility. My mother came into my room, looked at the notebook, looked at me, and said: if you keep on writing, someday maybe someone will pay you for it. I did not know if she believed it. I did not know if I believed it. But I kept on writing.\n\nThe rest, as they say, is bibliography.`,
    `The toolbox metaphor is simple. Imagine a toolbox with four levels. On the bottom, the heaviest tools: vocabulary, grammar, style. Above that, the elements of usage. Above that, the elements of form and structure. At the top — and this is where most writers want to start — are the tools of theme and symbolism, metaphor and allusion.\n\nBut you must work up from the bottom. You cannot build a story on a weak foundation of grammar any more than you can build a house on sand. The beautiful sentences come later, after the bones are sound and the joints are tight.\n\nVocabulary is the first and simplest tool. Use the first word that comes to mind, if it is appropriate and colorful. Never use a long word when a short one will do. Never use a word that requires a footnote.`,
    `Reading is the creative center of a writer's life. I take a book with me everywhere I go. You should do the same. If you don't have time to read, you don't have the time — or the tools — to write.\n\nThe real importance of reading is that it creates an ease and intimacy with the process of storytelling, with all the different ways in which stories can be told. You become familiar with pace and the rhythm of narration. You feel good stories and bad stories and indifferent stories.\n\nYou begin to understand what separates them. Not through analysis — through absorption. The writer is a reader who has been moved, disturbed, consoled, or illuminated by the written word, and who cannot rest until they have attempted to do the same for someone else.`,
    `Write with the door closed. Rewrite with the door open. The first draft belongs only to you. It is the story you tell yourself. The second draft is for the reader.\n\nWhen you write with the door closed, you are free to be bad. Bad is essential. Bad is where good comes from. The first draft is just the beginning of a process that is almost entirely about revision — the patient, ruthless, loving work of cutting away everything that is not the story.\n\nThen you open the door. You let someone in — one trusted reader, or maybe two. You listen to them. You do not defend the draft; you interrogate it. You ask: what was I trying to do, and did I do it? Often the answer is no, and the next draft begins.`,
    `The most important things to remember about back story are that everyone has one, and most of it is never told. This is good. The back story is the ground from which the character grows, not the character itself.\n\nThink of the iceberg. What the reader sees is the tenth that is above the waterline. What the writer knows is the nine tenths below. That knowledge informs every word the visible portion speaks, every gesture it makes, every choice it considers and rejects.\n\nDo not dump the back story in the first chapter. Do not dump it at all, if you can avoid it. Let it seep through in dialogue, in detail, in the choices a character makes under pressure. The reader will do the rest. Trust them.`,
    `Adverbs are not your friends. The adverb is a weed. It grows where the verb has not done its job. "He ran quickly" is weaker than "he sprinted." "She said angrily" is weaker than the anger already visible in what she said.\n\nThis is not a rule about adverbs. It is a rule about trust — trust in the verb, trust in the noun, trust in the reader. When you over-explain, you signal uncertainty about your own prose. The reader feels this, even if they cannot articulate it.\n\nStrip the qualifiers. Let the sentence stand on its own weight. If it falls, find a stronger verb, not a supporting adverb. The work of revision is in large part the work of removing the scaffolding — the hedges, the repetitions, the apologetic asides that are the marks of a writer who did not yet trust the sentence.`,
    `When I'm asked what I do, I sometimes say I'm a writer. Other times I say I'm in the storytelling business. The difference matters. Writing is a craft. Storytelling is a calling.\n\nThe craft can be learned, to a degree. Grammar can be studied. Structure can be modeled. Prose style can be imitated, refined, made one's own. But the calling — the need to tell stories, the feeling that experience is not complete until it has been shaped into narrative — that is either present or it is not.\n\nWhat I know is that the stories were always there. They were waiting in the summer air, in the faces of strangers, in the gaps between what was said and what was meant. Writing was just the act of taking them down.`,
    `The scariest moment is always just before you start. After that, things can only get better. This is true of the first sentence of every day's work, and it is true of the first sentence of a book that has not yet been written.\n\nSo sit down. Close the door. Put your fingers on the keys, or the pen on the paper. And begin. Begin badly if necessary. Begin awkwardly. Begin in the wrong place and work your way to the right one. But begin.\n\nThe rest of the advice — all of it, every book on writing ever published — is commentary on that single imperative. Begin. The work is not in knowing how to write. The work is in writing.`,
  ],
  5: [
    `Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it twice the same way.\n\nThough the language of patterns may seem technical, its subject is not. Its subject is life — the life of houses and streets and towns and gardens. It is concerned with the fact that most of the environments we build today are places where people cannot feel at home.\n\nA pattern language is a network of patterns that call upon one another. The larger patterns help to complete the smaller ones; the smaller ones help to embody and instantiate the larger ones. Together they form a whole.`,
    `Independent regions. The world can absorb and sustain something like 500 million persons if, and only if, the land is divided into regions which are self-governing and self-sustaining.\n\nTowns of 500,000. The region has a metropolitan area at its center, with a population of about 500,000, which provides the cultural and economic heartbeat of the region.\n\nFinger cities. Cities spread out along arterial roads, and the land between the arterials is kept as countryside. This prevents the city from becoming a formless sprawl and maintains the countryside within easy reach of every part of the city.\n\nThese are not utopian prescriptions. They are descriptions of what works — descriptions drawn from the places where human beings have felt most alive, most connected, most at home.`,
    `Neighborhoods should be small enough so that the residents can identify with them. The neighborhood has a heart — a pub, a bakery, a school, a green — which gives it identity and which draws the residents together in a way that the abstract fact of common geography cannot.\n\nDensity is not the enemy of community. It can be its condition. But density must be human-scale. The tower block that houses a thousand people in a vertical slice is not a neighborhood; it is a storage unit. The street that houses a hundred people in two- and three-storey buildings is a neighborhood; it has surface area, edge, and depth.\n\nThe patterns that make community are almost all about edges — about the places where private becomes public, inside becomes outside, and the individual meets the collective.`,
    `Four-storey limit. There is a widespread belief among architects and planners that high buildings are efficient — that they make better use of land. This is false. Above four storeys, the cost of construction per unit of floor area increases. The view from the ground is destroyed. The street is abandoned. The city becomes inhospitable.\n\nLet the building heights reflect a human scale. Four storeys is a limit that preserves both the practicality of the street and the dignity of the sky. Above four storeys, you are no longer building for human beings; you are building for statistics.\n\nThis is the central claim of the pattern language: that the environment we build either supports or destroys the life within it, and that we have both the knowledge and the obligation to build in ways that support it.`,
    `Staircase as a stage. Stairs are transitions. They connect different planes of existence — the public and the private, the daytime and the nighttime, the social and the intimate. A good staircase is not merely a mechanism for moving between floors; it is a social space in its own right.\n\nThink of the grand staircase of an old hotel. Think of the narrow stone stairs of a Mediterranean town house, worn smooth by generations of feet. In both cases, the stair has a character — a sense of drama, of passage, of arrival — that a flat floor cannot have.\n\nBuild your stairs wide enough for two people to pass comfortably. Place a window at the landing so that the transition is marked by a change in light. Make the staircase a destination, not just a route.`,
    `Intimacy gradient. Within a building, the pattern of spaces should move from public to private as one moves away from the entrance. The front room is the most public; the bedroom is the most private; the intermediate spaces — the corridor, the landing, the study — form a gradient between them.\n\nThis is not merely a functional requirement. It is a psychological one. Human beings need to feel that their most private moments are protected by layers of space — that they can be reached only by invitation, only by those who have passed through the intermediate rooms.\n\nWhen buildings violate the intimacy gradient — when the bedroom opens directly onto the street, or the living room is more private than the study — the people within them feel exposed and anxious. The pattern language is, in the end, a theory of human comfort.`,
    `Light on two sides of every room. Rooms lit from one side feel flat and institutional. Rooms lit from two sides feel alive. The light comes from different angles at different times of day; the shadows shift; the room breathes.\n\nThis is not a luxury. It is a basic requirement of a room that supports human life. A room that does not have light on two sides is a room that will always feel slightly wrong — slightly airless, slightly oppressive — no matter how well furnished or carefully decorated.\n\nTwo sides of light means two exposures, two orientations, two connections to the outside world. It means the room is not sealed against the day but in conversation with it.`,
    `The need to belong to a place is as basic as the need for food or shelter. Human beings are territorial in the deepest sense — not in the aggressive, exclusionary sense of territorial animals, but in the sense of needing a place that is theirs, that reflects them, that they have shaped and been shaped by.\n\nThe pattern language is an attempt to describe the physical conditions under which this belonging becomes possible. It is not a prescription for a particular style or aesthetic. It is a description of the structures — the spatial, social, and temporal structures — within which human beings can feel at home.\n\nYou can use these patterns in any order, at any scale, in any culture. The language is not the buildings. The buildings are what happens when the language is spoken.`,
  ],
  6: [
    `Vigorous writing is concise. A sentence should contain no unnecessary words, a paragraph no unnecessary sentences, for the same reason that a drawing should have no unnecessary lines and a machine no unnecessary parts.\n\nThis requires not that the writer make all his sentences short, or that he avoid all detail and treat his subjects only in outline, but that every word tell. The rule applies equally to all writing — the epic and the epigram, the instruction manual and the elegy.\n\nOmit needless words. This is the commandment that underlies all the others. When you have followed it honestly, your prose will be cleaner, clearer, and more alive than it was before.`,
    `Do not overwrite. Rich, ornate prose is hard to digest, generally unwholesome, and sometimes nauseating. If the senses of a sentence are clear without an adjective, cut the adjective. If the meaning of a passage is plain without a metaphor, leave the metaphor out.\n\nThe adjective has not been born that can pull a weak or inaccurate noun out of a tight place. The writer who uses the first adjective that comes to mind often discovers, on revision, that it is the last adjective that is needed — because no adjective is needed at all.\n\nClarity, clarity, clarity. When you become hopelessly mired in a sentence, it is best to start fresh; do not try to fight your way through against the terrible odds of syntax. Begin anew.`,
    `Do not affect a breezy manner. The volume of writing is enormous, these days, and much of it has a sort of windiness about it, almost as though the author were in a state of euphoria. Spontaneity is the quality of good writing — but it cannot be achieved by faking it.\n\nPrefer the standard to the offbeat. The writer gets into trouble when he invents novelty for its own sake — when the unusual word or the unusual construction is chosen not because it is more precise but because it is more impressive. Impressiveness achieved at the cost of clarity is a form of obscenity.\n\nBe clear. Be plain. Let the thought do the work, and the words will take care of themselves.`,
    `Place yourself in the background. Write in a way that draws the reader's attention to the sense and substance of the writing, rather than to the mood and temper of the author. If the writing is solid and good, the mood and temper of the author will eventually be revealed, and not at the expense of the work.\n\nThe first person singular is a useful pronoun, provided it is not overused. It must not appear too often, lest the reader, glancing up from the page, see the writer waving from every paragraph like a child on a carousel, crying, "Watch me! Watch me!"\n\nThe reticent author is not the bloodless author. He is the author who trusts the material — who believes that the story itself, if told with sufficient care and honesty, will communicate everything the author feels about it.`,
    `Use the active voice. The active voice is usually more direct and vigorous than the passive. Many a tame sentence of description or exposition can be made lively and emphatic by substituting a transitive verb in the active for some such perfunctory expression as "there is" or "could be heard."\n\nThe mistake is often the reverse: the writer uses the passive voice when he wants to sound scientific, or official, or elevated. The passive voice is the coward's way out — a grammatical apology for having expressed an opinion at all.\n\nWhen the writer says "it is generally believed" instead of "I believe" or "most readers believe," he obscures responsibility. Active voice assigns responsibility. This is why the powerful prefer the passive — and why the honest writer prefers the active.`,
    `Work from a suitable design. Before beginning to compose something, gauge the nature and extent of the enterprise and work from a suitable design. Design informs even the simplest structure, whether or not the writer is conscious of it.\n\nThe most common design failure in prose is the failure of proportion — giving too much space to what is trivial and too little space to what is essential. The writer who has not decided what the essential thing is will distribute space randomly, and the reader will feel cheated, though they may not be able to say why.\n\nOutline, if you must. But the outline is only a tool — a way of discovering the shape of the thing before you have built it. The shape is in the material, and the writer's job is to find it.`,
    `Prefer the specific to the general, the definite to the vague, the concrete to the abstract. If your adjective is "interesting," make it specific: "Remarkable? Extraordinary? Bewildering?" The concrete word persuades where the abstract word merely suggests.\n\nThe writer will often find that the moment of specificity is the moment of truth — that the specific detail not only clarifies the sentence but illuminates the whole subject. The fog of vagueness lifts, and the thing that was hidden is suddenly visible.\n\nThis is the pleasure of good prose: it makes visible what was invisible. It names what was nameless. It gives form to what was formless. And it does so not by imposing itself on reality but by attending to reality so carefully that reality reveals itself.`,
    `Style is the writer's way of telling the reader that the writer cares. It is the trace of a person in a text — not an ornament but an inevitability, the way handwriting is a trace of the hand.\n\nEvery writer, by the way he uses language, reveals something of his spirit, his habits, his capacities, his biases. This is inevitable, because a writer uses language to express himself, and language is the medium through which all expression passes.\n\nThe job of the writer is to learn, over a lifetime of practice, how to use this trace well — how to let the self show through without overwhelming the subject. The goal is not a style that calls attention to itself but one that supports the material so naturally that the reader never notices it at all.`,
  ],
};

const CHARS_PER_PAGE_BASE = 800; // chars at fontSize 17
const BASE_FONT = 17;

function getPagesForFontSize(docId: number, fontSize: number, content?: string): string[] {
  const fullText = content
    ? content
    : (BOOK_PAGES[docId] ?? BOOK_PAGES[1]).join("\n\n");
  
  const charsPerPage = Math.round(CHARS_PER_PAGE_BASE * (BASE_FONT / fontSize));
  const result: string[] = [];
  
  let i = 0;
  while (i < fullText.length) {
    let end = i + charsPerPage;
    if (end < fullText.length) {
      const breakPoint = fullText.lastIndexOf(" ", end);
      if (breakPoint > i) end = breakPoint;
    }
    result.push(fullText.slice(i, end).trim());
    i = end;
  }
  return result;
}
async function extractEpubText(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);

  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) throw new Error("Invalid EPUB: no container.xml");

  const containerDoc = new DOMParser().parseFromString(containerXml, "application/xml");
  const opfPath = containerDoc.querySelector("rootfile")?.getAttribute("full-path");
  if (!opfPath) throw new Error("Invalid EPUB: no OPF path");

  const opfXml = await zip.file(opfPath)?.async("string");
  if (!opfXml) throw new Error("Invalid EPUB: no OPF file");

  const opfDoc = new DOMParser().parseFromString(opfXml, "application/xml");
  const opfDir = opfPath.includes("/") ? opfPath.split("/").slice(0, -1).join("/") + "/" : "";

  const manifest: Record<string, string> = {};
  opfDoc.querySelectorAll("manifest item").forEach(item => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (id && href) manifest[id] = href;
  });

  const spineIds = Array.from(opfDoc.querySelectorAll("spine itemref"))
    .map(ref => ref.getAttribute("idref"))
    .filter(Boolean) as string[];

  const textParts: string[] = [];
  for (const id of spineIds) {
    const href = manifest[id];
    if (!href) continue;
    const fullPath = opfDir + href;
    const html = await zip.file(fullPath)?.async("string");
    if (!html) continue;
    const htmlDoc = new DOMParser().parseFromString(html, "application/xhtml+xml");
    htmlDoc.querySelectorAll("script, style").forEach(el => el.remove());
    const text = htmlDoc.body?.textContent ?? "";
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (cleaned.length > 0) textParts.push(cleaned);
  }

  return textParts.join("\n\n");
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import(
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs"
  ) as any;
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs";

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line.length > 0) parts.push(line);
  }
  return parts.join("\n\n");
}


function getPages(docId: number): string[] {
  return BOOK_PAGES[docId] ?? BOOK_PAGES[1];
}

/* ── Color token type ── */
interface Tokens {
  bg: string; shell: string; outer: string; card: string; fg: string;
  muted: string; border: string; accent: string; accentFg: string;
  input: string; inputBorder: string; pinActive: string; pinInactive: string;
  trash: string; trashHover: string;
  badge: { epub: { bg: string; color: string }; pdf: { bg: string; color: string } };
  progress: { track: string; high: string; mid: string; low: string };
  toggleBg: string; toggleFg: string; searchBg: string; searchBorder: string;
  pinBanner: string; pinBannerText: string; divider: string;
}

function makeTokens(isDark: boolean): Tokens {
  return isDark
    ? {
        bg: "#141210", shell: "#141210", outer: "#0D0B09", card: "#1F1C19",
        fg: "#EDE8E0", muted: "#7A7267", border: "rgba(237,232,224,0.09)",
        accent: "#C9A87A", accentFg: "#141210",
        input: "rgba(237,232,224,0.07)", inputBorder: "rgba(237,232,224,0.12)",
        pinActive: "#C9A87A", pinInactive: "rgba(237,232,224,0.25)",
        trash: "rgba(196,64,64,0.7)", trashHover: "#c44040",
        badge: {
          epub: { bg: "rgba(201,168,122,0.15)", color: "#C9A87A" },
          pdf:  { bg: "rgba(237,232,224,0.08)", color: "#7A7267" },
        },
        progress: { track: "rgba(237,232,224,0.1)", high: "#C9A87A", mid: "rgba(201,168,122,0.55)", low: "rgba(201,168,122,0.28)" },
        toggleBg: "rgba(237,232,224,0.07)", toggleFg: "#7A7267",
        searchBg: "rgba(237,232,224,0.07)", searchBorder: "rgba(237,232,224,0.12)",
        pinBanner: "rgba(201,168,122,0.08)", pinBannerText: "#7A7267",
        divider: "rgba(237,232,224,0.08)",
      }
    : {
        bg: "#F0EBE3", shell: "#F0EBE3", outer: "#DDD5C8", card: "#FAF7F2",
        fg: "#1A1815", muted: "#8A7F74", border: "rgba(26,24,21,0.1)",
        accent: "#6B4C2A", accentFg: "#FAF7F2",
        input: "rgba(26,24,21,0.04)", inputBorder: "rgba(26,24,21,0.12)",
        pinActive: "#6B4C2A", pinInactive: "rgba(26,24,21,0.2)",
        trash: "rgba(160,48,48,0.5)", trashHover: "#b03030",
        badge: {
          epub: { bg: "rgba(107,76,42,0.1)", color: "#6B4C2A" },
          pdf:  { bg: "rgba(26,24,21,0.07)", color: "#8A7F74" },
        },
        progress: { track: "rgba(26,24,21,0.09)", high: "#6B4C2A", mid: "rgba(107,76,42,0.55)", low: "rgba(107,76,42,0.28)" },
        toggleBg: "rgba(26,24,21,0.07)", toggleFg: "#8A7F74",
        searchBg: "rgba(26,24,21,0.04)", searchBorder: "rgba(26,24,21,0.1)",
        pinBanner: "rgba(107,76,42,0.06)", pinBannerText: "#8A7F74",
        divider: "rgba(26,24,21,0.08)",
      };
}

/* ══════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════ */
export default function App() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("xeer_theme");
      return saved !== null ? saved === "dark" : true;
    } catch { return true; }
  });
  
  const [docs, setDocs] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem("xeer_docs");
      return saved ? JSON.parse(saved) : INITIAL_DOCS;
    } catch { return INITIAL_DOCS; }
  });

  const [pinnedIds, setPinnedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem("xeer_pins");
      return saved ? new Set<number>(JSON.parse(saved)) : new Set([1, 4]);
    } catch { return new Set([1, 4]); }
  });
  const [query, setQuery]         = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const t = makeTokens(isDark);

  useEffect(() => {
    localStorage.setItem("xeer_docs", JSON.stringify(docs));
  }, [docs]);

  useEffect(() => {
    localStorage.setItem("xeer_pins", JSON.stringify([...pinnedIds]));
  }, [pinnedIds]);

  useEffect(() => {
    localStorage.setItem("xeer_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? docs.filter(d => d.title.toLowerCase().includes(q) || d.author.toLowerCase().includes(q)) : docs;
    return [...list.filter(d => pinnedIds.has(d.id)), ...list.filter(d => !pinnedIds.has(d.id))];
  }, [docs, pinnedIds, query]);
  
  function handleProgressUpdate(id: number, progress: number, page: number) {
    setDocs(prev => prev.map(d =>
      d.id === id ? { ...d, progress, lastRead: "Now", lastPage: page } : d
    ));
  }

  function handleClose(
    id: number,
    charOffset: number,
    fontSize: number,
    fontFamily: string,
    isBold: boolean,
    readMode: ReadMode
  ) {
    setDocs(prev => prev.map(d =>
      d.id === id ? { ...d, charOffset, fontSize, fontFamily, isBold, readMode } : d
    ));
    setSelectedDoc(null);
  }    

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const type: DocType = file.name.toLowerCase().endsWith(".epub") ? "EPUB" : "PDF";
    const id = Date.now();
    const newDoc: Document = {
      id,
      title: file.name.replace(/\.(pdf|epub)$/i, ""),
      author: "Unknown",
      type,
      progress: 0,
      lastRead: "Just added",
    };
    setDocs(prev => [...prev, newDoc]);
    e.target.value = "";

    if (type === "EPUB") {
      extractEpubText(file).then(content => {
        setDocs(prev => prev.map(d => d.id === id ? { ...d, content } : d));
      }).catch(err => console.error("EPUB extraction failed:", err));
    }

    if (type === "PDF") {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        extractPdfText(buffer).then(content => {
          setDocs(prev => prev.map(d => d.id === id ? { ...d, content } : d));
        }).catch(err => console.error("PDF extraction failed:", err));
      };
      reader.readAsArrayBuffer(file);
    }
  }
  

  function handleDelete(id: number) {
    setDocs(prev => prev.filter(d => d.id !== id));
    setPinnedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }
  function handlePin(id: number) {
    setPinnedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { if (n.size >= MAX_PINS) return prev; n.add(id); }
      return n;
    });
  }

  return (
    <div style={{ background: t.outer, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        className={isDark ? "dark" : ""}
        style={{ background: t.bg, width: "100%", maxWidth: 390, minHeight: "100svh", maxHeight: "100svh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}
      >
        {/* ── Library screen ── */}
        <div
          style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            transform: selectedDoc ? "translateX(-100%)" : "translateX(0%)",
            transition: "transform 380ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <LibraryScreen
            t={t} isDark={isDark} setIsDark={setIsDark}   
            query={query} setQuery={setQuery}
            filtered={filtered} pinnedIds={pinnedIds}
            onDelete={handleDelete} onPin={handlePin}
            onOpen={setSelectedDoc}
            onFileAdd={handleFileAdd}
          />
        </div>

        {/* ── Reading screen ── */}
        <div
          style={{
            position: "absolute", inset: 0,
            transform: selectedDoc ? "translateX(0%)" : "translateX(100%)",
            transition: "transform 380ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
        {selectedDoc && (
            <ReadingScreen
              doc={selectedDoc}
              t={t}
              onClose={(charOffset, fontSize, fontFamily, isBold, mode) =>
                handleClose(selectedDoc.id, charOffset, fontSize, fontFamily, isBold, mode)
              }
              onProgressUpdate={handleProgressUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LIBRARY SCREEN
══════════════════════════════════════════════ */
function LibraryScreen({
  t, isDark, setIsDark, 
  query, setQuery, filtered, pinnedIds, onDelete, onPin, onOpen, onFileAdd,
}: {
  t: Tokens; isDark: boolean; setIsDark: (v: boolean) => void;
  query: string; setQuery: (v: string) => void;
  filtered: Document[]; pinnedIds: Set<number>;
  onDelete: (id: number) => void; onPin: (id: number) => void;
  onOpen: (doc: Document) => void;
  onFileAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <div style={{ height: 44, flexShrink: 0 }} />
      <div style={{ padding: "0 24px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: t.fg, letterSpacing: "-0.02em", lineHeight: 1 }}>
            Xeer
          </h1>
        </div>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: t.searchBg, border: `1px solid ${t.searchBorder}`, borderRadius: 14, padding: "10px 14px", marginBottom: 16 }}>
          <Search size={16} color={t.muted} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <input
            type="text" placeholder="Search titles, authors…" value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 400, color: t.fg, caretColor: t.accent }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: t.muted, lineHeight: 1, fontSize: 18 }}>×</button>
          )}
        </div>
        {/* Label row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 600, color: t.fg }}>
            Library
            <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 400, color: t.muted }}>{filtered.length}</span>
          </span>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: t.toggleBg, border: "none", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 12, color: t.toggleFg }}
          >
            {isDark ? <Sun size={13} strokeWidth={2} /> : <Moon size={13} strokeWidth={2} />}
            {isDark ? "Light" : "Dark"}
          </button>                
        </div>
      </div>

      <div style={{ height: 1, background: t.divider, margin: "4px 24px 0", flexShrink: 0 }} />

      {pinnedIds.size >= MAX_PINS && (
        <div style={{ margin: "8px 16px 0", padding: "7px 14px", borderRadius: 10, background: t.pinBanner, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: t.pinBannerText }}>3 pinned — unpin one to pin another</span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 112px", scrollbarWidth: "none" }}>
        {filtered.length === 0 ? (
          <EmptyState t={t} hasQuery={!!query} query={query} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((doc, i) => (
              <DocCard
                key={doc.id} doc={doc} index={i}
                pinned={pinnedIds.has(doc.id)}
                canPin={pinnedIds.size < MAX_PINS || pinnedIds.has(doc.id)}
                onDelete={() => onDelete(doc.id)}
                onPin={() => onPin(doc.id)}
                onOpen={() => onOpen(doc)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      <FAB t={t} onFileAdd={onFileAdd} />
    </>
  );
}

/* ══════════════════════════════════════════════
   READING SCREEN
══════════════════════════════════════════════ */
function ReadingScreen({ doc, t, onClose, onProgressUpdate }: { 
  doc: Document; t: Tokens; onClose: (charOffset: number, fontSize: number, fontFamily: string, isBold: boolean, mode: ReadMode) => void; 
  onProgressUpdate: (id: number, progress: number, page: number) => void 
}) {
  const [fontSize, setFontSize]     = useState(doc.fontSize ?? 14);
  const [isBold, setIsBold]         = useState(doc.isBold ?? false);
  const [fontFamily, setFontFamily] = useState(doc.fontFamily ?? "'DM Serif Display', serif");
  const MIN_FONT = 11;
  const MAX_FONT = 24;

  const FONTS = [
    { label: "Serif", value: "'DM Serif Display', serif" },
    { label: "Humanist", value: "'Nunito', sans-serif" },
    { label: "Mono", value: "'Courier New', monospace" },
    { label: "Modern", value: "Georgia, serif" },
  ];
  const pages = getPagesForFontSize(doc.id, fontSize, doc.content);
  useEffect(() => {
    if (pages.length > 0) {
      setCurrentPage(p => Math.min(p, pages.length - 1));
    }
  }, [pages.length]);

  useEffect(() => {
    if (mode !== "scroll" || !scrollRef.current || !doc.charOffset) return;
    const fullText = doc.content
      ? doc.content
      : (BOOK_PAGES[doc.id] ?? BOOK_PAGES[1]).join("\n\n");
    const ratio = doc.charOffset / fullText.length;
    const el = scrollRef.current;
    // small delay to let content render first
    setTimeout(() => {
      el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
    }, 50);
  }, []); // empty deps — run once on mount only

  const totalPages = pages.length;

  const [mode, setMode] = useState<ReadMode>(doc.readMode ?? "scroll");
  const [currentPage, setCurrentPage] = useState(() => {
    if (!doc.charOffset) return 0;
    const initPages = getPagesForFontSize(doc.id, doc.fontSize ?? 14, doc.content);
    let accumulated = 0;
    for (let i = 0; i < initPages.length; i++) {
      accumulated += initPages[i].length;
      if (accumulated >= doc.charOffset) return i;
    }
    return Math.max(0, initPages.length - 1);
  });
  const [scrollProgress, setScrollProgress] = useState(doc.progress);
  const [showSettings, setShowSettings]     = useState(false);
  const [pageFlash, setPageFlash]           = useState<"left" | "right" | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [immersive, setImmersive] = useState(false);
  const [showGoTo, setShowGoTo] = useState(false);
  const [goToInput, setGoToInput] = useState("");
  
  // Scroll progress tracking
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const pct = scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100;
    const rounded = Math.round(pct);
    setScrollProgress(rounded);
    onProgressUpdate(doc.id, rounded, currentPage); // ✅ after pct is defined
  }, [doc.id, currentPage, onProgressUpdate]);

  // Page tap handler
  useEffect(() => {
    const pct = Math.round(((currentPage + 1) / totalPages) * 100);
    onProgressUpdate(doc.id, pct, currentPage);
  }, [currentPage, mode]); // fires every time page changes

  function handleContentTap(e: React.MouseEvent<HTMLDivElement>) {
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    console.log("x:", x, "width:", rect.width, "third:", rect.width * 0.3);
    const third = rect.width * 0.3;

    if (x >= third && x <= rect.width - third) {
      // center zone — always toggle immersive regardless of mode
      setImmersive(v => !v);
      return;
    }

    if (mode !== "page") return;

    if (x < third) {
      if (currentPage > 0) {
        setCurrentPage(p => p - 1);
        setPageFlash("left");
        setTimeout(() => setPageFlash(null), 300);
      }
    } else if (x > rect.width - third) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(p => p + 1);
        setPageFlash("right");
        setTimeout(() => setPageFlash(null), 300);
      }
    } else {
      setImmersive(v => !v);
    }
  }
  
  function handleGoTo() {
    const num = parseInt(goToInput, 10);
    if (isNaN(num)) return;
    const clamped = Math.max(1, Math.min(num, totalPages));
    const targetPage = clamped - 1;

    if (mode === "page") {
      setCurrentPage(targetPage);
    } else {
      // scroll mode: jump to the character position of that page
      const el = scrollRef.current;
      if (!el) return;
      const ratio = targetPage / Math.max(1, totalPages - 1);
      el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
    }

    setGoToInput("");
    setShowGoTo(false);
  }

  const displayPage   = mode === "page" ? currentPage : Math.round((scrollProgress / 100) * (totalPages - 1));
  const displayPct    = mode === "page" ? Math.round(((currentPage + 1) / totalPages) * 100) : scrollProgress;
  const progressColor = displayPct >= 75 ? t.progress.high : displayPct >= 35 ? t.progress.mid : t.progress.low;

  // Reading background — slightly warmer for readability
  const readBg = t.fg === "#EDE8E0" ? "#171410" : "#FDFAF5";
  const readFg = t.fg === "#EDE8E0" ? "#DDD8D0" : "#2A2520";
  const readMuted = t.fg === "#EDE8E0" ? "#5A5550" : "#C0B8B0";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: readBg, position: "relative" }}>

      {/* ── Header ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 5,
        background: readBg,
        transform: immersive ? "translateY(-110%)" : "translateY(0%)",
        transition: "transform 320ms cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ height: 44 }} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px 14px",
          borderBottom: `1px solid ${t.divider}`,
        }}>
        <button
          onClick={() => {
            let offset = 0;
            if (mode === "page") {
              const pages = getPagesForFontSize(doc.id, fontSize, doc.content);
              offset = pages.slice(0, currentPage).reduce((acc, p) => acc + p.length, 0);
            } else {
              // scroll mode: derive offset from scroll percentage
              const fullText = doc.content
                ? doc.content
                : (BOOK_PAGES[doc.id] ?? BOOK_PAGES[1]).join("\n\n");
              offset = Math.round((scrollProgress / 100) * fullText.length);
            }
            onClose(offset, fontSize, fontFamily, isBold, mode);
          }}
        >
          <ArrowLeft size={20} strokeWidth={1.8} color={t.accent} />
        </button>

        <div style={{ flex: 1, textAlign: "center", padding: "0 12px", overflow: "hidden" }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: readFg, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.title}
          </p>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: readMuted, margin: 0, marginTop: 1 }}>
            {doc.author}
          </p>
        </div>

        <button
          onClick={() => setShowSettings(v => !v)}
          style={{ background: showSettings ? `${t.accent}18` : "none", border: "none", cursor: "pointer", padding: 7, borderRadius: 10, display: "flex", alignItems: "center", color: t.accent, transition: "background 0.15s" }}
          aria-label="Reading settings"
        >
          <Settings size={18} strokeWidth={1.6} color={showSettings ? t.accent : readMuted} style={{ transition: "color 0.15s" }} />
        </button>
      </div>
    </div>
  

      {/* ── Content area ── */}
      <div style={{ position: "absolute", top: 50, bottom: 5, left: 0, right: 0, overflow: "hidden" }}>

        {/* Tap zone hints for page mode */}
        {mode === "page" && (
          <>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 12, pointerEvents: "none", opacity: pageFlash === "left" ? 0.5 : 0, transition: "opacity 0.3s" }}>
              <ChevronLeft size={32} color={t.accent} strokeWidth={1.5} />
            </div>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 12, pointerEvents: "none", opacity: pageFlash === "right" ? 0.5 : 0, transition: "opacity 0.3s" }}>
              <ChevronRight size={32} color={t.accent} strokeWidth={1.5} />
            </div>
          </>
        )}

        {mode === "scroll" ? (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onClick={handleContentTap}
            style={{ height: "100%", overflowY: "auto", padding: "28px 28px 16px", scrollbarWidth: "none" }}
          >
            {pages.map((page, i) => (
              <div key={i}>
                {i > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "36px 0" }}>
                    <div style={{ flex: 1, height: 1, background: t.divider }} />
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: readMuted, letterSpacing: "0.08em" }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, height: 1, background: t.divider }} />
                  </div>
                )}
                <p style={{
                  fontFamily: fontFamily,
                  fontSize: fontSize,
                  fontWeight: isBold ? 700 : 400,
                  lineHeight: 1.82,
                  color: readFg,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  letterSpacing: "0.005em",
                }}>
                  {page}
                </p>
              </div>
            ))}
            <div style={{ height: 60 }} />
          </div>
        ) : (
          <div
            onClick={handleContentTap}
            style={{ height: "100%", padding: "28px 28px 16px", overflow: "hidden", cursor: "pointer", userSelect: "none", position: "relative" }}
          >
            <p style={{
              fontFamily: fontFamily,
              fontSize: fontSize,
              fontWeight: isBold ? 700 : 400,
              lineHeight: 1.82,
              color: readFg,                margin: 0,
              whiteSpace: "pre-wrap",
              letterSpacing: "0.005em",
            }}>
              {pages[currentPage]}
            </p>
            {/* Invisible tap zones */}
            <div style={{ position: "absolute", inset: 0, display: "flex" }}>
              <div style={{ flex: 1 }} />
              <div style={{ flex: 1 }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5, padding: "10px 24px 32px", borderTop: `1px solid ${t.divider}`, background: readBg, transform: immersive ? "translateY(110%)" : "translateY(0%)", transition: "transform 320ms cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 999, background: t.progress.track, overflow: "hidden", marginBottom: 10, transform: immersive ? "translateY(110%)" : "translateY(0%)", transition: "transform 320ms cubic-bezier(0.4,0,0.2,1)", }}>
          <div style={{ width: `${displayPct}%`, height: "100%", borderRadius: 999, background: progressColor, transition: "width 0.4s" }} />
        </div>
        {/* Page info */}
        {showGoTo ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: readMuted, flexShrink: 0 }}>
              Go to page
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goToInput}
              autoFocus
              onChange={e => setGoToInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleGoTo();
                if (e.key === "Escape") { setShowGoTo(false); setGoToInput(""); }
              }}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${t.accent}`,
                outline: "none",
                fontFamily: "'Nunito', sans-serif",
                fontSize: 13,
                color: readFg,
                caretColor: t.accent,
                textAlign: "center",
                padding: "2px 4px",
              }}
            />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: readMuted, flexShrink: 0 }}>
              of {totalPages}
            </span>
            <button
              onClick={handleGoTo}
              style={{ background: t.accent, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 12, color: t.accentFg, flexShrink: 0 }}
            >
              Go
            </button>
            <button
              onClick={() => { setShowGoTo(false); setGoToInput(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 18, color: readMuted, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => setShowGoTo(true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
            >
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: readMuted }}>
                {mode === "page" ? `Page ${currentPage + 1} of ${totalPages}` : `Page ${displayPage + 1} of ${totalPages}`}
              </span>
            </button>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: readMuted }}>
              {displayPct}%
            </span>
          </div>
        )}
      </div>

      {/* ── Settings sheet ── */}
      <div
        ref={settingsRef}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          background: t.card,
          borderRadius: "20px 20px 0 0",
          boxShadow: `0 -8px 40px rgba(0,0,0,${t.fg === "#EDE8E0" ? "0.5" : "0.15"})`,
          padding: "8px 0 48px",
          transform: showSettings ? "translateY(0)" : "translateY(110%)",
          transition: "transform 320ms cubic-bezier(0.4,0,0.2,1)",
          zIndex: 10,
          overflowY: "auto",
          maxHeight: "72vh",
          scrollbarWidth: "none",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.border }} />
        </div>
        <div style={{ padding: "0 20px 16px" }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
            Font Size
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setFontSize(s => Math.max(MIN_FONT, s - 1))}
              style={{ width: 32, height: 32, borderRadius: 8, background: t.toggleBg, border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 18, color: t.fg, display: "flex", alignItems: "center", justifyContent: "center" }}
            >−</button>
            <input
              type="range"
              min={MIN_FONT}
              max={MAX_FONT}
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              style={{ flex: 1, accentColor: t.accent }}
            />
            <button
              onClick={() => setFontSize(s => Math.min(MAX_FONT, s + 1))}
              style={{ width: 32, height: 32, borderRadius: 8, background: t.toggleBg, border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 18, color: t.fg, display: "flex", alignItems: "center", justifyContent: "center" }}
            >+</button>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: t.muted, minWidth: 28, textAlign: "right" }}>{fontSize}px</span>
          </div>
        </div>

        {/* Bold toggle */}
        <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${t.divider}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Bold Text
            </p>
            <button
              onClick={() => setIsBold(v => !v)}
              style={{
                width: 44, height: 26, borderRadius: 13,
                background: isBold ? t.accent : t.toggleBg,
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3,
                left: isBold ? 21 : 3,
                width: 20, height: 20, borderRadius: "50%",
                background: isBold ? t.accentFg : t.muted,
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        </div>

        {/* Font selector */}
        <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${t.divider}` }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "16px 0 12px" }}>
            Typeface
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {FONTS.map(f => (
              <button
                key={f.value}
                onClick={() => setFontFamily(f.value)}
                style={{
                  padding: "10px 0",
                  borderRadius: 10,
                  border: fontFamily === f.value ? `1.5px solid ${t.accent}` : `1.5px solid ${t.border}`,
                  background: fontFamily === f.value ? `${t.accent}12` : t.toggleBg,
                  cursor: "pointer",
                  fontFamily: f.value,
                  fontSize: 14,
                  color: fontFamily === f.value ? t.accent : t.fg,
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px 4px", borderTop: `1px solid ${t.divider}` }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "16px 0 14px" }}>
            Reading Mode
          </p>
        </div>

        {/* Scroll option */}
        <ModeOption
          label="Smooth Scroll"
          description="Read continuously by scrolling"
          icon={<ScrollText size={20} strokeWidth={1.6} />}
          active={mode === "scroll"}
          t={t}
          onClick={() => { setMode("scroll"); setShowSettings(false); }}
        />
        {/* Page by page option */}
        <ModeOption
          label="Page by Page"
          description="Tap left or right side to turn"
          icon={<Layers size={20} strokeWidth={1.6} />}
          active={mode === "page"}
          t={t}
          onClick={() => { setMode("page"); setShowSettings(false); }}
        />
      </div>

      {/* Settings backdrop */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{ position: "absolute", inset: 0, zIndex: 9, background: "rgba(0,0,0,0.3)" }}
        />
      )}
    </div>
  );
}

function ModeOption({ label, description, icon, active, t, onClick }: {
  label: string; description: string; icon: React.ReactNode;
  active: boolean; t: Tokens; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        width: "100%", padding: "14px 20px",
        background: active ? `${t.accent}12` : "transparent",
        border: "none", cursor: "pointer",
        borderLeft: active ? `3px solid ${t.accent}` : "3px solid transparent",
        transition: "background 0.15s",
        textAlign: "left",
      }}
    >
      <span style={{ color: active ? t.accent : t.muted, display: "flex", flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 600, color: active ? t.fg : t.muted, margin: 0 }}>{label}</p>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: t.muted, margin: "2px 0 0", fontWeight: 400 }}>{description}</p>
      </div>
      {active && (
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════
   LIBRARY COMPONENTS
══════════════════════════════════════════════ */
function DocCard({ doc, index, pinned, canPin, onDelete, onPin, onOpen, t }: {
  doc: Document; index: number; pinned: boolean; canPin: boolean;
  onDelete: () => void; onPin: () => void; onOpen: () => void; t: Tokens;
}) {
  const [pressed, setPressed]     = useState(false);
  const [trashHover, setTrashHover] = useState(false);
  const [pinHover, setPinHover]   = useState(false);
  const badge = doc.type === "EPUB" ? t.badge.epub : t.badge.pdf;
  const progressColor = doc.progress >= 75 ? t.progress.high : doc.progress >= 35 ? t.progress.mid : t.progress.low;

  function handleCardClick(e: React.MouseEvent) {
    // Don't open reader if clicking action buttons
    if ((e.target as HTMLElement).closest("button")) return;
    onOpen();
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: t.card, borderRadius: 16, padding: "14px 14px 14px 16px",
        boxShadow: pressed ? "none" : `0 1px 3px rgba(0,0,0,${t.fg === "#EDE8E0" ? "0.3" : "0.06"}), 0 4px 16px rgba(0,0,0,${t.fg === "#EDE8E0" ? "0.2" : "0.05"})`,
        transform: pressed ? "scale(0.985)" : "scale(1)",
        transition: "transform 150ms, box-shadow 150ms",
        border: pinned ? `1px solid ${t.accent}22` : `1px solid ${t.border}`,
        cursor: "pointer",
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {pinned && <div style={{ width: 3, borderRadius: 2, background: t.accent, alignSelf: "stretch", flexShrink: 0, marginRight: 2, opacity: 0.8 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: t.fg, lineHeight: 1.3, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.title}
          </span>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: t.muted, fontWeight: 400 }}>{doc.author}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: 500, letterSpacing: "0.03em", background: badge.bg, color: badge.color }}>
            {doc.type === "EPUB" ? <BookOpen size={9} /> : <FileText size={9} />}
            {doc.type}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={onPin}
              onMouseEnter={() => setPinHover(true)}
              onMouseLeave={() => setPinHover(false)}
              disabled={!canPin && !pinned}
              aria-label={pinned ? "Unpin" : "Pin to top"}
              style={{ background: pinned ? `${t.accent}18` : "transparent", border: "none", borderRadius: 8, padding: "5px 6px", cursor: canPin || pinned ? "pointer" : "not-allowed", opacity: !canPin && !pinned ? 0.3 : 1, transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Pin size={14} strokeWidth={pinned ? 0 : 1.8} fill={pinned ? t.accent : pinHover && (canPin || pinned) ? t.accent : "none"} color={pinned ? t.accent : t.pinInactive} style={{ transition: "fill 0.15s, color 0.15s" }} />
            </button>
            <button
              onClick={onDelete}
              onMouseEnter={() => setTrashHover(true)}
              onMouseLeave={() => setTrashHover(false)}
              aria-label="Remove from library"
              style={{ background: trashHover ? "rgba(196,64,64,0.1)" : "transparent", border: "none", borderRadius: 8, padding: "5px 6px", cursor: "pointer", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Trash2 size={14} strokeWidth={1.8} color={trashHover ? t.trashHover : t.trash} style={{ transition: "color 0.15s" }} />
            </button>
          </div>
        </div>
      </div>
      {doc.progress > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 3, borderRadius: 999, background: t.progress.track, overflow: "hidden" }}>
            <div style={{ width: `${doc.progress}%`, height: "100%", borderRadius: 999, background: progressColor, transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: t.muted }}>{doc.progress}% read</span>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: t.muted }}>{doc.lastRead}</span>
          </div>
        </div>
      )}
      {doc.progress === 0 && (
        <div style={{ marginTop: 8 }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: t.muted }}>{doc.lastRead}</span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ t, hasQuery, query }: { t: Tokens; hasQuery: boolean; query: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px" }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: `${t.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <BookOpen size={26} color={t.accent} strokeWidth={1.5} />
      </div>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: t.fg, textAlign: "center", margin: 0 }}>
        {hasQuery ? `No results for "${query}"` : "No documents yet"}
      </p>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: t.muted, textAlign: "center", marginTop: 8, lineHeight: 1.6, maxWidth: 220 }}>
        {hasQuery ? "Try a different search term." : "Tap the + button below to add your first book or document."}
      </p>
    </div>
  );
}

function FAB({ t, onFileAdd }: { t: Tokens; onFileAdd: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [pressed, setPressed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.epub"
        style={{ display: "none" }}
        onChange={onFileAdd}
      />
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        onClick={() => fileRef.current?.click()}
        style={{ pointerEvents: "all", width: 56, height: 56, borderRadius: "50%", background: t.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: pressed ? `0 2px 8px ${t.accent}40` : `0 6px 24px ${t.accent}55, 0 2px 8px ${t.accent}30`, transform: pressed ? "scale(0.91)" : "scale(1)", transition: "transform 140ms, box-shadow 140ms" }}
        aria-label="Add document"
      >
        <Plus size={22} color={t.accentFg} strokeWidth={2.5} style={{ transform: pressed ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 200ms" }} />
      </button>
    </div>
  );
}

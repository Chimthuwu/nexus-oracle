# 🧠 Mind Mapper — Product & Question Bank Specification

## Purpose

**Mind Mapper** is a general-purpose AI memory and personalization system presented as a living 3D representation of the user's mind.

It is not intended to be a personality test or a 1,000-question form. The 1,000 questions below are a **seed question bank**. The AI should dynamically choose questions based on what it already knows, what is uncertain, what has recently been discussed, and which relationships between memories need clarification.

The goal is for the AI to progressively build a rich, user-controlled **knowledge graph** and visualize that graph as an evolving 3D brain.

---

## Core Experience

The user opens **Mind Mapper** from the sidebar.

Initially, the brain is mostly colourless and quiet.

The AI begins a conversation by asking questions.

When the user answers, the system extracts useful information and determines whether it represents:

- a stable fact
- a personal memory
- a preference
- a relationship
- an emotional association
- a goal
- an interest
- a skill
- an event
- a place
- a project
- a habit or routine
- an uncertainty or unresolved topic
- a connection between existing pieces of knowledge

The information is stored as structured knowledge rather than merely as raw chat history.

As the knowledge graph grows, the 3D brain becomes increasingly populated, colourful, interconnected and animated.

---

# 🧠 Knowledge Graph

Mind Mapper should maintain a graph rather than a flat list of memories.

A conceptual graph might look like:

**Music → Ashimaru → FL Studio → Synthwave → Vaporwave → Artist → Song → Project → Memory**

Each node represents a piece of knowledge.

Each edge represents a meaningful relationship.

Examples:

- `LIKES`
- `DISLIKES`
- `REMEMBERS`
- `RELATED_TO`
- `KNOWS`
- `FRIEND_OF`
- `FAMILY_OF`
- `WORKS_ON`
- `WANTS`
- `LEARNED`
- `CREATED`
- `VISITED`
- `ASSOCIATED_WITH`
- `INFLUENCED_BY`
- `CAUSED`
- `PART_OF`
- `OCCURRED_AT`
- `OCCURRED_DURING`
- `FEELS_ABOUT`
- `CONNECTED_TO`

The graph should support confidence, timestamps, provenance, recency and user corrections.

### Example node

```json
{
  "id": "interest_music_synthwave",
  "type": "interest",
  "label": "Synthwave",
  "confidence": 0.96,
  "createdAt": "...",
  "updatedAt": "...",
  "source": "conversation",
  "userEditable": true
}
```

### Example relationship

```json
{
  "from": "interest_music_synthwave",
  "to": "project_music_01",
  "type": "RELATED_TO",
  "confidence": 0.91
}
```

The actual implementation should follow the project's existing architecture and avoid duplicating domain logic.

---

# 🌈 Knowledge Categories & 3D Brain Representation

The brain can visually encode different classes of knowledge.

- 🟦 **Facts** — stable information about the user
- 🟪 **Memories** — specific experiences
- 🟨 **Preferences** — likes/dislikes
- 🟩 **Relationships** — people, pets, places, communities
- 🟥 **Emotional associations** — things connected to strong emotions
- 🟧 **Goals** — ambitions and things the user is working toward
- 🩷 **Interests** — subjects, hobbies, obsessions
- ⬜ **Unknown regions** — areas the AI knows little about

Additional internal categories can include skills, projects, events, routines, media, places and concepts.

## Brain Evolution

The initial brain should be subdued and largely colourless.

As knowledge is added:

1. A new node appears.
2. The corresponding region illuminates.
3. The node gains its category representation.
4. Existing related nodes become visible.
5. Connections animate between them.
6. Related clusters gradually become denser.
7. Strongly interconnected areas form recognizable constellations.
8. The brain becomes increasingly alive as the AI learns.

The visualization should communicate **growth**, not simply display a database.

---

# 🔗 Relationships Are More Important Than Raw Node Count

A brain containing 5,000 disconnected facts should not necessarily look more developed than a brain containing 500 deeply connected facts.

The visualization should reward **meaningful relationships**.

For example:

**Music**
→ **Ashimaru**
→ **FL Studio**
→ **Synthwave**
→ **Vaporwave**
→ **Artist**
→ **Song**
→ **Project**
→ **Memory**

This becomes a visible constellation.

When a new fact connects several existing nodes, the system should produce a stronger visual response.

---

# 💬 Adaptive Questioning Engine

The AI should NOT ask questions in numerical order.

Instead:

```text
Ask
 ↓
Understand answer
 ↓
Extract entities/facts/memories
 ↓
Update knowledge graph
 ↓
Find missing information
 ↓
Find interesting connections
 ↓
Select next question
 ↓
Ask
```

Questions should be selected according to:

- information gaps
- uncertainty
- recently mentioned entities
- weakly connected nodes
- important goals
- important relationships
- unexplored interests
- contradictory information
- stale memories
- opportunities to deepen an existing memory
- user curiosity
- conversation context

### Example

AI:

> You mentioned that your grandfather had a huge influence on you. What was he like?

User answers.

The graph might become:

`Grandfather → Influenced → User`

Then the AI can ask:

> What is something he taught you that you still carry with you?

That might create:

`Grandfather → Taught → Persistence`

Then:

`Persistence → Influences → Work`

The system is therefore **discovering structure**, not merely collecting answers.

---

# 🧩 Memory Provenance

Every memory should ideally retain where it came from.

The user should be able to select a brain node and ask:

**"Why do you know this?"**

The AI could explain:

> I remember this because you told me about it during a previous conversation.

The system should expose appropriate provenance metadata such as:

- source conversation
- approximate date
- originating statement
- confidence
- last confirmation
- last modification

The user should never be forced to trust an invisible memory system.

---

# ✏️ User Control

Every important memory should be inspectable.

Users should be able to:

- view
- edit
- correct
- merge
- disconnect
- archive
- forget
- permanently delete

individual memories and relationships.

The user should also be able to clear entire categories or reset the Mind Mapper.

The visualization is **the user's brain representation**, not an authority over the user.

The AI must distinguish between:

**"The user told me X."**

and

**"I inferred X from several things the user said."**

Inferred information should never silently become a hard fact.

---

# 🌌 Unknown Regions

The brain should also visualize what the AI **doesn't know**.

Unknown regions can remain dim, colourless or partially obscured.

This is important because the goal is not simply to maximize stored information.

The system should be able to identify:

- unexplored areas
- uncertain memories
- incomplete relationships
- unanswered questions
- contradictory information
- stale information

This gives the AI a reason to ask intelligent questions.

---

# 🧠 Question Selection Philosophy

The 1,000 questions below are **not a checklist**.

They are a semantic library.

The AI should:

1. Start with easy, low-pressure questions.
2. Build basic context first.
3. Follow interesting answers.
4. Ask deeper questions only when appropriate.
5. Avoid repeatedly asking things already known.
6. Prefer follow-up questions that create graph connections.
7. Occasionally revisit old information for confirmation.
8. Detect contradictions.
9. Allow users to skip anything.
10. Never pressure users to disclose sensitive information.

A good Mind Mapper conversation should feel like:

**"This AI is genuinely getting to know me."**

not:

**"I am filling out a form."**

---

# 📚 1,000-Question Seed Bank

1. **01 Identity & Self-Concept** — How would you describe yourself to someone who has never met you?
2. **01 Identity & Self-Concept** — What are three things that feel most important to who you are?
3. **01 Identity & Self-Concept** — What do you think makes you different from most people?
4. **01 Identity & Self-Concept** — What parts of your personality are you most proud of?
5. **01 Identity & Self-Concept** — What parts of yourself are you still trying to understand?
6. **01 Identity & Self-Concept** — How would your closest friend describe you?
7. **01 Identity & Self-Concept** — How would your family describe you?
8. **01 Identity & Self-Concept** — What do you wish people understood about you immediately?
9. **01 Identity & Self-Concept** — What is something about yourself that took you a long time to realize?
10. **01 Identity & Self-Concept** — Do you feel like you know yourself well?
11. **01 Identity & Self-Concept** — What kind of person are you trying to become?
12. **01 Identity & Self-Concept** — What values do you try to live by?
13. **01 Identity & Self-Concept** — Which of your values are non-negotiable?
14. **01 Identity & Self-Concept** — What usually influences your decisions the most?
15. **01 Identity & Self-Concept** — Do you usually trust your head or your gut?
16. **01 Identity & Self-Concept** — What makes you feel most like yourself?
17. **01 Identity & Self-Concept** — When do you feel least like yourself?
18. **01 Identity & Self-Concept** — What is something you will never apologize for being?
19. **01 Identity & Self-Concept** — What is something about yourself you would like to change?
20. **01 Identity & Self-Concept** — If you had to describe your personality using five words, what would they be?
21. **01 Identity & Self-Concept** — What personal quality do you rely on most?
22. **01 Identity & Self-Concept** — What personal quality gets you into trouble?
23. **01 Identity & Self-Concept** — What do you think people notice about you first?
24. **01 Identity & Self-Concept** — What do you think people notice about you only after knowing you?
25. **01 Identity & Self-Concept** — What part of your identity feels most stable?
26. **01 Identity & Self-Concept** — How has your sense of identity changed over time?
27. **01 Identity & Self-Concept** — What labels do you identify with, if any?
28. **01 Identity & Self-Concept** — What labels do you dislike being given?
29. **01 Identity & Self-Concept** — What makes you feel authentic?
30. **01 Identity & Self-Concept** — What makes you feel like you are performing for others?
31. **01 Identity & Self-Concept** — When do you feel most confident?
32. **01 Identity & Self-Concept** — When do you doubt yourself most?
33. **01 Identity & Self-Concept** — What do you think you are unusually good at understanding?
34. **01 Identity & Self-Concept** — What do you think you are unusually bad at understanding?
35. **01 Identity & Self-Concept** — What misconception do people often have about you?
36. **01 Identity & Self-Concept** — What is something you know about yourself that others might not notice?
37. **01 Identity & Self-Concept** — What are you most protective of about yourself?
38. **01 Identity & Self-Concept** — What aspect of yourself do you want to explore more?
39. **01 Identity & Self-Concept** — What do you want the AI to understand about you above everything else?
40. **01 Identity & Self-Concept** — What question about your identity have you never been asked?
41. **02 Childhood & Early Life** — Where did you grow up?
42. **02 Childhood & Early Life** — What was your childhood like?
43. **02 Childhood & Early Life** — What is one of your earliest memories?
44. **02 Childhood & Early Life** — What was your favourite thing to do as a child?
45. **02 Childhood & Early Life** — What did you want to become when you were young?
46. **02 Childhood & Early Life** — What was your favourite childhood game?
47. **02 Childhood & Early Life** — What was your favourite childhood toy?
48. **02 Childhood & Early Life** — What cartoons did you love growing up?
49. **02 Childhood & Early Life** — What shows did you love as a child?
50. **02 Childhood & Early Life** — What music did you hear growing up?
51. **02 Childhood & Early Life** — Who did you look up to when you were young?
52. **02 Childhood & Early Life** — What was your childhood home like?
53. **02 Childhood & Early Life** — Did you have childhood pets?
54. **02 Childhood & Early Life** — What was your favourite place to go as a child?
55. **02 Childhood & Early Life** — What childhood memory still makes you laugh?
56. **02 Childhood & Early Life** — What childhood memory still affects you?
57. **02 Childhood & Early Life** — What did you get into trouble for as a kid?
58. **02 Childhood & Early Life** — What was school like for you?
59. **02 Childhood & Early Life** — What was your favourite school subject?
60. **02 Childhood & Early Life** — What subject did you dislike most?
61. **02 Childhood & Early Life** — What teacher do you remember most?
62. **02 Childhood & Early Life** — What school friend do you remember most?
63. **02 Childhood & Early Life** — What did you collect as a child?
64. **02 Childhood & Early Life** — What foods remind you of childhood?
65. **02 Childhood & Early Life** — What smell reminds you of childhood?
66. **02 Childhood & Early Life** — What song reminds you of childhood?
67. **02 Childhood & Early Life** — What place reminds you of childhood?
68. **02 Childhood & Early Life** — What family activity did you enjoy most?
69. **02 Childhood & Early Life** — What did you do on weekends as a child?
70. **02 Childhood & Early Life** — What were you afraid of as a child?
71. **02 Childhood & Early Life** — What made you feel safe as a child?
72. **02 Childhood & Early Life** — What did you think adults understood that children did not?
73. **02 Childhood & Early Life** — What did you think adulthood would be like?
74. **02 Childhood & Early Life** — What childhood rule seemed ridiculous to you?
75. **02 Childhood & Early Life** — What childhood belief did you later outgrow?
76. **02 Childhood & Early Life** — What childhood dream stayed with you?
77. **02 Childhood & Early Life** — What childhood habit do you still have?
78. **02 Childhood & Early Life** — What did you wish you had more of growing up?
79. **02 Childhood & Early Life** — What did you have plenty of growing up?
80. **02 Childhood & Early Life** — What would you tell your younger self?
81. **03 Family & Home** — Who are the most important people in your family?
82. **03 Family & Home** — Who are you closest to in your family?
83. **03 Family & Home** — What traditions does your family have?
84. **03 Family & Home** — What did your family teach you that stayed with you?
85. **03 Family & Home** — What family memory means the most to you?
86. **03 Family & Home** — Who in your family do you admire most?
87. **03 Family & Home** — What characteristics seem to run in your family?
88. **03 Family & Home** — What is something funny about your family?
89. **03 Family & Home** — What do you wish your family understood about you?
90. **03 Family & Home** — What role do you usually play in your family?
91. **03 Family & Home** — What family stories do you love hearing?
92. **03 Family & Home** — What does your ideal family gathering look like?
93. **03 Family & Home** — What family meal is special to you?
94. **03 Family & Home** — What family object has sentimental value?
95. **03 Family & Home** — Who in your family influenced your interests?
96. **03 Family & Home** — Who encouraged you most growing up?
97. **03 Family & Home** — Who challenged you most growing up?
98. **03 Family & Home** — What family habit do you have now?
99. **03 Family & Home** — What family phrase or saying do you remember?
100. **03 Family & Home** — What family celebration do you enjoy?
101. **03 Family & Home** — How has your relationship with your family changed?
102. **03 Family & Home** — What family relationship has changed most over time?
103. **03 Family & Home** — What family quality are you grateful for?
104. **03 Family & Home** — What family pattern would you like to break?
105. **03 Family & Home** — What family pattern would you like to preserve?
106. **03 Family & Home** — What does home mean to you?
107. **03 Family & Home** — Where do you feel most at home?
108. **03 Family & Home** — What makes a place feel like home?
109. **03 Family & Home** — What would your ideal home contain?
110. **03 Family & Home** — What part of your current environment matters most to you?
111. **03 Family & Home** — What household task do you enjoy?
112. **03 Family & Home** — What household task do you hate?
113. **03 Family & Home** — What object in your home would be hardest to replace?
114. **03 Family & Home** — What object has a story behind it?
115. **03 Family & Home** — What place from your past would you revisit?
116. **03 Family & Home** — What family memory would you preserve forever?
117. **03 Family & Home** — What do you hope your future family life looks like?
118. **03 Family & Home** — What kind of family traditions would you create?
119. **03 Family & Home** — What family lesson do you want to pass on?
120. **03 Family & Home** — What family question would you like to explore further?
121. **04 Friends & Social World** — What makes someone a good friend to you?
122. **04 Friends & Social World** — What qualities do you value most in people?
123. **04 Friends & Social World** — How do you usually make friends?
124. **04 Friends & Social World** — Do you prefer a few close friends or many friends?
125. **04 Friends & Social World** — What makes you trust someone?
126. **04 Friends & Social World** — What makes you lose trust in someone?
127. **04 Friends & Social World** — What is the funniest thing you've experienced with a friend?
128. **04 Friends & Social World** — Who has had the biggest positive influence on your life?
129. **04 Friends & Social World** — Is there someone you wish you were still close with?
130. **04 Friends & Social World** — What makes you feel appreciated by friends?
131. **04 Friends & Social World** — How do you show people that you care?
132. **04 Friends & Social World** — How do you prefer people to support you?
133. **04 Friends & Social World** — What behaviour annoys you most in other people?
134. **04 Friends & Social World** — What makes conversation enjoyable for you?
135. **04 Friends & Social World** — Do you prefer deep conversations or casual conversations?
136. **04 Friends & Social World** — How social do you like to be?
137. **04 Friends & Social World** — How much alone time do you need?
138. **04 Friends & Social World** — What kind of people energise you?
139. **04 Friends & Social World** — What kind of people drain you?
140. **04 Friends & Social World** — What makes you feel included?
141. **04 Friends & Social World** — What makes you feel excluded?
142. **04 Friends & Social World** — What makes a friendship last?
143. **04 Friends & Social World** — What causes friendships to fade for you?
144. **04 Friends & Social World** — How do you handle disagreements with friends?
145. **04 Friends & Social World** — How quickly do you forgive?
146. **04 Friends & Social World** — How do you know when you can be vulnerable with someone?
147. **04 Friends & Social World** — What kind of humour do you enjoy with friends?
148. **04 Friends & Social World** — What do you like doing with friends?
149. **04 Friends & Social World** — What is your favourite shared memory with someone?
150. **04 Friends & Social World** — Who do you turn to when you need advice?
151. **04 Friends & Social World** — Who do you turn to when you need distraction?
152. **04 Friends & Social World** — Who knows you best?
153. **04 Friends & Social World** — Who understands your humour best?
154. **04 Friends & Social World** — What social situation makes you uncomfortable?
155. **04 Friends & Social World** — What social situation makes you excited?
156. **04 Friends & Social World** — Do you enjoy meeting new people?
157. **04 Friends & Social World** — What makes someone memorable to you?
158. **04 Friends & Social World** — What makes someone boring to you?
159. **04 Friends & Social World** — What friendship lesson did you learn the hard way?
160. **04 Friends & Social World** — What kind of friend do you want to be?
161. **05 Preferences & Everyday Favourites** — What is your favourite food?
162. **05 Preferences & Everyday Favourites** — What food could you eat repeatedly without getting bored?
163. **05 Preferences & Everyday Favourites** — What food do you absolutely dislike?
164. **05 Preferences & Everyday Favourites** — What is your favourite drink?
165. **05 Preferences & Everyday Favourites** — What is your favourite colour?
166. **05 Preferences & Everyday Favourites** — What kind of music do you love?
167. **05 Preferences & Everyday Favourites** — What song could you listen to forever?
168. **05 Preferences & Everyday Favourites** — Who are your favourite musicians?
169. **05 Preferences & Everyday Favourites** — What are your favourite movies?
170. **05 Preferences & Everyday Favourites** — What are your favourite TV shows?
171. **05 Preferences & Everyday Favourites** — What books have had an impact on you?
172. **05 Preferences & Everyday Favourites** — What video games do you love?
173. **05 Preferences & Everyday Favourites** — What is your favourite game of all time?
174. **05 Preferences & Everyday Favourites** — What kind of art do you like?
175. **05 Preferences & Everyday Favourites** — What aesthetics appeal to you?
176. **05 Preferences & Everyday Favourites** — What is your favourite season?
177. **05 Preferences & Everyday Favourites** — What weather makes you happiest?
178. **05 Preferences & Everyday Favourites** — Are you more of a morning person or night person?
179. **05 Preferences & Everyday Favourites** — What is your favourite place you've visited?
180. **05 Preferences & Everyday Favourites** — What small things make you disproportionately happy?
181. **05 Preferences & Everyday Favourites** — What is your favourite smell?
182. **05 Preferences & Everyday Favourites** — What is your favourite sound?
183. **05 Preferences & Everyday Favourites** — What texture do you enjoy?
184. **05 Preferences & Everyday Favourites** — What clothing do you feel best wearing?
185. **05 Preferences & Everyday Favourites** — What is your favourite colour combination?
186. **05 Preferences & Everyday Favourites** — What is your favourite animal?
187. **05 Preferences & Everyday Favourites** — What is your favourite plant or flower?
188. **05 Preferences & Everyday Favourites** — What is your favourite dessert?
189. **05 Preferences & Everyday Favourites** — What is your favourite snack?
190. **05 Preferences & Everyday Favourites** — What is your favourite cuisine?
191. **05 Preferences & Everyday Favourites** — What is your favourite restaurant type?
192. **05 Preferences & Everyday Favourites** — What is your favourite way to spend a lazy day?
193. **05 Preferences & Everyday Favourites** — What is your favourite way to celebrate?
194. **05 Preferences & Everyday Favourites** — What is your favourite holiday?
195. **05 Preferences & Everyday Favourites** — What is your favourite time of day?
196. **05 Preferences & Everyday Favourites** — What is your favourite kind of landscape?
197. **05 Preferences & Everyday Favourites** — What is your favourite kind of architecture?
198. **05 Preferences & Everyday Favourites** — What is your favourite fictional character?
199. **05 Preferences & Everyday Favourites** — What is your favourite quote?
200. **05 Preferences & Everyday Favourites** — What preference of yours would surprise people?
201. **06 Hobbies & Interests** — What do you enjoy doing in your free time?
202. **06 Hobbies & Interests** — What hobby could you spend hours doing?
203. **06 Hobbies & Interests** — What is something you would love to learn?
204. **06 Hobbies & Interests** — What subjects could you talk about for hours?
205. **06 Hobbies & Interests** — What are you currently obsessed with?
206. **06 Hobbies & Interests** — What niche topic do you know surprisingly much about?
207. **06 Hobbies & Interests** — What hobby have you always wanted to try?
208. **06 Hobbies & Interests** — What creative activities do you enjoy?
209. **06 Hobbies & Interests** — Do you enjoy making things?
210. **06 Hobbies & Interests** — What have you created that you're proud of?
211. **06 Hobbies & Interests** — What activities make you lose track of time?
212. **06 Hobbies & Interests** — What do you enjoy learning about just for fun?
213. **06 Hobbies & Interests** — What hobby would you pursue if money and time didn't matter?
214. **06 Hobbies & Interests** — What recently interested you?
215. **06 Hobbies & Interests** — Has an interest ever changed your life?
216. **06 Hobbies & Interests** — What hobby did you have when you were younger?
217. **06 Hobbies & Interests** — What hobby did you abandon and miss?
218. **06 Hobbies & Interests** — What hobby would you like to return to?
219. **06 Hobbies & Interests** — What hobby would you never understand the appeal of?
220. **06 Hobbies & Interests** — What do you like collecting?
221. **06 Hobbies & Interests** — What do you like researching?
222. **06 Hobbies & Interests** — What rabbit holes do you fall into online?
223. **06 Hobbies & Interests** — What kind of documentaries interest you?
224. **06 Hobbies & Interests** — What kind of podcasts interest you?
225. **06 Hobbies & Interests** — What kind of communities do you enjoy joining?
226. **06 Hobbies & Interests** — What do you like discussing with strangers?
227. **06 Hobbies & Interests** — What do you like teaching other people?
228. **06 Hobbies & Interests** — What do you enjoy learning from other people?
229. **06 Hobbies & Interests** — What project would you start for fun?
230. **06 Hobbies & Interests** — What creative medium interests you?
231. **06 Hobbies & Interests** — Do you enjoy tinkering with technology?
232. **06 Hobbies & Interests** — Do you enjoy building things?
233. **06 Hobbies & Interests** — Do you enjoy fixing things?
234. **06 Hobbies & Interests** — Do you enjoy exploring new places?
235. **06 Hobbies & Interests** — Do you enjoy competition?
236. **06 Hobbies & Interests** — Do you enjoy puzzles?
237. **06 Hobbies & Interests** — Do you enjoy performing?
238. **06 Hobbies & Interests** — Do you enjoy collecting experiences?
239. **06 Hobbies & Interests** — What interest best represents you right now?
240. **06 Hobbies & Interests** — What interest do you think the AI should know more about?
241. **07 Goals & Ambitions** — What are you currently working toward?
242. **07 Goals & Ambitions** — What is your biggest goal right now?
243. **07 Goals & Ambitions** — What do you want to accomplish this year?
244. **07 Goals & Ambitions** — Where do you want to be five years from now?
245. **07 Goals & Ambitions** — What would your ideal life look like?
246. **07 Goals & Ambitions** — What have you always wanted to accomplish?
247. **07 Goals & Ambitions** — What dream have you told very few people about?
248. **07 Goals & Ambitions** — What motivates you to keep going?
249. **07 Goals & Ambitions** — What does success mean to you?
250. **07 Goals & Ambitions** — What would make you proud of your life?
251. **07 Goals & Ambitions** — What would you attempt if failure were impossible?
252. **07 Goals & Ambitions** — What would you do if money were irrelevant?
253. **07 Goals & Ambitions** — What legacy would you like to leave?
254. **07 Goals & Ambitions** — What skill would you most like to master?
255. **07 Goals & Ambitions** — What is standing between you and a major goal?
256. **07 Goals & Ambitions** — What goal have you postponed?
257. **07 Goals & Ambitions** — What goal did you recently complete?
258. **07 Goals & Ambitions** — What goal are you most excited about?
259. **07 Goals & Ambitions** — What goal scares you?
260. **07 Goals & Ambitions** — What goal feels unrealistic but exciting?
261. **07 Goals & Ambitions** — What small goal matters this week?
262. **07 Goals & Ambitions** — What habit would move you toward your goals?
263. **07 Goals & Ambitions** — What usually derails your plans?
264. **07 Goals & Ambitions** — What helps you stay accountable?
265. **07 Goals & Ambitions** — How do you measure progress?
266. **07 Goals & Ambitions** — Do you prefer ambitious plans or flexible plans?
267. **07 Goals & Ambitions** — What does a successful day look like?
268. **07 Goals & Ambitions** — What does a successful year look like?
269. **07 Goals & Ambitions** — What would you like to build?
270. **07 Goals & Ambitions** — What would you like to create?
271. **07 Goals & Ambitions** — What would you like to learn?
272. **07 Goals & Ambitions** — What would you like to experience?
273. **07 Goals & Ambitions** — What would you like to change about your environment?
274. **07 Goals & Ambitions** — What would you like to change about your routine?
275. **07 Goals & Ambitions** — What future opportunity excites you?
276. **07 Goals & Ambitions** — What future possibility worries you?
277. **07 Goals & Ambitions** — What would you do with an extra ten hours every week?
278. **07 Goals & Ambitions** — What would you pursue with unlimited resources?
279. **07 Goals & Ambitions** — What future version of yourself are you trying to create?
280. **07 Goals & Ambitions** — What goal should the AI remind you about?
281. **08 Work Education & Skills** — What do you currently do for work or study?
282. **08 Work Education & Skills** — What do you enjoy about it?
283. **08 Work Education & Skills** — What do you dislike about it?
284. **08 Work Education & Skills** — What kind of work feels fulfilling?
285. **08 Work Education & Skills** — What kind of work drains you?
286. **08 Work Education & Skills** — What are you particularly good at?
287. **08 Work Education & Skills** — What skills do people come to you for?
288. **08 Work Education & Skills** — What skill do you wish you were better at?
289. **08 Work Education & Skills** — What was your favourite job or project?
290. **08 Work Education & Skills** — What is the most interesting thing you've learned professionally?
291. **08 Work Education & Skills** — What are you currently trying to learn?
292. **08 Work Education & Skills** — Do you prefer working alone or with others?
293. **08 Work Education & Skills** — What environment helps you work best?
294. **08 Work Education & Skills** — What would your dream job look like?
295. **08 Work Education & Skills** — What would you do professionally if you could start over?
296. **08 Work Education & Skills** — What was your favourite school subject?
297. **08 Work Education & Skills** — What did you learn outside formal education?
298. **08 Work Education & Skills** — Who taught you an important skill?
299. **08 Work Education & Skills** — What skill did you teach yourself?
300. **08 Work Education & Skills** — What are you proudest of professionally?
301. **08 Work Education & Skills** — What professional mistake taught you the most?
302. **08 Work Education & Skills** — What kind of feedback helps you improve?
303. **08 Work Education & Skills** — What kind of feedback frustrates you?
304. **08 Work Education & Skills** — How do you approach difficult tasks?
305. **08 Work Education & Skills** — How do you organise projects?
306. **08 Work Education & Skills** — Do you prefer structure or freedom?
307. **08 Work Education & Skills** — How do you handle deadlines?
308. **08 Work Education & Skills** — What work makes you lose track of time?
309. **08 Work Education & Skills** — What work feels meaningless to you?
310. **08 Work Education & Skills** — What would make your current work better?
311. **08 Work Education & Skills** — What career path interests you?
312. **08 Work Education & Skills** — What career path would you never choose?
313. **08 Work Education & Skills** — What would you like to be known for professionally?
314. **08 Work Education & Skills** — What expertise do you want to develop?
315. **08 Work Education & Skills** — What would you teach a beginner?
316. **08 Work Education & Skills** — What would you like the AI to help you learn?
317. **08 Work Education & Skills** — What professional relationship matters most to you?
318. **08 Work Education & Skills** — What project are you most excited about?
319. **08 Work Education & Skills** — What skill is currently underused in your life?
320. **08 Work Education & Skills** — What career question are you still figuring out?
321. **09 Life Events & Memories** — What is one of the happiest memories of your life?
322. **09 Life Events & Memories** — What is one of the funniest moments you've experienced?
323. **09 Life Events & Memories** — What experience changed you the most?
324. **09 Life Events & Memories** — What event made you see the world differently?
325. **09 Life Events & Memories** — What will you never forget?
326. **09 Life Events & Memories** — What is the biggest adventure you've had?
327. **09 Life Events & Memories** — What is the most spontaneous thing you've done?
328. **09 Life Events & Memories** — What did you do that required real courage?
329. **09 Life Events & Memories** — What accomplishment are you most proud of?
330. **09 Life Events & Memories** — What mistake taught you the most?
331. **09 Life Events & Memories** — What do you wish you had done differently?
332. **09 Life Events & Memories** — What difficult thing did you overcome?
333. **09 Life Events & Memories** — What experience made you stronger?
334. **09 Life Events & Memories** — What moment would you love to relive?
335. **09 Life Events & Memories** — If you could preserve one memory forever, which would it be?
336. **09 Life Events & Memories** — What was your most unexpected life event?
337. **09 Life Events & Memories** — What was your most embarrassing funny moment?
338. **09 Life Events & Memories** — What was your most peaceful memory?
339. **09 Life Events & Memories** — What was your most exciting memory?
340. **09 Life Events & Memories** — What was your strangest experience?
341. **09 Life Events & Memories** — What trip do you remember most?
342. **09 Life Events & Memories** — What celebration do you remember most?
343. **09 Life Events & Memories** — What concert or performance do you remember most?
344. **09 Life Events & Memories** — What meal became a memorable event?
345. **09 Life Events & Memories** — What random day turned out to matter?
346. **09 Life Events & Memories** — What coincidence do you remember?
347. **09 Life Events & Memories** — What decision changed your direction?
348. **09 Life Events & Memories** — What opportunity changed your life?
349. **09 Life Events & Memories** — What person appeared at an important moment?
350. **09 Life Events & Memories** — What place is attached to a powerful memory?
351. **09 Life Events & Memories** — What object reminds you of an important event?
352. **09 Life Events & Memories** — What song is attached to a memory?
353. **09 Life Events & Memories** — What smell triggers a memory?
354. **09 Life Events & Memories** — What photograph tells an important story?
355. **09 Life Events & Memories** — What memory have you recently rediscovered?
356. **09 Life Events & Memories** — What memory do you rarely talk about?
357. **09 Life Events & Memories** — What memory do you tell often?
358. **09 Life Events & Memories** — What memory has changed meaning over time?
359. **09 Life Events & Memories** — What life chapter feels most important?
360. **09 Life Events & Memories** — What memory would you want your AI companion to understand?
361. **10 Emotional World & Coping** — What usually makes you happy?
362. **10 Emotional World & Coping** — What usually makes you angry?
363. **10 Emotional World & Coping** — What tends to stress you out?
364. **10 Emotional World & Coping** — What helps you calm down?
365. **10 Emotional World & Coping** — What makes you feel safe?
366. **10 Emotional World & Coping** — What makes you feel understood?
367. **10 Emotional World & Coping** — What makes you feel appreciated?
368. **10 Emotional World & Coping** — What makes you feel motivated?
369. **10 Emotional World & Coping** — What makes you lose motivation?
370. **10 Emotional World & Coping** — How do you handle difficult situations?
371. **10 Emotional World & Coping** — Do you keep emotions inside or express them?
372. **10 Emotional World & Coping** — What do you do on a bad day?
373. **10 Emotional World & Coping** — What encouragement works best for you?
374. **10 Emotional World & Coping** — What criticism is useful to you?
375. **10 Emotional World & Coping** — What criticism bothers you?
376. **10 Emotional World & Coping** — What makes you feel proud?
377. **10 Emotional World & Coping** — What makes you feel embarrassed?
378. **10 Emotional World & Coping** — What makes you feel excited?
379. **10 Emotional World & Coping** — What makes you feel bored?
380. **10 Emotional World & Coping** — What makes you feel restless?
381. **10 Emotional World & Coping** — What makes you feel peaceful?
382. **10 Emotional World & Coping** — What makes you feel connected?
383. **10 Emotional World & Coping** — What makes you feel lonely?
384. **10 Emotional World & Coping** — What helps you recover after a difficult experience?
385. **10 Emotional World & Coping** — Who do you talk to when overwhelmed?
386. **10 Emotional World & Coping** — What environment helps you regulate your mood?
387. **10 Emotional World & Coping** — What activities improve your mood?
388. **10 Emotional World & Coping** — What activities worsen your mood?
389. **10 Emotional World & Coping** — How do you celebrate good news?
390. **10 Emotional World & Coping** — How do you respond to disappointment?
391. **10 Emotional World & Coping** — How do you respond to uncertainty?
392. **10 Emotional World & Coping** — How do you respond when plans change?
393. **10 Emotional World & Coping** — How do you respond when someone disagrees with you?
394. **10 Emotional World & Coping** — What kind of reassurance helps?
395. **10 Emotional World & Coping** — What kind of reassurance feels unhelpful?
396. **10 Emotional World & Coping** — How do you know when you need a break?
397. **10 Emotional World & Coping** — What does emotional support look like to you?
398. **10 Emotional World & Coping** — What helps you feel grounded?
399. **10 Emotional World & Coping** — What emotional pattern have you noticed in yourself?
400. **10 Emotional World & Coping** — What should the AI understand about how you experience emotions?
401. **11 Beliefs Values & Worldview** — What makes a good life?
402. **11 Beliefs Values & Worldview** — What principle should everyone live by?
403. **11 Beliefs Values & Worldview** — What do you strongly believe?
404. **11 Beliefs Values & Worldview** — What opinion have you changed your mind about?
405. **11 Beliefs Values & Worldview** — What do you wish more people understood?
406. **11 Beliefs Values & Worldview** — What does happiness mean to you?
407. **11 Beliefs Values & Worldview** — What does freedom mean to you?
408. **11 Beliefs Values & Worldview** — What does friendship mean to you?
409. **11 Beliefs Values & Worldview** — What does love mean to you?
410. **11 Beliefs Values & Worldview** — What does success mean personally?
411. **11 Beliefs Values & Worldview** — What do people misunderstand about you?
412. **11 Beliefs Values & Worldview** — Do you expect the best or worst?
413. **11 Beliefs Values & Worldview** — What gives your life meaning?
414. **11 Beliefs Values & Worldview** — What is worth fighting for?
415. **11 Beliefs Values & Worldview** — What question about life do you think about most?
416. **11 Beliefs Values & Worldview** — What value would you never compromise?
417. **11 Beliefs Values & Worldview** — What value have you learned to appreciate?
418. **11 Beliefs Values & Worldview** — What makes something morally important to you?
419. **11 Beliefs Values & Worldview** — What does fairness mean to you?
420. **11 Beliefs Values & Worldview** — What does loyalty mean to you?
421. **11 Beliefs Values & Worldview** — What does honesty mean to you?
422. **11 Beliefs Values & Worldview** — What does kindness mean to you?
423. **11 Beliefs Values & Worldview** — What does courage mean to you?
424. **11 Beliefs Values & Worldview** — What does responsibility mean to you?
425. **11 Beliefs Values & Worldview** — What does independence mean to you?
426. **11 Beliefs Values & Worldview** — What does community mean to you?
427. **11 Beliefs Values & Worldview** — What does trust mean to you?
428. **11 Beliefs Values & Worldview** — What makes someone admirable?
429. **11 Beliefs Values & Worldview** — What makes someone respectable?
430. **11 Beliefs Values & Worldview** — What makes someone trustworthy?
431. **11 Beliefs Values & Worldview** — What belief from childhood stayed with you?
432. **11 Beliefs Values & Worldview** — What belief from childhood did you reject?
433. **11 Beliefs Values & Worldview** — What worldview has influenced you most?
434. **11 Beliefs Values & Worldview** — What idea changed how you see the world?
435. **11 Beliefs Values & Worldview** — What philosophical question fascinates you?
436. **11 Beliefs Values & Worldview** — What contradiction do you notice in your own beliefs?
437. **11 Beliefs Values & Worldview** — What value do you wish you practiced more?
438. **11 Beliefs Values & Worldview** — What value do you think society underestimates?
439. **11 Beliefs Values & Worldview** — What would you want future generations to believe?
440. **11 Beliefs Values & Worldview** — What part of your worldview should the AI never assume?
441. **12 Future Imagination & Possibilities** — If you could live anywhere, where would you live?
442. **12 Future Imagination & Possibilities** — If you could instantly master one skill, what would it be?
443. **12 Future Imagination & Possibilities** — If you could meet anyone from history, who would you meet?
444. **12 Future Imagination & Possibilities** — If you could experience one fictional world, which would you choose?
445. **12 Future Imagination & Possibilities** — If you could redesign your life completely, what would you change?
446. **12 Future Imagination & Possibilities** — What would your perfect day look like?
447. **12 Future Imagination & Possibilities** — What would your perfect weekend look like?
448. **12 Future Imagination & Possibilities** — What would your dream home be like?
449. **12 Future Imagination & Possibilities** — Who would surround you in your ideal life?
450. **12 Future Imagination & Possibilities** — What would you do with unlimited free time?
451. **12 Future Imagination & Possibilities** — What adventure would you love to take?
452. **12 Future Imagination & Possibilities** — What would your ideal future self be like?
453. **12 Future Imagination & Possibilities** — What should never change about you?
454. **12 Future Imagination & Possibilities** — What should change dramatically?
455. **12 Future Imagination & Possibilities** — What do you hope people remember about you?
456. **12 Future Imagination & Possibilities** — What would you tell your younger self?
457. **12 Future Imagination & Possibilities** — What will your future self thank you for?
458. **12 Future Imagination & Possibilities** — What extraordinary thing would you add to everyday life?
459. **12 Future Imagination & Possibilities** — What question do you wish someone would ask you?
460. **12 Future Imagination & Possibilities** — What do you think the AI still doesn't understand about you?
461. **12 Future Imagination & Possibilities** — Where would you travel if time were unlimited?
462. **12 Future Imagination & Possibilities** — What world would you build from scratch?
463. **12 Future Imagination & Possibilities** — What would your ideal community look like?
464. **12 Future Imagination & Possibilities** — What would your ideal workspace look like?
465. **12 Future Imagination & Possibilities** — What would your ideal morning look like?
466. **12 Future Imagination & Possibilities** — What would your ideal evening look like?
467. **12 Future Imagination & Possibilities** — What would your ideal year contain?
468. **12 Future Imagination & Possibilities** — What experience would you give everyone at least once?
469. **12 Future Imagination & Possibilities** — What technology would you invent?
470. **12 Future Imagination & Possibilities** — What problem would you solve?
471. **12 Future Imagination & Possibilities** — What would you learn from an alternate version of yourself?
472. **12 Future Imagination & Possibilities** — What would you change about the future if you could?
473. **12 Future Imagination & Possibilities** — What would you preserve from the past?
474. **12 Future Imagination & Possibilities** — What future tradition would you create?
475. **12 Future Imagination & Possibilities** — What would you explore if you could go anywhere?
476. **12 Future Imagination & Possibilities** — What would you create if you had a lifetime to do it?
477. **12 Future Imagination & Possibilities** — What impossible project would you attempt?
478. **12 Future Imagination & Possibilities** — What would make the future feel exciting?
479. **12 Future Imagination & Possibilities** — What future possibility feels most like you?
480. **12 Future Imagination & Possibilities** — What question should Mind Mapper ask you one year from now?
481. **13 Relationships & People Mapping** — Who is a person you think about often?
482. **13 Relationships & People Mapping** — What role does this person play in your life?
483. **13 Relationships & People Mapping** — What memory connects you to this person?
484. **13 Relationships & People Mapping** — What do you admire about this person?
485. **13 Relationships & People Mapping** — What have you learned from this person?
486. **13 Relationships & People Mapping** — How did you meet this person?
487. **13 Relationships & People Mapping** — What places are associated with this person?
488. **13 Relationships & People Mapping** — What interests do you share with this person?
489. **13 Relationships & People Mapping** — What project or experience connects you?
490. **13 Relationships & People Mapping** — How has this relationship changed?
491. **13-43 Graph Discovery** — What is an important people in your life?
492. **13-43 Graph Discovery** — Which people is most strongly connected to your identity?
493. **13-43 Graph Discovery** — What people brings back a strong memory?
494. **13-43 Graph Discovery** — What people would you like the AI to remember?
495. **13-43 Graph Discovery** — What people has changed significantly over time?
496. **13-43 Graph Discovery** — What people currently occupies your attention?
497. **13-43 Graph Discovery** — What people are you most proud of?
498. **13-43 Graph Discovery** — What people would you like to experience again?
499. **13-43 Graph Discovery** — What people would you recommend to someone like you?
500. **13-43 Graph Discovery** — What people has influenced another part of your life?
501. **13-43 Graph Discovery** — What people is connected to one of your closest relationships?
502. **13-43 Graph Discovery** — What people is connected to one of your major goals?
503. **13-43 Graph Discovery** — What people is connected to your happiest memory?
504. **13-43 Graph Discovery** — What people is connected to a difficult period?
505. **13-43 Graph Discovery** — What people represents something important about you?
506. **13-43 Graph Discovery** — What people do you want to explore further?
507. **13-43 Graph Discovery** — What people would you remove from your life if you could?
508. **13-43 Graph Discovery** — What people do you think the AI currently knows too little about?
509. **13-43 Graph Discovery** — What people should the AI never confuse with something else?
510. **13-43 Graph Discovery** — What people has an unexpected connection to another part of your life?
511. **13-43 Graph Discovery** — What is an important places in your life?
512. **13-43 Graph Discovery** — Which places is most strongly connected to your identity?
513. **13-43 Graph Discovery** — What places brings back a strong memory?
514. **13-43 Graph Discovery** — What places would you like the AI to remember?
515. **13-43 Graph Discovery** — What places has changed significantly over time?
516. **13-43 Graph Discovery** — What places currently occupies your attention?
517. **13-43 Graph Discovery** — What places are you most proud of?
518. **13-43 Graph Discovery** — What places would you like to experience again?
519. **13-43 Graph Discovery** — What places would you recommend to someone like you?
520. **13-43 Graph Discovery** — What places has influenced another part of your life?
521. **13-43 Graph Discovery** — What places is connected to one of your closest relationships?
522. **13-43 Graph Discovery** — What places is connected to one of your major goals?
523. **13-43 Graph Discovery** — What places is connected to your happiest memory?
524. **13-43 Graph Discovery** — What places is connected to a difficult period?
525. **13-43 Graph Discovery** — What places represents something important about you?
526. **13-43 Graph Discovery** — What places do you want to explore further?
527. **13-43 Graph Discovery** — What places would you remove from your life if you could?
528. **13-43 Graph Discovery** — What places do you think the AI currently knows too little about?
529. **13-43 Graph Discovery** — What places should the AI never confuse with something else?
530. **13-43 Graph Discovery** — What places has an unexpected connection to another part of your life?
531. **13-43 Graph Discovery** — What is an important projects in your life?
532. **13-43 Graph Discovery** — Which projects is most strongly connected to your identity?
533. **13-43 Graph Discovery** — What projects brings back a strong memory?
534. **13-43 Graph Discovery** — What projects would you like the AI to remember?
535. **13-43 Graph Discovery** — What projects has changed significantly over time?
536. **13-43 Graph Discovery** — What projects currently occupies your attention?
537. **13-43 Graph Discovery** — What projects are you most proud of?
538. **13-43 Graph Discovery** — What projects would you like to experience again?
539. **13-43 Graph Discovery** — What projects would you recommend to someone like you?
540. **13-43 Graph Discovery** — What projects has influenced another part of your life?
541. **13-43 Graph Discovery** — What projects is connected to one of your closest relationships?
542. **13-43 Graph Discovery** — What projects is connected to one of your major goals?
543. **13-43 Graph Discovery** — What projects is connected to your happiest memory?
544. **13-43 Graph Discovery** — What projects is connected to a difficult period?
545. **13-43 Graph Discovery** — What projects represents something important about you?
546. **13-43 Graph Discovery** — What projects do you want to explore further?
547. **13-43 Graph Discovery** — What projects would you remove from your life if you could?
548. **13-43 Graph Discovery** — What projects do you think the AI currently knows too little about?
549. **13-43 Graph Discovery** — What projects should the AI never confuse with something else?
550. **13-43 Graph Discovery** — What projects has an unexpected connection to another part of your life?
551. **13-43 Graph Discovery** — What is an important memories in your life?
552. **13-43 Graph Discovery** — Which memories is most strongly connected to your identity?
553. **13-43 Graph Discovery** — What memories brings back a strong memory?
554. **13-43 Graph Discovery** — What memories would you like the AI to remember?
555. **13-43 Graph Discovery** — What memories has changed significantly over time?
556. **13-43 Graph Discovery** — What memories currently occupies your attention?
557. **13-43 Graph Discovery** — What memories are you most proud of?
558. **13-43 Graph Discovery** — What memories would you like to experience again?
559. **13-43 Graph Discovery** — What memories would you recommend to someone like you?
560. **13-43 Graph Discovery** — What memories has influenced another part of your life?
561. **13-43 Graph Discovery** — What memories is connected to one of your closest relationships?
562. **13-43 Graph Discovery** — What memories is connected to one of your major goals?
563. **13-43 Graph Discovery** — What memories is connected to your happiest memory?
564. **13-43 Graph Discovery** — What memories is connected to a difficult period?
565. **13-43 Graph Discovery** — What memories represents something important about you?
566. **13-43 Graph Discovery** — What memories do you want to explore further?
567. **13-43 Graph Discovery** — What memories would you remove from your life if you could?
568. **13-43 Graph Discovery** — What memories do you think the AI currently knows too little about?
569. **13-43 Graph Discovery** — What memories should the AI never confuse with something else?
570. **13-43 Graph Discovery** — What memories has an unexpected connection to another part of your life?
571. **13-43 Graph Discovery** — What is an important interests in your life?
572. **13-43 Graph Discovery** — Which interests is most strongly connected to your identity?
573. **13-43 Graph Discovery** — What interests brings back a strong memory?
574. **13-43 Graph Discovery** — What interests would you like the AI to remember?
575. **13-43 Graph Discovery** — What interests has changed significantly over time?
576. **13-43 Graph Discovery** — What interests currently occupies your attention?
577. **13-43 Graph Discovery** — What interests are you most proud of?
578. **13-43 Graph Discovery** — What interests would you like to experience again?
579. **13-43 Graph Discovery** — What interests would you recommend to someone like you?
580. **13-43 Graph Discovery** — What interests has influenced another part of your life?
581. **13-43 Graph Discovery** — What interests is connected to one of your closest relationships?
582. **13-43 Graph Discovery** — What interests is connected to one of your major goals?
583. **13-43 Graph Discovery** — What interests is connected to your happiest memory?
584. **13-43 Graph Discovery** — What interests is connected to a difficult period?
585. **13-43 Graph Discovery** — What interests represents something important about you?
586. **13-43 Graph Discovery** — What interests do you want to explore further?
587. **13-43 Graph Discovery** — What interests would you remove from your life if you could?
588. **13-43 Graph Discovery** — What interests do you think the AI currently knows too little about?
589. **13-43 Graph Discovery** — What interests should the AI never confuse with something else?
590. **13-43 Graph Discovery** — What interests has an unexpected connection to another part of your life?
591. **13-43 Graph Discovery** — What is an important goals in your life?
592. **13-43 Graph Discovery** — Which goals is most strongly connected to your identity?
593. **13-43 Graph Discovery** — What goals brings back a strong memory?
594. **13-43 Graph Discovery** — What goals would you like the AI to remember?
595. **13-43 Graph Discovery** — What goals has changed significantly over time?
596. **13-43 Graph Discovery** — What goals currently occupies your attention?
597. **13-43 Graph Discovery** — What goals are you most proud of?
598. **13-43 Graph Discovery** — What goals would you like to experience again?
599. **13-43 Graph Discovery** — What goals would you recommend to someone like you?
600. **13-43 Graph Discovery** — What goals has influenced another part of your life?
601. **13-43 Graph Discovery** — What goals is connected to one of your closest relationships?
602. **13-43 Graph Discovery** — What goals is connected to one of your major goals?
603. **13-43 Graph Discovery** — What goals is connected to your happiest memory?
604. **13-43 Graph Discovery** — What goals is connected to a difficult period?
605. **13-43 Graph Discovery** — What goals represents something important about you?
606. **13-43 Graph Discovery** — What goals do you want to explore further?
607. **13-43 Graph Discovery** — What goals would you remove from your life if you could?
608. **13-43 Graph Discovery** — What goals do you think the AI currently knows too little about?
609. **13-43 Graph Discovery** — What goals should the AI never confuse with something else?
610. **13-43 Graph Discovery** — What goals has an unexpected connection to another part of your life?
611. **13-43 Graph Discovery** — What is an important preferences in your life?
612. **13-43 Graph Discovery** — Which preferences is most strongly connected to your identity?
613. **13-43 Graph Discovery** — What preferences brings back a strong memory?
614. **13-43 Graph Discovery** — What preferences would you like the AI to remember?
615. **13-43 Graph Discovery** — What preferences has changed significantly over time?
616. **13-43 Graph Discovery** — What preferences currently occupies your attention?
617. **13-43 Graph Discovery** — What preferences are you most proud of?
618. **13-43 Graph Discovery** — What preferences would you like to experience again?
619. **13-43 Graph Discovery** — What preferences would you recommend to someone like you?
620. **13-43 Graph Discovery** — What preferences has influenced another part of your life?
621. **13-43 Graph Discovery** — What preferences is connected to one of your closest relationships?
622. **13-43 Graph Discovery** — What preferences is connected to one of your major goals?
623. **13-43 Graph Discovery** — What preferences is connected to your happiest memory?
624. **13-43 Graph Discovery** — What preferences is connected to a difficult period?
625. **13-43 Graph Discovery** — What preferences represents something important about you?
626. **13-43 Graph Discovery** — What preferences do you want to explore further?
627. **13-43 Graph Discovery** — What preferences would you remove from your life if you could?
628. **13-43 Graph Discovery** — What preferences do you think the AI currently knows too little about?
629. **13-43 Graph Discovery** — What preferences should the AI never confuse with something else?
630. **13-43 Graph Discovery** — What preferences has an unexpected connection to another part of your life?
631. **13-43 Graph Discovery** — What is an important skills in your life?
632. **13-43 Graph Discovery** — Which skills is most strongly connected to your identity?
633. **13-43 Graph Discovery** — What skills brings back a strong memory?
634. **13-43 Graph Discovery** — What skills would you like the AI to remember?
635. **13-43 Graph Discovery** — What skills has changed significantly over time?
636. **13-43 Graph Discovery** — What skills currently occupies your attention?
637. **13-43 Graph Discovery** — What skills are you most proud of?
638. **13-43 Graph Discovery** — What skills would you like to experience again?
639. **13-43 Graph Discovery** — What skills would you recommend to someone like you?
640. **13-43 Graph Discovery** — What skills has influenced another part of your life?
641. **13-43 Graph Discovery** — What skills is connected to one of your closest relationships?
642. **13-43 Graph Discovery** — What skills is connected to one of your major goals?
643. **13-43 Graph Discovery** — What skills is connected to your happiest memory?
644. **13-43 Graph Discovery** — What skills is connected to a difficult period?
645. **13-43 Graph Discovery** — What skills represents something important about you?
646. **13-43 Graph Discovery** — What skills do you want to explore further?
647. **13-43 Graph Discovery** — What skills would you remove from your life if you could?
648. **13-43 Graph Discovery** — What skills do you think the AI currently knows too little about?
649. **13-43 Graph Discovery** — What skills should the AI never confuse with something else?
650. **13-43 Graph Discovery** — What skills has an unexpected connection to another part of your life?
651. **13-43 Graph Discovery** — What is an important media in your life?
652. **13-43 Graph Discovery** — Which media is most strongly connected to your identity?
653. **13-43 Graph Discovery** — What media brings back a strong memory?
654. **13-43 Graph Discovery** — What media would you like the AI to remember?
655. **13-43 Graph Discovery** — What media has changed significantly over time?
656. **13-43 Graph Discovery** — What media currently occupies your attention?
657. **13-43 Graph Discovery** — What media are you most proud of?
658. **13-43 Graph Discovery** — What media would you like to experience again?
659. **13-43 Graph Discovery** — What media would you recommend to someone like you?
660. **13-43 Graph Discovery** — What media has influenced another part of your life?
661. **13-43 Graph Discovery** — What media is connected to one of your closest relationships?
662. **13-43 Graph Discovery** — What media is connected to one of your major goals?
663. **13-43 Graph Discovery** — What media is connected to your happiest memory?
664. **13-43 Graph Discovery** — What media is connected to a difficult period?
665. **13-43 Graph Discovery** — What media represents something important about you?
666. **13-43 Graph Discovery** — What media do you want to explore further?
667. **13-43 Graph Discovery** — What media would you remove from your life if you could?
668. **13-43 Graph Discovery** — What media do you think the AI currently knows too little about?
669. **13-43 Graph Discovery** — What media should the AI never confuse with something else?
670. **13-43 Graph Discovery** — What media has an unexpected connection to another part of your life?
671. **13-43 Graph Discovery** — What is an important routines in your life?
672. **13-43 Graph Discovery** — Which routines is most strongly connected to your identity?
673. **13-43 Graph Discovery** — What routines brings back a strong memory?
674. **13-43 Graph Discovery** — What routines would you like the AI to remember?
675. **13-43 Graph Discovery** — What routines has changed significantly over time?
676. **13-43 Graph Discovery** — What routines currently occupies your attention?
677. **13-43 Graph Discovery** — What routines are you most proud of?
678. **13-43 Graph Discovery** — What routines would you like to experience again?
679. **13-43 Graph Discovery** — What routines would you recommend to someone like you?
680. **13-43 Graph Discovery** — What routines has influenced another part of your life?
681. **13-43 Graph Discovery** — What routines is connected to one of your closest relationships?
682. **13-43 Graph Discovery** — What routines is connected to one of your major goals?
683. **13-43 Graph Discovery** — What routines is connected to your happiest memory?
684. **13-43 Graph Discovery** — What routines is connected to a difficult period?
685. **13-43 Graph Discovery** — What routines represents something important about you?
686. **13-43 Graph Discovery** — What routines do you want to explore further?
687. **13-43 Graph Discovery** — What routines would you remove from your life if you could?
688. **13-43 Graph Discovery** — What routines do you think the AI currently knows too little about?
689. **13-43 Graph Discovery** — What routines should the AI never confuse with something else?
690. **13-43 Graph Discovery** — What routines has an unexpected connection to another part of your life?
691. **13-43 Graph Discovery** — What is an important habits in your life?
692. **13-43 Graph Discovery** — Which habits is most strongly connected to your identity?
693. **13-43 Graph Discovery** — What habits brings back a strong memory?
694. **13-43 Graph Discovery** — What habits would you like the AI to remember?
695. **13-43 Graph Discovery** — What habits has changed significantly over time?
696. **13-43 Graph Discovery** — What habits currently occupies your attention?
697. **13-43 Graph Discovery** — What habits are you most proud of?
698. **13-43 Graph Discovery** — What habits would you like to experience again?
699. **13-43 Graph Discovery** — What habits would you recommend to someone like you?
700. **13-43 Graph Discovery** — What habits has influenced another part of your life?
701. **13-43 Graph Discovery** — What habits is connected to one of your closest relationships?
702. **13-43 Graph Discovery** — What habits is connected to one of your major goals?
703. **13-43 Graph Discovery** — What habits is connected to your happiest memory?
704. **13-43 Graph Discovery** — What habits is connected to a difficult period?
705. **13-43 Graph Discovery** — What habits represents something important about you?
706. **13-43 Graph Discovery** — What habits do you want to explore further?
707. **13-43 Graph Discovery** — What habits would you remove from your life if you could?
708. **13-43 Graph Discovery** — What habits do you think the AI currently knows too little about?
709. **13-43 Graph Discovery** — What habits should the AI never confuse with something else?
710. **13-43 Graph Discovery** — What habits has an unexpected connection to another part of your life?
711. **13-43 Graph Discovery** — What is an important objects in your life?
712. **13-43 Graph Discovery** — Which objects is most strongly connected to your identity?
713. **13-43 Graph Discovery** — What objects brings back a strong memory?
714. **13-43 Graph Discovery** — What objects would you like the AI to remember?
715. **13-43 Graph Discovery** — What objects has changed significantly over time?
716. **13-43 Graph Discovery** — What objects currently occupies your attention?
717. **13-43 Graph Discovery** — What objects are you most proud of?
718. **13-43 Graph Discovery** — What objects would you like to experience again?
719. **13-43 Graph Discovery** — What objects would you recommend to someone like you?
720. **13-43 Graph Discovery** — What objects has influenced another part of your life?
721. **13-43 Graph Discovery** — What objects is connected to one of your closest relationships?
722. **13-43 Graph Discovery** — What objects is connected to one of your major goals?
723. **13-43 Graph Discovery** — What objects is connected to your happiest memory?
724. **13-43 Graph Discovery** — What objects is connected to a difficult period?
725. **13-43 Graph Discovery** — What objects represents something important about you?
726. **13-43 Graph Discovery** — What objects do you want to explore further?
727. **13-43 Graph Discovery** — What objects would you remove from your life if you could?
728. **13-43 Graph Discovery** — What objects do you think the AI currently knows too little about?
729. **13-43 Graph Discovery** — What objects should the AI never confuse with something else?
730. **13-43 Graph Discovery** — What objects has an unexpected connection to another part of your life?
731. **13-43 Graph Discovery** — What is an important events in your life?
732. **13-43 Graph Discovery** — Which events is most strongly connected to your identity?
733. **13-43 Graph Discovery** — What events brings back a strong memory?
734. **13-43 Graph Discovery** — What events would you like the AI to remember?
735. **13-43 Graph Discovery** — What events has changed significantly over time?
736. **13-43 Graph Discovery** — What events currently occupies your attention?
737. **13-43 Graph Discovery** — What events are you most proud of?
738. **13-43 Graph Discovery** — What events would you like to experience again?
739. **13-43 Graph Discovery** — What events would you recommend to someone like you?
740. **13-43 Graph Discovery** — What events has influenced another part of your life?
741. **13-43 Graph Discovery** — What events is connected to one of your closest relationships?
742. **13-43 Graph Discovery** — What events is connected to one of your major goals?
743. **13-43 Graph Discovery** — What events is connected to your happiest memory?
744. **13-43 Graph Discovery** — What events is connected to a difficult period?
745. **13-43 Graph Discovery** — What events represents something important about you?
746. **13-43 Graph Discovery** — What events do you want to explore further?
747. **13-43 Graph Discovery** — What events would you remove from your life if you could?
748. **13-43 Graph Discovery** — What events do you think the AI currently knows too little about?
749. **13-43 Graph Discovery** — What events should the AI never confuse with something else?
750. **13-43 Graph Discovery** — What events has an unexpected connection to another part of your life?
751. **13-43 Graph Discovery** — What is an important ideas in your life?
752. **13-43 Graph Discovery** — Which ideas is most strongly connected to your identity?
753. **13-43 Graph Discovery** — What ideas brings back a strong memory?
754. **13-43 Graph Discovery** — What ideas would you like the AI to remember?
755. **13-43 Graph Discovery** — What ideas has changed significantly over time?
756. **13-43 Graph Discovery** — What ideas currently occupies your attention?
757. **13-43 Graph Discovery** — What ideas are you most proud of?
758. **13-43 Graph Discovery** — What ideas would you like to experience again?
759. **13-43 Graph Discovery** — What ideas would you recommend to someone like you?
760. **13-43 Graph Discovery** — What ideas has influenced another part of your life?
761. **13-43 Graph Discovery** — What ideas is connected to one of your closest relationships?
762. **13-43 Graph Discovery** — What ideas is connected to one of your major goals?
763. **13-43 Graph Discovery** — What ideas is connected to your happiest memory?
764. **13-43 Graph Discovery** — What ideas is connected to a difficult period?
765. **13-43 Graph Discovery** — What ideas represents something important about you?
766. **13-43 Graph Discovery** — What ideas do you want to explore further?
767. **13-43 Graph Discovery** — What ideas would you remove from your life if you could?
768. **13-43 Graph Discovery** — What ideas do you think the AI currently knows too little about?
769. **13-43 Graph Discovery** — What ideas should the AI never confuse with something else?
770. **13-43 Graph Discovery** — What ideas has an unexpected connection to another part of your life?
771. **13-43 Graph Discovery** — What is an important achievements in your life?
772. **13-43 Graph Discovery** — Which achievements is most strongly connected to your identity?
773. **13-43 Graph Discovery** — What achievements brings back a strong memory?
774. **13-43 Graph Discovery** — What achievements would you like the AI to remember?
775. **13-43 Graph Discovery** — What achievements has changed significantly over time?
776. **13-43 Graph Discovery** — What achievements currently occupies your attention?
777. **13-43 Graph Discovery** — What achievements are you most proud of?
778. **13-43 Graph Discovery** — What achievements would you like to experience again?
779. **13-43 Graph Discovery** — What achievements would you recommend to someone like you?
780. **13-43 Graph Discovery** — What achievements has influenced another part of your life?
781. **13-43 Graph Discovery** — What achievements is connected to one of your closest relationships?
782. **13-43 Graph Discovery** — What achievements is connected to one of your major goals?
783. **13-43 Graph Discovery** — What achievements is connected to your happiest memory?
784. **13-43 Graph Discovery** — What achievements is connected to a difficult period?
785. **13-43 Graph Discovery** — What achievements represents something important about you?
786. **13-43 Graph Discovery** — What achievements do you want to explore further?
787. **13-43 Graph Discovery** — What achievements would you remove from your life if you could?
788. **13-43 Graph Discovery** — What achievements do you think the AI currently knows too little about?
789. **13-43 Graph Discovery** — What achievements should the AI never confuse with something else?
790. **13-43 Graph Discovery** — What achievements has an unexpected connection to another part of your life?
791. **13-43 Graph Discovery** — What is an important challenges in your life?
792. **13-43 Graph Discovery** — Which challenges is most strongly connected to your identity?
793. **13-43 Graph Discovery** — What challenges brings back a strong memory?
794. **13-43 Graph Discovery** — What challenges would you like the AI to remember?
795. **13-43 Graph Discovery** — What challenges has changed significantly over time?
796. **13-43 Graph Discovery** — What challenges currently occupies your attention?
797. **13-43 Graph Discovery** — What challenges are you most proud of?
798. **13-43 Graph Discovery** — What challenges would you like to experience again?
799. **13-43 Graph Discovery** — What challenges would you recommend to someone like you?
800. **13-43 Graph Discovery** — What challenges has influenced another part of your life?
801. **13-43 Graph Discovery** — What challenges is connected to one of your closest relationships?
802. **13-43 Graph Discovery** — What challenges is connected to one of your major goals?
803. **13-43 Graph Discovery** — What challenges is connected to your happiest memory?
804. **13-43 Graph Discovery** — What challenges is connected to a difficult period?
805. **13-43 Graph Discovery** — What challenges represents something important about you?
806. **13-43 Graph Discovery** — What challenges do you want to explore further?
807. **13-43 Graph Discovery** — What challenges would you remove from your life if you could?
808. **13-43 Graph Discovery** — What challenges do you think the AI currently knows too little about?
809. **13-43 Graph Discovery** — What challenges should the AI never confuse with something else?
810. **13-43 Graph Discovery** — What challenges has an unexpected connection to another part of your life?
811. **13-43 Graph Discovery** — What is an important communities in your life?
812. **13-43 Graph Discovery** — Which communities is most strongly connected to your identity?
813. **13-43 Graph Discovery** — What communities brings back a strong memory?
814. **13-43 Graph Discovery** — What communities would you like the AI to remember?
815. **13-43 Graph Discovery** — What communities has changed significantly over time?
816. **13-43 Graph Discovery** — What communities currently occupies your attention?
817. **13-43 Graph Discovery** — What communities are you most proud of?
818. **13-43 Graph Discovery** — What communities would you like to experience again?
819. **13-43 Graph Discovery** — What communities would you recommend to someone like you?
820. **13-43 Graph Discovery** — What communities has influenced another part of your life?
821. **13-43 Graph Discovery** — What communities is connected to one of your closest relationships?
822. **13-43 Graph Discovery** — What communities is connected to one of your major goals?
823. **13-43 Graph Discovery** — What communities is connected to your happiest memory?
824. **13-43 Graph Discovery** — What communities is connected to a difficult period?
825. **13-43 Graph Discovery** — What communities represents something important about you?
826. **13-43 Graph Discovery** — What communities do you want to explore further?
827. **13-43 Graph Discovery** — What communities would you remove from your life if you could?
828. **13-43 Graph Discovery** — What communities do you think the AI currently knows too little about?
829. **13-43 Graph Discovery** — What communities should the AI never confuse with something else?
830. **13-43 Graph Discovery** — What communities has an unexpected connection to another part of your life?
831. **13-43 Graph Discovery** — What is an important creative works in your life?
832. **13-43 Graph Discovery** — Which creative works is most strongly connected to your identity?
833. **13-43 Graph Discovery** — What creative works brings back a strong memory?
834. **13-43 Graph Discovery** — What creative works would you like the AI to remember?
835. **13-43 Graph Discovery** — What creative works has changed significantly over time?
836. **13-43 Graph Discovery** — What creative works currently occupies your attention?
837. **13-43 Graph Discovery** — What creative works are you most proud of?
838. **13-43 Graph Discovery** — What creative works would you like to experience again?
839. **13-43 Graph Discovery** — What creative works would you recommend to someone like you?
840. **13-43 Graph Discovery** — What creative works has influenced another part of your life?
841. **13-43 Graph Discovery** — What creative works is connected to one of your closest relationships?
842. **13-43 Graph Discovery** — What creative works is connected to one of your major goals?
843. **13-43 Graph Discovery** — What creative works is connected to your happiest memory?
844. **13-43 Graph Discovery** — What creative works is connected to a difficult period?
845. **13-43 Graph Discovery** — What creative works represents something important about you?
846. **13-43 Graph Discovery** — What creative works do you want to explore further?
847. **13-43 Graph Discovery** — What creative works would you remove from your life if you could?
848. **13-43 Graph Discovery** — What creative works do you think the AI currently knows too little about?
849. **13-43 Graph Discovery** — What creative works should the AI never confuse with something else?
850. **13-43 Graph Discovery** — What creative works has an unexpected connection to another part of your life?
851. **13-43 Graph Discovery** — What is an important travel in your life?
852. **13-43 Graph Discovery** — Which travel is most strongly connected to your identity?
853. **13-43 Graph Discovery** — What travel brings back a strong memory?
854. **13-43 Graph Discovery** — What travel would you like the AI to remember?
855. **13-43 Graph Discovery** — What travel has changed significantly over time?
856. **13-43 Graph Discovery** — What travel currently occupies your attention?
857. **13-43 Graph Discovery** — What travel are you most proud of?
858. **13-43 Graph Discovery** — What travel would you like to experience again?
859. **13-43 Graph Discovery** — What travel would you recommend to someone like you?
860. **13-43 Graph Discovery** — What travel has influenced another part of your life?
861. **13-43 Graph Discovery** — What travel is connected to one of your closest relationships?
862. **13-43 Graph Discovery** — What travel is connected to one of your major goals?
863. **13-43 Graph Discovery** — What travel is connected to your happiest memory?
864. **13-43 Graph Discovery** — What travel is connected to a difficult period?
865. **13-43 Graph Discovery** — What travel represents something important about you?
866. **13-43 Graph Discovery** — What travel do you want to explore further?
867. **13-43 Graph Discovery** — What travel would you remove from your life if you could?
868. **13-43 Graph Discovery** — What travel do you think the AI currently knows too little about?
869. **13-43 Graph Discovery** — What travel should the AI never confuse with something else?
870. **13-43 Graph Discovery** — What travel has an unexpected connection to another part of your life?
871. **13-43 Graph Discovery** — What is an important learning in your life?
872. **13-43 Graph Discovery** — Which learning is most strongly connected to your identity?
873. **13-43 Graph Discovery** — What learning brings back a strong memory?
874. **13-43 Graph Discovery** — What learning would you like the AI to remember?
875. **13-43 Graph Discovery** — What learning has changed significantly over time?
876. **13-43 Graph Discovery** — What learning currently occupies your attention?
877. **13-43 Graph Discovery** — What learning are you most proud of?
878. **13-43 Graph Discovery** — What learning would you like to experience again?
879. **13-43 Graph Discovery** — What learning would you recommend to someone like you?
880. **13-43 Graph Discovery** — What learning has influenced another part of your life?
881. **13-43 Graph Discovery** — What learning is connected to one of your closest relationships?
882. **13-43 Graph Discovery** — What learning is connected to one of your major goals?
883. **13-43 Graph Discovery** — What learning is connected to your happiest memory?
884. **13-43 Graph Discovery** — What learning is connected to a difficult period?
885. **13-43 Graph Discovery** — What learning represents something important about you?
886. **13-43 Graph Discovery** — What learning do you want to explore further?
887. **13-43 Graph Discovery** — What learning would you remove from your life if you could?
888. **13-43 Graph Discovery** — What learning do you think the AI currently knows too little about?
889. **13-43 Graph Discovery** — What learning should the AI never confuse with something else?
890. **13-43 Graph Discovery** — What learning has an unexpected connection to another part of your life?
891. **13-43 Graph Discovery** — What is an important work in your life?
892. **13-43 Graph Discovery** — Which work is most strongly connected to your identity?
893. **13-43 Graph Discovery** — What work brings back a strong memory?
894. **13-43 Graph Discovery** — What work would you like the AI to remember?
895. **13-43 Graph Discovery** — What work has changed significantly over time?
896. **13-43 Graph Discovery** — What work currently occupies your attention?
897. **13-43 Graph Discovery** — What work are you most proud of?
898. **13-43 Graph Discovery** — What work would you like to experience again?
899. **13-43 Graph Discovery** — What work would you recommend to someone like you?
900. **13-43 Graph Discovery** — What work has influenced another part of your life?
901. **13-43 Graph Discovery** — What work is connected to one of your closest relationships?
902. **13-43 Graph Discovery** — What work is connected to one of your major goals?
903. **13-43 Graph Discovery** — What work is connected to your happiest memory?
904. **13-43 Graph Discovery** — What work is connected to a difficult period?
905. **13-43 Graph Discovery** — What work represents something important about you?
906. **13-43 Graph Discovery** — What work do you want to explore further?
907. **13-43 Graph Discovery** — What work would you remove from your life if you could?
908. **13-43 Graph Discovery** — What work do you think the AI currently knows too little about?
909. **13-43 Graph Discovery** — What work should the AI never confuse with something else?
910. **13-43 Graph Discovery** — What work has an unexpected connection to another part of your life?
911. **13-43 Graph Discovery** — What is an important technology in your life?
912. **13-43 Graph Discovery** — Which technology is most strongly connected to your identity?
913. **13-43 Graph Discovery** — What technology brings back a strong memory?
914. **13-43 Graph Discovery** — What technology would you like the AI to remember?
915. **13-43 Graph Discovery** — What technology has changed significantly over time?
916. **13-43 Graph Discovery** — What technology currently occupies your attention?
917. **13-43 Graph Discovery** — What technology are you most proud of?
918. **13-43 Graph Discovery** — What technology would you like to experience again?
919. **13-43 Graph Discovery** — What technology would you recommend to someone like you?
920. **13-43 Graph Discovery** — What technology has influenced another part of your life?
921. **13-43 Graph Discovery** — What technology is connected to one of your closest relationships?
922. **13-43 Graph Discovery** — What technology is connected to one of your major goals?
923. **13-43 Graph Discovery** — What technology is connected to your happiest memory?
924. **13-43 Graph Discovery** — What technology is connected to a difficult period?
925. **13-43 Graph Discovery** — What technology represents something important about you?
926. **13-43 Graph Discovery** — What technology do you want to explore further?
927. **13-43 Graph Discovery** — What technology would you remove from your life if you could?
928. **13-43 Graph Discovery** — What technology do you think the AI currently knows too little about?
929. **13-43 Graph Discovery** — What technology should the AI never confuse with something else?
930. **13-43 Graph Discovery** — What technology has an unexpected connection to another part of your life?
931. **13-43 Graph Discovery** — What is an important food in your life?
932. **13-43 Graph Discovery** — Which food is most strongly connected to your identity?
933. **13-43 Graph Discovery** — What food brings back a strong memory?
934. **13-43 Graph Discovery** — What food would you like the AI to remember?
935. **13-43 Graph Discovery** — What food has changed significantly over time?
936. **13-43 Graph Discovery** — What food currently occupies your attention?
937. **13-43 Graph Discovery** — What food are you most proud of?
938. **13-43 Graph Discovery** — What food would you like to experience again?
939. **13-43 Graph Discovery** — What food would you recommend to someone like you?
940. **13-43 Graph Discovery** — What food has influenced another part of your life?
941. **13-43 Graph Discovery** — What food is connected to one of your closest relationships?
942. **13-43 Graph Discovery** — What food is connected to one of your major goals?
943. **13-43 Graph Discovery** — What food is connected to your happiest memory?
944. **13-43 Graph Discovery** — What food is connected to a difficult period?
945. **13-43 Graph Discovery** — What food represents something important about you?
946. **13-43 Graph Discovery** — What food do you want to explore further?
947. **13-43 Graph Discovery** — What food would you remove from your life if you could?
948. **13-43 Graph Discovery** — What food do you think the AI currently knows too little about?
949. **13-43 Graph Discovery** — What food should the AI never confuse with something else?
950. **13-43 Graph Discovery** — What food has an unexpected connection to another part of your life?
951. **13-43 Graph Discovery** — What is an important music in your life?
952. **13-43 Graph Discovery** — Which music is most strongly connected to your identity?
953. **13-43 Graph Discovery** — What music brings back a strong memory?
954. **13-43 Graph Discovery** — What music would you like the AI to remember?
955. **13-43 Graph Discovery** — What music has changed significantly over time?
956. **13-43 Graph Discovery** — What music currently occupies your attention?
957. **13-43 Graph Discovery** — What music are you most proud of?
958. **13-43 Graph Discovery** — What music would you like to experience again?
959. **13-43 Graph Discovery** — What music would you recommend to someone like you?
960. **13-43 Graph Discovery** — What music has influenced another part of your life?
961. **13-43 Graph Discovery** — What music is connected to one of your closest relationships?
962. **13-43 Graph Discovery** — What music is connected to one of your major goals?
963. **13-43 Graph Discovery** — What music is connected to your happiest memory?
964. **13-43 Graph Discovery** — What music is connected to a difficult period?
965. **13-43 Graph Discovery** — What music represents something important about you?
966. **13-43 Graph Discovery** — What music do you want to explore further?
967. **13-43 Graph Discovery** — What music would you remove from your life if you could?
968. **13-43 Graph Discovery** — What music do you think the AI currently knows too little about?
969. **13-43 Graph Discovery** — What music should the AI never confuse with something else?
970. **13-43 Graph Discovery** — What music has an unexpected connection to another part of your life?
971. **13-43 Graph Discovery** — What is an important games in your life?
972. **13-43 Graph Discovery** — Which games is most strongly connected to your identity?
973. **13-43 Graph Discovery** — What games brings back a strong memory?
974. **13-43 Graph Discovery** — What games would you like the AI to remember?
975. **13-43 Graph Discovery** — What games has changed significantly over time?
976. **13-43 Graph Discovery** — What games currently occupies your attention?
977. **13-43 Graph Discovery** — What games are you most proud of?
978. **13-43 Graph Discovery** — What games would you like to experience again?
979. **13-43 Graph Discovery** — What games would you recommend to someone like you?
980. **13-43 Graph Discovery** — What games has influenced another part of your life?
981. **13-43 Graph Discovery** — What games is connected to one of your closest relationships?
982. **13-43 Graph Discovery** — What games is connected to one of your major goals?
983. **13-43 Graph Discovery** — What games is connected to your happiest memory?
984. **13-43 Graph Discovery** — What games is connected to a difficult period?
985. **13-43 Graph Discovery** — What games represents something important about you?
986. **13-43 Graph Discovery** — What games do you want to explore further?
987. **13-43 Graph Discovery** — What games would you remove from your life if you could?
988. **13-43 Graph Discovery** — What games do you think the AI currently knows too little about?
989. **13-43 Graph Discovery** — What games should the AI never confuse with something else?
990. **13-43 Graph Discovery** — What games has an unexpected connection to another part of your life?
991. **13-43 Graph Discovery** — What is an important books in your life?
992. **13-43 Graph Discovery** — Which books is most strongly connected to your identity?
993. **13-43 Graph Discovery** — What books brings back a strong memory?
994. **13-43 Graph Discovery** — What books would you like the AI to remember?
995. **13-43 Graph Discovery** — What books has changed significantly over time?
996. **13-43 Graph Discovery** — What books currently occupies your attention?
997. **13-43 Graph Discovery** — What books are you most proud of?
998. **13-43 Graph Discovery** — What books would you like to experience again?
999. **13-43 Graph Discovery** — What books would you recommend to someone like you?
1000. **13-43 Graph Discovery** — What books has influenced another part of your life?

---

# 🤖 Agent Implementation Notes

The question bank should be treated as data, not hard-coded conversational logic.

Agents should build a question-selection layer capable of:

```text
QuestionBank
      ↓
KnowledgeGraph
      ↓
Context Analyzer
      ↓
Gap / Connection Detector
      ↓
Question Ranker
      ↓
Question
```

Each question should ideally have metadata such as:

- category
- subcategory
- entities it can discover
- knowledge types it can create
- possible follow-up categories
- sensitivity level
- prerequisite knowledge
- duplicate/similarity keys
- priority
- whether it is suitable as an opening question
- whether it is suitable as a follow-up
- whether it is suitable for revisiting old knowledge

The final AI should generate additional questions dynamically when the existing bank does not contain an appropriate question.

## Important

**Do not implement this as 1,000 hard-coded sequential prompts.**

The bank is a vocabulary for the questioning engine.

The intelligence comes from understanding the graph and deciding:

> "What would be the most useful thing to learn next?"

---

# 🔮 Long-Term Vision

Mind Mapper should eventually become a persistent visual representation of the user's evolving relationship with the AI.

The brain should not merely become **more colourful**.

It should become:

- more connected
- more structured
- more expressive
- more informative
- more personalized
- more explainable

The user should eventually be able to zoom into different conceptual regions of their brain and discover:

**People**

**Places**

**Memories**

**Music**

**Projects**

**Goals**

**Interests**

**Skills**

**Experiences**

**Ideas**

and the connections between them.

The ultimate goal is a system where the AI can say:

> "I think these three things are connected."

and show the user the actual connection visually.

Mind Mapper is therefore both:

**a memory system + a knowledge graph + an adaptive interview engine + a 3D visualization of personal knowledge.**

The brain is the interface.

The knowledge graph is the underlying structure.

The AI conversation is the mechanism through which it grows.

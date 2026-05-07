export interface Quote {
  text: string;
  author: string;
  role?: string;
}

export const quotes: Quote[] = [
  {
    text: "Your ability to connect and relate with people, establish rapport, and make people feel at ease — that's what you're best at.",
    author: "Brandon",
    role: "Former Colleague",
  },
  {
    text: "You have a calm, steady temperament that makes you easy to be around. You're great at talking to people and making them feel at ease.",
    author: "Holly",
    role: "Former Colleague",
  },
  {
    text: "You are dedicated and hard working. I can trust that you'll get things done. You do a great job of delegating and following up.",
    author: "Travis",
    role: "Former Colleague",
  },
  {
    text: "Personable, dependable, humble, willing to learn, kind, and a team player.",
    author: "Josh",
    role: "Former Colleague",
  },
];

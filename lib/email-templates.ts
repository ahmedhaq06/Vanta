export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'intro-meeting',
    name: 'Introduction Meeting Request',
    category: 'Meeting Request',
    subject: 'Quick intro call about {{companyName}}?',
    body: `Hi {{firstName}},

I noticed {{companyName}} is doing interesting work in [industry/space].

I'd love to learn more about what you're working on and see if there's an opportunity to collaborate.

Would you be open to a quick 15-minute call this week?

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'value-prop',
    name: 'Value Proposition Outreach',
    category: 'Sales',
    subject: 'Helping {{companyName}} with [specific problem]',
    body: `Hi {{firstName}},

I saw that {{companyName}} is [specific insight about their company].

We help companies like yours [solve specific problem] by [your solution].

Some results we've achieved:
• [Metric 1]
• [Metric 2]
• [Metric 3]

Would it make sense to hop on a quick call to discuss how we could help {{companyName}}?

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'follow-up',
    name: 'Gentle Follow-up',
    category: 'Follow-up',
    subject: 'Re: [Previous subject]',
    body: `Hi {{firstName}},

Just wanted to follow up on my previous email about [topic].

I know you're probably busy, but I genuinely think this could be valuable for {{companyName}}.

Would you have 10 minutes this week for a quick chat?

Best,
[Your Name]

P.S. If the timing isn't right, no worries—feel free to let me know when would work better.`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'social-proof',
    name: 'Social Proof Outreach',
    category: 'Sales',
    subject: 'How [Company X] achieved [result]',
    body: `Hi {{firstName}},

I wanted to reach out because we recently helped [similar company] achieve [specific result].

Given that {{companyName}} is in a similar space, I thought you might be interested in hearing about:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

Would you be open to a brief call to explore if we could deliver similar results for {{companyName}}?

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'event-invite',
    name: 'Event/Webinar Invitation',
    category: 'Event',
    subject: 'Invitation: [Event Name] on [Date]',
    body: `Hi {{firstName}},

I'm hosting a [event type] on [date] about [topic] and thought it might be relevant for {{companyName}}.

We'll be covering:
• [Topic 1]
• [Topic 2]
• [Topic 3]

[Number] companies like yours have already signed up.

Would you like to join? Here's the link: [link]

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'content-share',
    name: 'Valuable Content Share',
    category: 'Nurture',
    subject: 'Resource for {{companyName}}',
    body: `Hi {{firstName}},

I came across this [resource type] and immediately thought of {{companyName}}: [link]

It covers [key topic] which I know is relevant for [industry/use case].

No pitch here—just thought you'd find it valuable.

If you ever want to chat about [related topic], feel free to reach out!

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'problem-agitation',
    name: 'Problem Agitation Solution',
    category: 'Sales',
    subject: 'Struggling with [specific problem]?',
    body: `Hi {{firstName}},

Most [job title]s I talk to at companies like {{companyName}} struggle with [specific problem].

This usually leads to:
• [Pain point 1]
• [Pain point 2]
• [Pain point 3]

We've developed a way to [solution] that's helped [X companies] solve this exact issue.

Would you be open to a 15-minute call to see if we could help {{companyName}} too?

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'breakup-email',
    name: 'Breakup Email (Last Attempt)',
    category: 'Follow-up',
    subject: 'Should I close your file?',
    body: `Hi {{firstName}},

I've reached out a few times about [topic] but haven't heard back.

I totally understand if:
• The timing isn't right
• You're not interested
• You're just busy

If you'd like to explore this, just reply "interested" and I'll send over more details.

Otherwise, I'll assume it's not a fit and won't bother you again.

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'referral-request',
    name: 'Referral Request',
    category: 'Networking',
    subject: 'Quick question about {{companyName}}',
    body: `Hi {{firstName}},

I'm trying to connect with the right person at {{companyName}} who handles [department/responsibility].

Would that be you, or could you point me in the right direction?

I have [brief value prop] that's helped companies like [similar company] achieve [result].

Thanks in advance!

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
  {
    id: 'congratulations',
    name: 'Congratulations Outreach',
    category: 'Relationship Building',
    subject: 'Congrats on [achievement]!',
    body: `Hi {{firstName}},

I saw that {{companyName}} just [recent news/achievement]—congratulations!

I've been following your work and I'm impressed by [specific detail].

I work with companies like yours to [value prop]. Would love to hear more about what's next for {{companyName}}.

Open to a quick call?

Best,
[Your Name]`,
    variables: ['firstName', 'companyName'],
  },
];

export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return emailTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find((t) => t.id === id);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(emailTemplates.map((t) => t.category)));
}

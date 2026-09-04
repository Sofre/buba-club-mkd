export type HeritageEntry = {
  year: string
  header: string
  paragraphs: string[]
}

export type HeritagePageData = {
  intro: string
  closing: string
  timeline: HeritageEntry[]
}

export const heritagePageData: HeritagePageData = {
  intro:
    'The Volkswagen Beetle became a familiar sight on Macedonian roads long before the Beetle Club Macedonia was formed. Loved for its unmistakable shape, simple engineering, and character, the Beetle brought together people who shared more than an interest in old cars. Over time, individual owners and enthusiasts began forming a community built around preserving these cars, sharing knowledge, helping one another with restoration, and enjoying the simple tradition of driving together. From those early gatherings grew Beetle Club Macedonia — a community dedicated to keeping the spirit of the Beetle alive for future generations.',

  closing:
    'More than two decades after the club began, the story of Beetle Club Macedonia continues to be written by its members and their cars. Every restored Beetle carries a piece of history, while every gathering creates another memory for the community. From the first small group of enthusiasts to anniversary celebrations, exhibitions, cruises, and international gatherings, the club has grown while keeping the same idea at its heart: the Beetle is not simply a classic car, but a connection between people, generations, and memories.',

  timeline: [
    {
      year: '2001',
      header: 'The Beginning of Beetle Club Macedonia',
      paragraphs: [
        'At the beginning of the new millennium, Volkswagen Beetle owners and enthusiasts in Macedonia were becoming increasingly connected through their shared passion for the iconic air-cooled car. What had previously been individual ownership and occasional meetings gradually developed into the idea of creating an organized community. Owners wanted a place where they could meet other enthusiasts, exchange experiences, help each other maintain and restore their cars, and most importantly, enjoy the Beetle together.',
        'This growing group of enthusiasts became the foundation of Beetle Club Macedonia. The club was created around a simple but powerful idea: to preserve the Volkswagen Beetle and the memories connected to it, while creating a community where people of different ages and backgrounds could share the same passion. The first period was defined by enthusiasm, friendship, and the excitement of bringing Beetles together in one place. It was the start of a story that would continue for many years and introduce the Beetle to new generations of Macedonian enthusiasts.',
      ],
    },

    {
      year: '2002',
      header: 'The First Birthday',
      paragraphs: [
        'In 2002, Beetle Club Macedonia marked its first year as a community. The first anniversary was an important milestone because it showed that the idea behind the club could grow beyond a small gathering of owners. The Beetle was becoming a reason for people to meet, travel, exchange stories, and build friendships. Every car brought its own history, whether it had belonged to a family for years, had been restored by its owner, or had recently found a new home in Macedonia.',
        'The first birthday also established a tradition that would become an important part of the club identity: celebrating the cars and the people behind them. The anniversary was not simply about counting another year; it was about recognizing the community that had formed around the Beetle. Through shared drives, conversations, mechanical knowledge, restoration advice, and countless photographs, the club began creating its own history alongside the history of the cars it represented.',
      ],
    },

    {
      year: '2012',
      header: '10 Years of Beetle Club Macedonia',
      paragraphs: [
        'Ten years after the club was formed, Beetle Club Macedonia reached its first major anniversary. A decade of meetings, drives, restorations, friendships, and shared experiences had transformed the club from a small group of enthusiasts into an established community with its own identity and traditions. During those years, Beetles from different generations and in different conditions became part of the club story, from carefully preserved original examples to cars that had been brought back to life through years of restoration work.',
        'The tenth anniversary represented much more than ten years of ownership and car gatherings. It demonstrated the lasting appeal of the Beetle and the strength of the community built around it. Members who had been there from the beginning could look back at how far the club had come, while newer enthusiasts could become part of a tradition that was already a decade old. The anniversary celebrated the people, the cars, the roads travelled together, and the countless moments that had turned a shared interest into a lasting community.',
      ],
    },

    {
      year: '2017',
      header: '15 Years of Heritage',
      paragraphs: [
        'In 2017, Beetle Club Macedonia celebrated 15 years since its formation. By this point, the club had become a recognizable part of the classic-car community in Macedonia, bringing together owners and admirers of the Volkswagen Beetle around events, gatherings, drives, and the preservation of automotive heritage. Fifteen years represented an entire generation of memories — cars that had been restored, friendships that had been formed, and members who had discovered their passion for the Beetle through the club.',
        'The fifteenth anniversary was also a reminder that preserving a classic car is about more than maintaining metal, paint, and mechanical parts. Every Beetle has a story, and every owner adds another chapter to that story. The club continued to connect generations by giving experienced owners an opportunity to share their knowledge while introducing younger enthusiasts to the character of the air-cooled Volkswagen. After fifteen years, the original idea remained unchanged: bring people together through the Beetle and keep its heritage alive.',
      ],
    },

    {
      year: '2026',
      header: 'A Living Heritage',
      paragraphs: [
        'Today, Beetle Club Macedonia continues the tradition that began more than two decades ago. The Beetle has changed from everyday transportation into a piece of living automotive heritage, but its ability to bring people together has remained remarkably strong. Club members continue to preserve, restore, maintain, and drive their cars, while gatherings and events provide opportunities to share experiences with both longtime enthusiasts and people discovering the Beetle for the first time.',
        'The club represents a bridge between generations. Older members carry memories and technical knowledge from years of ownership, while younger enthusiasts bring new energy and new ways of sharing the culture. Every event, road trip, photograph, restoration, and newly discovered Beetle adds something to the club history. What started with a group of people who simply wanted to share their passion has become a continuing heritage — one that lives on every time a Beetle starts its engine and heads out onto a Macedonian road.',
      ],
    },
  ],
}

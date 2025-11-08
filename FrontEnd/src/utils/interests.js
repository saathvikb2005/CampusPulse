// Interest categories for Campus Events
export const INTEREST_CATEGORIES = [
  // Academic & Educational
  'Technology',
  'Computer Science',
  'Engineering',
  'Science',
  'Mathematics',
  'Business',
  'Management',
  'Marketing',
  'Finance',
  'Economics',
  
  // Arts & Culture
  'Arts',
  'Music',
  'Dance',
  'Theater',
  'Photography',
  'Literature',
  'Writing',
  'Culture',
  'History',
  
  // Sports & Fitness
  'Sports',
  'Football',
  'Basketball',
  'Cricket',
  'Tennis',
  'Fitness',
  'Yoga',
  'Running',
  'Swimming',
  
  // Social & Community
  'Community Service',
  'Volunteering',
  'Social Work',
  'Environment',
  'Sustainability',
  'Leadership',
  'Networking',
  'Career',
  
  // Hobbies & Lifestyle
  'Gaming',
  'Food',
  'Cooking',
  'Travel',
  'Adventure',
  'Nature',
  'Outdoors',
  'Fashion',
  'Health',
  'Wellness',
  
  // Professional & Career
  'Entrepreneurship',
  'Startups',
  'Innovation',
  'Research',
  'AI/ML',
  'Data Science',
  'Web Development',
  'Mobile Development',
  'Cybersecurity',
  'Design',
  
  // Entertainment
  'Comedy',
  'Movies',
  'Concerts',
  'Festivals',
  'Parties',
  'Competitions',
  'Hackathons',
  'Workshops'
];

export const getInterestSuggestions = (query) => {
  if (!query) return INTEREST_CATEGORIES.slice(0, 10);
  
  return INTEREST_CATEGORIES.filter(interest => 
    interest.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);
};
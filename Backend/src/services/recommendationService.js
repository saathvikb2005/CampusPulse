const natural = require('natural');
const Event = require('../models/Event');
const User = require('../models/User');

class EventRecommendationEngine {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.TfIdf = natural.TfIdf;
    this.distance = natural.JaroWinklerDistance;
  }

  /**
   * Get personalized event recommendations for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations to return
   * @returns {Array} Recommended events with scores
   */
  async getRecommendations(userId, limit = 10) {
    try {
      console.log('[RecommendationService] UPDATED VERSION - Starting recommendations for user:', userId);
      const user = await User.findById(userId);
      console.log('[RecommendationService] User found:', user ? 'Yes' : 'No');
      
      const allEvents = await Event.find({ 
        date: { $gte: new Date() },
        status: 'published'
      }).populate('registrations');
      
      console.log('[RecommendationService] Found', allEvents.length, 'upcoming events');

      if (!user) {
        console.error('[RecommendationService] User not found for ID:', userId);
        throw new Error('User not found');
      }

      if (allEvents.length === 0) {
        console.log('[RecommendationService] No upcoming events found in database');
        return []; // Return empty array instead of throwing error
      }

      // Get user's interests and event history
      const userProfile = await this.buildUserProfile(user);
      console.log('[RecommendationService] User profile built:', {
        categories: Object.keys(userProfile.categories).length,
        keywords: Object.keys(userProfile.keywords).length,
        interests: user.interests?.length || 0
      });
      
      // Score all available events
      const scoredEvents = await Promise.all(
        allEvents.map(async (event) => {
          const score = await this.calculateEventScore(event, userProfile, user);
          return {
            event,
            score,
            reasons: this.getRecommendationReasons(event, userProfile, score)
          };
        })
      );

      // Sort by score and return top recommendations
      const filteredRecommendations = scoredEvents
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .filter(item => item.score > 0.3); // Minimum relevance threshold

      console.log('[RecommendationService] Scored events count:', scoredEvents.length);
      console.log('[RecommendationService] After filtering (score > 0.3):', filteredRecommendations.length);
      
      // If no recommendations meet the threshold, return top events anyway
      if (filteredRecommendations.length === 0 && allEvents.length > 0) {
        console.log('[RecommendationService] No high-scoring recommendations, returning top events');
        const fallbackRecommendations = allEvents.slice(0, limit).map(event => ({
          event,
          score: 0.5, // Neutral score
          reasons: ['Popular upcoming event', 'Recommended for you']
        }));
        console.log('[RecommendationService] Returning', fallbackRecommendations.length, 'fallback recommendations');
        return fallbackRecommendations;
      }

      console.log('[RecommendationService] Returning', filteredRecommendations.length, 'filtered recommendations');
      return filteredRecommendations;

    } catch (error) {
      console.error('[RecommendationService] Error generating recommendations:', error);
      console.error('[RecommendationService] Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Build user profile from history and preferences
   * @param {Object} user - User object
   * @returns {Object} User profile with interests and preferences
   */
  async buildUserProfile(user) {
    const profile = {
      categories: {},
      keywords: {},
      venues: {},
      timePreferences: {},
      socialLevel: 0,
      activityLevel: 0,
      explicitInterests: {},
      departmentPreference: user.department || ''
    };

    // Process explicit user interests first (give them higher weight)
    if (user.interests && Array.isArray(user.interests)) {
      user.interests.forEach(interest => {
        const normalizedInterest = interest.toLowerCase().trim();
        profile.explicitInterests[normalizedInterest] = 3; // High weight for explicit interests
        
        // Also add to keywords for content matching
        const tokens = this.tokenizer.tokenize(normalizedInterest);
        tokens.forEach(token => {
          const stemmed = this.stemmer.stem(token);
          profile.keywords[stemmed] = (profile.keywords[stemmed] || 0) + 2;
        });
      });
    }

    // Analyze event history
    if (user.eventsRegistered && user.eventsRegistered.length > 0) {
      for (const registration of user.eventsRegistered) {
        const event = registration.event;
        // Category preferences
        if (event.category) {
          profile.categories[event.category] = (profile.categories[event.category] || 0) + 1;
        }

        // Keyword extraction from event titles and descriptions
        const text = `${event.title} ${event.description || ''}`;
        const tokens = this.tokenizer.tokenize(text.toLowerCase());
        const stemmedTokens = tokens.map(token => this.stemmer.stem(token));

        stemmedTokens.forEach(token => {
          if (token.length > 2) { // Filter out short words
            profile.keywords[token] = (profile.keywords[token] || 0) + 1;
          }
        });

        // Venue preferences
        if (event.venue) {
          profile.venues[event.venue] = (profile.venues[event.venue] || 0) + 1;
        }

        // Time preferences
        if (event.startTime) {
          const hour = new Date(`1970-01-01T${event.startTime}`).getHours();
          const timeSlot = this.getTimeSlot(hour);
          profile.timePreferences[timeSlot] = (profile.timePreferences[timeSlot] || 0) + 1;
        }
      }

      // Calculate social and activity levels
      profile.socialLevel = user.eventsRegistered.length / 10; // Normalize to 0-1
      profile.activityLevel = this.calculateActivityLevel(user.eventsRegistered);
    }

    // Add explicit user preferences if available
    if (user.preferences) {
      if (user.preferences.categories) {
        user.preferences.categories.forEach(cat => {
          profile.categories[cat] = (profile.categories[cat] || 0) + 2; // Boost explicit preferences
        });
      }
      
      if (user.preferences.interests) {
        user.preferences.interests.forEach(interest => {
          const tokens = this.tokenizer.tokenize(interest.toLowerCase());
          tokens.forEach(token => {
            const stemmed = this.stemmer.stem(token);
            profile.keywords[stemmed] = (profile.keywords[stemmed] || 0) + 2;
          });
        });
      }
    }

    console.log('[RecommendationService] Final profile summary:', {
      explicitInterests: Object.keys(profile.explicitInterests).length,
      categories: Object.keys(profile.categories).length,
      keywords: Object.keys(profile.keywords).length,
      department: profile.departmentPreference,
      topKeywords: Object.entries(profile.keywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => `${word}(${count})`)
    });

    return profile;
  }

  /**
   * Calculate relevance score for an event
   * @param {Object} event - Event object
   * @param {Object} userProfile - User profile
   * @param {Object} user - User object
   * @returns {number} Relevance score (0-1)
   */
  async calculateEventScore(event, userProfile, user) {
    let score = 0;
    const weights = {
      explicitInterests: 0.30,  // Increased weight for explicit interests
      category: 0.20,
      content: 0.20,
      department: 0.10,        // New: department matching
      venue: 0.08,
      time: 0.05,
      social: 0.04,
      popularity: 0.02,
      novelty: 0.01
    };

    // Explicit interests matching (highest priority)
    let interestScore = 0;
    if (event.tags && Array.isArray(event.tags)) {
      event.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        if (userProfile.explicitInterests[normalizedTag]) {
          interestScore += userProfile.explicitInterests[normalizedTag] / 10;
        }
        
        // Partial matching for compound interests
        Object.keys(userProfile.explicitInterests).forEach(interest => {
          if (normalizedTag.includes(interest) || interest.includes(normalizedTag)) {
            interestScore += userProfile.explicitInterests[interest] / 20;
          }
        });
      });
    }
    score += weights.explicitInterests * Math.min(interestScore, 1);

    // Department matching
    if (event.department && userProfile.departmentPreference) {
      if (event.department.toLowerCase() === userProfile.departmentPreference.toLowerCase()) {
        score += weights.department;
      }
    }

    // Category matching
    if (event.category && userProfile.categories[event.category]) {
      score += weights.category * Math.min(userProfile.categories[event.category] / 5, 1);
    }

    // Content similarity
    const contentScore = this.calculateContentSimilarity(event, userProfile);
    score += weights.content * contentScore;

    // Venue preference
    if (event.venue && userProfile.venues[event.venue]) {
      score += weights.venue * Math.min(userProfile.venues[event.venue] / 3, 1);
    }

    // Time preference
    if (event.startTime) {
      const timeScore = this.calculateTimePreference(event, userProfile);
      score += weights.time * timeScore;
    }

    // Social fit (based on event size and user's social level)
    const socialScore = this.calculateSocialFit(event, userProfile);
    score += weights.social * socialScore;

    // Popularity score (but not too popular to avoid obvious choices)
    const popularityScore = this.calculatePopularityScore(event);
    score += weights.popularity * popularityScore;

    // Novelty bonus (new categories or venues)
    const noveltyScore = this.calculateNoveltyScore(event, userProfile);
    score += weights.novelty * noveltyScore;

    // Apply penalties
    score *= this.applyPenalties(event, user);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate content similarity using TF-IDF
   * @param {Object} event - Event object
   * @param {Object} userProfile - User profile
   * @returns {number} Similarity score
   */
  calculateContentSimilarity(event, userProfile) {
    const eventText = `${event.title} ${event.description || ''}`;
    const eventTokens = this.tokenizer.tokenize(eventText.toLowerCase());
    const eventStemmed = eventTokens.map(token => this.stemmer.stem(token));

    let similarity = 0;
    let totalKeywords = Object.keys(userProfile.keywords).length;

    if (totalKeywords === 0) return 0;

    eventStemmed.forEach(token => {
      if (userProfile.keywords[token]) {
        similarity += userProfile.keywords[token] / totalKeywords;
      }
    });

    return Math.min(similarity, 1);
  }

  /**
   * Calculate time preference score
   * @param {Object} event - Event object
   * @param {Object} userProfile - User profile
   * @returns {number} Time preference score
   */
  calculateTimePreference(event, userProfile) {
    if (!event.startTime) return 0.5; // Neutral if no time data

    const hour = new Date(`1970-01-01T${event.startTime}`).getHours();
    const timeSlot = this.getTimeSlot(hour);
    
    const totalTimePrefs = Object.values(userProfile.timePreferences).reduce((a, b) => a + b, 0);
    if (totalTimePrefs === 0) return 0.5;

    return (userProfile.timePreferences[timeSlot] || 0) / totalTimePrefs;
  }

  /**
   * Get time slot from hour
   * @param {number} hour - Hour (0-23)
   * @returns {string} Time slot
   */
  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Calculate social fit score
   * @param {Object} event - Event object
   * @param {Object} userProfile - User profile
   * @returns {number} Social fit score
   */
  calculateSocialFit(event, userProfile) {
    const registrationCount = event.registrations ? event.registrations.length : 0;
    const eventSize = event.maxParticipants || registrationCount + 50;

    // Determine event size category
    let eventSizeCategory;
    if (eventSize < 20) eventSizeCategory = 'intimate';
    else if (eventSize < 100) eventSizeCategory = 'medium';
    else eventSizeCategory = 'large';

    // Match with user's social level
    const userSocialLevel = userProfile.socialLevel;
    
    if (userSocialLevel < 0.3) {
      // Introverted users prefer smaller events
      return eventSizeCategory === 'intimate' ? 1 : eventSizeCategory === 'medium' ? 0.6 : 0.3;
    } else if (userSocialLevel > 0.7) {
      // Extroverted users prefer larger events
      return eventSizeCategory === 'large' ? 1 : eventSizeCategory === 'medium' ? 0.7 : 0.4;
    } else {
      // Moderate users prefer medium events
      return eventSizeCategory === 'medium' ? 1 : 0.6;
    }
  }

  /**
   * Calculate popularity score
   * @param {Object} event - Event object
   * @returns {number} Popularity score
   */
  calculatePopularityScore(event) {
    const registrationCount = event.registrations ? event.registrations.length : 0;
    const maxParticipants = event.maxParticipants || 100;
    
    const fillRate = registrationCount / maxParticipants;
    
    // Sweet spot: 30-70% filled (popular but not overcrowded)
    if (fillRate >= 0.3 && fillRate <= 0.7) {
      return 1;
    } else if (fillRate < 0.3) {
      return fillRate / 0.3; // Scale from 0 to 1
    } else {
      return Math.max(0, 1 - (fillRate - 0.7) / 0.3); // Decrease after 70%
    }
  }

  /**
   * Calculate novelty score
   * @param {Object} event - Event object
   * @param {Object} userProfile - User profile
   * @returns {number} Novelty score
   */
  calculateNoveltyScore(event, userProfile) {
    let novelty = 0;

    // New category
    if (event.category && !userProfile.categories[event.category]) {
      novelty += 0.5;
    }

    // New venue
    if (event.venue && !userProfile.venues[event.venue]) {
      novelty += 0.3;
    }

    // Recent event (less than a week old)
    const eventAge = (Date.now() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (eventAge < 7) {
      novelty += 0.2;
    }

    return Math.min(novelty, 1);
  }

  /**
   * Calculate activity level from event registrations
   * @param {Array} eventsRegistered - User's event registrations
   * @returns {number} Activity level (0-1)
   */
  calculateActivityLevel(eventsRegistered) {
    if (!eventsRegistered || eventsRegistered.length === 0) return 0;

    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentEvents = eventsRegistered.filter(registration => 
      registration.event && new Date(registration.event.date) >= monthAgo
    );

    return Math.min(recentEvents.length / 10, 1); // Normalize to 0-1
  }

  /**
   * Apply penalties for various factors
   * @param {Object} event - Event object
   * @param {Object} user - User object
   * @returns {number} Penalty multiplier (0-1)
   */
  applyPenalties(event, user) {
    let penalty = 1;

    // Already registered
    if (event.registrations && event.registrations.some(reg => reg.user?.toString() === user._id.toString())) {
      penalty *= 0; // No recommendation for already registered events
    }

    // Event is full
    if (event.maxParticipants && event.registrations && event.registrations.length >= event.maxParticipants) {
      penalty *= 0.1;
    }

    // Event is too soon (less than 2 hours)
    const timeUntilEvent = new Date(event.date).getTime() - Date.now();
    if (timeUntilEvent < 2 * 60 * 60 * 1000) {
      penalty *= 0.2;
    }

    return penalty;
  }

  /**
   * Get reasons for recommendation
   * @param {Object} event - Event object
   * @param {Object} userProfile - User profile
   * @param {number} score - Recommendation score
   * @returns {Array} Reasons for recommendation
   */
  getRecommendationReasons(event, userProfile, score) {
    const reasons = [];

    if (event.category && userProfile.categories[event.category]) {
      reasons.push(`You've shown interest in ${event.category} events`);
    }

    if (event.venue && userProfile.venues[event.venue]) {
      reasons.push(`You've attended events at ${event.venue} before`);
    }

    if (score > 0.8) {
      reasons.push('Highly matches your interests');
    } else if (score > 0.6) {
      reasons.push('Good match for your preferences');
    }

    const registrationCount = event.registrations ? event.registrations.length : 0;
    if (registrationCount > 10) {
      reasons.push('Popular event with good attendance');
    }

    if (!userProfile.categories[event.category]) {
      reasons.push('Explore a new category');
    }

    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  /**
   * Get trending events based on registration velocity
   * @param {number} limit - Number of events to return
   * @returns {Array} Trending events
   */
  async getTrendingEvents(limit = 5) {
    try {
      const events = await Event.find({
        date: { $gte: new Date() },
        status: 'published',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last week
      }).populate('registrations');

      const trendingEvents = events.map(event => {
        const registrationCount = event.registrations ? event.registrations.length : 0;
        const daysSinceCreated = (Date.now() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const velocity = registrationCount / Math.max(daysSinceCreated, 1);

        return {
          event,
          velocity,
          registrationCount
        };
      });

      return trendingEvents
        .sort((a, b) => b.velocity - a.velocity)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting trending events:', error);
      throw error;
    }
  }

  /**
   * Get similar events to a given event
   * @param {string} eventId - Event ID
   * @param {number} limit - Number of similar events to return
   * @returns {Array} Similar events
   */
  async getSimilarEvents(eventId, limit = 5) {
    try {
      const sourceEvent = await Event.findById(eventId);
      if (!sourceEvent) {
        throw new Error('Source event not found');
      }

      const allEvents = await Event.find({
        _id: { $ne: eventId },
        date: { $gte: new Date() },
        status: 'published'
      });

      const similarEvents = allEvents.map(event => {
        let similarity = 0;

        // Category similarity
        if (event.category === sourceEvent.category) {
          similarity += 0.4;
        }

        // Content similarity
        const contentSim = this.calculateTextSimilarity(
          `${sourceEvent.title} ${sourceEvent.description || ''}`,
          `${event.title} ${event.description || ''}`
        );
        similarity += 0.4 * contentSim;

        // Venue similarity
        if (event.venue === sourceEvent.venue) {
          similarity += 0.2;
        }

        return {
          event,
          similarity
        };
      });

      return similarEvents
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .filter(item => item.similarity > 0.3);

    } catch (error) {
      console.error('Error getting similar events:', error);
      throw error;
    }
  }

  /**
   * Calculate text similarity using Jaro-Winkler distance
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Similarity score (0-1)
   */
  calculateTextSimilarity(text1, text2) {
    const tokens1 = this.tokenizer.tokenize(text1.toLowerCase());
    const tokens2 = this.tokenizer.tokenize(text2.toLowerCase());

    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    tokens1.forEach(token1 => {
      tokens2.forEach(token2 => {
        totalSimilarity += this.distance(token1, token2);
        comparisons++;
      });
    });

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }
}

module.exports = new EventRecommendationEngine();
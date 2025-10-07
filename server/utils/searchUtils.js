// Search utility functions for fuzzy matching and spell tolerance

// Simple string similarity calculation (Levenshtein-based)
export const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1, str2) => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

// Filter and rank routes based on search terms with fuzzy matching
export const filterRoutesBySearch = (routes, origin, destination) => {
  if (!origin && !destination) {
    return routes;
  }

  // Filter routes that match search criteria with fuzzy logic
  const filteredRoutes = routes.filter((route) => {
    let matches = true;

    if (origin) {
      const originSimilarity = Math.max(
        calculateSimilarity(origin.toLowerCase(), route.origin.toLowerCase()),
        calculateSimilarity(
          origin.toLowerCase(),
          route.destination.toLowerCase()
        )
      );
      // Accept if similarity is above 60% or contains the search term
      const originMatch =
        originSimilarity > 0.6 ||
        route.origin.toLowerCase().includes(origin.toLowerCase()) ||
        route.destination.toLowerCase().includes(origin.toLowerCase());
      matches = matches && originMatch;
    }

    if (destination) {
      const destSimilarity = Math.max(
        calculateSimilarity(
          destination.toLowerCase(),
          route.destination.toLowerCase()
        ),
        calculateSimilarity(
          destination.toLowerCase(),
          route.origin.toLowerCase()
        )
      );
      // Accept if similarity is above 60% or contains the search term
      const destMatch =
        destSimilarity > 0.6 ||
        route.destination.toLowerCase().includes(destination.toLowerCase()) ||
        route.origin.toLowerCase().includes(destination.toLowerCase());
      matches = matches && destMatch;
    }

    return matches;
  });

  // Calculate relevance score and sort
  const scoredRoutes = filteredRoutes.map((route) => {
    let score = 0;

    if (origin) {
      const originSimilarity = Math.max(
        calculateSimilarity(origin.toLowerCase(), route.origin.toLowerCase()),
        calculateSimilarity(
          origin.toLowerCase(),
          route.destination.toLowerCase()
        )
      );
      score += originSimilarity * 0.5;
    }

    if (destination) {
      const destSimilarity = Math.max(
        calculateSimilarity(
          destination.toLowerCase(),
          route.destination.toLowerCase()
        ),
        calculateSimilarity(
          destination.toLowerCase(),
          route.origin.toLowerCase()
        )
      );
      score += destSimilarity * 0.5;
    }

    return { route, score };
  });

  // Sort by relevance score (highest first) and return routes
  return scoredRoutes
    .sort((a, b) => b.score - a.score)
    .map((item) => item.route);
};

// Check if search terms have typos by comparing with known city names
export const suggestCorrections = (searchTerm, knownCities) => {
  if (!searchTerm || !knownCities.length) return [];

  const suggestions = knownCities
    .map((city) => ({
      city,
      similarity: calculateSimilarity(
        searchTerm.toLowerCase(),
        city.toLowerCase()
      ),
    }))
    .filter((item) => item.similarity > 0.5)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map((item) => item.city);

  return suggestions;
};

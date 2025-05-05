import levenshteinDistance from "./LevenshteinDistance.js";
import doubleMetaphone from "./NaturalPhoneticAlgs.js";

const calculateMinDistance = (metaphonePair1, metaphonePair2, word2) => {
    const [p1, s1] = metaphonePair1;
    const [p2, s2] = metaphonePair2;

    const distances = [
        {
            distance:
                levenshteinDistance(p1, p2) / Math.max(p1.length, p2.length),
            word: word2,
        },
        {
            distance:
                levenshteinDistance(s1, s2) / Math.max(s1.length, s2.length),
            word: word2,
        },
        {
            distance:
                levenshteinDistance(p1, s2) / Math.max(p1.length, s2.length),
            word: word2,
        },
        {
            distance:
                levenshteinDistance(s1, p2) / Math.max(s1.length, p2.length),
            word: word2,
        },
    ];

    return distances.reduce((min, current) =>
        current.distance < min.distance ? current : min
    );
};

const pairwiseSimilarityCalculations = (sampledWords, actualWords) => {
    let sampledWordsToDoubleMetaphoneMapping = sampledWords.map((word) =>
        doubleMetaphone(word).concat(word)
    );
    let actualWordsToDoubleMetaphoneMapping = actualWords.map((word) =>
        doubleMetaphone(word).concat(word)
    );

    // Calculate all pairwise distances and store them
    const allDistances = [];

    for (let i = 0; i < actualWordsToDoubleMetaphoneMapping.length; i++) {
        const actualWord = actualWordsToDoubleMetaphoneMapping[i][2];

        for (let j = 0; j < sampledWordsToDoubleMetaphoneMapping.length; j++) {
            const sampledWord = sampledWordsToDoubleMetaphoneMapping[j][2];

            const minPhoneticDistance = calculateMinDistance(
                actualWordsToDoubleMetaphoneMapping[i],
                sampledWordsToDoubleMetaphoneMapping[j],
                sampledWord
            );

            const minOrthographicDistance =
                levenshteinDistance(actualWord, sampledWord) /
                Math.max(actualWord.length, sampledWord.length);

            const minDistance = Math.min(
                minPhoneticDistance.distance,
                minOrthographicDistance
            );

            allDistances.push({
                actualWord,
                sampledWord,
                distance: minDistance,
                phoneticDistance: minPhoneticDistance.distance,
                orthographicDistance: minOrthographicDistance,
            });
        }
    }

    // Sort all distances from lowest to highest
    allDistances.sort((a, b) => a.distance - b.distance);

    // Create result dictionary
    let minDistanceDictionary = {};

    // Initialize all actual words with max distance
    for (let i = 0; i < actualWordsToDoubleMetaphoneMapping.length; i++) {
        const word = actualWordsToDoubleMetaphoneMapping[i][2];
        minDistanceDictionary[word] = {
            distance: Number.MAX_SAFE_INTEGER,
            matchingWord: "",
            phoneticDistance: Number.MAX_SAFE_INTEGER,
            orthographicDistance: Number.MAX_SAFE_INTEGER,
        };
    }

    // Keep track of matched sampled words to ensure one-to-one mapping
    let matchedWordsDictionary = {};

    // Process distances from lowest to highest for greedy matching
    for (const pair of allDistances) {
        const {
            actualWord,
            sampledWord,
            distance,
            phoneticDistance,
            orthographicDistance,
        } = pair;

        // Skip if this actual word already has a better match
        if (minDistanceDictionary[actualWord].distance <= distance) {
            continue;
        }

        // Skip if the sampled word has already been matched
        if (matchedWordsDictionary[sampledWord]) {
            continue;
        }

        // Make the match
        minDistanceDictionary[actualWord].distance = distance;
        minDistanceDictionary[actualWord].matchingWord = sampledWord;
        minDistanceDictionary[actualWord].phoneticDistance = phoneticDistance;
        minDistanceDictionary[actualWord].orthographicDistance =
            orthographicDistance;
        matchedWordsDictionary[sampledWord] = true;
        const similarityScore = 1 / (distance + 1);
        minDistanceDictionary[actualWord].similarityScore = similarityScore;
    }

    return minDistanceDictionary;
};

export default pairwiseSimilarityCalculations;

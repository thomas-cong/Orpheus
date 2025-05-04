import levenshteinDistance from "./LevenshteinDistance.js";
import doubleMetaphone from "./NaturalPhoneticAlgs.js";

const calculateMinDistance = (metaphonePair1, metaphonePair2, word2) => {
    const [p1, s1] = metaphonePair1;
    const [p2, s2] = metaphonePair2;

    const distances = [
        { distance: levenshteinDistance(p1, p2), word: word2 },
        { distance: levenshteinDistance(s1, s2), word: word2 },
        { distance: levenshteinDistance(p1, s2), word: word2 },
        { distance: levenshteinDistance(s1, p2), word: word2 },
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
    let minDistanceDictionary = {};

    // Initialize the dictionary with entries for each word in list1
    for (let i = 0; i < actualWordsToDoubleMetaphoneMapping.length; i++) {
        const word1 = actualWordsToDoubleMetaphoneMapping[i][2];
        minDistanceDictionary[word1] = {
            distance: Number.MAX_SAFE_INTEGER,
            matchingWord: "",
        };
    }
    let matchedWordsDictionary = {};

    /**
     * TODO: if the word has been matched previously, don't use it again
     */
    for (let i = 0; i < actualWordsToDoubleMetaphoneMapping.length; i++) {
        const word1 = actualWordsToDoubleMetaphoneMapping[i][2];
        for (let j = 0; j < sampledWordsToDoubleMetaphoneMapping.length; j++) {
            const word2 = sampledWordsToDoubleMetaphoneMapping[j][2];
            const minPhoneticDistance = calculateMinDistance(
                actualWordsToDoubleMetaphoneMapping[i],
                sampledWordsToDoubleMetaphoneMapping[j]
            );
            const minOrthographicDistance = levenshteinDistance(word1, word2);
            const minDistance = Math.min(
                minPhoneticDistance.distance,
                minOrthographicDistance
            );
            if (minDistance < minDistanceDictionary[word1].distance) {
                minDistanceDictionary[word1].distance = minDistance;
                minDistanceDictionary[word1].matchingWord = word2;
            }
        }
    }

    return minDistanceDictionary;
};

export default pairwiseSimilarityCalculations;

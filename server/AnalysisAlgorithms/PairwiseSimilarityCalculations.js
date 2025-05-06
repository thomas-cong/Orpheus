import levenshteinDistance from "./LevenshteinDistance.js";
import doubleMetaphone from "./NaturalPhoneticAlgs.js";

const calculateMaxSimilarity = (metaphonePair1, metaphonePair2, word2) => {
    const [p1, s1] = metaphonePair1;
    const [p2, s2] = metaphonePair2;

    const similarities = [
        {
            similarity: normalizedSimilarity(p1, p2),
            word: word2,
        },
        {
            similarity: normalizedSimilarity(s1, s2),
            word: word2,
        },
        {
            similarity: normalizedSimilarity(p1, s2),
            word: word2,
        },
        {
            similarity: normalizedSimilarity(s1, p2),
            word: word2,
        },
    ];

    return similarities.reduce((max, current) =>
        current.similarity > max.similarity ? current : max
    );
};

const normalizedSimilarity = (actualSpelling, sampledSpelling) => {
    const distance = levenshteinDistance(actualSpelling, sampledSpelling);
    return Math.max(0, 1 - distance / actualSpelling.length);
}

const pairwiseSimilarityCalculations = (sampledWords, actualWords) => {
    let sampledWordsToDoubleMetaphoneMapping = sampledWords.map((word) =>
        doubleMetaphone(word).concat(word)
    );
    let actualWordsToDoubleMetaphoneMapping = actualWords.map((word) =>
        doubleMetaphone(word).concat(word)
    );

    // Calculate all pairwise similarities and store them
    const allSimilarities = [];

    for (let i = 0; i < actualWordsToDoubleMetaphoneMapping.length; i++) {
        const actualWord = actualWordsToDoubleMetaphoneMapping[i][2];

        for (let j = 0; j < sampledWordsToDoubleMetaphoneMapping.length; j++) {
            const sampledWord = sampledWordsToDoubleMetaphoneMapping[j][2];

            const maxPhoneticSimilarity = calculateMaxSimilarity(
                actualWordsToDoubleMetaphoneMapping[i],
                sampledWordsToDoubleMetaphoneMapping[j],
                sampledWord
            );

            const maxOrthographicSimilarity = normalizedSimilarity(actualWord, sampledWord);

            const maxSimilarity = Math.max(
                maxPhoneticSimilarity.similarity,
                maxOrthographicSimilarity
            );

            allSimilarities.push({
                actualWord,
                sampledWord,
                similarity: maxSimilarity,
                phoneticSimilarity: maxPhoneticSimilarity.similarity,
                orthographicSimilarity: maxOrthographicSimilarity,
            });
        }
    }

    // Sort all similarities from highest to lowest
    allSimilarities.sort((a, b) => b.similarity - a.similarity);

    // Create result dictionary
    let maxSimilarityDictionary = {};

    // Initialize all actual words with minimum similarity
    for (let i = 0; i < actualWordsToDoubleMetaphoneMapping.length; i++) {
        const word = actualWordsToDoubleMetaphoneMapping[i][2];
        maxSimilarityDictionary[word] = {
            similarity: 0,
            matchingWord: "",
            phoneticSimilarity: 0,
            orthographicSimilarity: 0,
        };
    }

    // Keep track of matched sampled words to ensure one-to-one mapping
    let matchedWordsDictionary = {};

    // Process similarities from highest to lowest for greedy matching
    for (const pair of allSimilarities) {
        const {
            actualWord,
            sampledWord,
            similarity,
            phoneticSimilarity,
            orthographicSimilarity,
        } = pair;

        // Skip if this actual word already has a better match
        if (maxSimilarityDictionary[actualWord].similarity >= similarity) {
            continue;
        }

        // Skip if the sampled word has already been matched
        if (matchedWordsDictionary[sampledWord]) {
            continue;
        }

        // Make the match
        maxSimilarityDictionary[actualWord].similarity = similarity;
        maxSimilarityDictionary[actualWord].matchingWord = sampledWord;
        maxSimilarityDictionary[actualWord].phoneticSimilarity = phoneticSimilarity;
        maxSimilarityDictionary[actualWord].orthographicSimilarity = orthographicSimilarity;
        matchedWordsDictionary[sampledWord] = true;
    }

    return maxSimilarityDictionary;
};

export default pairwiseSimilarityCalculations;

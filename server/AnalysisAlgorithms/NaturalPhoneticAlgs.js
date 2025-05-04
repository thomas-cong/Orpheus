import natural from "natural";
const doubleMetaphone = (input) => {
    const metaphone = new natural.DoubleMetaphone();
    return metaphone.process(input);
};

export default doubleMetaphone;

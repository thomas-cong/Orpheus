import natural from "natural";
const metaphone = new natural.DoubleMetaphone();
const doubleMetaphone = (input) => {
    return metaphone.process(input);
};

export default doubleMetaphone;

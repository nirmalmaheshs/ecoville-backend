const axios = require("axios");
const defaultPrompt = 'Find the technical terms in the string and give me a json with keys- company, Techstack array, job title, location, job url. Use empty values when the required data is not present. just give the json and nothing else. JSON format { company: string, url: string, techStack: [], jobtitle: string, location: string }';
export async function getJobMetaData(prompt, apiKey) {
    prompt = `${prompt} - ${defaultPrompt}`;
    function removePunctuationMarks(text) {
        return text.replace(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '');
    }


    // function removeUnwantedPrepositions(text) {
    //     const unwantedPrepositions = ["a", "an", "the", "am", "is", "are", "was", "were", "be", "being", "been", "have", "has", "had", "do", "does", "did", "can", "could", "shall", "should", "will", "would", "may", "might", "must", "and", "but", "or", "nor", "for", "so", "yet", "wow", "oh", "hey", "oops", "hurray", "ah", "oh", "alas", "yikes", "about", "above", "across", "after", "against", "along", "amid", "among", "around", "as", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "by", "concerning", "despite", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over", "past", "regarding", "round", "since", "through", "to", "toward", "under", "until", "unto", "up", "upon", "with", "within", "without"];
    //     const words = text.split(/\s+/);
    //     return words.filter((word) => !unwantedPrepositions.includes(word)).join(' ');
    // }


    function removeHtmlTags(text) {
        return text.replace(/<[^>]*>?/gm, '');
    }


    let cleanedPrompt = prompt;
    cleanedPrompt = removePunctuationMarks(cleanedPrompt);
    // cleanedPrompt = removeUnwantedPrepositions(cleanedPrompt);
    cleanedPrompt = removeHtmlTags(cleanedPrompt);

    const data = {
        messages: [
            {role: 'user', content: cleanedPrompt}
        ],
        max_tokens: 200,
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
    };
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    try {
        // console.log("Data: ", data);
        const response = await axios.post(apiUrl, data, {headers});
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error making API request:', error.message);
        return null;
    }
}

function removePunctuationMarks(text) {
    return text.replace(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '');
}

function removeUnwantedPrepositions(text) {
    const unwantedPrepositions = ["a", "an", "the", "am", "is", "are", "was", "were", "be", "being", "been", "have", "has", "had", "do", "does", "did", "can", "could", "shall", "should", "will", "would", "may", "might", "must", "and", "but", "or", "nor", "for", "so", "yet", "wow", "oh", "hey", "oops", "hurray", "ah", "oh", "alas", "yikes", "about", "above", "across", "after", "against", "along", "amid", "among", "around", "as", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "by", "concerning", "despite", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over", "past", "regarding", "round", "since", "through", "to", "toward", "under", "until", "unto", "up", "upon", "with", "within", "without"];
    const words = text.split(/\s+/);
    return words.filter((word) => !unwantedPrepositions.includes(word)).join(' ');
}


function removeHtmlTags(text) {
    return text.replace(/<[^>]*>?/gm, '');
}

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}
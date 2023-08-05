export default {
    type: "object",
    properties: {
        queryStringParameters: {
            type: "object",
            properties: {
                from: {type: "string", format: "date"},
                to: {type: "string", format: "date"},
                jobTitle: {type: "string"},
                techStack: {type: "string"},
                offset: {type: "string", default: 0},
                limit: {type: "string", default: 50},
            },
            required: ["limit"]
        },
    },
};

export const newsLetterRequest = {
    type: "object",
    properties: {
        body: {
            type: "object",
            properties: {
                company: {type: "string"},
                experience: {type: "number"},
                fullName: {type: "string"},
                role: {type: "string", default: 0},
                techStacks: {
                    type: "array", items: {
                        type: 'string'
                    }
                },
            },
            required: ["company", "experience", "fullName", "role", "techStacks"]
        },
    },
};
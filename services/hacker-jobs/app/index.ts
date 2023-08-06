import {newsLetterHandler} from "./functions/send-news-letters/handler";

export const hello = {
  handler: `services/hacker-jobs/app/functions/hello-world/handler.helloHandler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'hello',
        authorizer: {
          type: 'COGNITO_USER_POOLS',
          authorizerId: "${self:custom.authorizerId}"
        },
      }
    }
  ]
}

export const getJobsHandler = {
  handler: `services/hacker-jobs/app/functions/get-jobs/handler.getJobsHandler`,
  events: [
    {
      http: {
        method: 'get',
        path: 'jobs',
        cors: true
      },
    }
  ]
}

export const dataLoader = {
  handler: `services/hacker-jobs/app/functions/data-loader/handler.dataLoaderHandler`,
  timeout: 900,
  events: [
    {
      http: {
        method: 'get',
        path: 'loader',
        cors: true
      },
    },
    {
      eventBridge: {
        enabled: true,
        schedule: "rate(20 minutes)"
      }
    }
  ]
}



export const submitResumeParseRequest = {
  handler: `services/hacker-jobs/app/functions/submit-resume-parse-request/handler.resumeParserHandler`,
  timeout: 30,
  events: [
    {
      http: {
        method: 'post',
        path: 'resume/parse',
        cors: true
      },
    }
  ]
}

export const getResumeParseRequest = {
  handler: `services/hacker-jobs/app/functions/get-resume-parse-request/handler.getResumeParseRequestHandler`,
  timeout: 30,
  events: [
    {
      http: {
        method: 'get',
        path: 'resume/parse',
        cors: true
      },
    }
  ]
}

export const getResumeMeta = {
  handler: `services/hacker-jobs/app/functions/get-resume-meta-data/handler.getResumeMetaHandler`,
  timeout: 30,
  events: [
    {
      http: {
        method: 'get',
        path: 'resume/meta',
        cors: true
      },
    }
  ]
}


export const submitNewsLetterRequest = {
  handler: `services/hacker-jobs/app/functions/submit-newsletter-request/handler.submitNewsLetterRequestHandler`,
  timeout: 30,
  events: [
    {
      http: {
        method: 'post',
        path: 'newsletter',
        cors: true
      },
    }
  ]
}


export const s3PreSignUrlGenerator = {
  handler: `services/hacker-jobs/app/functions/resume-parser-presign-url/handler.presignGeneratorHandler`,
  timeout: 30,
  events: [
    {
      http: {
        method: 'get',
        path: 'presign/s3',
        cors: true
      },
    }
  ]
}

export const signUp = {
  handler: `services/hacker-jobs/app/functions/register/handler.registrationHandler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'user/singup',
        cors: true
      },
    }
  ]
}


export const newsLetterProcessor = {
  handler: `services/hacker-jobs/app/functions/send-news-letters/handler.newsLetterHandler`,
  timeout: 30,
  events: [
    {
      http: {
        method: 'get',
        path: 'news/test',
        cors: true
      },
    },
    {
      eventBridge: {
        enabled: true,
        schedule: "rate(20 minutes)"
      }
    }
  ]
}
newsLetterHandler
export const hello = {
  handler: `services/ecoville/app/functions/hello-world/handler.helloHandler`,
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
  handler: `services/ecoville/app/functions/get-jobs/handler.getJobsHandler`,
  events: [
    {
      http: {
        method: 'get',
        path: 'jobs',
      }
    }
  ]
}
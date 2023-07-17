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

export const s3CustomResource = {
  handler: `services/ecoville/app/functions/custom-resource/handler.customResouceHandler`,
}
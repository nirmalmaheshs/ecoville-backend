export const hello = {
  handler: `services/ecoville/app/functions/hello-world/handler.helloHandler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'hello',
      }
    }
  ]
}

export const s3CustomResource = {
  handler: `services/ecoville/app/functions/custom-resource/handler.customResouceHandler`,
}
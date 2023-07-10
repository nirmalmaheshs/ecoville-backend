export const hello = {
  handler: `services/modify-chime-meeting/app/functions/hello-world/handler.helloHandler`,
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
  handler: `services/modify-chime-meeting/app/functions/custom-resource/handler.customResouceHandler`,
}
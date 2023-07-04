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
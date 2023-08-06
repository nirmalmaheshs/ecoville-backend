import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {Sequelize} from "sequelize-typescript";
import {Op} from "sequelize";
import {JobMetaData, Jobs, NewsLetters, Users} from "../../../../../libs/dao/entities/hacker-news.model";
import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";
import { format } from 'date-fns';

const ses = new SESClient({region: "us-east-1"});
const handlebars = require('handlebars');

const logger = Logger.getInstance();

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <newsletter.lambdaHandler>');
    const _db: Sequelize = _context.dbConnection;
    _db.addModels([NewsLetters, Users, JobMetaData, Jobs]);
    const newsLetterUsers = await NewsLetters.findAll({raw: true, nest: true});
    for (const newsLetterUser of newsLetterUsers) {
        let res: any = {};
        const techStackFilters = [];

        for (const stack of newsLetterUser.config.techStacks) {
            techStackFilters.push(Sequelize.literal(`JSON_CONTAINS(tech_stacks->'$.technologies', '["${stack}"]')`))
        }
        techStackFilters.push({title: newsLetterUser.config.role});
        res.jobs = await JobMetaData.findAll({
            include: [Jobs],
            where: {
                [Op.or]: techStackFilters,
                [Op.not]: {
                    title: 'No Title'
                }
            },
            limit: 5,
            raw: true,
            nest: true
        });
        res.user = newsLetterUser;
        console.log("Sending Email For User: ", res.user);
        await sendEmail(res);
    }

    return formatJSONResponse({
        data: "Email Processed Successfully",
    });
};

const sendEmail = async (data) => {
    const emailTemplate = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
  </style>
  <![endif]-->
  <style>
    /* Your custom CSS resets for email */
/*
 * Here is where you can add your global email CSS resets.
 *
 * We use a custom, email-specific CSS reset, instead
 * of Tailwind's web-optimized \`base\` layer.
 *
 * Styles defined here will be inlined.
*/
img {
  max-width: 100%;
  vertical-align: middle;
  line-height: 1;
  border: 0
}
/* Tailwind CSS components */
/**
 * @import here any custom CSS components - that is, CSS that
 * you'd want loaded before the Tailwind utilities, so the
 * utilities can still override them.
*/
/* Tailwind CSS utility classes */
.absolute {
  position: absolute
}
.m-0 {
  margin: 0
}
.my-12 {
  margin-top: 48px;
  margin-bottom: 48px
}
.mb-1 {
  margin-bottom: 4px
}
.mb-4 {
  margin-bottom: 16px
}
.mb-6 {
  margin-bottom: 24px
}
.inline-block {
  display: inline-block
}
.table {
  display: table
}
.hidden {
  display: none
}
.w-\\[552px\\] {
  width: 552px
}
.w-\\[600px\\] {
  width: 600px
}
.w-full {
  width: 100%
}
.max-w-full {
  max-width: 100%
}
.cursor-default {
  cursor: default
}
.rounded {
  border-radius: 4px
}
.bg-indigo-700 {
  background-color: #4338ca
}
.bg-slate-200 {
  background-color: #e2e8f0
}
.bg-slate-300 {
  background-color: #cbd5e1
}
.bg-slate-50 {
  background-color: #f8fafc
}
.bg-white {
  background-color: #fff
}
.p-0 {
  padding: 0
}
.p-12 {
  padding: 48px
}
.p-3 {
  padding: 12px
}
.p-6 {
  padding: 24px
}
.px-12 {
  padding-left: 48px;
  padding-right: 48px
}
.px-3 {
  padding-left: 12px;
  padding-right: 12px
}
.px-6 {
  padding-left: 24px;
  padding-right: 24px
}
.py-4 {
  padding-top: 16px;
  padding-bottom: 16px
}
.pb-8 {
  padding-bottom: 32px
}
.pl-3 {
  padding-left: 12px
}
.text-left {
  text-align: left
}
.text-center {
  text-align: center
}
.text-right {
  text-align: right
}
.font-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif
}
.text-2xl {
  font-size: 24px
}
.text-base {
  font-size: 16px
}
.text-sm {
  font-size: 14px
}
.text-xs {
  font-size: 12px
}
.font-semibold {
  font-weight: 600
}
.uppercase {
  text-transform: uppercase
}
.italic {
  font-style: italic
}
.leading-12 {
  line-height: 48px
}
.leading-16 {
  line-height: 64px
}
.leading-5 {
  line-height: 20px
}
.leading-6 {
  line-height: 24px
}
.leading-none {
  line-height: 1
}
.text-black {
  color: #000
}
.text-indigo-700 {
  color: #4338ca
}
.text-slate-50 {
  color: #f8fafc
}
.text-slate-500 {
  color: #64748b
}
.text-slate-600 {
  color: #475569
}
.text-slate-700 {
  color: #334155
}
.mso-font-width-\\[-100\\%\\] {
  mso-font-width: -100%
}
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
}
.\\[-webkit-font-smoothing\\:antialiased\\] {
  -webkit-font-smoothing: antialiased
}
.\\[text-decoration\\:none\\] {
  text-decoration: none
}
.\\[word-break\\:break-word\\] {
  word-break: break-word
}
/* Your custom utility classes */
/*
 * Here is where you can define your custom utility classes.
 *
 * We wrap them in the \`utilities\` @layer directive, so
 * that Tailwind moves them to the correct location.
 *
 * More info:
 * https://tailwindcss.com/docs/functions-and-directives#layer
*/
.hover\\:text-indigo-500:hover {
  color: #6366f1 !important
}
.hover\\:\\!\\[text-decoration\\:underline\\]:hover {
  text-decoration: underline !important
}
@media (max-width: 600px) {
  .sm\\:my-8 {
    margin-top: 32px !important;
    margin-bottom: 32px !important
  }
  .sm\\:px-0 {
    padding-left: 0 !important;
    padding-right: 0 !important
  }
  .sm\\:px-3 {
    padding-left: 12px !important;
    padding-right: 12px !important
  }
  .sm\\:px-4 {
    padding-left: 16px !important;
    padding-right: 16px !important
  }
  .sm\\:px-6 {
    padding-left: 24px !important;
    padding-right: 24px !important
  }
  .sm\\:py-5 {
    padding-top: 20px !important;
    padding-bottom: 20px !important
  }
  .sm\\:leading-8 {
    line-height: 32px !important
  }
}

  </style>
  
</head>
<body class="m-0 p-0 w-full [word-break:break-word] [-webkit-font-smoothing:antialiased] ">
  <div role="article" aria-roledescription="email" aria-label="" lang="en">
  <div class="bg-slate-50 sm:px-4 font-sans">
    <table align="center" cellpadding="0" cellspacing="0" role="none">
      <tr>
        <td class="w-[600px] max-w-full">
          <table class="w-full" cellpadding="0" cellspacing="0" role="none">
            <tr>
              <td class="p-3 sm:py-5 sm:px-3 text-center">
                <a href="https://hackerjobs.info/">
                  <img src="https://hacker-jobs-public-assets-dev.s3.amazonaws.com/xlogo.svg" height="60" alt="Hacker Jobs">
                </a>
              </td>
            </tr>

            <tr>
              <td class="px-3 sm:px-3 text-center text-xs">
                Powered by  
                <a href="https://hackerjobs.info/" class="pl-3">
                  <img src="https://hacker-jobs-public-assets-dev.s3.amazonaws.com/tidb.svg" height="20" alt="Hacker Jobs">
                </a>
              </td>
            </tr>
            <tr role="separator">
              <td class="leading-5">&zwj;</td>
            </tr>
            <tr>
              <td class="w-full px-6 sm:px-0 text-left">
                <table class="w-full" cellpadding="0" cellspacing="0" role="none">
                  <tr>
                    <td class="pb-8">
                      <table class="w-full" cellpadding="0" cellspacing="0" role="none">
                      {{#each jobs}}
                        <tr>
                          <td class="p-6 bg-white rounded shadow-sm">
                            <p class="m-0 mb-1 text-sm text-slate-500">
                              {{datePosted}}
                            </p>

                            <h2 class="m-0 mb-6 text-2xl leading-6">
                              {{title}}, {{company}}
                            </h2>

                            <p class="m-0 mb-6 text-base text-slate-700">
                              {{techStacks}}
                            </p>

                            <a target="_blank" href="https://news.ycombinator.com/item?id={{id}}" class="text-base text-indigo-700 hover:text-indigo-500 [text-decoration:none]">
                              Read more &rarr;
                            </a>
                          </td>
                        </tr>
                        {{/each}}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr role="separator">
              <td class="leading-16 sm:leading-8">&zwj;</td>
            </tr>
            <tr role="separator">
              <td class="leading-16 sm:leading-8">&zwj;</td>
            </tr>
            <tr>
              <td class="px-12 sm:px-6 py-4 bg-white rounded text-left shadow-sm">
                <p class="m-0 text-sm text-slate-500">
                  You are receiving this email because you signed up for Website Newsletter Weekly. You may
                  <a href="<url>" class="text-indigo-700 [text-decoration:none] hover:![text-decoration:underline]">unsubscribe</a>
                  at any time.
                </p>
              </td>
            </tr>
            <tr role="separator">
              <td class="leading-12 sm:leading-8">&zwj;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  </div>
</body>
</html>`;

    const compiledTemplate = handlebars.compile(emailTemplate);
    const context = {
        subject: 'HackerJobs - NewsLetter',
        name: data.user.config.fullName,
        jobs: data.jobs.map((job) =>  {
            // const date = parseISO(job.job.time.toString());
            // console.log(job.job.time.toString());
            const formattedDate = format(job.job.time, 'MMM d, yyyy');
            return {
                id: job.id,
                company: job.company,
                url: job.url,
                title: job.title,
                techStacks: job.techStacks.technologies.join(', '),
                datePosted: formattedDate
            }
        })
    };

    const emailContent = compiledTemplate(context);


    const command = new SendEmailCommand({
        Destination: {
            ToAddresses: [data.user.config.email],
        },
        Message: {
            Body: {
                Html: {Data: emailContent},
            },

            Subject: {Data: "Hacker Jobs - Express | Personalized | Weekly Newsletter"},
        },
        Source: "indrapranesh2111@gmail.com",
    });
    try {
        let response = await ses.send(command);
        console.log("Email Response: ", response);
        return response;
    } catch (error) {
        console.log("Error: ", error);
    }


    return emailContent;
}


export const newsLetterHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).dbManager().cors().get(lambdaHandler);

# Hacker Jobs

Hacker Jobs serves as an all-inclusive platform catering to both job seekers and job posters. For job seekers, the platform provides a streamlined and intuitive interface to browse and search for tech and hacker community-related job opportunities. The platform gathers historical and real-time data from the Hacker News platform using the Hacker News API. Through data analysis and matching algorithms, "Hacker Jobs" ensures that job seekers are presented with relevant job listings that align with their skills and interests.


## Installation

Hacker Jobs is build on top of an AWS cloud. This repo is for the backend of the project. Before running the project make sure you have required permissions for the AWS cloud.

## Setting Up the location environment

All the project dependencies like TiDB database credentials and OPENAI keys are securely stored in the AWS Secrets Manager.

## Architecture

The entire project is deployed in AWS and the lambda is communicating with the TiDB Serverless cluster for the data layer.

The system designed to have the highly available and cost effective solution using TiDB.

The system using TiDB HTAP solution for both analytical and transactional purposes.

![Architecture Diagram](https://hacker-jobs-public-assets-dev.s3.amazonaws.com/HackerJob-Arch.png)
## Cloning the project

```bash
git clone https://github.com/nirmalmaheshs/hackernews-jobs-backend
```

## Running the development server

``` bash
npm run hacker-jobs
```


## Deploying the project

```
npm run hacker-jobs:dev
```
## Authors

- [@nirmalmahesh](https://github.com/nirmalmaheshs/)
- [@pranesh](https://github.com/indrapranesh/)


## Live Application

https://hackerjobs.info/jobs
## Tech Stack

**UI Deployment:** [Vercel](https://vercel.com/dashboard)

**Database:** [TiDB Serverless](https://www.pingcap.com/tidb-serverless/)

**FronetEnd:** NextJs

**Backend:** NodeJs

**Entity Detection:** OpenAI [OpenAI gpt-3.5-turbo](https://platform.openai.com/docs/models/gpt-3-5)

## Roadmap

- Personalized Job Recommendation

- Enhanced Dashboards

- LinkedIn Integration


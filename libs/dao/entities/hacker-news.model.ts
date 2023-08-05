import { Column, DataType, Model, Table, PrimaryKey } from "sequelize-typescript";

@Table({ tableName: 'Jobs', timestamps: false })
export class Jobs extends Model<Jobs> {

    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.INTEGER)
    parentId: number;

    @Column(DataType.STRING)
    text: string;

    @Column(DataType.DATE)
    time: Date;

    @Column(DataType.STRING)
    type: string;

    @Column(DataType.BOOLEAN)
    isMetaExtracktted: boolean;
}


@Table({ tableName: 'job_meta_data', timestamps: false })
export class JobMetaData extends Model<JobMetaData> {

    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.JSON)
    techStacks: object;

    @Column(DataType.STRING)
    company: string;

    @Column(DataType.STRING)
    url: string;

    @Column(DataType.STRING)
    title: string;

    @Column(DataType.STRING)
    location: string;
}

@Table({ tableName: 'hacker_news_job_post', timestamps: false })
export class HackerNewsJobPost extends Model<HackerNewsJobPost> {

    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.STRING)
    by: string;

    @Column(DataType.STRING)
    text: string;

    @Column(DataType.DATE)
    time: Date;

    @Column(DataType.STRING)
    type: string;

    @Column(DataType.STRING)
    url: string;

    @Column(DataType.STRING)
    score: string;

    @Column(DataType.STRING)
    title: string;
}

@Table({ tableName: 'system_configs', timestamps: false })
export class SystemConfigs extends Model<SystemConfigs> {

    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.STRING)
    configName: string;

    @Column(DataType.STRING)
    configValue: string;
}

@Table({ tableName: 'users', timestamps: false })
export class Users extends Model<Users> {

    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.STRING)
    fullName: string;

    @Column(DataType.STRING)
    username: string;

    @Column(DataType.BOOLEAN)
    isActive: boolean;

    @Column(DataType.STRING)
    role: string;

    @Column(DataType.TEXT)
    bio: string;

    @Column(DataType.DATE)
    createdAt: Date;

    @Column(DataType.DATE)
    updatedAt: Date;
}


@Table({ tableName: 'user_resumes', timestamps: false })
export class UserResumes extends Model<UserResumes> {

    @PrimaryKey
    @Column(DataType.INTEGER)
    resumeId: number;

    @Column(DataType.INTEGER)
    userId: number;

    @Column(DataType.STRING)
    path: string;

    @Column(DataType.DATE)
    createdAt: Date;

    @Column(DataType.STRING)
    jobId: string;

    @Column(DataType.STRING)
    status: string;

    @Column(DataType.JSON)
    response_json: object;

    @Column(DataType.TEXT)
    response_lines: string;

    @Column(DataType.JSON)
    meta: object;

    @Column(DataType.STRING)
    metaStatus: string;
}


@Table({ tableName: 'news_letters', timestamps: false })
export class NewsLetters extends Model<NewsLetters> {

    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.INTEGER)
    userId: number;

    @Column(DataType.JSON)
    config: object;

    @Column(DataType.DATE)
    createdAt: Date;
}
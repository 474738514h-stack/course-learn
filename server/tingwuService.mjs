import TingwuModule from '@alicloud/tingwu20230930'
import {
  CreateTaskRequest,
  CreateTaskRequestInput,
  CreateTaskRequestParameters,
  CreateTaskRequestParametersTranscription,
} from '@alicloud/tingwu20230930/dist/models/CreateTaskRequest.js'
import { $OpenApiUtil } from '@alicloud/openapi-core'

const TingwuClient = TingwuModule.default ?? TingwuModule

function buildRealtimeStartRequest(appKey) {
  return new CreateTaskRequest({
    type: 'realtime',
    appKey,
    input: new CreateTaskRequestInput({
      sourceLanguage: 'cn',
      format: 'pcm',
      sampleRate: 16000,
      taskKey: `coursemind-${Date.now()}`,
    }),
    parameters: new CreateTaskRequestParameters({
      transcription: new CreateTaskRequestParametersTranscription({
        outputLevel: 2,
        diarizationEnabled: false,
      }),
      translationEnabled: false,
      summarizationEnabled: false,
      autoChaptersEnabled: false,
      meetingAssistanceEnabled: false,
    }),
  })
}

function buildRealtimeStopRequest(appKey, taskId) {
  return new CreateTaskRequest({
    type: 'realtime',
    operation: 'stop',
    appKey,
    input: new CreateTaskRequestInput({ taskId }),
  })
}

function getClient() {
  const accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID
  const accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET
  if (!accessKeyId || !accessKeySecret) {
    throw new Error('请配置 ALIBABA_CLOUD_ACCESS_KEY_ID 与 ALIBABA_CLOUD_ACCESS_KEY_SECRET')
  }
  const config = new $OpenApiUtil.Config({
    accessKeyId,
    accessKeySecret,
    regionId: process.env.TINGWU_REGION_ID || 'cn-beijing',
    endpoint: process.env.TINGWU_ENDPOINT || 'tingwu.cn-beijing.aliyuncs.com',
  })
  return new TingwuClient(config)
}

function getAppKey() {
  const appKey = process.env.TINGWU_APP_KEY
  if (!appKey) throw new Error('请配置 TINGWU_APP_KEY（听悟控制台项目 AppKey）')
  return appKey
}

export async function startRealtimeTask() {
  const client = getClient()
  const response = await client.createTask(buildRealtimeStartRequest(getAppKey()))

  const body = response.body
  if (!body || body.code !== '0' || !body.data?.meetingJoinUrl) {
    throw new Error(body?.message || '创建听悟实时任务失败')
  }

  return {
    taskId: body.data.taskId,
    meetingJoinUrl: body.data.meetingJoinUrl,
    taskStatus: body.data.taskStatus,
  }
}

export async function stopRealtimeTask(taskId) {
  const client = getClient()
  const response = await client.createTask(buildRealtimeStopRequest(getAppKey(), taskId))

  const body = response.body
  if (!body || body.code !== '0') {
    throw new Error(body?.message || '结束听悟任务失败')
  }

  return { taskId, taskStatus: body.data?.taskStatus }
}

export function tingwuConfigured() {
  return Boolean(
    process.env.ALIBABA_CLOUD_ACCESS_KEY_ID &&
      process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET &&
      process.env.TINGWU_APP_KEY
  )
}

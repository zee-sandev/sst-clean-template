import { amplifyConfig } from '@/configures/amplify'
import { createServerRunner } from '@aws-amplify/adapter-nextjs'

export const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: amplifyConfig
  }
})
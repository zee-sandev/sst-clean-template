import { CognitoUserPoolClient } from '@/.sst/platform/src/components/aws/cognito-user-pool-client'
import setupCognito from './cognito/cognito.infra'
import WebApp from './webApp/nextApp.infra'

interface SetupSSTReturn {
  WebURL: $util.Output<string>
  WebURN: $util.Output<string>
  userPoolId: $util.Output<string>
  userPoolArn: $util.Output<string>
  userPoolWebClientId: $util.Output<string>
  userPoolWebClientSecret: $util.Output<string>
  userPoolDomain: string
  issuer: string
  cognitoDomain: string
}

interface CognitoOutput {
  userPoolInstance: sst.aws.CognitoUserPool
  userPoolWebClient: CognitoUserPoolClient
  userPoolDomain: aws.cognito.UserPoolDomain
  poolId: string
  clientId: string
  clientSecret: string
  poolDomain: string
  cognitoIssuer: string
  authDomain: string
}

interface WebAppOutput {
  NextApp: sst.aws.Nextjs
  WebInstance: WebApp
}

async function outputCognito(region: string): Promise<CognitoOutput> {
  const { userPoolInstance, userPoolWebClient, userPoolDomain } =
    await setupCognito(region)
  const [poolId, clientId, clientSecret, poolDomain] =
    await asyncAllGetUtilOutput([
      userPoolInstance.id,
      userPoolWebClient.id,
      userPoolWebClient.secret,
      userPoolDomain.domain
    ])

  const cognitoIssuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`
  const authDomain = `https://${poolDomain}.auth.${region}.amazoncognito.com`
  return {
    userPoolInstance,
    userPoolWebClient,
    userPoolDomain,
    poolId,
    clientId,
    clientSecret,
    poolDomain,
    cognitoIssuer,
    authDomain
  }
}

async function outputWebApp(
  cognitoOutput: CognitoOutput
): Promise<WebAppOutput> {
  const {
    LOCAL_DOMAIN_FULL,
    LOCAL_PORT,
    PATH,
    PROD_DOMAIN,
    PROD_DOMAIN_CONFIG,
    PROD_PORT
  } = await import('./config/web.config')
  const webInstance = new WebApp()
  webInstance.domainName = $dev ? LOCAL_DOMAIN_FULL : PROD_DOMAIN
  webInstance.domainConfig = PROD_DOMAIN_CONFIG
  webInstance.path = PATH
  webInstance.port = $dev ? LOCAL_PORT : PROD_PORT

  const nextAuthSecret = new sst.Secret(
    'NEXTAUTH_SECRET',
    cognitoOutput.clientSecret
  )
  webInstance.setEnvironment({
    NEXTAUTH_SECRET: nextAuthSecret.value
  })
  webInstance.addLinkable('AWS', {
    properties: {
      COGNITO_POOL_ID: cognitoOutput.poolId,
      COGNITO_CLIENT_ID: cognitoOutput.clientId,
      COGNITO_CLIENT_SECRET: cognitoOutput.clientSecret,
      COGNITO_ISSUER: cognitoOutput.cognitoIssuer,
      COGNITO_DOMAIN: cognitoOutput.authDomain
    },
    permissions: []
  })
  const web = webInstance.listen()
  return {
    NextApp: web,
    WebInstance: webInstance
  }
}

export default async function setupSST(): Promise<SetupSSTReturn> {
  const region = await asyncGetUtilOutput(aws.getRegionOutput().name)
  const cognitoOutput = await outputCognito(region)
  const webAppOutput = await outputWebApp(cognitoOutput)
  return {
    WebURL: webAppOutput.NextApp.url,
    WebURN: webAppOutput.NextApp.urn,
    userPoolId: cognitoOutput.userPoolInstance.id,
    userPoolArn: cognitoOutput.userPoolInstance.arn,
    userPoolWebClientId: cognitoOutput.userPoolWebClient.id,
    userPoolWebClientSecret: cognitoOutput.userPoolWebClient.secret,
    userPoolDomain: cognitoOutput.poolDomain,
    issuer: cognitoOutput.cognitoIssuer,
    cognitoDomain: cognitoOutput.authDomain
  }
}

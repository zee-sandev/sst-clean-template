import Linkable from '@root/infra/interfaces/linkable/linkable.abstract'
import { TMethod } from './types/method.type'

class APIGateway extends Linkable {
  private _api: sst.aws.ApiGatewayV2

  constructor(name: string, options: sst.aws.ApiGatewayV2Args) {
    super()
    this._api = new sst.aws.ApiGatewayV2(name, options)
  }

  //#region Route
  private addRoute(
    method: TMethod,
    path: string,
    handler: string,
    auth?: sst.aws.ApiGatewayV2RouteArgs
  ) {
    const handlerOptions: sst.aws.FunctionArgs = {
      link: this.getLinks(),
      handler: handler
    }
    this._api.route(`${method} ${path}`, handlerOptions, auth)
  }

  public get(
    path: string,
    handler: string,
    auth?: sst.aws.ApiGatewayV2RouteArgs
  ) {
    this.addRoute(`GET`, path, handler, auth)
  }

  public post(
    path: string,
    handler: string,
    auth?: sst.aws.ApiGatewayV2RouteArgs
  ) {
    this.addRoute(`POST`, path, handler, auth)
  }

  public put(
    path: string,
    handler: string,
    auth?: sst.aws.ApiGatewayV2RouteArgs
  ) {
    this.addRoute(`PUT`, path, handler, auth)
  }

  public delete(
    path: string,
    handler: string,
    auth?: sst.aws.ApiGatewayV2RouteArgs
  ) {
    this.addRoute(`DELETE`, path, handler, auth)
  }

  public options(
    path: string,
    handler: string,
    auth?: sst.aws.ApiGatewayV2RouteArgs
  ) {
    this.addRoute(`OPTIONS`, path, handler, auth)
  }

  public patch(
    path: string,
    handler: string,
    auth?: sst.aws.ApiGatewayV2RouteArgs
  ) {
    this.addRoute(`PATCH`, path, handler, auth)
  }
  //#endregion

  public get instance() {
    return this._api
  }
}
export default APIGateway

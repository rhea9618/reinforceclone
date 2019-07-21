import { RouteReuseStrategy } from '@angular/router';
import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CacheReuseStrategy implements RouteReuseStrategy {

  private storedRouteHandles = new Map<string, DetachedRouteHandle>();

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRouteHandles.has(route.routeConfig.path);
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true; // reuse all routes
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.storedRouteHandles.get(route.routeConfig.path);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle) {
    this.storedRouteHandles.set(route.routeConfig.path, handle);
  }
}

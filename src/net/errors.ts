export class NetworkError {
  private msg: string;

  constructor(msg: string) {
    this.msg = msg;
  }

  public toString(): string {
    return this.msg;
  }
}

export const NoRouteError: NetworkError = new NetworkError("no route found");
export const NoSwitchportError: NetworkError = new NetworkError(
  "no port with destination MAC found"
);
export const FirewallError: NetworkError = new NetworkError(
  "firewall rules blocked packet"
);
export const NoNodeError: NetworkError = new NetworkError(
  "node not found in network"
);
export const NoAddressError: NetworkError = new NetworkError(
  "no host has desired ip"
);
export const NoPortError: NetworkError = new NetworkError(
  "no available port found"
);

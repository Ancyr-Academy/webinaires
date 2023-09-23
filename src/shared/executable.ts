export interface Executable<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

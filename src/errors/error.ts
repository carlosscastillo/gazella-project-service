export class ServiceDomainError extends Error {
  constructor(
    public readonly domainCode: string,
    public readonly originalMessage: string,
    public readonly code: string,
    public statusCode?: number,
  ) {
    super(originalMessage);
    this.name = 'ServiceDomainError';
  }
}

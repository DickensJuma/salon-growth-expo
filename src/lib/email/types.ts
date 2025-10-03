export interface EmailMessage {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    headers?: Record<string, string>;
}

export interface EmailProvider {
    send(message: EmailMessage): Promise<{ id?: string }>;
}
